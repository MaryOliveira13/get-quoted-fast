
CREATE OR REPLACE FUNCTION public.generate_pedido_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year text;
  next_seq int;
  new_code text;
BEGIN
  current_year := to_char(now(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(codigo FROM 'PC-' || current_year || '-(\d+)') AS int)
  ), 0) + 1
  INTO next_seq
  FROM public.pedidos
  WHERE codigo LIKE 'PC-' || current_year || '-%';
  
  new_code := 'PC-' || current_year || '-' || LPAD(next_seq::text, 4, '0');
  RETURN new_code;
END;
$$;
