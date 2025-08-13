export interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  description: string | null;
  brand: string | null;
  rating: number | null;
  reviews: number | null;
  promotion: string | null;
  featured: boolean | null;
  created_at: string;
  depot_id?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  address: string;
  status: 'preparing' | 'delivering' | 'delivered';
  payment_method: 'pix' | 'card' | 'money';
  change_for?: string | null;
  created_at: string;
  estimated_time: string;
  depot_id?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'support';
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
  role?: 'user' | 'admin' | 'depot_manager';
  depot_id?: string | null;
}

export interface Favorite {
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface AppSettings {
  free_shipping_threshold: number;
  free_shipping_banner_text: string;
}

export interface Depot {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  name: string;
  address: string;
  is_default: boolean;
  created_at: string;
}