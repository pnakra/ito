import type { CSSProperties, ReactNode } from "react";
import { ArrowUp, Check, EyeOff, FileText, Hand, MessageCircle, ShieldCheck, Users } from "lucide-react";

/** Staggered entrance. `d` is the delay in ms. Animation is disabled in print. */
export const In = ({ d = 0, children, className = "" }: { d?: number; children: ReactNode; className?: string }) => (
  <div className={`wb-in ${className}`} style={{ "--d": d } as CSSProperties}>{children}</div>
);

export const SettingTag = ({ online = false, inPerson = false }: { online?: boolean; inPerson?: boolean }) => (
  <div className="flex gap-3">
    {online && <span className="slide-chrome inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary px-5 py-2 text-foreground"><MessageCircle className="h-5 w-5 text-primary" />Online</span>}
    {inPerson && <span className="slide-chrome inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary px-5 py-2 text-foreground"><Users className="h-5 w-5 text-primary" />In person</span>}
  </div>
);

const Frame = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="w-full rounded-[32px] border border-border bg-card p-9 shadow-2xl shadow-background/30">
    <div className="mb-7 flex items-center justify-between border-b border-border pb-5">
      <p className="slide-caption text-muted-foreground">{label}</p>
      <span className="slide-chrome text-muted-foreground">Illustrative</span>
    </div>
    {children}
  </div>
);

const Option = ({ text, picked = false, d }: { text: string; picked?: boolean; d: number }) => (
  <In d={d}>
    <div className={`slide-body flex items-center gap-4 rounded-xl border px-6 py-4 ${picked ? "wb-pick border-primary bg-accent text-foreground" : "border-border text-muted-foreground"}`} style={{ "--d2": d + 500 } as CSSProperties}>
      {picked ? <Check className="h-6 w-6 shrink-0 text-primary" /> : <span className="h-6 w-6 shrink-0 rounded-full border border-border" />}
      {text}
    </div>
  </In>
);

/** Check in with the victim: the witness safety check, built from the real screen. */
export const SafetyCheckDemo = () => (
  <Frame label="Bystander beta · safety check">
    <In d={200}><p className="slide-body-lg font-serif text-foreground">Before you act, what could make this backfire?</p></In>
    <div className="mt-6 space-y-3">
      <Option d={500} text="The person targeted could face retaliation" picked />
      <Option d={650} text="No specific risk I can see" />
    </div>
    <In d={1300}><p className="slide-body-lg mt-9 font-serif text-foreground">What do they want?</p></In>
    <div className="mt-6 space-y-3">
      <Option d={1600} text="They asked me not to share it" picked />
      <Option d={1750} text="They are open to help" />
    </div>
  </Frame>
);

/** Change the space: anonymous post plus ito's anti-amplification guidance. */
export const AnonPostDemo = () => (
  <div className="space-y-6">
    <In d={200}>
      <div className="rounded-[28px] border border-border bg-card p-8">
        <p className="slide-caption text-muted-foreground">Anonymous campus feed · 2h</p>
        <p className="slide-body-lg mt-4 text-foreground">who was the girl they carried upstairs last night 👀</p>
        <div className="slide-caption mt-6 flex items-center gap-8 text-muted-foreground">
          <span className="inline-flex items-center gap-2"><ArrowUp className="h-5 w-5" /><span className="wb-count">212</span></span>
          <span>48 replies</span>
        </div>
      </div>
    </In>
    <In d={1200}>
      <div className="rounded-[28px] border-l-4 border-primary bg-card p-8">
        <p className="slide-subtitle font-serif text-foreground">Do not help the post spread.</p>
        <p className="slide-body mt-4 text-muted-foreground">Don't reply or repost. Report it in the app. Save evidence privately.</p>
      </div>
    </In>
  </div>
);

/** Call in support: response card with the action label and campus links. */
export const SupportDemo = () => (
  <div className="space-y-6">
    <In d={200}>
      <div className="rounded-[28px] border border-border bg-card p-9">
        <div className="flex items-center gap-4"><Hand className="h-8 w-8 text-primary" /><p className="slide-body-lg font-medium text-foreground">What you can do</p></div>
        <p className="slide-subtitle mt-6 font-serif text-foreground">Get her friends. Don't do this alone.</p>
        <In d={900}><p className="slide-caption mt-6 text-primary">Call in support · Delegate</p></In>
      </div>
    </In>
    <In d={1400}>
      <div className="rounded-[28px] border border-border bg-card p-8">
        <p className="slide-caption mb-5 text-muted-foreground">Your campus</p>
        <div className="flex flex-wrap gap-3">
          <span className="slide-chrome rounded-full border border-primary bg-accent px-5 py-2 text-foreground">Campus support</span>
          <span className="slide-chrome wb-fade-out rounded-full border border-border px-5 py-2 text-muted-foreground">Title IX information</span>
          <span className="slide-chrome wb-fade-out rounded-full border border-border px-5 py-2 text-muted-foreground">Campus reporting</span>
        </div>
        <In d={2400}><p className="slide-caption mt-5 inline-flex items-center gap-2 text-muted-foreground"><EyeOff className="h-5 w-5" />Reporting hidden: they asked not to report.</p></In>
      </div>
    </In>
  </div>
);

/** Collect evidence: private evidence guidance and the preview-only report. */
export const EvidenceDemo = () => (
  <Frame label="Bystander beta · report preview">
    <In d={200}>
      <div className="flex items-center gap-3 rounded-xl border border-signal-pause/40 bg-signal-pause/10 px-6 py-4">
        <ShieldCheck className="h-7 w-7 shrink-0 text-signal-pause" />
        <p className="slide-caption text-foreground">Practice mode. Nothing is sent or saved.</p>
      </div>
    </In>
    <div className="mt-7 space-y-4">
      {["Screenshot with the time showing", "Keep it private. Don't forward it.", "Ask her what she wants done with it"].map((item, i) => (
        <In key={item} d={700 + i * 350}>
          <div className="slide-body flex items-center gap-4 text-foreground"><FileText className="h-6 w-6 shrink-0 text-primary" />{item}</div>
        </In>
      ))}
    </div>
    <In d={1900}>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {["Title IX", "RA", "RAINN"].map((r) => <span key={r} className="slide-chrome rounded-xl border border-border px-4 py-3 text-center text-muted-foreground">{r}</span>)}
      </div>
    </In>
  </Frame>
);

/** Challenge the abuse: the adults-only roleplay exchange and debrief. */
export const RoleplayDemo = () => (
  <Frame label="ito practice · roleplay">
    <div className="space-y-4">
      <In d={200}><div className="max-w-[82%] rounded-2xl rounded-bl-md bg-muted px-6 py-4"><p className="slide-chrome text-muted-foreground">Jake</p><p className="slide-body text-foreground">relax, she's into it</p></div></In>
      <In d={900}><div className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-accent px-6 py-4 text-right"><p className="slide-chrome text-muted-foreground">You</p><p className="slide-body text-foreground">She can barely stand. Nobody's going up.</p></div></In>
      <In d={1600}><div className="max-w-[82%] rounded-2xl rounded-bl-md bg-muted px-6 py-4"><p className="slide-chrome text-muted-foreground">Jake</p><p className="slide-body text-foreground">ok ok. chill.</p></div></In>
    </div>
    <In d={2300}>
      <div className="mt-7 border-t border-border pt-6">
        <p className="slide-caption text-primary">Debrief · What worked</p>
        <p className="slide-body mt-2 text-foreground">You named the problem without a speech.</p>
      </div>
    </In>
  </Frame>
);
