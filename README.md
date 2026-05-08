# UNIQUE - Uma extensão da Zara

Protótipo acadêmico de moda sob medida com estética editorial de luxo, catálogo,
medidas corporais, upload de fotos, escaneamento simulado e acompanhamento de
pedidos.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- TailwindCSS
- Framer Motion
- Supabase Auth, PostgreSQL e Storage

## Fluxo

1. Usuário cria conta ou faz login em `/auth`.
2. Navega pelo catálogo em `/catalog`.
3. Escolhe uma peça em `/product/[id]`.
4. Informa medidas e envia fotos em `/scan`.
5. O app exibe uma análise corporal simulada.
6. O pedido fictício é salvo no Supabase.
7. O dashboard `/dashboard` exibe status, medidas e imagens.

## Configuração

Crie `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

Execute `supabase/schema.sql` no SQL Editor do Supabase.

Crie o bucket `body-photos` no Supabase Storage. Para o protótipo atual, o app
usa URL pública; se o bucket for privado, adapte para signed URLs.

Política sugerida de upload:

```sql
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read body photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'body-photos');
```

## Rodar localmente

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```
