import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AvoidLine from "./pages/AvoidLine";
import CrossedLine from "./pages/CrossedLine";
import SomeoneCrossedLine from "./pages/SomeoneCrossedLine";
import Scenarios from "./pages/Scenarios";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/avoid-line" element={<AvoidLine />} />
          <Route path="/crossed-line" element={<CrossedLine />} />
          <Route path="/someone-crossed" element={<SomeoneCrossedLine />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/install" element={<Install />} />
          {/* Legacy routes for backwards compatibility */}
          <Route path="/chat" element={<AvoidLine />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
