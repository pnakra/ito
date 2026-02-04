-- Fix: Restrict SELECT access to service_role only
-- This prevents anonymous/authenticated users from reading submission data

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Service role can read all" ON public.submissions;

-- Create a new SELECT policy that only allows service_role to read
-- Using (auth.role() = 'service_role') ensures only backend services can access data
CREATE POLICY "Only service role can read submissions"
ON public.submissions
FOR SELECT
TO service_role
USING (true);

-- Add explicit DENY policies for regular users to make intent clear
-- Create a restrictive policy for anonymous users (no SELECT access)
CREATE POLICY "Anonymous users cannot read submissions"
ON public.submissions
FOR SELECT
TO anon
USING (false);

-- Create a restrictive policy for authenticated users (no SELECT access)  
CREATE POLICY "Authenticated users cannot read submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (false);