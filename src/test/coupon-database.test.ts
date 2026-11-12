// Real PostgreSQL execution in an isolated in-memory database. No Cloud writes.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

const db = new PGlite();
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
let sequence = 10;
async function order(customer: string, method: string = "razorpay", discount = 200) {
  const id = `00000000-0000-4000-8000-${String(sequence++).padStart(12, "0")}`;
  await db.query("INSERT INTO orders(id,customer_id,subtotal,discount,shipping,total,coupon_code,coupon_payment_method) VALUES ($1,$2,1000,$3,149,$4,'FAMILYFIRST',$5)", [id, customer, discount, 1149 - discount, method]);
  await db.query("INSERT INTO payments(order_id,amount,status) VALUES ($1,949,'created')", [id]);
  await db.query("INSERT INTO order_items(order_id,variant_id,quantity,product_name) VALUES ($1,$2,1,'Fixture')", [id, a]);
  return id;
}
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT null::uuid';
    CREATE FUNCTION owns_order(uuid) RETURNS boolean LANGUAGE sql AS 'SELECT false';
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS 'SELECT false';
    CREATE TABLE customers(id uuid PRIMARY KEY);
    CREATE TABLE orders(id uuid PRIMARY KEY,customer_id uuid REFERENCES customers(id),subtotal numeric,discount numeric,shipping numeric,total numeric,status text DEFAULT 'pending',stock_deducted boolean DEFAULT false);
    CREATE TABLE payments(order_id uuid,status text,razorpay_payment_id text,amount numeric);
    CREATE TABLE order_items(order_id uuid,variant_id uuid,quantity integer,product_name text);
    CREATE TABLE product_variants(id uuid,stock_quantity integer);
    INSERT INTO customers VALUES ('${a}'),('${b}'); INSERT INTO product_variants VALUES ('${a}',20);`);
  await db.exec(readFileSync("drizzle/migrations/0009_secure_account_coupon.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0010_coupon_confirmation_guard.sql", "utf8"));
  const original = readFileSync("drizzle/migrations/0006_checkout_hardening.sql", "utf8");
  await db.exec(original.slice(original.indexOf("CREATE OR REPLACE FUNCTION")));
  await db.exec("INSERT INTO coupons(code,discount_percent) VALUES ('FAMILYFIRST',20)");
}, 30000);
afterAll(async () => { await db.close(); });
describe("atomic account-limited redemption", () => {
  it("rejects forged discount amounts in order records", async () => {
    await expect(order(a, "cod", 100)).rejects.toThrow("INVALID_COUPON_TOTAL");
  });
  it("concurrent requests reserve exactly one order for an account", async () => {
    const results = await Promise.allSettled([order(a), order(a)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    const rows = await db.query("SELECT * FROM coupon_redemptions WHERE customer_id=$1", [a]);
    expect(rows.rows).toHaveLength(1);
  });
  it("failed prepaid payment does not mark redemption; capture and duplicate finalize redeem once", async () => {
    const result = await db.query<{order_id: string}>("SELECT order_id FROM coupon_redemptions WHERE customer_id=$1", [a]);
    const id = result.rows[0]?.order_id;
    if (!id) throw new Error("Missing fixture order");
    await db.query("UPDATE payments SET status='failed' WHERE order_id=$1", [id]);
    expect((await db.query<{redeemed_at: string | null}>("SELECT redeemed_at FROM coupon_redemptions WHERE order_id=$1", [id])).rows[0]?.redeemed_at).toBeNull();
    await expect(db.query("SELECT finalize_order($1,false,null)", [id])).rejects.toThrow("COUPON_PAYMENT_NOT_CONFIRMED");
    expect((await db.query<{stock_quantity: number}>("SELECT stock_quantity FROM product_variants")).rows[0]?.stock_quantity).toBe(20);
    await db.query("SELECT finalize_order($1,true,'fixture-payment')", [id]);
    const first = (await db.query<{redeemed_at: Date | null}>("SELECT redeemed_at FROM coupon_redemptions WHERE order_id=$1", [id])).rows[0];
    expect(first?.redeemed_at).not.toBeNull();
    await db.query("SELECT finalize_order($1,true,'fixture-payment')", [id]);
    expect((await db.query("SELECT redeemed_at FROM coupon_redemptions WHERE order_id=$1", [id])).rows[0]).toEqual(first);
    expect((await db.query<{stock_quantity: number}>("SELECT stock_quantity FROM product_variants")).rows[0]?.stock_quantity).toBe(19);
    await expect(order(a)).rejects.toThrow();
  });
  it("different customer's COD order stores the same discounted total and redeems on placement", async () => {
    const id = await order(b, "cod");
    expect((await db.query<{redeemed_at: string | null}>("SELECT redeemed_at FROM coupon_redemptions WHERE order_id=$1", [id])).rows[0]?.redeemed_at).toBeNull();
    await db.query("SELECT finalize_order($1,false,null)", [id]);
    const result = await db.query<{subtotal: string; discount: string; total: string; amount: string; redeemed_at: Date | null}>("SELECT o.subtotal,o.discount,o.total,p.amount,r.redeemed_at FROM orders o JOIN payments p ON p.order_id=o.id JOIN coupon_redemptions r ON r.order_id=o.id WHERE o.id=$1", [id]);
    expect(Number(result.rows[0]?.subtotal)).toBe(1000);
    expect(Number(result.rows[0]?.discount)).toBe(200);
    expect(Number(result.rows[0]?.total)).toBe(949);
    expect(Number(result.rows[0]?.amount)).toBe(949);
    expect(result.rows[0]?.redeemed_at).not.toBeNull();
    await db.query("UPDATE orders SET status='cancelled' WHERE id=$1", [id]);
    await expect(order(b, "cod")).rejects.toThrow();
  });
});