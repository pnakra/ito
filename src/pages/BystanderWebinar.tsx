import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, Grid2X2, Hand, Maximize2, MessageSquareText, Printer, X } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import SlideLayout from "@/components/webinar/SlideLayout";
import {
  EntryProductVisual,
  GroupChatVisual,
  ItoWordmark,
  ResponseProductVisual,
} from "@/components/webinar/ProductVisuals";

interface WebinarSlide {
  title: string;
  notes: string;
  element: ReactNode;
}

const Kicker = ({ children }: { children: ReactNode }) => <p className="slide-kicker mb-6 text-primary">{children}</p>;
const SlideTitle = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <h1 className={`slide-title max-w-[1500px] font-serif font-normal text-foreground ${className}`}>{children}</h1>
);
const ProductLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="slide-chrome inline-flex min-h-12 items-center gap-3 rounded-full border border-border px-6 text-foreground transition-colors hover:border-primary hover:bg-accent">
    {children}<ExternalLink className="h-5 w-5" />
  </a>
);

const OpeningSlide = ({ print = false }: { print?: boolean }) => {
  const [revealed, setRevealed] = useState(false);
  const showResponse = print || revealed;
  return (
    <SlideLayout page={1} section="Campus + Greek life">
      <div className="grid flex-1 grid-cols-[1fr_1fr] items-center gap-[100px]">
        <div>
          <Kicker>Online bystander intervention · EndTAB + Priya</Kicker>
          <SlideTitle className="slide-title-lg italic">What would you do next?</SlideTitle>
          <div className="mt-12"><ItoWordmark className="text-[52px] text-foreground" /></div>
          {!print && (
            <Button variant="outline" className="slide-body mt-12 h-16 w-auto px-8" onClick={() => setRevealed((value) => !value)} aria-expanded={revealed}>
              {revealed ? "Hide one possible move" : "Reveal one possible move"}<ArrowRight />
            </Button>
          )}
          {showResponse && <p className="slide-caption mt-8 max-w-[650px] text-muted-foreground">One option, only if it is safe to speak up.</p>}
        </div>
        <GroupChatVisual responded={showResponse} />
      </div>
    </SlideLayout>
  );
};

const ProblemSlide = () => (
  <SlideLayout page={2} section="The problem">
    <Kicker>The pause before anyone acts</Kicker>
    <SlideTitle>Silence can look like agreement.</SlideTitle>
    <div className="mt-20 flex flex-1 flex-col justify-center gap-12">
      {["“Is it serious?”", "“Someone else will act.”", "“What if they turn on me?”"].map((quote, i) => (
        <div key={quote} className="flex items-center gap-10 border-b border-border pb-9">
          <span className="slide-body-lg font-serif italic text-primary">0{i + 1}</span>
          <p className="slide-subtitle text-foreground">{quote}</p>
        </div>
      ))}
    </div>
  </SlideLayout>
);

const SharedEngineSlide = () => (
  <SlideLayout page={3} section="The product">
    <div className="grid h-full grid-cols-[1fr_0.9fr] items-center gap-[100px]">
      <div>
        <Kicker>ito</Kicker>
        <SlideTitle className="slide-title-lg italic">A pause before harm.</SlideTitle>
        <div className="mt-16 space-y-10">
          <div className="border-l-2 border-border pl-7">
            <p className="slide-body-lg font-medium text-foreground">About me</p>
            <p className="slide-body mt-3 text-muted-foreground">Rethink your next move.</p>
          </div>
          <div className="border-l-2 border-primary pl-7">
            <p className="slide-body-lg font-medium text-foreground">About someone else</p>
            <p className="slide-body mt-3 text-muted-foreground">Find a way to step in.</p>
          </div>
        </div>
      </div>
      <EntryProductVisual />
    </div>
  </SlideLayout>
);

const frameworks = [
  ["Check in", "Delay"],
  ["Change the space", "Distract"],
  ["Call in support", "Delegate"],
  ["Collect evidence", "Document"],
  ["Challenge the abuse", "Direct"],
];

const FrameworkSlide = () => (
  <SlideLayout page={4} section="The action vocabulary">
    <Kicker>EndTAB's 5 C's + the 5 D's</Kicker>
    <SlideTitle>Two frameworks. Five moves.</SlideTitle>
    <div className="mt-14 grid grid-cols-[1fr_80px_1fr] gap-x-14 border-b border-border pb-5">
      <p className="slide-caption text-muted-foreground">5 C's · EndTAB</p><span />
      <p className="slide-caption text-muted-foreground">5 D's · Right To Be</p>
    </div>
    <div className="flex flex-1 flex-col justify-center">
      {frameworks.map(([c, d]) => (
        <div key={c} className="grid grid-cols-[1fr_80px_1fr] items-center gap-x-14 border-b border-border py-7">
          <p className="slide-body-lg font-medium text-foreground">{c}</p>
          <ArrowRight className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="slide-subtitle font-serif italic text-primary">{d}</p>
        </div>
      ))}
    </div>
    <p className="slide-chrome mt-6 text-muted-foreground">Paired by function, not formal equivalents.</p>
  </SlideLayout>
);

