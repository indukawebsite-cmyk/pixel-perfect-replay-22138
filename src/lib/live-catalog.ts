import { useSyncExternalStore } from "react";
import type { Product } from "@/lib/catalog";

// Browser-side store for catalogue rows read through Lovable Cloud with the visitor's own
// permissions. Inactive products are only returned to admins, so signed-out visitors see none.
export type CatalogStatus = "idle" | "loading" | "ready" | "error";
export type CatalogState = { status: CatalogStatus; products: Product[] };

const initial: CatalogState = { status: "idle", products: [] };
let state: CatalogState = initial;
const listeners = new Set<() => void>();

export function setCatalog(next: CatalogState) {
  state = next;
  listeners.forEach((listener) => listener());
}
export function getCatalog() {
  return state;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function useLiveCatalog() {
  return useSyncExternalStore(subscribe, getCatalog, () => initial);
}
