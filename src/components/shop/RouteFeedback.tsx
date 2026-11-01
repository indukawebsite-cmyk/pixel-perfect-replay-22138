import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
export function ShoppingError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return <section className="container-lux flex flex-col items-center gap-6 py-24 text-center"><h1 className="text-4xl">This page is unavailable</h1><Button variant="lux" onClick={() => { void router.invalidate(); reset(); }}>Try again</Button><Link to="/shop" className="text-sm underline">Back to shop</Link></section>;
}
export function ProductNotFound() { return <section className="container-lux flex flex-col items-center gap-6 py-24 text-center"><h1 className="text-4xl">Piece not found</h1><Link to="/shop" className="text-sm underline">Back to shop</Link></section>; }