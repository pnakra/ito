import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

import { invokeEdgeFunctionWithRetry } from "@/lib/invokeEdgeFunctionWithRetry";
import { logFreetext, logAIResponse, resetSessionId } from "@/lib/submissionLogger";
import { Loader2, Send, Heart, Shield, HelpCircle, ArrowRight, RotateCcw } from "lucide-react";
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

const HappenedToMe = () => {
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
    resetSessionId(); // Start new session
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

    // Log user message
    const isFirstMessage = messages.length === 0;
    logFreetext("after-someone-crossed", isFirstMessage ? "initial-message" : "follow-up", input);

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const data = await invokeEdgeFunctionWithRetry<{
        response?: string;
        isFirstMessage?: boolean;
        acknowledgment?: string;
        whatYouExperienced?: string;
        yourFeelingsAreValid?: string;
        understandingConsent?: string;
        whatYouCanDo?: string;
        followUpPrompt?: string;
      }>(
        "analyze-someone-crossed",
        {
          message: input,
          conversationHistory,
        },
        { maxRetries: 3, baseDelayMs: 600, label: "analyze-someone-crossed" },
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "",
      };

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
      
      // Log AI response
      const responseSummary = data.acknowledgment?.slice(0, 100) || data.response?.slice(0, 100) || "Response generated";
      logAIResponse("after-someone-crossed", isFirstMessage ? "initial-response" : "follow-up-response", responseSummary);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble right now. Please try again, or reach out to someone you trust.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
          <div className="space-y-6 sm:space-y-8">
            <BackButton to="/" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-center animate-fade-in">
              Something happened. Let's talk through it.
            </h1>

            <div className="bg-muted/50 border border-border/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground text-center animate-fade-in" style={{ animationDelay: '0.05s' }}>
              This is a private, anonymous space. Nothing you share is saved. This isn't therapy or legal advice. It's here to help you think and feel things through.
            </div>
            
            <p className="text-center text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Sometimes things happen that leave you confused or unsure how to feel. 
              You might not know what to call it. That's okay. 
              This is a space to figure it out at your own pace.
            </p>

            <div className="grid gap-4 mt-6">
              <Card className="p-4 sm:p-5 border-border/50 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-start gap-3">
                  <Heart className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Your feelings make sense</h3>
                    <p className="text-xs text-muted-foreground">
                      Being confused, upset, or not sure what to feel is totally normal.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-5 border-border/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">No pressure, no labels</h3>
                    <p className="text-xs text-muted-foreground">
                      You get to decide what to call it. We're not going to tell you.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-5 border-border/50 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">You're in control</h3>
                    <p className="text-xs text-muted-foreground">
                      Share as much or as little as you want. You can ask questions anytime.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-center pt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                onClick={() => setShowIntro(false)} 
                size="lg" 
                className="px-8 w-full sm:w-auto"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-4">
            <BackButton to="/" />
          </div>
          
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-6 sm:p-8 text-center max-w-2xl border-border/50">
                <h2 className="text-lg font-medium mb-3">Share what happened</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Describe what happened in your own words. You don't have to share every detail — 
                  just the parts that feel important.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Take your time.
                </p>
              </Card>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "user" ? (
                  <Card className="p-3 sm:p-4 max-w-[85%] sm:max-w-[80%] bg-primary text-primary-foreground border-0">
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </Card>
                ) : (
                  <Card className="p-4 sm:p-5 max-w-[95%] sm:max-w-[90%] space-y-4 border-border/50">
                    {message.structuredResponse ? (
                      <>
                        <div className="border-l-2 border-primary/50 pl-4">
                          <p className="text-sm">{message.structuredResponse.acknowledgment}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium text-sm flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            What happened
                          </h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.whatYouExperienced}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium text-sm flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5" />
                            Your feelings make sense
                          </h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.yourFeelingsAreValid}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium text-sm flex items-center gap-2">
                            <HelpCircle className="w-3.5 h-3.5" />
                            About consent
                          </h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.understandingConsent}</p>
                        </div>

                        <div className="bg-accent/30 border border-border/50 rounded-lg p-4">
                          <h3 className="font-medium text-sm mb-2">What you can do</h3>
                          <p className="text-muted-foreground text-sm">{message.structuredResponse.whatYouCanDo}</p>
                        </div>

                        <div className="pt-2 border-t border-border/50">
                          <p className="text-sm italic">{message.structuredResponse.followUpPrompt}</p>
                        </div>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    )}
                  </Card>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="p-4 sm:p-5 border-border/50">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">Taking a moment...</span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length > 0 && (
            <div className="space-y-3 mb-4">
              <Card className="p-3 sm:p-4 border-border/50">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Need support?</span>{" "}
                  <a href="https://rainn.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RAINN</a> · 
                  <a href="https://crisistextline.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Crisis Text Line</a> · 
                  <a href="https://loveisrespect.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Love Is Respect</a>
                </p>
              </Card>
              <div className="flex justify-center">
                <Button variant="ghost" onClick={handleShred} className="text-muted-foreground text-sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start over
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background pb-4">
            <Card className="p-3 sm:p-4 border-border/50">
              <div className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
                  placeholder={messages.length === 0 ? "Share what happened..." : "Ask a question or share more..."}
                  className="min-h-[80px] sm:min-h-[100px] resize-none text-sm"
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {input.length} / {maxLength}
                  </span>
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
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

export default HappenedToMe;
