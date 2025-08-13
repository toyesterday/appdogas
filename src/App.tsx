import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CartPage from "@/pages/Cart";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/OrderDetail";
import ProfilePage from "@/pages/Profile";
import NotificationsPage from "@/pages/Notifications";
import SupportPage from "@/pages/Support";
import LoginPage from "@/pages/Login";
import AuthGuard from "@/components/Auth";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import DepotSelectionPage from "@/pages/DepotSelection";
import DepotLayout from "@/components/layout/DepotLayout";
import AddressesPage from "@/pages/Addresses";

// Admin imports
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import ProductsAdmin from "@/pages/admin/ProductsAdmin";
import OrdersAdmin from "@/pages/admin/OrdersAdmin";
import SettingsAdmin from "@/pages/admin/SettingsAdmin";
import DepotsAdmin from "@/pages/admin/DepotsAdmin";
import UsersAdmin from "@/pages/admin/UsersAdmin";

// Depot Manager imports
import DepotManagerGuard from "@/components/depot-manager/DepotManagerGuard";
import DepotManagerLayout from "@/components/depot-manager/DepotManagerLayout";
import DepotManagerDashboard from "@/pages/depot-manager/Dashboard";
import DepotManagerOrders from "@/pages/depot-manager/Orders";
import DepotManagerProducts from "@/pages/depot-manager/Products";
import DepotManagerSupport from "@/pages/depot-manager/Support";

const AppRoutes = () => {
  const { session, loading, profile } = useApp();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center"><p>Carregando...</p></div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/depots" element={<DepotSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Depot-specific Routes */}
      <Route path="/:depotSlug" element={<DepotLayout />}>
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="addresses" element={<AddressesPage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="depots" element={<DepotsAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Depot Manager Routes */}
      <Route path="/depot-manager" element={<DepotManagerGuard><DepotManagerLayout /></DepotManagerGuard>}>
        <Route path="dashboard" element={<DepotManagerDashboard />} />
        <Route path="orders" element={<DepotManagerOrders />} />
        <Route path="products" element={<DepotManagerProducts />} />
        <Route path="support" element={<DepotManagerSupport />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <AppProvider>
    <Toaster richColors position="top-center" />
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppProvider>
);

export default App;