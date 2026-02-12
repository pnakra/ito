
-- Block UPDATE and DELETE on submissions for anonymous and authenticated users
CREATE POLICY "Anonymous users cannot update submissions"
  ON public.submissions
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY "Authenticated users cannot update submissions"
  ON public.submissions
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Anonymous users cannot delete submissions"
  ON public.submissions
  FOR DELETE
  TO anon
  USING (false);

CREATE POLICY "Authenticated users cannot delete submissions"
  ON public.submissions
  FOR DELETE
  TO authenticated
  USING (false);
