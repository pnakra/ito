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
    <div className="animate-fade-in space-y-6 pt-2">
      <div className="space-y-4">
        <div className="bg-card shadow-card rounded-lg p-5">
          <h2 className="text-h2 mb-2">Did that track?</h2>
          <p className="text-muted-foreground text-body">
            If something's off or there's more to the story, you can tell me.
          </p>
        </div>
        
        <button
          onClick={onContinue}
          className="w-full text-left border border-primary text-primary rounded-lg px-5 py-3.5 transition-all duration-150 active:scale-[0.98] hover:bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <div>
              <span className="text-body font-medium block">I want to share more</span>
              <span className="text-caption text-muted-foreground">
                Clarify something or add details
              </span>
            </div>
          </div>
        </button>
        
        <button
          onClick={onDone}
          className="w-full text-left border border-primary text-primary rounded-lg px-5 py-3.5 transition-all duration-150 active:scale-[0.98] hover:bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <div>
              <span className="text-body font-medium block">That makes sense</span>
              <span className="text-caption text-muted-foreground">
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
