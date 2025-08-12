import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Bell, ShoppingCart, ArrowLeft, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { getCartItemCount, getUnreadNotificationCount, profile } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = getCartItemCount();
  const unreadCount = getUnreadNotificationCount();

  const showBackButton = location.pathname !== '/';

  const pageTitles: { [key: string]: string } = {
    '/': '🔥 GásExpress',
    '/cart': 'Meu Carrinho',
    '/orders': 'Meus Pedidos',
    '/profile': 'Meu Perfil',
    '/notifications': 'Notificações',
    '/support': 'Suporte',
  };

  const title = pageTitles[location.pathname] || '🔥 GásExpress';

  return (
    <header className="bg-red-600 text-white p-4 shadow-lg fixed top-0 w-full z-40">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <ArrowLeft 
              className="w-6 h-6 cursor-pointer" 
              onClick={() => navigate(-1)}
            />
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {profile?.role === 'admin' && (
            <Link to="/admin/dashboard" title="Painel Admin">
              <Shield className="w-6 h-6 cursor-pointer" />
            </Link>
          )}
          <div className="hidden sm:flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Contagem, MG</span>
          </div>
          <Link to="/notifications" className="relative">
            <Bell className="w-6 h-6 cursor-pointer" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 h-5 w-5 justify-center text-xs">{unreadCount}</Badge>
            )}
          </Link>
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 cursor-pointer" />
            {cartItemCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 h-5 w-5 justify-center text-xs">{cartItemCount}</Badge>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;