import { createClient } from "@supabase/supabase-js";

const ADMIN_SUPABASE_URL = "https://xzwtpgujdajinvcbfprd.supabase.co";
const ADMIN_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXAiLCJyZWYiOiJ4end0cGd1amRhamludmNiZnByZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxMjYxNjYwLCJleHAiOjIwODY4Mzc2NjB9.P0R80axRcN-blotEtIdZNYMMm44P-NzKgVGyQ_frk-k";

export const adminSupabase = createClient(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_ANON_KEY, {
  auth: {
    storageKey: "ito-external-admin-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});