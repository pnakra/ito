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
    <div className="animate-fade-in space-y-3 pt-6">
      <p className="text-[15px] text-muted-foreground text-center mb-4">
        Did that track?
      </p>

      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="flex-1 text-center border-[1.5px] border-border rounded-[12px] px-4 py-3 transition-all duration-150 active:scale-[0.98] hover:border-primary/40"
        >
          <MessageSquare className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
          <span className="text-[14px] font-medium block text-foreground">Share more</span>
        </button>

        <button
          onClick={onDone}
          className="flex-1 text-center border-[1.5px] border-border rounded-[12px] px-4 py-3 transition-all duration-150 active:scale-[0.98] hover:border-primary/40"
        >
          <CheckCircle className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
          <span className="text-[14px] font-medium block text-foreground">Makes sense</span>
        </button>
      </div>
    </div>
  );
};

export default PostExplanationChoice;
