import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, Smartphone } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="inline-block mb-4 px-3 py-1.5 bg-accent text-muted-foreground text-xs font-medium rounded-full animate-fade-in">
            No accounts · No tracking · Just answers
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold mb-4 text-foreground px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            When you're not sure — pause here.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-12 max-w-md mx-auto px-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            When things start to get physical — or confusing.
          </p>
          
          {/* Three Main Tiles */}
          <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto px-1 sm:px-0">
            
            {/* Tile 1 - Before */}
            <Link 
              to="/before"
              className="group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-border hover:shadow-sm transition-all flex items-center text-left animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">
                  Before anything happens
                </h2>
                <p className="text-muted-foreground text-sm">
                  Not sure if something's okay? Pause and check.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground flex-shrink-0 ml-4 transition-colors" />
            </Link>

            {/* Tile 2 - After */}
            <Link 
              to="/after"
              className="group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-border hover:shadow-sm transition-all flex items-center text-left animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">
                  After something happened
                </h2>
                <p className="text-muted-foreground text-sm">
                  Something already happened? Let's figure it out.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground flex-shrink-0 ml-4 transition-colors" />
            </Link>

            {/* Tile 3 - Something happened to me */}
            <Link 
              to="/happened-to-me"
              className="group bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-border hover:shadow-sm transition-all flex items-center text-left animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-medium mb-1 text-foreground">
                  Something happened to me
                </h2>
                <p className="text-muted-foreground text-sm">
                  Something happened to you? Talk it through at your pace.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground flex-shrink-0 ml-4 transition-colors" />
            </Link>
          </div>
        </section>

        {/* What this is */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-md mx-auto">
            <div className="rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-base font-medium mb-4 text-center text-foreground">What is this?</h2>
              <div className="space-y-3 text-muted-foreground text-sm">
                <p>
                  You probably know the basics of consent. This is for when things feel unclear.
                </p>
                <p>
                  <strong className="text-foreground">Totally private.</strong> No accounts. Nothing saved. Close the tab and it's gone.
                </p>
                <p>
                  Not a replacement for support from real people. If you need to talk to someone, check out the <Link to="/resources" className="text-primary underline underline-offset-2 hover:no-underline">resources</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="container mx-auto px-4 py-6 text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <Link 
            to="/install" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Add to home screen
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
