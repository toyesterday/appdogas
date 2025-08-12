import { User, MapPin, CreditCard, Star, Bell, Phone, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProfilePage = () => {
  const { orders, favorites } = useApp();

  const menuItems = [
    { icon: MapPin, label: 'Meus Endereços' },
    { icon: CreditCard, label: 'Formas de Pagamento' },
    { icon: Star, label: 'Avaliar App' },
    { icon: Bell, label: 'Notificações' },
    { icon: Phone, label: 'Suporte' },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">João Silva</h2>
              <p className="text-gray-600">joao.silva@email.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {menuItems.map((item, index) => (
            <div key={item.label} className={`flex items-center justify-between py-3 ${index < menuItems.length - 1 ? 'border-b' : ''}`}>
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-gray-500" />
                <span>{item.label}</span>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Pedidos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">R$ {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2).replace('.', ',')}</div>
            <div className="text-sm text-gray-600">Gastos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{favorites.length}</div>
            <div className="text-sm text-gray-600">Favoritos</div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>
    </div>
  );
};

export default ProfilePage;