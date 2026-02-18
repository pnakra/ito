import { useState, useEffect } from "react";
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

  useEffect(() => {
    const logVisit = async () => {
      try {
        await fetch("https://xzwtpgujdajinvcbfprd.supabase.co/rest/v1/visits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "sb_publishable_paD7DqfoF5qmg1P6xLWcVg_JYpr8AWC",
            "Authorization": "Bearer sb_publishable_paD7DqfoF5qmg1P6xLWcVg_JYpr8AWC",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({})
        });
      } catch (e) {
        // silent
      }
    };
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

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 text-foreground text-center min-h-[1.2em]">
            <TypewriterText text="is this ok?" delay={80} onComplete={() => setHeadlineComplete(true)} />
          </h1>

          {/* Demo hero — exits when user clicks CTA */}
          {!cardsVisible && (
            <div
              className={`w-full max-w-sm mx-auto transition-all duration-350 ${
                headlineComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              } ${demoExiting ? "opacity-0 -translate-y-3 pointer-events-none" : ""}`}
            >
              <HomepageDemo />
            </div>
          )}

          {/* CTA button — shown while demo is visible */}
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

          {/* Choice screen — fades in after demo exits */}
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

              {/* About accordion */}
              <div className="mt-8">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-this" className="border-none">
                    <AccordionTrigger className="justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]]:text-foreground">
                      About ito
                    </AccordionTrigger>
                    <AccordionContent className="text-center pb-4">
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">ito</strong> is an AI-powered tool that helps you understand if things are consensual, even if things are confusing.
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
            </div>
          )}

          {/* About accordion on hero screen */}
          {!cardsVisible && (
            <div
              className={`w-full max-w-xl mx-auto px-1 sm:px-0 mt-8 transition-all duration-500 ${
                headlineComplete ? "opacity-100" : "opacity-0"
              } ${demoExiting ? "opacity-0 pointer-events-none" : ""}`}
              style={{ transitionDelay: "400ms" }}
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-this" className="border-none">
                  <AccordionTrigger className="justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]]:text-foreground">
                    About ito
                  </AccordionTrigger>
                  <AccordionContent className="text-center pb-4">
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">ito</strong> is an AI-powered tool that helps you understand if things are consensual, even if things are confusing.
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
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
