import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageSquare, Zap, TrendingUp, Eye, X, Check } from "lucide-react";

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

        {/* Quick Explainer */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Submit Your Situation</h3>
              <p className="text-muted-foreground">Describe what's happening or upload a screenshot</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Get a Vibecheck in 30 Seconds</h3>
              <p className="text-muted-foreground">Honest feedback on your approach</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Learn What Actually Works</h3>
              <p className="text-muted-foreground">Real strategies, no weird tricks</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="bg-card border border-border rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Check Your Vibe?</h2>
            <p className="text-xl text-muted-foreground mb-8">Get advice, check your approach, don't be a creep</p>
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full">
              <Link to="/chat">Get Your Vibecheck</Link>
            </Button>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-2xl font-bold mb-2">247 vibechecks delivered today</p>
            <p className="text-muted-foreground">
              Top scenarios this week: "Is she playing hard to get?" • "Should I keep texting?"
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
