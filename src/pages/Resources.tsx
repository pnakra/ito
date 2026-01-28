import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { ExternalLink, Phone, MessageCircle } from "lucide-react";

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Resources</h1>
            <p className="text-muted-foreground">
              Sometimes you need more than a vibe check. These are here to help.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Crisis Support
            </h2>
            
            <Card className="p-4 sm:p-5 bg-white border-border/50 hover:border-primary/30 transition-colors rounded-xl">
              <h3 className="font-bold mb-1">Crisis Text Line</h3>
              <p className="text-lg font-bold text-primary mb-2">Text HOME to 741741</p>
              <p className="text-muted-foreground text-sm">
                Free, 24/7 support. Text with a trained crisis counselor.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border-border/50 hover:border-primary/30 transition-colors rounded-xl">
              <h3 className="font-bold mb-1">RAINN</h3>
              <p className="text-lg font-bold text-primary mb-2">1-800-656-HOPE (4673)</p>
              <p className="text-muted-foreground text-sm">
                National sexual assault hotline. Free, confidential, 24/7.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border-border/50 hover:border-primary/30 transition-colors rounded-xl">
              <h3 className="font-bold mb-1">Teen Line</h3>
              <p className="text-lg font-bold text-primary mb-2">Text TEEN to 839863</p>
              <p className="text-muted-foreground text-sm">
                Talk to another teen who's trained to listen. 6-9 PM PT.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border-border/50 hover:border-primary/30 transition-colors rounded-xl">
              <h3 className="font-bold mb-1">Love Is Respect</h3>
              <p className="text-lg font-bold text-primary mb-2">Text LOVEIS to 22522</p>
              <p className="text-muted-foreground text-sm">
                Help understanding healthy relationships.
              </p>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-secondary" />
              Learn More
            </h2>
            
            <a 
              href="https://www.scarleteen.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-4 sm:p-5 bg-white border-border/50 hover:border-secondary/30 transition-colors rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold mb-1">Scarleteen</h3>
                    <p className="text-muted-foreground text-sm">
                      Real talk about relationships, consent, and sexuality.
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                </div>
              </Card>
            </a>

            <a 
              href="https://www.plannedparenthood.org/learn/teens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-4 sm:p-5 bg-white border-border/50 hover:border-secondary/30 transition-colors rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold mb-1">Planned Parenthood Teen Resources</h3>
                    <p className="text-muted-foreground text-sm">
                      Honest, accurate info. No judgment.
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                </div>
              </Card>
            </a>
          </div>

          <Card className="p-4 sm:p-5 bg-primary/5 border-primary/20 rounded-xl">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Remember:</strong> Asking for help isn't weak — it's smart. All these resources are confidential.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
