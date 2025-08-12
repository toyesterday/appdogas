export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  brand: string;
  rating: number;
  reviews: number;
  promotion?: string | null;
  featured?: boolean;
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
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'support';
  time: Date;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  address?: string;
  updated_at?: string;
}