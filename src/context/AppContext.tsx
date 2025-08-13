import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem, Order, Notification, ChatMessage, Profile, AppSettings, UserAddress } from '@/types';
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
  appSettings: AppSettings | null;
  addresses: UserAddress[];
  selectedAddress: UserAddress | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  placeOrder: () => Promise<string | null>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId:string) => boolean;
  updateProfile: (data: { full_name?: string }) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  getUnreadNotificationCount: () => number;
  sendMessage: (message: string) => Promise<void>;
  signOut: () => Promise<void>;
  addAddress: (address: Omit<UserAddress, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateAddress: (addressId: string, data: Partial<UserAddress>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  selectAddress: (addressId: string) => void;
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
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

  const fetchInitialData = async (userId: string) => {
    const [ordersRes, favoritesRes, chatMessagesRes, notificationsRes, settingsRes, addressesRes] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('favorites').select('product_id').eq('user_id', userId),
      supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('app_settings').select('key, value'),
      supabase.from('user_addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (ordersRes.error) showError('Não foi possível carregar seus pedidos.');
    else setOrders(ordersRes.data as Order[]);

    if (favoritesRes.error) showError('Não foi possível carregar seus favoritos.');
    else setFavorites(favoritesRes.data.map(fav => fav.product_id));

    if (chatMessagesRes.error) showError('Não foi possível carregar o histórico de chat.');
    else setChatMessages(chatMessagesRes.data as ChatMessage[]);

    if (notificationsRes.error) showError('Não foi possível carregar as notificações.');
    else setNotifications(notificationsRes.data as Notification[]);

    if (settingsRes.data) {
      const settings = settingsRes.data.reduce((acc, { key, value }) => {
        acc[key] = key === 'free_shipping_threshold' ? parseFloat(value) : value;
        return acc;
      }, {} as any);
      setAppSettings(settings);
    }

    if (addressesRes.error) {
      showError('Não foi possível carregar seus endereços.');
    } else {
      const fetchedAddresses = addressesRes.data as UserAddress[];
      setAddresses(fetchedAddresses);
      const defaultAddress = fetchedAddresses.find(a => a.is_default) || fetchedAddresses[0] || null;
      setSelectedAddress(defaultAddress);
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
        setAppSettings(null);
        setAddresses([]);
        setSelectedAddress(null);
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

  const updateProfile = async (data: { full_name?: string }) => {
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
      if (prev.length > 0 && prev[0].depot_id !== product.depot_id) {
        showError("Você só pode adicionar produtos do mesmo depósito ao carrinho.");
        return prev;
      }

      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      showSuccess(`${product.name} adicionado ao carrinho!`);
      return [...prev, { ...product, quantity: 1 }];
    });
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
    if (!selectedAddress) return "Por favor, selecione um endereço de entrega.";
    if (!session?.user) return "Você precisa estar logado para fazer um pedido.";
    if (cart.length === 0) return "Seu carrinho está vazio.";
    
    const total = getCartTotal();
    const threshold = appSettings?.free_shipping_threshold || 80;
    const deliveryFee = total >= threshold ? 0 : 8;
    const finalTotal = total + deliveryFee;

    const newOrder = {
      user_id: session.user.id,
      depot_id: cart[0].depot_id,
      items: cart,
      total: finalTotal,
      address: selectedAddress.address,
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

  const selectAddress = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId);
    if (address) {
      setSelectedAddress(address);
      showSuccess(`Endereço '${address.name}' selecionado.`);
    }
  };

  const addAddress = async (addressData: Omit<UserAddress, 'id' | 'user_id' | 'created_at'>) => {
    if (!session?.user) return;
    const { data, error } = await supabase.from('user_addresses').insert({ ...addressData, user_id: session.user.id }).select().single();
    if (error) {
      showError(`Falha ao adicionar endereço: ${error.message}`);
    } else {
      const newAddress = data as UserAddress;
      const updatedAddresses = [newAddress, ...addresses.map(a => newAddress.is_default ? {...a, is_default: false} : a)];
      setAddresses(updatedAddresses);
      if (newAddress.is_default || addresses.length === 0) {
        setSelectedAddress(newAddress);
      }
      showSuccess('Endereço adicionado com sucesso!');
    }
  };

  const updateAddress = async (addressId: string, data: Partial<UserAddress>) => {
    const { data: updatedData, error } = await supabase.from('user_addresses').update(data).eq('id', addressId).select().single();
    if (error) {
      showError(`Falha ao atualizar endereço: ${error.message}`);
    } else {
      const updatedAddress = updatedData as UserAddress;
      setAddresses(prev => prev.map(a => a.id === addressId ? updatedAddress : (updatedAddress.is_default ? {...a, is_default: false} : a) ));
      if (updatedAddress.is_default || selectedAddress?.id === addressId) {
        setSelectedAddress(updatedAddress);
      }
      showSuccess('Endereço atualizado com sucesso!');
    }
  };

  const deleteAddress = async (addressId: string) => {
    const { error } = await supabase.from('user_addresses').delete().eq('id', addressId);
    if (error) {
      showError(`Falha ao excluir endereço: ${error.message}`);
    } else {
      const remainingAddresses = addresses.filter(a => a.id !== addressId);
      setAddresses(remainingAddresses);
      if (selectedAddress?.id === addressId) {
        const newSelected = remainingAddresses.find(a => a.is_default) || remainingAddresses[0] || null;
        setSelectedAddress(newSelected);
      }
      showSuccess('Endereço excluído com sucesso!');
    }
  };

  const value = {
    session, profile, loading, cart, orders, favorites, notifications, chatMessages, appSettings,
    addresses, selectedAddress,
    addToCart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount,
    placeOrder, toggleFavorite, isFavorite, updateProfile, markNotificationAsRead,
    getUnreadNotificationCount, sendMessage, signOut,
    addAddress, updateAddress, deleteAddress, selectAddress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};