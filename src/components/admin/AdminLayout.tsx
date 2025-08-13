import { NavLink, Outlet } from 'react-router-dom';
import { Home, Package, ShoppingCart, ArrowLeft, Settings, Building } from 'lucide-react';

const AdminLayout = () => {
  const navItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Produtos' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/admin/depots', icon: Building, label: 'Depósitos' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  const activeClass = "bg-red-100 text-red-700";
  const inactiveClass = "hover:bg-gray-100";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-red-600">AppdoGás Admin</h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive ? activeClass : inactiveClass}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t">
          <NavLink to="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 mr-3" />
            <span>Voltar ao App</span>
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;