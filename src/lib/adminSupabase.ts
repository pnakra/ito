import { createClient } from "@supabase/supabase-js";

const ADMIN_SUPABASE_URL = "https://xzwtpgujdajinvcbfprd.supabase.co";
const ADMIN_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6d3RwZ3VqZGFqaW52Y2JmcHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjE2NjAsImV4cCI6MjA4NjgzNzY2MH0.P0R80axRcN-blotEtIdZNYMMm44P-NzKgVGyQ_frk-k";

export const adminSupabase = createClient(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_ANON_KEY, {
  auth: {
    storageKey: "ito-external-admin-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});