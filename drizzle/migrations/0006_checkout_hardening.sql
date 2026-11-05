-- Order numbering: sequential, human-friendly order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;
ALTER TABLE public.orders
  ALTER COLUMN order_number SET DEFAULT ('IND-' || lpad(nextval('public.order_number_seq')::text, 6, '0'));

-- Duplicate-order protection: the browser sends one idempotency key per checkout attempt
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_unique
  ON public.orders (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Stock guard: stock is deducted exactly once per order
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_deducted boolean NOT NULL DEFAULT false;

-- Duplicate-payment protection (Razorpay callbacks and webhooks can arrive more than once)
CREATE UNIQUE INDEX IF NOT EXISTS payments_razorpay_order_id_unique
  ON public.payments (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payments_razorpay_payment_id_unique
  ON public.payments (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- Server-side (service role) write access; RLS stays unchanged for everyone else
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO service_role;
GRANT SELECT, UPDATE ON public.product_variants TO service_role;
GRANT SELECT ON public.products TO service_role;
GRANT SELECT ON public.customers TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO service_role;

-- Atomic finalisation: confirm the order and deduct stock exactly once.
-- Called only by server code with the service role after payment is verified.
CREATE OR REPLACE FUNCTION public.finalize_order(
  p_order_id uuid,
  p_mark_paid boolean,
  p_razorpay_payment_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
  v_short text[] := '{}'::text[];
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  IF p_mark_paid THEN
    UPDATE public.payments
       SET status = 'captured',
           razorpay_payment_id = COALESCE(p_razorpay_payment_id, razorpay_payment_id)
     WHERE order_id = p_order_id;
  END IF;

  IF v_order.status = 'pending' THEN
    UPDATE public.orders SET status = 'confirmed' WHERE id = p_order_id;
  END IF;

  IF NOT v_order.stock_deducted THEN
    FOR v_item IN
      SELECT oi.variant_id, oi.quantity, oi.product_name
        FROM public.order_items oi
       WHERE oi.order_id = p_order_id AND oi.variant_id IS NOT NULL
    LOOP
      UPDATE public.product_variants pv
         SET stock_quantity = pv.stock_quantity - v_item.quantity
       WHERE pv.id = v_item.variant_id AND pv.stock_quantity >= v_item.quantity;
      IF NOT FOUND THEN
        v_short := array_append(v_short, v_item.product_name);
      END IF;
    END LOOP;
    UPDATE public.orders SET stock_deducted = true WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'already_finalized', v_order.stock_deducted,
    'stock_shortfalls', to_jsonb(v_short)
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.finalize_order(uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_order(uuid, boolean, text) TO service_role;