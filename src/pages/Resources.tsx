import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { ExternalLink, Phone, MessageCircle } from "lucide-react";

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <BackButton to="/" />
            <h1 className="text-h1 mb-2">Get Help</h1>
            <p className="text-muted-foreground text-body">
              Sometimes you need to talk to a real person. These are here for you.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-caption font-medium text-muted-foreground flex items-center gap-2 mb-3">
              <Phone className="w-3.5 h-3.5" />
              Talk to someone now
            </h2>
            
            {[
              { name: "Crisis Text Line", contact: "Text HOME to 741741", desc: "Free, 24/7. Text with someone who's trained to help." },
              { name: "RAINN", contact: "1-800-656-HOPE (4673)", desc: "Free, private, 24/7 support line." },
              { name: "Teen Line", contact: "Text TEEN to 839863", desc: "Talk to another teen. 6-9 PM Pacific time." },
              { name: "Love Is Respect", contact: "Text LOVEIS to 22522", desc: "Help with relationships and what's healthy." },
            ].map((resource) => (
              <div key={resource.name} className="bg-card shadow-card rounded-lg p-5">
                <h3 className="text-body font-medium mb-0.5">{resource.name}</h3>
                <p className="text-body font-medium text-primary mb-1">{resource.contact}</p>
                <p className="text-muted-foreground text-caption">{resource.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-caption font-medium text-muted-foreground flex items-center gap-2 mb-3">
              <MessageCircle className="w-3.5 h-3.5" />
              Learn more
            </h2>
            
            {[
              { name: "Scarleteen", url: "https://www.scarleteen.com", desc: "Honest info about relationships, consent, and sex." },
              { name: "Planned Parenthood for Teens", url: "https://www.plannedparenthood.org/learn/teens", desc: "Straight answers about your body and relationships." },
            ].map((link) => (
              <a 
                key={link.name}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-card shadow-card rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-body font-medium mb-0.5">{link.name}</h3>
                    <p className="text-muted-foreground text-caption">{link.desc}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground mt-0.5" />
                </div>
              </a>
            ))}
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <p className="text-body text-muted-foreground">
              <strong className="text-foreground">Asking for help is smart.</strong> All of these are private.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Resources;
