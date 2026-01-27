import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertOctagon, AlertTriangle } from "lucide-react";
import type { RiskLevel } from "@/data/scenarios";

interface StopMomentProps {
  riskLevel: RiskLevel;
  stopMessage: string;
  onAcknowledge: () => void;
}

const StopMoment = ({ riskLevel, stopMessage, onAcknowledge }: StopMomentProps) => {
  const isRed = riskLevel === "red";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className={`max-w-lg w-full p-8 border-4 ${
        isRed ? "border-destructive" : "border-warning"
      } animate-in zoom-in-95 duration-300`}>
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className={`p-4 rounded-full ${
            isRed ? "bg-destructive/20" : "bg-warning/20"
          }`}>
            {isRed ? (
              <AlertOctagon className={`w-16 h-16 text-destructive`} strokeWidth={2.5} />
            ) : (
              <AlertTriangle className={`w-16 h-16 text-warning`} strokeWidth={2.5} />
            )}
          </div>
          
          {/* Header */}
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${
              isRed ? "text-destructive" : "text-warning"
            }`}>
              {isRed ? "STOP" : "PAUSE"}
            </h2>
            <p className="text-muted-foreground">
              {isRed ? "This is a hard stop." : "Take a moment before continuing."}
            </p>
          </div>
          
          {/* Message */}
          <p className="text-xl font-medium leading-relaxed">
            {stopMessage}
          </p>
          
          {/* Acknowledge Button */}
          <Button
            onClick={onAcknowledge}
            size="lg"
            className={`mt-4 w-full py-6 text-lg font-semibold ${
              isRed 
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                : "bg-warning hover:bg-warning/90 text-warning-foreground"
            }`}
          >
            I understand
          </Button>
          
          {/* Subtext */}
          <p className="text-sm text-muted-foreground">
            {isRed 
              ? "Proceeding without consent can cause serious harm."
              : "Clear communication protects both of you."
            }
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StopMoment;
