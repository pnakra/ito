import { useState } from "react";
import { insertReferralSource, type ReferralFlow, type ReferralSource } from "@/lib/partnerDb";

export const REFERRAL_ASKED_KEY = "ito_referral_asked_v1";

const OPTIONS: { id: ReferralSource; label: string }[] = [
  { id: "school_or_chapter", label: "My school or chapter" },
  { id: "friend", label: "A friend" },
  { id: "social_media", label: "Social media" },
  { id: "other", label: "Somewhere else" },
];

function alreadyAsked() {
  try { return localStorage.getItem(REFERRAL_ASKED_KEY) === "1"; } catch { return true; }
}
function markAsked() {
  try { localStorage.setItem(REFERRAL_ASKED_KEY, "1"); } catch { /* ignore */ }
}

/** Optional end-of-session card. Stores flow, source and org text only, once per browser. */
const ReferralSourceCard = ({ flow }: { flow: ReferralFlow }) => {
  const [hidden, setHidden] = useState(alreadyAsked);
  const [picked, setPicked] = useState<ReferralSource | null>(null);
  const [org, setOrg] = useState("");
  const [done, setDone] = useState(false);
  if (hidden) return null;

  const send = (source: ReferralSource, text: string | null) => {
    markAsked();
    insertReferralSource(flow, source, text).catch(() => {});
    setDone(true);
  };
  const choose = (s: ReferralSource) => {
    if (picked) return;
    setPicked(s);
    if (s !== "school_or_chapter") send(s, null);
  };

  if (done) return <p className="text-center text-[13px] text-muted-foreground animate-fade-in">Thanks.</p>;

  return (
    <div className="animate-fade-in space-y-2">
      <div className="bg-card shadow-card rounded-lg p-5 space-y-4">
        <h2 className="text-[15px] font-medium text-foreground">Optional: where did you hear about ito?</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {OPTIONS.map((o) => (
            <button key={o.id} type="button" onClick={() => choose(o.id)}
              className={`min-h-[48px] rounded-[10px] px-3 text-[14px] transition-all border-[1.5px] ${picked === o.id ? "bg-accent border-primary text-foreground" : "bg-muted border-transparent text-foreground hover:bg-muted/80"}`}>
              {o.label}
            </button>
          ))}
        </div>
        {picked === "school_or_chapter" && (
          <div className="flex gap-2">
            <input value={org} maxLength={120} onChange={(e) => setOrg(e.target.value)} placeholder="Which one?" aria-label="Which one?"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <button type="button" onClick={() => send("school_or_chapter", org)} className="rounded-lg bg-primary px-4 text-[14px] text-primary-foreground">Done</button>
          </div>
        )}
        {!picked && (
          <button type="button" onClick={() => { markAsked(); setHidden(true); }} className="text-[13px] text-muted-foreground hover:text-foreground">Skip</button>
        )}
      </div>
      <p className="text-center text-[12px] text-muted-foreground">Kept separate from what you typed.</p>
    </div>
  );
};

export default ReferralSourceCard;
