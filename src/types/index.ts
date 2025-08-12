export interface Product {
  id: number;
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
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  address: string;
  status: 'preparing' | 'delivering' | 'delivered';
  timestamp: Date;
  estimatedTime: string;
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