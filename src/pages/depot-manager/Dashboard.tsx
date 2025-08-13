import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { DollarSign, ShoppingCart, CalendarDays, Landmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DepotStats {
  total_revenue: number;
  daily_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  total_orders: number;
}

const DepotManagerDashboard = () => {
  const { profile } = useApp();
  const [stats, setStats] = useState<DepotStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      const { data, error } = await supabase.rpc('get_depot_revenue_stats');

      if (error) {
        showError('Falha ao carregar estatísticas do depósito.');
        console.error(error);
      } else if (data && data.length > 0) {
        setStats(data[0]);
      }
      setLoadingStats(false);
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.daily_revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento (Semana)</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.weekly_revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento (Mês)</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Bem-vindo, {profile?.full_name || 'Gerente'}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gerencie os pedidos e produtos do seu depósito: <strong>{profile?.depots?.name}</strong>.</p>
            <p className="mt-2">Use o menu à esquerda para navegar.</p>
          </CardContent>
        </Card>
        {loadingStats ? (
          <Skeleton className="h-32" />
        ) : stats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
              <p className="text-xs text-muted-foreground">Desde o início</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DepotManagerDashboard;