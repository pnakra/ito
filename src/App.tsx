import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CheckIn from "./pages/CheckIn";
import Before from "./pages/Before";
import After from "./pages/After";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Demo from "./pages/Demo";
import ReleaseNotes from "./pages/ReleaseNotes";
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
          <Route path="/check-in" element={<CheckIn />} />
          {/* Orphaned flows — commented out for ethical scanner review */}
          {/* <Route path="/before" element={<Before />} /> */}
          {/* <Route path="/after" element={<After />} /> */}
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
          {/* Legacy routes — commented out, no longer surfaced in UI */}
          {/* <Route path="/avoid-line" element={<Before />} /> */}
          {/* <Route path="/crossed-line" element={<After />} /> */}
          <Route path="/chat" element={<CheckIn />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
