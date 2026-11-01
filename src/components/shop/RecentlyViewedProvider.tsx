import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { recordViewed } from "@/lib/product-detail";
const Context = createContext<{ ids: string[]; record: (id: string) => void } | null>(null);
export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const record = useCallback((id: string) => setIds((current) => recordViewed(current, id)), []);
  return <Context.Provider value={{ ids, record }}>{children}</Context.Provider>;
}
export function useRecentlyViewed() { const context = useContext(Context); if (!context) throw new Error("RecentlyViewedProvider is required"); return context; }