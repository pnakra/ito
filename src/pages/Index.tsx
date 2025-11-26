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
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-primary bg-clip-text text-transparent">
            Know the vibe. Know the line.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Two simple paths to help you understand what's happening — <em>before or after</em> a situation.
          </p>
          
          {/* Two Main Tiles */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-16">
            {/* Tile 1 - Prevention */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 hover:border-primary transition-colors flex flex-col">
              <div className="bg-gradient-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">I want to avoid crossing a line</h2>
              <p className="text-muted-foreground mb-6 text-base italic">
                get guidance for a situation you're unsure about
              </p>
              <ul className="text-left text-muted-foreground space-y-2 mb-8 flex-1">
                <li className="flex gap-2"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />Ask a question anonymously</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />Get clear, calm steps</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />Understand consent signals and boundaries</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />Learn how to slow down or stop</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />No accounts, no logging</li>
              </ul>
              <Button asChild size="lg" className="w-full text-lg py-6 rounded-full">
                <Link to="/avoid-line">Check a situation</Link>
              </Button>
            </div>

            {/* Tile 2 - Reflection */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 hover:border-secondary transition-colors flex flex-col">
              <div className="bg-gradient-to-br from-secondary to-secondary/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">I think I crossed a line</h2>
              <p className="text-muted-foreground mb-6 text-base italic">
                reflect on something that already happened
              </p>
              <ul className="text-left text-muted-foreground space-y-2 mb-8 flex-1">
                <li className="flex gap-2"><Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />Figure out what actually happened</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />Understand why it might have happened</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />Learn what accountability looks like</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />Get support-oriented next steps</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />Reflective prompts (not legal advice)</li>
              </ul>
              <Button asChild size="lg" variant="secondary" className="w-full text-lg py-6 rounded-full">
                <Link to="/crossed-line">Reflect on what happened</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-20 bg-muted/30">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary to-primary/70 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Understand Boundaries</h3>
              <p className="text-muted-foreground">Learn to recognize consent signals and when to pause or stop</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-secondary to-secondary/70 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reflect Calmly</h3>
              <p className="text-muted-foreground">Get guidance without judgment to make better decisions</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-accent to-accent/70 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Learn & Grow</h3>
              <p className="text-muted-foreground">Build healthier patterns and understand accountability</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
