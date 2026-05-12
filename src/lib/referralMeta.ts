// Capture ?src=...&pid=...&sid=... on first app load and persist for the
// session so every submission can be tagged with its referral source
// (e.g. Prolific). This module self-executes on import — make sure it is
// imported as early as possible (e.g. from main.tsx) so the URL params are
// captured BEFORE any client-side navigation strips them off the URL.

export type ReferralMeta = { src?: string; pid?: string; sid?: string };

const STORAGE_KEY = "referral_meta";
let referralMeta: ReferralMeta | null = null;

function captureFromUrl(): ReferralMeta {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const meta: ReferralMeta = {};
    const src = params.get("src");
    const pid = params.get("pid");
    const sid = params.get("sid");
    if (src) meta.src = src;
    if (pid) meta.pid = pid;
    if (sid) meta.sid = sid;
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
