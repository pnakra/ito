const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export async function logVisit() {
  try {
    await fetch(
      `https://${PROJECT_ID}.supabase.co/functions/v1/log-visit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
          session_id: getSessionId(),
        }),
      }
    );
  } catch {
    // Silent fail — visit logging is non-critical
  }
}
