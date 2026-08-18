-- Add tracking_token column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_token UUID DEFAULT gen_random_uuid();

-- Backfill existing orders with a token if null (though DEFAULT handles new, existing might need it)
UPDATE public.orders SET tracking_token = gen_random_uuid() WHERE tracking_token IS NULL;

-- Ensure it is NOT publically readable via Data API by not modifying any SELECT policies for non-admins
-- (Existing policies already restrict SELECT on orders to admins only)
