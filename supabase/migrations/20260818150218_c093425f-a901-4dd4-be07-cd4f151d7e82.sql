ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_token UUID DEFAULT gen_random_uuid();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT INSERT ON public.orders TO anon;

-- The user mentioned RLS was restrictive. Let's ensure order-create (service_role) can bypass.
-- RLS is already enabled. Policies:
-- "Admins can manage all orders" (authenticated + admin role)
-- We need a policy for anonymous insertion if we want to allow it, 
-- BUT order-create uses service_role which bypasses RLS.
-- However, the code in order-create/index.ts is missing the Supabase client initialization!
