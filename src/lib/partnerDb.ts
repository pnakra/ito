import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/** Untyped view of the shared client for partner tables not in generated types. */
export const partnerDb = supabase as unknown as SupabaseClient;

export type ReferralFlow = "bystander" | "main";
export type ReferralSource = "school_or_chapter" | "friend" | "social_media" | "other";

/** Inserts only flow, source and org_text. Never a session id, anon id or story. */
export async function insertReferralSource(flow: ReferralFlow, source: ReferralSource, orgText: string | null) {
  const org = orgText?.trim().slice(0, 120) || null;
  return partnerDb.from("referral_sources").insert({ flow, source, org_text: source === "school_or_chapter" ? org : null });
}

export type PartnerEvent =
  | "page_view" | "version_change" | "theme_change" | "copy_message" | "download_pdf" | "download_png"
  | "nav_click" | "calendly_click" | "email_click" | "question_submitted" | "share_submitted" | "witness_example_click";

function visitId(): string | null {
  try {
    let id = sessionStorage.getItem("ito_pk_visit");
    if (!id) {
      id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 64);
      sessionStorage.setItem("ito_pk_visit", id);
    }
    return id;
  } catch { return null; }
}

const cut = (v: string | null | undefined, n: number) => (v ? v.trim().slice(0, n) || null : null);

/** Fire-and-forget partner kit activity. Visit id is per-tab and not linked to anything else. Never awaited by callers. */
export function trackPartnerEvent(
  event: PartnerEvent,
  extra: { focus?: "bystander" | "ito" | "both" | null; theme?: "dark" | "print" | null; org_text?: string | null; detail?: string | null } = {},
): void {
  try {
    const row = {
      visit_id: visitId(),
      event,
      focus: extra.focus ?? null,
      theme: extra.theme ?? null,
      org_text: cut(extra.org_text, 120),
      detail: cut(extra.detail, 200),
      referrer: event === "page_view" ? cut(document.referrer, 300) : null,
    };
    Promise.resolve(partnerDb.from("partner_kit_events").insert(row)).catch(() => {});
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    gtag?.("event", "partner_kit_" + event, { focus: row.focus, theme: row.theme, detail: row.detail });
  } catch { /* never block the UI */ }
}
