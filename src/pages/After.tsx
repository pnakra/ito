import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import ShredButton from "@/components/ShredButton";
import { supabase } from "@/integrations/supabase/client";
import { logFreetext, logAIResponse, resetSessionId } from "@/lib/submissionLogger";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Screen = "intro" | "input" | "results";

interface ReflectionResult {
  clarityCheck: string;
  otherPersonPerspective: string;
  yourPatterns: string;
  accountabilitySteps: string;
  avoidingRepetition: string;
}

interface FollowUpMessage {
  role: "user" | "assistant";
  content: string;
}

const After = () => {
  const [screen, setScreen] = useState<Screen>("intro");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ReflectionResult | null>(null);
  
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpMessages, setFollowUpMessages] = useState<FollowUpMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxLength = 2000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [results, followUpMessages]);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    // Log the initial scenario input
    logFreetext("after-crossed", "scenario", userInput);

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-crossed-line", {
        body: { scenario: userInput },
      });

      if (error) throw error;

      setResults(data as ReflectionResult);
      setScreen("results");
      
      // Log AI response
      logAIResponse("after-crossed", "reflection", data.clarityCheck?.slice(0, 100) || "Reflection generated");
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || isFollowUpLoading) return;

    // Log follow-up message
    logFreetext("after-crossed", "follow-up", followUpInput);

    const userMessage: FollowUpMessage = { role: "user", content: followUpInput };
    setFollowUpMessages(prev => [...prev, userMessage]);
    setFollowUpInput("");
    setIsFollowUpLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("crossed-line-followup", {
        body: { 
          message: followUpInput,
          conversationHistory: followUpMessages,
          originalReflection: results
        }
      });

      if (error) throw error;

      const assistantMessage: FollowUpMessage = {
        role: "assistant",
        content: data.response
      };
      setFollowUpMessages(prev => [...prev, assistantMessage]);
      
      // Log AI follow-up response
      logAIResponse("after-crossed", "follow-up-response", data.response?.slice(0, 100) || "Follow-up response");
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      const errorMessage: FollowUpMessage = {
        role: "assistant",
        content: "I'm having trouble right now. Please try again."
      };
      setFollowUpMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleStartOver = () => {
    setScreen("intro");
    setUserInput("");
    setResults(null);
    setShowFollowUp(false);
    setFollowUpMessages([]);
    setFollowUpInput("");
    resetSessionId(); // Start new session on reset
  };

  if (screen === "intro") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
          <div className="space-y-6">
            <BackButton to="/" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-center animate-fade-in">
              Let's think through what happened.
            </h1>

            <p className="text-center text-muted-foreground animate-fade-in" style={{ animationDelay: '0.05s' }}>
              Sometimes you look back and realize something felt off, or you're worried you went too far. 
              This is a space to slow down and figure it out.
            </p>

            <div className="bg-muted/50 border border-border/50 rounded-lg p-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              This is a guide to help you think things through.
            </div>

            <div className="flex justify-center pt-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <Button 
                onClick={() => setScreen("input")} 
                size="lg"
                className="px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (screen === "input") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <div className="space-y-6 sm:space-y-8">
            <BackButton to="/" />
            <h1 className="text-2xl sm:text-3xl font-semibold">What happened?</h1>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Describe what happened in your own words. You don't have to share every detail — 
                just the parts that matter.
              </p>
              
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.slice(0, maxLength))}
                placeholder="Take your time..."
                className="min-h-[200px] sm:min-h-[250px] text-base"
                disabled={isLoading}
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {userInput.length} / {maxLength}
                </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-between pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setScreen("intro")}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!userInput.trim() || isLoading}
                  size="lg"
                  className="px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Taking a moment...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (screen === "results" && results) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
          <div className="space-y-6 sm:space-y-8">
            <BackButton to="/" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8">
              Here's what came up
            </h1>

            <Card className="p-4 sm:p-6 border-border/50">
              <h2 className="text-lg font-medium mb-3">What might have happened</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.clarityCheck}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-border/50">
              <h2 className="text-lg font-medium mb-3">How they might have felt</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.otherPersonPerspective}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-border/50">
              <h2 className="text-lg font-medium mb-3">Patterns to notice</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.yourPatterns}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-border/50">
              <h2 className="text-lg font-medium mb-3">What you can do now</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.accountabilitySteps}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-border/50">
              <h2 className="text-lg font-medium mb-3">Going forward</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.avoidingRepetition}</p>
            </Card>

            {!showFollowUp ? (
              <Card className="p-4 sm:p-6 border-border/50 bg-accent/30">
                <div className="text-center space-y-4">
                  <MessageCircle className="w-6 h-6 mx-auto text-muted-foreground" />
                  <h3 className="text-base font-medium">Have questions?</h3>
                  <p className="text-muted-foreground text-sm">
                    If you want to talk through anything else, you can keep going.
                  </p>
                  <Button onClick={() => setShowFollowUp(true)} variant="outline">
                    Keep talking
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 sm:p-6 border-border/50">
                <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Keep talking
                </h3>
                
                <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                  {followUpMessages.map((message, index) => (
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
                  
                  {isFollowUpLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleFollowUpSubmit} className="space-y-3">
                  <Textarea
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value.slice(0, maxLength))}
                    placeholder="Ask a question or share more..."
                    className="min-h-[80px] resize-none text-sm"
                    disabled={isFollowUpLoading}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {followUpInput.length} / {maxLength}
                    </span>
                    <Button 
                      type="submit" 
                      disabled={!followUpInput.trim() || isFollowUpLoading}
                      size="sm"
                    >
                      {isFollowUpLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="bg-muted/50 border border-border/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base font-medium mb-3">If someone was hurt</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                If the other person was hurt or uncomfortable, they might need support too.
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• RAINN — <a href="https://rainn.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">rainn.org</a></li>
                <li>• Crisis Text Line — <a href="https://crisistextline.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">crisistextline.org</a></li>
                <li>• Love Is Respect — <a href="https://loveisrespect.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">loveisrespect.org</a></li>
              </ul>
            </div>

            <div className="text-center py-4">
              <p className="text-muted-foreground italic text-sm">
                Thinking about this doesn't make you a bad person. It means you're trying to do better.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6">
              <ShredButton onShred={handleStartOver} />
              <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">
                Start Over
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <a href="/">Return Home</a>
              </Button>
            </div>
          </div>
          <div ref={messagesEndRef} />
        </main>
        <Footer />
      </div>
    );
  }

  return null;
};

export default After;
