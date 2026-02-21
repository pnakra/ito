import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <BackButton to="/" />
            <h1 className="text-xl sm:text-2xl font-semibold mb-4">About</h1>
            <div className="space-y-3 text-muted-foreground text-sm">
              <p>
                <strong className="text-foreground">Is This OK?</strong> is a tool to help you pause and think through what's happening. It's not legal advice, therapy, or a substitute for talking to someone you trust.
              </p>
              <p>
                Sometimes it's hard to tell what's okay in the moment. This is a space to slow down and figure it out.
              </p>
            </div>
          </div>

          <div className="border border-border/50 rounded-md p-4 sm:p-5">
            <h2 className="text-base font-medium mb-3">Privacy</h2>
            <div className="space-y-2.5 text-muted-foreground text-sm">
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
          </div>

          <div>
            <h2 className="text-base font-medium mb-3">FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  Is this really anonymous?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Yes. No personal info, no IP tracking, no login. There's no way to connect anything back to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  Will anyone know I used this?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  No. Unless you tell someone, nobody will know.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  What if something already happened?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Use "After something happened" to think it through. If you're worried you went too far, the resources page has support options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  Can I use this for a friend?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Yes. Sometimes seeing something written out by someone else makes it click.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  Is this going to lecture me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  No. This isn't about telling you what to do. It's about helping you think.
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
