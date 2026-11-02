# MDSSPL Service Hub — change history

Add the newest change at the top. Each service also has its own `modules/<service>/CHANGELOG.md`.

## 2026-11-02 — version 0.3.0
- The home page is now the full MDSSPL Service Hub app (from the Claude artifact), in `public/mdsspl.html`.
- Back end for the app: `/.netlify/functions/supabase-config` (Supabase link, public key only) and `/.netlify/functions/ai` (Claude AI with a per-connection hourly limit).
- Database: the app uses the Supabase project "Mdsspl Service Hub" (kv_store, events, certificates, mail_log, all with row-level security).
- The earlier simple hub moved to `/classic`.

## 2026-11-02 — version 0.2.0
- New: AI assistant on every signed-in page ("Ask the assistant"). It uses Claude through the server, knows the open project's data and results, and is limited per person per hour. It needs ANTHROPIC_API_KEY in Render.
- Design system: inputs use the `input` shadow token, extra tokens added (`space-10`, `radius-edges`), and the front page shows the design-system cover art.

## 2026-11-02 — version 0.1.1
- Security: the server now talks to Supabase as the signed-in person (publishable key + their login token). The secret service-role key is no longer used or needed.
- The database itself (`supabase/schema.sql`) now enforces every rule: who can see which projects, who can edit, the Draft → Submitted → Under review → Verified workflow, and that only admins can change roles.
- Setup guide updated: only two Supabase values are needed in Render.

## 2026-11-02 — version 0.1.0
- First version: front end and back end for all nine services (simple versions).
- Separate sign-in pages for clients, staff & verifiers, and admins; four roles (client, staff, verifier, admin).
- Step-by-step data entry (one page per step), live calculations, printable/PDF report and change history per project.
- Workflow: Draft → Submitted → Under review → Verified.
- Supabase database (`supabase/schema.sql`) with a demo mode when Supabase is not connected.
