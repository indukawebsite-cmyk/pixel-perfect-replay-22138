import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkoutAddressSchema } from "@/lib/checkout-schema";
import { placeOrder, confirmRazorpayPayment } from "@/lib/checkout.functions";
import { useCart } from "@/components/shop/CartProvider";
import { applyCoupon } from "@/lib/coupons.functions";
import type { CouponTotals } from "@/components/shop/OrderSummary";

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

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function friendlyError(message: string): string {
  if (message.includes("ONLINE_PAYMENT_UNAVAILABLE"))
    return "Online payment is being configured. Please choose Cash on Delivery for now.";
  if (message.includes("SIGNATURE_INVALID"))
    return "We could not verify the payment response. If any amount was debited, it is reversed by your bank automatically.";
  if (message.includes("ORDER_NOT_FOUND") || message.includes("PAYMENT_NOT_FOUND"))
    return "We could not match this payment to your order. Please contact us before paying again.";
  return message;
}

export function CheckoutForm({ coupon, onCoupon }: { coupon?: CouponTotals | null; onCoupon?: (value: CouponTotals | null) => void }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const placeOrderFn = useServerFn(placeOrder);
  const confirmFn = useServerFn(confirmRazorpayPayment);
  const applyFn = useServerFn(applyCoupon);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);
  const apply = async () => {
    if (signedIn !== true || applying || submitting) return;
    setApplying(true);
    setCouponError("");
    try {
      const result = await applyFn({ data: { code: couponInput, items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })) } });
      idempotencyKey.current = null;
      onCoupon?.(result);
    } catch (error) {
      onCoupon?.(null);
      setCouponError(error instanceof Error ? error.message : "Could not apply coupon.");
    } finally { setApplying(false); }
  };

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  const update = (key: FieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  if (signedIn === false) {
    return (
      <div className="border border-border p-8 text-center md:p-12">
        <h2 className="text-3xl font-display">Sign in to place your order</h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-loose text-muted-foreground">
          Your bag stays saved in this tab. Sign in or create an account so we can confirm your
          order and delivery.
        </p>
        <Button asChild variant="lux" className="mt-8 h-13 w-full tracking-normal">
          <Link to="/auth" search={{ redirect: "/checkout" }}>
            Sign in
            <ArrowRight />
          </Link>
        </Button>
        <p className="mt-5 text-sm">
          New to INDUKA?{" "}
          <Link to="/signup" className="underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const customer = { ...values, country: "India" as const };
    const validated = checkoutAddressSchema.safeParse(customer);
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
    setSubmitting(true);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const result = await placeOrderFn({
        data: {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId,
          })),
          customer: validated.data,
          paymentMethod: method,
          idempotencyKey: idempotencyKey.current,
          ...(coupon ? { couponCode: coupon.code } : {}),
        },
      });

      if (result.mode === "cod") {
        clear();
        void navigate({ to: "/order-confirmation", search: { order: result.orderId } });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setErrors({
          form: "The payment window could not be loaded. Please check your connection and try again.",
        });
        setSubmitting(false);
        return;
      }
      const razorpay = new window.Razorpay({
        key: result.razorpay.keyId,
        order_id: result.razorpay.orderId,
        amount: result.razorpay.amountPaise,
        currency: result.razorpay.currency,
        name: "HOUSE OF INDUKA",
        description: `Order ${result.orderNumber}`,
        prefill: {
          name: validated.data.name,
          email: validated.data.email,
          contact: validated.data.mobile,
        },
        theme: { color: "#0F0E0C" },
        modal: { ondismiss: () => setSubmitting(false) },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await confirmFn({
              data: {
                orderId: result.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            clear();
            void navigate({ to: "/order-confirmation", search: { order: result.orderId } });
          } catch (error) {
            setErrors({
              form: friendlyError(error instanceof Error ? error.message : "Payment confirmation failed."),
            });
            setSubmitting(false);
          }
        },
      });
      razorpay.open();
    } catch (error) {
      setErrors({
        form: friendlyError(
          error instanceof Error ? error.message : "Something went wrong. Please try again.",
        ),
      });
      setSubmitting(false);
    }
  };

  return (
    <form noValidate autoComplete="on" onSubmit={(event) => void submit(event)}>
      <p className="mb-8 border-y border-border py-4 text-sm leading-loose text-muted-foreground">
        Your details are used only to confirm and deliver this order.
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
                  We currently deliver within India only.
                </p>
              </div>
            )}
          </div>
        </fieldset>
      ))}

      <fieldset className="mb-10" disabled={submitting || applying}>
        <legend className="mb-5 text-3xl font-display">Apply Coupon Code</legend>
        <label htmlFor="coupon-code" className="mb-2 block text-xs">Coupon code</label>
        <div className="flex gap-3">
          <input id="coupon-code" maxLength={40} value={couponInput} onChange={(event) => setCouponInput(event.target.value)} className="h-12 min-w-0 flex-1 border border-input bg-transparent px-3 text-sm" />
          <Button type="button" variant="lux" disabled={!couponInput.trim() || Boolean(coupon)} onClick={() => void apply()}>{applying ? "Applying…" : "Apply"}</Button>
        </div>
        {coupon && <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm">FAMILYFIRST applied! You saved 20%.</p><Button type="button" variant="ghost" onClick={() => { onCoupon?.(null); idempotencyKey.current = null; }}>Remove coupon</Button></div>}
        {couponError && <p role="alert" className="mt-3 text-sm text-destructive">{couponError}</p>}
      </fieldset>

      <fieldset className="mb-4">
        <legend className="mb-5 text-3xl font-display">Payment</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              {
                value: "razorpay",
                title: "Pay online",
                copy: "UPI, cards, net banking and wallets through Razorpay's secure checkout.",
              },
              {
                value: "cod",
                title: "Cash on delivery",
                copy: "Pay in cash when your jewellery arrives.",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer flex-col gap-2 border p-5 text-sm ${
                method === option.value ? "border-foreground" : "border-border"
              }`}
            >
              <span className="flex items-center gap-3 font-medium">
                <input
                  type="radio"
                  name="payment-method"
                  checked={method === option.value}
                  onChange={() => setMethod(option.value)}
                  className="h-4 w-4 accent-primary"
                />
                {option.title}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">{option.copy}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {errors["form"] && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {errors["form"]}
        </p>
      )}
      <Button
        variant="lux"
        type="submit"
        className="mt-6 h-13 w-full tracking-normal"
        disabled={submitting || applying || !items.length || signedIn !== true}
      >
        {submitting
          ? "Processing…"
          : method === "razorpay"
            ? "Pay securely"
            : "Place order · Pay on delivery"}
        <ArrowRight />
      </Button>
    </form>
  );
}
