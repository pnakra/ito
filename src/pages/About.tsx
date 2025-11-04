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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 lowercase">about vibecheck</h1>
            <div className="space-y-4 text-lg text-muted-foreground lowercase">
              <p>
                vibecheck exists because teenage guys deserve honest, straightforward advice about dating and relationships—without the toxic pickup artist nonsense or preachy lectures.
              </p>
              <p>
                the internet is full of terrible advice that teaches young guys to be manipulative, disrespectful, or straight-up creepy. we're here to cut through that noise with real talk about what actually makes you attractive and what drives people away.
              </p>
              <p>
                our goal is simple: help you understand healthy boundaries, recognize when you're crossing lines, and learn what genuine attraction looks like. we're not here to judge—we're here to give you the honest feedback your friends might be too uncomfortable to share.
              </p>
              <p>
                think of this as your older brother telling you straight up when you're about to do something dumb, and showing you a better way forward.
              </p>
            </div>
          </div>

          <Card className="p-6 bg-card border-border rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 lowercase">privacy</h2>
            <div className="space-y-3 text-muted-foreground lowercase">
              <p>
                <strong className="text-foreground">no login required.</strong> you don't need to create an account or provide any personal information.
              </p>
              <p>
                <strong className="text-foreground">no identifying information stored.</strong> we don't track who you are, where you're from, or any details that could identify you.
              </p>
              <p>
                <strong className="text-foreground">anonymous usage.</strong> every vibecheck is completely anonymous. your scenarios aren't linked to you in any way.
              </p>
              <p>
                <strong className="text-foreground">what we collect.</strong> we only store anonymized scenarios to improve our feedback system. no names, no locations, no identifying details—just the situations you describe.
              </p>
            </div>
          </Card>

          <div>
            <h2 className="text-3xl font-bold mb-6 lowercase">frequently asked questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left lowercase">
                  is this really anonymous?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground lowercase">
                  yes, completely. we don't ask for any personal information, we don't track IP addresses in a way that identifies you, and we don't require you to log in. your scenarios are stored anonymously to help improve our system, but there's no way to connect them back to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left lowercase">
                  will anyone know i used this?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground lowercase">
                  no. there's no account, no history, no record that connects to you personally. unless you tell someone you used vibecheck, nobody will know.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left lowercase">
                  what if i already messed up?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground lowercase">
                  then this is even more important. submit what happened and get feedback on how to handle it moving forward. if you're worried you've seriously crossed a line, the resources page has crisis support numbers where you can talk to someone trained to help.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left lowercase">
                  can i use this for my friend?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground lowercase">
                  absolutely. if your friend is doing something concerning and won't listen to you, get a vibecheck on their situation and show it to them. sometimes seeing it written out by someone else makes it click.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left lowercase">
                  is this going to lecture me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground lowercase">
                  no. we're not here to preach at you or make you feel bad. we're here to give you real talk about what works and what doesn't. we frame things in terms of what's in your best interest—because being respectful and having boundaries is actually better for you, not just "the right thing to do."
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
