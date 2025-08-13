import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { showError, showSuccess } from '@/utils/toast';
import { Order } from '@/types';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentDialog = ({ open, onOpenChange }: PaymentDialogProps) => {
  const { placeOrder } = useApp();
  const navigate = useNavigate();
  const { depotSlug } = useParams<{ depotSlug: string }>();
  const [paymentMethod, setPaymentMethod] = useState<Order['payment_method']>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const error = await placeOrder(paymentMethod, paymentMethod === 'money' ? changeFor : undefined);
    if (error) {
      showError(error);
    } else {
      showSuccess('Pedido realizado com sucesso!');
      onOpenChange(false);
      navigate(`/${depotSlug}/orders`);
    }
    setIsPlacingOrder(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Forma de Pagamento na Entrega</DialogTitle>
          <DialogDescription>
            O pagamento é feito diretamente ao entregador.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup defaultValue="pix" value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as Order['payment_method'])} className="grid gap-4 py-4">
          <Label htmlFor="pix" className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-red-500">
            <RadioGroupItem value="pix" id="pix" />
            <span className="text-2xl">📱</span>
            <p className="font-semibold">PIX</p>
          </Label>
          <Label htmlFor="card" className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-red-500">
            <RadioGroupItem value="card" id="card" />
            <CreditCard className="w-6 h-6 text-blue-600" />
            <p className="font-semibold">Cartão de Crédito/Débito</p>
          </Label>
          <div>
            <Label htmlFor="money" className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-red-500">
              <RadioGroupItem value="money" id="money" />
              <span className="text-2xl">💰</span>
              <p className="font-semibold">Dinheiro</p>
            </Label>
            {paymentMethod === 'money' && (
              <div className="mt-2 pl-4">
                <Label htmlFor="change" className="text-sm font-medium">Troco para R$ (opcional)</Label>
                <Input
                  id="change"
                  type="number"
                  placeholder="Ex: 100"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
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