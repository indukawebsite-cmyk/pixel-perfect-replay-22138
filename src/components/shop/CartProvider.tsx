import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addCartItem, setCartQuantity, type CartItem } from "@/lib/demo-cart";
import { restoreDemoBag } from "@/lib/demo-checkout";
export const DEMO_BAG_KEY = "induka-demo-bag-v1";
const CartContext = createContext<{
  items: CartItem[];
  ready: boolean;
  clear: () => void;
  add: (id: string, quantity?: number, variantId?: string) => void;
  setQuantity: (id: string, quantity: number, variantId?: string) => void;
} | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const stored = sessionStorage.getItem(DEMO_BAG_KEY); if (stored) setItems(restoreDemoBag(JSON.parse(stored))); } catch { /* Storage unavailable or invalid: keep an empty demo bag. */ }
    setReady(true);
  }, []);
  useEffect(() => { if (!ready) return; try { sessionStorage.setItem(DEMO_BAG_KEY, JSON.stringify(items)); } catch { /* Browsing still works without storage. */ } }, [items, ready]);
  const add = (id: string, quantity = 1, variantId?: string) =>
    setItems((current) => addCartItem(current, id, quantity, variantId));
  const setQuantity = (id: string, quantity: number, variantId?: string) =>
    setItems((current) => setCartQuantity(current, id, quantity, variantId));
  return (
    <CartContext.Provider value={{ items, ready, add, setQuantity, clear: () => setItems([]) }}>{children}</CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartProvider is required");
  return context;
}
