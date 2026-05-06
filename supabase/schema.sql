-- =============================================================
-- ÚNICA — SQL COMPLETO PARA SUPABASE
-- Cole este SQL no Supabase > SQL Editor > New Query > Run
-- =============================================================

-- 1. EXTENSÃO UUID (já ativa no Supabase por padrão)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 2. TABELA: profiles (extensão do auth.users do Supabase)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-criar profile ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- 3. TABELA: products
-- =============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  image_url   TEXT,
  category    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  USING (true);

-- =============================================================
-- 4. TABELA: orders
-- =============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id       UUID,  -- referência lógica (produto mockado no frontend)
  measurements     JSONB NOT NULL DEFAULT '{}',
  front_image_url  TEXT,
  back_image_url   TEXT,
  status           TEXT NOT NULL DEFAULT 'Em análise'
                   CHECK (status IN ('Em análise', 'Em produção', 'Finalizado')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================
-- 5. TABELA: measurements (tabela dedicada — opcional)
--    O projeto usa JSONB em orders, mas caso queira normalizar:
-- =============================================================
CREATE TABLE IF NOT EXISTS public.measurements (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  busto      NUMERIC(5,1),
  cintura    NUMERIC(5,1),
  quadril    NUMERIC(5,1),
  ombros     NUMERIC(5,1),
  bracos     NUMERIC(5,1),
  coxas      NUMERIC(5,1),
  costas     NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own measurements"
  ON public.measurements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = measurements.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own measurements"
  ON public.measurements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = measurements.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- =============================================================
-- 6. INSERTS DE EXEMPLO — products
-- =============================================================
INSERT INTO public.products (name, description, price, image_url, category) VALUES
(
  'Vestido Serenata',
  'Vestido midi em crepe italiano com decote V elegante e caimento impecável. Ideal para ocasiões especiais.',
  890.00,
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
  'Vestidos'
),
(
  'Blazer Autoral',
  'Blazer estruturado em lã premium com lapela refinada. Peça versátil para look executivo ou casual chic.',
  1240.00,
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
  'Blazers'
),
(
  'Conjunto Palazzo',
  'Conjunto calça palazzo e blusa em seda natural. Silhueta fluida com toque de sofisticação contemporânea.',
  1560.00,
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
  'Conjuntos'
),
(
  'Saia Estruturada',
  'Saia midi com pregas frontais e cós alto. Acabamento artesanal em tecido jacquard exclusivo.',
  680.00,
  'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80',
  'Saias'
),
(
  'Trench Coat Clássico',
  'Trench coat em gabardine de algodão com forro em seda. Corte sob medida para silhueta perfeita.',
  2100.00,
  'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80',
  'Casacos'
),
(
  'Blusa Romântica',
  'Blusa com mangas amplas em chiffon acetinado. Detalhes de laço no decote para um toque editorial.',
  420.00,
  'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80',
  'Blusas'
);

-- =============================================================
-- FIM DO SQL
-- =============================================================
