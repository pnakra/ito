import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

// Practice-style page: nothing is logged, sent, or saved.

interface TipBrief {
  reporter_identifiers_removed?: string[];
  harmed_person_details_removed?: string[];
  style_flags?: string[];
}

const noteClass = "rounded-lg border-2 border-signal-stop/50 bg-signal-stop/10 px-4 py-3 text-sm font-medium text-foreground";

const List = ({ items }: { items: string[] }) =>
  items.length ? (
    <ul className="list-disc pl-4 text-foreground/90">{items.map((x) => <li key={x}>{x}</li>)}</ul>
  ) : (
    <p className="text-muted-foreground">Nothing found.</p>
  );

const WitnessTip = () => {
  const location = useLocation();
  const initialStory = typeof (location.state as { story?: unknown } | null)?.story === "string"
    ? ((location.state as { story: string }).story).slice(0, 2000)
    : "";
  const [story, setStory] = useState(initialStory);
  const [brief, setBrief] = useState<TipBrief | null>(null);
  const [tipText, setTipText] = useState("");
  const [safetyNotes, setSafetyNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const looksNow = /\b(right now|rn|happening now|as we speak|this second|this minute|at the moment|currently)\b/i.test(story);

  const build = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("witness-report-brief", { body: { story, recipient: "police_tip" } });
    setLoading(false);
    if (error || !data?.brief || typeof data?.tip_text !== "string") {
      setError("Couldn't write the summary. Try again in a moment.");
      return;
    }
    setBrief(data.brief as TipBrief);
    setTipText(data.tip_text);
    setSafetyNotes(Array.isArray(data.safety_notes) ? data.safety_notes : []);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tipText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Turn what you saw into a tip" description="Write a short summary you can paste into an anonymous police tip form. Nothing is sent or saved." path="/witness/tip" noindex />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <BackButton to="/bystanderbeta" />
          <div className="rounded-lg border border-signal-pause/40 bg-signal-pause/10 px-4 py-3 text-sm text-foreground">
            ito does not send this anywhere and does not save it. You copy the summary and paste it into the form yourself.
          </div>
          <div className="space-y-2">
            <h1 className="text-h1 text-foreground">Turn what you saw into a tip</h1>
            <p className="text-muted-foreground">ito writes a short summary in your words that you can paste into an anonymous police tip form. Names and exact places are left blank for you to fill in.</p>
          </div>

          <section className="space-y-3">
            <h2 className="font-semibold text-foreground">What happened?</h2>
            <Textarea
              value={story}
              onChange={(e) => setStory(e.target.value.slice(0, 2000))}
              placeholder="Write what you saw or heard, in your own words."
              className="min-h-[160px]"
            />
            <Button onClick={build} disabled={story.trim().length < 10 || loading} size="lg" className="w-full">
              {loading ? "Writing…" : "Write the summary"}
            </Button>
            {error && <p className="text-sm text-signal-stop">{error}</p>}
            {looksNow && (
              <div className="space-y-2">
                <a href="tel:911" className="flex items-center justify-center w-full py-3 rounded-lg border border-signal-stop/40 text-signal-stop font-medium hover:bg-signal-stop/5 transition-colors">Call 911</a>
                <div className={noteClass}>If this is happening right now, call 911. A tip form is not for emergencies.</div>
              </div>
            )}
          </section>

          {brief && (
            <section className="space-y-4">
              <div className="rounded-lg border border-border p-4 text-sm space-y-2">
                <div className="font-medium text-foreground">Before you send it</div>
                <p className="text-foreground/90">Not for emergencies. If someone is in danger right now, call 911.</p>
                <p className="text-foreground/90">If the person this happened to told you in confidence, reporting is their choice, unless they are under 18 or in danger right now.</p>
                <p className="text-foreground/90">ito can't promise that any form keeps you anonymous. Check the list below for details that could point to you.</p>
              </div>

              {safetyNotes.map((n) => <div key={n} className={noteClass}>{n}</div>)}

              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <p className="text-foreground text-sm whitespace-pre-wrap">{tipText}</p>
                <Button variant="outline" onClick={copy} className="w-full">{copied ? "Copied" : "Copy"}</Button>
              </div>
              <p className="text-sm text-muted-foreground">Fill in [name] and [place] yourself after you paste. Leave them as they are if you don't know or don't want to say.</p>

              <div className="rounded-lg border border-border p-4 text-sm space-y-2">
                <div className="font-medium text-foreground">Taken out to protect you</div>
                <List items={brief.reporter_identifiers_removed ?? []} />
                <div className="font-medium text-foreground pt-2">Details that might still point to you</div>
                <List items={brief.style_flags ?? []} />
              </div>

              <div className="rounded-lg border border-border p-4 text-sm space-y-1">
                <div className="font-medium text-foreground">Where to paste it</div>
                <p className="text-foreground/90">Search for your city or campus police and the words anonymous tip. ito can't pick the form for you.</p>
              </div>

              <p className="text-sm text-muted-foreground">
                Not sure about reporting? RAINN can talk it through at <a className="underline" href="tel:18006564673">1-800-656-4673</a>.
              </p>

              <p className="text-sm text-muted-foreground">
                This is a beta. <Link to="/bystanderbeta/feedback" className="underline">Tell us what you think</Link>.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default WitnessTip;
