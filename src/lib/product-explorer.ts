import { categories, type Product } from "@/lib/catalog";

export const sortOptions = [
  { value: "featured", label: "Featured" }, { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price Low to High" }, { value: "price-desc", label: "Price High to Low" },
] as const;
export type ExplorerSearch = { category?: string; q?: string; min?: number; max?: number; edit?: string; sort?: string; shown?: number };
export const PAGE_SIZE = 12;
export function validateExplorerSearch(search: Record<string, unknown>): ExplorerSearch {
  const text = (key: string) => typeof search[key] === "string" ? search[key] : undefined;
  const number = (key: string) => typeof search[key] === "number" && Number.isFinite(search[key]) ? search[key] : undefined;
  return { category: text("category"), q: text("q"), min: number("min"), max: number("max"), edit: text("edit"), sort: text("sort"), shown: number("shown") };
}

export function filterProducts(products: Product[], search: ExplorerSearch) {
  const terms = (search.q ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const category = categories.some((item) => item.slug === search.category) ? search.category : undefined;
  const filtered = products.filter((product) => {
    const price = product.demoPrice ?? product.price;
    return (!category || product.category === category)
      && (!search.edit || product.edit === search.edit)
      && terms.every((term) => product.name.toLowerCase().includes(term))
      && (search.min === undefined || (price !== null && price !== undefined && price >= Math.max(0, search.min)))
      && (search.max === undefined || (price !== null && price !== undefined && price <= Math.max(0, search.max)));
  });
  return filtered.sort((a, b) => {
    if (search.sort === "newest") return (b.addedOn ?? "").localeCompare(a.addedOn ?? "");
    if (search.sort === "price-asc" || search.sort === "price-desc") {
      const left = a.demoPrice ?? a.price;
      const right = b.demoPrice ?? b.price;
      if (left == null) return right == null ? 0 : 1;
      if (right == null) return -1;
      return search.sort === "price-asc" ? left - right : right - left;
    }
    return (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0);
  });
}
export function visibleProductCount(search: ExplorerSearch, total: number) {
  return Math.min(total, Math.max(PAGE_SIZE, Math.floor(search.shown ?? PAGE_SIZE)));
}