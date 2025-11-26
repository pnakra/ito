import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Vibecheck</h1>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                vibecheck is an exploratory harm-reduction tool designed to help young people understand consent, boundaries, and accountability. It is not legal advice, therapy, or a substitute for professional help. All content is anonymous and designed for early prototyping.
              </p>
              <p>
                The internet is full of terrible advice that teaches young people to be manipulative, disrespectful, or straight-up creepy. We're here to cut through that noise with real talk about what actually makes healthy relationships work and what causes harm.
              </p>
              <p>
                Our goal is simple: help you understand healthy boundaries, recognize when you're crossing lines, and learn what genuine consent and respect look like. We're not here to judge—we're here to give you honest, supportive guidance.
              </p>
            </div>
          </div>

          <Card className="p-6 bg-card border-border rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Privacy</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">No login required.</strong> You don't need to create an account or provide any personal information.
              </p>
              <p>
                <strong className="text-foreground">No identifying information stored.</strong> We don't track who you are, where you're from, or any details that could identify you.
              </p>
              <p>
                <strong className="text-foreground">Anonymous usage.</strong> Every vibecheck is completely anonymous. Your scenarios aren't linked to you in any way.
              </p>
              <p>
                <strong className="text-foreground">What we collect.</strong> We only store anonymized scenarios to improve our feedback system. No names, no locations, no identifying details—just the situations you describe.
              </p>
            </div>
          </Card>

          <div>
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Is this really anonymous?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, completely. We don't ask for any personal information, we don't track IP addresses in a way that identifies you, and we don't require you to log in. Your scenarios are stored anonymously to help improve our system, but there's no way to connect them back to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Will anyone know I used this?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. There's no account, no history, no record that connects to you personally. Unless you tell someone you used vibecheck, nobody will know.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  What if I already messed up?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Then this is even more important. Submit what happened and get feedback on how to handle it moving forward. If you're worried you've seriously crossed a line, the resources page has crisis support numbers where you can talk to someone trained to help.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Can I use this for my friend?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. If your friend is doing something concerning and won't listen to you, get a vibecheck on their situation and show it to them. Sometimes seeing it written out by someone else makes it click.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Is this going to lecture me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. We're not here to preach at you or make you feel bad. We're here to give you real talk about what works and what doesn't. We frame things in terms of what's in your best interest—because being respectful and having boundaries is actually better for you, not just "the right thing to do."
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
