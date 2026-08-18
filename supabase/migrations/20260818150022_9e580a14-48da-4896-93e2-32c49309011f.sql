CREATE OR REPLACE FUNCTION public.generate_recebimento_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_seq int;
  new_code text;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(pedido_code FROM 'PC-(\d+)') AS int)
  ), 0) + 1
  INTO next_seq
  FROM public.recebimentos
  WHERE pedido_code IS NOT NULL;

  new_code := 'PC-' || LPAD(next_seq::text, 6, '0');
  RETURN new_code;
END;
$function$;

REVOKE ALL ON FUNCTION public.generate_recebimento_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_recebimento_code() TO authenticated, service_role;