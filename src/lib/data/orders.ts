import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreateOrderInput, Order } from "@/types";

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((order) => ({
    ...order,
    products: order.products
      ? { ...order.products, price: Number(order.products.price) }
      : null,
  })) as Order[];
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createServerSupabaseClient();
  return supabase.from("orders").insert({
    ...input,
    status: "Em análise",
  });
}
