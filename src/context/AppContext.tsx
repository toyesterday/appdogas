import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, CartItem, Order, Notification, ChatMessage } from '@/types';
import { showSuccess } from '@/utils/toast';

interface AppContextType {
  cart: CartItem[];
  orders: Order[];
  favorites: string[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  userAddress: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  placeOrder: () => string | null;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setUserAddress: (address: string) => void;
  markNotificationAsRead: (id: number) => void;
  getUnreadNotificationCount: () => number;
  sendMessage: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  { id: 1, title: 'Pedido confirmado!', message: 'Seu gás será entregue em breve', time: '2 min', read: false },
  { id: 2, title: 'Promoção especial', message: 'Frete grátis hoje!', time: '1h', read: false }
];

const initialChatMessages: ChatMessage[] = [
  { id: 1, message: 'Olá! Como posso ajudar?', sender: 'support', time: new Date() }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userAddress, setUserAddress] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showSuccess(`${product.name} adicionado ao carrinho!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const placeOrder = () => {
    if (!userAddress) {
        return "Por favor, informe seu endereço para continuar.";
    }
    const total = getCartTotal();
    const deliveryFee = total >= 80 ? 0 : 8;
    const finalTotal = total + deliveryFee;

    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total: finalTotal,
      address: userAddress,
      status: 'preparing',
      timestamp: new Date(),
      estimatedTime: '45 min'
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    return null;
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getUnreadNotificationCount = () => notifications.filter(n => !n.read).length;

  const sendMessage = (message: string) => {
    const newMessage: ChatMessage = { id: Date.now(), message, sender: 'user', time: new Date() };
    setChatMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
      const responses = [
        'Obrigado pela mensagem! Em breve um atendente entrará em contato.',
        'Estamos verificando sua solicitação. Aguarde um momento.',
        'Sua mensagem foi recebida. Nossa equipe já está cuidando do seu caso.'
      ];
      const autoResponse: ChatMessage = {
        id: Date.now() + 1,
        message: responses[Math.floor(Math.random() * responses.length)],
        sender: 'support',
        time: new Date()
      };
      setChatMessages(prev => [...prev, autoResponse]);
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.status === 'preparing' && Math.random() > 0.8) {
          return { ...order, status: 'delivering' };
        }
        if (order.status === 'delivering' && Math.random() > 0.9) {
          return { ...order, status: 'delivered' };
        }
        return order;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    cart,
    orders,
    favorites,
    notifications,
    chatMessages,
    userAddress,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    toggleFavorite,
    isFavorite,
    setUserAddress,
    markNotificationAsRead,
    getUnreadNotificationCount,
    sendMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};