import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Cpu, FlaskConical, LifeBuoy, ShieldCheck, ExternalLink, Grid2X2, Hand, Lock, Maximize2, MessageCircle, MessageSquareText, Printer, Users, X } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import SlideLayout, { SlidePageContext } from "@/components/webinar/SlideLayout";
import { EntryProductVisual, GroupChatVisual, ItoWordmark } from "@/components/webinar/ProductVisuals";
import { AnonPostDemo, EvidenceDemo, In, RoleplayDemo, SafetyCheckDemo, SettingTag, SupportDemo } from "@/components/webinar/DemoVisuals";

interface WebinarSlide {
  title: string;
  notes: string;
  element: ReactNode;
  /** Static version for thumbnails and PDF (e.g. reveal already shown). */
  printElement?: ReactNode;
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
          <In><Kicker>Online + in-person bystander intervention · EndTAB + Priya</Kicker></In>
          <In d={150}><SlideTitle className="slide-title-lg italic">What would you do next?</SlideTitle></In>
          <In d={300}><div className="mt-12"><ItoWordmark className="text-[52px] text-foreground" /></div></In>
          {!print && (
            <Button variant="outline" className="slide-body mt-12 h-16 w-auto px-8" onClick={() => setRevealed((value) => !value)} aria-expanded={revealed}>
              {revealed ? "Hide one possible move" : "Reveal one possible move"}<ArrowRight />
            </Button>
          )}
          {showResponse && <p className="slide-caption mt-8 max-w-[650px] text-muted-foreground">One option, only if it is safe to speak up.</p>}
        </div>
        <In d={450}><GroupChatVisual responded={showResponse} /></In>
      </div>
    </SlideLayout>
  );
};

const ProblemSlide = () => (
  <SlideLayout page={2} section="The problem">
    <In><Kicker>The pause before anyone acts</Kicker></In>
    <In d={150}><SlideTitle>Silence can look like agreement.</SlideTitle></In>
    <div className="mt-20 flex flex-1 flex-col justify-center gap-12">
      {["“Is it serious?”", "“Someone else will act.”", "“What if they turn on me?”"].map((quote, i) => (
        <In key={quote} d={500 + i * 450}>
          <div className="flex items-center gap-10 border-b border-border pb-9">
            <span className="slide-body-lg font-serif italic text-primary">0{i + 1}</span>
            <p className="slide-subtitle text-foreground">{quote}</p>
          </div>
        </In>
      ))}
    </div>
  </SlideLayout>
);

const builtOn = [
  { icon: BookOpen, title: "Rooted in research", line: "Consent + bystander frameworks" },
  { icon: Cpu, title: "Rules first, then AI", line: "AI can raise concern. Never lower it." },
  { icon: Lock, title: "Anonymous by design", line: "No account. No login." },
];

const WhySlide = () => (
  <SlideLayout page={3} section="Why ito exists">
    <In><Kicker>Why we built it</Kicker></In>
    <In d={150}><SlideTitle className="italic">Built for the moment before.</SlideTitle></In>
    <In d={350}><p className="slide-body-lg mt-8 max-w-[1100px] text-muted-foreground">Training happens once. Decisions happen at 1 AM.</p></In>
    <div className="mt-16 grid flex-1 grid-cols-3 items-start gap-10">
      {builtOn.map(({ icon: Icon, title, line }, i) => (
        <In key={title} d={800 + i * 400}>
          <div className="min-h-[280px] rounded-[28px] border border-border bg-card p-10">
            <Icon className="h-12 w-12 text-primary" aria-hidden="true" />
            <p className="slide-body-lg mt-8 font-medium text-foreground">{title}</p>
            <p className="slide-body mt-4 text-muted-foreground">{line}</p>
          </div>
        </In>
      ))}
    </div>
  </SlideLayout>
);

