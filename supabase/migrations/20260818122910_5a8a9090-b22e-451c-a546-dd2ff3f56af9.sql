-- 1. Create robust has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  );
$$;

-- 2. Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can read orders by id" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read payment logs" ON public.payment_logs;
DROP POLICY IF EXISTS "Service role can insert payment logs" ON public.payment_logs;
DROP POLICY IF EXISTS "Anyone can update pedidos status" ON public.pedidos;
DROP POLICY IF EXISTS "Anyone can read pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Anyone can insert pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Anyone can read fotos" ON public.fotos_pedido;
DROP POLICY IF EXISTS "Anyone can insert fotos" ON public.fotos_pedido;

-- 3. ORDERS table security
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. PEDIDOS table security
CREATE POLICY "Admins can manage all pedidos" ON public.pedidos
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. PAYMENT_LOGS table security
CREATE POLICY "Admins can read all payment logs" ON public.payment_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. FOTOS_PEDIDO table security
CREATE POLICY "Admins can manage all fotos" ON public.fotos_pedido
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Ensure proper grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fotos_pedido TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.pedidos TO service_role;
GRANT ALL ON public.payment_logs TO service_role;
GRANT ALL ON public.fotos_pedido TO service_role;
