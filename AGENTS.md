# Agent rules

- Bystander support is a frame on the one shared engine (reporterRole "self" | "other" | "unsure", set at the stop screen or via `?role=other`), not a forked product — keeps one safety system and eval suite.
- Witness framing is a prompt addendum (WITNESS_FRAME) appended in analyze-narrative and ito-followup; risk level and detection are unchanged by role — role must never lower severity.
- Witness content (guides, practice scenarios, report recipients) lives in `src/data/witness.ts`; practice scores stay in localStorage only.
- The report flow is practice-only: `witness-report-brief` returns a preview and must never send or store anything until legal review and vetted recipients exist.