const SharedEngineSlide = () => (
  <SlideLayout page={4} section="The product">
    <div className="grid h-full grid-cols-[1fr_0.9fr] items-center gap-[100px]">
      <div>
        <In><Kicker>ito</Kicker></In>
        <In d={150}><SlideTitle className="slide-title-lg italic">Two doors. One engine.</SlideTitle></In>
        <div className="mt-16 space-y-10">
          <In d={600}>
            <div className="border-l-2 border-border pl-7">
              <p className="slide-body-lg font-medium text-foreground">About me</p>
              <p className="slide-body mt-3 text-muted-foreground">Rethink your next move.</p>
            </div>
          </In>
          <In d={1000}>
            <div className="border-l-2 border-primary pl-7">
              <p className="slide-body-lg font-medium text-foreground">About someone else</p>
              <p className="slide-body mt-3 text-muted-foreground">Find a way to step in.</p>
            </div>
          </In>
        </div>
      </div>
      <In d={400}><EntryProductVisual /></In>
    </div>
  </SlideLayout>
);

const BothSlide = () => (
  <SlideLayout page={5} section="Online + in person">
    <In><Kicker>The bystander beta</Kicker></In>
    <In d={150}><SlideTitle>Built for both.</SlideTitle></In>
    <div className="mt-16 grid grid-cols-2 gap-10">
      {[
        { icon: MessageCircle, label: "Online", places: ["Group chats", "Sidechat + Fizz", "DMs + stories"] },
        { icon: Users, label: "In person", places: ["Parties", "Chapter houses", "Walking home"] },
      ].map(({ icon: Icon, label, places }, i) => (
        <In key={label} d={500 + i * 400}>
          <div className="rounded-[28px] border border-border bg-card p-10">
            <div className="flex items-center gap-4"><Icon className="h-11 w-11 text-primary" /><p className="slide-subtitle font-serif italic text-foreground">{label}</p></div>
            <div className="mt-8 flex flex-wrap gap-3">
              {places.map((p) => <span key={p} className="slide-chrome whitespace-nowrap rounded-full border border-border px-5 py-2 text-muted-foreground">{p}</span>)}
            </div>
          </div>
        </In>
      ))}
    </div>
    <div className="mt-auto flex items-center justify-center gap-8 pt-12">
      {["Understand", "Check safety", "Choose a move"].map((label, i) => (
        <In key={label} d={1500 + i * 300}>
          <div className="flex items-center gap-8">
            {i > 0 && <ArrowRight className="h-9 w-9 text-primary" aria-hidden="true" />}
            <p className="slide-body-lg text-foreground">{label}</p>
          </div>
        </In>
      ))}
    </div>
  </SlideLayout>
);

const fiveCs = ["Check in with the Victim", "Change the Space", "Call in Support", "Collect Evidence", "Challenge the Abuse"];
const fiveDs = ["Direct", "Distract", "Delegate", "Document", "Delay"];

const FrameworkSlide = () => (
  <SlideLayout page={6} section="The action vocabulary">
    <In><Kicker>Two frameworks, side by side</Kicker></In>
    <In d={150}><SlideTitle>Complementary, not translations.</SlideTitle></In>
    <div className="mt-14 grid flex-1 grid-cols-2 gap-20">
      {[{ head: "5 C's · EndTAB", items: fiveCs, serif: false }, { head: "5 D's · Right To Be", items: fiveDs, serif: true }].map((col, c) => (
        <div key={col.head}>
          <In d={400 + c * 200}><p className="slide-caption border-b border-border pb-4 text-muted-foreground">{col.head}</p></In>
          {col.items.map((item, i) => (
            <In key={item} d={700 + c * 900 + i * 150}>
              <p className={`border-b border-border py-6 ${col.serif ? "slide-subtitle font-serif italic text-primary" : "slide-body-lg font-medium text-foreground"}`}>{item}</p>
            </In>
          ))}
        </div>
      ))}
    </div>
  </SlideLayout>
);

interface DemoProps { page: number; c: string; d: string; title: string; online?: boolean; inPerson?: boolean; demo: ReactNode; link?: { href: string; label: string } }

