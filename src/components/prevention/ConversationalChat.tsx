import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ConversationalChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onDone: () => void;
  isLoading: boolean;
  isActive: boolean;
}

const ConversationalChat = ({ 
  messages, 
  onSendMessage, 
  onDone, 
  isLoading, 
  isActive 
}: ConversationalChatProps) => {
  const [input, setInput] = useState("");
  const maxLength = 500;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isActive) return null;

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-h2 mb-1">Let's talk through it</h2>
        <p className="text-muted-foreground text-body">
          Share more, ask questions, or clarify anything.
        </p>
      </div>

      {messages.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-lg text-body ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card shadow-card"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card shadow-card p-4 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
        placeholder="Type here..."
        className="min-h-[80px] resize-none text-body"
        disabled={isLoading}
      />

      <div className="flex items-center justify-between">
        <span className="text-caption text-muted-foreground">
          {input.length} / {maxLength}
        </span>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={onDone}
            disabled={isLoading}
            size="sm"
            className="text-muted-foreground text-caption"
          >
            Done
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!input.trim() || isLoading}
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

export default ConversationalChat;
