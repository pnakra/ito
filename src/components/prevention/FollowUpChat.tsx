import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

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
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-h2 mb-1">What else is on your mind?</h2>
        <p className="text-muted-foreground text-body">
          Share more or ask questions.
        </p>
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
        placeholder="Type here..."
        className="min-h-[100px] resize-none text-body"
        disabled={isLoading}
      />

      <div className="flex justify-between items-center">
        <span className="text-caption text-muted-foreground">
          {message.length} / {maxLength}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={onDone}
            disabled={isLoading}
            className="text-muted-foreground text-caption"
          >
            Done
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!message.trim() || isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-1.5" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpChat;