const DemoSlide = ({ page, c, d, title, online, inPerson, demo, link }: DemoProps) => (
  <SlideLayout page={page} section="Live in the product">
    <div className="grid h-full grid-cols-[0.8fr_1.2fr] items-center gap-[90px]">
      <div>
        <In><Kicker>{c}</Kicker></In>
        <In d={150}><SlideTitle className="italic">{title}</SlideTitle></In>
        <In d={350}><p className="slide-body-lg mt-8 font-serif italic text-primary">{d}</p></In>
        <In d={500}><div className="mt-10"><SettingTag online={online} inPerson={inPerson} /></div></In>
        {link && <In d={650}><div className="mt-10"><ProductLink href={link.href}>{link.label}</ProductLink></div></In>}
      </div>
      <div>{demo}</div>
    </div>
  </SlideLayout>
);

const PracticeSlide = () => (
  <SlideLayout page={12} section="From online to in person">
    <In><Kicker>Same situation. Two openings to act.</Kicker></In>
    <In d={150}><SlideTitle className="italic">Rehearse the words.</SlideTitle></In>
    <div className="mt-16 grid flex-1 grid-cols-[1fr_80px_1fr] items-center gap-10">
      <In d={500}>
        <div className="border-t-2 border-primary pt-10">
          <MessageSquareText className="mb-8 h-14 w-14 text-primary" aria-hidden="true" />
          <p className="slide-body-lg font-medium text-foreground">Online · The group chat</p>
          <p className="slide-subtitle mt-9 font-serif text-foreground">“Nobody's going up. Let's get her friends.”</p>
          <p className="slide-caption mt-8 text-muted-foreground">Direct + Delegate</p>
        </div>
      </In>
      <In d={1100}><ArrowRight className="h-12 w-12 text-primary" aria-hidden="true" /></In>
      <In d={1500}>
        <div className="border-t-2 border-border pt-10">
          <Hand className="mb-8 h-14 w-14 text-primary" aria-hidden="true" />
          <p className="slide-body-lg font-medium text-foreground">In person · At the stairs</p>
          <p className="slide-subtitle mt-9 font-serif text-foreground">“Let's head downstairs. Your friends are there.”</p>
          <p className="slide-caption mt-8 text-muted-foreground">Distract + Delegate</p>
        </div>
      </In>
    </div>
    <div className="mt-8"><ProductLink href="/witness/practice">Try a practice scenario</ProductLink></div>
  </SlideLayout>
);

const spokes = [
  { label: "About me", live: true },
  { label: "Bystander", live: true },
  { label: "Practice", live: true },
  { label: "Campus pilots", live: true },
  { label: "Athletics?", live: false },
  { label: "Workplaces?", live: false },
];

const ScaleSlide = () => (
  <SlideLayout page={13} section="Why frameworks scale">
    <div className="grid h-full grid-cols-[0.85fr_1.15fr] items-center gap-[80px]">
      <div>
        <In><Kicker>Principles first</Kicker></In>
        <In d={150}><SlideTitle className="italic">Build on frameworks. New moments become features.</SlideTitle></In>
      </div>
      <div className="relative mx-auto h-[720px] w-[880px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><In d={300}>
          <div className="wb-pulse flex h-[240px] w-[240px] flex-col items-center justify-center rounded-full border-2 border-primary bg-card text-center">
            <p className="slide-body-lg font-medium text-foreground">One engine</p>
            <p className="slide-caption mt-2 text-muted-foreground">5 C's · 5 D's · safety</p>
          </div>
        </In></div>
        {spokes.map((s, i) => {
          const angle = (i / spokes.length) * Math.PI * 2 - Math.PI / 2;
          const x = 440 + Math.cos(angle) * 320;
          const y = 360 + Math.sin(angle) * 280;
          return (
            <div key={s.label} style={{ position: "absolute", left: x, top: y }} className="-translate-x-1/2 -translate-y-1/2">
              <In d={800 + i * 300}>
                <span className={`slide-body block whitespace-nowrap rounded-full border px-7 py-3 ${s.live ? "border-primary bg-accent text-foreground" : "border-dashed border-border text-muted-foreground"}`}>{s.label}</span>
              </In>
            </div>
          );
        })}
      </div>
    </div>
  </SlideLayout>
);

