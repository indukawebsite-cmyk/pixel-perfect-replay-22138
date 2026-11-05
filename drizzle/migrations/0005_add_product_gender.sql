ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('men','women','unisex'));
CREATE INDEX IF NOT EXISTS products_gender_idx ON public.products (gender);
COMMENT ON COLUMN public.products.gender IS 'Customer-facing shop: men, women, unisex (both). NULL = awaiting confirmation; never inferred.';