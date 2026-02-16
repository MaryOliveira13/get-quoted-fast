
-- Add PayPal columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paypal_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paypal_capture_id text;

-- Rename shipping_payment_status -> freight_payment_status
ALTER TABLE public.orders RENAME COLUMN shipping_payment_status TO freight_payment_status;

-- Update default payment_provider from 'asaas' to 'paypal'
ALTER TABLE public.orders ALTER COLUMN payment_provider SET DEFAULT 'paypal';

-- Add update trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
