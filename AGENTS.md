# Agent rules

- Bystander support is a frame on the one shared engine (reporterRole "self" | "other" | "unsure", set at the stop screen or via `?role=other`), not a forked product — keeps one safety system and eval suite.
- analyze-narrative, ito-followup and witness-report-brief in this repo are proxies. The real functions (including the witness frame) live on the external Supabase project. Never put prompt text in the repo copies.
- Witness content (guides, practice scenarios, report recipients) lives in `src/data/witness.ts`; practice scores stay in localStorage only.
- The report flow is practice-only: `witness-report-brief` returns a preview and must never send or store anything until legal review and vetted recipients exist.
