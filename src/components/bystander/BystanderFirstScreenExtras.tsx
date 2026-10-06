import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { logSubmission } from "@/lib/submissionLogger";

const ROLES = ["Student", "Parent", "Educator or advocate", "Funder", "Someone else"];
const MAIL = "priya@overridelabsprevention.org";

/** Tip link, beta strip, feedback and funding sections for the /bystanderbeta first screen. */
const BystanderFirstScreenExtras = () => {
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [sent, setSent] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#feedback") {
      setTimeout(() => document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }), 50);
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

  const contact = (
    <p className="text-sm text-muted-foreground">Feedback is anonymous. Want a reply? Email <a className="underline" href={`mailto:${MAIL}`}>{MAIL}</a></p>
  );

  return (
    <div className="space-y-12">
      <div className="mt-5 space-y-6 text-center">
        <Link to="/witness/tip" className="text-[13px] text-muted-foreground underline hover:text-foreground">
          Already know what happened? Write an anonymous tip
        </Link>
        <div className="border-t border-border pt-4 space-y-2 text-[12px] text-muted-foreground">
          <p>Beta. ito is an AI and can't call anyone. In an emergency, call <a className="underline" href="tel:911">911</a>.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a href="#feedback" className="underline hover:text-foreground" onClick={(e) => { e.preventDefault(); document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }); }}>Tell us what to fix</a>
            <Link to="/witness/report" className="underline hover:text-foreground">See what a report looks like</Link>
            <a href={`mailto:${MAIL}`} className="underline hover:text-foreground">Fund or pilot this</a>
          </div>
        </div>
      </div>

      <section id="feedback" className="space-y-3 scroll-mt-24">
        <h2 className="font-serif text-[22px] text-foreground">Tell us what you think</h2>
        {sent ? (
          <>
            <p className="text-foreground">Thanks. That went straight to the team.</p>
            {contact}
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
            {contact}
          </>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-[22px] text-foreground">Fund or pilot this</h2>
        <p className="text-foreground/90">Want to fund this work or try it with your students, team, or chapter? Email <a className="underline" href={`mailto:${MAIL}`}>{MAIL}</a></p>
      </section>
    </div>
  );
};

export default BystanderFirstScreenExtras;
