import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageSquare } from "lucide-react";

interface FollowUpMessage {
  role: "user" | "assistant";
  content: string;
}

interface AfterFollowUpChatProps {
  messages: FollowUpMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onDone: () => void;
  isLoading: boolean;
  isActive: boolean;
}

const AfterFollowUpChat = ({ 
  messages, 
  onSendMessage, 
  onDone, 
  isLoading, 
  isActive 
}: AfterFollowUpChatProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxLength = 2000;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isActive) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput("");
    await onSendMessage(message);
  };

  return (
    <Card className="p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Keep talking</h3>
      </div>

      {messages.length === 0 && (
        <p className="text-muted-foreground text-sm mb-4">
          Ask questions or share more about what happened.
        </p>
      )}

      <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              message.role === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
          placeholder="Ask a question or share more..."
          className="min-h-[80px] resize-none text-sm"
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {input.length} / {maxLength}
          </span>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onDone}
              disabled={isLoading}
            >
              Done
            </Button>
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default AfterFollowUpChat;
