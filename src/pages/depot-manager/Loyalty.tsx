import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { LoyaltyProgram } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Gift } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { showError, showSuccess } from '@/utils/toast';
import LoyaltyProgramFormDialog from '@/components/depot-manager/LoyaltyProgramFormDialog';

const DepotManagerLoyalty = () => {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);
  const { profile } = useApp();

  const fetchPrograms = async () => {
    if (!profile?.depot_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*, profiles(full_name), products(name)')
      .eq('depot_id', profile.depot_id)
      .order('created_at', { ascending: false });
      
    if (error) {
      showError('Falha ao carregar programas de fidelidade.');
    } else {
      setPrograms(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.depot_id) {
      fetchPrograms();
    }
  }, [profile]);

  const handleDelete = async (programId: string) => {
    if (!confirm('Tem certeza que deseja excluir este programa de fidelidade?')) return;
    const { error } = await supabase.from('loyalty_programs').delete().eq('id', programId);
    if (error) {
      showError('Falha ao excluir programa.');
    } else {
      showSuccess('Programa excluído!');
      fetchPrograms();
    }
  };

  const handleAddNew = () => {
    setEditingProgram(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (program: LoyaltyProgram) => {
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Programas de Fidelidade</h1>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          <PlusCircle className="w-4 h-4 mr-2" />
          Criar Novo Programa
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Recompensa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
            ) : programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <Gift className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  Nenhum programa de fidelidade criado.
                </TableCell>
              </TableRow>
            ) : (
              programs.map(program => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.profiles.full_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(program.current_purchases / program.target_purchases) * 100} className="w-24" />
                      <span>{program.current_purchases} / {program.target_purchases}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {program.reward_discount_percentage}% em {program.products.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={program.status === 'active' ? 'secondary' : 'default'}>
                      {program.status === 'active' ? 'Ativo' : 'Concluído'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(program)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(program.id)} className="text-red-600">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <LoyaltyProgramFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchPrograms}
        program={editingProgram}
      />
    </div>
  );
};

export default DepotManagerLoyalty;