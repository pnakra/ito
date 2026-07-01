import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * /go — 50/50 splitter for ad traffic.
 * - Assigns variant A (preview) or B (check-in) via sticky localStorage key.
 * - Logs the assignment to `submissions` so we can attribute downstream conversion.
 * - Forwards all UTM params to the destination.
 */
const STICKY_KEY = "ito_ab_variant";

const pickVariant = (): "A" | "B" => {
  try {
    const existing = localStorage.getItem(STICKY_KEY);
    if (existing === "A" || existing === "B") return existing;
  } catch {}
  const v: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
  try { localStorage.setItem(STICKY_KEY, v); } catch {}
  return v;
};

const Go = () => {
  useEffect(() => {
    const variant = pickVariant();
    const search = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: search.get("utm_source") ?? undefined,
      utm_medium: search.get("utm_medium") ?? undefined,
      utm_campaign: search.get("utm_campaign") ?? undefined,
      utm_content: search.get("utm_content") ?? undefined,
      utm_term: search.get("utm_term") ?? undefined,
    };

    // Log the assignment (fire-and-forget).
    supabase.from("submissions").insert({
      flow_type: "ab_test",
      step_name: "go_assignment",
      step_type: "system",
      choice_value: variant,
      metadata: { variant, ...utm, referrer: document.referrer || null },
    }).then(() => {}, () => {});

    // Preserve utms on the destination.
    search.set("variant", variant);
    const qs = search.toString();
    const dest = variant === "A" ? "/preview" : "/check-in";
    window.location.replace(`${dest}?${qs}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
      Loading…
    </div>
  );
};

export default Go;
