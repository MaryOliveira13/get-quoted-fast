
-- Tabela pedidos
CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text,
  nome text,
  cpf text,
  telefone text,
  email text,
  cep text,
  rua text,
  bairro text,
  cidade text,
  uf text,
  marca text,
  modelo text,
  servico text,
  valor numeric DEFAULT 0,
  acessorios text,
  problema text,
  frete_nome text,
  frete_valor numeric DEFAULT 0,
  status text DEFAULT 'pendente',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pedidos" ON public.pedidos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read pedidos" ON public.pedidos FOR SELECT TO public USING (true);

-- Tabela fotos_pedido
CREATE TABLE public.fotos_pedido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.fotos_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert fotos" ON public.fotos_pedido FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read fotos" ON public.fotos_pedido FOR SELECT TO public USING (true);

-- Bucket de storage público para fotos
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos-pedidos', 'fotos-pedidos', true);

-- RLS para upload público no bucket
CREATE POLICY "Anyone can upload fotos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'fotos-pedidos');
CREATE POLICY "Anyone can read fotos storage" ON storage.objects FOR SELECT TO public USING (bucket_id = 'fotos-pedidos');
