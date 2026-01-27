import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";

interface FollowUpChatProps {
  onSubmit: (message: string) => void;
  onDone: () => void;
  isLoading: boolean;
  isActive: boolean;
}

const FollowUpChat = ({ onSubmit, onDone, isLoading, isActive }: FollowUpChatProps) => {
  const [message, setMessage] = useState("");
  const maxLength = 500;

  if (!isActive) return null;

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  return (
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl md:text-2xl font-bold mb-2">What else is on your mind?</h2>
      <p className="text-muted-foreground mb-6">
        Share more context, ask questions, or tell me what you're still unsure about.
      </p>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
        placeholder="Type here..."
        className="min-h-[100px] resize-none mb-4"
        disabled={isLoading}
      />

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {message.length} / {maxLength}
        </span>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onDone}
            disabled={isLoading}
          >
            I'm done
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!message.trim() || isLoading}
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Send <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FollowUpChat;
