# Order Cancellation, Returns & Refunds — Revised Design (Owner Approval Required)

Design only. No code, schema, data or settings change until approved. Existing checkout, Razorpay verification, COD and Shiprocket flows are preserved untouched.

## Owner-approved business rules (incorporated)

1. Cancellation window: 24h from `orders.created_at`; after that, admin approval + eligibility checks.
2. Full refunds only — no partial refunds anywhere.
3. Cancellation refund amount = product subtotal after discounts, **excluding shipping charges**.
4. Return window: 7 calendar days from actual delivery timestamp.
5. Return shipping paid by HOUSE OF INDUKA.
6. COD returns refunded offline (bank transfer/UPI), recorded and confirmed by an admin.
7. Returned inventory restocked only after physical quality inspection passes.
8. Refund timeline communicated as "estimated 5–7 business days after initiation, not guaranteed".

## 1. Database migration design (one additive migration)

New enums:
- `cancellation_status`: `requested, approved, rejected, completed`
- `return_status`: `requested, approved, rejected, received, inspection_passed, inspection_failed, refunded, closed`
- `refund_status`: `created, pending, processed, failed`

New tables (GRANTs + RLS in the same migration; customers read own rows via `owns_order`, admins manage all, writes service-role only):

- `cancellation_requests`: id, order_id FK, customer_id, reason, status, admin_note, requested_at, resolved_at, resolved_by. Partial unique index: one open (`requested`) request per order.
- `return_requests`: id, order_id FK, customer_id, reason, status, admin_note, inspection_note, requested_at, resolved_at, resolved_by. Same one-open-request guard.
- `refunds`: id, order_id, payment_id FK nullable (null for COD offline refunds), kind (`cancellation` | `return`), amount numeric, reason, razorpay_refund_id text UNIQUE, status refund_status, idempotency_key text UNIQUE, offline_method text (`bank_transfer` | `upi`), offline_reference text, offline_confirmed_by uuid, offline_confirmed_at timestamptz, created_at, updated_at.
- `stock_movements`: id, order_id, variant_id, change int, reason (`deduction` | `cancellation_restore` | `return_restore`), created_at — append-only audit of every stock change.

Additive columns on existing tables:
- `orders.stock_restored boolean not null default false` — exactly-once guard mirroring `stock_deducted`.
- `orders.cancelled_at timestamptz`, `orders.cancellation_reason text` (nullable audit).
- `shipments.delivered_at timestamptz` — basis for the 7-day return window (set when status becomes `delivered`).

New DB functions (security definer, service-role only, mirroring `finalize_order`):
- `cancel_order_and_restore(p_order_id, p_reason)` — single transaction: verify cancellable status → set `cancelled` + `cancelled_at` → if `stock_deducted AND NOT stock_restored`, restore each variant's stock, set `stock_restored = true`, insert `stock_movements` rows. Returns `{ ok, already_cancelled, stock_restored }`. Retries/concurrent calls are no-ops.
- `restore_returned_stock(p_return_id)` — same exactly-once pattern, callable only when the return is `inspection_passed`.

## 2. State machines

```text
Cancellation:
  pending/confirmed --(customer, ≤24h)--> auto-approved: cancelled
  pending/confirmed/processing --(customer, >24h)--> requested
       --> admin approves --> approved --> (shipment cancel + refund settle) --> completed
       --> admin rejects --> rejected (order unchanged)
  shipped --> BLOCKED until Shiprocket cancellation succeeds
  delivered --> REJECTED; directed to return workflow
  cancelled/refunded --> terminal

  Cancellation completion gate (correction H): a prepaid cancellation is
  "completed" only when shipment cancellation (if any) succeeded AND the
  Razorpay refund is created/accepted. COD cancellation completes on
  stock restore alone.

Returns (delivered orders only):
  delivered --(≤7 days from shipments.delivered_at)--> requested
       --> admin approves --> approved --> (item arrives) received
            --> inspection_passed --> (refund settles) refunded --> closed
            --> inspection_failed --> closed (no refund, no restock; item returned to customer per policy)
       --> admin rejects --> rejected

  Return refund gate (correction B): no refund is initiated before
  inspection_passed. Stock restore happens only at inspection_passed
  (rule 8), independently of refund settlement.
```

