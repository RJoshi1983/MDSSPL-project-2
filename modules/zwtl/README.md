# Zero Waste to Landfill module

Everything specific to the Zero Waste to Landfill service lives in `index.ts` in this folder:

- **steps**: the data-entry pages, in order. Each step is one page in the app.
- **fields**: the questions on each page (text, number, list, tick boxes or a table with add/delete rows).
- **calculate()**: turns the entered data into the results shown in the report.

The shared parts (sign-in, saving, the report page, permissions) are outside this folder, so changing this module cannot break the other services.

## How to change this module

1. Open `index.ts`.
2. To add a question, copy an existing line inside `fields: [ ... ]` and change its `key`, `label` and `unit`. Each `key` must be unique on its page.
3. To use the new value in the results, read it in `calculate()` with `n(d.<stepId>.<key>)`.
4. Write what you changed in `CHANGELOG.md` in this folder.
5. Commit and push in GitHub Desktop. Render rebuilds the site automatically.

Emission factors used here come from `lib/factors.ts`. They are example values: check them against the latest source before issuing reports.
