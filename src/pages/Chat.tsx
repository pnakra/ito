import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RiskBadge from "@/components/RiskBadge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Eye, X, Check, MessageCircle } from "lucide-react";
import type { RiskLevel } from "@/data/scenarios";

interface Message {
  role: "user" | "assistant";
  content: string;
  analysis?: {
    riskLevel: RiskLevel;
    assessment: string;
    whatsHappening: string[];
    whatNotToDo: string[];
    whatToDoInstead: string[];
    realTalk: string;
  };
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxLength = 1000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-vibecheck", {
        body: { scenario: input }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.assessment,
        analysis: {
          riskLevel: data.riskLevel,
          assessment: data.assessment,
          whatsHappening: data.whatsHappening,
          whatNotToDo: data.whatNotToDo,
          whatToDoInstead: data.whatToDoInstead,
          realTalk: data.realTalk
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error analyzing scenario:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble analyzing that right now. Can you try rephrasing or asking something else?",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center max-w-2xl">
                <h1 className="text-3xl font-bold mb-4">Chat with Vibecheck</h1>
                <p className="text-muted-foreground mb-6">
                  Describe your situation and I'll give you honest feedback. You can ask follow-up questions and we'll have a real conversation about it.
                </p>
                <p className="text-sm text-muted-foreground">
                  100% anonymous. No data stored.
                </p>
              </Card>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-6 mb-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "user" ? (
                  <Card className="p-4 max-w-[80%] bg-primary text-primary-foreground">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </Card>
                ) : (
                  <Card className="p-6 max-w-[90%] space-y-4">
                    {message.analysis && (
                      <>
                        <div className="flex justify-start mb-4">
                          <RiskBadge level={message.analysis.riskLevel} size="sm" />
                        </div>
                        
                        <p className="font-bold text-lg">{message.analysis.assessment}</p>

                        {/* What's Happening */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            <h3 className="font-bold">What's Actually Happening</h3>
                          </div>
                          <ul className="space-y-2 ml-7">
                            {message.analysis.whatsHappening.map((point, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* What NOT to Do */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <X className="w-5 h-5 text-destructive" />
                            <h3 className="font-bold">What NOT to Do</h3>
                          </div>
                          <div className="space-y-2 ml-7">
                            {message.analysis.whatNotToDo.map((point, i) => (
                              <div key={i} className="flex gap-2 items-start bg-destructive/10 p-2 rounded text-sm">
                                <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* What to Do Instead */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-success" />
                            <h3 className="font-bold">What to Do Instead</h3>
                          </div>
                          <div className="space-y-2 ml-7">
                            {message.analysis.whatToDoInstead.map((point, i) => (
                              <div key={i} className="flex gap-2 items-start bg-success/10 p-2 rounded text-sm">
                                <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Real Talk */}
                        <div className="bg-accent/20 border border-accent p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-5 h-5" />
                            <h3 className="font-bold">Real Talk</h3>
                          </div>
                          <p className="text-sm">{message.analysis.realTalk}</p>
                        </div>
                      </>
                    )}
                    {!message.analysis && (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </Card>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="p-6 max-w-[90%]">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-muted-foreground">Analyzing...</span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background pb-4">
            <Card className="p-4">
              <div className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
                  placeholder="Describe your situation or ask a follow-up question..."
                  className="min-h-[100px] resize-none"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {input.length} / {maxLength}
                  </span>
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="rounded-full"
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
            </Card>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chat;
