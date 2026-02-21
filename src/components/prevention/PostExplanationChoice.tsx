import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle } from "lucide-react";

interface PostExplanationChoiceProps {
  onDone: () => void;
  onContinue: () => void;
  isActive: boolean;
}

const PostExplanationChoice = ({ onDone, onContinue, isActive }: PostExplanationChoiceProps) => {
  if (!isActive) return null;

  return (
    <div className="animate-fade-in space-y-4 pt-2">
      <h2 className="text-base font-semibold">
        Did that track?
      </h2>
      <p className="text-muted-foreground text-sm">
        If something's off or there's more to the story, you can tell me.
      </p>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={onContinue}
          className="text-left px-4 py-3.5 rounded-md border border-border hover:border-primary/30 transition-all duration-150 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <span className="text-sm font-medium block">I want to share more</span>
              <span className="text-xs text-muted-foreground">
                Clarify something or add details
              </span>
            </div>
          </div>
        </button>
        
        <button
          onClick={onDone}
          className="text-left px-4 py-3.5 rounded-md border border-border hover:border-primary/30 transition-all duration-150 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="text-sm font-medium block">That makes sense</span>
              <span className="text-xs text-muted-foreground">
                I'm good for now
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PostExplanationChoice;
