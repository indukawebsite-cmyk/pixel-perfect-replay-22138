import { getProduct } from "@/lib/catalog";
export type CartItem = { productId: string; quantity: number };
export function addCartItem(items: CartItem[], productId: string): CartItem[] {
  if (getProduct(productId)?.demoPrice === undefined) return items;
  const found = items.find((item) => item.productId === productId);
  return found ? items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { productId, quantity: 1 }];
}
export function setCartQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (!Number.isFinite(quantity)) return items;
  if (quantity <= 0) return items.filter((item) => item.productId !== productId);
  return items.map((item) => item.productId === productId ? { ...item, quantity: Math.floor(quantity) } : item);
}
export function cartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + (getProduct(item.productId)?.demoPrice ?? 0) * item.quantity, 0);
}