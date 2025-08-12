import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem, Order, Notification, ChatMessage, Profile } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

interface AppContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  cart: CartItem[];
  orders: Order[];
  favorites: string[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  placeOrder: () => Promise<string | null>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId:string) => boolean;
  updateProfile: (data: { address?: string; full_name?: string }) => Promise<void>;
  markNotificationAsRead: (id: number) => void;
  getUnreadNotificationCount: () => number;
  sendMessage: (message: string) => void;
  signOut: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  const fetchOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Não foi possível carregar seus pedidos.');
    } else {
      setOrders(data as Order[]);
    }
  };

  const fetchFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      showError('Não foi possível carregar seus favoritos.');
    } else {
      const favoriteIds = data.map(fav => fav.product_id);
      setFavorites(favoriteIds);
    }
  };

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        showError(error.message);
        setLoading(false);
        return;
      }
      
      setSession(session);
      if (session) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          showError(profileError.message);
        } else {
          setProfile(data);
        }
        await fetchOrders(session.user.id);
        await fetchFavorites(session.user.id);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN' && session) {
         await setData();
      }
      if (_event === 'SIGNED_OUT') {
        setProfile(null);
        setOrders([]);
        setFavorites([]);
      }
    });

    setData();

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (data: { address?: string; full_name?: string }) => {
    if (!session?.user) throw new Error('Usuário não logado');
    
    const updates = {
      id: session.user.id,
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      showError(error.message);
    } else {
      setProfile(prev => ({ ...prev!, ...updates }));
      showSuccess("Endereço salvo!");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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

  const placeOrder = async () => {
    if (!profile?.address) {
        return "Por favor, informe seu endereço para continuar.";
    }
    if (!session?.user) {
        return "Você precisa estar logado para fazer um pedido.";
    }
    const total = getCartTotal();
    const deliveryFee = total >= 80 ? 0 : 8;
    const finalTotal = total + deliveryFee;

    const newOrder = {
      user_id: session.user.id,
      items: cart,
      total: finalTotal,
      address: profile.address,
      status: 'preparing',
      estimated_time: '45 min'
    };

    const { error } = await supabase.from('orders').insert([newOrder]);

    if (error) {
      showError("Erro ao registrar o pedido.");
      return "Ocorreu um erro. Tente novamente.";
    }

    setCart([]);
    await fetchOrders(session.user.id);
    return null;
  };

  const toggleFavorite = async (productId: string) => {
    if (!session?.user) {
      showError('Você precisa estar logado para favoritar produtos.');
      return;
    }
  
    const isCurrentlyFavorite = favorites.includes(productId);
    
    if (isCurrentlyFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: session.user.id, product_id: productId });
  
      if (error) {
        showError('Não foi possível remover o favorito.');
      } else {
        setFavorites(prev => prev.filter(id => id !== productId));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: session.user.id, product_id: productId }]);
  
      if (error) {
        showError('Não foi possível adicionar o favorito.');
      } else {
        setFavorites(prev => [...prev, productId]);
      }
    }
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

  const value = {
    session,
    profile,
    loading,
    cart,
    orders,
    favorites,
    notifications,
    chatMessages,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    toggleFavorite,
    isFavorite,
    updateProfile,
    markNotificationAsRead,
    getUnreadNotificationCount,
    sendMessage,
    signOut,
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