import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { ExternalLink, Phone, MessageCircle } from "lucide-react";

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <BackButton to="/" />
            <h1 className="text-2xl sm:text-3xl font-semibold mb-3">Get Help</h1>
            <p className="text-muted-foreground text-sm">
              Sometimes you need to talk to a real person. These are here for you.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Talk to Someone Now
            </h2>
            
            <Card className="p-4 sm:p-5 border-border/50">
              <h3 className="font-medium mb-1 text-sm">Crisis Text Line</h3>
              <p className="text-base font-medium text-primary mb-2">Text HOME to 741741</p>
              <p className="text-muted-foreground text-xs">
                Free, 24/7. Text with someone who's trained to help.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 border-border/50">
              <h3 className="font-medium mb-1 text-sm">RAINN</h3>
              <p className="text-base font-medium text-primary mb-2">1-800-656-HOPE (4673)</p>
              <p className="text-muted-foreground text-xs">
                Free, private, 24/7 support line.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 border-border/50">
              <h3 className="font-medium mb-1 text-sm">Teen Line</h3>
              <p className="text-base font-medium text-primary mb-2">Text TEEN to 839863</p>
              <p className="text-muted-foreground text-xs">
                Talk to another teen. 6-9 PM Pacific time.
              </p>
            </Card>

            <Card className="p-4 sm:p-5 border-border/50">
              <h3 className="font-medium mb-1 text-sm">Love Is Respect</h3>
              <p className="text-base font-medium text-primary mb-2">Text LOVEIS to 22522</p>
              <p className="text-muted-foreground text-xs">
                Help with relationships and what's healthy.
              </p>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              Learn More
            </h2>
            
            <a 
              href="https://www.scarleteen.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-4 sm:p-5 border-border/50 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium mb-1 text-sm">Scarleteen</h3>
                    <p className="text-muted-foreground text-xs">
                      Honest info about relationships, consent, and sex.
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
              <Card className="p-4 sm:p-5 border-border/50 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium mb-1 text-sm">Planned Parenthood for Teens</h3>
                    <p className="text-muted-foreground text-xs">
                      Straight answers about your body and relationships.
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                </div>
              </Card>
            </a>
          </div>

          <Card className="p-4 sm:p-5 bg-accent/30 border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Asking for help is smart.</strong> All of these are private.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
