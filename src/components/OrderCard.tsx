import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Pedido #{order.id.toString().slice(-6)}</CardTitle>
        <Badge variant={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-3">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
        </div>
        <hr className="my-2" />
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {order.timestamp.toLocaleDateString()} às {order.timestamp.toLocaleTimeString().slice(0, 5)}
            </p>
            <p className="text-sm text-gray-600 truncate max-w-[150px]">📍 {order.address}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-red-600">R$ {order.total.toFixed(2).replace('.', ',')}</p>
            {order.status !== 'delivered' && (
              <p className="text-sm text-blue-600">⏱️ {order.estimatedTime}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;