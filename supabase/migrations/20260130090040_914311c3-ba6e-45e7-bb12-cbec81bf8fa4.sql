-- Create a table to log user submissions across all flows
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  flow_type TEXT NOT NULL CHECK (flow_type IN ('before', 'after-crossed', 'after-someone-crossed')),
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('choice', 'freetext', 'ai_response')),
  choice_value TEXT,
  freetext_value TEXT,
  ai_response_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for querying by session
CREATE INDEX idx_submissions_session_id ON public.submissions(session_id);

-- Create index for querying by flow and time
CREATE INDEX idx_submissions_flow_created ON public.submissions(flow_type, created_at DESC);

-- Enable RLS but allow anonymous inserts (no user accounts in this app)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous logging)
CREATE POLICY "Allow anonymous inserts"
  ON public.submissions
  FOR INSERT
  WITH CHECK (true);

-- Only allow reading via service role (you reviewing in Cloud View)
-- No public SELECT policy = users can't read submissions
CREATE POLICY "Service role can read all"
  ON public.submissions
  FOR SELECT
  TO service_role
  USING (true);