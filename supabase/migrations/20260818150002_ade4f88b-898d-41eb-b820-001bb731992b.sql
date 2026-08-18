REVOKE ALL ON FUNCTION public.generate_pedido_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_recebimento_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_pedido_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_recebimento_code() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;