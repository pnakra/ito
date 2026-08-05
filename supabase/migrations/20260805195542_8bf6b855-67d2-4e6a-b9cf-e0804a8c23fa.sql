-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Graded production sessions
CREATE TABLE public.eval_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE,
  session_started_at timestamptz NOT NULL,
  flow_type text NOT NULL DEFAULT 'unknown',
  overall numeric,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  gates jsonb NOT NULL DEFAULT '{}'::jsonb,
  flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  transcript text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  week_of date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.eval_grades TO authenticated;
GRANT ALL ON public.eval_grades TO service_role;

ALTER TABLE public.eval_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read eval_grades"
  ON public.eval_grades FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon cannot read eval_grades"
  ON public.eval_grades FOR SELECT TO anon
  USING (false);

CREATE TRIGGER update_eval_grades_updated_at
  BEFORE UPDATE ON public.eval_grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_eval_grades_started_at ON public.eval_grades (session_started_at DESC);

-- Action queue
CREATE TABLE public.action_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_session_id uuid NOT NULL,
  fix text NOT NULL,
  target_function text,
  target_location text,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'proposed',
  notes text,
  week_of date,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT action_queue_status_check CHECK (status IN ('proposed','approved','backlog','ignored','applied'))
);

GRANT SELECT, UPDATE ON public.action_queue TO authenticated;
GRANT ALL ON public.action_queue TO service_role;

ALTER TABLE public.action_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read action_queue"
  ON public.action_queue FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update action_queue"
  ON public.action_queue FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon cannot read action_queue"
  ON public.action_queue FOR SELECT TO anon
  USING (false);

CREATE TRIGGER update_action_queue_updated_at
  BEFORE UPDATE ON public.action_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_action_queue_session ON public.action_queue (grade_session_id);
CREATE INDEX idx_action_queue_status ON public.action_queue (status);