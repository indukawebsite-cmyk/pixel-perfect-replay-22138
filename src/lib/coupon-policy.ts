import { z } from "zod";

export const couponCodeSchema = z.string().trim().min(1).max(40).transform((code) => code.replace(/\s/g, "").toUpperCase());
export const COUPON_USED = "This coupon has already been used on your account.";
export function couponDiscount(subtotal: number, percent: number): number {
  if (!Number.isFinite(subtotal) || subtotal < 0 || !Number.isInteger(percent) || percent < 1 || percent > 100) throw new Error("Invalid coupon amount.");
  return Math.round(Math.round(subtotal * 100) * percent / 100) / 100;
}