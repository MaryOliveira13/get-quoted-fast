import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TechHeader } from "./components/TechHeader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BrandSelection from "./pages/BrandSelection";
import ModelSelection from "./pages/ModelSelection";
import ServiceSelection from "./pages/ServiceSelection";
import QuoteReview from "./pages/QuoteReview";
import PersonalizedQuote from "./pages/PersonalizedQuote";

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
          <Route path="/orcamento" element={<BrandSelection />} />
          <Route path="/orcamento/:brand" element={<ModelSelection />} />
          <Route path="/orcamento/:brand/:model" element={<ServiceSelection />} />
          <Route path="/orcamento-revisao" element={<QuoteReview />} />
          <Route path="/orcamento-personalizado" element={<PersonalizedQuote />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
