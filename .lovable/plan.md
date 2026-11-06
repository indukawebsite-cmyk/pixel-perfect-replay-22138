# Order Cancellation, Returns & Refunds — Proposed Design (Owner Approval Required)

Design only. No code, schema, data or settings change until approved. Preserves existing checkout, Razorpay verification, COD and Shiprocket flows untouched.

## 1. Database migration design (one additive migration)

New enums:
- `cancellation_status`: `requested, approved, rejected, completed`
- `return_status`: `requested, approved, rejected, received, refunded, closed`
- `refund_status`: `created, processed, failed`

New tables (all with GRANTs + RLS in the same migration; customers read only their own rows via `owns_order`, admins manage all, writes service-role only):

- `cancellation_requests`: id, order_id (FK orders), customer_id, reason text, status cancellation_status default `requested`, admin_note, requested_at, resolved_at, resolved_by. Unique partial index: one open request per order.
- `return_requests`: id, order_id, customer_id, reason, status return_status default `requested`, admin_note, requested_at, resolved_at, resolved_by. Same one-open-request guard.
- `refunds`: id, order_id, payment_id (FK payments), amount numeric, reason, razorpay_refund_id text UNIQUE, status refund_status default `created`, idempotency_key text UNIQUE, created_at, updated_at.

Additive columns on existing tables:
- `orders.stock_restored boolean not null default false` — mirrors the proven `stock_deducted` exactly-once guard.
- `orders.cancelled_at timestamptz`, `orders.cancellation_reason text` (nullable, audit).

New DB function (security definer, service-role only, mirrors `finalize_order`):
- `cancel_order_and_restore(p_order_id, p_reason)` — in one transaction: verifies order is in a cancellable status, sets status `cancelled` + `cancelled_at`, and only if `stock_deducted = true AND stock_restored = false` increments each variant's `stock_quantity` and sets `stock_restored = true`. Returns `{ ok, already_cancelled, stock_restored }`. Retries and concurrent calls are no-ops.

## 2. Status transition rules

```text
Cancellation (prepaid or COD):
  pending/confirmed  --(customer, within 24h of created_at)--> cancelled (auto-approved)
  pending/confirmed  --(customer, after 24h)--> cancellation_requests: requested
       --> admin approves --> cancelled   |   admin rejects --> order unchanged
  processing  --(customer request)--> admin approval required --> cancelled
  shipped     --> cancellation BLOCKED until Shiprocket cancel succeeds
  delivered   --> cancellation REJECTED; directed to return workflow
  cancelled/refunded --> terminal

Returns (delivered orders only):
  delivered --(within 7 calendar days of shipment delivered)--> return_requests: requested
       --> admin approves --> approved --> received --> refunded --> closed
       --> admin rejects --> rejected (order stays delivered)
```

Admin keeps the existing manual status dropdown as an override, but the normal path goes through the guarded functions so stock/payment side effects cannot be skipped.

## 3. Server functions & API design

New file `src/lib/cancellations.functions.ts` (all `requireSupabaseAuth`):
- `requestCancellation({ orderId, reason })` — verifies ownership via `context.supabase`; checks eligibility (status, 24h window, shipment status); auto-approves inside window via `cancel_order_and_restore` + refund trigger for prepaid; otherwise creates a `cancellation_requests` row.
- `requestReturn({ orderId, reason })` — verifies ownership, `delivered` status, 7-day window from shipment delivery timestamp; creates `return_requests` row.

New file `src/lib/admin/cancellations.functions.ts` (admin role verified server-side, as in `updateOrderStatus`):
- `approveCancellation` / `rejectCancellation` — approve runs `cancel_order_and_restore`, then for prepaid calls Razorpay refund; for COD completes immediately (no monetary refund).
- `approveReturn` / `rejectReturn` / `markReturnReceived` — on `received`, triggers the prepaid refund or flags COD return for offline settlement (see Ambiguities).

New file `src/lib/refunds.server.ts`:
- `createFullRefund({ paymentId, orderId, reason, idempotencyKey })` — inserts `refunds` row (unique idempotency key; conflict = return existing), calls Razorpay `POST /v1/payments/:id/refund` with the full captured amount using server-side keys, stores `razorpay_refund_id`. Full refunds only — no amount parameter accepted from callers.
- Duplicate protection: unique `idempotency_key`, unique `razorpay_refund_id`, and refund only when payment status is `captured` and no prior `processed` refund exists for the payment.

