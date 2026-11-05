import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { categoryGroups, productPriceLabel } from "@/lib/catalog";
import { searchProducts } from "@/lib/catalog-search";
import { useLiveCatalog } from "@/lib/live-catalog";
import { SafeImage } from "@/components/shop/SafeImage";
import { DemoBag } from "@/components/shop/DemoBag";
import { useCart } from "@/components/shop/CartProvider";
import { useWishlist } from "@/components/shop/WishlistProvider";

const nav = [{ to: "/men", label: "Shop Men" }, { to: "/women", label: "Shop Women" }, { to: "/bestsellers", label: "Bestsellers" }] as const;
const promises = ["We sell only pure 925 sterling silver", "Easy returns & exchanges", "Gift-worthy packaging with every order"];

function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % promises.length), 3500);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="bg-midnight px-4 py-3 text-ivory" role="region" aria-label="Our promise">
    <p className="hidden text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] md:block">{promises.join("   ·   ")}</p>
    <p aria-live="polite" className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] md:hidden">{promises[index]}</p>
  </div>;
}

export function SiteHeader() {
  const [panel, setPanel] = useState<null | "menu" | "cart" | "search">(null);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { ids } = useWishlist();
  const { items } = useCart();
  const bagCount = items.reduce((total, item) => total + item.quantity, 0);
  useLiveCatalog();
  const results = searchProducts(query);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const close = () => setPanel(null);
  return <>
    <AnnouncementBar />
    <header className={`sticky top-0 z-40 border-b transition-colors duration-500 ${scrolled ? "border-border bg-ivory/95 backdrop-blur" : "border-transparent bg-ivory"}`}>
      <div className="container-lux grid h-20 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
        <div className="flex min-w-0 items-center gap-4"><Button variant="ghost" className="h-11 gap-2 px-2" aria-label="Open menu" onClick={() => setPanel("menu")}><Menu strokeWidth={1.25} /><span className="eyebrow hidden text-[0.65rem] sm:inline">Menu</span></Button><nav className="hidden min-w-0 items-center gap-6 lg:flex" aria-label="Primary">{nav.map((n) => <Link key={n.to} to={n.to} className="eyebrow link-lux text-[0.65rem]" activeProps={{ className: "text-cocoa underline underline-offset-8" }}>{n.label}</Link>)}</nav></div>
        <Link to="/" aria-label="INDUKA home" className="justify-self-center"><Logo variant="wordmark" className="w-28 sm:w-36 md:w-40" /></Link>
        <div className="flex min-w-0 items-center justify-end gap-0 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-11 w-10 shrink-0" aria-label="Search" onClick={() => setPanel("search")}><Search strokeWidth={1.25} /></Button>
          <Button asChild variant="ghost" size="icon" className="hidden h-11 w-11 shrink-0 sm:inline-flex"><Link to="/account" aria-label="Account"><User strokeWidth={1.25} /></Link></Button>
          <Button variant="ghost" size="icon" className="h-11 w-10 shrink-0" aria-label={`Demo bag, ${bagCount} items`} onClick={() => setPanel("cart")}><ShoppingBag strokeWidth={1.25} />{bagCount > 0 && <span className="text-xs">{bagCount}</span>}</Button>
        </div>
      </div>
    </header>
    <Drawer open={panel !== null} side={panel === "menu" ? "left" : "right"} onClose={close} title={panel === "menu" ? "Menu" : panel === "cart" ? "Your bag" : "Search"}>
      {panel === "menu" && <nav className="flex flex-col gap-4" aria-label="Menu">
        <Link to="/men" onClick={close} className="font-display text-3xl">Shop Men</Link>
        <Link to="/women" onClick={close} className="font-display text-3xl">Shop Women</Link>
        <span className="eyebrow mt-3 text-cocoa">Shop by category</span>
        {categoryGroups.map((c) => <Link key={c.slug} to="/shop" search={{ category: c.slug }} onClick={close} className="pl-3 text-sm uppercase tracking-wider">{c.name}</Link>)}
        <Link to="/bestsellers" onClick={close} className="mt-3 font-display text-2xl">Bestsellers</Link>
        <div className="hairline my-2" />
        <Link to="/silver-care" onClick={close} className="text-sm">Silver Policy &amp; Care</Link>
        <Link to="/returns" onClick={close} className="text-sm">Returns &amp; Exchanges</Link>
        <Link to="/contact" onClick={close} className="text-sm">Contact Us</Link>
        <Link to="/about" onClick={close} className="text-sm">About Us</Link>
        <div className="hairline my-2" />
        <Link to="/account" onClick={close} className="flex items-center gap-3 py-1 text-sm"><User className="h-4 w-4" />Account</Link><Link to="/wishlist" onClick={close} className="flex items-center gap-3 py-1 text-sm"><Heart className="h-4 w-4" />Wishlist ({ids.length})</Link></nav>}
      {panel === "cart" && <DemoBag onNavigate={close} />}
      {panel === "search" && <>
        <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-foreground pb-3"><Search className="h-4 w-4" /><span className="sr-only">Search jewellery</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jewellery" className="min-w-0 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground" /></label>
        <p role="status" className="my-6 text-xs leading-relaxed text-muted-foreground">{query.trim() ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} found` : "Search by name or category"}</p>
        {results.length === 0 && <div className="py-8"><h2 className="text-2xl">No pieces found</h2><p className="mt-3 text-sm text-muted-foreground">Try a category such as pendants or earrings.</p><Button variant="link" onClick={() => setQuery("")}>Clear search</Button></div>}
        <div className="flex flex-col gap-5">{results.map((product) => <Link key={product.id} to="/products/$productId" params={{ productId: product.id }} onClick={close} className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-4"><SafeImage src={product.thumbnail || product.image} alt={product.name} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" /><div className="min-w-0"><p className="text-sm font-medium leading-relaxed">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{productPriceLabel(product)}</p></div></Link>)}</div>
      </>}
    </Drawer>
  </>;
}

function Drawer({ open, side, onClose, title, children }: { open: boolean; side: "left" | "right"; onClose: () => void; title: string; children: ReactNode }) {
  return <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-midnight/40 backdrop-blur-sm" /><Dialog.Content aria-describedby={undefined} className={`fixed inset-y-0 z-50 flex w-[92%] max-w-md flex-col overflow-y-auto bg-ivory p-6 outline-none sm:p-8 ${side === "left" ? "left-0" : "right-0"}`}><div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><Dialog.Title className="eyebrow">{title}</Dialog.Title><Dialog.Close asChild><Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Close"><X strokeWidth={1.25} /></Button></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
