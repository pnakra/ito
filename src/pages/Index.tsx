import { useState, useEffect } from "react";
import { logVisit } from "@/lib/logVisit";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TypewriterText from "@/components/TypewriterText";
import HomepageDemo from "@/components/HomepageDemo";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const [headlineComplete, setHeadlineComplete] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [demoExiting, setDemoExiting] = useState(false);

  // ✅ VISIT LOGGER (runs once per page load)
  useEffect(() => {
    logVisit();
  }, []);

  const handleReady = () => {
    setDemoExiting(true);
    setTimeout(() => setCardsVisible(true), 350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 sm:py-20 flex flex-col items-center">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 text-foreground text-center min-h-[1.2em]">
            <TypewriterText text="is this ok?" delay={80} onComplete={() => setHeadlineComplete(true)} />
          </h1>

          {!cardsVisible && (
            <div
              className={`w-full max-w-sm mx-auto transition-all duration-350 ${
                headlineComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              } ${demoExiting ? "opacity-0 -translate-y-3 pointer-events-none" : ""}`}
            >
              <HomepageDemo />
            </div>
          )}

          {!cardsVisible && (
            <div
              className={`mt-10 flex flex-col items-center gap-2 transition-all duration-500 ${
                headlineComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              } ${demoExiting ? "opacity-0 pointer-events-none" : ""}`}
              style={{ transitionDelay: headlineComplete ? "200ms" : "0ms" }}
            >
              <button
                onClick={handleReady}
                className="bg-primary text-primary-foreground px-7 py-3 rounded-full text-base font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
              >
                Ready to try it out?
              </button>
            </div>
          )}

          {cardsVisible && (
            <div className="w-full max-w-xl mx-auto px-1 sm:px-0 animate-fade-in">
              <p className="text-center text-sm text-muted-foreground mb-6">Where would you like to start?</p>

              <div className="space-y-4">
                <Link
                  to="/check-in"
                  className="group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left border-l-4 border-l-primary"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">
                      Something's on my mind
                    </h2>
                    <p className="text-muted-foreground text-sm">Stop and think through a confusing situation.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
                </Link>

                <Link
                  to="/check-in?mode=guided"
                  className="group bg-card border border-border/50 rounded-xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Not sure where to start? <span className="text-primary font-medium">Answer some guided questions first</span>
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
                </Link>
              </div>
            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
