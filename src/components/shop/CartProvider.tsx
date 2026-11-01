import { createContext, useContext, useState, type ReactNode } from "react";
import { addCartItem, setCartQuantity, type CartItem } from "@/lib/demo-cart";
const CartContext = createContext<{ items: CartItem[]; add: (id: string) => void; setQuantity: (id: string, quantity: number) => void } | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const add = (id: string) => setItems((current) => addCartItem(current, id));
  const setQuantity = (id: string, quantity: number) => setItems((current) => setCartQuantity(current, id, quantity));
  return <CartContext.Provider value={{ items, add, setQuantity }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("CartProvider is required"); return context; }