import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { showError } from '@/utils/toast';
import UserFormDialog from '@/components/admin/UserFormDialog';

type ProfileWithDepot = Profile & {
  depots: { name: string } | null;
};

const roleMap: { [key: string]: { label: string, variant: 'default' | 'secondary' | 'outline' } } = {
  user: { label: 'Usuário', variant: 'secondary' },
  admin: { label: 'Admin', variant: 'default' },
  depot_manager: { label: 'Gerente', variant: 'outline' },
};

const UsersAdmin = () => {
  const [users, setUsers] = useState<ProfileWithDepot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, depots ( name )');
      
    if (error) {
      showError('Falha ao carregar usuários.');
      console.error('Error fetching users:', error);
    } else {
      setUsers(data as ProfileWithDepot[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gerenciar Usuários</h1>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Depósito</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={roleMap[user.role || 'user']?.variant || 'secondary'}>
                      {roleMap[user.role || 'user']?.label || 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.depots?.name || '---'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchUsers}
        user={editingUser}
      />
    </div>
  );
};

export default UsersAdmin;