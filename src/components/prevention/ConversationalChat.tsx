import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, User, MessageCircle } from "lucide-react";

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

  // Auto-scroll to bottom when new messages arrive
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
    <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl md:text-2xl font-bold mb-2">Let's talk through it</h2>
      <p className="text-muted-foreground mb-6">
        Share more, ask questions, or clarify anything.
      </p>

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
              )}
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
        placeholder="Type here..."
        className="min-h-[80px] resize-none mb-4"
        disabled={isLoading}
      />

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {input.length} / {maxLength}
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
            disabled={!input.trim() || isLoading}
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

export default ConversationalChat;
