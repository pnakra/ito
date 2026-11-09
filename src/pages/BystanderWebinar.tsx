import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, Grid2X2, Maximize2, MessageSquareText, Printer, X } from "lucide-react";
import SEO from "@/components/SEO";
import SlideLayout from "@/components/webinar/SlideLayout";
import {
  EntryProductVisual,
  GroupChatVisual,
  ItoWordmark,
  PracticeProductVisual,
  ReportProductVisual,
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

const OpeningSlide = () => (
  <SlideLayout page={1} section="Campus + Greek life">
    <div className="grid flex-1 grid-cols-[1.04fr_0.96fr] items-center gap-[100px]">
      <div>
        <Kicker>Online bystander intervention</Kicker>
        <SlideTitle className="slide-title-lg italic">Someone always sees it first.</SlideTitle>
        <p className="slide-subtitle mt-9 max-w-[800px] text-muted-foreground">The next move can change what happens next.</p>
        <div className="mt-14 flex items-center gap-5 text-muted-foreground">
          <ItoWordmark className="text-[42px] text-foreground" />
          <span className="h-12 w-px bg-border" />
          <p className="slide-caption max-w-[360px]">A practical tool for campus and Greek life communities</p>
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-10 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative"><GroupChatVisual responded /></div>
      </div>
    </div>
  </SlideLayout>
);

const ProblemSlide = () => (
  <SlideLayout page={2} section="The problem">
    <Kicker>The bystander equation changes in a group chat</Kicker>
    <SlideTitle>Silence can start to look like agreement.</SlideTitle>
    <div className="mt-[64px] grid flex-1 grid-cols-[0.9fr_1.1fr] gap-[100px]">
      <GroupChatVisual />
      <div className="flex flex-col justify-center space-y-7">
        {[
          ["Uncertainty", "“Is this really that serious?”"],
          ["Diffusion of responsibility", "“Someone else will say something.”"],
          ["Social cost", "“What if they turn on me?”"],
        ].map(([title, quote], i) => (
          <div key={title} className="grid grid-cols-[70px_1fr] items-start gap-5 rounded-2xl border border-border bg-card/60 p-6">
            <span className="slide-subtitle font-serif italic text-primary">0{i + 1}</span>
            <div>
              <p className="slide-body-lg font-medium text-foreground">{title}</p>
              <p className="slide-body mt-1 text-muted-foreground">{quote}</p>
            </div>
          </div>
        ))}
        <p className="slide-caption max-w-[720px] pt-2 text-muted-foreground">Online, messages travel, evidence can disappear, and the person targeted may not be in the room. The opening to act can be easy to miss.</p>
      </div>
    </div>
  </SlideLayout>
);

const SharedEngineSlide = () => (
  <SlideLayout page={3} section="The product">
    <div className="grid h-full grid-cols-[1fr_0.9fr] items-center gap-[100px]">
      <div>
        <Kicker>One calm outside perspective</Kicker>
        <SlideTitle className="italic">ito helps people find a next move before a moment turns into harm.</SlideTitle>
        <div className="mt-12 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="slide-body-lg font-medium text-foreground">“This is about me”</p>
            <p className="slide-body mt-2 text-muted-foreground">Slow down, check the story, and rethink what consent actually looks like.</p>
          </div>
          <div className="rounded-2xl border border-primary bg-accent/60 p-6">
            <p className="slide-body-lg font-medium text-foreground">“This is about someone else”</p>
            <p className="slide-body mt-2 text-muted-foreground">Name what feels off, consider safety, and choose a concrete way to step in.</p>
          </div>
        </div>
        <p className="slide-caption mt-8 text-muted-foreground">Two entry points. One shared reflection and safety engine.</p>
      </div>
      <EntryProductVisual />
    </div>
  </SlideLayout>
);

const frameworks = [
  ["Check in with the person targeted", "Delay", "“Are you ok?” after a post, party, or incident."],
  ["Change the space", "Distract", "Change the subject, amplify something else, or create an exit."],
  ["Call in support", "Delegate", "Bring in friends, a moderator, sober monitor, Title IX, or RAINN."],
  ["Collect evidence", "Document", "Save messages and timestamps. Ask what the person wants done with them."],
  ["Challenge the behavior", "Direct", "“Nah, nobody's going up.” Clear, calm, and only when safe."],
];

const FrameworkSlide = () => (
  <SlideLayout page={4} section="The action vocabulary">
    <Kicker>EndTAB's 5 C's + the 5 D's</Kicker>
    <div className="flex items-end justify-between gap-8">
      <SlideTitle>Two frameworks. Five practical moves.</SlideTitle>
      <p className="slide-caption max-w-[450px] pb-2 text-right text-muted-foreground">Paired here by function, not as formal equivalents.</p>
    </div>
    <div className="mt-10 flex-1 space-y-3">
      {frameworks.map(([c, d, example], i) => (
        <div key={c} className="grid grid-cols-[1.05fr_0.42fr_1.25fr] items-center gap-7 rounded-2xl border border-border bg-card/70 px-7 py-[17px]">
          <div className="flex items-center gap-5">
            <span className="slide-chrome flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">{i + 1}</span>
            <p className="slide-body font-medium text-foreground">{c}</p>
          </div>
          <p className="slide-body-lg font-serif italic text-primary">{d}</p>
          <p className="slide-caption text-muted-foreground">{example}</p>
        </div>
      ))}
    </div>
    <p className="slide-chrome mt-5 text-muted-foreground">5 C's adapted from the EndTAB training deck. 5 D's popularized by Right To Be.</p>
  </SlideLayout>
);

const InProductSlide = () => (
  <SlideLayout page={5} section="Inside the bystander beta">
    <div className="grid h-full grid-cols-[0.9fr_1fr] items-center gap-[90px]">
      <ResponseProductVisual />
      <div>
        <Kicker>Guidance in the moment</Kicker>
        <SlideTitle>The framework becomes a next move.</SlideTitle>
        <div className="mt-9 space-y-6">
          <div className="grid grid-cols-[46px_1fr] gap-4">
            <span className="slide-subtitle font-serif italic text-primary">1</span>
            <div><p className="slide-body-lg font-medium text-foreground">Understand the moment</p><p className="slide-caption mt-1 text-muted-foreground">Who is involved, when it happened, immediate safety, and what was actually seen.</p></div>
          </div>
          <div className="grid grid-cols-[46px_1fr] gap-4">
            <span className="slide-subtitle font-serif italic text-primary">2</span>
            <div><p className="slide-body-lg font-medium text-foreground">Combine safe actions</p><p className="slide-caption mt-1 text-muted-foreground">Document the message. Delegate to friends. Directly break the group's momentum.</p></div>
          </div>
          <div className="grid grid-cols-[46px_1fr] gap-4">
            <span className="slide-subtitle font-serif italic text-primary">3</span>
            <div><p className="slide-body-lg font-medium text-foreground">Keep support within reach</p><p className="slide-caption mt-1 text-muted-foreground">Guides, crisis links, and a report preview help people understand their options.</p></div>
          </div>
        </div>
        <div className="mt-8"><ProductLink href="/bystanderbeta">Open the bystander beta</ProductLink></div>
      </div>
    </div>
  </SlideLayout>
);

const PracticeSlide = () => (
  <SlideLayout page={6} section="From knowledge to practice">
    <div className="grid h-full grid-cols-[1fr_0.92fr] items-center gap-[100px]">
      <div>
        <Kicker>Practice under social pressure</Kicker>
        <SlideTitle className="italic">Rehearse the words before you need them.</SlideTitle>
        <p className="slide-body-lg mt-8 max-w-[850px] text-muted-foreground">Short scenarios turn the 5 D's into choices, tradeoffs, and language someone can actually use.</p>
        <div className="mt-9 grid grid-cols-3 gap-4">
          {[["Online", "The group chat"], ["In person", "On the stairs"], ["After", "The morning after"]].map(([label, title]) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5">
              <p className="slide-chrome uppercase tracking-wider text-primary">{label}</p>
              <p className="slide-body mt-2 font-medium text-foreground">{title}</p>
            </div>
          ))}
        </div>
        <p className="slide-caption mt-7 text-muted-foreground">Earlier moves score higher. Group pressure changes after each choice. Scores stay on the device.</p>
        <div className="mt-7"><ProductLink href="/witness/practice">Try a practice scenario</ProductLink></div>
      </div>
      <PracticeProductVisual />
    </div>
  </SlideLayout>
);

