import Header from "@/components/Header";
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
      
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <BackButton to="/" />
            <h1 className="text-h1 mb-4">What is ito?</h1>
            <div className="space-y-4 text-muted-foreground text-body">
              <p>
                <strong className="text-foreground">ito</strong> is for the moment when you're not sure if something was okay, or if something you're about to do is okay.
              </p>
              <p>
                You write what's going on, and you get an honest read. No lecture. No guilt trip. Just a straight take.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">Why?</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                Most people don't set out to hurt someone. But it's easy to miss things in the moment, especially when you're caught up, or drinking, or when you're not sure what the other person actually wants.
              </p>
              <p>
                This is a way to pause and think before something goes wrong.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">How it works</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                Write what's happening in your own words, or answer a few questions. ito looks at the situation and tells you what it sees. Things you might be missing. Things that could be off.
              </p>
              <p>
                It won't tell you what to do. It won't give you permission. It just helps you see things more clearly.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">Nobody will know</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                No login. No account. No name, no email, nothing.
              </p>
              <p>
                What you type gets used for the response and then it's gone. There's no way to trace it back to you.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-h2 mb-3">Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Is this actually anonymous?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  Yes. No personal info is collected. No IP tracking, no login, no cookies following you around. Nothing connects back to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Is this going to lecture me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  No. It talks to you like someone who's being real with you, not someone trying to make you feel bad.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Can this tell me if something is okay to do?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  It can help you think through a situation, but it'll never say "go ahead." Only the other person can tell you what they want.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  What if something already happened?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  You can think through that too. It won't blame you or tell you what you should have done. It just helps you understand what happened.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Who made this?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  People who care about this stuff. It's not trying to collect data, sell anything, or report anyone.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="text-center pt-4">
            <p className="text-caption text-muted-foreground/60">
              © {new Date().getFullYear()} ito
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
