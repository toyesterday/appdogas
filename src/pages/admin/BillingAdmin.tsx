import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow, differenceInDays, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Depot } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DepotBilling {
  depot_id: string;
  depot_name: string;
  total_revenue: number;
  commission_amount: number;
}

type DepotWithBilling = Pick<Depot, 'id' | 'name' | 'next_billing_date'>;

const BillingAdmin = () => {
  const [billingData, setBillingData] = useState<DepotBilling[]>([]);
  const [depots, setDepots] = useState<DepotWithBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState<string | null>(null);

  const currentMonth = format(new Date(), 'MMMM de yyyy', { locale: ptBR });

  const fetchData = async () => {
    setLoading(true);
    const [billingRes, depotsRes, rateRes] = await Promise.all([
      supabase.rpc('get_all_depots_monthly_revenue'),
      supabase.from('depots').select('id, name, next_billing_date').order('next_billing_date'),
      supabase.from('app_settings').select('value').eq('key', 'commission_rate').single()
    ]);

    if (billingRes.error) showError('Falha ao carregar dados de faturamento.');
    else setBillingData(billingRes.data || []);

    if (depotsRes.error) showError('Falha ao carregar depósitos.');
    else setDepots(depotsRes.data || []);

    if (rateRes.error) setCommissionRate('5.99');
    else setCommissionRate(rateRes.data.value);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBillingStatus = (dateStr: string | null) => {
    if (!dateStr) return { text: 'Não definido', variant: 'secondary' as const };
    const date = new Date(dateStr);
    const daysDiff = differenceInDays(date, new Date());

    if (isPast(date) && !isToday(date)) return { text: `Vencido há ${formatDistanceToNow(date, { locale: ptBR })}`, variant: 'destructive' as const };
    if (isToday(date)) return { text: 'Vence hoje', variant: 'destructive' as const };
    if (daysDiff <= 7) return { text: `Vence em ${daysDiff + 1} dias`, variant: 'default' as const, className: 'bg-yellow-500 text-white' };
    return { text: `Vence em ${format(date, 'dd/MM/yyyy')}`, variant: 'secondary' as const };
  };

  const handleMarkAsBilled = async (depotId: string) => {
    const { error } = await supabase.rpc('reset_billing_cycle', { depot_id_param: depotId });
    if (error) {
      showError('Falha ao reiniciar ciclo de faturamento.');
    } else {
      showSuccess('Ciclo de faturamento reiniciado com sucesso!');
      fetchData();
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Faturamento e Comissões</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Controle de Ciclo de Faturamento</CardTitle>
          <CardDescription>Acompanhe os vencimentos e reinicie o ciclo de cobrança para cada depósito.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Depósito</TableHead>
                <TableHead>Próximo Vencimento</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : depots.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24">Nenhum depósito encontrado.</TableCell></TableRow>
              ) : (
                depots.map(depot => {
                  const status = getBillingStatus(depot.next_billing_date);
                  return (
                    <TableRow key={depot.id}>
                      <TableCell className="font-medium">{depot.name}</TableCell>
                      <TableCell><Badge variant={status.variant} className={status.className}>{status.text}</Badge></TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm">Marcar como Cobrado</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Cobrança?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá reiniciar o ciclo de faturamento para o depósito "{depot.name}". A próxima data de cobrança será definida para daqui a um mês.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleMarkAsBilled(depot.id)}>
                                Confirmar e Reiniciar Ciclo
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal dos Depósitos</CardTitle>
          <CardDescription>
            Faturamento e comissão a ser cobrada para o mês de <span className="font-semibold capitalize">{currentMonth}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Depósito</TableHead>
                  <TableHead className="text-right">Faturamento do Mês</TableHead>
                  <TableHead className="text-right">Comissão ({commissionRate || '5.99'}%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : billingData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Nenhum dado de faturamento para este mês.
                    </TableCell>
                  </TableRow>
                ) : (
                  billingData.map(depot => (
                    <TableRow key={depot.depot_id}>
                      <TableCell className="font-medium">{depot.depot_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(depot.total_revenue)}</TableCell>
                      <TableCell className="text-right font-bold text-red-600">{formatCurrency(depot.commission_amount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>* O faturamento é calculado com base nos pedidos com status diferente de 'Cancelado'.</p>
            <p>* A taxa de comissão pode ser alterada na página de <Link to="/admin/settings" className="underline hover:text-red-600">Configurações</Link>.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingAdmin;