
-- Add Mercado Pago columns to orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS mp_payment_id text,
  ADD COLUMN IF NOT EXISTS mp_external_reference text;

-- Create payment_logs table
CREATE TABLE public.payment_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id),
  provider text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payment logs" ON public.payment_logs FOR SELECT USING (true);
CREATE POLICY "Service role can insert payment logs" ON public.payment_logs FOR INSERT WITH CHECK (true);
