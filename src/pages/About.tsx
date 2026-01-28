import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <BackButton to="/" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">About</h1>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">vibe check</strong> is a harm-reduction tool designed to help young people think through consent, boundaries, and accountability. It's not legal advice, therapy, or a substitute for professional help.
              </p>
              <p>
                The internet is full of terrible advice. We're here to cut through that with real talk about what actually makes healthy relationships work.
              </p>
              <p>
                Our goal: help you understand boundaries, recognize when lines might be crossed, and learn what respect looks like. No judgment — just honest, supportive guidance.
              </p>
            </div>
          </div>

          <Card className="p-5 sm:p-6 bg-white border-border/50 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Privacy</h2>
            <div className="space-y-3 text-muted-foreground text-sm">
              <p>
                <strong className="text-foreground">No login required.</strong> No account, no personal info needed.
              </p>
              <p>
                <strong className="text-foreground">No tracking.</strong> We don't know who you are, where you're from, or anything about you.
              </p>
              <p>
                <strong className="text-foreground">Completely anonymous.</strong> Close the tab and it's gone.
              </p>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4">FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline">
                  Is this really anonymous?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Yes. No personal info, no IP tracking, no login. There's no way to connect anything back to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline">
                  Will anyone know I used this?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  No. Unless you tell someone, nobody will know.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline">
                  What if something already happened?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Use "Second Thoughts" to reflect on it. If you're worried you seriously crossed a line, the resources page has support options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline">
                  Can I use this for a friend?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Yes. Sometimes seeing something written out by someone else makes it click.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline">
                  Is this going to lecture me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  No. We're not here to preach. Just real talk about what works and what doesn't.
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
