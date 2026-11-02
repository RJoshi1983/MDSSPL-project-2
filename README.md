# MDSSPL Service Hub

The MDSSPL website: registration, services, orders and payment, manuals, data collection, calculations, reports and certificates for all MDSSPL sustainability services.

**Version 0.3:** the home page (`/`) is the full **MDSSPL Service Hub app** built in Claude, in `public/mdsspl.html`. This server gives it the back end it needs:

| Address the app calls | Answered by | What it does |
| --- | --- | --- |
| `/.netlify/functions/supabase-config` | `app/api/supabase-config/route.ts` | Tells the app which Supabase database to use (public key only) |
| `/.netlify/functions/ai` | `app/api/ai/route.ts` | Claude AI for file extraction, translation, report text and the help desk |
| Supabase (`kv_store`, `events`, `certificates`, `mail_log`) | Supabase project **Mdsspl Service Hub** | Sign-in and saving each user's data, with row-level security |

The earlier simple hub is still at `/classic` (sign-in pages at `/sign-in/client`, and so on).

### How a change reaches the website

1. The app is changed in Claude (the artifact).
2. Claude copies the new version into `public/mdsspl.html` and commits it to GitHub (MDSSPL-project-2, branch `main`).
3. Render sees the new commit and rebuilds the website automatically. It is live about 2 to 3 minutes later.

---

## What is in this folder

| Folder / file | What it is |
| --- | --- |
| `public/mdsspl.html` | **Front end (main app)**: the MDSSPL Service Hub app shown at `/` |
| `app/` (except `app/api/`) | Front end of the classic hub at `/classic` (sign-in pages, hub, data-entry steps, report, admin) |
| `app/api/` | **Back end**: the API the pages call to save and load data and to check permissions |
| `lib/server/` | Back-end helpers: database access (`store.ts`) and who-can-do-what rules (`auth.ts`); the same rules are enforced again inside the database |
| `modules/<service>/` | **One folder per service**: its steps, questions and calculations, plus its own `README.md` and `CHANGELOG.md` |
| `lib/factors.ts` | Emission factor table (example values; check them before issuing reports) |
| `supabase/schema.sql` | **Database**: tables, security rules and the sign-up trigger |
| `app/globals.css` | Colours and styles from the MDSSPL design system |
| `app/api/assistant/` and `components/Assistant.tsx` | The AI assistant (back end and chat panel) |
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
3. In **Project Settings → API Keys**, copy two values: the **Project URL** and the **publishable / anon** key. (No secret key is needed: the database's own rules in `schema.sql` decide what each person can see and do.)
4. In Render, open your service → **Environment** → **Add environment variable**, and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the publishable / anon key

   Click **Save, rebuild and deploy**. Also in Supabase, under **Authentication → URL Configuration**, set **Site URL** to your website address (for example `https://mdsspl-service-hub.onrender.com`) so that confirmation emails link to the right place.
5. Open your site, go to **Client sign-in → Create an account**, and register yourself.
6. Make yourself admin: in Supabase **SQL Editor**, run this with your own email:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
7. Sign out, then sign in again on the **Admin sign-in** page. Under **Users** you can now make other people staff, verifiers or admins.

Tip: while testing, you can switch off email confirmation in Supabase under **Authentication → Sign In / Providers → Email → Confirm email**. Switch it back on before inviting clients.

## Step 4: Use your own domain (www.mdsspl.co.in)

In Render, open your service → **Settings → Custom Domains → Add**, and enter `www.mdsspl.co.in`. Render shows a **CNAME** record. Add that record wherever your domain's DNS is managed (your domain registrar). It can take up to a few hours to start working.

## Step 5 (optional): Switch on the AI assistant

Every signed-in page has an **Ask the assistant** button. It answers questions about the services and, when a project is open, about that project's data and results. It uses Claude through your own Anthropic account, which is billed per use. The default model is small and cheap, and each person is limited to 30 questions an hour.

1. Go to **console.anthropic.com**, sign in, add a payment method, and open **API Keys → Create Key**. Copy the key (it starts with `sk-ant-`). Keep it secret.
2. In Render, open your service → **Environment → Add environment variable**: `ANTHROPIC_API_KEY` = the key. Click **Save, rebuild and deploy**.
3. Optional: `ANTHROPIC_MODEL` picks a different Claude model, and `ASSISTANT_MAX_PER_HOUR` changes the hourly limit.

The key stays on the server and is never sent to people's browsers. Without a key, the hub works normally and the assistant says it isn't switched on yet.

## Website settings in Render (Environment)

| Name | Value | Needed for |
| --- | --- | --- |
| `SUPABASE_URL` | `https://vvgktutlvmdrujkfrxdj.supabase.co` | Sign-in and saving data in the main app |
| `SUPABASE_ANON_KEY` | the **publishable** key from Supabase (starts with `sb_publishable_`) | Same. Never put a secret key here; the server refuses to pass one on. |
| `ANTHROPIC_API_KEY` | your key from console.anthropic.com | AI features (optional). Limited to 60 AI requests per hour per connection; change with `AI_MAX_PER_HOUR`. |
| `ANTHROPIC_MODEL` / `ANTHROPIC_MODEL_QUICK` | default `claude-sonnet-5-5` / `claude-haiku-5-5` | Optional model choice |

In Supabase, under **Authentication → URL Configuration**, set **Site URL** to `https://www.mdsspl.co.in` so that sign-up and password e-mails link to the website.

## Online payments (card, UPI, net banking) — you decide in Render

The payment page shows **Pay online now** to the client: they choose **Credit or debit card**, **UPI** or **Net banking**, and then the provider they prefer, **Razorpay** or **Cashfree**. The money is confirmed with the provider automatically, and the order is marked as paid with the provider's payment ID. Below that, the free direct options (your UPI ID with a QR code, bank transfer, cheque) stay available, with help on finding the **UTR** number.

International clients (orders in another currency) see **card payment only**. Their card is charged in rupees and their bank converts it at its own exchange rate.

Everything is set in **Render → mdsspl-service-hub → Environment** (no code changes needed):

| Setting | Example | What it does |
| --- | --- | --- |
| `PAY_GATEWAYS` | `razorpay,cashfree` | Which providers the client may choose, in this order. Only providers with keys are shown. |
| `PAY_CARD_FEE_PCT` | `2` | Convenience fee added to **card** payments only (0 to 5). UPI and net banking are free for the client. |
| `PAY_UPI_ID` | `mdsspl@idfcbank` | Your UPI ID for free direct UPI payments; a QR code is drawn automatically. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | `rzp_test_…` / secret | From Razorpay Dashboard → Account & Settings → API Keys. Test keys (`rzp_test_`) = test mode; live keys = real money. |
| `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` / `CASHFREE_ENV` | … / … / `sandbox` or `production` | From Cashfree Dashboard → Developers → API Keys. |

Secret keys stay on the server and never reach the browser. If a provider has no keys, it simply isn't offered.

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

Open http://localhost:3000. Without a `.env.local` file it runs in demo mode. To connect Supabase locally, copy `.env.example` to `.env.local` and fill in the two values.

## Important notes

- **Emission factors are example values.** They're labelled "verify latest" in every report. Check them against the current DEFRA/DESNZ, CEA and IPCC publications before issuing a report to a client.
- **"Download PDF / Print"** on a report opens the browser's print window. Choose **Save as PDF**.
- Not built yet: file and evidence uploads, importing CSV, Excel or PDF data, certificates, per-client 1 GB databases, payments, and the detailed versions of each service. These are the next steps.
