# MDSSPL Service Hub

One web app for all MDSSPL sustainability services: GHG, ESG, BRSR, ZWTL, LCA / PCF, Water Audit, CNA, Net Zero and Energy Audit. Clients enter data step by step, consultants and verifiers review it, and every project produces a report that can be saved as a PDF.

This is **version 0.1**: every service works end to end in a simple form. Each one can then be deepened on its own.

---

## What is in this folder

| Folder / file | What it is |
| --- | --- |
| `app/` (except `app/api/`) | **Front end**: the pages people see (front page, sign-in pages, hub, data-entry steps, report, admin) |
| `app/api/` | **Back end**: the API the pages call to save and load data and to check permissions |
| `lib/server/` | Back-end helpers: database access (`store.ts`) and who-can-do-what rules (`auth.ts`) |
| `modules/<service>/` | **One folder per service**: its steps, questions and calculations, plus its own `README.md` and `CHANGELOG.md` |
| `lib/factors.ts` | Emission factor table (example values; check them before issuing reports) |
| `supabase/schema.sql` | **Database**: tables, security rules and the sign-up trigger |
| `app/globals.css` | Colours and styles from the MDSSPL design system |
| `CHANGELOG.md` | History of changes to the whole app |

### Who can do what

| Role | Signs in at | Can do |
| --- | --- | --- |
| Client | Client sign-in (can self-register) | Start projects, enter data, submit for review, download reports |
| Staff / Consultant | Staff & verifier sign-in | See and edit all projects, start projects for clients |
| Third-party verifier | Staff & verifier sign-in | See submitted projects, start review, verify or return to draft |
| Admin | Admin sign-in | Everything, plus change people's roles |

Project status moves **Draft → Submitted → Under review → Verified**. Once a project is submitted, the client can no longer change it. Once it is verified, nobody can. Every save and status change is recorded in the project's change history.

---

## Step 1: Put the code on GitHub

1. Open **GitHub Desktop**. It should show the repository **MDSSPL-project-2** with many changed files.
2. Bottom-left, type a summary such as `First version of the hub`.
3. Click **Commit to main**.
4. Click **Push origin** at the top.

## Step 2: Put the website online (Render)

Claude can set this up for you. To do it yourself:

1. Go to **dashboard.render.com** and open the **MDSSPL-1** workspace.
2. Click **New → Web Service**, and choose the repository **MDSSPL-project-2**.
3. Fill in:
   - **Language / Runtime:** Node
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Instance type:** Free (fine for testing) or Starter (does not go to sleep)
4. Click **Create Web Service** and wait about 3 minutes for "Live".

The site now runs in **demo mode**: a yellow banner says so, you can sign in as demo users without a password, and data is wiped whenever the server restarts. It's good for trying things out, but not for clients.

## Step 3: Turn on real accounts and a permanent database (Supabase)

1. Go to **supabase.com → New project**. Pick a name, a strong database password and the region **Mumbai** (or the closest one to you). Wait for it to finish.
2. In the left menu, open **SQL Editor → New query**. Open `supabase/schema.sql` from this folder in Notepad, copy everything, paste it in and click **Run**. "Success" means the tables are ready.
3. In **Project Settings → API**, copy three values:
   - **Project URL**
   - the **anon / publishable** key
   - the **service_role / secret** key (keep this one private)
4. In Render, open your service → **Environment** → **Add environment variable**, and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role key

   Click **Save, rebuild and deploy**.
5. Open your site, go to **Client sign-in → Create an account**, and register yourself.
6. Make yourself admin: in Supabase **SQL Editor**, run this with your own email:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
7. Sign out, then sign in again on the **Admin sign-in** page. Under **Users** you can now make other people staff, verifiers or admins.

Tip: while testing, you can switch off email confirmation in Supabase under **Authentication → Sign In / Providers → Email → Confirm email**. Switch it back on before inviting clients.

## Step 4: Use your own domain (www.mdsspl.co.in)

In Render, open your service → **Settings → Custom Domains → Add**, and enter `www.mdsspl.co.in`. Render shows a **CNAME** record. Add that record wherever your domain's DNS is managed (your domain registrar). It can take up to a few hours to start working.

---

## Making changes

- **To change a service's questions or calculations**, edit `modules/<service>/index.ts`. The `README.md` in that folder explains how. Note the change in that folder's `CHANGELOG.md`.
- **To change an emission factor**, edit `lib/factors.ts`.
- **To change colours**, edit the top of `app/globals.css`. The values match the MDSSPL design system.
- When you're done, use **Commit** then **Push origin** in GitHub Desktop. Render rebuilds the site automatically within a few minutes.

## Running it on your own computer (optional)

You need **Node.js 20 or newer** from nodejs.org. Then, in this folder, open a terminal and run:

```
npm install
npm run dev
```

Open http://localhost:3000. Without a `.env.local` file it runs in demo mode. To connect Supabase locally, copy `.env.example` to `.env.local` and fill in the three values.

## Important notes

- **Emission factors are example values.** They're labelled "verify latest" in every report. Check them against the current DEFRA/DESNZ, CEA and IPCC publications before issuing a report to a client.
- **"Download PDF / Print"** on a report opens the browser's print window. Choose **Save as PDF**.
- Not built yet: file and evidence uploads, importing CSV, Excel or PDF data, certificates, per-client 1 GB databases, payments, and the detailed versions of each service. These are the next steps.
