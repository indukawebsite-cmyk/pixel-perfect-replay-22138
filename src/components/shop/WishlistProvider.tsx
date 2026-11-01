import { createContext, useContext, useState, type ReactNode } from "react";

const WishlistContext = createContext<{ ids: string[]; toggle: (id: string) => void } | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const toggle = (id: string) => setIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <WishlistContext.Provider value={{ ids, toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("WishlistProvider is required");
  return context;
}