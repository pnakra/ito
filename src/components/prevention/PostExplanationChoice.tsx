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
    <div className="animate-fade-in space-y-4 pt-4">
      <div className="bg-card shadow-card rounded-[16px] p-5">
        <h2 className="text-h2 mb-2">Did that track?</h2>
        <p className="text-muted-foreground text-[15px]">
          If something's off or there's more to the story, you can tell me.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full text-left border-[1.5px] border-primary text-primary rounded-[12px] px-5 py-3.5 transition-all duration-150 active:scale-[0.98] hover:bg-primary/5"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          <div>
            <span className="text-[15px] font-medium block">I want to share more</span>
            <span className="text-[13px] text-muted-foreground">Clarify something or add details</span>
          </div>
        </div>
      </button>

      <button
        onClick={onDone}
        className="w-full text-left border-[1.5px] border-primary text-primary rounded-[12px] px-5 py-3.5 transition-all duration-150 active:scale-[0.98] hover:bg-primary/5"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <div>
            <span className="text-[15px] font-medium block">That makes sense</span>
            <span className="text-[13px] text-muted-foreground">I'm good for now</span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default PostExplanationChoice;
