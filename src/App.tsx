import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TechHeader } from "./components/TechHeader";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import BrandSelection from "./pages/BrandSelection";
import ModelSelection from "./pages/ModelSelection";
import ServiceSelection from "./pages/ServiceSelection";
import QuoteReview from "./pages/QuoteReview";
import PersonalizedQuote from "./pages/PersonalizedQuote";
import ShippingPersonal from "./pages/ShippingPersonal";
import ShippingDevice from "./pages/ShippingDevice";
import ShippingConfirm from "./pages/ShippingConfirm";
import ShippingRates from "./pages/ShippingRates";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminOrcamentos from "./pages/AdminOrcamentos";
import AdminLogistica from "./pages/AdminLogistica";
import AdminEnviosPos from "./pages/AdminEnviosPos";
import AdminIntegrations from "./pages/AdminIntegrations";
import AdminGestao from "./pages/AdminGestao";
import SelfLabelPersonal from "./pages/SelfLabelPersonal";
import SelfLabelDevice from "./pages/SelfLabelDevice";
import SelfLabelConfirm from "./pages/SelfLabelConfirm";
import SelfLabelSuccess from "./pages/SelfLabelSuccess";
import FreightPaid from "./pages/FreightPaid";
import FreightCancelled from "./pages/FreightCancelled";
import FreightPayment from "./pages/FreightPayment";
import ResetPassword from "./pages/ResetPassword";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const AdminPage = ({ children }: { children: React.ReactNode }) => (
  <AdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </AdminRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes with TechHeader */}
          <Route path="/" element={<><TechHeader /><Index /></>} />
          <Route path="/home" element={<><TechHeader /><Index /></>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/orcamento" element={<><TechHeader /><BrandSelection /></>} />
          <Route path="/orcamento/:brand" element={<><TechHeader /><ModelSelection /></>} />
          <Route path="/orcamento/:brand/:model" element={<><TechHeader /><ServiceSelection /></>} />
          <Route path="/orcamento-revisao" element={<><TechHeader /><QuoteReview /></>} />
          <Route path="/orcamento-personalizado" element={<><TechHeader /><PersonalizedQuote /></>} />
          <Route path="/envio" element={<Navigate to="/envio/dados-pessoais" replace />} />
          <Route path="/envio/dados-pessoais" element={<><TechHeader /><ShippingPersonal /></>} />
          <Route path="/envio/aparelho" element={<><TechHeader /><ShippingDevice /></>} />
          <Route path="/envio/confirmacao" element={<><TechHeader /><ShippingConfirm /></>} />
          <Route path="/envio/frete" element={<><TechHeader /><ShippingRates /></>} />
          <Route path="/envio/pagamento" element={<><TechHeader /><FreightPayment /></>} />
          <Route path="/frete-pago" element={<><TechHeader /><FreightPaid /></>} />
          <Route path="/frete-cancelado" element={<><TechHeader /><FreightCancelled /></>} />
          <Route path="/envio/etiqueta-propria/dados" element={<><TechHeader /><SelfLabelPersonal /></>} />
          <Route path="/envio/etiqueta-propria/aparelho" element={<><TechHeader /><SelfLabelDevice /></>} />
          <Route path="/envio/etiqueta-propria/confirmacao" element={<><TechHeader /><SelfLabelConfirm /></>} />
          <Route path="/envio/etiqueta-propria/sucesso" element={<><TechHeader /><SelfLabelSuccess /></>} />

          {/* Admin routes - no TechHeader, uses AdminLayout */}
          <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
          <Route path="/admin/pedidos" element={<AdminPage><AdminOrders /></AdminPage>} />
          <Route path="/admin/orcamentos" element={<AdminPage><AdminOrcamentos /></AdminPage>} />
          <Route path="/admin/gestao" element={<AdminPage><AdminGestao /></AdminPage>} />
          <Route path="/admin/logistica" element={<AdminPage><AdminLogistica /></AdminPage>} />
          <Route path="/admin/envios-pos" element={<AdminPage><AdminEnviosPos /></AdminPage>} />
          <Route path="/admin/integracoes" element={<AdminPage><AdminIntegrations /></AdminPage>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
