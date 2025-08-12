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
  markNotificationAsRead: (id: string) => Promise<void>;
  getUnreadNotificationCount: () => number;
  sendMessage: (message: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const fetchInitialData = async (userId: string) => {
    const [ordersRes, favoritesRes, chatMessagesRes, notificationsRes] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('favorites').select('product_id').eq('user_id', userId),
      supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    if (ordersRes.error) showError('Não foi possível carregar seus pedidos.');
    else setOrders(ordersRes.data as Order[]);

    if (favoritesRes.error) showError('Não foi possível carregar seus favoritos.');
    else setFavorites(favoritesRes.data.map(fav => fav.product_id));

    if (chatMessagesRes.error) showError('Não foi possível carregar o histórico de chat.');
    else setChatMessages(chatMessagesRes.data as ChatMessage[]);

    if (notificationsRes.error) showError('Não foi possível carregar as notificações.');
    else setNotifications(notificationsRes.data as Notification[]);
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
        
        if (profileError) showError(profileError.message);
        else setProfile(data);
        
        await fetchInitialData(session.user.id);
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
        setChatMessages([]);
        setNotifications([]);
      }
    });

    setData();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const notificationsChannel = supabase.channel(`notifications:${session.user.id}`)
      .on<Notification>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          showSuccess(payload.new.title);
        }
      )
      .subscribe();

    const ordersChannel = supabase.channel(`orders:${session.user.id}`)
      .on<Order>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
          showSuccess(`Seu pedido #${payload.new.id.slice(-6)} foi atualizado!`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [session]);

  const updateProfile = async (data: { address?: string; full_name?: string }) => {
    if (!session?.user) throw new Error('Usuário não logado');
    
    const updates = { id: session.user.id, ...data, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('profiles').upsert(updates).select().single();

    if (error) {
      showError(error.message);
    } else {
      setProfile(prev => ({ ...prev!, ...updates }));
      showSuccess("Perfil atualizado!");
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showSuccess(`${product.name} adicionado ao carrinho!`);
  };

  const removeFromCart = (productId: string) => { setCart(prev => prev.filter(item => item.id !== productId)); };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (!profile?.address) return "Por favor, informe seu endereço para continuar.";
    if (!session?.user) return "Você precisa estar logado para fazer um pedido.";
    
    const total = getCartTotal();
    const deliveryFee = total >= 80 ? 0 : 8;
    const finalTotal = total + deliveryFee;

    const newOrder = {
      user_id: session.user.id,
      items: cart,
      total: finalTotal,
      address: profile.address,
      status: 'preparing' as const,
      estimated_time: '45 min'
    };

    const { data: orderData, error } = await supabase.from('orders').insert(newOrder).select().single();

    if (error) {
      showError("Erro ao registrar o pedido.");
      return "Ocorreu um erro. Tente novamente.";
    }

    setOrders(prev => [orderData, ...prev]);
    setCart([]);
    
    const notification = {
      user_id: session.user.id,
      title: 'Pedido Confirmado!',
      message: `Seu pedido #${orderData.id.slice(-6)} está sendo preparado.`
    };
    await supabase.from('notifications').insert(notification);

    // Simulação de atualização de status
    setTimeout(() => {
      supabase.from('orders').update({ status: 'delivering' }).eq('id', orderData.id).then();
    }, 30000); // 30 segundos

    setTimeout(() => {
      supabase.from('orders').update({ status: 'delivered' }).eq('id', orderData.id).then();
    }, 90000); // 90 segundos

    return null;
  };

  const toggleFavorite = async (productId: string) => {
    if (!session?.user) {
      showError('Você precisa estar logado para favoritar produtos.');
      return;
    }
    const isCurrentlyFavorite = favorites.includes(productId);
    if (isCurrentlyFavorite) {
      const { error } = await supabase.from('favorites').delete().match({ user_id: session.user.id, product_id: productId });
      if (error) showError('Não foi possível remover o favorito.');
      else setFavorites(prev => prev.filter(id => id !== productId));
    } else {
      const { error } = await supabase.from('favorites').insert([{ user_id: session.user.id, product_id: productId }]);
      if (error) showError('Não foi possível adicionar o favorito.');
      else setFavorites(prev => [...prev, productId]);
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) {
      showError('Não foi possível marcar a notificação como lida.');
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  const getUnreadNotificationCount = () => notifications.filter(n => !n.read).length;

  const sendMessage = async (message: string) => {
    if (!session?.user) {
      showError('Você precisa estar logado para enviar mensagens.');
      return;
    }
    const userMessage = { user_id: session.user.id, message, sender: 'user' as const };
    const { data: newUserMessage, error: userError } = await supabase.from('chat_messages').insert(userMessage).select().single();
    if (userError) {
      showError('Não foi possível enviar sua mensagem.');
      return;
    }
    setChatMessages(prev => [...prev, newUserMessage as ChatMessage]);

    setTimeout(async () => {
      const responses = [
        'Obrigado pela mensagem! Em breve um atendente entrará em contato.',
        'Estamos verificando sua solicitação. Aguarde um momento.',
        'Sua mensagem foi recebida. Nossa equipe já está cuidando do seu caso.'
      ];
      const supportMessageText = responses[Math.floor(Math.random() * responses.length)];
      const supportMessage = { user_id: session.user.id, message: supportMessageText, sender: 'support' as const };
      const { data: newSupportMessage, error: supportError } = await supabase.from('chat_messages').insert(supportMessage).select().single();
      if (supportError) return;
      setChatMessages(prev => [...prev, newSupportMessage as ChatMessage]);
    }, 2000);
  };

  const value = {
    session, profile, loading, cart, orders, favorites, notifications, chatMessages,
    addToCart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount,
    placeOrder, toggleFavorite, isFavorite, updateProfile, markNotificationAsRead,
    getUnreadNotificationCount, sendMessage, signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};