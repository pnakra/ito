import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RiskBadge from "@/components/RiskBadge";
import { Scenario } from "@/data/scenarios";
import { Eye, X, Check, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";

const Results = () => {
  const [result, setResult] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = sessionStorage.getItem("vibecheck-result");
    if (!storedResult) {
      navigate("/submit");
      return;
    }
    setResult(JSON.parse(storedResult));
  }, [navigate]);

  if (!result) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Risk Badge */}
          <div className="flex justify-center">
            <RiskBadge level={result.riskLevel} />
          </div>

          {/* Assessment */}
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold leading-relaxed">
              {result.assessment}
            </p>
          </div>

          {/* What's Actually Happening */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold">What's Actually Happening</h2>
            </div>
            <ul className="space-y-3">
              {result.whatsHappening.map((point, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-muted-foreground">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* What NOT to Do */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <X className="w-6 h-6 text-destructive" />
              What NOT to Do
            </h2>
            <div className="space-y-3">
              {result.whatNotToDo.map((point, i) => (
                <div key={i} className="flex gap-3 items-start bg-destructive/10 p-3 rounded">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* What to Do Instead */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Check className="w-6 h-6 text-success" />
              What to Do Instead
            </h2>
            <div className="space-y-3">
              {result.whatToDoInstead.map((point, i) => (
                <div key={i} className="flex gap-3 items-start bg-success/10 p-3 rounded">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Real Talk */}
          <Card className="p-6 bg-accent border-border">
            <div className="flex items-start gap-3 mb-3">
              <MessageCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold">Real Talk</h2>
            </div>
            <p className="text-lg leading-relaxed">
              {result.realTalk}
            </p>
          </Card>

          {/* Resources (Red Flags Only) */}
          {result.riskLevel === "red" && (
            <Card className="p-6 bg-card border-warning">
              <h2 className="text-xl font-bold mb-4">Need to talk to someone?</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                <p><strong>RAINN:</strong> 1-800-656-HOPE (4673)</p>
                <p className="text-muted-foreground mt-4">
                  These resources are confidential and available 24/7
                </p>
              </div>
            </Card>
          )}

          {/* Feedback */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold mb-4">Was this helpful?</h2>
            <div className="flex gap-4">
              <Button
                variant={feedback === "yes" ? "default" : "outline"}
                onClick={() => setFeedback("yes")}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes
              </Button>
              <Button
                variant={feedback === "no" ? "default" : "outline"}
                onClick={() => setFeedback("no")}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                No
              </Button>
            </div>
            {feedback && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Thanks for your feedback!
              </p>
            )}
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1" size="lg">
              <Link to="/submit">Get Another Vibecheck</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link to="/scenarios">See More Scenarios</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
