export type OrderStatus = "Em análise" | "Em produção" | "Finalizado";

export const ORDER_STATUSES: OrderStatus[] = [
  "Em análise",
  "Em produção",
  "Finalizado",
];

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

export interface Measurements {
  busto: number;
  cintura: number;
  quadril: number;
  ombros: number;
  bracos: number;
  coxas: number;
  costas: number;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  measurements: Measurements;
  front_image_url: string | null;
  back_image_url: string | null;
  status: OrderStatus;
  created_at: string;
  products?: Product | null;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface CreateOrderInput {
  user_id: string;
  product_id: string;
  measurements: Measurements;
  front_image_url: string | null;
  back_image_url: string | null;
}
