import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TypewriterText from "@/components/TypewriterText";
import ConsentModal from "@/components/ConsentModal";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const [headlineComplete, setHeadlineComplete] = useState(false);
  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem("ito_consent_given") !== null;
  });

  const handleConsentGiven = useCallback(() => {
    setHasConsent(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ConsentModal onConsentGiven={handleConsentGiven} />
      
      {!hasConsent ? (
        // Show minimal loading state while consent modal is open
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      ) : (
        <>
          <Header />

          <main className="flex-1">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold mb-3 text-foreground px-2 min-h-[1.2em]">
                <TypewriterText text="is this ok?" delay={80} onComplete={() => setHeadlineComplete(true)} />
              </h1>
              <p
                className={`text-base sm:text-lg text-muted-foreground mb-8 max-w-md mx-auto px-2 transition-opacity duration-300 ${headlineComplete ? "opacity-100" : "opacity-0"}`}
              >
                For when you want to stop and think through confusing situations.
              </p>

              {/* Three Main Tiles */}
              <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto px-1 sm:px-0 mb-6">
                {/* Tile 1 - Before */}
                <Link
                  to="/before"
                  className={`group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left border-l-4 border-l-primary ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
                  style={{ animationDelay: "0ms", animationFillMode: "both" }}
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">
                      I might do something with someone
                    </h2>
                    <p className="text-muted-foreground text-sm">Not sure if <strong className="font-semibold text-muted-foreground">it's</strong> okay? Pause and check.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
                </Link>

                {/* Tile 2 - After */}
                <Link
                  to="/after"
                  className={`group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left border-l-4 border-l-secondary ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
                  style={{ animationDelay: "150ms", animationFillMode: "both" }}
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">I already did something</h2>
                    <p className="text-muted-foreground text-sm">Not sure if it <strong className="font-semibold text-muted-foreground">was</strong> okay? Let's figure it out.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
                </Link>
              </div>

              {/* Collapsible What is this? */}
              <div
                className={`max-w-xl mx-auto px-1 sm:px-0 ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: "450ms", animationFillMode: "both" }}
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-this" className="border-none">
                    <AccordionTrigger className="justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]]:text-foreground">
                      What is this?
                    </AccordionTrigger>
                    <AccordionContent className="text-center pb-4">
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">ito</strong> is an AI-powered tool that helps you understand if things are consensual, even if things are
                          confusing.
                        </p>
                        <p>
                          <strong className="text-foreground">Totally private. No need to create an account.</strong> Everything gets deleted when you close the tab.
                        </p>
                        <p>
                          Not a replacement for real support. If you need to talk to someone, check the{" "}
                          <Link to="/resources" className="text-primary underline underline-offset-2 hover:no-underline">
                            resources
                          </Link>
                          .
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </main>

          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;
