import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RiskBadge from "@/components/RiskBadge";
import { scenarios, Scenario } from "@/data/scenarios";
import { Eye, X, Check, MessageCircle } from "lucide-react";

const Scenarios = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            See What Other Guys Are Asking
          </h1>
          <p className="text-xl text-muted-foreground mb-12 text-center">
            Real scenarios from guys like you
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id}
                className="p-6 bg-card border-border hover:border-foreground/20 transition-colors cursor-pointer"
                onClick={() => setSelectedScenario(scenario)}
              >
                <div className="mb-4">
                  <RiskBadge level={scenario.riskLevel} size="sm" />
                </div>
                <h3 className="font-bold text-lg mb-2">"{scenario.title}"</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {scenario.situation}
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  Read Vibecheck
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/submit">Get Your Own Vibecheck</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Scenario Detail Modal */}
      <Dialog open={!!selectedScenario} onOpenChange={() => setSelectedScenario(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedScenario && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">Scenario Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Risk Badge */}
                <div className="flex justify-center">
                  <RiskBadge level={selectedScenario.riskLevel} />
                </div>

                {/* Situation */}
                <Card className="p-4 bg-muted border-border">
                  <p className="italic">"{selectedScenario.situation}"</p>
                </Card>

                {/* Assessment */}
                <p className="text-lg font-bold leading-relaxed">
                  {selectedScenario.assessment}
                </p>

                {/* What's Actually Happening */}
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-start gap-2 mb-3">
                    <Eye className="w-5 h-5 flex-shrink-0 mt-1" />
                    <h3 className="text-lg font-bold">What's Actually Happening</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedScenario.whatsHappening.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* What NOT to Do */}
                <Card className="p-4 bg-card border-border">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <X className="w-5 h-5 text-destructive" />
                    What NOT to Do
                  </h3>
                  <div className="space-y-2">
                    {selectedScenario.whatNotToDo.map((point, i) => (
                      <div key={i} className="flex gap-2 items-start bg-destructive/10 p-2 rounded text-sm">
                        <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* What to Do Instead */}
                <Card className="p-4 bg-card border-border">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    What to Do Instead
                  </h3>
                  <div className="space-y-2">
                    {selectedScenario.whatToDoInstead.map((point, i) => (
                      <div key={i} className="flex gap-2 items-start bg-success/10 p-2 rounded text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Real Talk */}
                <Card className="p-4 bg-accent border-border">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                    <h3 className="text-lg font-bold">Real Talk</h3>
                  </div>
                  <p className="leading-relaxed text-sm">
                    {selectedScenario.realTalk}
                  </p>
                </Card>

                {/* Resources (Red Flags Only) */}
                {selectedScenario.riskLevel === "red" && (
                  <Card className="p-4 bg-card border-warning">
                    <h3 className="font-bold mb-3">Need to talk to someone?</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                      <p><strong>RAINN:</strong> 1-800-656-HOPE (4673)</p>
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Scenarios;
