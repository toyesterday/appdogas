import { NavLink, useParams } from 'react-router-dom';
import { Home, Heart, ShoppingCart, Truck, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';

const BottomNav = () => {
  const { getCartItemCount } = useApp();
  const { depotSlug } = useParams<{ depotSlug: string }>();
  const cartItemCount = getCartItemCount();

  const navItems = [
    { path: `/${depotSlug}/dashboard`, icon: Home, label: 'Início' },
    { path: `/${depotSlug}/favorites`, icon: Heart, label: 'Favoritos' },
    { path: `/${depotSlug}/cart`, icon: ShoppingCart, label: 'Carrinho', badge: cartItemCount },
    { path: `/${depotSlug}/orders`, icon: Truck, label: 'Pedidos' },
    { path: `/${depotSlug}/profile`, icon: User, label: 'Perfil' },
  ];

  const activeClass = "text-red-600";
  const inactiveClass = "text-gray-500";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-40">
      <div className="flex justify-around max-w-4xl mx-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith('/dashboard')}
            className={({ isActive }) => `flex flex-col items-center p-2 relative ${isActive ? activeClass : inactiveClass}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <Badge variant="destructive" className="absolute top-0 right-1.5 px-1 py-0 h-4 justify-center text-xs">{item.badge}</Badge>
            ) : null}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;