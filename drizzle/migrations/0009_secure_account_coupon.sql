CREATE TABLE public.coupons (
 code text PRIMARY KEY,
 discount_percent integer NOT NULL DEFAULT 20 CHECK (discount_percent > 0 AND discount_percent <= 100),
 is_active boolean NOT NULL DEFAULT true,
 CONSTRAINT family_coupon_only CHECK (code = 'FAMILYFIRST')
);
GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated coupon reads" ON public.coupons FOR SELECT TO authenticated USING (true);
ALTER TABLE public.orders ADD COLUMN coupon_code text REFERENCES public.coupons(code);
ALTER TABLE public.orders ADD COLUMN coupon_payment_method text;
CREATE TABLE public.coupon_redemptions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 coupon_code text NOT NULL REFERENCES public.coupons(code),
 customer_id uuid NOT NULL REFERENCES public.customers(id),
 order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id),
 reserved_at timestamptz NOT NULL DEFAULT now(),
 redeemed_at timestamptz,
 UNIQUE (coupon_code, customer_id)
);
GRANT SELECT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin coupon history" ON public.coupon_redemptions FOR SELECT TO authenticated USING (public.owns_order(order_id) OR public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.reserve_order_coupon() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_percent integer;
BEGIN
 IF NEW.coupon_code IS NULL THEN RETURN NEW; END IF;
 SELECT discount_percent INTO v_percent FROM public.coupons WHERE code = NEW.coupon_code AND is_active;
 IF NOT FOUND OR NEW.coupon_payment_method NOT IN ('cod','razorpay') OR NEW.coupon_payment_method IS NULL THEN RAISE EXCEPTION 'INVALID_COUPON'; END IF;
 IF NEW.discount <> round(NEW.subtotal * v_percent / 100, 2) OR NEW.total <> NEW.subtotal - NEW.discount + NEW.shipping THEN RAISE EXCEPTION 'INVALID_COUPON_TOTAL'; END IF;
 INSERT INTO public.coupon_redemptions(coupon_code, customer_id, order_id) VALUES (NEW.coupon_code, NEW.customer_id, NEW.id);
 RETURN NEW;
END;
$$;
CREATE TRIGGER reserve_coupon_after_order AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.reserve_order_coupon();
CREATE OR REPLACE FUNCTION public.complete_order_coupon() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.coupon_code IS NOT NULL AND NEW.stock_deducted AND NOT OLD.stock_deducted THEN
  UPDATE public.coupon_redemptions SET redeemed_at = now() WHERE order_id = NEW.id AND customer_id = NEW.customer_id AND coupon_code = NEW.coupon_code AND redeemed_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'COUPON_RESERVATION_MISSING'; END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER complete_coupon_after_finalization AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.complete_order_coupon();
REVOKE ALL ON FUNCTION public.reserve_order_coupon() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_order_coupon() FROM PUBLIC, anon, authenticated;