import type { ProductVariant } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
export function VariantSelector({ variants, selected, onSelect }: { variants?: ProductVariant[]; selected?: string; onSelect: (id: string) => void }) {
  if (!variants?.length) return null;
  return <fieldset><legend className="mb-3 text-xs font-medium">{variants.every((variant) => variant.isDemo) ? "Demo options · not real sizes or finishes" : "Options"}</legend><div className="flex flex-wrap gap-2">{variants.map((variant) => <Button key={variant.id} variant="outline" className={selected === variant.id ? "h-11 border-primary bg-primary text-primary-foreground" : "h-11"} aria-pressed={selected === variant.id} onClick={() => onSelect(variant.id)}>{variant.label}</Button>)}</div></fieldset>;
}