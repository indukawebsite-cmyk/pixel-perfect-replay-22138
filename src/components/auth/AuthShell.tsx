import type { InputHTMLAttributes, ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="container-lux flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <p className="eyebrow text-cocoa">{eyebrow}</p>
        <h1 className="mt-3 text-4xl md:text-5xl">{title}</h1>
        <div className="hairline my-8" />
        {children}
        {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
      </div>
    </section>
  );
}

export function AuthField({
  id,
  label,
  error,
  ...props
}: { id: string; label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 w-full border border-input bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-ring aria-invalid:border-destructive"
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthMessage({ tone, children }: { tone: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`border-y border-border py-4 text-sm leading-relaxed ${tone === "error" ? "text-destructive" : "text-foreground"}`}
    >
      {children}
    </p>
  );
}

export const authHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} — INDUKA` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — INDUKA` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ],
});
