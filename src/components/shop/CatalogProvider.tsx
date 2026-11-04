import { useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCatalog } from "@/lib/catalog-source";
import { getCatalog, setCatalog } from "@/lib/live-catalog";

export function CatalogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let current = 0;
    const load = () => {
      const run = ++current;
      setCatalog({ status: "loading", products: getCatalog().products });
      fetchCatalog()
        .then((products) => run === current && setCatalog({ status: "ready", products }))
        .catch((error: unknown) => {
          console.error("Catalogue could not be loaded", error);
          if (run === current) setCatalog({ status: "error", products: [] });
        });
    };
    load();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <>{children}</>;
}
