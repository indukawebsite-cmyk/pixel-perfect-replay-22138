CREATE POLICY "Read banners of active collections" ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'product-images'
  AND split_part(name, '/', 1) = 'collections'
  AND EXISTS (SELECT 1 FROM public.collections c WHERE c.is_active AND c.slug = split_part(name, '/', 2))
);