const InProductSlide = () => (
  <SlideLayout page={5} section="Inside the bystander beta">
    <Kicker>The same group chat. A concrete next move.</Kicker>
    <SlideTitle>The framework becomes action.</SlideTitle>
    <div className="mt-10 flex items-center gap-6 text-muted-foreground">
      {["Understand", "Consider safety", "Choose a move"].map((label, i) => (
        <div key={label} className="flex items-center gap-6">
          {i > 0 && <ArrowRight className="h-8 w-8 text-primary" aria-hidden="true" />}
          <p className="slide-body-lg">{label}</p>
        </div>
      ))}
    </div>
    <div className="mt-12 grid flex-1 grid-cols-[1.4fr_0.6fr] items-center gap-20">
      <ResponseProductVisual />
      <div>
        <p className="slide-subtitle font-serif italic text-foreground">A next move.<br />Not a ruling.</p>
        <div className="mt-12"><ProductLink href="/bystanderbeta">Open the bystander beta</ProductLink></div>
      </div>
    </div>
  </SlideLayout>
);

const PracticeSlide = () => (
  <SlideLayout page={6} section="From online to in person">
    <Kicker>One situation. Two openings to act.</Kicker>
    <SlideTitle className="italic">Rehearse the words.</SlideTitle>
    <div className="mt-16 grid flex-1 grid-cols-[1fr_80px_1fr] items-center gap-10">
      <div className="border-t-2 border-primary pt-10">
        <MessageSquareText className="mb-8 h-14 w-14 text-primary" aria-hidden="true" />
        <p className="slide-body-lg font-medium text-foreground">Online · The group chat</p>
        <p className="slide-subtitle mt-9 font-serif text-foreground">“Nobody's going up. Let's get her friends.”</p>
        <p className="slide-caption mt-8 text-muted-foreground">Direct + Delegate</p>
      </div>
      <ArrowRight className="h-12 w-12 text-primary" aria-hidden="true" />
      <div className="border-t-2 border-border pt-10">
        <Hand className="mb-8 h-14 w-14 text-primary" aria-hidden="true" />
        <p className="slide-body-lg font-medium text-foreground">In person · At the stairs</p>
        <p className="slide-subtitle mt-9 font-serif text-foreground">“Let's head downstairs. Your friends are there.”</p>
        <p className="slide-caption mt-8 text-muted-foreground">Distract + Delegate</p>
      </div>
    </div>
    <div className="mt-8"><ProductLink href="/witness/practice">Try a practice scenario</ProductLink></div>
  </SlideLayout>
);

const ClosingSlide = () => (
  <SlideLayout page={7} section="Beyond the webinar">
    <div className="flex h-full flex-col justify-center">
      <Kicker>Keep the next move within reach</Kicker>
      <SlideTitle className="slide-title-lg max-w-[1400px] italic">Training ends.<br />The group chat doesn't.</SlideTitle>
      <div className="mt-20 border-t border-border pt-10">
        <p className="slide-subtitle font-serif text-foreground">Pilot ito with your campus or chapter.</p>
        <a href="mailto:priya@overridelabsprevention.org" className="slide-body mt-6 inline-block text-primary underline underline-offset-4">priya@overridelabsprevention.org</a>
      </div>
    </div>
  </SlideLayout>
);

