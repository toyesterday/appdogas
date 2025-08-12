export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  description: string | null;
  brand: string | null;
  rating: number | null;
  reviews: number | null;
  promotion: string | null;
  featured: boolean | null;
  created_at: string;
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
  created_at: string;
  estimated_time: string;
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
  address?: string;
  updated_at?: string;
  role?: 'user' | 'admin';
}

export interface Favorite {
  user_id: string;
  product_id: string;
  created_at: string;
}