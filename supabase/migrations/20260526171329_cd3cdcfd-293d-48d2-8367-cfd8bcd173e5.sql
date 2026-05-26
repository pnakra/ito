
DROP POLICY IF EXISTS "Anon cannot write eval_runs" ON public.eval_runs;
DROP POLICY IF EXISTS "Authenticated cannot write eval_runs" ON public.eval_runs;
DROP POLICY IF EXISTS "Anon cannot write eval_results" ON public.eval_results;
DROP POLICY IF EXISTS "Authenticated cannot write eval_results" ON public.eval_results;
