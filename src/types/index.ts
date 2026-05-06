export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
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
  status: "Em análise" | "Em produção" | "Finalizado";
  created_at: string;
  products?: Product;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}
