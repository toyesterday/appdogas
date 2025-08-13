import { UserAddress } from '@/types';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash, Edit, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AddressCardProps {
  address: UserAddress;
  onEdit: () => void;
}

const AddressCard = ({ address, onEdit }: AddressCardProps) => {
  const { deleteAddress, updateAddress } = useApp();

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      deleteAddress(address.id);
    }
  };

  const handleSetDefault = () => {
    if (!address.is_default) {
      updateAddress(address.id, { is_default: true });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{address.name}</CardTitle>
          {address.is_default && <Badge variant="outline"><Star className="w-3 h-3 mr-1" /> Padrão</Badge>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
            {!address.is_default && (
              <DropdownMenuItem onClick={handleSetDefault}><Star className="w-4 h-4 mr-2" /> Definir como Padrão</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDelete} className="text-red-600"><Trash className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{address.address}</p>
      </CardContent>
    </Card>
  );
};

export default AddressCard;