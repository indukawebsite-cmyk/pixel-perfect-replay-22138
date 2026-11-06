import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/layout/PageIntro";
import { supabase } from "@/integrations/supabase/client";
import { AuthField, AuthMessage, authHead } from "@/components/auth/AuthShell";
import { fieldErrors, profileSchema } from "@/lib/auth-validation";
import { formatPrice } from "@/lib/catalog";
import { requestCancellation, requestReturn } from "@/lib/cancellations.functions";
import { isCancellableStatus, withinCancellationWindow } from "@/lib/cancellation-policy";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => authHead("Your account", "Your House of Induka account and orders."),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const customer = useQuery({
    queryKey: ["customer", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const orders = useQuery({
    queryKey: ["orders", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const requests = useQuery({
    queryKey: ["order-requests", user.id],
    queryFn: async () => {
      const [cancellations, returns, refunds] = await Promise.all([
        supabase.from("cancellation_requests").select("order_id, status, requested_at"),
        supabase.from("return_requests").select("order_id, status, requested_at"),
        supabase.from("refunds").select("order_id, kind, status, amount"),
      ]);
      if (cancellations.error) throw cancellations.error;
      if (returns.error) throw returns.error;
      if (refunds.error) throw refunds.error;
      return {
        cancellations: cancellations.data ?? [],
        returns: returns.data ?? [],
        refunds: refunds.data ?? [],
      };
    },
  });
  const isAdmin = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      return Boolean(data);
    },
  });
  const save = useMutation({
    mutationFn: async (values: { full_name: string; phone: string }) => {
      const { error } = await supabase
        .from("customers")
        .update({ full_name: values.full_name, phone: values.phone || null })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: ["customer", user.id] });
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <>
      <PageIntro eyebrow="Account" title="Your" accent="house.">
        Signed in as {user.email}
      </PageIntro>
      <section className="container-lux grid gap-14 py-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl">Details</h2>
          <div className="hairline my-6" />
          {customer.isLoading ? (
            <p role="status">Loading…</p>
          ) : (
            <form
              key={customer.data?.updated_at}
              noValidate
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(false);
                const form = new FormData(event.currentTarget);
                const parsed = profileSchema.safeParse({
                  full_name: form.get("full_name"),
                  phone: form.get("phone"),
                });
                if (!parsed.success) return setErrors(fieldErrors(parsed.error));
                setErrors({});
                save.mutate(parsed.data);
              }}
            >
              {saved && <AuthMessage tone="info">Your details are saved.</AuthMessage>}
              {save.isError && <AuthMessage tone="error">We couldn't save your details. Please try again.</AuthMessage>}
              <AuthField id="full_name" label="Full name" defaultValue={customer.data?.full_name ?? ""} maxLength={100} error={errors["full_name"]} />
              <AuthField id="phone" label="Mobile number (optional)" inputMode="tel" defaultValue={customer.data?.phone ?? ""} maxLength={10} error={errors["phone"]} />
              <Button variant="lux" type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save details"}
              </Button>
            </form>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="luxOutline" onClick={signOut}>Sign out</Button>
            {isAdmin.data && (
              <Button asChild variant="luxOutline"><Link to="/admin">Admin area</Link></Button>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-3xl">Orders</h2>
          <div className="hairline my-6" />
          {orders.isLoading ? (
            <p role="status">Loading…</p>
          ) : orders.isError ? (
            <AuthMessage tone="error">We couldn't load your orders.</AuthMessage>
          ) : !orders.data?.length ? (
            <p className="text-sm text-muted-foreground">
              You haven't placed any orders yet. Online ordering opens at launch.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.data.map((o) => (
                <OrderRow
                  key={o.id}
                  order={o}
                  cancellation={requests.data?.cancellations.find((c) => c.order_id === o.id)}
                  returnRequest={requests.data?.returns.find((r) => r.order_id === o.id)}
                  refunds={requests.data?.refunds.filter((r) => r.order_id === o.id) ?? []}
                  onChanged={() => {
                    void queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
                    void queryClient.invalidateQueries({ queryKey: ["order-requests", user.id] });
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

type OrderSummary = { id: string; order_number: string; total: number | string; status: string; created_at: string };
type RequestRow = { order_id: string; status: string; requested_at: string };
type RefundRow = { order_id: string; kind: string; status: string; amount: number | string };

function OrderRow(props: {
  order: OrderSummary;
  cancellation?: RequestRow | undefined;
  returnRequest?: RequestRow | undefined;
  refunds: RefundRow[];
  onChanged: () => void;
}) {
  const { order: o, cancellation, returnRequest, refunds } = props;
  const [mode, setMode] = useState<"none" | "cancel" | "return">("none");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const cancelFn = useServerFn(requestCancellation);
  const returnFn = useServerFn(requestReturn);
  const [busy, setBusy] = useState(false);

  const canCancel = isCancellableStatus(o.status) && !cancellation;
  const canReturn = o.status === "delivered" && !returnRequest;
  const terminal = o.status === "cancelled" || o.status === "refunded";

  async function submit(kind: "cancel" | "return") {
    setBusy(true);
    setMessage(null);
    try {
      const fn = kind === "cancel" ? cancelFn : returnFn;
      const result = await fn({ data: { orderId: o.id, reason } });
      setMessage({
        tone: "info",
        text:
          "outcome" in result && result.outcome === "cancelled"
            ? "Your order has been cancelled. Any refund is estimated within 5–7 business days."
            : "Your request has been sent for review. We'll update you here.",
      });
      setMode("none");
      setReason("");
      props.onChanged();
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      const text =
        code === "ALREADY_REQUESTED" ? "A request for this order is already being reviewed."
        : code === "RETURN_WINDOW_CLOSED" ? "The 7-day return window for this order has closed."
        : code === "SHIPPED_CONTACT_SUPPORT" ? "This order has shipped — please contact us to discuss options."
        : code === "USE_RETURN_WORKFLOW" ? "Delivered orders can be returned instead — use Request return."
        : "We couldn't process that request. Please try again.";
      setMessage({ tone: "error", text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="py-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{o.order_number} · {new Date(o.created_at).toLocaleDateString("en-IN")}</span>
        <span>{formatPrice(Number(o.total))} · {o.status}</span>
      </div>
      {cancellation && (
        <p className="mt-1 text-xs text-muted-foreground">
          Cancellation {cancellation.status}
          {cancellation.status === "completed" && " — refund estimated within 5–7 business days (not guaranteed)."}
        </p>
      )}
      {returnRequest && (
        <p className="mt-1 text-xs text-muted-foreground">
          Return {returnRequest.status.replaceAll("_", " ")}
        </p>
      )}
      {refunds.map((r, i) => (
        <p key={i} className="mt-1 text-xs text-muted-foreground">
          {r.kind === "cancellation" ? "Cancellation" : "Return"} refund {formatPrice(Number(r.amount))} · {r.status}
        </p>
      ))}
      {!terminal && (canCancel || canReturn) && mode === "none" && (
        <div className="mt-2 flex gap-2">
          {canCancel && (
            <Button variant="luxOutline" size="sm" onClick={() => setMode("cancel")}>
              {withinCancellationWindow(o.created_at) ? "Cancel order" : "Request cancellation"}
            </Button>
          )}
          {canReturn && (
            <Button variant="luxOutline" size="sm" onClick={() => setMode("return")}>
              Request return
            </Button>
          )}
        </div>
      )}
      {mode !== "none" && (
        <div className="mt-3 space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={mode === "cancel" ? "Why are you cancelling?" : "Why are you returning this piece?"}
            maxLength={500}
            rows={2}
            className="w-full border border-input bg-background px-3 py-2 text-sm"
          />
          {message && <AuthMessage tone={message.tone}>{message.text}</AuthMessage>}
          <div className="flex gap-2">
            <Button variant="lux" size="sm" disabled={busy || reason.trim().length < 3} onClick={() => submit(mode)}>
              {busy ? "Sending…" : mode === "cancel" ? "Confirm cancellation" : "Send return request"}
            </Button>
            <Button variant="luxOutline" size="sm" disabled={busy} onClick={() => { setMode("none"); setMessage(null); }}>
              Keep order
            </Button>
          </div>
        </div>
      )}
      {mode === "none" && message && <AuthMessage tone={message.tone}>{message.text}</AuthMessage>}
    </li>
  );
}
