import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageCircle, Eye, Heart, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-10 sm:py-16 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
            No accounts · No tracking · Just clarity
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Know the vibe. Know the line.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            A quick check-in when you're not sure what's happening — or what happened.
          </p>
          
          {/* Three Main Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            
            {/* Tile 1 - Reality Check */}
            <Link 
              to="/avoid-line"
              className="group bg-white border-2 border-transparent rounded-2xl p-5 sm:p-6 hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
              <div className="bg-primary w-11 h-11 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-2 text-foreground text-center sm:text-left">
                Reality Check
              </h2>
              <p className="text-muted-foreground text-sm mb-4 flex-1 text-center sm:text-left">
                Not sure if something's okay? Think it through first.
              </p>
              <div className="flex items-center justify-center sm:justify-start text-primary text-sm font-medium">
                Start <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tile 2 - Second Thoughts */}
            <Link 
              to="/crossed-line"
              className="group bg-white border-2 border-transparent rounded-2xl p-5 sm:p-6 hover:border-secondary hover:shadow-xl hover:shadow-secondary/10 transition-all flex flex-col text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full" />
              <div className="bg-secondary w-11 h-11 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-2 text-foreground text-center sm:text-left">
                Second Thoughts
              </h2>
              <p className="text-muted-foreground text-sm mb-4 flex-1 text-center sm:text-left">
                Something already happened? Reflect on it here.
              </p>
              <div className="flex items-center justify-center sm:justify-start text-secondary text-sm font-medium">
                Reflect <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tile 3 - Need to Talk */}
            <Link 
              to="/someone-crossed"
              className="group bg-white border-2 border-transparent rounded-2xl p-5 sm:p-6 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent rounded-bl-full" />
              <div className="bg-gradient-to-br from-primary to-secondary w-11 h-11 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-2 text-foreground text-center sm:text-left">
                Need to Talk
              </h2>
              <p className="text-muted-foreground text-sm mb-4 flex-1 text-center sm:text-left">
                Something happened to you? Process it at your pace.
              </p>
              <div className="flex items-center justify-center sm:justify-start text-primary text-sm font-medium">
                Talk <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* What this is */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
              <h2 className="text-lg font-bold mb-4 text-center">What is this?</h2>
              <div className="space-y-3 text-muted-foreground text-sm">
                <p>
                  <strong className="text-foreground">A reality check, not a lecture.</strong> You already know what consent is. This is for when things feel unclear.
                </p>
                <p>
                  <strong className="text-foreground">Completely anonymous.</strong> No accounts, no tracking. Close the tab and it's gone.
                </p>
                <p>
                  <strong className="text-foreground">Not a replacement for real help.</strong> If you need support, check the <Link to="/resources" className="text-primary underline underline-offset-2 hover:no-underline">resources</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="container mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Built for early exploration — not a finished product.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
