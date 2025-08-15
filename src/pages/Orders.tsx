import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import OrderCard from '@/components/OrderCard';
import { Button } from '@/components/ui/button';

const OrdersPage = () => {
  const { orders } = useApp();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Você ainda não fez nenhum pedido</p>
          <Button asChild>
            <Link to="/">Fazer Primeiro Pedido</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;