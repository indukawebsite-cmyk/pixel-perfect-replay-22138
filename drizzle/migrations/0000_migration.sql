-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Enums
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','processing','shipped','delivered','cancelled','refunded');
CREATE TYPE public.payment_status AS ENUM ('created','authorized','captured','failed','refunded');
CREATE TYPE public.shipment_status AS ENUM ('pending','created','pickup_scheduled','in_transit','out_for_delivery','delivered','returned','cancelled');

-- Collections
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX collections_active_idx ON public.collections (is_active);

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  description text,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(12,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  sku text UNIQUE,
  material text,
  purity text,
  category text NOT NULL CHECK (category IN ('earrings','rings','necklaces','bracelets')),
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_active_idx ON public.products (is_active);
CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_collection_idx ON public.products (collection_id);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text,
  colour text,
  sku text UNIQUE,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_variants_product_idx ON public.product_variants (product_id);

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images (product_id, display_order);

-- Customers
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  shipping_name text NOT NULL,
  shipping_phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pin_code text NOT NULL CHECK (pin_code ~ '^[1-9][0-9]{5}$'),
  country text NOT NULL DEFAULT 'India',
  subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  discount numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping numeric(12,2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  total numeric(12,2) NOT NULL CHECK (total >= 0),
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_idx ON public.orders (customer_id, created_at DESC);
CREATE INDEX orders_status_idx ON public.orders (status);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  purchase_price numeric(12,2) NOT NULL CHECK (purchase_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items (order_id);
CREATE INDEX order_items_product_idx ON public.order_items (product_id);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON public.payments (order_id);

CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id text UNIQUE,
  awb_code text,
  courier_name text,
  tracking_url text,
  status public.shipment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX shipments_order_idx ON public.shipments (order_id);
CREATE INDEX shipments_awb_idx ON public.shipments (awb_code);

-- updated_at triggers
CREATE TRIGGER t_collections BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_variants BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_shipments BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ownership helper
CREATE OR REPLACE FUNCTION public.owns_order(_order_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders o JOIN public.customers c ON c.id = o.customer_id
                 WHERE o.id = _order_id AND c.user_id = auth.uid())
$$;

-- Grants
GRANT SELECT ON public.collections, public.products, public.product_variants, public.product_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.collections, public.products, public.product_variants, public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT SELECT ON public.orders, public.order_items, public.payments, public.shipments TO authenticated;
GRANT ALL ON public.collections, public.products, public.product_variants, public.product_images,
  public.customers, public.orders, public.order_items, public.payments, public.shipments TO service_role;

-- RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active collections" ON public.collections FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public reads active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public reads variants of active products" ON public.product_variants FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage variants" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public reads images of active products" ON public.product_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Customers read own profile" ON public.customers FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Customers create own profile" ON public.customers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Customers update own profile" ON public.customers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Customers read own orders" ON public.orders FOR SELECT TO authenticated USING (public.owns_order(id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Customers read own order items" ON public.order_items FOR SELECT TO authenticated USING (public.owns_order(order_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Customers read own payments" ON public.payments FOR SELECT TO authenticated USING (public.owns_order(order_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Customers read own shipments" ON public.shipments FOR SELECT TO authenticated USING (public.owns_order(order_id) OR public.has_role(auth.uid(),'admin'));
