
CREATE TABLE public.eval_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  prompt_version_tag TEXT,
  total_count INTEGER NOT NULL DEFAULT 0,
  pass_count INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  avg_tone_score NUMERIC(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.eval_runs TO service_role;

ALTER TABLE public.eval_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon cannot read eval_runs" ON public.eval_runs FOR SELECT TO anon USING (false);
CREATE POLICY "Authenticated cannot read eval_runs" ON public.eval_runs FOR SELECT TO authenticated USING (false);
CREATE POLICY "Anon cannot write eval_runs" ON public.eval_runs FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Authenticated cannot write eval_runs" ON public.eval_runs FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.eval_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.eval_runs(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  input_text TEXT NOT NULL,
  expected_risk_level TEXT NOT NULL,
  actual_risk_level TEXT,
  classification_pass BOOLEAN NOT NULL DEFAULT false,
  expected_refusal BOOLEAN NOT NULL DEFAULT false,
  refusal_fired BOOLEAN NOT NULL DEFAULT false,
  refusal_pass BOOLEAN NOT NULL DEFAULT false,
  forbidden_phrase_hits JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  deterministic_pass BOOLEAN NOT NULL DEFAULT false,
  tone_score INTEGER,
  tone_violations JSONB NOT NULL DEFAULT '[]'::jsonb,
  tone_rationale TEXT,
  raw_response JSONB,
  latency_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.eval_results TO service_role;

ALTER TABLE public.eval_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon cannot read eval_results" ON public.eval_results FOR SELECT TO anon USING (false);
CREATE POLICY "Authenticated cannot read eval_results" ON public.eval_results FOR SELECT TO authenticated USING (false);
CREATE POLICY "Anon cannot write eval_results" ON public.eval_results FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Authenticated cannot write eval_results" ON public.eval_results FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE INDEX idx_eval_results_run_id ON public.eval_results(run_id);
CREATE INDEX idx_eval_runs_created_at ON public.eval_runs(created_at DESC);
