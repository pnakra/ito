import { useState, useEffect } from "react";
import { logVisit } from "@/lib/logVisit";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TypewriterText from "@/components/TypewriterText";
import HomepageDemo from "@/components/HomepageDemo";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [headlineComplete, setHeadlineComplete] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [demoExiting, setDemoExiting] = useState(false);

  useEffect(() => {
    logVisit();
  }, []);

  const handleReady = () => {
    setDemoExiting(true);
    setTimeout(() => setCardsVisible(true), 250);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col justify-center">
        <section className="container mx-auto px-5 py-10 sm:py-16 flex flex-col items-center">

          <h1 className="text-h1 mb-8 text-foreground text-center min-h-[1.2em]">
            <TypewriterText text="is this ok?" delay={70} onComplete={() => setHeadlineComplete(true)} />
          </h1>

          {!cardsVisible && (
            <div
              className={`w-full max-w-sm mx-auto transition-all duration-200 ${
                headlineComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              } ${demoExiting ? "opacity-0 -translate-y-2 pointer-events-none" : ""}`}
            >
              <HomepageDemo />
            </div>
          )}

          {!cardsVisible && (
            <div
              className={`mt-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                headlineComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              } ${demoExiting ? "opacity-0 pointer-events-none" : ""}`}
              style={{ transitionDelay: headlineComplete ? "150ms" : "0ms" }}
            >
              <button
                onClick={handleReady}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-[14px] text-[15px] font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
              >
                Try it out
              </button>
            </div>
          )}

          {cardsVisible && (
            <div className="w-full max-w-lg mx-auto animate-fade-in">
              <p className="text-center text-[13px] text-muted-foreground mb-5">Where do you want to start?</p>

              <div className="space-y-3">
                <Link
                  to="/check-in"
                  className="group bg-card shadow-card rounded-[16px] p-5 hover:shadow-md transition-all duration-150 flex items-center text-left active:scale-[0.99]"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-h2 mb-1 text-foreground">
                      Something's on my mind
                    </h2>
                    <p className="text-muted-foreground text-[15px]">Talk through a situation that feels off</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-3 transition-colors" />
                </Link>

                <Link
                  to="/check-in?mode=guided"
                  className="group bg-card shadow-card rounded-[16px] p-4 hover:shadow-md transition-all duration-150 flex items-center text-left active:scale-[0.99]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-muted-foreground">
                      Not sure where to start? <span className="text-primary font-medium">Answer a few questions first</span>
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-3 transition-colors" />
                </Link>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default Index;
