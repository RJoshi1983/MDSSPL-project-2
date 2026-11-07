# MDSSPL Service Hub — change history

Add the newest change at the top. Each service also has its own `modules/<service>/CHANGELOG.md`.

## 2026-11-07 — version 0.6.9
- **Energy Audit: cooling and heat recovery.**
  - **New equipment type: Vapour absorption machine (VAM)** (steam single or double effect, hot water, exhaust gas or direct fired). Readings on the chilled water, cooling water and heat input sides give cooling delivered (TR), heat input, COP against design, steam per TR, auxiliary kW per TR and the heat balance. A COP below 90% of design creates a measure with the fuel saved.
  - **Chiller, refrigerant side:** refrigerant (R-134a, R-410A, R-32, R-22, R-717, R-1234ze(E), R-513A, R-404A), condenser water flow, motor efficiency, suction and discharge pressure and temperature, liquid line temperature and refrigerant top-up. Results: evaporating and condensing temperatures, superheat, subcooling, evaporator and condenser approaches, lift, second-law efficiency, heat balance and leak emissions (tCO₂e, for GHG Scope 1). High approaches create a measure (about 2.5% of compressor power per 1 K of lift).
  - **Heat exchanger, both streams:** cold-stream flow and specific heat, area and clean U-value. Results: heat given and taken, balance, LMTD, effectiveness, actual U-value, fouling resistance and the heat recovered if cleaned (ε–NTU); fouling creates a measure with the fuel saved.
  - **New tab "Waste heat & recovery"** (Analyse): inventory of unused heat (flue gas, exhaust, hot air, hot water, cooling water, hot product, flash steam), recoverable kW and GJ, grade, chart, recommended option (economiser, air preheater, VAM, waste heat boiler, ORC, heat pump, flash recovery), saving, CO₂, and "Send to measures". All recoverable heat is assumed to find a use.
  - Report section 15A and a "Waste heat" Excel sheet; textile sample data with a VAM, a heat exchanger, refrigerant readings and five waste heat sources; the Energy Audit sample verification and consultancy reports show the four new tables.

## 2026-11-07 — version 0.6.8
- **ECBC / ECSBC Building Compliance now uses ASHRAE and ISHRAE values.** New "Weather and design conditions" section in Building profile: pick one of 24 ASHRAE 2021 weather stations (New Delhi, Mumbai, Chennai, Kolkata, Bengaluru, Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow, Bhopal, Guwahati, Srinagar, Dehradun, Nagpur, Thiruvananthapuram, Bhubaneswar, Patna, Patiala for Chandigarh, Kochi, Visakhapatnam, Coimbatore, Indore, Goa) to fill the heating and cooling design dry bulb, coincident wet bulb, heating and cooling degree-days, cooling degree-hours and solar radiation; or choose the ISHRAE Indian Weather Data Handbook (or another source) and type its values. Indoor set points (ASHRAE 55) are editable.
- Calculation: heat gain from cooling degree-hours (base 23.3 °C) scaled by operating hours; heat loss from heating degree-days × 24; people heat by activity from the ASHRAE table (sensible and latent); outdoor air by space use from ASHRAE 62.1 with its sensible and moisture (latent) load from humidity ratios; **peak cooling load in kW and TR** and m² per TR; peak heating load. New "Peak cooling load" view in the building model, new cards and a TR column in the floor tables, a "Design conditions" note in the compliance check, and ASHRAE and ISHRAE references with links. Shimla and Leh have no ASHRAE station: use ISHRAE or another source there.

## 2026-11-06 — version 0.6.7
- **New service: ECBC / ECSBC Building Compliance** (code ECBC, group Energy, water and waste; now 50 services). Covers commercial buildings under ECSBC 2024 and ECBC 2017 and residential buildings under Eco Niwas Samhita 2024. Tabs: Dashboard; **Building model**; Building profile (type, code, target level, climate zone, connected load, hours, envelope, lighting and cooling, water, use and services, and editable reference limits); Floors; Construction materials (embodied carbon A1–A3 plus transport, default generic factors or EPD values); Energy equipment; Water; Renewable energy; Compliance check (21 checks: applicability, draft star-rating rule, envelope or RETV, cool roof, lighting, cooling efficiency, metering, controls, renewables, rainwater, reuse, fixtures, waste, indoor air, commissioning, embodied carbon, energy use per m²); Standards and references (ECSBC 2024, ECBC 2017, ENS 2024, NBC 2016 Parts 9 and 11, EN 15978 and ISO 21930, BEE star rating, the 2026 draft star-rating rule, with links).
- **Building model**: the building drawn floor by floor (basements below ground, roof with solar panels and water tank), each floor coloured by heat gain through the envelope, heat loss, electricity, thermal energy or water, in total or per m², with sun and heat-flow arrows, hover details, totals (energy use per m², cooling load, water per m², embodied carbon, renewable share, operational emissions), heat-flow breakdowns and a floor-wise table. A simplified screening model using typical climate data for the five climate zones; metered values replace estimates where entered.
- Sample data for a dummy 8-level office building, sample verification and consultancy reports, the PDF, Word, PowerPoint and Excel report, and the service colour and banner.

