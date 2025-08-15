import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Building, Users, DollarSign, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const menuItems = [
    {
      title: 'Gerenciar Pedidos',
      href: '/admin/orders',
      icon: ShoppingCart,
      description: 'Visualize todos os pedidos realizados na plataforma.',
    },
    {
      title: 'Gerenciar Depósitos',
      href: '/admin/depots',
      icon: Building,
      description: 'Adicione, edite ou remova depósitos de gás.',
    },
    {
      title: 'Gerenciar Usuários',
      href: '/admin/users',
      icon: Users,
      description: 'Visualize e edite os papéis dos usuários.',
    },
    {
      title: 'Faturamento',
      href: '/admin/billing',
      icon: DollarSign,
      description: 'Acompanhe o faturamento e as comissões.',
    },
    {
      title: 'Configurações',
      href: '/admin/settings',
      icon: Settings,
      description: 'Ajuste as configurações gerais do aplicativo.',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard do Administrador</h1>
      <p className="text-gray-600 mb-8">Bem-vindo! Use os atalhos abaixo para navegar rapidamente pelas seções principais.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link to={item.href} key={item.href} className="hover:no-underline">
            <Card className="h-full hover:bg-gray-50 hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-red-100 rounded-lg">
                  <item.icon className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;