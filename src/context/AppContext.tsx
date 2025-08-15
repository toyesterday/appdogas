import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem, Order, Notification, ChatMessage, Profile, AppSettings, UserAddress, LoyaltyProgram } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

interface AppContextType {
  session: Session | null;
  profile: (Profile & { depots: { name: string } | null }) | null;
  loading: boolean;
  cart: CartItem[];
  orders: Order[];
  favorites: string[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  appSettings: AppSettings | null;
  addresses: UserAddress[];
  selectedAddress: UserAddress | null;
  loyaltyPrograms: LoyaltyProgram[];
  appliedLoyaltyProgramId: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getCartTotal: () => { subtotal: number, discount: number, total: number };
  getCartItemCount: () => number;
  placeOrder: (paymentMethod: 'pix' | 'card' | 'money', changeFor?: string) => Promise<string | null>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId:string) => boolean;
  updateProfile: (data: { full_name?: string }) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  getUnreadNotificationCount: () => number;
  fetchChatMessages: (depotId: string) => Promise<void>;
  sendMessage: (message: string, depotId: string) => Promise<void>;
  sendSupportMessage: (message: string, depotId: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  addAddress: (address: Omit<UserAddress, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateAddress: (addressId: string, data: Partial<UserAddress>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  selectAddress: (addressId: string) => void;
  applyLoyaltyReward: (programId: string) => void;
  removeLoyaltyReward: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<(Profile & { depots: { name: string } | null }) | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [appliedLoyaltyProgramId, setAppliedLoyaltyProgramId] = useState<string | null>(null);

  const fetchInitialData = async (userId: string) => {
    const [ordersRes, favoritesRes, notificationsRes, settingsRes, addressesRes, loyaltyRes] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('favorites').select('product_id').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('app_settings').select('key, value'),
      supabase.from('user_addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('loyalty_programs').select('*, products(name), depots(name)').eq('user_id', userId),
    ]);

    if (ordersRes.error) console.error('Error fetching orders:', ordersRes.error);
    else setOrders(ordersRes.data as Order[]);

    if (favoritesRes.error) console.error('Error fetching favorites:', favoritesRes.error);
    else setFavorites(favoritesRes.data.map(fav => fav.product_id));

    if (notificationsRes.error) console.error('Error fetching notifications:', notificationsRes.error);
    else setNotifications(notificationsRes.data as Notification[]);

    if (settingsRes.data) {
      const settings = settingsRes.data.reduce((acc, { key, value }) => {
        acc[key] = key === 'free_shipping_threshold' ? parseFloat(value) : value;
        return acc;
      }, {} as any);
      setAppSettings(settings);
    }

    if (addressesRes.error) console.error('Error fetching addresses:', addressesRes.error);
    else {
      const fetchedAddresses = addressesRes.data as UserAddress[];
      setAddresses(fetchedAddresses);
      const defaultAddress = fetchedAddresses.find(a => a.is_default) || fetchedAddresses[0] || null;
      setSelectedAddress(defaultAddress);
    }

    if (loyaltyRes.error) console.error('Error fetching loyalty programs:', loyaltyRes.error);
    else setLoyaltyPrograms(loyaltyRes.data as any);
  };

  const clearUserData = () => {
    setProfile(null);
    setOrders([]);
    setFavorites([]);
    setChatMessages([]);
    setNotifications([]);
    setAppSettings(null);
    setAddresses([]);
    setSelectedAddress(null);
    setLoyaltyPrograms([]);
    setAppliedLoyaltyProgramId(null);
    setCart([]);
  };

  // Effect 1: Handle session loading and changes
  useEffect(() => {
    console.log('[AppContext] Effect 1: Initializing session check.');
    setSessionLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AppContext] getSession() completed. Session:', session);
      setSession(session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AppContext] onAuthStateChange event: ${event}. Session:`, session);
      setSession(session);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect 2: Fetch user data when session is available
  useEffect(() => {
    console.log(`[AppContext] Effect 2 triggered. sessionLoading: ${sessionLoading}`);
    if (sessionLoading) {
      console.log('[AppContext] Effect 2: Aborting because session is still loading.');
      return;
    }

    const fetchUserAndData = async () => {
      if (session) {
        console.log('[AppContext] Effect 2: Session found. Fetching user data...');
        setDataLoading(true);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, depots ( name )')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;

          setProfile(profileData as any);
          await fetchInitialData(session.user.id);
          console.log('[AppContext] Effect 2: User data fetched successfully.');
        } catch (error) {
          console.error("Error fetching user data:", error);
          showError("Não foi possível carregar seus dados.");
          clearUserData();
        } finally {
          setDataLoading(false);
        }
      } else {
        console.log('[AppContext] Effect 2: No session found. Clearing user data.');
        clearUserData();
      }
    };

    fetchUserAndData();
  }, [session, sessionLoading]);

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

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    if (appliedLoyaltyProgramId) {
      const program = loyaltyPrograms.find(p => p.id === appliedLoyaltyProgramId);
      if (program?.reward_product_id === productId) {
        setAppliedLoyaltyProgramId(null);
      }
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    let discount = 0;
    if (appliedLoyaltyProgramId) {
      const program = loyaltyPrograms.find(p => p.id === appliedLoyaltyProgramId);
      const rewardItem = cart.find(item => item.id === program?.reward_product_id);
      if (program && rewardItem) {
        discount = (rewardItem.price * (program.reward_discount_percentage / 100));
      }
    }
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async (paymentMethod: 'pix' | 'card' | 'money', changeFor?: string) => {
    if (!selectedAddress) return "Por favor, selecione um endereço de entrega.";
    if (!session?.user) return "Você precisa estar logado para fazer um pedido.";
    if (cart.length === 0) return "Seu carrinho está vazio.";
    
    const { total: subtotal, discount } = getCartTotal();
    const threshold = appSettings?.free_shipping_threshold || 80;
    const deliveryFee = subtotal >= threshold ? 0 : 8;
    const finalTotal = subtotal + deliveryFee;

    const cartWithAppliedReward = cart.map(item => ({
      ...item,
      applied_loyalty_program_id: appliedLoyaltyProgramId && loyaltyPrograms.find(p => p.id === appliedLoyaltyProgramId)?.reward_product_id === item.id ? appliedLoyaltyProgramId : null
    }));

    const newOrder = {
      user_id: session.user.id,
      depot_id: cart[0].depot_id,
      items: cartWithAppliedReward,
      total: finalTotal,
      address: selectedAddress.address,
      status: 'preparing' as const,
      payment_method: paymentMethod,
      change_for: changeFor,
      estimated_time: '45 min'
    };

    const { data: orderData, error } = await supabase.from('orders').insert(newOrder).select().single();

    if (error) {
      showError("Erro ao registrar o pedido.");
      return "Ocorreu um erro. Tente novamente.";
    }

    if (appliedLoyaltyProgramId) {
      const program = loyaltyPrograms.find(p => p.id === appliedLoyaltyProgramId);
      if (program) {
        await supabase.from('loyalty_programs').update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
          redeemed_order_id: orderData.id
        }).eq('id', program.id);

        await supabase.from('loyalty_programs').insert({
          user_id: program.user_id,
          depot_id: program.depot_id,
          target_purchases: program.target_purchases,
          reward_product_id: program.reward_product_id,
          reward_discount_percentage: program.reward_discount_percentage,
          status: 'active',
          current_purchases: 0
        });
        
        const { data: updatedPrograms } = await supabase.from('loyalty_programs').select('*, products(name), depots(name)').eq('user_id', session.user.id);
        if (updatedPrograms) setLoyaltyPrograms(updatedPrograms as any);
      }
    }

    setOrders(prev => [orderData, ...prev]);
    setCart([]);
    setAppliedLoyaltyProgramId(null);
    
    const notification = {
      user_id: session.user.id,
      title: 'Pedido Confirmado!',
      message: `Seu pedido #${orderData.id.slice(-6)} está sendo preparado.`
    };
    await supabase.from('notifications').insert(notification);

    return null;
  };

  const applyLoyaltyReward = (programId: string) => {
    if (appliedLoyaltyProgramId) {
      showError("Apenas uma recompensa pode ser usada por pedido.");
      return;
    }
    setAppliedLoyaltyProgramId(programId);
    showSuccess("Recompensa aplicada!");
  };

  const removeLoyaltyReward = () => {
    setAppliedLoyaltyProgramId(null);
    showSuccess("Recompensa removida.");
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const toggleFavorite = async (productId: string) => {
    if (!session?.user) {
      showError("Você precisa estar logado para favoritar produtos.");
      return;
    }
    const isCurrentlyFavorite = isFavorite(productId);
    if (isCurrentlyFavorite) {
      setFavorites(prev => prev.filter(id => id !== productId));
      const { error } = await supabase.from('favorites').delete().match({ user_id: session.user.id, product_id: productId });
      if (error) {
        showError("Erro ao remover favorito.");
        setFavorites(prev => [...prev, productId]);
      }
    } else {
      setFavorites(prev => [...prev, productId]);
      const { error } = await supabase.from('favorites').insert({ user_id: session.user.id, product_id: productId });
      if (error) {
        showError("Erro ao adicionar favorito.");
        setFavorites(prev => prev.filter(id => id !== productId));
      }
    }
  };

  const updateProfile = async (data: { full_name?: string }) => {
    if (!session?.user) return;
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', session.user.id)
      .select('*, depots ( name )')
      .single();
    if (error) showError("Erro ao atualizar perfil.");
    else {
      setProfile(updatedProfile as any);
      showSuccess("Perfil atualizado!");
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const getUnreadNotificationCount = () => notifications.filter(n => !n.read).length;

  const fetchChatMessages = async (depotId: string) => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('depot_id', depotId)
      .order('created_at');
    if (error) showError("Erro ao carregar mensagens.");
    else setChatMessages(data);
  };

  const sendMessage = async (message: string, depotId: string) => {
    if (!session?.user) return;
    const { error } = await supabase.from('chat_messages').insert({
      user_id: session.user.id,
      depot_id: depotId,
      message,
      sender: 'user' as const,
    });
    if (error) showError("Erro ao enviar mensagem.");
  };

  const sendSupportMessage = async (message: string, depotId: string, userId: string) => {
    if (!session?.user || profile?.role !== 'depot_manager') return;
    const { error } = await supabase.from('chat_messages').insert({
      user_id: userId,
      depot_id: depotId,
      message,
      sender: 'support' as const,
    });
    if (error) showError("Erro ao enviar mensagem de suporte.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addAddress = async (address: Omit<UserAddress, 'id' | 'user_id' | 'created_at'>) => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({ ...address, user_id: session.user.id })
      .select()
      .single();
    if (error) showError("Erro ao adicionar endereço.");
    else {
      setAddresses(prev => [data, ...prev]);
      if (data.is_default || addresses.length === 0) setSelectedAddress(data);
      showSuccess("Endereço adicionado!");
    }
  };

  const updateAddress = async (addressId: string, data: Partial<UserAddress>) => {
    const { data: updatedAddress, error } = await supabase
      .from('user_addresses')
      .update(data)
      .eq('id', addressId)
      .select()
      .single();
    if (error) showError("Erro ao atualizar endereço.");
    else {
      const updatedAddresses = addresses.map(a => a.id === addressId ? updatedAddress : (data.is_default ? { ...a, is_default: false } : a));
      setAddresses(updatedAddresses);
      if (updatedAddress.is_default) setSelectedAddress(updatedAddress);
      showSuccess("Endereço atualizado!");
    }
  };

  const deleteAddress = async (addressId: string) => {
    const { error } = await supabase.from('user_addresses').delete().eq('id', addressId);
    if (error) showError("Erro ao excluir endereço.");
    else {
      const newAddresses = addresses.filter(a => a.id !== addressId);
      setAddresses(newAddresses);
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(newAddresses.find(a => a.is_default) || newAddresses[0] || null);
      }
      showSuccess("Endereço excluído!");
    }
  };

  const selectAddress = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId);
    if (address) setSelectedAddress(address);
  };

  const value = {
    session, profile, loading: sessionLoading || dataLoading, cart, orders, favorites, notifications, chatMessages, appSettings,
    addresses, selectedAddress, loyaltyPrograms, appliedLoyaltyProgramId,
    addToCart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount,
    placeOrder, toggleFavorite, isFavorite, updateProfile, markNotificationAsRead,
    getUnreadNotificationCount, sendMessage, signOut,
    addAddress, updateAddress, deleteAddress, selectAddress, fetchChatMessages, sendSupportMessage,
    applyLoyaltyReward, removeLoyaltyReward
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};