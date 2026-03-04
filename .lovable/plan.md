

## Problem

The `log-submission` edge function returns 200 OK, logs no errors, but rows don't appear in:
- Your external Supabase (the one you're checking)
- The Lovable Cloud database

Yet Slack receives the data, meaning the function IS executing and processing the payload correctly. The insert is succeeding against whatever database `EXTERNAL_SUPABASE_URL` resolves to — it's just not the one you're looking at.

## Plan

### 1. Add URL logging to the edge function
Add a log line that prints the first ~40 characters of `EXTERNAL_SUPABASE_URL` (enough to identify the project, safe to log). This will confirm exactly which database the function is connecting to.

### 2. Verify and update the secret if needed
Once we see the URL in the logs, you can confirm whether it matches your external Supabase project URL. If it doesn't match, we'll need to update the `EXTERNAL_SUPABASE_URL` secret to point to the correct project.

## What this will look like

The edge function will log something like:
```
Connecting to external DB: https://abcdefghij.supabase.co
```

This is a one-line code change + redeploy, then one test call to see the logged URL.

