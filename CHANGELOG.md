# MDSSPL Service Hub — change history

Add the newest change at the top. Each service also has its own `modules/<service>/CHANGELOG.md`.

## 2026-11-02 — version 0.1.0
- First version: front end and back end for all nine services (simple versions).
- Separate sign-in pages for clients, staff & verifiers, and admins; four roles (client, staff, verifier, admin).
- Step-by-step data entry (one page per step), live calculations, printable/PDF report and change history per project.
- Workflow: Draft → Submitted → Under review → Verified.
- Supabase database (`supabase/schema.sql`) with a demo mode when Supabase is not connected.
