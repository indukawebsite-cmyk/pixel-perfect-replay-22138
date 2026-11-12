CREATE OR REPLACE FUNCTION public.complete_order_coupon() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.coupon_code IS NOT NULL AND NEW.stock_deducted AND NOT OLD.stock_deducted THEN
  IF NEW.coupon_payment_method = 'razorpay' AND NOT EXISTS (SELECT 1 FROM public.payments WHERE order_id = NEW.id AND status = 'captured') THEN
   RAISE EXCEPTION 'COUPON_PAYMENT_NOT_CONFIRMED';
  END IF;
  UPDATE public.coupon_redemptions SET redeemed_at = now() WHERE order_id = NEW.id AND customer_id = NEW.customer_id AND coupon_code = NEW.coupon_code AND redeemed_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'COUPON_RESERVATION_MISSING'; END IF;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_order_coupon() FROM PUBLIC, anon, authenticated;