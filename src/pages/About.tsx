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
            <h1 className="text-h1 mb-4">About ito</h1>
            <div className="space-y-4 text-muted-foreground text-body">
              <p>
                <strong className="text-foreground">ito</strong> is a real-time reflection tool for young people navigating sexual consent. It helps someone pause in a moment of confusion — before, during, or after — and think clearly about what's happening.
              </p>
              <p>
                It's not therapy, legal advice, or a substitute for talking to someone you trust. It's a calibrated nudge designed to reduce the chance that confusion turns into harm.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">How it works</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                Users describe a situation in their own words or answer guided questions. The system classifies risk using deterministic safety rules — not AI opinion — and surfaces honest, specific feedback.
              </p>
              <p>
                AI generates the explanation, but the safety classification is hard-coded. The tool cannot give permission, validate escalation, or act as approval.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">Who it's for</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                Primarily designed for potential perpetrators — people who might cause harm without realizing it. It interrupts entitled thinking, challenges objectifying framing, and slows momentum before it becomes coercion.
              </p>
              <p>
                It also supports people who've experienced something and need help processing what happened, without judgment or clinical labels.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">Privacy</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                <strong className="text-foreground">No login required.</strong> No account, no personal information collected.
              </p>
              <p>
                <strong className="text-foreground">No data is stored long-term.</strong> Text is processed in transit for AI analysis but is not retained. Session data is cleared when the tab is closed.
              </p>
              <p>
                <strong className="text-foreground">Anonymous by design.</strong> There is no way to connect usage back to a specific person.
              </p>
            </div>
          </div>

          <div className="bg-card shadow-card rounded-lg p-5">
            <h2 className="text-h2 mb-3">Safety approach</h2>
            <div className="space-y-3 text-muted-foreground text-body">
              <p>
                Risk classification uses a deterministic rules engine, not AI interpretation. High-risk language triggers immediate flags regardless of context. The system identifies tension points — intent-behavior mismatches — rather than providing binary safety grades.
              </p>
              <p>
                The tool biases toward slowing down rather than accelerating intimacy, especially in ambiguous cases. It will never imply permission or coach escalation.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-h2 mb-3">FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Is this really anonymous?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  Yes. No personal information is collected, no IP tracking, no login. There is no way to connect anything back to you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Does AI determine if something is safe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  No. Safety classification is handled by deterministic rules, not AI. AI generates explanations and follow-up conversation, but the risk level is set by hard-coded logic that cannot be overridden.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Can this be used to get permission?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  No. The system is explicitly designed to never grant permission or validate escalation. Even low-risk outcomes include the message: "The absence of a red flag is not the presence of consent."
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  What if someone describes being harmed?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  The system detects when someone is describing harm done to them and responds supportively, without blame. It does not diagnose or use clinical labels — it describes what happened in plain language.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger className="text-left text-body hover:no-underline">
                  Is this going to lecture me?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-body">
                  No. It gives direct, honest feedback without moralizing. The tone is that of a calm, thoughtful peer — not a counselor or authority figure.
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
