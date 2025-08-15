import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import CartItem from '@/components/CartItem';
import PaymentDialog from '@/components/PaymentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CartPage = () => {
  const { cart, getCartTotal, profile, appSettings } = useApp();
  const [showPayment, setShowPayment] = useState(false);
  const subtotal = getCartTotal();
  const threshold = appSettings?.free_shipping_threshold || 80;
  const deliveryFee = subtotal >= threshold ? 0 : 8.00;
  const total = subtotal + deliveryFee;
  const userAddress = profile?.address;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
          <Button asChild>
            <Link to="/">Ver Produtos</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de entrega</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-red-600">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2">
              <Button
                onClick={() => setShowPayment(true)}
                disabled={!userAddress}
                className="w-full text-lg py-6"
              >
                {!userAddress ? 'Informe seu endereço' : 'Escolher Pagamento'}
              </Button>
              {!userAddress && (
                <p className="text-center text-sm text-gray-600">
                  Volte ao início e informe seu endereço para continuar
                </p>
              )}
            </CardFooter>
          </Card>
        </>
      )}
      <PaymentDialog open={showPayment} onOpenChange={setShowPayment} />
    </div>
  );
};

export default CartPage;