-- BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- DEVICE MODELS
CREATE TABLE IF NOT EXISTS public.device_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, slug)
);
GRANT SELECT ON public.device_models TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_models TO authenticated;
GRANT ALL ON public.device_models TO service_role;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;

-- REPAIR SERVICES
CREATE TABLE IF NOT EXISTS public.repair_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.repair_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_services TO authenticated;
GRANT ALL ON public.repair_services TO service_role;
ALTER TABLE public.repair_services ENABLE ROW LEVEL SECURITY;

-- REPAIR PRICES
CREATE TABLE IF NOT EXISTS public.repair_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_model_id uuid NOT NULL REFERENCES public.device_models(id) ON DELETE CASCADE,
  repair_service_id uuid NOT NULL REFERENCES public.repair_services(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_model_id, repair_service_id)
);
GRANT SELECT ON public.repair_prices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_prices TO authenticated;
GRANT ALL ON public.repair_prices TO service_role;
ALTER TABLE public.repair_prices ENABLE ROW LEVEL SECURITY;

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  admin_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  data_before jsonb,
  data_after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- INDEXES
CREATE INDEX IF NOT EXISTS brands_name_idx ON public.brands (lower(name));
CREATE INDEX IF NOT EXISTS brands_active_idx ON public.brands (active);
CREATE INDEX IF NOT EXISTS device_models_brand_idx ON public.device_models (brand_id);
CREATE INDEX IF NOT EXISTS device_models_name_idx ON public.device_models (lower(name));
CREATE INDEX IF NOT EXISTS device_models_active_idx ON public.device_models (active);
CREATE INDEX IF NOT EXISTS repair_services_name_idx ON public.repair_services (lower(name));
CREATE INDEX IF NOT EXISTS repair_prices_model_idx ON public.repair_prices (device_model_id);
CREATE INDEX IF NOT EXISTS repair_prices_service_idx ON public.repair_prices (repair_service_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_idx ON public.admin_audit_logs (created_at DESC);

-- TRIGGERS updated_at
DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_device_models_updated_at ON public.device_models;
CREATE TRIGGER update_device_models_updated_at BEFORE UPDATE ON public.device_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_repair_services_updated_at ON public.repair_services;
CREATE TRIGGER update_repair_services_updated_at BEFORE UPDATE ON public.repair_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_repair_prices_updated_at ON public.repair_prices;
CREATE TRIGGER update_repair_prices_updated_at BEFORE UPDATE ON public.repair_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POLICIES: public read of active rows
DROP POLICY IF EXISTS "Public can read active brands" ON public.brands;
CREATE POLICY "Public can read active brands" ON public.brands
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admins manage brands" ON public.brands;
CREATE POLICY "Admins manage brands" ON public.brands
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public can read active device_models" ON public.device_models;
CREATE POLICY "Public can read active device_models" ON public.device_models
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admins manage device_models" ON public.device_models;
CREATE POLICY "Admins manage device_models" ON public.device_models
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public can read active repair_services" ON public.repair_services;
CREATE POLICY "Public can read active repair_services" ON public.repair_services
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admins manage repair_services" ON public.repair_services;
CREATE POLICY "Admins manage repair_services" ON public.repair_services
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public can read active repair_prices" ON public.repair_prices;
CREATE POLICY "Public can read active repair_prices" ON public.repair_prices
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "Admins manage repair_prices" ON public.repair_prices;
CREATE POLICY "Admins manage repair_prices" ON public.repair_prices
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins read audit logs" ON public.admin_audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins insert audit logs" ON public.admin_audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orcamentos: histórico imutável de itens/preços usados
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS device_model_id uuid REFERENCES public.device_models(id);
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS servicos_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb;