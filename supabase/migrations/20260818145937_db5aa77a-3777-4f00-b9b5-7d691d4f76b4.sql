DROP POLICY IF EXISTS "Anyone can read fotos storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload fotos" ON storage.objects;

CREATE POLICY "Admins can read fotos pedidos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fotos-pedidos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload fotos pedidos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'fotos-pedidos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fotos pedidos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'fotos-pedidos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fotos pedidos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'fotos-pedidos' AND public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.generate_pedido_code() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_recebimento_code() FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.generate_pedido_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_recebimento_code() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;