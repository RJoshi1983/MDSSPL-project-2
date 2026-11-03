# Code modification files

CONFIDENTIAL. (c) MDSSPL. All rights reserved.

The core code of the MDSSPL Service Hub (`public/mdsspl.html`, the app built in Claude) is kept as the **original**. Every update is added as a separate **modification block** at the end of the main script, between

```
/* ===== MDSSPL change DATE vX.Y.Z: title ===== */
...
/* ===== end of change ===== */
```

Each block is also saved here as its own file. The administrator sees the same list, with fingerprints and downloads, under **Staff console → Source code → Core code and modification files**, and the page warns if the core no longer matches the original.

Original core fingerprint (SHA-256): `cbf5c69b0dd811fff32fa9e2391106230488db68aa462d07a36d912bf1f99551`

| # | File | Version | Date | Change | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| 1 | `01-v0.3.1-0.4.1.js` | v0.3.1-0.4.1 | 2026-11-02 | registration -> prices -> confirm -> payment | `b3a5bf0699f58ed8…` |
| 2 | `02-v0.4.2.js` | v0.4.2 | 2026-11-02 | Razorpay.me payment link (card, UPI, net banking without API keys) | `33d8e260fff309ba…` |
| 3 | `03-v0.4.3.js` | v0.4.3 | 2026-11-03 | blank page fix - terms acceptance and sign-in accounts used the same storage key (mdsAcc) | `a7f9c895aac5fc00…` |
| 4 | `04-v0.5.0.js` | v0.5.0 | 2026-11-03 | new service groups - Regulatory & Compliance, Supply Chain & Scope 3, Social & Governance, Biodiversity & Land, Analytical Tools | `1deae68d5368d00f…` |
| 5 | `05-v0.5.1.js` | v0.5.1 | 2026-11-03 | keep the original ESRS and HSE services (their data formats unchanged) in place of the new duplicates, and add the missing modules to them | `356001b83ae5b397…` |
| 6 | `06-v0.5.2.js` | v0.5.2 | 2026-11-03 | remove remaining duplicates (Supplier CBAM into CBAM, Supply Chain Due Diligence into CSDDD, Materiality into ESRS), sample data for every new service, demo guides, manuals rebuilt, online database tables | `f7e9c506f01ff6fe…` |
| 7 | `07-v0.5.3.js` | v0.5.3 | 2026-11-03 | admin-only control and architecture pages, code change register, referral partner page, simpler registration | `f7d2379ae7ca45c1…` |

## Rules

1. Do not edit the core code. Add a new modification block instead.
2. Each block gets the next version number and a one-line title.
3. After each update, add the new file to this folder and a row to this table, and record it in the CHANGELOG.
