ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_external_reference text,
  ADD COLUMN IF NOT EXISTS payment_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_billing_type text,
  ADD COLUMN IF NOT EXISTS card_brand text,
  ADD COLUMN IF NOT EXISTS card_last4 text,
  ADD COLUMN IF NOT EXISTS payment_installments integer,
  ADD COLUMN IF NOT EXISTS payment_total_value numeric;