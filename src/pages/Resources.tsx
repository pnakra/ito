import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Resources</h1>
            <p className="text-xl text-muted-foreground">
              Sometimes you need more than a vibecheck. These resources are here to help.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Crisis & Support Resources</h2>
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2">Crisis Text Line</h3>
                <p className="text-2xl font-bold text-primary mb-3">Text HOME to 741741</p>
                <p className="text-muted-foreground">
                  Free, 24/7 support for people in crisis. Text with a trained crisis counselor who can help you work through what's going on.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2">RAINN</h3>
                <p className="text-2xl font-bold text-primary mb-3">1-800-656-HOPE (4673)</p>
                <p className="text-muted-foreground">
                  The nation's largest anti-sexual violence organization. Free, confidential support 24/7.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2">Teen Line</h3>
                <p className="text-2xl font-bold text-primary mb-3">Text TEEN to 839863 (6-9 PM PT)</p>
                <p className="text-muted-foreground">
                  Talk to another teen who's been trained to listen. They get it because they're going through similar stuff.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2">Love Is Respect</h3>
                <p className="text-2xl font-bold text-primary mb-3">Text LOVEIS to 22522</p>
                <p className="text-muted-foreground">
                  Get help understanding healthy relationships and what to do if you're worried about your behavior or someone else's.
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Educational Resources</h2>
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <a 
                  href="https://www.plannedparenthood.org/learn/teens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2">Planned Parenthood Teen Resources</h3>
                    <p className="text-muted-foreground">
                      Honest, accurate information about sex, relationships, and your body. No judgment, just facts.
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                </a>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <a 
                  href="https://www.scarleteen.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2">Scarleteen</h3>
                    <p className="text-muted-foreground">
                      Comprehensive sex education for teens and emerging adults. Real talk about relationships, consent, and sexuality.
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                </a>
              </Card>
            </div>
          </div>

          <Card className="p-6 bg-accent/20 border-accent rounded-2xl">
            <h3 className="text-xl font-bold mb-3">Remember</h3>
            <p className="text-muted-foreground leading-relaxed">
              Asking for help isn't weak—it's smart. Whether you're dealing with something serious or just want to understand relationships better, these resources are here for you. All of them are confidential.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
