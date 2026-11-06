CREATE TYPE public.cancellation_status AS ENUM ('requested','approved','rejected','completed');
CREATE TYPE public.return_status AS ENUM ('requested','approved','rejected','received','inspection_passed','inspection_failed','refunded','closed');
CREATE TYPE public.refund_status AS ENUM ('created','pending','processed','failed');
CREATE TYPE public.refund_kind AS ENUM ('cancellation','return');

CREATE TABLE public.cancellation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  reason text NOT NULL,
  status public.cancellation_status NOT NULL DEFAULT 'requested',
  admin_note text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);
CREATE UNIQUE INDEX cancellation_requests_one_open ON public.cancellation_requests (order_id) WHERE status = 'requested';
GRANT SELECT ON public.cancellation_requests TO authenticated;
GRANT ALL ON public.cancellation_requests TO service_role;
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers read own cancellation requests" ON public.cancellation_requests FOR SELECT TO authenticated USING (public.owns_order(order_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  reason text NOT NULL,
  status public.return_status NOT NULL DEFAULT 'requested',
  admin_note text,
  inspection_note text,
  return_courier text,
  return_awb text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);
CREATE UNIQUE INDEX return_requests_one_open ON public.return_requests (order_id) WHERE status = 'requested';
GRANT SELECT ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers read own return requests" ON public.return_requests FOR SELECT TO authenticated USING (public.owns_order(order_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  payment_id uuid REFERENCES public.payments(id),
  kind public.refund_kind NOT NULL,
  amount numeric NOT NULL,
  reason text,
  razorpay_refund_id text UNIQUE,
  status public.refund_status NOT NULL DEFAULT 'created',
  idempotency_key text NOT NULL UNIQUE,
  offline_method text,
  offline_reference text,
  offline_confirmed_by uuid,
  offline_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers read own refunds" ON public.refunds FOR SELECT TO authenticated USING (public.owns_order(order_id) OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_refunds_updated_at BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  variant_id uuid REFERENCES public.product_variants(id),
  change integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.orders ADD COLUMN stock_restored boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN cancelled_at timestamptz;
ALTER TABLE public.orders ADD COLUMN cancellation_reason text;
ALTER TABLE public.shipments ADD COLUMN delivered_at timestamptz;

CREATE OR REPLACE FUNCTION public.cancel_order_and_restore(p_order_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_restored boolean := false;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object('ok', true, 'already_cancelled', true, 'stock_restored', v_order.stock_restored);
  END IF;
  IF v_order.status NOT IN ('pending','confirmed','processing') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_cancellable');
  END IF;
  UPDATE public.orders SET status = 'cancelled', cancelled_at = now(), cancellation_reason = p_reason WHERE id = p_order_id;
  IF v_order.stock_deducted AND NOT v_order.stock_restored THEN
    UPDATE public.product_variants pv SET stock_quantity = stock_quantity + oi.quantity
    FROM public.order_items oi WHERE oi.order_id = p_order_id AND oi.variant_id = pv.id;
    INSERT INTO public.stock_movements (order_id, variant_id, change, reason)
    SELECT p_order_id, oi.variant_id, oi.quantity, 'cancellation_restore'
    FROM public.order_items oi WHERE oi.order_id = p_order_id AND oi.variant_id IS NOT NULL;
    UPDATE public.orders SET stock_restored = true WHERE id = p_order_id;
    v_restored := true;
  END IF;
  RETURN jsonb_build_object('ok', true, 'already_cancelled', false, 'stock_restored', v_restored);
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_order_and_restore(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order_and_restore(uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.restore_returned_stock(p_return_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ret public.return_requests%ROWTYPE;
  v_restored boolean := false;
BEGIN
  SELECT * INTO v_ret FROM public.return_requests WHERE id = p_return_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_ret.status <> 'inspection_passed' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'inspection_not_passed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.stock_movements WHERE order_id = v_ret.order_id AND reason = 'return_restore') THEN
    UPDATE public.product_variants pv SET stock_quantity = stock_quantity + oi.quantity
    FROM public.order_items oi WHERE oi.order_id = v_ret.order_id AND oi.variant_id = pv.id;
    INSERT INTO public.stock_movements (order_id, variant_id, change, reason)
    SELECT v_ret.order_id, oi.variant_id, oi.quantity, 'return_restore'
    FROM public.order_items oi WHERE oi.order_id = v_ret.order_id AND oi.variant_id IS NOT NULL;
    v_restored := true;
  END IF;
  RETURN jsonb_build_object('ok', true, 'stock_restored', v_restored);
END;
$$;
REVOKE ALL ON FUNCTION public.restore_returned_stock(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_returned_stock(uuid) TO service_role;