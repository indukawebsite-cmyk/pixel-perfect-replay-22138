import { createContext, useContext, useState, type ReactNode } from "react";
import type { DemoOrder } from "@/lib/demo-checkout";
const Context = createContext<{ order: DemoOrder | null; confirm: (order: DemoOrder) => void } | null>(null);
export function DemoOrderProvider({ children }: { children: ReactNode }) {
  const [order, confirm] = useState<DemoOrder | null>(null);
  return <Context.Provider value={{ order, confirm }}>{children}</Context.Provider>;
}
export function useDemoOrder() { const context = useContext(Context); if (!context) throw new Error("DemoOrderProvider is required"); return context; }