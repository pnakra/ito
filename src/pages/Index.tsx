import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageSquare, Eye, Check, Shield, Lightbulb, BookOpen } from "lucide-react";

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
            Two simple paths to help you understand what's happening — <em>before or after</em> a situation.
          </p>
          
          {/* Two Main Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mt-10 sm:mt-16">
            {/* Tile 1 - Prevention */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 hover:border-primary transition-colors flex flex-col">
              <div className="bg-gradient-primary w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Eye className="w-8 sm:w-10 h-8 sm:h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">I want to avoid crossing a line</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base italic">
                get guidance for a situation you're unsure about
              </p>
              <ul className="text-left text-muted-foreground space-y-2 mb-6 sm:mb-8 flex-1 text-sm sm:text-base">
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0 mt-0.5" />Ask a question anonymously</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0 mt-0.5" />Get clear, calm steps</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0 mt-0.5" />Understand consent signals and boundaries</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0 mt-0.5" />Learn how to slow down or stop</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0 mt-0.5" />No accounts, no logging</li>
              </ul>
              <Button asChild size="lg" className="w-full text-base sm:text-lg py-5 sm:py-6 rounded-full">
                <Link to="/avoid-line">Check a situation</Link>
              </Button>
            </div>

            {/* Tile 2 - Reflection */}
            <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 hover:border-secondary transition-colors flex flex-col">
              <div className="bg-gradient-to-br from-secondary to-secondary/70 w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MessageSquare className="w-8 sm:w-10 h-8 sm:h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">I think I crossed a line</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base italic">
                reflect on something that already happened
              </p>
              <ul className="text-left text-muted-foreground space-y-2 mb-6 sm:mb-8 flex-1 text-sm sm:text-base">
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />Figure out what actually happened</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />Understand why it might have happened</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />Learn what accountability looks like</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />Get support-oriented next steps</li>
                <li className="flex gap-2"><Check className="w-4 sm:w-5 h-4 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />Reflective prompts (not legal advice)</li>
              </ul>
              <Button asChild size="lg" variant="secondary" className="w-full text-base sm:text-lg py-5 sm:py-6 rounded-full">
                <Link to="/crossed-line">Reflect on what happened</Link>
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

        {/* Footnote */}
        <section className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground italic">
            Built for early exploration — not a finished product.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
