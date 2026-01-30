import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XOctagon, RotateCcw } from "lucide-react";

interface RefusalCardProps {
  onReset: () => void;
}

const RefusalCard = ({ onReset }: RefusalCardProps) => {
  return (
    <Card className="p-8 border-destructive/50 bg-destructive/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-center mb-6">
        <div className="p-4 rounded-full bg-destructive/20">
          <XOctagon className="w-10 h-10 text-destructive" />
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">This isn't something I can help with.</h2>
        
        <p className="text-muted-foreground">
          Based on what you shared, the right move here is to stop. 
          Respecting someone's boundaries is always the answer.
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
