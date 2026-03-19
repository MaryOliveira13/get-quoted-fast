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
import AdminIntegrations from "./pages/AdminIntegrations";
import AdminOrders from "./pages/AdminOrders";
import SelfLabelPersonal from "./pages/SelfLabelPersonal";
import SelfLabelDevice from "./pages/SelfLabelDevice";
import SelfLabelConfirm from "./pages/SelfLabelConfirm";
import SelfLabelSuccess from "./pages/SelfLabelSuccess";
import FreightPaid from "./pages/FreightPaid";
import FreightCancelled from "./pages/FreightCancelled";
import FreightPayment from "./pages/FreightPayment";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TechHeader />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/orcamento" element={<BrandSelection />} />
          <Route path="/orcamento/:brand" element={<ModelSelection />} />
          <Route path="/orcamento/:brand/:model" element={<ServiceSelection />} />
          <Route path="/orcamento-revisao" element={<QuoteReview />} />
          <Route path="/orcamento-personalizado" element={<PersonalizedQuote />} />
          <Route path="/envio" element={<Navigate to="/envio/dados-pessoais" replace />} />
          <Route path="/envio/dados-pessoais" element={<ShippingPersonal />} />
          <Route path="/envio/aparelho" element={<ShippingDevice />} />
          <Route path="/envio/confirmacao" element={<ShippingConfirm />} />
          <Route path="/envio/frete" element={<ShippingRates />} />
          <Route path="/envio/pagamento" element={<FreightPayment />} />
          <Route path="/frete-pago" element={<FreightPaid />} />
          <Route path="/frete-cancelado" element={<FreightCancelled />} />
          <Route path="/envio/etiqueta-propria/dados" element={<SelfLabelPersonal />} />
          <Route path="/envio/etiqueta-propria/aparelho" element={<SelfLabelDevice />} />
          <Route path="/envio/etiqueta-propria/confirmacao" element={<SelfLabelConfirm />} />
          <Route path="/envio/etiqueta-propria/sucesso" element={<SelfLabelSuccess />} />
          <Route path="/admin/integracoes" element={<AdminIntegrations />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
