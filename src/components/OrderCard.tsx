import { Link } from 'react-router-dom';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderCardProps {
  order: Order;
}

const getStatusColor = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'preparing': return 'default';
    case 'delivering': return 'secondary';
    case 'delivered': return 'outline';
    default: return 'default';
  }
};

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'preparing': return 'Preparando';
    case 'delivering': return 'Saiu para entrega';
    case 'delivered': return 'Entregue';
    default: return status;
  }
};

const OrderCard = ({ order }: OrderCardProps) => {
  const orderTimestamp = new Date(order.created_at);

  return (
    <Link to={`/orders/${order.id}`}>
      <Card className="hover:bg-gray-50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Pedido #{order.id.toString().slice(-6)}</CardTitle>
          <Badge variant={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {orderTimestamp.toLocaleDateString()} às {orderTimestamp.toLocaleTimeString().slice(0, 5)}
              </p>
              <p className="text-sm text-gray-600 truncate max-w-[150px]">📍 {order.address}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-red-600">R$ {order.total.toFixed(2).replace('.', ',')}</p>
              {order.status !== 'delivered' && (
                <p className="text-sm text-blue-600">⏱️ {order.estimated_time}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default OrderCard;