import { useState } from "react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { RECIPIENTS, type RecipientId } from "@/data/witness";

interface Brief {
  urgency: "happening_now" | "recent" | "past";
  summary: string;
  when: string;
  where: string;
  people_involved: string;
  intoxication_signs: string;
  what_was_seen: string[];
  evidence: string[];
  ongoing_risk: string;
  reporter_willing_to: string;
  reporter_identifiers_removed: string[];
  style_flags: string[];
  reporter_involved?: boolean;
  harmed_person_details_removed?: string[];
}

const URGENCY = { happening_now: "Happening now", recent: "Recent", past: "In the past" };

const WitnessReport = () => {
  const [recipient, setRecipient] = useState<RecipientId | null>(null);
  const [story, setStory] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [safetyNotes, setSafetyNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const looksNow = /\b(right now|rn|happening now|as we speak|this second|this minute|at the moment|currently)\b/i.test(story);
  const r = RECIPIENTS.find((x) => x.id === recipient);

  const build = async () => {
    if (!recipient) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("witness-report-brief", { body: { story, recipient } });
    setLoading(false);
    if (error || !data?.brief) setError("Couldn't build the preview. Try again in a moment.");
    else {
      const b = data.brief as Brief;
      setBrief({
        ...b,
        what_was_seen: b.what_was_seen ?? [],
        evidence: b.evidence ?? [],
        reporter_identifiers_removed: b.reporter_identifiers_removed ?? [],
        style_flags: b.style_flags ?? [],
        harmed_person_details_removed: b.harmed_person_details_removed ?? [],
      });
      setSafetyNotes(Array.isArray(data.safety_notes) ? data.safety_notes : []);
    }
  };

  const Row = ({ label, value }: { label: string; value: string | string[] }) => (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-2 border-b border-border last:border-0">
      <div className="text-xs uppercase tracking-wide text-muted-foreground pt-0.5">{label}</div>
      <div className="text-foreground text-sm">
        {Array.isArray(value) ? (value.length ? <ul className="list-disc pl-4">{value.map((v) => <li key={v}>{v}</li>)}</ul> : "none") : value}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="What a report looks like | ito for witnesses" description="Practice only. Nothing is sent." path="/witness/report" noindex />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <BackButton to="/witness" />
          <div className="rounded-lg border border-signal-pause/40 bg-signal-pause/10 px-4 py-3 text-sm text-foreground">
            Practice mode. This does not send anything, and nothing is saved.
          </div>
          <div className="space-y-2">
            <h1 className="text-h1 text-foreground">What a report looks like</h1>
            <p className="text-muted-foreground">See how your story would reach someone who can act, with anything that points to you taken out.</p>
          </div>

          <section className="space-y-3">
            <h2 className="font-semibold text-foreground">1. Who would it go to?</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {RECIPIENTS.map((x) => (
                <button
                  key={x.id}
                  onClick={() => { setRecipient(x.id); setBrief(null); setSafetyNotes([]); }}
                  className={`text-left rounded-lg border p-3 transition-colors ${recipient === x.id ? "border-foreground" : "border-border hover:border-foreground/40"}`}
                >
                  <div className="font-medium text-foreground">{x.label}</div>
                </button>
              ))}
            </div>
            {r && (
              <div className="rounded-lg border border-border p-4 text-sm space-y-2">
                <div><span className="text-muted-foreground">Can: </span><span className="text-foreground">{r.can}</span></div>
                <div><span className="text-muted-foreground">Can't: </span><span className="text-foreground">{r.cant}</span></div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold text-foreground">2. What happened?</h2>
            <Textarea
              value={story}
              onChange={(e) => setStory(e.target.value.slice(0, 2000))}
              placeholder="What you saw or heard, when, where, and what you have saved (messages, screenshots)."
              className="min-h-[160px]"
            />
            <Button onClick={build} disabled={!recipient || story.trim().length < 10 || loading} size="lg" className="w-full">
              {loading ? "Building preview…" : "Show the preview"}
            </Button>
            {error && <p className="text-sm text-signal-stop">{error}</p>}
            {looksNow && brief?.urgency !== "happening_now" && (
              <div className="space-y-2">
                <a href="tel:911" className="flex items-center justify-center w-full py-3 rounded-lg border border-signal-stop/40 text-signal-stop font-medium hover:bg-signal-stop/5 transition-colors">Call 911</a>
                <div className="rounded-lg border-2 border-signal-stop/50 bg-signal-stop/10 px-4 py-3 text-sm font-medium text-foreground">
                  If this is happening right now, call 911. This page is practice only and does not send anything.
                </div>
              </div>
            )}
          </section>

          {brief && r && (
            <section className="space-y-4">
              {brief.urgency === "happening_now" && (
                <a href="tel:911" className="flex items-center justify-center w-full py-3 rounded-lg border border-signal-stop/40 text-signal-stop font-medium hover:bg-signal-stop/5 transition-colors">Call 911</a>
              )}
              <h2 className="font-semibold text-foreground">3. What {r.id === "rainn" ? "RAINN" : `the ${(r.id === "campus_police" || r.id === "chapter_leader") ? r.label.toLowerCase() : r.label}`} would see</h2>
              {safetyNotes.map((n) => (
                <div key={n} className="rounded-lg border-2 border-signal-stop/50 bg-signal-stop/10 px-4 py-3 text-sm font-medium text-foreground">{n}</div>
              ))}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-xs text-muted-foreground">ANONYMOUS WITNESS REPORT · PRACTICE</div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${brief.urgency === "happening_now" ? "bg-signal-stop/15 text-signal-stop" : "bg-muted text-foreground"}`}>
                    {URGENCY[brief.urgency]}
                  </div>
                </div>
                <p className="text-foreground mb-3">{brief.summary}</p>
                <Row label="When" value={brief.when} />
                <Row label="Where" value={brief.where} />
                <Row label="People" value={brief.people_involved} />
                <Row label="Intoxication" value={brief.intoxication_signs} />
                <Row label="Seen" value={brief.what_was_seen} />
                <Row label="Evidence" value={brief.evidence} />
                <Row label="Ongoing risk" value={brief.ongoing_risk} />
                <Row label="Reporter will" value={brief.reporter_willing_to} />
              </div>
              <div className="rounded-lg border border-border p-4 text-sm space-y-2">
                <div className="font-medium text-foreground">Taken out to protect you</div>
                {brief.reporter_identifiers_removed.length ? (
                  <ul className="list-disc pl-4 text-foreground/90">{brief.reporter_identifiers_removed.map((x) => <li key={x}>{x}</li>)}</ul>
                ) : <p className="text-muted-foreground">Nothing found.</p>}
                {(brief.harmed_person_details_removed ?? []).length > 0 && (
                  <>
                    <div className="font-medium text-foreground pt-2">Taken out to protect the person harmed</div>
                    <ul className="list-disc pl-4 text-foreground/90">{(brief.harmed_person_details_removed ?? []).map((x) => <li key={x}>{x}</li>)}</ul>
                  </>
                )}
                {brief.reporter_involved === true && (
                  <p className="pt-2 text-foreground">This preview keeps your own part in. It can't be left out.</p>
                )}
                {brief.style_flags.length > 0 && (
                  <>
                    <div className="font-medium text-foreground pt-2">Details that might still point to you</div>
                    <ul className="list-disc pl-4 text-foreground/90">{brief.style_flags.map((x) => <li key={x}>{x}</li>)}</ul>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">In a real report, this is where it would be sent. Right now it goes nowhere.</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default WitnessReport;
