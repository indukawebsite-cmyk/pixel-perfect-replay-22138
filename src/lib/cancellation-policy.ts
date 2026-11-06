// Owner-approved cancellation/return business rules as pure, testable functions.
// Server code enforces these; the browser only mirrors them for UX.

export const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h from order placement
export const RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 calendar days from delivery

export type CancellableStatus = "pending" | "confirmed" | "processing";

/** Orders in these statuses can be cancelled (subject to the time window). */
export function isCancellableStatus(status: string): status is CancellableStatus {
  return status === "pending" || status === "confirmed" || status === "processing";
}

/** Within the 24h self-service window measured from orders.created_at. */
export function withinCancellationWindow(createdAt: string | Date, now: Date = new Date()): boolean {
  return now.getTime() - new Date(createdAt).getTime() <= CANCELLATION_WINDOW_MS;
}

/** Within the 7-day return window measured from the actual delivery timestamp. */
export function withinReturnWindow(deliveredAt: string | Date, now: Date = new Date()): boolean {
  return now.getTime() - new Date(deliveredAt).getTime() <= RETURN_WINDOW_MS;
}

/**
 * Refund amount for a cancellation or return: product subtotal after discounts,
 * excluding shipping charges. Computed only from server-stored order records.
 */
export function refundAmountFor(order: { subtotal: number | string; discount: number | string }): number {
  return Number(order.subtotal) - Number(order.discount);
}
