import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, pct, round, rows } from '@/lib/calc';

const nz: ServiceModule = {
  id: 'net-zero',
  name: 'Net Zero',
  short: 'Net Zero',
  colorToken: 'svc-net-zero',
  summary: 'Baseline, science-based targets, reduction levers and a road map to net zero.',
  standards: ['SBTi Corporate Net-Zero Standard', 'ISO 14068-1', 'ISAE 3410 (assurance)'],
  steps: [
    { id: 'general', title: 'Organisation and reporting year', fields: GENERAL_FIELDS },
    { id: 'baseline', title: 'Baseline and current emissions', intro: 'Use GHG inventories for the base year and the current year.', fields: [
      { key: 'base_year', label: 'Base year', type: 'number', hint: 'e.g. 2022' },
      { key: 'base_s12', label: 'Base year Scope 1 + 2', type: 'number', unit: 'tCO2e' },
      { key: 'base_s3', label: 'Base year Scope 3', type: 'number', unit: 'tCO2e' },
      { key: 'current_year', label: 'Current year', type: 'number' },
      { key: 'current_s12', label: 'Current Scope 1 + 2', type: 'number', unit: 'tCO2e' },
      { key: 'current_s3', label: 'Current Scope 3', type: 'number', unit: 'tCO2e' },
    ] },
    { id: 'targets', title: 'Targets', fields: [
      { key: 'near_year', label: 'Near-term target year', type: 'number', hint: '5–10 years from submission, e.g. 2030.' },
      { key: 'net_zero_year', label: 'Net-zero year', type: 'number', hint: 'No later than 2050.' },
      { key: 'ambition', label: 'Scope 1 + 2 ambition', type: 'select', options: ['1.5°C (4.2% a year)', 'Well-below 2°C (2.5% a year)'] },
    ] },
    { id: 'levers', title: 'Reduction levers (road map)', fields: [
      { key: 'levers', label: 'Levers', type: 'table', columns: [
        { key: 'lever', label: 'Measure', type: 'text' },
        { key: 'scope', label: 'Scope', type: 'select', options: ['Scope 1', 'Scope 2', 'Scope 3'] },
        { key: 'year', label: 'Year in place', type: 'number' },
        { key: 'tonnes', label: 'Reduction per year', type: 'number', unit: 'tCO2e' },
        { key: 'capex', label: 'Investment', type: 'number', unit: '₹ lakh' },
      ] },
    ] },
  ],
  calculate(d) {
    const b = d.baseline || {}, t = d.targets || {};
    const by = n(b.base_year), ny = n(t.near_year), nzy = n(t.net_zero_year) || 2050;
    const rate12 = String(t.ambition || '').startsWith('Well') ? 0.025 : 0.042;
    const years = Math.max(0, ny - by);
    const target12 = n(b.base_s12) * Math.max(0, 1 - rate12 * years);
    const target3 = n(b.base_s3) * Math.max(0, 1 - 0.025 * years);
    const lv = rows(d.levers, 'levers');
    const leverSum = (s: string) => lv.filter((r) => r.scope === s && (!n(r.year) || n(r.year) <= ny)).reduce((a, r) => a + n(r.tonnes), 0);
    const planned12 = n(b.current_s12) - leverSum('Scope 1') - leverSum('Scope 2');
    const planned3 = n(b.current_s3) - leverSum('Scope 3');
    const longTerm = (n(b.base_s12) + n(b.base_s3)) * 0.1;
    return [
      { title: `Near-term targets (${ny || '—'})`, rows: [
        { label: 'Scope 1 + 2 target', value: round(target12, 1), unit: 'tCO2e', note: `${round(rate12 * years * 100, 1)}% below ${by || 'base year'}` },
        { label: 'Scope 1 + 2 with planned levers', value: round(planned12, 1), unit: 'tCO2e' },
        { label: 'Scope 1 + 2 gap', value: round(Math.max(0, planned12 - target12), 1), unit: 'tCO2e', strong: true },
        { label: 'Scope 3 target (2.5% a year)', value: round(target3, 1), unit: 'tCO2e' },
        { label: 'Scope 3 with planned levers', value: round(planned3, 1), unit: 'tCO2e' },
        { label: 'Scope 3 gap', value: round(Math.max(0, planned3 - target3), 1), unit: 'tCO2e', strong: true },
      ] },
      { title: `Long-term net zero (${nzy})`, rows: [
        { label: 'Maximum residual emissions (90% cut)', value: round(longTerm, 1), unit: 'tCO2e', note: 'Must be neutralised with permanent removals.' },
        { label: 'Progress since base year (all scopes)', value: pct((n(b.base_s12) + n(b.base_s3)) - (n(b.current_s12) + n(b.current_s3)), n(b.base_s12) + n(b.base_s3)), unit: '%' },
        { label: 'Total planned investment', value: round(lv.reduce((a, r) => a + n(r.capex), 0), 1), unit: '₹ lakh' },
      ] },
      { title: 'Road map', rows: lv.length ? [...lv].sort((a, c) => n(a.year) - n(c.year)).map((r) => ({ label: `${r.year || '—'} · ${r.scope || ''}`, value: `${r.lever || 'Measure'}: ${round(n(r.tonnes), 1)} tCO2e/yr` })) : [{ label: '—', value: 'Add levers in the last step.' }] },
    ];
  },
};
export default nz;
