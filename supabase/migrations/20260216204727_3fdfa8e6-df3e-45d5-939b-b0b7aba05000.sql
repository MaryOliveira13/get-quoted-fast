
-- Alter orders table for freight-only payment flow
-- Rename repair_total to repair_estimate_total
ALTER TABLE public.orders RENAME COLUMN repair_total TO repair_estimate_total;

-- Rename shipping_total to shipping_amount
ALTER TABLE public.orders RENAME COLUMN shipping_total TO shipping_amount;

-- Rename payment_status to shipping_payment_status
ALTER TABLE public.orders RENAME COLUMN payment_status TO shipping_payment_status;

-- Rename mp_payment_id to payment_id
ALTER TABLE public.orders RENAME COLUMN mp_payment_id TO payment_id;

-- Drop mp_preference_id (no longer needed)
ALTER TABLE public.orders DROP COLUMN IF EXISTS mp_preference_id;

-- Drop total_amount (no longer relevant in freight-only flow)
ALTER TABLE public.orders DROP COLUMN IF EXISTS total_amount;

-- Add new columns for Asaas + Melhor Envio label tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'asaas';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS label_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS melhor_envio_shipment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS label_url text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_code text;

-- Add customer address columns for label generation
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_cep text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_street text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_complement text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_district text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_city text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_uf text;
