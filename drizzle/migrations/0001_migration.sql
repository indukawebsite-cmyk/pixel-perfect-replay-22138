CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.customers (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NULLIF(left(trim(NEW.raw_user_meta_data->>'full_name'), 100), ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_customer() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

-- Customers may edit name/phone only; email and user_id stay authoritative
REVOKE UPDATE ON public.customers FROM authenticated;
GRANT UPDATE (full_name, phone) ON public.customers TO authenticated;
REVOKE INSERT ON public.customers FROM authenticated;
DROP POLICY "Customers create own profile" ON public.customers;