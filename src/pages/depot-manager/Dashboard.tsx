import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { DollarSign, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DepotManagerDashboard = () => {
  const { profile } = useApp();
  const [stats, setStats] = useState<{ total_revenue: number; total_orders: number } | null>(null);
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {profile?.full_name || 'Gerente'}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Aqui você pode gerenciar os pedidos e produtos do seu depósito: <strong>{profile?.depots?.name}</strong>.</p>
            <p className="mt-2">Use o menu à esquerda para navegar.</p>
          </CardContent>
        </Card>

        {loadingStats ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : stats && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.total_revenue.toFixed(2).replace('.', ',')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default DepotManagerDashboard;