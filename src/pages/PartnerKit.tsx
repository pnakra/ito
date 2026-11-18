import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Flyer, { type FlyerTheme } from "@/components/partner/Flyer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { partnerDb, trackPartnerEvent } from "@/lib/partnerDb";
import { FOCUS_OPTIONS, MESSAGES, REACH_OPTIONS, STAFF_FAQ, type PartnerFocus } from "@/data/partnerKit";

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Instrument+Serif:ital@1&display=swap";
const field = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const primaryBtn = "inline-flex items-center justify-center min-h-[44px] rounded-lg bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
const ghostBtn = "inline-flex items-center justify-center min-h-[40px] rounded-lg border border-border px-4 text-[13px] text-foreground hover:border-foreground/40 transition-colors";

/** Inline the Google font files as data URLs so html-to-image embeds them in exports (cross-origin CSS is unreadable). */
let fontCssPromise: Promise<string> | null = null;
function getFontEmbedCss(): Promise<string> {
  fontCssPromise ??= (async () => {
    const css = await (await fetch(FONT_HREF)).text();
    const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
    let out = css;
    await Promise.all(urls.map(async (u) => {
      const blob = await (await fetch(u)).blob();
      const data = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob); });
      out = out.split(u).join(data);
    }));
    return out;
  })().catch(() => { fontCssPromise = null; return ""; });
  return fontCssPromise;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-[26px] leading-tight text-foreground">{children}</h2>;
}