## 3. Refund calculation (correction A)

Refund amount is computed **server-side only** from stored records: `orders.subtotal − orders.discount` (shipping excluded). Browser-supplied amounts are never accepted — refund functions take `orderId`, never an amount. A check verifies the computed amount ≤ captured payment amount before calling Razorpay.

## 4. Server functions & API design

New `src/lib/cancellations.functions.ts` (all `requireSupabaseAuth`):
- `requestCancellation({ orderId, reason })` — ownership via `context.supabase`; eligibility (status, 24h window from `created_at`, shipment status); ≤24h auto-approves via `cancel_order_and_restore` + prepaid refund trigger; otherwise inserts `cancellation_requests`.
- `requestReturn({ orderId, reason })` — ownership, `delivered` status, 7-day window from `shipments.delivered_at`; inserts `return_requests`.

New `src/lib/admin/cancellations.functions.ts` (admin verified via `has_role` RPC):
- `approveCancellation` / `rejectCancellation` — approve runs `cancel_order_and_restore`; prepaid then creates the Razorpay refund; COD completes immediately (no monetary refund).
- `approveReturn` / `rejectReturn` / `markReturnReceived` / `recordInspection({ returnId, passed, note })` — `inspection_passed` triggers stock restore + refund initiation.
- `confirmOfflineRefund({ refundId, method, reference })` — for COD returns: stores UPI/bank reference, admin identity and confirmation timestamp (correction D).

New `src/lib/refunds.server.ts`:
- `createFullRefund({ orderId, kind, reason, idempotencyKey })` — computes amount from order records; inserts `refunds` row (unique idempotency key; conflict returns existing); calls Razorpay `POST /v1/payments/:id/refund` with the full computed amount using server keys; stores `razorpay_refund_id`. No amount parameter from callers.
- **Timeout recovery (correction I)**: if the refund API call times out or errors ambiguously, before any retry the code reconciles via Razorpay `GET /v1/payments/:id/refunds`; if a matching refund exists it is adopted (store its ID, mark pending), otherwise a retry with a new idempotency key is safe. Refund status `pending` until the webhook confirms.
- Duplicate protection: unique `idempotency_key`, unique `razorpay_refund_id`, refund only when payment is `captured` and no prior non-failed refund exists for that payment + kind.

Shiprocket (`src/lib/shiprocket.server.ts`, additive):
- `cancelShipmentBestEffort(orderId)` — eligibility: shipment status in `pending/created/pickup_scheduled` and no active AWB; calls `POST /orders/cancel`; on failure the order cancellation is blocked and the admin sees the reason.
- **Reverse pickup (correction F)**: Shiprocket reverse pickup (`POST /shipments/create/return`) will be attempted on return approval; if the API/account rejects it, the return falls back to an **admin-managed manual shipment** workflow — admin records courier/AWB manually on the return request. This is a known limitation pending account verification (see §9).

Admin status dropdown lockdown (correction G):
- `updateOrderStatus` in `src/lib/admin/orders.functions.ts` is restricted: `cancelled` and `refunded` are removed from the direct dropdown path and may only be reached through the guarded cancellation/return functions. Other statuses (processing, shipped, delivered) remain direct. `delivered` transitions also set `shipments.delivered_at`.

## 5. Webhook handling (`src/routes/api/public/webhooks/razorpay.ts`, additive)

Existing signature verification unchanged. Add:
- `refund.processed` — match `refunds` by `razorpay_refund_id`; set `processed`; set payment `refunded`; complete the parent cancellation/return. Re-delivery is a no-op.
- `refund.failed` — set refund `failed`; order stays cancelled; admin notified for reconcile-and-retry (per §4 timeout recovery).
- Unknown events acknowledged and ignored, as today.

