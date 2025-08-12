import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import BottomNav from './BottomNav.tsx';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pb-24 pt-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;