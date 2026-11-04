DROP POLICY IF EXISTS "Public reads product images" ON storage.objects;
CREATE POLICY "Read images of active products" ON storage.objects FOR SELECT TO anon, authenticated USING (
  bucket_id = 'product-images' AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.products p WHERE p.is_active AND p.sku = split_part(storage.objects.name, '/', 1))
  )
);