## 2026-11-06 — version 0.6.6
- **Consultancy sample reports for every service** (dummy client Greenfield Components Pvt. Ltd., Hosur; a different client from the verification samples, because MDSSPL never verifies its own consultancy work). Each report is titled with the service deliverable and shows: cover, a tracker of all 11 steps with dates, the project team (lead consultant, analyst, subject expert, internal quality reviewer, approver) and client contacts, Stage 1 scope and boundary, Stage 2 data collection with data quality, Stage 3 gap analysis, Stage 4 results with key insights, the improvement plan with owners and dates, Stages 5–6 draft report and client comments, Stage 7 internal quality review, Stage 8 final approval and delivery, sample signatures and the document list.
- **Pop-up viewer**: the sample reports now open in a pop-up window with two tabs, the verification report (or audit, assurance, validation, assessment or quality review, depending on the service) and the consultancy report, with Print or save as PDF, Open the service and Close (also the Esc key). Every service page has "Verification sample" and "Consultancy sample" buttons; the service buttons in Demo and guides open the same pop-up.

## 2026-11-06 — version 0.6.5
- **Sample verification reports for every service** (Demo and guides, and a "See the sample report" link on every service page). Dummy client Demo Manufacturing Pvt. Ltd. (Pune), FY 2025-26, dummy MDSSPL team (lead, team member, technical expert, independent technical reviewer, approver) and client contacts. Each report shows: cover with project and statement numbers, criteria and level of assurance; a tracker of all nine steps with dates; Stage 1 data collection (the service's own evidence list); Stage 2 validation checks; Stage 3 calculation check of the figures as first submitted; Stage 4 verification (opening meeting, sampling plan, site visit, first-submitted against verified figures, CAR / CR / FAR findings with corrections, closing meeting, materiality); Stage 5 technical review (independence, 10-point checklist, reviewer queries and responses, recommendation); Stage 6 final approval (decision, conditions, sample signatures); the statement with the opinion for limited or reasonable assurance (or a quality review for business services); and the document list with MDSSPL document numbers. Dummy key figures for all 49 services; corrections carry through to totals and per-unit figures. Print or save as PDF.

## 2026-11-06 — version 0.6.4
- The colours now also cover the sidebar (professional) layout that visitors see by default: the selected side-menu item takes the page or service colour, the 13 service-group tiles on the home page each have their own colour, the group headers on the Services page are coloured by group, and every service icon takes its service colour.

## 2026-11-06 — version 0.6.3
- New colourful look on every page: each service group has a colour family and each of the 49 services its own shade (carbon and climate green, carbon markets cyan, energy/water/waste amber-blue-lime, ESG reporting indigo-violet, regulatory rust-orange, supply chain sky, social and governance magenta, biodiversity olive, analytics slate, certification gold, tax and legal crimson, business portals mixed). A colour bar along the top, soft page background, rounded cards with soft shadows and pill-shaped menu buttons.
- Every service page opens with a banner in its colour (code, group, name, short description), and its buttons and headings take the service colour. The main pages (Registration, Services, Order, My orders, Manuals, Demo and guides, Staff console and others) have their own colour banners.
- Service cards on the Services page show the service colour and a code badge; Staff console tabs are colour-coded by their group. Works in light and dark mode; banners are hidden when printing.
- **GHG demo with dummy values** in GHG Accounting and in Demo and guides: Demo Manufacturing Pvt. Ltd. (Pune), FY 2025-26, base year FY 2022-23; month-by-month Scope 1, 2 and 3, sources ranked, this year against the base year and a 42% target path to FY 2029-30, sliders for production, efficiency, renewable share, CEA grid factor, diesel, EVs, flights and low-carbon steel, location- and market-based Scope 2, table view and the formulas.

## 2026-11-06 — version 0.6.2
- Visiting cards → **Style the card**: one font for the whole card (20 fonts, including Hindi and Telugu), text size 70–140%, text colour (automatic, design, all dark, all light), symbols for phone, e-mail, website and address (line, filled, round badge, square badge or letters) and their colour, and about 30 backgrounds for the front, back or both (plain, tints, gradients, patterns, leaf watermark, brand stripes, my colour, my gradient, my picture).
- Click any text on the card preview to change its words, size, font, colour, bold, italic or alignment, or hide it; changes are kept for each design and used when printing.
- Two new layouts: X1 and X2 "Design your own".
- **QR code generator**: website, save contact (vCard), WhatsApp, phone, SMS, e-mail, UPI payment, Wi-Fi, Google Maps location or text; colours, MDSSPL logo in the centre, caption, size; download PNG or SVG, or use it on the visiting card in place of the website QR code.

## 2026-11-05 — version 0.6.1
- Staff console → Content and reports → **Visiting cards** (staff and administrator; also linked from Letterheads): 38 designs (Professional series P1–P8 and 30 creative designs A–AD) with the logo and company details from the letterhead; each person enters name, designation, phone, e-mail and staff ID; a website QR code and a save-contact (vCard) QR code are made from the details, and design F has a Code 128 staff ID barcode. Print A4 sheets of 10 fronts or 10 backs (89 × 51 mm, cut marks) or one card, or save as PDF for the print shop.

## 2026-11-05 — version 0.6.0
- Staff console → Content and reports → Assurance forms (staff and administrator; also linked from Letterheads):
  - Library of the controlled forms Rev 1.0 (05 Nov 2026) for 24 assurance services: R0001 Opening meeting agenda and MOM, R0002 Plan, R0003 Finding report, R0004 Closing meeting, R0005 Statement, as fillable PDF and Word, plus master list MDSSPL-DOC-L0001. Files in public/assurance.
  - Document generator for every service (49): choose the project (UIN) and service, fill one engagement record (client, scope, period, criteria, level, materiality, team from Assignments, opening and closing meeting attendance, findings, conclusion) and print on the letterhead: F0001 Enquiry form, R0001 Opening meeting agenda, minutes and attendance, R0002 Plan, R0003 Finding report, R0006 Corrective action plan, R0004 Closing meeting record and attendance, R0007 Verification report, R0005 Statement (titles per service from the master list). Numbering MDSSPL-<code>-<form>, reference <UIN>/<code>/<form>, and a document register.

## 2026-11-03 — version 0.5.9
- The project number (UIN) is linked to everything: the payment record, the tax invoice, invoices and receipts (PDF), the UPI payment note and QR code, the Razorpay link note and the Razorpay order notes (back end: app/api/pay/create), referral commissions, CSV exports (each order number is followed by its UIN), assignments (Staff console → Assignments shows the project's UIN and project lists show it next to each project), and the online data records (service_records rows carry the UIN).

## 2026-11-03 — version 0.5.8
- Client number for every client (MDS-XXXXXX, worked out from the registered e-mail, the same on every device) and a unique project number for every project onboarded (Option B): MDS-client-groups+count-kind-DDMMYYYY-running, for example MDS-YKG1QY-CS2-V-05042027-01. Group letters: C carbon, E energy/water/waste, S sustainability reporting, R regulatory, U supply chain, G social & governance, H HSE, B biodiversity, Y analytical tools, Q certification, F finance, P people, M sales & marketing, T technology & legal. Kind: V verification, A advisory, none for consultancy. Shown next to every order number, on My orders and in the Staff console (Orders explains the format). Existing orders get their numbers automatically.

## 2026-11-03 — version 0.5.7
- Pamphlets: the figures count themselves (now 49 services in 13 groups), the standard text names the full range (EU CBAM, CSRD, CSDDD, EPR, supply chain, social and governance, biodiversity, analytics), and saved pamphlets with the old figures are corrected automatically. New services appear in the pamphlet service list as soon as they are added.
- Manuals: new manual "Services, scope and scope for improvement" (users) and a staff version: every service by group with its scope, what the client provides and receives, standards, modules, scope for improvement and related services, plus what MDSSPL is still completing on the platform. It rebuilds itself when services change.

## 2026-11-03 — version 0.5.6
- Staff console → Letterheads (under Content and reports): the official letterhead designs (Design 1 Brand Strip, Brand Strip for the Jubilee Hills office, Design 2 Navy Band, Design 3 Premium Clean, Classic template) with PDF and Word downloads; write a letter and print it on the chosen letterhead (Save as PDF), with automatic reference numbers (MDSSPL/001/2026-27) and a letter register. Files in public/letterheads.

## 2026-11-03 — version 0.5.5
- Licence keys: a new MDSSPL key pair. The public key is built into the website (front end) and the server (back end, LICENCE_PUBLIC_KEY in Render, /api/licence/verify and /api/licence/public-key), so licence checking is on. A public key saved on one device no longer overrides it (the earlier key was exposed and is no longer trusted). The private key is kept offline in Documents\MDSSPL-keys on the administrator's computer, not in GitHub.

## 2026-11-03 — version 0.5.4
- Administrator e-mail addresses: the administrator passphrase card now holds the primary e-mail (rageshjoshi@mdsspl.com) and a secondary recovery e-mail (madhumathidattasustainability@gmail.com), and the recovery code can be e-mailed to both.

## 2026-11-03 — version 0.5.3
- Admin only: Controls and access, Architecture, Source code, Integrations, Security centre, Licence keys and Assignments (the assignment hierarchy) are hidden from staff and open only to the administrator. A warning shows while no administrator passphrase is set.
- Core code protection: Staff console → Source code shows "Core code and modification files": the original core fingerprint (SHA-256), a warning if the core no longer matches the original, and every update as its own modification file (version, date, fingerprint, download). The same files are in the new code-changes folder.
- Referral partners: new sign-in "Other → Referral partner". With their code and the email or phone given at onboarding, a partner sees only their own referral code, referral link and onboarding details. Staff can publish partners to the website (Referrals tab). Database: referrers table with two safe checks (supabase/referrers.sql).
- Registration: shorter screen ("Register in two minutes"): name, email, phone, country, number of units, referral code and consent. Everything else (contact, sector, timing, reasons, standards, scope of each service, news consent, notes) is under "More details (optional)". Same data and rules as before. A referral link (?ref=CODE) fills the code in and the code is checked.

## 2026-11-03 — version 0.5.2
- More duplicates merged into the original services (saved data moved, formats unchanged):
  - Supplier CBAM Data Collection → inside EU CBAM Compliance (questionnaire, verification, default vs actual, data quality, supplier log).
  - Supply Chain Due Diligence → inside EU CSDDD Due Diligence (supplier risk, human rights, environmental compliance, corrective actions, audits).
  - Materiality Assessment → inside EU CSRD / ESRS (topics, stakeholder survey, impact and financial scoring, priority matrix).
- Sample data: every new service and added module has "Load sample data" and "Remove sample data" on its Dashboard.
- Demo & guides: video demo, audio guide and PDF manual for every new service, built from the sample data; CBAM, ESRS, HSE and CSDDD guides gain steps for the added modules.
- Manuals: the per-service technical, troubleshooting, end-to-end and code-map manuals now list all 49 services, with the modules (tabs and fields) of each.
- Database: new Supabase tables service_catalog (all services) and service_records (each record of each service, per signed-in owner, with row-level security). When the Supabase link is on, the app saves service records there too. SQL in supabase/service_tables.sql.

## 2026-11-03 — version 0.5.1
- Duplicates merged into the better, original services (their saved data and formats are unchanged):
  - "ESRS (CSRD) Sustainability Statement" is now "EU CSRD / ESRS Reporting" in Regulatory & Compliance, and gains Transition plan, Value chain data and Digital tagging readiness. The separate new CSRD service is removed.
  - "HSE Management" is now "Health & Safety Performance (HSE Management)" in Social & Governance, and gains TRIFR per million hours and an ISO 45001 clause check. The separate new Health & Safety service is removed.
  - Anything typed into the removed duplicates is moved into the added modules.

## 2026-11-03 — version 0.5.0
- 17 new services in 5 new groups (each opens as its own workspace with a dashboard, module tabs, settings, and Report PDF / PowerPoint / Excel / Word):
  - Regulatory & Compliance: EU CBAM Compliance (the existing CBAM service, moved here), EU CSRD / ESRS Reporting, EU CSDDD Due Diligence, Extended Producer Responsibility (EPR).
  - Supply Chain & Scope 3: Scope 3 Supplier Engagement, Supply Chain Due Diligence, Supplier CBAM Data Collection.
  - Social & Governance: Social Impact Assessment (SROI), Diversity, Equity & Inclusion Metrics, Governance Assessment, Health & Safety Performance (LTIFR, TRIFR, ISO 45001).
  - Biodiversity & Land: Biodiversity Impact Assessment, Land Restoration Planning, TNFD Disclosure.
  - Analytical Tools: Emission Factor Library, Climate Scenario Analysis, Sustainability Gap Analysis, Materiality Assessment.
- Prices for the new services are placeholders. Emission factors and CBAM default values are marked "to be confirmed by MDSSPL".

## 2026-11-03 — version 0.4.3
- Fix: blank page after accepting the terms. The terms acceptance and the sign-in accounts were saved under the same browser key (mdsAcc), so accepting the terms wiped the account list and the page stopped drawing. Acceptance now has its own key (mdsTerms); existing browsers are repaired automatically on the next visit.

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