const IntroSlide = () => (
  <SlideLayout page={1} section="Who we are">
    <In><Kicker>Online + in-person bystander intervention · EndTAB + Override Labs</Kicker></In>
    <In d={150}><SlideTitle className="slide-title-lg italic">Prevention for the moment before.</SlideTitle></In>
    <div className="mt-20 grid flex-1 grid-cols-3 items-start gap-10">
      {[
        { label: "Override Labs", line: "Builds prevention tech for sexual violence." },
        { label: "Priya Nakra", line: "Founder. Builds ito." },
        { label: "With EndTAB", line: "Their 5 C's shape how ito helps bystanders." },
      ].map(({ label, line }, i) => (
        <In key={label} d={600 + i * 400}>
          <div className="min-h-[240px] border-t-2 border-primary pt-8">
            <p className="slide-subtitle font-serif text-foreground">{label}</p>
            <p className="slide-body mt-5 text-muted-foreground">{line}</p>
          </div>
        </In>
      ))}
    </div>
  </SlideLayout>
);

const safeAi = [
  { icon: ShieldCheck, title: "Rules run first", line: "AI can raise concern. Never lower it." },
  { icon: Hand, title: "Never a permission slip", line: "Challenges coercive framing." },
  { icon: LifeBuoy, title: "Crisis routes built in", line: "911, 988, text 741741." },
  { icon: FlaskConical, title: "Tested before it ships", line: "300-scenario eval suite." },
];

const SafeAiSlide = () => (
  <SlideLayout page={4} section="Safe AI">
    <In><Kicker>What makes it safe</Kicker></In>
    <In d={150}><SlideTitle className="italic">Safety is the product.</SlideTitle></In>
    <div className="mt-16 grid flex-1 grid-cols-2 content-start gap-8">
      {safeAi.map(({ icon: Icon, title, line }, i) => (
        <In key={title} d={600 + i * 350}>
          <div className="flex items-center gap-8 rounded-[28px] border border-border bg-card p-9">
            <Icon className="h-12 w-12 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="slide-body-lg font-medium text-foreground">{title}</p>
              <p className="slide-body mt-2 text-muted-foreground">{line}</p>
            </div>
          </div>
        </In>
      ))}
    </div>
  </SlideLayout>
);

const AskSlide = () => (
  <SlideLayout page={16} section="The ask">
    <In><Kicker>Training ends. The group chat doesn't.</Kicker></In>
    <In d={150}><SlideTitle className="slide-title-lg italic">Try it. Then tell us.</SlideTitle></In>
    <div className="mt-16 grid grid-cols-3 gap-10">
      {[
        { n: "01", title: "Try it yourself", line: "Use a hyper-realistic example." },
        { n: "02", title: "Nothing is real", line: "Anonymous. Practice mode. Nothing is sent." },
        { n: "03", title: "Give feedback", line: "What helped? What felt off?" },
      ].map(({ n, title, line }, i) => (
        <In key={n} d={600 + i * 400}>
          <div className="border-t border-border pt-8">
            <span className="slide-body-lg font-serif italic text-primary">{n}</span>
            <p className="slide-body-lg mt-4 font-medium text-foreground">{title}</p>
            <p className="slide-body mt-3 text-muted-foreground">{line}</p>
          </div>
        </In>
      ))}
    </div>
    <In d={1900}>
      <div className="mt-16 flex items-end justify-between gap-10 border-t border-border pt-10">
        <div className="flex gap-6">
          <ProductLink href="/bystanderbeta">ito.lovable.app/bystanderbeta</ProductLink>
          <ProductLink href="/bystanderbeta/feedback">Give feedback</ProductLink>
        </div>
        <div className="text-right">
          <p className="slide-subtitle font-serif text-foreground">Pilot it with your group.</p>
          <a href="mailto:priya@overridelabsprevention.org" className="slide-body mt-3 inline-block text-primary underline underline-offset-4">priya@overridelabsprevention.org</a>
        </div>
      </div>
    </In>
  </SlideLayout>
);