const slides: WebinarSlide[] = [
  { title: "What would you do next?", notes: "Open with the house group chat and let the audience sit with it for ten seconds. Ask what they would do next, then take one or two responses before revealing one possible move. This is an illustrative situation, not a visitor's conversation. A message about someone being 'gone' raises a concern about capacity to consent; nobody else can give consent for her. The aim is not to make every bystander confront the group. Direct language is one option only if safe; a trusted friend or sober monitor can be a lower-risk first move. This same situation will carry us from the chat to the stairs.", element: <OpeningSlide /> },
  { title: "Silence can look like agreement", notes: "Use the three quotes to name uncertainty, diffusion of responsibility, and social cost without reading a paragraph from the slide. In our group chat, each person may be waiting for someone else. Online spaces add scale, distance, and messages that can spread or disappear. A laugh or repost can amplify harm; silence does not establish agreement or consent. These are reasons people hesitate, not excuses. ito is designed to interrupt that hesitation with a concrete, context-sensitive option.", element: <ProblemSlide /> },
  { title: "A pause before harm", notes: "Introduce ito at a high level: an anonymous reflection tool designed to interrupt momentum toward harm. About me focuses on the person whose own behavior may cause harm: challenge assumptions and rethink the next move. About someone else helps a bystander name the concern and consider an intervention. These are two frames on one shared safety engine, not separate products. ito offers a reflection and a next move, never a ruling or permission. Anonymous conversations may be reviewed to improve the tool. Return to our example: the person reading that house chat can bring the situation to the bystander beta.", element: <SharedEngineSlide /> },
  { title: "The 5 C's and 5 D's", notes: "The supplied EndTAB deck contains five C's. Use its full labels here: Check in, Change the space, Call in support, Collect evidence, Challenge the abuse. These are paired by function with Right To Be's five D's, not formal equivalents or a required sequence. Tell the same story in five ways: check in privately afterward (Delay); change the conversation or create an exit (Distract); bring in her friends or a sober monitor (Delegate); preserve the message privately if safe and ask what she wants done with it (Document); interrupt the invitation if safe (Direct). Do not forward evidence or spread her story. Checking in can also happen immediately; Delay does not mean waiting during danger. Keep her preferences, retaliation risk, and immediate safety central.", element: <FrameworkSlide /> },
  { title: "The framework becomes action", notes: "The enlarged product example is illustrative, not a guaranteed AI response. Explain the three beats aloud. Understand: who this is about, what was seen or heard, timing, and ages. Consider safety: possible retaliation and what the person targeted wants; an immediate situation skips the extra safety questions. Choose a move: a concrete suggestion with a 5 C/5 D label and rationale. In this chat, getting her friends is Delegate; interrupting the group's momentum is Direct only if safe. Preserve messages privately rather than reposting. The product adjusts displayed suggestions to safety and no-share/no-report preferences. Online guidance covers anonymous posts such as Sidechat and Fizz. Configured campus support links are available, while reporting links are suppressed for no-report/no-share preferences. Guides and crisis resources remain within reach. The report simulator is preview-only: it never sends or stores a report.", element: <InProductSlide /> },
  { title: "Rehearse the words", notes: "Carry the same situation out of the phone and into the house. Online, a direct message can interrupt momentum and bring in support. At the stairs, a low-key invitation downstairs can create an exit without a public confrontation. These are example words, not a universal script; do not invent a ride or a friend who is not there. If speaking up risks retaliation, delegate instead. If someone is in immediate danger, seek emergency help rather than waiting for the tool. Bystander practice includes online, in-person, and after-the-fact scenes. Choices receive 5 D labels; timing and group pressure affect the exercise. Practice scores stay on the device. The separate adults-only roleplay beta offers a typed exchange and debrief. The point is to make a safe option easier to say under pressure, not reward heroics.", element: <PracticeSlide /> },
  { title: "Training ends. The group chat doesn't.", notes: "Close with one invitation: pilot ito with your campus or chapter and share feedback. Training supplies the vocabulary; ito makes a possible next move available when the group chat becomes an in-person moment. A pilot can include validated campus support links and an aggregate-only snapshot of confidence change, selected intervention type, and practice completion. It does not expose narratives or query practice scores. Reporting remains preview-only pending legal review and vetted recipients. The longer-term goal is fewer sexual assaults, not a claim of proven impact. A practical usage measure is how many people get ito's read on their situation each week. Invite discussion about where people hesitate and which moments the pilot should address.", element: <ClosingSlide /> },
];

const clampSlide = (value: string | null) => {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(slides.length - 1, Math.round(parsed) - 1)) : 0;
};

