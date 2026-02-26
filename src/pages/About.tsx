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
                <strong className="text-foreground">ito</strong> helps you figure out if something is okay before you do it — or make sense of something that already happened.
              </p>
              <p>
                You describe the situation, and ito gives you honest feedback. Not a lecture. Not a guilt trip. Just a straight answer about what's actually going on.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">Why does this exist?</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                Most people don't set out to hurt someone. But in the moment, it's easy to miss things — especially when you're caught up, or when alcohol is involved, or when you're not sure what the other person actually wants.
              </p>
              <p>
                ito is a way to pause and think clearly before something goes wrong.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">How it works</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                You answer a few questions or write out what's happening in your own words. ito looks at the situation and tells you what it sees — things you might be missing, things that could be off, or things to think about.
              </p>
              <p>
                It won't tell you what to do. It won't give you permission. It just helps you see the situation more clearly.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">Nobody will know you used this</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                No login. No account. No name, no email, nothing.
              </p>
              <p>
                What you type is used to give you a response and then it's gone. There's no way for anyone to trace it back to you.
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
                  Yes. No personal info is collected. No IP tracking, no login, no cookies following you around. There is no way to connect anything back to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Is this going to lecture me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  No. It talks to you like a friend who's being real with you — not a teacher, not a counselor, not someone trying to make you feel bad.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Can I use this to check if something is okay to do?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  You can use it to think through a situation, but it will never tell you "go ahead." Only the other person can tell you what they want. ito helps you figure out if you're actually paying attention to that.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  What if something already happened to me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  ito can help you think through that too. It won't blame you or tell you what you should have done. It just helps you understand what happened.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Who made this?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  ito was built by people who work in sexual violence prevention. It's designed to actually help — not to collect data, sell anything, or report anyone.
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
