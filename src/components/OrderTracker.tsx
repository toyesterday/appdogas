import { CheckCircle, Package, Truck } from 'lucide-react';
import { Order } from '@/types';
import { cn } from '@/lib/utils';

interface OrderTrackerProps {
  status: Order['status'];
}

const OrderTracker = ({ status }: OrderTrackerProps) => {
  const steps = [
    { id: 'preparing', label: 'Preparando', icon: Package },
    { id: 'delivering', label: 'Em Rota', icon: Truck },
    { id: 'delivered', label: 'Entregue', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === status);

  return (
    <div className="flex items-center justify-between w-full p-4">
      {steps.map((step, index) => {
        const isActive = index <= currentStepIndex;
        return (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2',
                isActive ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-200 border-gray-300 text-gray-500'
              )}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <p className={cn('text-xs mt-2', isActive ? 'font-semibold text-red-600' : 'text-gray-500')}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTracker;