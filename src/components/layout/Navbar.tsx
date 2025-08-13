import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MapPin, Bell, ShoppingCart, ArrowLeft, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDepot } from '@/context/DepotContext';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { getCartItemCount, getUnreadNotificationCount, profile } = useApp();
  const { depot } = useDepot();
  const location = useLocation();
  const navigate = useNavigate();
  const { depotSlug } = useParams<{ depotSlug: string }>();

  const cartItemCount = getCartItemCount();
  const unreadCount = getUnreadNotificationCount();

  const isDashboard = location.pathname === `/${depotSlug}/dashboard`;
  const showBackButton = !isDashboard;

  const getPageTitle = () => {
    const path = location.pathname.replace(`/${depotSlug}`, '');
    switch (path) {
      case '/dashboard': return depot.name;
      case '/cart': return 'Meu Carrinho';
      case '/orders': return 'Meus Pedidos';
      case '/profile': return 'Meu Perfil';
      case '/notifications': return 'Notificações';
      case '/support': return 'Suporte';
      default:
        if (path.startsWith('/orders/')) return 'Detalhes do Pedido';
        return depot.name;
    }
  };

  const title = getPageTitle();

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
          <h1 className="text-xl font-bold truncate">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {profile?.role === 'admin' && (
            <Link to="/admin" title="Painel Admin">
              <Shield className="w-6 h-6 cursor-pointer" />
            </Link>
          )}
          <Link to={`/${depotSlug}/notifications`} className="relative">
            <Bell className="w-6 h-6 cursor-pointer" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 h-5 w-5 justify-center text-xs">{unreadCount}</Badge>
            )}
          </Link>
          <Link to={`/${depotSlug}/cart`} className="relative">
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