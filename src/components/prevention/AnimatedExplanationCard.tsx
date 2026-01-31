import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Eye, X, Check, MessageCircle } from "lucide-react";
import RiskBadge from "@/components/RiskBadge";
import type { RiskLevel } from "@/types/risk";

interface AnalysisData {
  riskLevel: RiskLevel;
  assessment: string;
  whatsHappening: string[];
  whatNotToDo: string[];
  whatToDoInstead: string[];
  realTalk: string;
}

interface AnimatedExplanationCardProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
}

// Typewriter effect for text
const TypewriterSpan = ({ 
  text, 
  delay = 20, 
  onComplete 
}: { 
  text: string; 
  delay?: number; 
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay, onComplete]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

// Section that fades in
const FadeInSection = ({ 
  children, 
  show, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  show: boolean; 
  delay?: number;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timeout);
    }
  }, [show, delay]);

  if (!visible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {children}
    </div>
  );
};

const AnimatedExplanationCard = ({ analysis, isLoading }: AnimatedExplanationCardProps) => {
  const [revealStage, setRevealStage] = useState(0);
  
  // Reset reveal stage when new analysis comes in
  useEffect(() => {
    if (analysis && !isLoading) {
      setRevealStage(0);
      // Start the reveal sequence
      const timer = setTimeout(() => setRevealStage(1), 100);
      return () => clearTimeout(timer);
    }
  }, [analysis, isLoading]);

  if (isLoading) {
    return (
      <Card className="p-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Breaking this down for you...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Stage 1: Risk Badge */}
      <FadeInSection show={revealStage >= 1} delay={0}>
        <div className="flex justify-center">
          <RiskBadge level={analysis.riskLevel} size="lg" />
        </div>
      </FadeInSection>
      
      {/* Stage 2: Assessment - typewriter effect */}
      <FadeInSection show={revealStage >= 1} delay={300}>
        <p className="text-lg font-medium text-center">
          <TypewriterSpan 
            text={analysis.assessment} 
            delay={25}
            onComplete={() => setRevealStage(2)}
          />
        </p>
      </FadeInSection>

      {/* Stage 3: What's Happening */}
      <FadeInSection show={revealStage >= 2} delay={200}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">What's going on</h3>
          </div>
          <ul className="space-y-2 ml-7">
            {analysis.whatsHappening.map((point, i) => (
              <FadeInSection key={i} show={revealStage >= 2} delay={100 * (i + 1)}>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{point}</span>
                </li>
              </FadeInSection>
            ))}
          </ul>
        </div>
      </FadeInSection>

      {/* Stage 4: What NOT to Do - only if not empty */}
      {analysis.whatNotToDo.length > 0 && (
        <FadeInSection show={revealStage >= 2} delay={600}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              <h3 className="font-bold text-lg">Don't do this</h3>
            </div>
            <div className="space-y-2 ml-7">
              {analysis.whatNotToDo.map((point, i) => (
                <FadeInSection key={i} show={revealStage >= 2} delay={700 + 100 * i}>
                  <div className="flex gap-2 items-start bg-destructive/10 p-3 rounded-lg">
                    <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </FadeInSection>
      )}

      {/* Stage 5: What to Do Instead - only if not empty */}
      {analysis.whatToDoInstead.length > 0 && (
        <FadeInSection show={revealStage >= 2} delay={1000}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <h3 className="font-bold text-lg">Try this instead</h3>
            </div>
            <div className="space-y-2 ml-7">
              {analysis.whatToDoInstead.map((point, i) => (
                <FadeInSection key={i} show={revealStage >= 2} delay={1100 + 100 * i}>
                  <div className="flex gap-2 items-start bg-success/10 p-3 rounded-lg">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </FadeInSection>
      )}

      {/* Stage 6: Real Talk */}
      <FadeInSection show={revealStage >= 2} delay={1400}>
        <div className="bg-accent/20 border border-accent p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-bold">The main thing</h3>
          </div>
          <p>{analysis.realTalk}</p>
        </div>
      </FadeInSection>
    </Card>
  );
};

export default AnimatedExplanationCard;
