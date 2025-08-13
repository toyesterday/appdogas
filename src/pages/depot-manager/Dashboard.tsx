import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

const DepotManagerDashboard = () => {
  const { profile } = useApp();

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
      </div>
    </div>
  );
};

export default DepotManagerDashboard;