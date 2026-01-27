import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageSquare, Eye, Check, Shield, Lightbulb, BookOpen, Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight bg-gradient-primary bg-clip-text text-transparent">
            Know the vibe. Know the line.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Three paths to help you understand what's happening — <em>before, after, or when something happened to you</em>.
          </p>
          
          {/* Three Main Tiles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mt-10 sm:mt-16">
            {/* Tile 1 - Prevention */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 hover:border-primary transition-colors flex flex-col">
              <div className="bg-gradient-primary w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Eye className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">I want to avoid crossing a line</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm italic">
                get guidance for a situation you're unsure about
              </p>
              <ul className="text-left text-muted-foreground space-y-2 mb-6 sm:mb-8 flex-1 text-xs sm:text-sm">
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Ask a question anonymously</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Get clear, calm steps</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Understand consent signals</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Learn how to slow down or stop</li>
              </ul>
              <Button asChild size="lg" className="w-full text-sm sm:text-base py-4 sm:py-5 rounded-full">
                <Link to="/avoid-line">Check a situation</Link>
              </Button>
            </div>

            {/* Tile 2 - Reflection (I crossed) */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 hover:border-secondary transition-colors flex flex-col">
              <div className="bg-gradient-to-br from-secondary to-secondary/70 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MessageSquare className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">I think I crossed a line</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm italic">
                reflect on something that already happened
              </p>
              <ul className="text-left text-muted-foreground space-y-2 mb-6 sm:mb-8 flex-1 text-xs sm:text-sm">
                <li className="flex gap-2"><Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />Figure out what actually happened</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />Understand why it might have happened</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />Learn what accountability looks like</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />Get support-oriented next steps</li>
              </ul>
              <Button asChild size="lg" variant="secondary" className="w-full text-sm sm:text-base py-4 sm:py-5 rounded-full">
                <Link to="/crossed-line">Reflect on what happened</Link>
              </Button>
            </div>

            {/* Tile 3 - Someone crossed with me (NEW) */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 hover:border-accent transition-colors flex flex-col">
              <div className="bg-gradient-to-br from-accent to-accent/70 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Heart className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">I think someone crossed a line with me</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm italic">
                process something that happened to you
              </p>
              <ul className="text-left text-muted-foreground space-y-2 mb-6 sm:mb-8 flex-1 text-xs sm:text-sm">
                <li className="flex gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Understand what happened — at your pace</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />No labels — that's your decision</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Validate your feelings</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Explore next steps without pressure</li>
              </ul>
              <Button asChild size="lg" variant="outline" className="w-full text-sm sm:text-base py-4 sm:py-5 rounded-full border-accent hover:bg-accent hover:text-accent-foreground">
                <Link to="/someone-crossed">Talk it through</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-12 sm:py-20 bg-muted/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary to-primary/70 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Understand Boundaries</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Learn to recognize consent signals and when to pause or stop</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-secondary to-secondary/70 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Reflect Calmly</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Get guidance without judgment to make better decisions</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-accent to-accent/70 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Learn & Grow</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Build healthier patterns and understand accountability</p>
            </div>
          </div>
        </section>

        {/* Privacy note */}
        <section className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground italic mb-2">
            100% anonymous. No accounts. No data stored.
          </p>
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
