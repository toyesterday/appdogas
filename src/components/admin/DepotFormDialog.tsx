import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Depot } from '@/types';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';

const depotFormSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  slug: z.string().min(3, { message: "O slug deve ter pelo menos 3 caracteres." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug inválido. Use apenas letras minúsculas, números e hífens." }),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

type DepotFormData = z.infer<typeof depotFormSchema>;

const generateSlug = (name: string) => 
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

interface DepotFormDialogProps {
  depot?: Depot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DepotFormDialog = ({ depot, open, onOpenChange, onSuccess }: DepotFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<DepotFormData>({
    resolver: zodResolver(depotFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      address: '',
      phone: '',
    },
  });

  const watchedName = form.watch('name');

  useEffect(() => {
    if (!form.formState.isDirty) {
      form.setValue('slug', generateSlug(watchedName), { shouldValidate: true });
    }
  }, [watchedName, form]);

  useEffect(() => {
    if (open) {
      if (depot) {
        form.reset({
          name: depot.name,
          slug: depot.slug,
          address: depot.address,
          phone: depot.phone,
        });
      } else {
        form.reset(form.formState.defaultValues);
      }
    }
  }, [depot, open, form]);

  const onSubmit = async (values: DepotFormData) => {
    setIsSubmitting(true);
    const depotData = {
      ...values,
      id: depot?.id,
    };

    const { error } = await supabase.from('depots').upsert(depotData);

    if (error) {
      showError(`Falha ao ${depot ? 'atualizar' : 'criar'} depósito: ${error.message}`);
    } else {
      showSuccess(`Depósito ${depot ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{depot ? 'Editar Depósito' : 'Adicionar Novo Depósito'}</DialogTitle>
          <DialogDescription>
            {depot ? 'Altere os detalhes do depósito abaixo.' : 'Preencha os detalhes do novo depósito.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Depósito</FormLabel>
                  <FormControl><Input placeholder="Depósito Central" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (Slug)</FormLabel>
                  <FormControl><Input placeholder="deposito-central" {...field} /></FormControl>
                  <FormDescription>
                    Isso aparecerá na URL. Ex: seusite.com/deposito-central
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl><Input placeholder="Rua das Entregas, 123" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl><Input placeholder="(31) 99999-9999" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Depósito'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DepotFormDialog;