import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';

const settingsFormSchema = z.object({
  free_shipping_threshold: z.coerce.number().positive("O valor deve ser positivo."),
  free_shipping_banner_text: z.string().min(1, "O texto não pode estar vazio."),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

const SettingsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('app_settings').select('key, value');
      if (error) {
        showError("Falha ao carregar configurações.");
      } else {
        const settings = data.reduce((acc, { key, value }) => {
          acc[key] = value;
          return acc;
        }, {} as { [key: string]: string });
        form.reset({
          free_shipping_threshold: parseFloat(settings.free_shipping_threshold),
          free_shipping_banner_text: settings.free_shipping_banner_text,
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, [form]);

  const onSubmit = async (values: SettingsFormData) => {
    setIsSubmitting(true);
    const updates = [
      { key: 'free_shipping_threshold', value: values.free_shipping_threshold.toString() },
      { key: 'free_shipping_banner_text', value: values.free_shipping_banner_text },
    ];

    const { error } = await supabase.from('app_settings').upsert(updates);

    if (error) {
      showError("Falha ao salvar configurações.");
      console.error("Falha ao salvar configurações:", error);
    } else {
      showSuccess("Configurações salvas com sucesso!");
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Promoção de Frete Grátis</CardTitle>
          <CardDescription>
            Gerencie o banner e as regras para a promoção de frete grátis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="free_shipping_banner_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Banner</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="free_shipping_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mínimo para Frete Grátis (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsAdmin;