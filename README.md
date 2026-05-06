# Única — Moda Sob Medida

Aplicativo de roupas sob medida com catálogo, formulário de medidas, escaneamento simulado e dashboard de pedidos.

---

## Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Estilo:** TailwindCSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Deploy:** Vercel
- **Fontes:** Cormorant Garamond + Jost (Google Fonts)

---

## Estrutura do Projeto

```
unica/
├── src/
│   ├── app/
│   │   ├── auth/page.tsx          # Login / Cadastro
│   │   ├── catalog/               # Lista de produtos
│   │   ├── product/[id]/          # Detalhes do produto
│   │   ├── scan/page.tsx          # Medidas + Fotos + Análise + Resumo
│   │   ├── dashboard/page.tsx     # Meus pedidos
│   │   ├── api/auth/callback/     # Callback OAuth Supabase
│   │   ├── layout.tsx             # Root layout (fontes)
│   │   └── globals.css            # Estilos globais
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   └── ui/
│   │       ├── ProductCard.tsx
│   │       └── StatusBadge.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   └── server.ts          # Server client
│   │   └── products.ts            # Produtos mockados
│   ├── types/index.ts
│   └── middleware.ts              # Auth guard global
├── supabase/
│   └── schema.sql                 # SQL completo
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Defina nome, senha do banco e região (prefira `South America (São Paulo)`)
4. Aguarde o projeto inicializar (~2 min)

---

## 2. Executar o SQL

1. No Supabase, vá em **SQL Editor** → **New Query**
2. Cole todo o conteúdo de `supabase/schema.sql`
3. Clique em **Run**

Isso cria:
- `profiles` — extensão do auth.users
- `products` — catálogo (com 6 produtos de exemplo)
- `orders` — pedidos com medidas em JSONB
- `measurements` — tabela normalizada de medidas (opcional)
- Trigger para auto-criar profile no cadastro
- Políticas RLS em todas as tabelas

---

## 3. Configurar Storage

1. No Supabase, vá em **Storage** → **New Bucket**
2. Nome: `body-photos`
3. **Public bucket:** ✅ Ativado (para URLs públicas das fotos)
4. Clique em **Create Bucket**

Política de Storage (cole no SQL Editor):
```sql
-- Permitir upload autenticado
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Leitura pública
CREATE POLICY "Public read body photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'body-photos');
```

---

## 4. Variáveis de Ambiente

1. No Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Crie o arquivo `.env.local` na raiz do projeto:
```bash
cp .env.local.example .env.local
```

4. Preencha com suas chaves:
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

---

## 5. Rodar Localmente

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

O app redireciona para `/auth`. Crie uma conta e explore.

---

## 6. Subir no GitHub

```bash
git init
git add .
git commit -m "feat: Única app - moda sob medida"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/unica.git
git push -u origin main
```

---

## 7. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e conecte com GitHub
2. Clique em **New Project** → selecione o repositório `unica`
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

A Vercel detecta Next.js automaticamente. Nenhuma config adicional necessária.

---

## Fluxo do App

```
/auth → Login/Cadastro
  ↓
/catalog → Grade de produtos
  ↓
/product/[id] → Detalhes + botão "Escolher este look"
  ↓
/scan?product=[id]
  ├── Step 1: Formulário de medidas (7 campos em cm)
  ├── Step 2: Upload fotos (frente + costas)
  ├── Step 3: Análise simulada (loading animado)
  └── Step 4: Resumo + Confirmar pedido → salva no Supabase
  ↓
/dashboard → Lista de pedidos com status + medidas + fotos
```

---

## Observações

- **Produtos mockados** em `src/lib/products.ts`. O catálogo usa esses dados diretamente. Os mesmos produtos estão no SQL como INSERT de exemplo no banco.
- **`product_id` nos pedidos** é uma string (ex: `"1"`) correspondente ao ID mockado. Se quiser usar UUIDs reais do banco, altere `mockProducts` para usar os UUIDs gerados pelo Supabase.
- **Auth Supabase:** email/senha por padrão. Para ativar confirmação de e-mail, vá em Supabase → Authentication → Email → Enable email confirmations.
- **Storage público:** bucket `body-photos` deve ser público para exibir as fotos no dashboard. Se quiser privado, use URLs assinadas.
