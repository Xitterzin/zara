import { mockProducts } from "@/lib/products";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Product } from "@/types";

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: Number(product.price),
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return mockProducts;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data?.length) return mockProducts;
  return (data as Product[]).map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!hasSupabaseEnv()) {
    return mockProducts.find((product) => product.id === id) ?? null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return mockProducts.find((product) => product.id === id) ?? null;
  }

  return normalizeProduct(data as Product);
}
