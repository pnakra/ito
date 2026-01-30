import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import ShredButton from "@/components/ShredButton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Heart, Shield, HelpCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
  structuredResponse?: {
    acknowledgment: string;
    whatYouExperienced: string;
    yourFeelingsAreValid: string;
    understandingConsent: string;
    whatYouCanDo: string;
    followUpPrompt: string;
  };
}

const SomeoneCrossedLine = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxLength = 2000;

  const handleShred = () => {
    setMessages([]);
    setInput("");
    navigate("/");
  };

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
      // Build conversation history (excluding the message we just added)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke("analyze-someone-crossed", {
        body: { 
          message: input,
          conversationHistory
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "",
      };

      // If it's the first message, include structured response
      if (data.isFirstMessage && data.acknowledgment) {
        assistantMessage.structuredResponse = {
          acknowledgment: data.acknowledgment,
          whatYouExperienced: data.whatYouExperienced,
          yourFeelingsAreValid: data.yourFeelingsAreValid,
          understandingConsent: data.understandingConsent,
          whatYouCanDo: data.whatYouCanDo,
          followUpPrompt: data.followUpPrompt,
        };
        assistantMessage.content = data.followUpPrompt;
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process. Please try again.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble right now. Please try again, or reach out to a trusted person for support.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
          <div className="space-y-6 sm:space-y-8">
            <BackButton to="/" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center animate-fade-in-up">
              Something happened. Let's talk through it.
            </h1>

            <div className="bg-muted/50 border border-border rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground italic text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              This is private. Nothing is saved. This isn't legal or medical advice — just a place to think.
            </div>
            
            <div className="prose prose-lg max-w-none text-foreground space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-base sm:text-xl text-center text-muted-foreground px-2">
                Sometimes things happen that leave you confused or unsure how to feel. 
                You might not know what to call it. That's okay. 
                This is a space to figure it out at your own pace.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 mt-6">
              <Card className="p-4 sm:p-6 border-2 border-primary/20 animate-fade-in-up hover:scale-[1.02] transition-transform" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Your feelings make sense</h3>
                    <p className="text-sm text-muted-foreground">
                      Being confused, upset, or not sure what to feel is totally normal.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 border-2 border-secondary/20 animate-fade-in-up hover:scale-[1.02] transition-transform" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">No pressure, no labels</h3>
                    <p className="text-sm text-muted-foreground">
                      You get to decide what to call it. We're not going to tell you.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 border-2 border-accent/20 animate-fade-in-up hover:scale-[1.02] transition-transform" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">You're in control</h3>
                    <p className="text-sm text-muted-foreground">
                      Share as much or as little as you want. You can ask questions anytime.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-center pt-6 sm:pt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Button 
                onClick={() => setShowIntro(false)} 
                size="lg" 
                className="px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
              >
                Start
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {/* Persistent back button */}
          <div className="mb-4">
            <BackButton to="/" />
          </div>
          
          {/* Welcome message when no messages yet */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-6 sm:p-8 text-center max-w-2xl">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Share what happened</h2>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Describe what happened in your own words. You don't have to share every detail — 
                  just the parts that feel important.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground italic">
                  Take your time.
                </p>
              </Card>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 mb-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "user" ? (
                  <Card className="p-3 sm:p-4 max-w-[85%] sm:max-w-[80%] bg-primary text-primary-foreground">
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                  </Card>
                ) : (
                  <Card className="p-4 sm:p-6 max-w-[95%] sm:max-w-[90%] space-y-4">
                    {message.structuredResponse ? (
                      <>
                        {/* Acknowledgment */}
                        <div className="border-l-4 border-primary pl-4">
                          <p className="text-sm sm:text-base">{message.structuredResponse.acknowledgment}</p>
                        </div>

                        {/* What You Experienced */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            What happened
                          </h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.whatYouExperienced}</p>
                        </div>

                        {/* Your Feelings Are Valid */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Your feelings make sense
                          </h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.yourFeelingsAreValid}</p>
                        </div>

                        {/* Understanding Consent */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            About consent
                          </h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.understandingConsent}</p>
                        </div>

                        {/* What You Can Do */}
                        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                          <h3 className="font-semibold text-sm sm:text-base mb-2">What you can do</h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.whatYouCanDo}</p>
                        </div>

                        {/* Follow-up Prompt */}
                        <div className="pt-2 border-t border-border">
                          <p className="text-sm sm:text-base italic">{message.structuredResponse.followUpPrompt}</p>
                        </div>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                    )}
                  </Card>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="p-4 sm:p-6 max-w-[90%]">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-muted-foreground text-sm sm:text-base">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Support Resources and Shred - always visible */}
          {messages.length > 0 && (
            <div className="space-y-3 mb-4">
              <Card className="p-3 sm:p-4 border-primary/30">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Need support?</span>{" "}
                  <a href="https://rainn.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RAINN</a> · 
                  <a href="https://crisistextline.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Crisis Text Line</a> · 
                  <a href="https://loveisrespect.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Love Is Respect</a>
                </p>
              </Card>
              <div className="flex justify-center">
                <ShredButton onShred={handleShred} />
              </div>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background pb-4">
            <Card className="p-3 sm:p-4">
              <div className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
                  placeholder={messages.length === 0 ? "Share what happened..." : "Ask a question or share more..."}
                  className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">
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

export default SomeoneCrossedLine;
