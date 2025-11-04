import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { analyzeScenario } from "@/data/scenarios";

const Submit = () => {
  const [situation, setSituation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const maxLength = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!situation.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate analysis delay (3-5 seconds)
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    // Analyze the scenario
    const result = analyzeScenario(situation);
    
    // Store result and navigate
    sessionStorage.setItem("vibecheck-result", JSON.stringify(result));
    navigate("/results");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center lowercase">
            get your vibecheck
          </h1>
          <p className="text-xl text-muted-foreground mb-10 text-center lowercase">
            describe what's happening. be specific.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value.slice(0, maxLength))}
                placeholder="what's the situation? be specific. example: i've texted this girl 15 times and she's not responding..."
                className="min-h-[300px] text-lg bg-card border-border resize-none rounded-2xl"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground lowercase">
                  {situation.length} / {maxLength} characters
                </p>
                {situation.length >= maxLength && (
                  <p className="text-sm text-destructive lowercase">character limit reached</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg py-6 rounded-full lowercase"
              disabled={!situation.trim() || isSubmitting}
            >
              {isSubmitting ? "analyzing your vibe..." : "get vibecheck"}
            </Button>

            <p className="text-sm text-center text-muted-foreground lowercase">
              100% anonymous. we don't store identifying info.
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;
