import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Flyer from "@/components/partner/Flyer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { partnerDb } from "@/lib/partnerDb";
import { FOCUS_OPTIONS, MESSAGES, REACH_OPTIONS, STAFF_FAQ, type PartnerFocus } from "@/data/partnerKit";

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&display=swap";
const field = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const primaryBtn = "inline-flex items-center justify-center min-h-[44px] rounded-lg bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
const ghostBtn = "inline-flex items-center justify-center min-h-[40px] rounded-lg border border-border px-4 text-[13px] text-foreground hover:border-foreground/40 transition-colors";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-[26px] leading-tight text-foreground">{children}</h2>;
}

function CopyCard({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-card shadow-card rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <button type="button" onClick={copy} className={ghostBtn} aria-live="polite">{copied ? "Copied" : "Copy"}</button>
      </div>
      <p className="text-[15px] leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}

interface PublishedQ { id: string; question: string; answer: string | null }

export default function PartnerKit() {
  const [focus, setFocus] = useState<PartnerFocus>("bystander");
  const [org, setOrg] = useState("");
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const previewWrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [published, setPublished] = useState<PublishedQ[]>([]);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = FONT_HREF;
      document.head.appendChild(l);
    }
    partnerDb.from("partner_questions").select("id,question,answer").eq("status", "published").order("answered_at", { ascending: false })
      .then(({ data }) => setPublished((data as PublishedQ[] | null) ?? []));
  }, []);

  useEffect(() => {
    const el = previewWrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / 816)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const render = async (node: HTMLElement, pixelRatio: number) => {
    await document.fonts.ready;
    return toPng(node, { pixelRatio, cacheBust: true, backgroundColor: "#ffffff" });
  };
  const fileBase = `is-this-ok-flyer-${focus}`;

  const downloadPdf = async () => {
    if (!letterRef.current) return;
    setBusy("pdf");
    try {
      const png = await render(letterRef.current, 3);
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
      pdf.addImage(png, "PNG", 0, 0, 8.5, 11);
      pdf.save(`${fileBase}.pdf`);
    } finally { setBusy(null); }
  };
  const downloadPng = async () => {
    if (!imageRef.current) return;
    setBusy("png");
    try {
      const png = await render(imageRef.current, 1.25);
      const a = document.createElement("a");
      a.href = png; a.download = `${fileBase}.png`; a.click();
    } finally { setBusy(null); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Partner kit: share is this ok? with your students | ito"
        description="Free for campuses and chapters. Copy-ready messages, a printable flyer and answers to the questions staff ask about is this ok?, an anonymous tool from Override Labs."
        path="/partner-kit"
      />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-10 pb-12">
        <div className="max-w-4xl mx-auto space-y-14">
          <header className="space-y-4">
            <p className="text-[13px] text-muted-foreground">For schools, chapters and partners</p>
            <h1 className="font-serif text-[34px] sm:text-[44px] leading-[1.1] text-foreground">Everything you need to share is this ok? with your students.</h1>
            <p className="text-[16px] text-muted-foreground">Free for campuses and chapters. Built by Override Labs, a nonprofit working to prevent sexual violence.</p>
          </header>

          <div role="radiogroup" aria-label="Which version" className="grid grid-cols-3 gap-2 sticky top-2 z-10 rounded-xl bg-background/90 p-1 backdrop-blur">
            {FOCUS_OPTIONS.map((o) => (
              <button
                key={o.id} type="button" role="radio" aria-checked={focus === o.id} onClick={() => setFocus(o.id)}
                className={`min-h-[56px] rounded-[10px] px-2 text-[14px] sm:text-[15px] font-medium transition-all border-[1.5px] ${focus === o.id ? "bg-accent border-primary text-foreground" : "bg-muted border-transparent text-muted-foreground hover:text-foreground"}`}
              >{o.label}</button>
            ))}
          </div>

          <section className="space-y-5">
            <SectionTitle>Share it in a message</SectionTitle>
            <div className="space-y-4">{MESSAGES[focus].map((m) => <CopyCard key={focus + m.label} label={m.label} text={m.text} />)}</div>
          </section>

          <section className="space-y-5">
            <SectionTitle>Make a flyer</SectionTitle>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-[14px] text-foreground">Your chapter, school or org name (optional)</span>
                  <input className={field} value={org} maxLength={80} onChange={(e) => setOrg(e.target.value)} />
                </label>
                <div className="flex flex-col gap-2">
                  <button type="button" className={primaryBtn} onClick={downloadPdf} disabled={busy !== null}>{busy === "pdf" ? "Making PDF..." : "Download PDF (print)"}</button>
                  <button type="button" className={ghostBtn + " min-h-[44px]"} onClick={downloadPng} disabled={busy !== null}>{busy === "png" ? "Making image..." : "Download image (for Instagram or GroupMe)"}</button>
                </div>
                <p className="text-[13px] text-muted-foreground">Prefer ours? A ready-made flyer is the default, just download without changing anything.</p>
              </div>
              <div ref={previewWrap} className="w-full">
                <div className="overflow-hidden rounded-md shadow-card" style={{ width: 816 * scale, height: 1056 * scale }}>
                  <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                    <Flyer ref={letterRef} focus={focus} org={org} width={816} height={1056} />
                  </div>
                </div>
              </div>
            </div>
            <div aria-hidden style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
              <Flyer ref={imageRef} focus={focus} org={org} width={864} height={1080} />
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle>Questions staff ask</SectionTitle>
            <Accordion type="single" collapsible className="bg-card shadow-card rounded-lg px-5">
              {STAFF_FAQ.map((f, i) => (
                <AccordionItem key={i} value={`s${i}`}>
                  <AccordionTrigger className="text-left text-[15px]">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-foreground/90">
                    {f.a}{f.privacyLink && <> <Link to="/privacy" className="underline">Read the privacy policy</Link>.</>}
                  </AccordionContent>
                </AccordionItem>
              ))}
              {published.map((p) => (
                <AccordionItem key={p.id} value={p.id}>
                  <AccordionTrigger className="text-left text-[15px]">{p.question}</AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">{p.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <AskForm />
          </section>

          <section className="space-y-5">
            <SectionTitle>Tell us where you shared it</SectionTitle>
            <p className="text-[15px] text-muted-foreground">It's anonymous for students, so this is the only way we know it's working.</p>
            <ShareForm focus={focus} />
          </section>

          <section className="bg-card shadow-card rounded-lg p-6 space-y-4">
            <SectionTitle>Want to talk?</SectionTitle>
            <div className="flex flex-wrap items-center gap-3 text-[15px] text-muted-foreground">
              <a href="https://calendly.com/priya-overridelabsprevention/ito-evaluation" target="_blank" rel="noopener noreferrer" className={primaryBtn}>Book 20 minutes</a>
              <span>or email <a className="underline text-foreground" href="mailto:priya@overridelabsprevention.org">priya@overridelabsprevention.org</a></span>
            </div>
            <Link to="/witness/report" className="inline-block text-[13px] text-muted-foreground underline hover:text-foreground">See what an anonymous tip looks like</Link>
          </section>
        </div>
      </main>
    </div>
  );
}

function AskForm() {
  const [q, setQ] = useState(""); const [org, setOrg] = useState(""); const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 5) return;
    setState("busy");
    const { error } = await partnerDb.from("partner_questions").insert({
      question: q.trim().slice(0, 1000), asker_org: org.trim() || null, asker_email: email.trim() || null, status: "pending",
    });
    setState(error ? "error" : "done");
  };
  if (state === "done") return <p className="bg-card shadow-card rounded-lg p-5 text-[15px]">Thanks. Priya will answer, and helpful answers get added here.</p>;
  return (
    <form onSubmit={submit} className="bg-card shadow-card rounded-lg p-5 space-y-3">
      <h3 className="text-[17px] font-medium">Ask a question</h3>
      <textarea required minLength={5} maxLength={1000} rows={4} className={field} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Your question" placeholder="Your question" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} maxLength={160} value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Your org (optional)" aria-label="Your org" />
        <input className={field} type="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email, if you'd like a direct reply" aria-label="Email, if you'd like a direct reply" />
      </div>
      {state === "error" && <p className="text-[13px] text-destructive">That didn't send. Try again.</p>}
      <button type="submit" className={primaryBtn} disabled={state === "busy" || q.trim().length < 5}>{state === "busy" ? "Sending..." : "Send question"}</button>
    </form>
  );
}

function ShareForm({ focus }: { focus: PartnerFocus }) {
  const [org, setOrg] = useState(""); const [where, setWhere] = useState(""); const [reach, setReach] = useState("");
  const [version, setVersion] = useState<PartnerFocus>(focus); const [email, setEmail] = useState(""); const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  useEffect(() => setVersion(focus), [focus]);
  const valid = org.trim().length >= 2 && where.trim().length >= 2;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setState("busy");
    const { error } = await partnerDb.from("partner_shares").insert({
      org: org.trim().slice(0, 160), where_shared: where.trim().slice(0, 500), reach: reach || null,
      focus: version, contact_email: email.trim() || null, notes: notes.trim().slice(0, 1000) || null,
    });
    setState(error ? "error" : "done");
  };
  if (state === "done") return <p className="bg-card shadow-card rounded-lg p-5 text-[15px]">Thank you, this really helps.</p>;
  return (
    <form onSubmit={submit} className="bg-card shadow-card rounded-lg p-5 space-y-4">
      <label className="block space-y-1.5"><span className="text-[14px]">Org</span>
        <input required minLength={2} maxLength={160} className={field} value={org} onChange={(e) => setOrg(e.target.value)} /></label>
      <label className="block space-y-1.5"><span className="text-[14px]">Where did it go?</span>
        <input required minLength={2} maxLength={500} className={field} value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Chapter GroupMe, spring newsletter, RA training..." /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5"><span className="text-[14px]">Roughly how many people?</span>
          <select className={field} value={reach} onChange={(e) => setReach(e.target.value)}>
            <option value="">Choose one</option>
            {REACH_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select></label>
        <label className="block space-y-1.5"><span className="text-[14px]">Which version?</span>
          <select className={field} value={version} onChange={(e) => setVersion(e.target.value as PartnerFocus)}>
            {FOCUS_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select></label>
      </div>
      <label className="block space-y-1.5"><span className="text-[14px]">Email (optional)</span>
        <input type="email" maxLength={200} className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="block space-y-1.5"><span className="text-[14px]">Notes (optional)</span>
        <textarea rows={3} maxLength={1000} className={field} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      {state === "error" && <p className="text-[13px] text-destructive">That didn't send. Try again.</p>}
      <button type="submit" className={primaryBtn} disabled={state === "busy" || !valid}>{state === "busy" ? "Sending..." : "Send"}</button>
    </form>
  );
}
