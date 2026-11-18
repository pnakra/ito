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