function CopyCard({ label, text, focus }: { label: string; text: string; focus: PartnerFocus }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    trackPartnerEvent("copy_message", { detail: label, focus });
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

const SECTIONS = [
  { id: "messages", label: "Share it in a message", short: "Messages" },
  { id: "flyer", label: "Make a flyer", short: "Flyer" },
  { id: "rollout", label: "Tell us when you're sharing it", short: "Tell us", key: true },
  { id: "faq", label: "Questions staff ask", short: "FAQ" },
  { id: "talk", label: "Talk to Priya", short: "Talk" },
] as const;
const sectionCls = "space-y-5 scroll-mt-40 lg:scroll-mt-24";

function goTo(id: string, detail: string = id) {
  trackPartnerEvent("nav_click", { detail });
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

function FocusToggle({ focus, setFocus, compact }: { focus: PartnerFocus; setFocus: (f: PartnerFocus) => void; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Which version" className={compact ? "grid grid-cols-3 gap-1.5" : "flex flex-col gap-1.5"}>
      {FOCUS_OPTIONS.map((o) => (
        <button
          key={o.id} type="button" role="radio" aria-checked={focus === o.id} onClick={() => setFocus(o.id)}
          className={`${compact ? "min-h-[40px] text-[13px]" : "min-h-[44px] text-[14px] text-left px-3"} rounded-[10px] px-2 font-medium transition-all border-[1.5px] ${focus === o.id ? "bg-accent border-primary text-foreground" : "bg-muted border-transparent text-muted-foreground hover:text-foreground"}`}
        >{o.label}</button>
      ))}
    </div>
  );
}

export default function PartnerKit() {
  const [focus, setFocusState] = useState<PartnerFocus>("bystander");
  const [theme, setThemeState] = useState<FlyerTheme>("dark");
  const setFocus = (f: PartnerFocus) => { if (f !== focus) trackPartnerEvent("version_change", { focus: f }); setFocusState(f); };
  const setTheme = (t: FlyerTheme) => { if (t !== theme) trackPartnerEvent("theme_change", { theme: t, focus }); setThemeState(t); };
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackPartnerEvent("page_view", { focus });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [org, setOrg] = useState("");
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const [active, setActive] = useState<string>("messages");
  const letterRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: "-30% 0px -60% 0px" });
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const render = async (node: HTMLElement, pixelRatio: number) => {
    await document.fonts.ready;
    await Promise.all([document.fonts.load("italic 112px 'Instrument Serif'"), document.fonts.load("500 34px Inter")]).catch(() => {});
    const fontEmbedCSS = await getFontEmbedCss();
    return toPng(node, { pixelRatio, cacheBust: true, ...(fontEmbedCSS ? { fontEmbedCSS } : {}), backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff" });
  };
  const fileBase = `is-this-ok-flyer-${focus}-${theme}`;

  const downloadPdf = async () => {
    if (!letterRef.current) return;
    setBusy("pdf");
    try {
      const png = await render(letterRef.current, 3);
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
      pdf.addImage(png, "PNG", 0, 0, 8.5, 11);
      pdf.save(`${fileBase}.pdf`);
      trackPartnerEvent("download_pdf", { focus, theme, org_text: org.trim() || null });
    } finally { setBusy(null); }
  };
  const downloadPng = async () => {
    if (!letterRef.current) return;
    setBusy("png");
    try {
      const png = await render(letterRef.current, 1.5);
      const a = document.createElement("a");
      a.href = png; a.download = `${fileBase}.png`; a.click();
      trackPartnerEvent("download_png", { focus, theme, org_text: org.trim() || null });
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
        <div className="max-w-6xl mx-auto">
          <header className="space-y-4 max-w-3xl">
            <p className="text-[13px] text-muted-foreground">For schools, chapters and partners</p>
            <h1 className="font-serif text-[34px] sm:text-[44px] leading-[1.1] text-foreground">Everything you need to share is this ok? with your students.</h1>
            <p className="text-[16px] text-muted-foreground">Free for campuses and chapters. Built by Override Labs, a nonprofit working to prevent sexual violence.</p>
          </header>

          <div className="mt-6 max-w-3xl bg-card shadow-card rounded-lg p-5 space-y-3 border-l-2 border-primary">
            <h2 className="text-[17px] font-medium text-foreground">Planning to share it? Tell us when.</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">Students use ito anonymously and we don't track them, so we can't see which schools or chapters are using it. A quick note about when and where you're sharing it is the only way we know it's reaching people, and it helps us keep it free.</p>
            <a href="#rollout" onClick={(e) => { e.preventDefault(); goTo("rollout", "callout"); }} className={primaryBtn}>Tell us when you're sharing it</a>
          </div>

          <div className="lg:hidden sticky top-0 z-20 -mx-5 mt-8 px-5 py-2 bg-background/95 backdrop-blur space-y-2 border-b border-border">
            <nav aria-label="Sections" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {SECTIONS.map((s) => {
                const on = active === s.id;
                const key = "key" in s && s.key;
                return (
                  <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); goTo(s.id); }} aria-current={on ? "true" : undefined}
                    className={`shrink-0 inline-flex items-center min-h-[36px] rounded-full px-3.5 text-[13px] font-medium border transition-colors ${key ? "bg-primary text-primary-foreground border-primary" : on ? "border-foreground/60 text-foreground" : "border-border text-muted-foreground"} ${key && on ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : ""}`}
                  >{s.short}</a>
                );
              })}
            </nav>
            <FocusToggle focus={focus} setFocus={setFocus} compact />
          </div>

          <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="space-y-2">
                  <p className="text-[12px] uppercase tracking-wide text-muted-foreground">Version</p>
                  <FocusToggle focus={focus} setFocus={setFocus} />
                </div>
                <nav aria-label="Sections" className="flex flex-col gap-1">
                  {SECTIONS.map((s) => {
                    const on = active === s.id;
                    const key = "key" in s && s.key;
                    return (
                      <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); goTo(s.id); }} aria-current={on ? "true" : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition-colors ${on ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"} ${key ? "font-medium text-foreground" : ""}`}
                      >
                        <span aria-hidden className={`h-2 w-2 rounded-full shrink-0 ${key ? "bg-primary" : on ? "bg-foreground" : "bg-border"}`} />
                        {s.label}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div className="space-y-14 min-w-0">
          <section id="messages" className={sectionCls}>
            <SectionTitle>Share it in a message</SectionTitle>
            <div className="space-y-4">{MESSAGES[focus].map((m) => <CopyCard key={focus + m.label} label={m.label} text={m.text} focus={focus} />)}</div>
          </section>

          <section id="flyer" className={sectionCls}>
            <SectionTitle>Make a flyer</SectionTitle>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-[14px] text-foreground">Your chapter, school or org name (optional)</span>
                  <input className={field} value={org} maxLength={80} onChange={(e) => setOrg(e.target.value)} />
                </label>
                <div className="space-y-2">
                  <div role="radiogroup" aria-label="Flyer style" className="grid grid-cols-2 gap-2">
                    {([["dark", "Dark"], ["print", "Printable (black and white)"]] as const).map(([id, label]) => (
                      <button key={id} type="button" role="radio" aria-checked={theme === id} onClick={() => setTheme(id)}
                        className={`min-h-[44px] rounded-[10px] px-2 text-[13px] font-medium border-[1.5px] transition-all ${theme === id ? "bg-accent border-primary text-foreground" : "bg-muted border-transparent text-muted-foreground hover:text-foreground"}`}
                      >{label}</button>
                    ))}
                  </div>
                  <p className="text-[13px] text-muted-foreground">Printable uses almost no ink.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" className={primaryBtn} onClick={downloadPdf} disabled={busy !== null}>{busy === "pdf" ? "Making PDF..." : "Download PDF (print)"}</button>
                  <button type="button" className={ghostBtn + " min-h-[44px]"} onClick={downloadPng} disabled={busy !== null}>{busy === "png" ? "Making image..." : "Download image (for Instagram or GroupMe)"}</button>
                </div>
                <p className="text-[13px] text-muted-foreground">Prefer ours? A ready-made flyer is the default, just download without changing anything.</p>
              </div>
              <div ref={previewWrap} className="w-full">
                <div className="overflow-hidden rounded-md shadow-card" style={{ width: 816 * scale, height: 1056 * scale }}>
                  <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                    <Flyer ref={letterRef} focus={focus} theme={theme} org={org} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="rollout" className={sectionCls}>
            <SectionTitle>Tell us when you're sharing it</SectionTitle>
            <p className="text-[15px] text-muted-foreground">It's anonymous for students, so this is the only way we know it's working. Planning ahead counts too.</p>
            <ShareForm focus={focus} />
          </section>

          <section id="faq" className={sectionCls}>
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
            <AskForm focus={focus} />
          </section>

          <section id="talk" className={"bg-card shadow-card rounded-lg p-6 space-y-4 scroll-mt-40 lg:scroll-mt-24"}>
            <SectionTitle>Want to talk?</SectionTitle>
            <div className="flex flex-wrap items-center gap-3 text-[15px] text-muted-foreground">
              <a href="https://calendly.com/priya-overridelabsprevention/ito-evaluation" target="_blank" rel="noopener noreferrer" onClick={() => trackPartnerEvent("calendly_click", { focus })} className={primaryBtn}>Book 20 minutes</a>
              <span>or email <a className="underline text-foreground" href="mailto:priya@overridelabsprevention.org" onClick={() => trackPartnerEvent("email_click", { focus })}>priya@overridelabsprevention.org</a></span>
            </div>
            <Link to="/witness/report" onClick={() => trackPartnerEvent("witness_example_click", { focus })} className="inline-block text-[13px] text-muted-foreground underline hover:text-foreground">See what an anonymous tip looks like</Link>
          </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AskForm({ focus }: { focus: PartnerFocus }) {
  const [q, setQ] = useState(""); const [org, setOrg] = useState(""); const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 5) return;
    setState("busy");
    const { error } = await partnerDb.from("partner_questions").insert({
      question: q.trim().slice(0, 1000), asker_org: org.trim() || null, asker_email: email.trim() || null, status: "pending",
    });
    if (!error) trackPartnerEvent("question_submitted", { focus });
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
  const [status, setStatus] = useState<"planned" | "shared" | "">(""); const [date, setDate] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  useEffect(() => setVersion(focus), [focus]);
  const valid = status !== "" && org.trim().length >= 2 && where.trim().length >= 2;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setState("busy");
    const { error } = await partnerDb.from("partner_shares").insert({
      org: org.trim().slice(0, 160), where_shared: where.trim().slice(0, 500), reach: reach || null,
      focus: version, contact_email: email.trim() || null, notes: notes.trim().slice(0, 1000) || null,
      share_status: status, share_date: date || null,
    });
    if (!error) trackPartnerEvent("share_submitted", { detail: status, focus: version });
    setState(error ? "error" : "done");
  };
  if (state === "done") return <p className="bg-card shadow-card rounded-lg p-5 text-[15px]">{status === "planned" ? "Thank you, this really helps. We'll check in around then." : "Thank you, this really helps."}</p>;
  return (
    <form onSubmit={submit} className="bg-card shadow-card rounded-lg p-5 space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-[14px] mb-2">Have you shared it yet?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {([["planned", "Not yet, planning to"], ["shared", "Already shared it"]] as const).map(([v, l]) => (
            <label key={v} className={`flex items-center gap-2.5 min-h-[44px] rounded-lg border px-3 text-[14px] cursor-pointer transition-colors ${status === v ? "border-primary bg-accent" : "border-border"}`}>
              <input type="radio" name="share_status" value={v} required checked={status === v} onChange={() => setStatus(v)} className="accent-primary" />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      {status && (
        <label className="block space-y-1.5"><span className="text-[14px]">{status === "planned" ? "When are you sharing it?" : "When did you share it?"}</span>
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} /></label>
      )}
      <label className="block space-y-1.5"><span className="text-[14px]">Org</span>
        <input required minLength={2} maxLength={160} className={field} value={org} onChange={(e) => setOrg(e.target.value)} /></label>
      <label className="block space-y-1.5"><span className="text-[14px]">Where is it going?</span>
        <input required minLength={2} maxLength={500} className={field} value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Chapter GroupMe, spring newsletter, RA training..." /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5"><span className="text-[14px]">Roughly how many people?</span>
          <div className="relative">
            <select className={`${field} appearance-none pr-10`} value={reach} onChange={(e) => setReach(e.target.value)}>
              <option value="">Choose one</option>
              {REACH_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div></label>
        <label className="block space-y-1.5"><span className="text-[14px]">Which version?</span>
          <div className="relative">
            <select className={`${field} appearance-none pr-10`} value={version} onChange={(e) => setVersion(e.target.value as PartnerFocus)}>
              {FOCUS_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div></label>
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
