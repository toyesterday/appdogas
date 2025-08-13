import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserAddress } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const addressFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  address: z.string().min(10, { message: "O endereço deve ter pelo menos 10 caracteres." }),
  is_default: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormDialogProps {
  address?: UserAddress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddressFormDialog = ({ address, open, onOpenChange }: AddressFormDialogProps) => {
  const { addAddress, updateAddress } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { name: '', address: '', is_default: false },
  });

  useEffect(() => {
    if (open) {
      if (address) {
        form.reset(address);
      } else {
        form.reset({ name: '', address: '', is_default: false });
      }
    }
  }, [address, open, form]);

  const onSubmit = async (values: AddressFormData) => {
    setIsSubmitting(true);
    try {
      if (address) {
        await updateAddress(address.id, values);
      } else {
        await addAddress({
          name: values.name,
          address: values.address,
          is_default: values.is_default,
        });
      }
      onOpenChange(false); // Fecha o diálogo apenas em caso de sucesso
    } catch (error) {
      console.error("Falha ao salvar endereço:", error);
      // A notificação de erro já é exibida pelo AppContext
    } finally {
      setIsSubmitting(false); // Garante que o estado de "salvando" seja desativado
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{address ? 'Editar Endereço' : 'Adicionar Novo Endereço'}</DialogTitle>
          <DialogDescription>
            {address ? 'Altere os detalhes do seu endereço.' : 'Preencha os detalhes do novo endereço.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome (Ex: Casa, Trabalho)</FormLabel>
                  <FormControl><Input placeholder="Casa" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl><Input placeholder="Rua, Número, Bairro, Cidade - Estado, CEP" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Endereço Padrão</FormLabel>
                    <FormDescription>Usar este endereço para futuros pedidos.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Endereço'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormDialog;