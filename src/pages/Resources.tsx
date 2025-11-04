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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 lowercase">resources</h1>
            <p className="text-xl text-muted-foreground lowercase">
              sometimes you need more than a vibecheck. these resources are here to help.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 lowercase">crisis & support resources</h2>
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2 lowercase">crisis text line</h3>
                <p className="text-2xl font-bold text-primary mb-3">text HOME to 741741</p>
                <p className="text-muted-foreground lowercase">
                  free, 24/7 support for people in crisis. text with a trained crisis counselor who can help you work through what's going on.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2 lowercase">RAINN</h3>
                <p className="text-2xl font-bold text-primary mb-3">1-800-656-HOPE (4673)</p>
                <p className="text-muted-foreground lowercase">
                  the nation's largest anti-sexual violence organization. free, confidential support 24/7.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2 lowercase">teen line</h3>
                <p className="text-2xl font-bold text-primary mb-3">text TEEN to 839863 (6-9 PM PT)</p>
                <p className="text-muted-foreground lowercase">
                  talk to another teen who's been trained to listen. they get it because they're going through similar stuff.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <h3 className="text-xl font-bold mb-2 lowercase">love is respect</h3>
                <p className="text-2xl font-bold text-primary mb-3">text LOVEIS to 22522</p>
                <p className="text-muted-foreground lowercase">
                  get help understanding healthy relationships and what to do if you're worried about your behavior or someone else's.
                </p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 lowercase">educational resources</h2>
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-colors rounded-2xl">
                <a 
                  href="https://www.plannedparenthood.org/learn/teens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2 lowercase">planned parenthood teen resources</h3>
                    <p className="text-muted-foreground lowercase">
                      honest, accurate information about sex, relationships, and your body. no judgment, just facts.
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
                    <h3 className="text-xl font-bold mb-2 lowercase">scarleteen</h3>
                    <p className="text-muted-foreground lowercase">
                      comprehensive sex education for teens and emerging adults. real talk about relationships, consent, and sexuality.
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                </a>
              </Card>
            </div>
          </div>

          <Card className="p-6 bg-accent/20 border-accent rounded-2xl">
            <h3 className="text-xl font-bold mb-3 lowercase">remember</h3>
            <p className="text-muted-foreground leading-relaxed lowercase">
              asking for help isn't weak—it's smart. whether you're dealing with something serious or just want to understand relationships better, these resources are here for you. all of them are confidential.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