const slides: WebinarSlide[] = [
  { title: "Override Labs + EndTAB", notes: "Introduce yourself and Override Labs: we build prevention technology for the moment before harm happens. Then the EndTAB connection: EndTAB's online bystander work, including the 5 C's, shapes how ito helps bystanders. Keep this under a minute.", element: <IntroSlide /> },
  { title: "Built for the moment before", notes: "Why ito exists: most prevention training happens once, at orientation, but decisions happen late at night, in a group chat or a hallway, often with alcohol involved. People already turn to a friend or their phone in that moment. ito puts a thoughtful second opinion there. How it is built: first, it is rooted in research frameworks, consent principles and bystander models like EndTAB's 5 C's and the 5 D's, so every suggestion maps to a named action. Second, deterministic safety rules run first; an AI read can raise the level of concern but never lowers a red flag. Third, it is anonymous by design: no account, no login. Conversations may be reviewed to improve the tool.", element: <WhySlide /> },
  { title: "Two doors. One engine.", notes: "Two entry points share one safety engine. About me: for the person whose own behavior may cause harm, to challenge assumptions and rethink the next move. About someone else: for the bystander. Same safety rules, same evaluation suite, not separate products. ito offers a reflection and a next move, never a ruling or permission.", element: <SharedEngineSlide /> },
  { title: "Safety is the product", notes: "What makes this safe AI. One: deterministic safety rules run before any AI, and the AI read can raise concern but never lower a red flag. Two: ito never gives permission; it challenges coercive framing and will not help with harm. Three: crisis routes are built in, 911 for immediate danger, 988 and Crisis Text Line. Four: every change is tested against a 300-scenario evaluation suite, including adversarial attempts, before it ships.", element: <SafeAiSlide /> },
  { title: "What would you do next?", notes: "Open with the house group chat and let the audience sit with it for ten seconds. Ask what they would do next, then take one or two responses before revealing one possible move. This is an illustrative situation. 'Gone' raises a concern about capacity to consent; nobody else can give consent for her. Direct language is one option only if safe; a trusted friend or sober monitor can be a lower-risk first move.", element: <OpeningSlide />, printElement: <OpeningSlide print /> },
  { title: "Silence can look like agreement", notes: "Name uncertainty, diffusion of responsibility, and social cost without reading a paragraph. Online spaces add scale, distance, and messages that spread or disappear. A laugh or repost can amplify harm; silence does not establish agreement or consent. These are reasons people hesitate, not excuses.", element: <ProblemSlide /> },
  { title: "Built for both", notes: "Say this plainly: the bystander beta is built for online and in-person intervention. Online covers group chats, anonymous apps like Sidechat and Fizz, DMs and stories. In person covers parties, chapter houses, walking home. Either setting runs the same path: understand what happened, check safety and the targeted person's wishes, and choose a concrete move. A situation does not have to start online to use it.", element: <BothSlide /> },
  { title: "Complementary, not translations", notes: "These are EndTAB's exact five C's from the supplied deck: Check in with the Victim, Change the Space, Call in Support, Collect Evidence, Challenge the Abuse. Next to them, Right To Be's five D's: Direct, Distract, Delegate, Document, Delay. They overlap but are not one-to-one. EndTAB's Change the Space is about amplifying the positive and drowning out the abuse online, which is broader than Distract. Check in can happen immediately, not only later. The next five slides show each C as it appears in the product.", element: <FrameworkSlide /> },
  { title: "Check in with the Victim", notes: "Live in the product: before suggesting a move for a situation that is not happening right now, the bystander beta asks two questions. What could make this backfire, including retaliation against the person targeted. And what does the person targeted want. If they asked not to share it, ito changes the displayed suggestion to keep the post, screenshots, and their story private and to ask before reporting or sharing. Immediate situations skip these questions so nothing slows down a 911 call. This applies online and in person.", element: <DemoSlide page={7} c="5 C's · Check in with the Victim" d="Their wishes shape the move." title="Ask before acting." online inPerson demo={<SafetyCheckDemo />} link={{ href: "/bystanderbeta", label: "Open the bystander beta" }} /> },
  { title: "Change the Space", notes: "EndTAB's online Change the Space: amplify the positive, drown out the abuse. On anonymous apps, the biggest risk is that engagement spreads the post. When ito detects an online context, it shows anti-amplification guidance: do not help the post spread, do not reply or repost, report it in the app, save evidence privately. If the AI's suggestion would amplify, ito replaces it. The feed shown is an illustrative mock, not a real post. In person, the parallel is Distract: change the conversation or create an exit.", element: <DemoSlide page={8} c="5 C's · Change the Space" d="Online: starve the pile-on." title="Don't feed it." online demo={<AnonPostDemo />} link={{ href: "/witness/guide/anonymous-posts", label: "Anonymous posts guide" }} /> },
  { title: "Call in Support", notes: "Every suggestion carries a plain-language action label, here Call in Support, which aligns with Delegate. Campus pilots can add validated links to campus support, Title IX information, and campus reporting. If the person targeted asked not to report or share, the Title IX and reporting links are hidden and only support stays. This response is illustrative, not a guaranteed AI output.", element: <DemoSlide page={9} c="5 C's · Call in Support" d="Delegate: you don't act alone." title="Bring in help." online inPerson demo={<SupportDemo />} /> },
  { title: "Collect Evidence", notes: "Collect Evidence, which aligns with Document. ito's guidance: capture it with the time showing, keep it private, never forward it, and let the person targeted decide what happens with it. The report preview shows what each recipient can and cannot do. It is practice mode only: it never sends or stores a report, pending legal review and vetted recipients.", element: <DemoSlide page={10} c="5 C's · Collect Evidence" d="Document, privately." title="Save it. Don't spread it." online demo={<EvidenceDemo />} link={{ href: "/witness/tip", label: "See the report preview" }} /> },
  { title: "Challenge the Abuse", notes: "Challenge the Abuse, which aligns with Direct, is the hardest move and the one people least want to do cold. The adults-only roleplay beta lets someone type what they would actually say, hear one character push back, and get a debrief: what worked, what to work on, and a line to try next time. The exchange shown is illustrative. Direct is only one option, and only if safe; if speaking up risks retaliation, delegate instead.", element: <DemoSlide page={11} c="5 C's · Challenge the Abuse" d="Direct, only if safe." title="Practice saying it." online inPerson demo={<RoleplayDemo />} /> },
  { title: "Rehearse the words", notes: "Carry the opening situation from the phone to the house. Online, a direct message can interrupt momentum and bring in support. At the stairs, a low-key invitation downstairs can create an exit without a public confrontation. These are example words, not a universal script. If someone is in immediate danger, seek emergency help rather than waiting for the tool. Practice scores stay on the device.", element: <PracticeSlide /> },
  { title: "Build on frameworks", notes: "The bigger point: because ito is built on frameworks rather than on one scenario, new settings become configuration, not new products. Bystander mode is a frame on the same engine as About me. Practice reuses the same action vocabulary. Campus pilots plug in their own validated links without changing code. The same principles, consent, the 5 C's and 5 D's, and safety-first rules, could extend to athletics teams or workplaces. Those dashed ones are possibilities, not current offerings. Every extension inherits the same safety system and evaluation suite.", element: <ScaleSlide /> },
  { title: "Try it. Then tell us.", notes: "The ask. Try the bystander beta yourself, and use a hyper-realistic example, the kind of thing that actually happens in your chapter or on your campus, because that is what tests it. It is anonymous: no account, no login, and reporting is practice mode only, nothing is sent. Then use the feedback link at the top of every screen: what helped, what felt off, what was missing. If you want to pilot it with your campus, chapter, or team, email me. Pilots can add your own support links and get an aggregate-only snapshot, never anyone's story.", element: <AskSlide /> },
];

const renderSlide = (i: number, print = false) => (
  <SlidePageContext.Provider value={{ page: i + 1, total: slides.length }}>
    {print ? slides[i].printElement ?? slides[i].element : slides[i].element}
  </SlidePageContext.Provider>
);

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
        {slides.map((slide, i) => <div className="webinar-print-page" key={slide.title}>{renderSlide(i, true)}</div>)}
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
                  <div className="pointer-events-none h-full w-full">{renderSlide(i, true)}</div>
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
          <div key={index} className="h-full w-full animate-fade-in">{renderSlide(index)}</div>
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
