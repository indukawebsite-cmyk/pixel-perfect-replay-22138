import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkoutSchema, createDemoOrder } from "@/lib/demo-checkout";
import { useCart } from "@/components/shop/CartProvider";
import { useDemoOrder } from "@/components/shop/DemoOrderProvider";
const fields = [
  { key: "name", label: "Customer name", max: 100, section: "contact" },
  { key: "email", label: "Email", max: 255, section: "contact", type: "email" },
  { key: "mobile", label: "Mobile number", max: 10, section: "contact", mode: "tel" },
  { key: "address", label: "Shipping address", max: 250, section: "address" },
  { key: "apartment", label: "Apartment, suite, etc. (optional)", max: 100, section: "address" },
  { key: "pin", label: "PIN code", max: 6, section: "address", mode: "numeric" },
  { key: "city", label: "City", max: 80, section: "address" },
  { key: "state", label: "State", max: 80, section: "address" },
] as const;
type FieldKey = (typeof fields)[number]["key"];
const empty = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  apartment: "",
  pin: "",
  city: "",
  state: "",
};
export function CheckoutForm() {
  const [values, setValues] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { items, clear } = useCart();
  const { confirm } = useDemoOrder();
  const navigate = useNavigate();
  const update = (key: FieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };
  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault();
        if (submitting) return;
        const customer = { ...values, country: "India", demoConsent: consent };
        const validated = checkoutSchema.safeParse(customer);
        if (!validated.success) {
          const next: Record<string, string> = {};
          for (const issue of validated.error.issues) {
            const key = String(issue.path[0]);
            if (!next[key]) next[key] = issue.message;
          }
          setErrors(next);
          const first = validated.error.issues[0]?.path[0];
          if (first) document.getElementById(`checkout-${String(first)}`)?.focus();
          return;
        }
        const order = createDemoOrder(
          items,
          validated.data,
          `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        );
        if (!order) {
          setErrors({
            form: "Your demo bag is empty or has invalid items. Please review it before continuing.",
          });
          return;
        }
        setSubmitting(true);
        confirm(order);
        clear();
        setValues(empty);
        void navigate({ to: "/order-confirmation" });
      }}
    >
      <p className="mb-8 border-y border-border py-4 text-sm leading-loose text-muted-foreground">
        DEMO ONLY · Use fictional contact and address details. Nothing is sent or saved; no payment
        information is collected.
      </p>
      {(["contact", "address"] as const).map((section) => (
        <fieldset key={section} className="mb-10">
          <legend className="mb-5 text-3xl font-display">
            {section === "contact" ? "Contact information" : "Shipping address"}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields
              .filter((field) => field.section === section)
              .map((field) => (
                <div
                  key={field.key}
                  className={
                    field.key === "address" || field.key === "apartment" || field.key === "name"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <label
                    htmlFor={`checkout-${field.key}`}
                    className="mb-2 block text-xs font-medium"
                  >
                    {field.label}
                  </label>
                  <input
                    id={`checkout-${field.key}`}
                    name={field.key}
                    type={"type" in field ? field.type : "text"}
                    inputMode={"mode" in field ? field.mode : "text"}
                    maxLength={field.max}
                    required={field.key !== "apartment"}
                    value={values[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={errors[field.key] ? `error-${field.key}` : undefined}
                    className="h-12 w-full border border-input bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-ring aria-invalid:border-destructive"
                  />
                  {errors[field.key] && (
                    <p id={`error-${field.key}`} className="mt-2 text-xs text-destructive">
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            {section === "address" && (
              <div className="sm:col-span-2">
                <label htmlFor="checkout-country" className="mb-2 block text-xs font-medium">
                  Country
                </label>
                <select
                  id="checkout-country"
                  name="country"
                  className="h-12 w-full border border-input bg-background px-3 text-sm"
                  value="India"
                  onChange={() => {}}
                >
                  <option value="India">India</option>
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  Demo address format only; destinations are not verified.
                </p>
              </div>
            )}
          </div>
        </fieldset>
      ))}
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          id="checkout-demoConsent"
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            setErrors((current) => ({ ...current, demoConsent: "" }));
          }}
          aria-invalid={Boolean(errors["demoConsent"])}
          aria-describedby={errors["demoConsent"] ? "error-demoConsent" : undefined}
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
        />
        <span>I understand this is a demo only and no real order will be placed.</span>
      </label>
      {errors["demoConsent"] && (
        <p id="error-demoConsent" className="mt-2 text-xs text-destructive">
          {errors["demoConsent"]}
        </p>
      )}
      {errors["form"] && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {errors["form"]}
        </p>
      )}
      <Button
        variant="lux"
        type="submit"
        className="mt-6 h-13 w-full tracking-normal"
        disabled={submitting || !items.length}
      >
        Create demo confirmation
        <ArrowRight />
      </Button>
    </form>
  );
}
