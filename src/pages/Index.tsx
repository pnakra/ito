import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TypewriterText from "@/components/TypewriterText";
import { ArrowRight, CircleDot, MessageCircle, HeartHandshake } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const [headlineComplete, setHeadlineComplete] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
              className={`group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
              style={{ animationDelay: "0ms", animationFillMode: "both" }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <CircleDot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">
                  I want to do something with someone
                </h2>
                <p className="text-muted-foreground text-sm">Not sure if it's okay? Pause and check.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
            </Link>

            {/* Tile 2 - After */}
            <Link
              to="/after"
              className={`group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
              style={{ animationDelay: "150ms", animationFillMode: "both" }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-secondary/15 transition-colors">
                <MessageCircle className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">I already did something</h2>
                <p className="text-muted-foreground text-sm">Not sure if it was okay? Let's figure it out.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
            </Link>

            {/* Tile 3 - Something happened to me */}
            <Link
              to="/happened-to-me"
              className={`group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center text-left ${headlineComplete ? "animate-fade-in" : "opacity-0"}`}
              style={{ animationDelay: "300ms", animationFillMode: "both" }}
            >
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-accent/80 transition-colors">
                <HeartHandshake className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">Someone did something to me</h2>
                <p className="text-muted-foreground text-sm">Not sure how you feel about it? Talk it through.</p>
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
                <AccordionContent className="text-left pb-4">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                    <p>
                      ito is an AI-powered tool that helps you understand if things are consensual, even if things are
                      confusing.
                    </p>
                    <p>
                      <strong className="text-foreground">Totally private.</strong> No accounts. Nothing saved. Close
                      the tab and it's gone.
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

        {/* PWA install link - commented out for prototype */}
        {/* <section 
          className={`container mx-auto px-4 py-6 text-center space-y-2 ${headlineComplete ? 'animate-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '550ms', animationFillMode: 'both' }}
        >
          <Link 
            to="/install" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Add to home screen
          </Link>
        </section> */}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
