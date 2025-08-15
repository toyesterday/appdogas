import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, Admin!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Use o menu à esquerda para gerenciar produtos e visualizar os pedidos dos clientes.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;