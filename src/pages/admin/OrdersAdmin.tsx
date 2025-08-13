import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { showError, showSuccess } from '@/utils/toast';
import { CreditCard } from 'lucide-react';

type AdminOrderView = {
  id: string;
  created_at: string;
  total: number;
  status: Order['status'];
  payment_method: Order['payment_method'];
  user_name: string | null;
};

const statusOptions: { value: Order['status']; label: string; variant: 'default' | 'secondary' | 'outline' }[] = [
  { value: 'preparing', label: 'Preparando', variant: 'default' },
  { value: 'delivering', label: 'Em Rota', variant: 'secondary' },
  { value: 'delivered', label: 'Entregue', variant: 'outline' },
];

const PaymentMethodDisplay = ({ method }: { method: Order['payment_method'] }) => {
  switch (method) {
    case 'pix': return <div className="flex items-center space-x-2"><span className="text-lg">📱</span><span>PIX</span></div>;
    case 'card': return <div className="flex items-center space-x-2"><CreditCard className="w-5 h-5" /><span>Cartão</span></div>;
    case 'money': return <div className="flex items-center space-x-2"><span className="text-lg">💰</span><span>Dinheiro</span></div>;
    default: return <span>N/A</span>;
  }
};

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<AdminOrderView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_orders_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Falha ao carregar pedidos.');
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data as AdminOrderView[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      showError('Falha ao atualizar status.');
    } else {
      showSuccess('Status do pedido atualizado!');
      fetchOrders(); // Recarrega a lista para mostrar a mudança
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Todos os Pedidos</h1>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Carregando...</TableCell></TableRow>
            ) : (
              orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">#{order.id.slice(-6)}</TableCell>
                  <TableCell>{order.user_name || 'N/A'}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>
                    <PaymentMethodDisplay method={order.payment_method} />
                  </TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge variant={option.variant}>{option.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersAdmin;