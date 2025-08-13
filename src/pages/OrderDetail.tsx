import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import OrderTracker from '@/components/OrderTracker';

const getPaymentMethodInfo = (method: Order['payment_method']) => {
  switch (method) {
    case 'pix': return { label: 'PIX na entrega', icon: <span className="text-xl">📱</span> };
    case 'card': return { label: 'Cartão na entrega', icon: <CreditCard className="w-5 h-5 text-blue-600" /> };
    case 'money': return { label: 'Dinheiro na entrega', icon: <span className="text-xl">💰</span> };
    default: return { label: 'Não informado', icon: null };
  }
};

const OrderDetailPage = () => {
  const { depotSlug, id } = useParams<{ depotSlug: string; id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Pedido não encontrado.');
        console.error(error);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase.channel(`order_details:${id}`)
      .on<Order>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <Button asChild variant="link">
          <Link to={`/${depotSlug}/orders`}>Voltar para Meus Pedidos</Link>
        </Button>
      </div>
    );
  }

  const orderTimestamp = new Date(order.created_at);
  const paymentInfo = getPaymentMethodInfo(order.payment_method);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <Button asChild variant="ghost" className="pl-0">
        <Link to={`/${depotSlug}/orders`}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Rastreamento do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTracker status={order.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Pedido #{order.id.slice(-6)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Data</span>
              <span>{orderTimestamp.toLocaleDateString()} às {orderTimestamp.toLocaleTimeString().slice(0, 5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Endereço de Entrega</span>
              <span className="text-right">{order.address}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pagamento</span>
              <div className="flex items-center space-x-2">
                {paymentInfo.icon}
                <span>{paymentInfo.label}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-red-600">R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-none">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">{item.quantity} x R$ {item.price.toFixed(2).replace('.', ',')}</p>
              </div>
              <p>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;