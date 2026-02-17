import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TypewriterText from "@/components/TypewriterText";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const [headlineComplete, setHeadlineComplete] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-10 text-foreground px-2 min-h-[1.2em]">
            <TypewriterText text="is this ok?" delay={80} onComplete={() => setHeadlineComplete(true)} />
          </h1>

          <div className="max-w-xl mx-auto px-1 sm:px-0 space-y-6">
            <Link
              to="/check-in"
              className={`group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left border-l-4 border-l-primary ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
              style={{ animationDelay: "0ms", animationFillMode: "both" }}
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
              className={`group bg-card border border-border/50 rounded-xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
              style={{ animationDelay: "150ms", animationFillMode: "both" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-muted-foreground">
                  Not sure where to start? <span className="text-primary font-medium">Answer some guided questions first</span>
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
            </Link>
          </div>

          <div
            className={`max-w-xl mx-auto px-1 sm:px-0 ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
            style={{ animationDelay: "450ms", animationFillMode: "both" }}
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
