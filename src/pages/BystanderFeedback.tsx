import { useState } from "react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BackButton from "@/components/BackButton";
import BystanderSectionHeading from "@/components/bystander/BystanderSectionHeading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { logSubmission } from "@/lib/submissionLogger";

const ROLES = ["Student", "Parent", "Educator or advocate", "Funder", "Someone else"];
const MAIL = "priya@overridelabsprevention.org";

const BystanderFeedback = () => {
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    if (sent || text.trim().length < 5) return;
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
      <SEO title="Beta feedback | ito" description="Share feedback on the ito bystander beta or get in touch about funding or a pilot." path="/bystanderbeta/feedback" noindex />
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 pb-12">
        <div className="max-w-2xl mx-auto space-y-12">
          <BackButton to="/bystanderbeta" />
          <section className="space-y-3">
            <BystanderSectionHeading>Tell us what you think</BystanderSectionHeading>
            {sent ? (
              <p className="text-foreground">Thanks. That went straight to the team.</p>
            ) : (
              <>
                <Textarea aria-label="Feedback" value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} maxLength={1000} placeholder="What worked? What didn't? What would you change?" className="min-h-[140px]" />
                <label className="block space-y-1">
                  <span className="text-sm text-muted-foreground">I'm a...</span>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                    <option value="">Choose one (optional)</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <p className="text-sm text-muted-foreground">Don't include names or anything that identifies someone.</p>
                <Button onClick={send} disabled={text.trim().length < 5} size="lg" className="w-full">Send feedback</Button>
              </>
            )}
            <p className="text-sm text-muted-foreground">Feedback is anonymous. Want a reply? Email <a className="underline" href={`mailto:${MAIL}`}>{MAIL}</a></p>
          </section>
          <section id="fund" className="space-y-2 scroll-mt-24">
            <BystanderSectionHeading>Fund or pilot this</BystanderSectionHeading>
            <p className="text-foreground/90">Want to fund this work or try it with your students, team, or chapter? Email <a className="underline" href={`mailto:${MAIL}`}>{MAIL}</a></p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BystanderFeedback;