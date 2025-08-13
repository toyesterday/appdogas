import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { showError, showSuccess } from '@/utils/toast';
import { CreditCard, MoreHorizontal, Trash, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type AdminOrderView = {
  id: string;
  created_at: string;
  total: number;
  status: Order['status'];
  payment_method: Order['payment_method'];
  change_for: string | null;
  user_name: string | null;
  depot_id: string;
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
      content = <div className="flex items-center space-x-2"><span className="text-lg">💰</span><span>Dinheiro</span></div>;
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

const DepotManagerOrders = () => {
  const [orders, setOrders] = useState<AdminOrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useApp();

  const fetchOrders = async () => {
    if (!profile?.depot_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_orders_view')
      .select('*')
      .eq('depot_id', profile.depot_id)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Falha ao carregar pedidos.');
    } else {
      setOrders(data as AdminOrderView[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.depot_id) {
      fetchOrders();
    }
  }, [profile]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      showError('Falha ao atualizar status.');
    } else {
      showSuccess('Status do pedido atualizado!');
      fetchOrders();
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('EXCLUIR PEDIDO?\n\nEsta ação é permanente e removerá o pedido do sistema para sempre. Deseja continuar?')) {
      return;
    }
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      showError('Falha ao excluir o pedido.');
    } else {
      showSuccess('Pedido excluído com sucesso!');
      fetchOrders();
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Pedidos do Depósito</h1>
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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center">Carregando...</TableCell></TableRow>
            ) : (
              orders.map(order => {
                const statusInfo = statusOptions.find(s => s.value === order.status) || statusOptions[0];
                return (
                  <TableRow key={order.id} className={order.status === 'canceled' ? 'bg-gray-50 text-gray-500' : ''}>
                    <TableCell className="font-mono whitespace-nowrap">#{order.id.slice(-6)}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.user_name || 'N/A'}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="whitespace-nowrap">R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>
                      <PaymentMethodDisplay method={order.payment_method} changeFor={order.change_for} />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                        disabled={order.status === 'canceled' || order.status === 'delivered'}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.filter(o => o.value !== 'canceled').map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(order.id, 'canceled')}
                            disabled={order.status === 'canceled' || order.status === 'delivered'}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Cancelar Pedido</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-700"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Excluir Permanentemente</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default DepotManagerOrders;