# Agent rules

- Bystander support is a frame on the one shared engine (reporterRole "self" | "other" | "unsure", set at the stop screen or via `?role=other`), not a forked product — keeps one safety system and eval suite.
- analyze-narrative, ito-followup and witness-report-brief in this repo are proxies. The real functions (including the witness frame) live on the external Supabase project. Never put prompt text in the repo copies.
- Witness content (guides, practice scenarios, report recipients) lives in `src/data/witness.ts`; practice scores stay in localStorage only.
- The report flow is practice-only: `witness-report-brief` returns a preview and must never send or store anything until legal review and vetted recipients exist.
- Beta feedback and funding use a dedicated `/bystanderbeta/feedback` page; all beta feedback links target it so they work independently of check-in phase.
- Practice (/practice) is unlinked and adults only. `practice-roleplay` in this repo is a proxy; scenes, prompts and scoring live on the external Supabase project. Practice rows are logged with flow_type "practice" and never with step_type "ai_response".
- The webinar deck (/webinar) is a standalone fixed-canvas presentation with no product-flow dependencies, so webinar edits cannot change check-in behavior or logging.
- Campus bystander pilots supply validated HTTPS support/reporting links through the URL parameters documented in `docs/CAMPUS_PILOTS.md`; no school contacts are hardcoded, and witness no-report/no-share preferences suppress reporting links.
- The bystander pilot snapshot is aggregate-only. Witness practice logs completion with a scenario ID, while practice scores stay in localStorage and are never queried by the dashboard.
