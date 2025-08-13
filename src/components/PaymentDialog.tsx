import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from '@/utils/toast';
import { Order } from '@/types';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentDialog = ({ open, onOpenChange }: PaymentDialogProps) => {
  const { placeOrder } = useApp();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<Order['payment_method']>('pix');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const error = await placeOrder(paymentMethod);
    if (error) {
      showError(error);
    } else {
      showSuccess('Pedido realizado com sucesso!');
      onOpenChange(false);
      navigate('/orders');
    }
    setIsPlacingOrder(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Forma de Pagamento na Entrega</DialogTitle>
        </DialogHeader>
        <RadioGroup defaultValue="pix" value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as Order['payment_method'])} className="grid gap-4 py-4">
          <Label htmlFor="pix" className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-red-500">
            <RadioGroupItem value="pix" id="pix" />
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-semibold">PIX</p>
              <p className="text-sm text-gray-600">Pagamento na entrega</p>
            </div>
          </Label>
          <Label htmlFor="card" className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-red-500">
            <RadioGroupItem value="card" id="card" />
            <CreditCard className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold">Cartão de Crédito/Débito</p>
              <p className="text-sm text-gray-600">Maquininha na entrega</p>
            </div>
          </Label>
          <Label htmlFor="money" className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-red-500">
            <RadioGroupItem value="money" id="money" />
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-semibold">Dinheiro</p>
              <p className="text-sm text-gray-600">Pagamento na entrega</p>
            </div>
          </Label>
        </RadioGroup>
        <DialogFooter>
          <Button onClick={handlePlaceOrder} className="w-full" disabled={isPlacingOrder}>
            {isPlacingOrder ? 'Finalizando...' : 'Finalizar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;