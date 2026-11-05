// Server-only Shiprocket connectivity. Best-effort: a courier failure must
// never break an order that is already placed and paid.
// fastrr Headless Checkout is intentionally NOT wired here — it stays
// disabled until onboarding and credentials are confirmed.

const BASE = "https://apiv2.shiprocket.in/v1/external";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = any;

export function shiprocketConfigured(): boolean {
  return Boolean(process.env["SHIPROCKET_EMAIL"] && process.env["SHIPROCKET_PASSWORD"]);
}

async function login(): Promise<string> {
  const response = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: process.env["SHIPROCKET_EMAIL"],
      password: process.env["SHIPROCKET_PASSWORD"],
    }),
  });
  if (!response.ok) throw new Error(`Shiprocket auth failed (${response.status})`);
  const body = (await response.json()) as { token?: string };
  if (!body.token) throw new Error("Shiprocket auth returned no token");
  return body.token;
}

export async function createShipmentBestEffort(
  admin: AdminClient,
  orderId: string,
): Promise<{ ok: boolean; reason?: string }> {
  try {
    if (!shiprocketConfigured()) return { ok: false, reason: "not_configured" };

    const { data: order } = await admin
      .from("orders")
      .select("*, order_items(*), customers(email)")
      .eq("id", orderId)
      .single();
    if (!order) return { ok: false, reason: "order_not_found" };

    const { data: existing } = await admin
      .from("shipments")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();
    if (existing) return { ok: true }; // never create twice

    const { data: payment } = await admin
      .from("payments")
      .select("status")
      .eq("order_id", orderId)
      .maybeSingle();
    const isPrepaid = payment?.status === "captured";

    const token = await login();
    const createdAt = new Date(order.created_at);
    const pad = (n: number) => String(n).padStart(2, "0");
    const orderDate = `${createdAt.getFullYear()}-${pad(createdAt.getMonth() + 1)}-${pad(createdAt.getDate())} ${pad(createdAt.getHours())}:${pad(createdAt.getMinutes())}`;
    const response = await fetch(`${BASE}/orders/create/adhoc`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({
        order_id: order.order_number,
        order_date: orderDate,
        pickup_location: process.env["SHIPROCKET_PICKUP_LOCATION"] || "Primary",
        billing_customer_name: order.shipping_name,
        billing_last_name: "",
        billing_address: order.address_line1,
        billing_address_2: order.address_line2 ?? "",
        billing_city: order.city,
        billing_state: order.state,
        billing_pincode: order.pin_code,
        billing_country: order.country,
        billing_email: order.customers?.email ?? "",
        billing_phone: order.shipping_phone,
        shipping_is_billing: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        order_items: order.order_items.map((item: any) => ({
          name: item.product_name,
          sku: String(item.variant_id ?? item.product_id ?? item.id),
          units: item.quantity,
          selling_price: Number(item.purchase_price),
        })),
        payment_method: isPrepaid ? "Prepaid" : "COD",
        sub_total: Number(order.subtotal),
        shipping_charges: Number(order.shipping),
        total_discount: Number(order.discount),
        // Parcel defaults until per-product packing data is finalised;
        // override via secrets if the configured values differ.
        length: Number(process.env["SHIPROCKET_PARCEL_LENGTH_CM"] || 20),
        breadth: Number(process.env["SHIPROCKET_PARCEL_BREADTH_CM"] || 15),
        height: Number(process.env["SHIPROCKET_PARCEL_HEIGHT_CM"] || 5),
        weight: Number(process.env["SHIPROCKET_PARCEL_WEIGHT_KG"] || 0.5),
      }),
    });
    if (!response.ok) {
      console.error("Shiprocket order creation failed", response.status);
      return { ok: false, reason: `api_${response.status}` };
    }
    const body = (await response.json()) as { order_id?: number | string };
    await admin.from("shipments").insert({
      order_id: orderId,
      shiprocket_order_id: body?.order_id != null ? String(body.order_id) : null,
      status: "created",
    });
    return { ok: true };
  } catch (error) {
    console.error("Shiprocket best-effort shipment failed", error);
    return { ok: false, reason: "exception" };
  }
}
