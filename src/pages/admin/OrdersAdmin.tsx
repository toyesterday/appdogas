import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { showError } from '@/utils/toast';
import { CreditCard } from 'lucide-react';

type AdminOrderView = {
  id: string;
  created_at: string;
  total: number;
  status: Order['status'];
  payment_method: Order['payment_method'];
  change_for: string | null;
  user_name: string | null;
};

const statusOptions: { value: Order['status']; label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }[] = [
  { value: 'preparing', label: 'Preparando', variant: 'default' },
  { value: 'delivering', label: 'Em Rota', variant: 'secondary' },
  { value: 'delivered', label: 'Entregue', variant: 'outline' },
  { value: 'canceled', label: 'Cancelado', variant: 'destructive' },
];

const PaymentMethodDisplay = ({ method, changeFor }: { method: Order['payment_method'], changeFor: string | null }) => {
  let content;
  switch (method) {
    case 'pix': 
      content = <div className="flex items-center space-x-2"><span className="text-lg">📱</span><span>PIX</span></div>;
      break;
    case 'card': 
      content = <div className="flex items-center space-x-2"><CreditCard className="w-5 h-5" /><span>Cartão</span></div>;
      break;
    case 'money': 
      content = (
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <span>Dinheiro</span>
        </div>
      );
      break;
    default: 
      content = <span>N/A</span>;
  }

  return (
    <div>
      {content}
      {method === 'money' && changeFor && (
        <p className="text-xs text-gray-500">Troco p/ R$ {changeFor}</p>
      )}
    </div>
  );
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

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Todos os Pedidos</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
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
              orders.map(order => {
                const statusInfo = statusOptions.find(s => s.value === order.status) || statusOptions[0];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono whitespace-nowrap">#{order.id.slice(-6)}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.user_name || 'N/A'}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="whitespace-nowrap">R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>
                      <PaymentMethodDisplay method={order.payment_method} changeFor={order.change_for} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersAdmin;