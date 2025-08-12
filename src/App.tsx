import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import CartPage from "@/pages/Cart";
import OrdersPage from "@/pages/Orders";
import ProfilePage from "@/pages/Profile";
import NotificationsPage from "@/pages/Notifications";
import SupportPage from "@/pages/Support";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";

const App = () => (
  <AppProvider>
    <Toaster richColors position="top-center" />
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AppProvider>
);

export default App;