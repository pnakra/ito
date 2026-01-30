import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hand, Pause } from "lucide-react";
import type { RiskLevel } from "@/types/risk";

interface StopMomentProps {
  riskLevel: RiskLevel;
  stopMessage: string;
  onAcknowledge: () => void;
}

const StopMoment = ({ riskLevel, stopMessage, onAcknowledge }: StopMomentProps) => {
  const isRed = riskLevel === "red";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-fade-in">
      <Card className={`max-w-lg w-full p-8 border-2 ${
        isRed ? "border-signal-stop/40" : "border-signal-pause/40"
      } animate-scale-in shadow-xl`}>
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon - softer, friendlier */}
          <div className={`p-5 rounded-2xl ${
            isRed ? "bg-signal-stop/10" : "bg-signal-pause/10"
          } animate-float`}>
            {isRed ? (
              <Hand className={`w-12 h-12 text-signal-stop`} strokeWidth={1.5} />
            ) : (
              <Pause className={`w-12 h-12 text-signal-pause`} strokeWidth={1.5} />
            )}
          </div>
          
          {/* Header - friendlier language */}
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${
              isRed ? "text-signal-stop" : "text-signal-pause"
            }`}>
              {isRed ? "Hold up" : "Let's pause here"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isRed ? "This needs your attention." : "Just want to make sure you see this."}
            </p>
          </div>
          
          {/* Message */}
          <p className="text-lg leading-relaxed text-foreground/90">
            {stopMessage}
          </p>
          
          {/* Acknowledge Button - softer language */}
          <Button
            onClick={onAcknowledge}
            size="lg"
            variant="outline"
            className={`mt-4 w-full py-6 text-base font-medium border-2 transition-all ${
              isRed 
                ? "border-signal-stop/50 text-signal-stop hover:bg-signal-stop/10" 
                : "border-signal-pause/50 text-signal-pause hover:bg-signal-pause/10"
            }`}
          >
            Got it, show me more
          </Button>
          
          {/* Subtext - less scary */}
          <p className="text-sm text-muted-foreground max-w-xs">
            {isRed 
              ? "Taking a moment to think is a good thing."
              : "Clear communication helps everyone."
            }
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StopMoment;
