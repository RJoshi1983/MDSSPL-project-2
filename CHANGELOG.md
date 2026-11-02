# MDSSPL Service Hub — change history

Add the newest change at the top. Each service also has its own `modules/<service>/CHANGELOG.md`.

## 2026-11-03 — version 0.4.2
- Razorpay payment link (razorpay.me/@mdsspl, set by PAY_LINK_URL): while no Razorpay API keys are set, the payment page shows "Pay with Razorpay" for card, UPI or net banking, with the amount to enter (card amount includes the card fee). The client then enters the Razorpay Payment ID with the method "Razorpay link"; MDSSPL checks it in the Razorpay dashboard.

## 2026-11-03 — version 0.4.1
- UPI payee name (PAY_UPI_NAME) shown on the page and in UPI apps.

## 2026-11-03 — version 0.4.0
- Online payments: "Pay online now" on the payment page. The client chooses credit/debit card, UPI or net banking and the provider (Razorpay or Cashfree); the payment is confirmed with the provider on the server (signature / status check) and recorded on the order.
- Card convenience fee set by PAY_CARD_FEE_PCT (UPI and net banking free). International orders: card only, charged in INR, converted by the client's bank.
- Free UPI: PAY_UPI_ID in Render turns on direct UPI with an automatic QR code. Help box explains the UTR number for NEFT, RTGS, IMPS and UPI.
- Fix: the order "Cancel order" button works again (a helper from 0.3.1 had the same name).

## 2026-11-02 — version 0.3.2
- Payment: the "Before you pay" step no longer blocks the client. The two acceptance boxes can be ticked straight away (ticking confirms that document), a line says exactly what is still needed, and the document reader is readable in dark mode. After "Accept and continue to payment" the bank transfer / cheque details and the payment form open.

## 2026-11-02 — version 0.3.1
- Registration → prices → confirmation → payment:
  - Prices now appear as soon as the required registration details are filled (name, valid email, consent). Before, they stayed hidden unless the separate "Submit enquiry" button was used.
  - "Next: see prices and choose services" records the enquiry, carries its services into the selection and opens the price list; if something required is missing, it says exactly what.
  - Before an order is placed, the client sees a "Confirm your order" box (services, subtotal, tax, total) and must click "Confirm and go to payment"; then the payment page opens.
  - The "Go to registration" button on the order page now opens the registration page.
- The same change is made in the Claude artifact, so both stay identical.

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
