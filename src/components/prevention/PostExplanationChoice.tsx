import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, CheckCircle } from "lucide-react";

interface PostExplanationChoiceProps {
  onDone: () => void;
  onContinue: () => void;
  isActive: boolean;
}

const PostExplanationChoice = ({ onDone, onContinue, isActive }: PostExplanationChoiceProps) => {
  if (!isActive) return null;

  return (
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
        What would you like to do?
      </h2>
      
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-auto py-5 px-6 justify-start text-left border-2 hover:border-primary/50 hover:bg-muted"
          onClick={onDone}
        >
          <div className="flex items-center gap-4">
            <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <span className="font-medium block">I get it — I'm done</span>
              <span className="text-sm text-muted-foreground">
                Finish here
              </span>
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-5 px-6 justify-start text-left border-2 hover:border-primary/50 hover:bg-muted"
          onClick={onContinue}
        >
          <div className="flex items-center gap-4">
            <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <span className="font-medium block">I have more questions</span>
              <span className="text-sm text-muted-foreground">
                Keep talking
              </span>
            </div>
          </div>
        </Button>
      </div>
    </Card>
  );
};

export default PostExplanationChoice;
