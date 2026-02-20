import { supabase } from "@/lib/supabase"; // adjust if needed

export async function logVisit() {
  try {
    await supabase.from("visits").insert({
      metadata: {
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
    });
  } catch (err) {
    console.error("Visit logging failed", err);
  }
}
