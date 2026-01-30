import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageCircle, Eye, Heart, ArrowRight, Smartphone } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-full animate-fade-in">
            Private · Anonymous · No sign-up
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Not sure what's okay?
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-lg mx-auto px-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            A quick way to think through what's happening — before or after.
          </p>
          
          {/* Three Main Tiles */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-3xl mx-auto px-1 sm:px-0">
            
            {/* Tile 1 - Before */}
            <Link 
              to="/avoid-line"
              className="group bg-card border-2 border-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all flex items-center sm:flex-col text-left relative overflow-hidden animate-fade-in-up hover:scale-[1.02]"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="hidden sm:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
              <div className="bg-primary w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center mr-4 sm:mr-0 sm:mb-4 sm:mx-auto flex-shrink-0 group-hover:animate-float">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-foreground sm:text-center">
                  Before Something Happens
                </h2>
                <p className="text-muted-foreground text-sm mb-0 sm:mb-4 sm:text-center line-clamp-2 sm:line-clamp-none">
                  Not sure if you should keep going? Check here first.
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center text-primary text-sm font-medium">
                Start <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
              <ArrowRight className="w-5 h-5 text-primary sm:hidden flex-shrink-0 ml-2" />
            </Link>

            {/* Tile 2 - After */}
            <Link 
              to="/crossed-line"
              className="group bg-card border-2 border-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-secondary hover:shadow-xl hover:shadow-secondary/10 transition-all flex items-center sm:flex-col text-left relative overflow-hidden animate-fade-in-up hover:scale-[1.02]"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="hidden sm:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full" />
              <div className="bg-secondary w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center mr-4 sm:mr-0 sm:mb-4 sm:mx-auto flex-shrink-0 group-hover:animate-float">
                <MessageCircle className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-foreground sm:text-center">
                  After Something Happened
                </h2>
                <p className="text-muted-foreground text-sm mb-0 sm:mb-4 sm:text-center line-clamp-2 sm:line-clamp-none">
                  Worried you went too far? Think it through here.
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center text-secondary text-sm font-medium">
                Start <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
              <ArrowRight className="w-5 h-5 text-secondary sm:hidden flex-shrink-0 ml-2" />
            </Link>

            {/* Tile 3 - Something happened to me */}
            <Link 
              to="/someone-crossed"
              className="group bg-card border-2 border-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 transition-all flex items-center sm:flex-col text-left relative overflow-hidden animate-fade-in-up hover:scale-[1.02]"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="hidden sm:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent rounded-bl-full" />
              <div className="bg-gradient-to-br from-primary to-secondary w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center mr-4 sm:mr-0 sm:mb-4 sm:mx-auto flex-shrink-0 group-hover:animate-float">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-foreground sm:text-center">
                  Something Happened to Me
                </h2>
                <p className="text-muted-foreground text-sm mb-0 sm:mb-4 sm:text-center line-clamp-2 sm:line-clamp-none">
                  Not sure how you feel about something? Talk through it.
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center text-primary text-sm font-medium">
                Start <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
              <ArrowRight className="w-5 h-5 text-primary sm:hidden flex-shrink-0 ml-2" />
            </Link>
          </div>
        </section>

        {/* What this is */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-lg font-bold mb-4 text-center">What is this?</h2>
              <div className="space-y-3 text-muted-foreground text-sm">
                <p>
                  <strong className="text-foreground">A way to slow down and think.</strong> Sometimes it's hard to tell what's okay. This helps you figure it out.
                </p>
                <p>
                  <strong className="text-foreground">Totally private.</strong> No accounts. Nothing saved. Close the tab and it's gone.
                </p>
                <p>
                  <strong className="text-foreground">Not a replacement for real help.</strong> If you need to talk to someone, check out the <Link to="/resources" className="text-primary underline underline-offset-2 hover:no-underline">resources</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="container mx-auto px-4 py-6 text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <Link 
            to="/install" 
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2"
          >
            <Smartphone className="w-4 h-4" />
            Add to home screen
          </Link>
          <p className="text-xs text-muted-foreground">
            This is an early version — still being improved.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
