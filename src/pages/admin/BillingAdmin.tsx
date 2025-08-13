import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface DepotBilling {
  depot_id: string;
  depot_name: string;
  total_revenue: number;
  commission_amount: number;
}

const BillingAdmin = () => {
  const [billingData, setBillingData] = useState<DepotBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState<string | null>(null);

  const currentMonth = format(new Date(), 'MMMM de yyyy', { locale: ptBR });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_depots_monthly_revenue');
      const { data: rateData, error: rateError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'commission_rate')
        .single();

      if (error) {
        showError('Falha ao carregar dados de faturamento.');
        console.error(error);
      } else {
        setBillingData(data || []);
      }

      if (rateError) {
        console.error("Não foi possível buscar a taxa de comissão, usando o padrão.");
        setCommissionRate('5.99');
      } else {
        setCommissionRate(rateData.value);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Faturamento e Comissões</h1>
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