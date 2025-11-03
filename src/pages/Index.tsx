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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get Honest Feedback on<br />What Actually Works
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Real talk about attraction—not the bullshit you see online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
              <Link to="/submit">Get Your Vibecheck</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-lg">
              <Link to="/scenarios">See what other guys are asking</Link>
            </Button>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-2xl font-bold mb-2">247 vibechecks delivered today</p>
            <p className="text-muted-foreground">Top scenarios this week: "Is she playing hard to get?" • "Should I keep texting?"</p>
          </div>
        </section>

        {/* Quick Explainer */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Submit your situation</h3>
              <p className="text-muted-foreground">Describe what's happening or upload a screenshot</p>
            </div>
            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Get a vibecheck in 30 seconds</h3>
              <p className="text-muted-foreground">Honest feedback on your approach</p>
            </div>
            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Learn what makes you attractive</h3>
              <p className="text-muted-foreground">Real strategies that actually work</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Describe your situation or upload a screenshot</h3>
                <p className="text-muted-foreground">Be specific about what's happening. The more detail, the better feedback you'll get.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Get honest feedback on your approach</h3>
                <p className="text-muted-foreground">We'll tell you if you're on track or if you're heading into red flag territory.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Learn what works instead</h3>
                <p className="text-muted-foreground">Get specific, actionable advice on what to do differently.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="bg-card border border-border rounded-lg p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to check your vibe?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get advice, check your approach, don't be a creep
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
              <Link to="/submit">Get Your Vibecheck</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
