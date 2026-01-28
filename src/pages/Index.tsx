import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageCircle, Eye, Heart, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Know the vibe. Know the line.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            A quick check-in when you're not sure what's happening — or what happened.
          </p>
          
          {/* Three Main Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            
            {/* Tile 1 - Check In */}
            <Link 
              to="/avoid-line"
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-lg transition-all flex flex-col text-left"
            >
              <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                Check In
              </h2>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Not sure if something's okay? Get a quick reality check before you act.
              </p>
              <div className="flex items-center text-primary text-sm font-medium">
                Start <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tile 2 - I Messed Up */}
            <Link 
              to="/crossed-line"
              className="group bg-card border border-border rounded-2xl p-6 hover:border-secondary hover:shadow-lg transition-all flex flex-col text-left"
            >
              <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h2 className="text-lg font-bold mb-2 text-foreground group-hover:text-secondary transition-colors">
                Second Thoughts
              </h2>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Think you might have crossed a line? Reflect on what happened — no judgment.
              </p>
              <div className="flex items-center text-secondary text-sm font-medium">
                Reflect <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tile 3 - Something Happened to Me */}
            <Link 
              to="/someone-crossed"
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/60 hover:shadow-lg transition-all flex flex-col text-left"
            >
              <div className="bg-gradient-to-br from-primary/80 to-secondary/80 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                Something Happened to Me
              </h2>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Need to process something that felt off? Talk through it at your own pace.
              </p>
              <div className="flex items-center text-primary text-sm font-medium">
                Talk <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* What this is */}
        <section className="container mx-auto px-4 py-10 sm:py-14">
          <div className="max-w-2xl mx-auto bg-muted/50 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4 text-center">What is this?</h2>
            <div className="space-y-3 text-muted-foreground text-sm sm:text-base">
              <p>
                <strong className="text-foreground">A reality check, not a lecture.</strong> You already know what consent is. This is for when a situation feels unclear and you want to think it through.
              </p>
              <p>
                <strong className="text-foreground">Completely anonymous.</strong> No accounts, no tracking, no data stored. Close the tab and it's gone.
              </p>
              <p>
                <strong className="text-foreground">Not a replacement for real help.</strong> If you need support, check the <Link to="/resources" className="text-primary underline hover:no-underline">resources</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy note */}
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