const BystanderWebinar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const index = clampSlide(searchParams.get("slide"));
  const printMode = searchParams.get("print") === "1";
  const [gridOpen, setGridOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const touchStart = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    setSearchParams({ slide: String(clamped + 1) }, { replace: true });
  }, [setSearchParams]);

  const present = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setPresenting(true);
      setGridOpen(false);
      setNotesOpen(false);
    } catch {
      setPresenting(true);
    }
  }, []);

  useEffect(() => {
    const onFullscreen = () => setPresenting(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  useEffect(() => {
    document.title = `${index + 1}/${slides.length} — ${slides[index].title} | ito webinar`;
  }, [index]);

  useEffect(() => {
    if (!printMode) return;
    const timer = window.setTimeout(() => window.print(), 900);
    return () => window.clearTimeout(timer);
  }, [printMode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (printMode) return;
      if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); goTo(index + 1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); goTo(index - 1); }
      else if (event.key.toLowerCase() === "g") setGridOpen((open) => !open);
      else if (event.key.toLowerCase() === "n") setNotesOpen((open) => !open);
      else if (event.key === "F5") { event.preventDefault(); void present(); }
      else if (event.key === "Escape") { setGridOpen(false); setNotesOpen(false); if (!document.fullscreenElement) setPresenting(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index, present, printMode]);

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 55) goTo(index + (delta < 0 ? 1 : -1));
    touchStart.current = null;
  };

  if (printMode) {
    return (
      <main className="webinar-print !pb-0">
        <SEO title="From seeing it to stepping in | ito webinar" description="Online bystander intervention for campus and Greek life communities." path="/webinar" noindex />
        {slides.map((slide, i) => <div className="webinar-print-page" key={slide.title}>{i === 0 ? <OpeningSlide print /> : slide.element}</div>)}
      </main>
    );
  }

  return (
    <main className={`relative h-[100dvh] overflow-hidden bg-background !pb-0 ${presenting ? "webinar-presenting" : ""}`}>
      <SEO title={`${index + 1}/${slides.length} — ${slides[index].title} | ito webinar`} description="Online bystander intervention, the 5 C's, the 5 D's, and ito." path="/webinar" noindex />

      {!presenting && (
        <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-3 sm:px-5">
          <div className="flex items-center gap-3"><ItoWordmark className="text-[22px] text-foreground" /><span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">Webinar</span></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button aria-label="Slide grid" onClick={() => setGridOpen((open) => !open)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground"><Grid2X2 className="h-4 w-4" /><span className="hidden md:inline">Grid</span></button>
            <button aria-label="Speaker notes" onClick={() => setNotesOpen((open) => !open)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground"><MessageSquareText className="h-4 w-4" /><span className="hidden md:inline">Notes</span></button>
            <button aria-label="Export PDF" onClick={() => window.open("/webinar?print=1", "_blank", "noopener,noreferrer")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground"><Printer className="h-4 w-4" /><span className="hidden md:inline">Export PDF</span></button>
            <button aria-label="Present slides" onClick={() => void present()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground sm:px-4"><Maximize2 className="h-4 w-4" /><span className="hidden sm:inline">Present</span></button>
          </div>
        </header>
      )}

      {gridOpen ? (
        <section className={`h-full overflow-y-auto px-6 pb-12 ${presenting ? "pt-6" : "pt-24"}`} aria-label="Slide overview">
          <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide, i) => (
              <button key={slide.title} onClick={() => { goTo(i); setGridOpen(false); }} className="group text-left">
                <div className={`aspect-video overflow-hidden rounded-xl border bg-card transition-colors ${i === index ? "border-primary" : "border-border group-hover:border-primary/60"}`}>
                  <div className="pointer-events-none h-full w-full">{i === 0 ? <OpeningSlide print /> : slide.element}</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground"><span className="mr-2 font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>{slide.title}</p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section
          className={`relative h-full w-full ${presenting ? "bg-background" : "pb-16 pt-16"}`}
          onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={onTouchEnd}
          aria-label={`Slide ${index + 1} of ${slides.length}: ${slides[index].title}`}
        >
          <div key={index} className="h-full w-full animate-fade-in">{slides[index].element}</div>
        </section>
      )}

      {!gridOpen && (
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/95 p-1.5 shadow-lg">
          <button aria-label="Previous slide" onClick={() => goTo(index - 1)} disabled={index === 0} className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowLeft className="h-5 w-5" /></button>
          <span className="min-w-[62px] text-center font-mono text-xs text-muted-foreground">{index + 1} / {slides.length}</span>
          <button aria-label="Next slide" onClick={() => goTo(index + 1)} disabled={index === slides.length - 1} className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowRight className="h-5 w-5" /></button>
        </div>
      )}

      {presenting && (
        <button aria-label="Exit presentation" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); setPresenting(false); }} className="absolute right-5 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-30 transition-opacity hover:opacity-100"><X className="h-5 w-5" /></button>
      )}

      {notesOpen && !gridOpen && (
        <aside className="absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto border-t border-border bg-card px-6 py-5 shadow-2xl">
          <div className="mx-auto flex max-w-4xl items-start gap-5">
            <MessageSquareText className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Speaker notes · {index + 1}/{slides.length}</p><p className="mt-2 text-base leading-relaxed text-foreground">{slides[index].notes}</p></div>
            <button aria-label="Close notes" onClick={() => setNotesOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
        </aside>
      )}
    </main>
  );
};

export default BystanderWebinar;
