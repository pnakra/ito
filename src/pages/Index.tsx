import { useState, useEffect } from "react";
import { logVisit } from "@/lib/logVisit";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import TypewriterText from "@/components/TypewriterText";
import HomepageDemo from "@/components/HomepageDemo";
import { ArrowRight, PenLine, GitFork } from "lucide-react";

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

      <main className="flex-1 flex flex-col justify-start pt-[4vh] sm:pt-[10vh]">
        <section className="container mx-auto px-5 flex flex-col items-center">

          <div className="flex flex-col items-center mb-3 min-h-[1.2em]">
            <h1
              className="text-foreground text-center"
              style={{
                fontFamily: '"Newsreader", "Georgia", serif',
                fontSize: '32px',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '-0.3px',
                fontStyle: 'italic',
              }}
            >
              <TypewriterText text="is this ok?" delay={70} onComplete={() => setHeadlineComplete(true)} />
            </h1>
            <svg
              className="mt-1 text-primary/30"
              width="120"
              height="8"
              viewBox="0 0 120 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 5.5C20 2.5 40 6 60 3.5C80 1 100 5.5 118 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {!cardsVisible && (
            <p
              className={`text-[15px] text-muted-foreground text-center mb-4 sm:mb-8 transition-all duration-300 ${
                headlineComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              } ${demoExiting ? "opacity-0 pointer-events-none" : ""}`}
              style={{ transitionDelay: headlineComplete ? "100ms" : "0ms" }}
            >
               No judgment. No lectures. Just an honest read.
            </p>
          )}

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
              className={`mt-6 flex flex-col items-center gap-2 transition-all duration-300 ${
                headlineComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              } ${demoExiting ? "opacity-0 pointer-events-none" : ""}`}
              style={{ transitionDelay: headlineComplete ? "150ms" : "0ms" }}
            >
              <button
                onClick={handleReady}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-[14px] text-[15px] font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
              >
                What's on your mind?
              </button>
            </div>
          )}

          {cardsVisible && (
            <div className="w-full max-w-lg mx-auto animate-fade-in">
              <p className="text-[14px] text-muted-foreground text-center mb-4">
                For when something felt off, you're not sure how they felt, or you're figuring out your next move.
              </p>
              <div className="space-y-3">
                <Link
                  to="/check-in"
                  className="group bg-card shadow-card rounded-[16px] p-5 hover:shadow-md transition-all duration-150 flex items-center text-left active:scale-[0.99] border-l-[3px] border-l-warning"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <PenLine className="w-5 h-5 text-warning flex-shrink-0" />
                    <div>
                      <h2 className="text-[16px] font-medium mb-1 text-foreground">
                        Just say it
                      </h2>
                      <p className="text-muted-foreground text-[14px]">Write it out like you'd text a friend</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-3 transition-colors" />
                </Link>

                <Link
                  to="/check-in?mode=guided"
                  className="group bg-card shadow-card rounded-[16px] p-5 hover:shadow-md transition-all duration-150 flex items-center text-left active:scale-[0.99] border-l-[3px] border-l-primary"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <GitFork className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h2 className="text-[16px] font-medium mb-1 text-foreground">
                        Help me think through it
                      </h2>
                      <p className="text-muted-foreground text-[14px]">A few quick questions to get started</p>
                    </div>
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