const ClosingSlide = () => (
  <SlideLayout page={7} section="Beyond the webinar">
    <div className="grid h-full grid-cols-[1.05fr_0.95fr] items-center gap-[100px]">
      <div>
        <Kicker>A one-off training is a place to start</Kicker>
        <SlideTitle className="slide-title-lg italic">Training ends. The group chat doesn't.</SlideTitle>
        <p className="slide-subtitle mt-9 max-w-[920px] text-muted-foreground">ito puts a calm next move in someone's pocket, online and off.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ProductLink href="/bystanderbeta">Open the bystander beta</ProductLink>
          <ProductLink href="/witness/practice">Practice a scenario</ProductLink>
        </div>
      </div>
      <div className="space-y-5">
        <ReportProductVisual />
        <div className="rounded-[28px] border border-primary bg-accent/50 p-7">
          <p className="slide-body-lg font-serif italic text-foreground">Pilot it with your campus or chapter.</p>
          <a href="mailto:priya@overridelabsprevention.org" className="slide-body mt-3 inline-block text-primary underline underline-offset-4">priya@overridelabsprevention.org</a>
          <p className="slide-chrome mt-4 text-muted-foreground">Bystander beta · No account or login · Reporting is preview-only</p>
        </div>
      </div>
    </div>
  </SlideLayout>
);

