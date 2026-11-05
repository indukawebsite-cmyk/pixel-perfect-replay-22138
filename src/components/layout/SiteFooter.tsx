import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="bg-midnight text-ivory">
      <div className="container-lux grid gap-14 py-20 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-6">
          <Logo variant="gold" className="w-44" />
          <p className="editorial max-w-xs text-lg text-soft-gold">Pure silver. Distinctive style.</p>
          <p className="max-w-xs text-sm text-ivory/60">
            Pure 925 sterling silver jewellery for men and women. Easy returns and exchanges. Gift-worthy packaging with every order.
          </p>
        </div>
        <FooterCol title="Customer care">
          <Link to="/contact">Contact</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/shipping">Shipping</Link>
          <Link to="/returns">Returns &amp; exchanges</Link>
        </FooterCol>
        <FooterCol title="Shop">
          <Link to="/men">Shop Men</Link>
          <Link to="/women">Shop Women</Link>
          <Link to="/bestsellers">Bestsellers</Link>
          <Link to="/shop">All jewellery</Link>
        </FooterCol>
        <FooterCol title="House">
          <Link to="/about">About us</Link>
          <Link to="/silver-care">Silver policy &amp; care</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/account">Account</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/social">Instagram</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </FooterCol>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-lux flex flex-col justify-between gap-3 py-6 text-[0.7rem] tracking-[0.15em] text-ivory/45 uppercase md:flex-row">
          <span>© {new Date().getFullYear()} House of Induka</span>
          <span>925 Sterling Silver</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 text-sm text-ivory/85 [&_a:hover]:text-soft-gold [&_a]:py-1 [&_a]:transition-colors">
      <span className="eyebrow mb-2 text-[0.6rem] text-champagne">{title}</span>
      {children}
    </div>
  );
}
