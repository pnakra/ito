import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hand, Pause, X } from "lucide-react";
import type { RiskLevel } from "@/types/risk";

interface StopMomentProps {
  riskLevel: RiskLevel;
  stopMessage: string;
  onAcknowledge: () => void;
  onDismiss?: () => void;
}

const StopMoment = ({ riskLevel, stopMessage, onAcknowledge, onDismiss }: StopMomentProps) => {
  const isRed = riskLevel === "red";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm animate-fade-in">
      <Card className={`max-w-lg w-full p-8 border relative ${
        isRed ? "border-signal-stop/30" : "border-signal-pause/30"
      } animate-scale-in shadow-lg`}>
        {/* Yellow-level situations allow dismissal */}
        {!isRed && onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Icon */}
          <div className={`p-4 rounded-xl ${
            isRed ? "bg-signal-stop/10" : "bg-signal-pause/10"
          }`}>
            {isRed ? (
              <Hand className={`w-10 h-10 text-signal-stop`} strokeWidth={1.5} />
            ) : (
              <Pause className={`w-10 h-10 text-signal-pause`} strokeWidth={1.5} />
            )}
          </div>
          
          {/* Header */}
          <h2 className={`text-xl font-medium ${
            isRed ? "text-signal-stop" : "text-signal-pause"
          }`}>
            {isRed ? "Stop and think" : "Something's off"}
          </h2>
          
          {/* Message */}
          <p className="text-foreground/90">
            {stopMessage}
          </p>
          
          {/* Acknowledge Button */}
          <Button
            onClick={onAcknowledge}
            size="lg"
            variant="outline"
            className={`w-full py-5 font-medium border transition-all ${
              isRed 
                ? "border-signal-stop/30 text-signal-stop hover:bg-signal-stop/5" 
                : "border-signal-pause/30 text-signal-pause hover:bg-signal-pause/5"
            }`}
          >
            See what this means for you
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StopMoment;
