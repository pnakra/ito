ALTER TABLE public.eval_results
ADD COLUMN IF NOT EXISTS quality_scores jsonb NOT NULL DEFAULT '{}'::jsonb;