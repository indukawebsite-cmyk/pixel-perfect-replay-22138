import { getProduct } from "@/lib/catalog";
import { validQuantity } from "@/lib/product-detail";
export type CartItem = { productId: string; quantity: number; variantId?: string };
export function addCartItem(
  items: CartItem[],
  productId: string,
  quantity = 1,
  variantId?: string,
): CartItem[] {
  const product = getProduct(productId);
  if (!product || product.demoPrice === undefined || !validQuantity(quantity)) return items;
  const selected = variantId ?? product.variants?.[0]?.id;
  if (selected && !product.variants?.some((variant) => variant.id === selected)) return items;
  const matches = (item: CartItem) => item.productId === productId && item.variantId === selected;
  const found = items.find(matches);
  if (found && !validQuantity(found.quantity + quantity)) return items;
  return found
    ? items.map((item) => (matches(item) ? { ...item, quantity: item.quantity + quantity } : item))
    : [...items, { productId, quantity, ...(selected ? { variantId: selected } : {}) }];
}
export function setCartQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
  variantId?: string,
): CartItem[] {
  const matches = (item: CartItem) => item.productId === productId && item.variantId === variantId;
  if (!Number.isFinite(quantity)) return items;
  if (quantity <= 0) return items.filter((item) => !matches(item));
  if (!validQuantity(quantity)) return items;
  return items.map((item) => (matches(item) ? { ...item, quantity } : item));
}
export function cartTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + (getProduct(item.productId)?.demoPrice ?? 0) * item.quantity,
    0,
  );
}
