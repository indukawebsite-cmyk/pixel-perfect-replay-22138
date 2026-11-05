import { allProducts } from "@/lib/catalog";

export function searchProducts(query: string, category = "all") {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return allProducts().filter((product) => {
    const text = `${product.name} ${product.category} ${product.gender ?? ""}`.toLocaleLowerCase();
    return (category === "all" || product.category === category) && terms.every((term) => text.includes(term));
  });
}

export function validateNewsletterEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}