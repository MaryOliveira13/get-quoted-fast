
-- Add asaas_customer_id to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asaas_customer_id text;

-- Add comment for clarity
COMMENT ON COLUMN public.orders.asaas_customer_id IS 'ID do cliente no Asaas para este pedido específico';
