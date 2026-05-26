ALTER TABLE public.eval_runs
  ADD COLUMN IF NOT EXISTS payload jsonb,
  ADD COLUMN IF NOT EXISTS next_index integer NOT NULL DEFAULT 0;