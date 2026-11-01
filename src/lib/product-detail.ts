import { browsingProducts, type Product, type ProductImage } from "@/lib/catalog";
export function productGallery(product: Product): ProductImage[] {
  return product.gallery?.length ? product.gallery : [{ src: product.image, label: "Sample photograph" }, { src: product.image, label: "Detail crop · same sample photograph", detailCrop: true }];
}
export function validQuantity(value: number) { return Number.isSafeInteger(value) && value >= 1; }
export function validPin(value: string) { return /^[1-9]\d{5}$/.test(value); }
export function relatedProducts(product: Product) {
  return browsingProducts.filter((item) => item.id !== product.id && item.demoPrice !== undefined)
    .sort((a, b) => Number(b.collection === product.collection) - Number(a.collection === product.collection) || Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 4);
}
export function recordViewed(ids: string[], id: string) { return [id, ...ids.filter((previous) => previous !== id)].slice(0, 8); }