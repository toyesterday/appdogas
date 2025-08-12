import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Depot } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { showError, showSuccess } from '@/utils/toast';
import DepotFormDialog from '@/components/admin/DepotFormDialog';

const DepotsAdmin = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);

  const fetchDepots = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('depots').select('*').order('name');
    if (error) {
      showError('Falha ao carregar depósitos.');
      console.error('Error fetching depots:', error);
    } else {
      setDepots(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepots();
  }, []);

  const handleDelete = async (depotId: string) => {
    if (!confirm('Tem certeza que deseja excluir este depósito? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('depots').delete().eq('id', depotId);
    if (error) {
      showError('Falha ao excluir depósito.');
    } else {
      showSuccess('Depósito excluído!');
      fetchDepots();
    }
  };

  const handleAddNew = () => {
    setEditingDepot(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (depot: Depot) => {
    setEditingDepot(depot);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Depósitos</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Depósito
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
            ) : (
              depots.map(depot => (
                <TableRow key={depot.id}>
                  <TableCell className="font-medium">{depot.name}</TableCell>
                  <TableCell>{depot.address}</TableCell>
                  <TableCell>{depot.phone}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(depot)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(depot.id)} className="text-red-600">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DepotFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchDepots}
        depot={editingDepot}
      />
    </div>
  );
};

export default DepotsAdmin;