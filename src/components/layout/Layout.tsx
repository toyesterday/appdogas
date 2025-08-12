import React from 'react';
import Navbar from './Navbar.tsx';
import BottomNav from './BottomNav.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pb-24 pt-16">{children}</main>
      <BottomNav />
    </div>
  );
};

export default Layout;