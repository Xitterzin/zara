-- =============================================================
-- UNIQUE - SQL base para Supabase
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  USING (true);

-- 3. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  measurements JSONB NOT NULL DEFAULT '{}',
  front_image_url TEXT,
  back_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Em análise'
    CHECK (status IN ('Em análise', 'Em produção', 'Finalizado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Optional normalized measurements table
CREATE TABLE IF NOT EXISTS public.measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  busto NUMERIC(5,1),
  cintura NUMERIC(5,1),
  quadril NUMERIC(5,1),
  ombros NUMERIC(5,1),
  bracos NUMERIC(5,1),
  coxas NUMERIC(5,1),
  costas NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own measurements" ON public.measurements;
CREATE POLICY "Users can view own measurements"
  ON public.measurements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = measurements.order_id
        AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own measurements" ON public.measurements;
CREATE POLICY "Users can insert own measurements"
  ON public.measurements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = measurements.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- 5. Seed products with deterministic UUIDs used by the local fallback
INSERT INTO public.products (id, name, description, price, image_url, category) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Vestido Serenata',
  'Vestido midi em crepe italiano com decote V elegante e caimento impecável. Ideal para ocasiões especiais.',
  890.00,
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85',
  'Vestidos'
),
(
  '00000000-0000-0000-0000-000000000002',
  'Blazer Autoral',
  'Blazer estruturado em lã premium com lapela refinada. Peça versátil para look executivo ou casual chic.',
  1240.00,
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85',
  'Blazers'
),
(
  '00000000-0000-0000-0000-000000000003',
  'Conjunto Palazzo',
  'Conjunto calça palazzo e blusa em seda natural. Silhueta fluida com toque de sofisticação contemporânea.',
  1560.00,
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=85',
  'Conjuntos'
),
(
  '00000000-0000-0000-0000-000000000004',
  'Saia Estruturada',
  'Saia midi com pregas frontais e cós alto. Acabamento artesanal em tecido jacquard exclusivo.',
  680.00,
  'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=900&q=85',
  'Saias'
),
(
  '00000000-0000-0000-0000-000000000005',
  'Trench Coat Clássico',
  'Trench coat em gabardine de algodão com forro em seda. Corte sob medida para silhueta perfeita.',
  2100.00,
  'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=85',
  'Casacos'
),
(
  '00000000-0000-0000-0000-000000000006',
  'Blusa Romântica',
  'Blusa com mangas amplas em chiffon acetinado. Detalhes de laço no decote para um toque editorial.',
  420.00,
  'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&q=85',
  'Blusas'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category;
