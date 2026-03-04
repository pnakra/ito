-- Fix: The "Allow anonymous inserts" policy is RESTRICTIVE, which means
-- no inserts are actually allowed (restrictive only narrows, never grants).
-- Drop it and recreate as PERMISSIVE.

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.submissions;

CREATE POLICY "Allow anonymous inserts"
  ON public.submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);
