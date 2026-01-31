import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Before from "./pages/Before";
import After from "./pages/After";
import HappenedToMe from "./pages/HappenedToMe";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Install from "./pages/Install";
import Demo from "./pages/Demo";
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
          <Route path="/before" element={<Before />} />
          <Route path="/after" element={<After />} />
          <Route path="/happened-to-me" element={<HappenedToMe />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/install" element={<Install />} />
          <Route path="/demo" element={<Demo />} />
          {/* Legacy routes for backwards compatibility */}
          <Route path="/avoid-line" element={<Before />} />
          <Route path="/crossed-line" element={<After />} />
          <Route path="/someone-crossed" element={<HappenedToMe />} />
          <Route path="/chat" element={<Before />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
