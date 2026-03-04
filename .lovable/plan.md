

## Problem

`submissionLogger.ts` uses the client-side Supabase SDK to INSERT directly. This creates two problems:
1. It depends on whichever `VITE_SUPABASE_URL` is baked into the Vercel build — if that doesn't match the DB you're checking, rows go to the wrong place
2. Errors are silently swallowed with `console.error`, making debugging impossible

Meanwhile, `logVisit.ts` works differently — it calls a **Lovable Cloud edge function** (`log-visit`) that uses `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` to write to your external Supabase with the service role, bypassing RLS entirely. This is the pattern that actually works reliably for production.

## Plan

### 1. Create a `log-submission` edge function
Mirror the `log-visit` pattern: accept submission data via POST, use `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` to INSERT into the external Supabase `submissions` table with service role privileges (bypasses RLS entirely).

### 2. Rewrite `submissionLogger.ts` to call the edge function
Instead of using the Supabase JS client directly, call the edge function via `fetch` the same way `logVisit.ts` does — using `VITE_SUPABASE_PROJECT_ID` to build the URL. This ensures production always hits the Lovable Cloud edge function, which writes to the external DB.

### 3. Add visible error logging
If the edge function call fails, log the status code and response body to console so you can actually see what went wrong.

## Technical details

- The edge function will read `EXTERNAL_SUPABASE_URL` and `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` from secrets (already configured)
- Uses service role = bypasses all RLS, so the permissive/restrictive policy issue becomes irrelevant
- No changes needed to the external Supabase schema or policies
- The Lovable Cloud `submissions` table will no longer receive direct inserts (all production data goes to external DB via the edge function)

