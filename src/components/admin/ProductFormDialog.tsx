import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { showError, showSuccess } from '@/utils/toast';

const productFormSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  brand: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive({ message: "O preço deve ser um número positivo." }),
  originalPrice: z.coerce.number().positive({ message: "O preço original deve ser um número positivo." }).optional().nullable(),
  image: z.string().optional().nullable(),
  promotion: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  product?: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ProductFormDialog = ({ product, open, onOpenChange, onSuccess }: ProductFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      image: '',
      promotion: '',
      featured: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          name: product.name,
          brand: product.brand,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          promotion: product.promotion,
          featured: !!product.featured,
        });
      } else {
        form.reset(form.formState.defaultValues);
      }
    }
  }, [product, open, form]);

  const onSubmit = async (values: ProductFormData) => {
    setIsSubmitting(true);
    const productData = {
      ...values,
      id: product?.id,
    };

    const { error } = await supabase.from('products').upsert(productData);

    if (error) {
      showError(`Falha ao ${product ? 'atualizar' : 'criar'} produto: ${error.message}`);
    } else {
      showSuccess(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Altere os detalhes do produto abaixo.' : 'Preencha os detalhes do novo produto.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Gás de Cozinha P13" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl><Input placeholder="Supergásbras" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Original (Opcional)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Textarea placeholder="Descrição do produto..." {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl><Input placeholder="/images/gas-13kg.png" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="promotion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promoção (Ex: 10% OFF)</FormLabel>
                  <FormControl><Input placeholder="10% OFF" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Destaque</FormLabel>
                    <FormDescription>Marque para destacar este produto na página inicial.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;