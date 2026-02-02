-- Add message_index to track conversation order within a session
ALTER TABLE public.submissions 
ADD COLUMN message_index integer DEFAULT 0;

-- Add an index for efficient ordering within sessions
CREATE INDEX idx_submissions_session_order ON public.submissions(session_id, message_index);