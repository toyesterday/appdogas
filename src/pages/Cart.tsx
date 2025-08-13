import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Gift, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import CartItem from '@/components/CartItem';
import PaymentDialog from '@/components/PaymentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CartPage = () => {
  const { cart, getCartTotal, selectedAddress, appSettings, loyaltyPrograms, applyLoyaltyReward, removeLoyaltyReward, appliedLoyaltyProgramId } = useApp();
  const [showPayment, setShowPayment] = useState(false);
  
  const { subtotal, discount, total: totalAfterDiscount } = getCartTotal();
  const threshold = appSettings?.free_shipping_threshold || 80;
  const deliveryFee = totalAfterDiscount >= threshold ? 0 : 8.00;
  const total = totalAfterDiscount + deliveryFee;
  const canCheckout = !!selectedAddress;

  const availableRewards = loyaltyPrograms.filter(p => 
    p.status === 'completed' && cart.some(item => item.id === p.reward_product_id)
  );

  const appliedProgram = loyaltyPrograms.find(p => p.id === appliedLoyaltyProgramId);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
          <Button asChild>
            <Link to="/dashboard">Ver Produtos</Link>
          </Button>
        </div>
      ) : (
        <>
          {availableRewards.length > 0 && (
            <Card className="mb-4 bg-yellow-50 border-yellow-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Gift className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold">Você tem uma recompensa!</h3>
                    {availableRewards.map(program => (
                      <div key={program.id}>
                        <p className="text-sm text-yellow-800">
                          {program.reward_discount_percentage}% de desconto em {program.products.name}.
                        </p>
                        {appliedLoyaltyProgramId === program.id ? (
                          <Button variant="link" className="p-0 h-auto text-red-600" onClick={removeLoyaltyReward}>
                            Remover Recompensa
                          </Button>
                        ) : (
                          <Button variant="link" className="p-0 h-auto text-yellow-700" onClick={() => applyLoyaltyReward(program.id)} disabled={!!appliedLoyaltyProgramId}>
                            Aplicar no carrinho
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              {discount > 0 && appliedProgram && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto Fidelidade ({appliedProgram.products.name})</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
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
                disabled={!canCheckout}
                className="w-full text-lg py-6"
              >
                {!canCheckout ? 'Selecione um endereço' : 'Escolher Pagamento'}
              </Button>
              {!canCheckout && (
                <p className="text-center text-sm text-gray-600">
                  Volte ao início e selecione ou cadastre um endereço para continuar.
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