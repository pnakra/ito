
ALTER TABLE public.submissions DROP CONSTRAINT submissions_flow_type_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_flow_type_check CHECK (flow_type = ANY (ARRAY['before'::text, 'after-crossed'::text, 'after-someone-crossed'::text, 'preview'::text, 'ab_test'::text]));

ALTER TABLE public.submissions DROP CONSTRAINT submissions_step_type_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_step_type_check CHECK (step_type = ANY (ARRAY['choice'::text, 'freetext'::text, 'ai_response'::text, 'event'::text, 'system'::text]));

CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  variant text,
  session_id uuid,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.visits TO anon, authenticated;
GRANT ALL ON public.visits TO service_role;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a visit" ON public.visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Only service role can read visits" ON public.visits FOR SELECT TO service_role USING (true);
CREATE POLICY "Anon cannot read visits" ON public.visits FOR SELECT TO anon USING (false);
CREATE POLICY "Authenticated cannot read visits" ON public.visits FOR SELECT TO authenticated USING (false);

CREATE INDEX visits_created_at_idx ON public.visits (created_at DESC);
CREATE INDEX visits_utm_source_idx ON public.visits (utm_source);
CREATE INDEX visits_path_idx ON public.visits (path);
