import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Screen = "intro" | "input" | "results";

interface ReflectionResult {
  clarityCheck: string;
  otherPersonPerspective: string;
  yourPatterns: string;
  accountabilitySteps: string;
  avoidingRepetition: string;
}

const CrossedLine = () => {
  const [screen, setScreen] = useState<Screen>("intro");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ReflectionResult | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [results]);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-crossed-line", {
        body: { scenario: userInput },
      });

      if (error) throw error;

      setResults(data as ReflectionResult);
      setScreen("results");
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setScreen("intro");
    setUserInput("");
    setResults(null);
  };

  if (screen === "intro") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center">
              Let's figure out what happened — calmly.
            </h1>

            <div className="bg-muted/50 border border-border rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground italic text-center">
              This tool does not provide legal advice or mental health treatment. It's a reflective guide — not a substitute for speaking with a professional.
            </div>
            
            <div className="prose prose-lg max-w-none text-foreground space-y-4">
              <p className="text-base sm:text-xl text-center text-muted-foreground px-2">
                Sometimes you realize afterward that a moment felt off — or you worry you crossed a boundary. 
                You're not alone. This space helps you slow down, reflect, and understand next steps without judgment.
              </p>
            </div>

            <div className="flex justify-center pt-6 sm:pt-8">
              <Button 
                onClick={() => setScreen("input")} 
                size="lg" 
                className="px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
              >
                Start reflecting
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">What happened?</h1>
            
            <div className="space-y-4">
              <p className="text-base sm:text-lg text-muted-foreground">
                Can you describe what happened, in your own words? You don't need to share details — 
                just the parts that feel important to understand.
              </p>
              
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Take your time to describe what happened..."
                className="min-h-[200px] sm:min-h-[250px] text-base"
                disabled={isLoading}
              />

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
                      Processing...
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
              Reflection Steps
            </h1>

            <Card className="p-4 sm:p-6 border-2 border-primary/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Clarity Check</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.clarityCheck}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-2 border-secondary/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Understanding Others' Boundaries</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.otherPersonPerspective}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-2 border-accent/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Understanding Your Patterns</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.yourPatterns}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-2 border-warning/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">What Accountability Could Look Like</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.accountabilitySteps}</p>
            </Card>

            <Card className="p-4 sm:p-6 border-2 border-success/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">How to Do Better Next Time</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base">{results.avoidingRepetition}</p>
            </Card>

            <div className="bg-card border-2 border-primary/30 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3">If someone was harmed</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                If someone was hurt or uncomfortable, they may also need support. Everyone deserves safety.
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>• RAINN — <a href="https://rainn.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">rainn.org</a></li>
                <li>• 1in6 — <a href="https://1in6.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">1in6.org</a></li>
                <li>• Crisis Text Line — <a href="https://crisistextline.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">crisistextline.org</a></li>
                <li>• Love Is Respect — <a href="https://loveisrespect.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">loveisrespect.org</a></li>
              </ul>
            </div>

            <div className="text-center py-4 sm:py-6">
              <p className="text-base sm:text-lg text-muted-foreground italic px-2">
                Acknowledging harm doesn't make you a bad person — it means you're taking responsibility for learning and doing better.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6 sm:pt-8">
              <Button variant="outline" onClick={handleStartOver} size="lg" className="w-full sm:w-auto">
                Start Over
              </Button>
              <Button asChild size="lg" className="w-full sm:w-auto">
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

export default CrossedLine;
