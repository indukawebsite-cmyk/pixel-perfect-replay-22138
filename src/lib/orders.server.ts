// Server-only order creation and finalisation. All pricing and stock checks
// happen here against the database — browser totals are never trusted.
import { shippingCharge } from "@/lib/shipping-policy";
import type { CheckoutAddress, CheckoutItem } from "@/lib/checkout-schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = any;

export class CheckoutError extends Error {}

export type PricedLine = {
  productId: string;
  variantId: string | null;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Quote = { lines: PricedLine[]; subtotal: number; shipping: number; total: number };

export async function priceAndCheckStock(
  admin: AdminClient,
  items: CheckoutItem[],
  allowInactive: boolean,
): Promise<Quote> {
  const slugs = [...new Set(items.map((item) => item.productId))];
  const { data: products, error } = await admin
    .from("products")
    .select("id,slug,name,sku,price,is_active")
    .in("slug", slugs);
  if (error) throw new CheckoutError("Unable to validate your bag right now. Please try again.");
  const productBySlug = new Map(
    (products ?? []).map((p: { id: string; slug: string }) => [p.slug, p]),
  );
  const productIds = (products ?? []).map((p: { id: string }) => p.id);

  const { data: variants } = await admin
    .from("product_variants")
    .select("id,product_id,stock_quantity,sku")
    .in("product_id", productIds);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantById = new Map((variants ?? []).map((v: any) => [v.id, v]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantsByProduct = new Map<string, any[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const v of (variants ?? []) as any[]) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }

  const lines: PricedLine[] = [];
  for (const item of items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = productBySlug.get(item.productId) as any;
    if (!product) throw new CheckoutError("One of the pieces in your bag is no longer available.");
    if (!product.is_active && !allowInactive)
      throw new CheckoutError(`${product.name} is not available for purchase yet.`);
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0)
      throw new CheckoutError(`${product.name} cannot be purchased right now.`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let variant: any = item.variantId ? variantById.get(item.variantId) : undefined;
    if (item.variantId && (!variant || variant.product_id !== product.id))
      throw new CheckoutError(`A selected option for ${product.name} is no longer available.`);
    if (!variant) variant = (variantsByProduct.get(product.id) ?? [])[0];
    if (variant && variant.stock_quantity < item.quantity)
      throw new CheckoutError(
        variant.stock_quantity === 0
          ? `${product.name} is out of stock.`
          : `Only ${variant.stock_quantity} of ${product.name} left in stock.`,
      );

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      sku: variant?.sku ?? product.sku ?? null,
      price,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = shippingCharge(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}

export async function findExistingOrder(admin: AdminClient, customerId: string, idempotencyKey: string) {
  const { data } = await admin
    .from("orders")
    .select("id, order_number, total, status")
    .eq("customer_id", customerId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  return data;
}

export async function createOrder(
  admin: AdminClient,
  opts: {
    customerId: string;
    address: CheckoutAddress;
    quote: Quote;
    idempotencyKey: string;
  },
) {
  const { address, quote } = opts;
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      customer_id: opts.customerId,
      shipping_name: address.name,
      shipping_phone: address.mobile,
      address_line1: address.address,
      address_line2: address.apartment || null,
      city: address.city,
      state: address.state,
      pin_code: address.pin,
      country: address.country,
      subtotal: quote.subtotal,
      discount: 0,
      shipping: quote.shipping,
      total: quote.total,
      status: "pending",
      idempotency_key: opts.idempotencyKey,
    })
    .select("id, order_number")
    .single();
  if (error) {
    if (error.code === "23505") return null; // idempotency conflict — caller refetches
    throw new CheckoutError("Could not create your order. Please try again.");
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    quote.lines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      variant_id: line.variantId,
      product_name: line.name,
      quantity: line.quantity,
      purchase_price: line.price,
    })),
  );
  if (itemsError) throw new CheckoutError("Could not create your order. Please try again.");

  const { error: paymentError } = await admin
    .from("payments")
    .insert({ order_id: order.id, amount: quote.total, status: "created" });
  if (paymentError) throw new CheckoutError("Could not create your order. Please try again.");

  return order as { id: string; order_number: string };
}

// Confirms the order and deducts stock exactly once (database-guarded).
export async function finalizeOrder(
  admin: AdminClient,
  orderId: string,
  markPaid: boolean,
  razorpayPaymentId?: string,
) {
  const { data, error } = await admin.rpc("finalize_order", {
    p_order_id: orderId,
    p_mark_paid: markPaid,
    p_razorpay_payment_id: razorpayPaymentId ?? null,
  });
  if (error) throw new CheckoutError("The order could not be finalised.");
  return data as { ok: boolean; already_finalized: boolean; stock_shortfalls: string[] };
}
