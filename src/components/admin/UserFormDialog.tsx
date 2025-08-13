import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Depot } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/utils/toast';

const userFormSchema = z.object({
  full_name: z.string().min(1, "O nome é obrigatório."),
  role: z.enum(['user', 'admin', 'depot_manager']),
  depot_id: z.string().uuid().nullable().optional(),
}).refine(data => {
    if (data.role === 'depot_manager' && !data.depot_id) {
        return false;
    }
    return true;
}, {
    message: "Selecione um depósito para o gerente.",
    path: ["depot_id"],
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UserFormDialog = ({ user, open, onOpenChange, onSuccess }: UserFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depots, setDepots] = useState<Depot[]>([]);
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });

  const watchedRole = form.watch('role');

  useEffect(() => {
    const fetchDepots = async () => {
      const { data, error } = await supabase.from('depots').select('id, name');
      if (error) showError("Não foi possível carregar os depósitos.");
      else setDepots(data as Depot[]);
    };
    fetchDepots();
  }, []);

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || '',
        role: user.role || 'user',
        depot_id: user.depot_id,
      });
    }
  }, [user, form]);

  const onSubmit = async (values: UserFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    
    const updateData: Partial<Profile> = {
        full_name: values.full_name,
        role: values.role,
        depot_id: values.role === 'depot_manager' ? values.depot_id : null,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      showError(`Falha ao atualizar usuário: ${error.message}`);
    } else {
      showSuccess('Usuário atualizado com sucesso!');
      onSuccess();
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>Altere o papel e outras informações do usuário.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Papel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="depot_manager">Gerente de Depósito</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedRole === 'depot_manager' && (
              <FormField
                control={form.control}
                name="depot_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione um depósito" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {depots.map(depot => (
                          <SelectItem key={depot.id} value={depot.id}>{depot.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;