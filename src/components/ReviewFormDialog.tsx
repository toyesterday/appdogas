import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const reviewFormSchema = z.object({
  rating: z.number().min(1, "A nota é obrigatória."),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormDialogProps {
  product: CartItem;
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const StarRating = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
  const [hoverValue, setHoverValue] = useState(0);
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={cn(
            "w-8 h-8 cursor-pointer transition-colors",
            (hoverValue || value) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        />
      ))}
    </div>
  );
};

const ReviewFormDialog = ({ product, orderId, open, onOpenChange, onSuccess }: ReviewFormDialogProps) => {
  const { session } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const onSubmit = async (values: ReviewFormData) => {
    if (!session?.user) return;
    setIsSubmitting(true);
    
    const reviewData = {
      product_id: product.id,
      order_id: orderId,
      user_id: session.user.id,
      rating: values.rating,
      comment: values.comment,
    };

    const { error } = await supabase.from('product_reviews').insert(reviewData);

    if (error) {
      showError(`Falha ao enviar avaliação: ${error.message}`);
    } else {
      showSuccess('Avaliação enviada com sucesso!');
      onSuccess();
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar {product.name}</DialogTitle>
          <DialogDescription>Sua opinião é muito importante para nós e para outros clientes.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sua nota</FormLabel>
                  <FormControl>
                    <StarRating value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário (opcional)</FormLabel>
                  <FormControl><Textarea placeholder="Conte-nos mais sobre sua experiência..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormDialog;