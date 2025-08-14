import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BillingCycle } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';

const BillingAdmin = () => {
  const [cycles, setCycles] = useState<BillingCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total_revenue: 0, total_commission: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('billing_cycles')
      .select('*, depots(name)')
      .order('end_date', { ascending: false });

    if (error) {
      showError('Falha ao carregar histórico de faturamento.');
      console.error(error);
    } else {
      setCycles(data as any[]);
      const summaryData = data.reduce((acc, cycle) => {
        acc.total_revenue += cycle.total_revenue;
        acc.total_commission += cycle.commission_amount;
        return acc;
      }, { total_revenue: 0, total_commission: 0 });
      setSummary(summaryData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAsPaid = async (cycleId: string) => {
    const { error } = await supabase
      .from('billing_cycles')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', cycleId);

    if (error) {
      showError('Falha ao marcar como pago.');
    } else {
      showSuccess('Fatura marcada como paga!');
      fetchData();
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: BillingCycle['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Histórico de Faturamento</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total (Geral)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>}
            <p className="text-xs text-muted-foreground">Soma de todos os ciclos de faturamento.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão Total (Geral)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_commission)}</div>}
            <p className="text-xs text-muted-foreground">Soma de todas as comissões geradas.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ciclos de Faturamento</CardTitle>
          <CardDescription>
            O histórico de todas as faturas geradas para os depósitos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Depósito</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : cycles.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">Nenhum ciclo de faturamento encontrado.</TableCell></TableRow>
              ) : (
                cycles.map(cycle => (
                  <TableRow key={cycle.id}>
                    <TableCell className="font-medium">{cycle.depots.name}</TableCell>
                    <TableCell>{format(new Date(cycle.start_date), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(cycle.end_date), 'dd/MM/yy', { locale: ptBR })}</TableCell>
                    <TableCell className="text-right">{formatCurrency(cycle.total_revenue)}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{formatCurrency(cycle.commission_amount)}</TableCell>
                    <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                    <TableCell className="text-right">
                      {cycle.status === 'pending' && (
                        <Button size="sm" onClick={() => handleMarkAsPaid(cycle.id)}>Marcar como Pago</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-sm text-gray-500 mt-4">
        Nota: Os ciclos de faturamento são gerados e atualizados automaticamente pelo sistema.
      </p>
    </div>
  );
};

export default BillingAdmin;