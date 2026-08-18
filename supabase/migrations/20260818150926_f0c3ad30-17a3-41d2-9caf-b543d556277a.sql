GRANT ALL ON public.orders TO service_role;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT ON public.orders TO anon;
-- Also ensure the service_role can actually bypass RLS if needed, 
-- though it usually does. If RLS is on and no policy exists for service_role, 
-- some environments might still restrict it if not using the right client.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can do everything" ON public.orders;
CREATE POLICY "Service role can do everything" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