Shiprocket (`src/lib/shiprocket.server.ts`, additive):
- `cancelShipmentBestEffort(orderId)` — eligibility check first: only when shipment status is `pending/created/pickup_scheduled` and no AWB is assigned (or AWB cancellable per Shiprocket); calls `POST /orders/cancel`; on failure the order cancellation is blocked and the admin sees the reason. Never cancels `in_transit`+ shipments automatically.

## 4. Webhook handling (`src/routes/api/public/webhooks/razorpay.ts`, additive)

Existing signature verification unchanged. Add:
- `refund.processed` — match `refunds` by `razorpay_refund_id`, set status `processed`, set payment status `refunded`, complete the cancellation/return request. Idempotent: re-delivery is a no-op.
- `refund.failed` — set refund status `failed`, keep order cancelled, surface to admin for manual retry (retry uses a new idempotency key; Razorpay refund IDs remain unique).
- Unknown events stay acknowledged-and-ignored, as today.

## 5. Customer & admin UI

- `src/routes/_authenticated/account.tsx` — per-order "Request cancellation" / "Request return" buttons with eligibility from server; order history shows cancellation/refund progress (requested → approved → refund processed).
- Admin order page (`admin.orders.$orderId.tsx`) — cancellation/return request panel with approve/reject, reasons, and refund status; history timeline gains cancellation/refund entries.
- `src/routes/returns.tsx` — publish the approved policy text: 24h cancellation window, 7-day returns, full refunds only, COD exclusions.

## 6. Email notifications (app emails)

Scaffold transactional templates (requires the email domain prerequisite): cancellation-approved, cancellation-rejected, refund-processed, refund-failed (admin notice), return-approved, return-rejected. Sent from the server functions above with idempotency keys derived from request ID + template. If the email domain is not yet configured, notifications ship in a later phase and the account page remains the status source.

## 7. Security safeguards

- All mutations server-side; ownership via RLS/`owns_order`; admin via `has_role` RPC, never client state.
- Razorpay keys stay in secrets; browser never sees refund calls.
- Exactly-once inventory restore enforced in the database (`stock_restored` flag inside one transaction) — safe under retries and concurrency.
- Webhook signature verified before any processing; refund events matched by unique refund ID.
- Zod validation on every input; reasons length-bounded.

## 8. Test plan

- Eligibility: cancel at 23h59m (allowed), 24h01m (request only), shipped order blocked, delivered order rejected.
- Inventory: cancel restores stock exactly once; double-approve and concurrent requests leave stock unchanged; COD cancel restores without refund.
- Refunds: full amount equals captured amount; duplicate request returns existing refund; `refund.processed` webhook twice = one state change; `refund.failed` keeps audit and blocks re-refund of same payment.
- Shiprocket: cancellation with AWB assigned is refused; API failure blocks order cancellation with admin-visible reason.
- Webhook: invalid signature rejected; unknown events ignored.
- Security: non-owner cannot cancel/return; non-admin cannot approve.

## 9. Credentials / configuration required

- None new for Razorpay (existing key pair refunds via same auth) or Shiprocket.
- Email domain configuration if notifications are included in phase 1.
- Razorpay dashboard: enable `refund.processed` / `refund.failed` webhook events alongside existing ones (at publish time, not now).

## 10. Ambiguities needing owner decision

1. **COD returns**: a returned COD order has no Razorpay payment to refund — is the refund via bank transfer/UPI handled offline, and should the system just record it?
2. **Shipping charge**: on cancellation, is the shipping fee refunded too (full order total), or only the product subtotal?
3. **Return shipping cost**: who pays return courier — customer or House of Induka? Should a Shiprocket reverse pickup be auto-created on return approval?
4. **Returned inventory**: does a received return go back into sellable stock, or is it held out (quality check)?
5. **24h window basis**: measured from order placement (`created_at`) — confirm, not from payment capture.
6. **Refund timeline wording** for the policy page (e.g. "5–7 business days to your original payment method") — needs owner-approved text.
