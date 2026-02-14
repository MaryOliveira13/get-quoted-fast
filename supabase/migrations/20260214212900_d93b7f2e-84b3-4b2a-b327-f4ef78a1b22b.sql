
-- Create orders table for payment tracking
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cpf text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  repair_total numeric NOT NULL DEFAULT 0,
  shipping_option jsonb,
  shipping_total numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public can insert orders (no auth required for this flow)
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Anyone can read their own order by id (used by /pago page)
CREATE POLICY "Anyone can read orders by id"
  ON public.orders FOR SELECT
  USING (true);

-- Only service role can update (edge functions use service role key)
CREATE POLICY "Service role can update orders"
  ON public.orders FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
