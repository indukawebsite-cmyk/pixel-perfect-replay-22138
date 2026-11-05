import { z } from "zod";

// Client-safe checkout validation, shared by the checkout form and the
// server functions (the server always re-validates).
const text = (name: string, max: number) =>
  z
    .string()
    .trim()
    .min(2, `${name} is required.`)
    .max(max, `${name} is too long.`)
    .regex(/^[^<>\x00-\x1F]+$/, `${name} contains unsupported characters.`);

export const checkoutAddressSchema = z.object({
  name: text("Customer name", 100),
  email: z.string().trim().max(255).email("Enter a valid email address."),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
  address: text("Shipping address", 250),
  apartment: z
    .string()
    .trim()
    .max(100)
    .regex(/^[^<>\x00-\x1F]*$/, "Contains unsupported characters."),
  pin: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  city: text("City", 80),
  state: text("State", 80),
  country: z.literal("India"),
});

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  variantId: z.string().uuid().optional(),
});

export const checkoutItemsSchema = z
  .array(checkoutItemSchema)
  .min(1, "Your bag is empty.")
  .max(50);

export const paymentMethodSchema = z.enum(["razorpay", "cod"]);

export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
