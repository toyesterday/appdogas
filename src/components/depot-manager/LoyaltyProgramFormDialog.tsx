import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Product, Profile, LoyaltyProgram } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/utils/toast';

const loyaltyFormSchema = z.object({
  user_id: z.string().uuid("Selecione um cliente."),
  target_purchases: z.coerce.number().int().min(2, "A meta deve ser de no mínimo 2 compras."),
  reward_product_id: z.string().uuid("Selecione um produto para a recompensa."),
  reward_discount_percentage: z.coerce.number().int().min(1, "O desconto deve ser de no mínimo 1%.").max(100, "O desconto não pode passar de 100%."),
});

type LoyaltyFormData = z.infer<typeof loyaltyFormSchema>;

interface LoyaltyProgramFormDialogProps {
  program?: LoyaltyProgram | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const LoyaltyProgramFormDialog = ({ program, open, onOpenChange, onSuccess }: LoyaltyProgramFormDialogProps) => {
  const { profile } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const form = useForm<LoyaltyFormData>({
    resolver: zodResolver(loyaltyFormSchema),
  });

  useEffect(() => {
    if (!profile?.depot_id) return;

    const fetchPrerequisites = async () => {
      // Fetch customers (users who have ordered from this depot)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('user_id')
        .eq('depot_id', profile.depot_id);
      
      if (ordersError) {
        showError("Erro ao carregar clientes.");
        return;
      }

      if (ordersData && ordersData.length > 0) {
        const userIds = [...new Set(ordersData.map(o => o.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profilesError) {
          showError("Erro ao carregar dados dos clientes.");
        } else {
          setCustomers(profilesData as Profile[]);
        }
      } else {
        setCustomers([]);
      }

      // Fetch products from this depot
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('depot_id', profile.depot_id);

      if (productsError) showError("Erro ao carregar produtos.");
      else setProducts(productsData);
    };

    fetchPrerequisites();
  }, [profile?.depot_id]);

  useEffect(() => {
    if (open) {
      if (program) {
        form.reset({
          user_id: program.user_id,
          target_purchases: program.target_purchases,
          reward_product_id: program.reward_product_id,
          reward_discount_percentage: program.reward_discount_percentage,
        });
      } else {
        form.reset({ target_purchases: 10, reward_discount_percentage: 50 });
      }
    }
  }, [program, open, form]);

  const onSubmit = async (values: LoyaltyFormData) => {
    if (!profile?.depot_id) return;
    setIsSubmitting(true);
    
    const programData = {
      ...values,
      id: program?.id,
      depot_id: profile.depot_id,
    };

    const { error } = await supabase.from('loyalty_programs').upsert(programData);

    if (error) {
      showError(`Falha ao salvar programa: ${error.message}`);
    } else {
      showSuccess('Programa de fidelidade salvo com sucesso!');
      onSuccess();
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{program ? 'Editar' : 'Criar'} Programa de Fidelidade</DialogTitle>
          <DialogDescription>Defina uma meta de compras para um cliente e ofereça um desconto como recompensa.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!program}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_purchases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta de Compras</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reward_product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto da Recompensa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reward_discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto da Recompensa (%)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Programa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoyaltyProgramFormDialog;