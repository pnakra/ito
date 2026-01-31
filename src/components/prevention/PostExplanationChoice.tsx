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
      <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
        Did we get it right?
      </h2>
      <p className="text-muted-foreground text-center mb-6">
        If something's off or there's more to the story, you can tell us.
      </p>
      
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-auto py-5 px-6 justify-start text-left border-2 hover:border-primary/50 hover:bg-muted"
          onClick={onContinue}
        >
          <div className="flex items-center gap-4">
            <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <span className="font-medium block">I want to share more</span>
              <span className="text-sm text-muted-foreground">
                Clarify something or add details
              </span>
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-5 px-6 justify-start text-left border-2 hover:border-primary/50 hover:bg-muted"
          onClick={onDone}
        >
          <div className="flex items-center gap-4">
            <CheckCircle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="font-medium block">That makes sense</span>
              <span className="text-sm text-muted-foreground">
                I'm good for now
              </span>
            </div>
          </div>
        </Button>
      </div>
    </Card>
  );
};

export default PostExplanationChoice;
