import { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Vestido Serenata",
    description:
      "Vestido midi em crepe italiano com decote V elegante e caimento impecável. Ideal para ocasiões especiais.",
    price: 890,
    image_url:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85",
    category: "Vestidos",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Blazer Autoral",
    description:
      "Blazer estruturado em lã premium com lapela refinada. Peça versátil para look executivo ou casual chic.",
    price: 1240,
    image_url:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85",
    category: "Blazers",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Conjunto Palazzo",
    description:
      "Conjunto calça palazzo e blusa em seda natural. Silhueta fluida com toque de sofisticação contemporânea.",
    price: 1560,
    image_url:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=85",
    category: "Conjuntos",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Saia Estruturada",
    description:
      "Saia midi com pregas frontais e cós alto. Acabamento artesanal em tecido jacquard exclusivo.",
    price: 680,
    image_url:
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=900&q=85",
    category: "Saias",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Trench Coat Clássico",
    description:
      "Trench coat em gabardine de algodão com forro em seda. Corte sob medida para silhueta perfeita.",
    price: 2100,
    image_url:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=85",
    category: "Casacos",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Blusa Romântica",
    description:
      "Blusa com mangas amplas em chiffon acetinado. Detalhes de laço no decote para um toque editorial.",
    price: 420,
    image_url:
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&q=85",
    category: "Blusas",
    created_at: new Date().toISOString(),
  },
];