## 6. Customer & admin UI

- `account.tsx` — per-order "Request cancellation" / "Request return" with server-driven eligibility; order history shows cancellation/return/refund progress and the "5–7 business days (estimated, not guaranteed)" refund note.
- Admin order page — cancellation/return panels with approve/reject, inspection recording, offline COD refund confirmation, refund status; history timeline gains every event.
- `returns.tsx` — publish the approved policy: 24h cancellation window, 7-day returns, full refunds only, shipping charges non-refundable on cancellation, COD refunds via bank/UPI, inspection requirement, 5–7 business day estimate.

## 7. Email notifications (app emails)

Scaffold transactional templates (email-domain prerequisite): cancellation-approved, cancellation-rejected, refund-initiated, refund-processed, refund-failed (admin), return-approved (with pickup instructions), return-rejected, inspection-failed. Sent from server functions with idempotency keys derived from request ID + template. If the email domain isn't configured yet, notifications ship in a later phase.

## 8. Security & audit safeguards

- All mutations server-side; ownership via RLS/`owns_order`; admin via `has_role` RPC.
- Razorpay keys stay in secrets; browser never sees refund calls or amounts.
- Exactly-once stock restore enforced in DB (`stock_restored` flag, one transaction) — safe under retries/concurrency.
- Every customer request, admin decision, shipment action, refund, inspection and stock movement is a persisted, timestamped, actor-attributed record (correction J): request tables, `refunds`, `stock_movements`, order/shipment status history.
- Webhook signature verified before processing; refund events matched by unique refund ID.
- Zod validation on all inputs; reason/note lengths bounded.

## 9. Test plan

- Eligibility: cancel at 23h59m (auto), 24h01m (request only), shipped blocked, delivered rejected; return at day 7 (allowed), day 8 (rejected).
- Refund math: amount = subtotal − discount, shipping excluded; browser-supplied amount ignored; amount > captured refused.
- Inventory: cancel restores exactly once; double-approve/concurrent requests no-op; return restock only after `inspection_passed`; `inspection_failed` never restocks; `stock_movements` audit rows written.
- Refunds: duplicate request returns existing refund; simulated Razorpay timeout → reconcile-before-retry adopts existing refund instead of double-refunding; `refund.processed` webhook twice = one state change; `refund.failed` keeps audit and allows safe retry.
- COD: cancellation restores stock with no refund row; return offline refund records method/reference/admin/timestamp and cannot be confirmed twice.
- Shiprocket: cancellation with active AWB refused; API failure blocks order cancellation with admin-visible reason; reverse-pickup failure falls back to manual workflow.
- Admin lockdown: direct dropdown cannot set `cancelled`/`refunded`; guarded path still works.
- Security: non-owner cannot cancel/return; non-admin cannot approve; invalid webhook signature rejected.

## 10. External configuration required

- No new Razorpay/Shiprocket credentials (same key pairs).
- Razorpay dashboard at publish time: enable `refund.processed` / `refund.failed` webhook events.
- Email domain configuration if notifications are in phase 1.
- Shiprocket account: verify reverse-pickup API availability; manual fallback covers the gap.

## 11. Remaining unresolved limitations (flagged, not assumed)

1. **Shiprocket reverse pickup**: unverified on this account; design includes admin-managed manual fallback. Needs a live API check before launch.
2. **Offline COD refunds**: the system records and tracks them but cannot execute the bank/UPI transfer — that stays a manual admin action outside the app.
3. **Payment allocation**: one payment per order is assumed (true today); if split payments are ever introduced, refund allocation logic must be revisited.
4. **`shipments.delivered_at` backfill**: existing delivered shipments (if any) lack this timestamp; returns for those orders would need admin-set delivery dates.
