import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Scenarios from "./pages/Scenarios";
import About from "./pages/About";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";
import Start from "./pages/crossed/Start";
import WhatHappened from "./pages/crossed/WhatHappened";
import Consent from "./pages/crossed/Consent";
import NextSteps from "./pages/crossed/NextSteps";
import Commit from "./pages/crossed/Commit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/crossed/start" element={<Start />} />
          <Route path="/crossed/what-happened" element={<WhatHappened />} />
          <Route path="/crossed/consent" element={<Consent />} />
          <Route path="/crossed/next-steps" element={<NextSteps />} />
          <Route path="/crossed/commit" element={<Commit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
