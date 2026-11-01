import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import { addCartItem, cartTotal, type CartItem } from "@/lib/demo-cart";

const text = (name: string, max: number) => z.string().trim().min(2, `${name} is required.`).max(max, `${name} is too long.`).regex(/^[^<>\x00-\x1F]+$/, `${name} contains unsupported characters.`);
export const checkoutSchema = z.object({
  name: text("Customer name", 100),
  email: z.string().trim().max(255).email("Enter a valid email address."),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
  address: text("Shipping address", 250),
  apartment: z.string().trim().max(100).regex(/^[^<>\x00-\x1F]*$/, "Contains unsupported characters."),
  pin: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  city: text("City", 80),
  state: text("State", 80),
  country: z.literal("India"),
  demoConsent: z.literal(true, { errorMap: () => ({ message: "Confirm that this is a demo only." }) }),
});
export const couponSchema = z.string().trim().max(24).regex(/^[A-Za-z0-9-]*$/, "Use letters, numbers or hyphens only.").transform((value) => value.toUpperCase());
export function validateCoupon(input: string) {
  const result = couponSchema.safeParse(input);
  if (!result.success) return { accepted: false, message: "Use up to 24 letters, numbers or hyphens." };
  if (!result.data) return { accepted: false, message: "Enter a demo code." };
  return result.data === "DEMO" ? { accepted: true, message: "DEMO recognised for testing. No discount is applied." } : { accepted: false, message: "Code not recognised. No discount applied. Try DEMO for a format test." };
}
export function orderTotals(items: CartItem[]) {
  const subtotal = cartTotal(items);
  const discount = 0;
  const shipping = items.length ? 150 : 0; // Explicitly illustrative, not an approved delivery charge.
  return { subtotal, discount, shipping, total: subtotal + shipping - discount };
}
const storedBagSchema = z.array(z.object({ productId: z.string().max(100), quantity: z.number().int().positive().safe(), variantId: z.string().max(100).optional() })).max(200);
export function restoreDemoBag(value: unknown): CartItem[] {
  const parsed = storedBagSchema.safeParse(value);
  if (!parsed.success) return [];
  return parsed.data.reduce<CartItem[]>((items, item) => {
    const product = getProduct(item.productId);
    if (product?.variants?.length && !item.variantId) return items;
    return addCartItem(items, item.productId, item.quantity, item.variantId);
  }, []);
}
export type DemoOrder = { reference: string; items: CartItem[]; totals: ReturnType<typeof orderTotals> };
export function createDemoOrder(items: CartItem[], customer: unknown, reference: string): DemoOrder | null {
  if (!checkoutSchema.safeParse(customer).success || !/^DEMO-[A-Z0-9-]{6,40}$/.test(reference)) return null;
  const validated = restoreDemoBag(items);
  if (!validated.length || validated.length !== items.length) return null;
  return { reference, items: validated.map((item) => ({ ...item })), totals: orderTotals(validated) };
}
export function checkoutHead(title: string, description: string) { return { meta: [{ title: `${title} — INDUKA` }, { name: "description", content: description }, { property: "og:title", content: `${title} — INDUKA` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] }; }