const slides: WebinarSlide[] = [
  { title: "Someone always sees it first", notes: "Open with the group chat. The goal is not to turn every bystander into a hero. It is to make one safe, concrete move easier to find.", element: <OpeningSlide /> },
  { title: "Silence can start to look like agreement", notes: "Name the three barriers: uncertainty, diffused responsibility, and social cost. Online spaces add distance, scale, permanence, and disappearing evidence.", element: <ProblemSlide /> },
  { title: "One shared ito engine", notes: "Start high level. ito began with the person whose own behavior may be heading toward harm. The bystander frame uses the same engine for the person watching. It offers reflection and a next move, not a ruling.", element: <SharedEngineSlide /> },
  { title: "The 5 C's and 5 D's", notes: "Walk down the five rows. The pairings are functional, not official equivalences. Stress indirect options and safety. Documenting should preserve the targeted person's choices, not spread the material further.", element: <FrameworkSlide /> },
  { title: "The framework inside the product", notes: "Demo the bystander beta here if useful. The product asks who the situation is about and when it is happening, then gives situational guidance. The example combines Document, Delegate, and Direct. Reporting remains a preview and never sends.", element: <InProductSlide /> },
  { title: "Practice before it is real", notes: "The practice scenarios cover online, in-person, and after-the-fact moments. Choices affect the group-pressure display and are labeled with the 5 D's. Scores stay on the device.", element: <PracticeSlide /> },
  { title: "Beyond the webinar", notes: "Close on continuity: training builds the vocabulary, and ito makes that vocabulary available in the moment. Invite campuses and chapters to pilot the bystander beta and share feedback.", element: <ClosingSlide /> },
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
        {slides.map((slide, i) => <div className="webinar-print-page" key={slide.title}>{slide.element}</div>)}
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
                  <div className="pointer-events-none h-full w-full">{slide.element}</div>
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
        <aside className="absolute inset-x-0 bottom-0 z-40 border-t border-border bg-card px-6 py-5 shadow-2xl">
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
