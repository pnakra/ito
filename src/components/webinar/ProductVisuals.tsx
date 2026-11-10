import { ArrowRight, Check, FileText, Hand, MessageCircle, ShieldCheck } from "lucide-react";

export const ItoWordmark = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex flex-col items-center font-serif italic ${className}`}>
    <span>is this ok?</span>
    <svg className="mt-1 w-[72%] text-primary/50" viewBox="0 0 120 8" fill="none" aria-hidden="true">
      <path d="M2 5.5C20 2.5 40 6 60 3.5C80 1 100 5.5 118 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);

export const GroupChatVisual = ({ responded = false }: { responded?: boolean }) => (
  <div className="rounded-[32px] border border-border bg-card p-8 shadow-2xl shadow-background/30">
    <div className="mb-7 flex items-center justify-between border-b border-border pb-5">
      <div>
        <p className="slide-body-lg font-medium text-foreground">House group chat</p>
        <p className="slide-caption text-muted-foreground">Saturday, 1:03 AM</p>
      </div>
      <MessageCircle className="h-9 w-9 text-primary" aria-hidden="true" />
    </div>
    <div className="space-y-5">
      <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-muted px-6 py-4">
        <p className="slide-caption mb-1 text-muted-foreground">Jake</p>
        <p className="slide-body text-foreground">free real estate upstairs 😂</p>
      </div>
      <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-muted px-6 py-4">
        <p className="slide-caption mb-1 text-muted-foreground">Marco</p>
        <p className="slide-body text-foreground">who is it</p>
      </div>
      <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-muted px-6 py-4">
        <p className="slide-caption mb-1 text-muted-foreground">Jake</p>
        <p className="slide-body text-foreground">the girl from bio, she's gone lol</p>
      </div>
      {responded && (
        <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-md bg-accent px-6 py-4 text-right">
          <p className="slide-caption mb-1 text-muted-foreground">You</p>
          <p className="slide-body font-medium text-foreground">Nobody's going up. Let's get her friends.</p>
        </div>
      )}
    </div>
  </div>
);

export const EntryProductVisual = () => (
  <div className="mx-auto w-full max-w-[650px] rounded-[36px] border border-border bg-card p-9 shadow-2xl shadow-background/30">
    <div className="mb-7 text-center">
      <div><span className="slide-chrome inline-block rounded border border-border px-3 py-1 uppercase tracking-wider text-muted-foreground">Bystander beta</span></div>
      <ItoWordmark className="mt-5 text-[58px] leading-none text-foreground" />
    </div>
    <div className="rounded-2xl bg-background p-6">
      <p className="slide-body text-muted-foreground">What did you see or hear?</p>
      <div className="mt-12 flex items-center justify-between">
        <span className="slide-chrome text-muted-foreground">anonymous. not linked to you.</span>
        <span className="slide-chrome inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">Go <ArrowRight className="h-4 w-4" /></span>
      </div>
    </div>

  </div>
);

export const ResponseProductVisual = () => (
  <div className="w-full rounded-lg border border-border bg-card p-10 shadow-2xl shadow-background/30">
    <div className="flex items-center gap-4">
      <Hand className="h-9 w-9 text-primary" aria-hidden="true" />
      <p className="slide-body-lg font-medium text-foreground">What you can do</p>
      <span className="slide-chrome ml-auto text-muted-foreground">Illustrative response</span>
    </div>
    <p className="slide-body mt-8 text-foreground">Being intoxicated is not consent. Nobody can say yes for her.</p>
    <div className="mt-8 border-l-2 border-primary pl-7">
      <p className="slide-subtitle font-serif text-foreground">Get her friends. If safe, interrupt the chat:</p>
      <p className="slide-body-lg mt-5 text-foreground">“Nobody's going up. Let's get her friends.”</p>
    </div>
    <p className="slide-caption mt-8 text-primary">Call in support · Delegate</p>
    <p className="slide-caption mt-2 text-muted-foreground">Bring in someone she trusts.</p>
  </div>
);

export const PracticeProductVisual = () => (
  <div className="mx-auto w-full max-w-[670px] rounded-[36px] border border-border bg-card p-8 shadow-2xl shadow-background/30">
    <div className="slide-chrome mb-6 flex justify-between font-mono text-muted-foreground"><span>round 1/2</span><span>score 0</span></div>
    <p className="slide-caption mb-2 text-muted-foreground">group pressure</p>
    <div className="mb-7 flex gap-2">
      {[0, 1, 2].map((n) => <span key={n} className="h-3 flex-1 rounded bg-signal-pause" />)}
      {[3, 4].map((n) => <span key={n} className="h-3 flex-1 rounded bg-muted" />)}
    </div>
    <div className="space-y-4">
      <div className="max-w-[84%] rounded-2xl rounded-bl-md bg-muted px-5 py-3">
        <p className="slide-chrome text-muted-foreground">Jake</p>
        <p className="slide-body text-foreground">the girl from bio, she's gone lol</p>
      </div>
    </div>
    <p className="slide-body-lg mt-7 font-medium text-foreground">What do you do?</p>
    <div className="mt-5 rounded-xl border border-primary bg-accent p-5">
      <p className="slide-body text-foreground">Go upstairs: “hey, her ride's here”</p>
    </div>
    <div className="mt-5 rounded-xl border border-border p-5">
      <p className="slide-chrome mb-2 font-mono text-primary">Distract · +3</p>
      <p className="slide-caption text-foreground">A simple excuse gets her out of the room without a fight.</p>
    </div>
  </div>
);

export const ReportProductVisual = () => (
  <div className="rounded-[28px] border border-border bg-card p-7">
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-signal-pause/40 bg-signal-pause/10 px-5 py-4">
      <ShieldCheck className="h-7 w-7 shrink-0 text-signal-pause" />
      <p className="slide-caption text-foreground">Practice mode. This does not send anything, and nothing is saved.</p>
    </div>
    <div className="flex items-center gap-3">
      <FileText className="h-8 w-8 text-primary" />
      <p className="slide-body-lg font-medium text-foreground">What a report looks like</p>
    </div>
    <p className="slide-caption mt-2 text-muted-foreground">See what each recipient can and cannot do.</p>
    <div className="mt-6 grid grid-cols-2 gap-3">
      {["Campus police", "Title IX office", "House or chapter leader", "RA", "RAINN"].map((label, i) => (
        <div key={label} className={`slide-chrome rounded-xl border px-4 py-3 ${i === 1 ? "border-primary bg-accent text-foreground" : "border-border text-muted-foreground"}`}>
          <span className="inline-flex items-center gap-2">{i === 1 && <Check className="h-4 w-4" />}{label}</span>
        </div>
      ))}
    </div>
  </div>
);
