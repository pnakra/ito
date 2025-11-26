import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CrossedLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showBack?: boolean;
}

const CrossedLayout = ({ 
  children, 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack,
  nextLabel = "Continue",
  showBack = true 
}: CrossedLayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-3xl mx-auto mt-12 flex justify-between items-center">
          {showBack && onBack ? (
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Home
              </Button>
            </Link>
          )}
          
          {onNext && (
            <Button onClick={onNext} size="lg" className="px-8">
              {nextLabel}
            </Button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CrossedLayout;
