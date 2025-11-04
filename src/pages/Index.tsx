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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight lowercase bg-gradient-primary bg-clip-text text-transparent">
            no creepy vibes
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto lowercase">
            honest feedback on what actually works
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 lowercase rounded-full">
              <Link to="/submit">get your vibecheck</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-lg lowercase">
              <Link to="/scenarios">see what others are asking</Link>
            </Button>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl mx-auto lowercase">
            <p className="text-2xl font-bold mb-2">247 vibechecks delivered today</p>
            <p className="text-muted-foreground">top scenarios this week: "is she playing hard to get?" • "should i keep texting?"</p>
          </div>
        </section>

        {/* Quick Explainer */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 lowercase">submit your situation</h3>
              <p className="text-muted-foreground lowercase">describe what's happening or upload a screenshot</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 lowercase">get a vibecheck in 30 seconds</h3>
              <p className="text-muted-foreground lowercase">honest feedback on your approach</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 lowercase">learn what actually works</h3>
              <p className="text-muted-foreground lowercase">real strategies, no weird tricks</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-16 lowercase">how it works</h2>
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 lowercase">describe your situation or upload a screenshot</h3>
                <p className="text-muted-foreground lowercase">be specific about what's happening. more detail = better feedback.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 lowercase">get honest feedback on your approach</h3>
                <p className="text-muted-foreground lowercase">we'll tell you if you're on track or heading into red flag territory.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 lowercase">learn what works instead</h3>
                <p className="text-muted-foreground lowercase">get specific, actionable advice on what to do differently.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="bg-card border border-border rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 lowercase">
              ready to check your vibe?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 lowercase">
              get advice, check your approach, don't be a creep
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full lowercase">
              <Link to="/submit">get your vibecheck</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
