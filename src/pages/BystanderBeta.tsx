import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { logSubmission } from "@/lib/submissionLogger";

const CARDS = [
  { to: "/check-in?role=other&src=bystanderbeta", title: "Tell ito what you saw", body: "A short read on what you described and one thing you can do." },
  { to: "/witness/tip", title: "Turn what you saw into a tip", body: "ito writes a short summary you can paste into an anonymous police tip form. Names and exact places are left blank for you to fill in." },
];

const ROLES = ["Student", "Parent", "Educator or advocate", "Funder", "Someone else"];

const BystanderBeta = () => {
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [sent, setSent] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#feedback") {
      document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const send = () => {
    if (text.trim().length < 5) return;
    logSubmission({
      flowType: "before",
      stepName: "beta-feedback",
      stepType: "freetext",
      freetextValue: text,
      metadata: { surface: "bystanderbeta", role: role || null },
    });
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="ito for bystanders (beta)" description="Saw something or got a message you can't stop thinking about? ito helps you work out what to do next." path="/bystanderbeta" noindex />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12 pb-12">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-3">
            <span className="inline-block rounded border border-border px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">Beta</span>
            <h1 className="font-serif italic text-[40px] leading-tight text-foreground">ito for bystanders</h1>
            <p className="text-[18px] font-semibold text-foreground">You saw something, heard something, or got a message you can't stop thinking about. ito helps you work out what to do next.</p>
            <p className="text-sm text-muted-foreground">Try it, then <a href="#feedback" className="underline">tell us what to fix</a>.</p>
          </div>

          <section className="space-y-3">
            <h2 className="font-serif text-[22px] text-foreground">Two things to try</h2>
            {CARDS.map((c) => (
              <div key={c.to} className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div>
                  <div className="font-semibold text-foreground">{c.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{c.body}</div>
                </div>
                <Button asChild variant="outline"><Link to={c.to}>Start</Link></Button>
              </div>
            ))}
          </section>

          <section id="feedback" className="space-y-3 scroll-mt-24">
            <h2 className="font-serif text-[22px] text-foreground">Tell us what you think</h2>
            {sent ? (
              <>
                <p className="text-foreground">Thanks. That went straight to the team.</p>
                <p className="text-sm text-muted-foreground">Feedback is anonymous. Want a reply? Email <a className="underline" href="mailto:priya@overridelabsprevention.org">priya@overridelabsprevention.org</a></p>
              </>
            ) : (
              <>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 1000))}
                  maxLength={1000}
                  placeholder="What worked? What didn't? What would you change?"
                  className="min-h-[140px]"
                />
                <label className="block space-y-1">
                  <span className="text-sm text-muted-foreground">I'm a...</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="">Choose one (optional)</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <p className="text-sm text-muted-foreground">Don't include names or anything that identifies someone.</p>
                <Button onClick={send} disabled={text.trim().length < 5} size="lg" className="w-full">Send feedback</Button>
                <p className="text-sm text-muted-foreground">Feedback is anonymous. Want a reply? Email <a className="underline" href="mailto:priya@overridelabsprevention.org">priya@overridelabsprevention.org</a></p>
              </>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-[22px] text-foreground">Good to know</h2>
            <p className="text-foreground/90">ito is an AI, not a person. It can't call anyone or send help. If someone is in danger right now, call <a className="underline" href="tel:911">911</a>.</p>
            <p className="text-foreground/90">Anonymous. Nothing saved that identifies you.</p>
            <p className="text-foreground/90">This is an early version, so tell us where it gets things wrong.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-[22px] text-foreground">Fund or pilot this</h2>
            <p className="text-foreground/90">Want to fund this work or try it with your students, team, or chapter? Email <a className="underline" href="mailto:priya@overridelabsprevention.org">priya@overridelabsprevention.org</a></p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BystanderBeta;
