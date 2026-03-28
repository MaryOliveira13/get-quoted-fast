
-- New columns for recebimentos
ALTER TABLE public.recebimentos
  ADD COLUMN IF NOT EXISTS pedido_code text,
  ADD COLUMN IF NOT EXISTS problema text,
  ADD COLUMN IF NOT EXISTS condicao_estetica jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS acessorios_entregues jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS valor_orcamento numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS prazo_dias integer;

-- New columns for envios
ALTER TABLE public.envios
  ADD COLUMN IF NOT EXISTS recebimento_id uuid REFERENCES public.recebimentos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS servico text,
  ADD COLUMN IF NOT EXISTS valor_cobrado numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forma_pagamento text,
  ADD COLUMN IF NOT EXISTS endereco_entrega text;

-- Function to generate recebimento code PC-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_recebimento_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_seq int;
  new_code text;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(pedido_code FROM 'PC-(\d+)') AS int)
  ), 0) + 1
  INTO next_seq
  FROM public.recebimentos
  WHERE pedido_code IS NOT NULL;
  
  new_code := 'PC-' || LPAD(next_seq::text, 6, '0');
  RETURN new_code;
END;
$$;
