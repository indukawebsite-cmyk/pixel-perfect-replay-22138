// Single source of truth for delivery charges, shared by the browser
// (display only) and the server (authoritative calculation).
// PENDING CLIENT CONFIRMATION — confirm these two values before launch.
export const SHIPPING_POLICY = {
  freeAboveInr: 2999,
  flatFeeInr: 149,
} as const;

export function shippingCharge(subtotalInr: number): number {
  if (!Number.isFinite(subtotalInr) || subtotalInr <= 0) return 0;
  return subtotalInr >= SHIPPING_POLICY.freeAboveInr ? 0 : SHIPPING_POLICY.flatFeeInr;
}
