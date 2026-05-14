// Capture referral/attribution params on first app load and persist for the
// session so every submission can be tagged with its referral source
// (e.g. Prolific, gameboi). This module self-executes on import — make sure
// it is imported as early as possible (e.g. from main.tsx) so the URL params
// are captured BEFORE any client-side navigation strips them off the URL.

export type ReferralMeta = {
  // Prolific / generic
  src?: string;
  pid?: string;
  sid?: string;
  // gameboi attribution (snake_case, prefixed)
  source?: string;
  gameboi_surface?: string;
  gameboi_friend?: string;
  gameboi_mode?: string;
  gameboi_exchange?: number;
  // UTM params
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  // Referrer
  referrer?: string;
};

const STORAGE_KEY = "referral_meta";
const GAMEBOI_STORAGE_KEY = "gameboi_referral";
let referralMeta: ReferralMeta | null = null;

function captureFromUrl(): ReferralMeta {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const meta: ReferralMeta = {};

    // Prolific / generic
    const src = params.get("src");
    const pid = params.get("pid");
    const sid = params.get("sid");
    if (src) meta.src = src;
    if (pid) meta.pid = pid;
    if (sid) meta.sid = sid;

    // gameboi attribution
    const source = params.get("source");
    const surface = params.get("surface");
    const friend = params.get("friend");
    const mode = params.get("mode");
    const exchange = params.get("exchange");
    if (source) meta.source = source;
    if (surface) meta.gameboi_surface = surface;
    if (friend) meta.gameboi_friend = friend;
    if (mode) meta.gameboi_mode = mode;
    if (exchange) {
      const n = Number(exchange);
      if (Number.isFinite(n)) meta.gameboi_exchange = n;
    }

    // UTM params
    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ] as const;
    for (const k of utmKeys) {
      const v = params.get(k);
      if (v) (meta as any)[k] = v;
    }

    // document.referrer (only if non-empty and not same-origin self)
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin !== window.location.origin) {
          meta.referrer = document.referrer;
        }
      } catch {
        meta.referrer = document.referrer;
      }
    }

    return meta;
  } catch {
    return {};
  }
}

function init(): ReferralMeta {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const storedMeta: ReferralMeta = stored ? JSON.parse(stored) : {};
    const urlMeta = captureFromUrl();
    // Merge: URL params take precedence if present, otherwise keep stored.
    const merged: ReferralMeta = { ...storedMeta, ...urlMeta };
    // Only persist if we actually have something — avoids caching an empty
    // {} on a page load with no params, which would shadow params captured
    // later in the same session.
    if (Object.keys(merged).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      // Mirror to a gameboi-named key for any external tooling that looks
      // for it specifically.
      sessionStorage.setItem(GAMEBOI_STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return {};
  }
}

// Run at module import time so we capture params before React Router
// navigation can strip them from the URL.
referralMeta = init();

export function getReferralMeta(): ReferralMeta {
  if (referralMeta && Object.keys(referralMeta).length > 0) return referralMeta;
  // Re-check sessionStorage / URL in case this is called before init ran
  // (defensive — should not happen given the top-level call above).
  referralMeta = init();
  return referralMeta;
}
