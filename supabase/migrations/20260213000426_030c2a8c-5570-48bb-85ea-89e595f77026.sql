
-- Table to store Melhor Envio OAuth tokens (single-row, admin-only)
CREATE TABLE public.melhor_envio_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.melhor_envio_tokens ENABLE ROW LEVEL SECURITY;

-- No public access - only service_role (edge functions) can read/write
-- No RLS policies = blocked for anon/authenticated by default

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_melhor_envio_tokens_updated_at
  BEFORE UPDATE ON public.melhor_envio_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
