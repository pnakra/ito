-- Add CHECK constraints to enforce text length limits on submissions table
-- This provides defense-in-depth, ensuring limits are enforced even if edge function validation is bypassed

ALTER TABLE public.submissions
ADD CONSTRAINT freetext_length_check CHECK (length(freetext_value) <= 10000);

ALTER TABLE public.submissions
ADD CONSTRAINT choice_length_check CHECK (length(choice_value) <= 1000);

ALTER TABLE public.submissions
ADD CONSTRAINT ai_response_length_check CHECK (length(ai_response_summary) <= 10000);