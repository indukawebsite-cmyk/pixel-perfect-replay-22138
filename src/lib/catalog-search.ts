import { getCollection, browsingProducts } from "@/lib/catalog";

export function searchProducts(query: string, category = "all") {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return browsingProducts.filter((product) => {
    const text = `${product.name} ${product.category} ${getCollection(product.collection)?.name ?? ""}`.toLocaleLowerCase();
    return (category === "all" || product.category === category) && terms.every((term) => text.includes(term));
  });
}

export function validateNewsletterEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}