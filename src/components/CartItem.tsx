import { CartItem as CartItemType } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity } = useApp();

  return (
    <Card>
      <CardContent className="p-4 flex items-center space-x-4">
        <span className="text-3xl">{item.image}</span>
        <div className="flex-1">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-red-600 font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            -
          </Button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <Button
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            +
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;