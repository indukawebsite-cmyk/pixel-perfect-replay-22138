import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { collections } from "@/lib/catalog";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "Our Story" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<null | "cart" | "search">(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <div className="bg-midnight py-2.5 text-center">
        <p className="eyebrow text-[0.6rem] text-soft-gold">925 Sterling Silver · Gift-ready packaging with every order</p>
      </div>
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-500 ${scrolled ? "border-border bg-ivory/95 backdrop-blur" : "border-transparent bg-ivory"}`}
      >
        <div className="container-lux grid h-20 grid-cols-[1fr_auto_1fr] items-center">
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="eyebrow link-lux text-[0.65rem] text-foreground" activeProps={{ className: "text-champagne" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" strokeWidth={1.25} />
          </button>
          <Link to="/" aria-label="INDUKA home" className="justify-self-center">
            <Logo variant="wordmark" className="w-32 md:w-40" />
          </Link>
          <div className="flex items-center justify-end gap-5">
            <button aria-label="Search" onClick={() => setPanel("search")}><Search className="h-[18px] w-[18px]" strokeWidth={1.25} /></button>
            <Link to="/account" aria-label="Account" className="hidden sm:block"><User className="h-[18px] w-[18px]" strokeWidth={1.25} /></Link>
            <button aria-label="Cart, 0 items" onClick={() => setPanel("cart")}><ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <Drawer side="left" onClose={() => setOpen(false)} title="Menu">
            <nav className="flex flex-col gap-6" aria-label="Mobile">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-display text-3xl">{n.label}</Link>
              ))}
              <div className="hairline my-2" />
              <span className="eyebrow text-champagne">Collections</span>
              {collections.map((c) => (
                <Link key={c.slug} to="/collections/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="text-sm tracking-[0.2em] uppercase">
                  {c.name}
                </Link>
              ))}
              <Link to="/account" onClick={() => setOpen(false)} className="text-sm tracking-[0.2em] uppercase">Account</Link>
            </nav>
          </Drawer>
        )}
        {panel === "cart" && (
          <Drawer side="right" onClose={() => setPanel(null)} title="Your bag">
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-8 w-8 text-champagne" strokeWidth={1} />
              <p className="font-display text-2xl">Your bag is empty</p>
              <p className="text-sm text-muted-foreground">Our first pieces are on their way.</p>
              <Link to="/shop" onClick={() => setPanel(null)} className="eyebrow link-lux mt-2 text-[0.65rem]">Browse the shop</Link>
            </div>
          </Drawer>
        )}
        {panel === "search" && (
          <Drawer side="right" onClose={() => setPanel(null)} title="Search">
            <label className="flex items-center gap-3 border-b border-foreground pb-3">
              <Search className="h-4 w-4" strokeWidth={1.25} />
              <input autoFocus placeholder="Search jewellery" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </label>
            <p className="mt-6 text-sm text-muted-foreground">Search becomes available when the catalogue launches.</p>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
}

function Drawer({ side, onClose, title, children }: { side: "left" | "right"; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div className="absolute inset-0 bg-midnight/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        initial={{ x: side === "left" ? "-100%" : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: side === "left" ? "-100%" : "100%" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute top-0 ${side === "left" ? "left-0" : "right-0"} flex h-full w-[88%] max-w-md flex-col bg-ivory p-8`}
      >
        <div className="mb-10 flex items-center justify-between">
          <span className="eyebrow text-[0.65rem]">{title}</span>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" strokeWidth={1.25} /></button>
        </div>
        {children}
      </motion.aside>
    </div>
  );
}
