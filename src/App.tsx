import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import CheckIn from "./pages/CheckIn";
import About from "./pages/About";
import Resources from "./pages/Resources";
import Demo from "./pages/Demo";
import ReleaseNotes from "./pages/ReleaseNotes";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/chat" element={<CheckIn />} />
              <Route path="/about" element={<About />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/release-notes" element={<ReleaseNotes />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
