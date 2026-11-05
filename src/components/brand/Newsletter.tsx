import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateNewsletterEmail } from "@/lib/catalog-search";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [invalid, setInvalid] = useState(false);
  return (
    <section className="bg-midnight py-20 text-ivory md:py-24">
      <div className="container-lux flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="eyebrow text-soft-gold">The INDUKA letter</span>
        <h2 className="text-4xl md:text-5xl">First light, <span className="editorial text-champagne">first look.</span></h2>
        <p className="text-sm leading-relaxed text-ivory/80">Be first to know when new pieces launch.</p>
        <form noValidate className="w-full max-w-md" onSubmit={(event) => {
          event.preventDefault();
          const valid = validateNewsletterEmail(email);
          setInvalid(!valid);
          setFeedback(valid ? "Thank you for your interest. Subscriptions are not open yet; your email has not been saved." : "Please enter a valid email address.");
        }}>
          <label htmlFor="nl" className="sr-only">Email address</label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-ivory/60">
            <input id="nl" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setFeedback(""); setInvalid(false); }} aria-invalid={invalid} aria-describedby="newsletter-feedback" placeholder="Your email address" className="min-w-0 bg-transparent py-4 text-base outline-none placeholder:text-ivory/70 focus-visible:ring-1 focus-visible:ring-champagne" />
            <Button variant="ghost" type="submit" className="h-12 px-3 text-soft-gold hover:bg-cocoa hover:text-ivory" aria-label="Subscribe">Subscribe <ArrowRight /></Button>
          </div>
          <p id="newsletter-feedback" role="status" className="mt-4 min-h-12 text-sm leading-relaxed text-ivory/80">{feedback || "Newsletter registration opens at launch."}</p>
        </form>
      </div>
    </section>
  );
}