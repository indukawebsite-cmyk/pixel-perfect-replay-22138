import { describe, expect, it } from "vitest";
import {
  CANCELLATION_WINDOW_MS,
  isCancellableStatus,
  refundAmountFor,
  RETURN_WINDOW_MS,
  withinCancellationWindow,
  withinReturnWindow,
} from "@/lib/cancellation-policy";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date("2026-11-06T12:00:00Z");

describe("cancellation window (24h from order placement)", () => {
  it("allows self-service cancellation at 23h59m", () => {
    const created = new Date(now.getTime() - (24 * HOUR - 60 * 1000));
    expect(withinCancellationWindow(created, now)).toBe(true);
  });

  it("requires admin approval at 24h01m", () => {
    const created = new Date(now.getTime() - (24 * HOUR + 60 * 1000));
    expect(withinCancellationWindow(created, now)).toBe(false);
  });

  it("window constant is exactly 24 hours", () => {
    expect(CANCELLATION_WINDOW_MS).toBe(24 * HOUR);
  });
});

describe("cancellable statuses", () => {
  it("pending, confirmed and processing are cancellable", () => {
    expect(isCancellableStatus("pending")).toBe(true);
    expect(isCancellableStatus("confirmed")).toBe(true);
    expect(isCancellableStatus("processing")).toBe(true);
  });

  it("shipped, delivered, cancelled and refunded are not cancellable", () => {
    expect(isCancellableStatus("shipped")).toBe(false);
    expect(isCancellableStatus("delivered")).toBe(false);
    expect(isCancellableStatus("cancelled")).toBe(false);
    expect(isCancellableStatus("refunded")).toBe(false);
  });
});

describe("return window (7 calendar days from delivery)", () => {
  it("allows a return on day 7", () => {
    const delivered = new Date(now.getTime() - 7 * DAY);
    expect(withinReturnWindow(delivered, now)).toBe(true);
  });

  it("rejects a return on day 8", () => {
    const delivered = new Date(now.getTime() - 8 * DAY);
    expect(withinReturnWindow(delivered, now)).toBe(false);
  });

  it("window constant is exactly 7 days", () => {
    expect(RETURN_WINDOW_MS).toBe(7 * DAY);
  });
});

describe("refund amount (full refund, subtotal after discount, shipping excluded)", () => {
  it("equals subtotal minus discount", () => {
    expect(refundAmountFor({ subtotal: 5899, discount: 0 })).toBe(5899);
    expect(refundAmountFor({ subtotal: 5899, discount: 500 })).toBe(5399);
  });

  it("never includes the shipping charge", () => {
    // total = subtotal - discount + shipping = 5899 - 0 + 99 = 5998
    expect(refundAmountFor({ subtotal: 5899, discount: 0 })).not.toBe(5998);
  });

  it("accepts string amounts from database rows", () => {
    expect(refundAmountFor({ subtotal: "2249.00", discount: "0.00" })).toBe(2249);
  });
});
