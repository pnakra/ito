import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XOctagon, RotateCcw } from "lucide-react";

interface RefusalCardProps {
  onReset: () => void;
}

const RefusalCard = ({ onReset }: RefusalCardProps) => {
  return (
    <Card className="p-8 border-signal-stop/30 bg-signal-stop/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-center mb-6">
        <div className="p-4 rounded-full bg-signal-stop/10">
          <XOctagon className="w-8 h-8 text-signal-stop" />
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-lg font-medium">I can't help you continue here.</h2>
        
        <p className="text-muted-foreground text-sm">
          Clear boundaries were set. The safest move is to stop.
        </p>
        
        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start over
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RefusalCard;
