import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin } from 'lucide-react';
import AddressCard from '@/components/AddressCard';
import AddressFormDialog from '@/components/AddressFormDialog';
import { UserAddress } from '@/types';

const AddressesPage = () => {
  const { addresses } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Novo Endereço
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum endereço cadastrado</p>
          <p className="text-sm text-gray-500">Adicione um endereço para começar a fazer pedidos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(address => (
            <AddressCard key={address.id} address={address} onEdit={() => handleEdit(address)} />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        address={editingAddress}
      />
    </div>
  );
};

export default AddressesPage;