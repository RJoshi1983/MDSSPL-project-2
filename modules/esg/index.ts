import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, pct, round } from '@/lib/calc';

const TOPICS = [
  'GRI 201 Economic performance', 'GRI 205 Anti-corruption', 'GRI 302 Energy', 'GRI 303 Water and effluents',
  'GRI 305 Emissions', 'GRI 306 Waste', 'GRI 403 Occupational health and safety', 'GRI 404 Training and education',
  'GRI 405 Diversity and equal opportunity', 'GRI 413 Local communities',
];

const esg: ServiceModule = {
  id: 'esg',
  name: 'ESG Reporting',
  short: 'ESG',
  colorToken: 'svc-esg',
  summary: 'GRI-based ESG disclosures for any industry, single or multiple units.',
  standards: ['GRI 1, 2 and 3 (2021)', 'GRI 200, 300 and 400 series topic standards'],
  steps: [
    { id: 'general', title: 'Organisation and reporting year', fields: [
      ...GENERAL_FIELDS,
      { key: 'units', label: 'Reporting scope', type: 'select', options: ['Single unit', 'Multiple units (consolidated)'] },
      { key: 'revenue_cr', label: 'Revenue from operations', type: 'number', unit: '₹ crore' },
    ] },
    { id: 'materiality', title: 'Material topics (GRI 3)', intro: 'Pick the topics that matter most to your stakeholders and your business. Only these appear as headline KPIs in the report.', fields: [
      { key: 'stakeholders', label: 'Stakeholder groups consulted', type: 'multiselect', options: ['Employees', 'Customers', 'Investors', 'Suppliers', 'Communities', 'Regulators', 'NGOs'] },
      { key: 'topics', label: 'Material topics', type: 'multiselect', options: TOPICS },
      { key: 'method', label: 'How topics were chosen', type: 'textarea', hint: 'e.g. survey of 120 stakeholders, impact × likelihood scoring.' },
    ] },
    { id: 'environment', title: 'Environment (GRI 300)', fields: [
      { key: 'energy_gj', label: 'Total energy consumed (302-1)', type: 'number', unit: 'GJ' },
      { key: 'renewable_gj', label: 'Of which renewable', type: 'number', unit: 'GJ' },
      { key: 'water_m3', label: 'Water withdrawn (303-3)', type: 'number', unit: 'm³' },
      { key: 'scope1_t', label: 'Scope 1 emissions (305-1)', type: 'number', unit: 'tCO2e', hint: 'From the GHG service.' },
      { key: 'scope2_t', label: 'Scope 2 emissions (305-2)', type: 'number', unit: 'tCO2e' },
      { key: 'waste_t', label: 'Waste generated (306-3)', type: 'number', unit: 'tonnes' },
      { key: 'waste_diverted_t', label: 'Waste diverted from disposal (306-4)', type: 'number', unit: 'tonnes' },
    ] },
    { id: 'social', title: 'Social (GRI 400)', fields: [
      { key: 'employees', label: 'Total employees (2-7)', type: 'number' },
      { key: 'women', label: 'Of which women', type: 'number' },
      { key: 'hours_worked', label: 'Total hours worked', type: 'number', unit: 'hours' },
      { key: 'lti', label: 'Lost-time injuries (403-9)', type: 'number' },
      { key: 'fatalities', label: 'Fatalities (403-9)', type: 'number' },
      { key: 'training_hours', label: 'Total training hours (404-1)', type: 'number', unit: 'hours' },
      { key: 'csr_spend', label: 'Community / CSR spend (413)', type: 'number', unit: '₹ lakh' },
    ] },
    { id: 'governance', title: 'Governance (GRI 2 and 205)', fields: [
      { key: 'board_size', label: 'Board members (2-9)', type: 'number' },
      { key: 'independent', label: 'Independent directors', type: 'number' },
      { key: 'women_board', label: 'Women on the board', type: 'number' },
      { key: 'corruption_cases', label: 'Confirmed incidents of corruption (205-3)', type: 'number' },
      { key: 'policies', label: 'Policies in place', type: 'multiselect', options: ['Code of conduct', 'Anti-bribery', 'Whistle-blower', 'Human rights', 'Environment', 'Health and safety', 'Supplier code'] },
    ] },
  ],
  calculate(d) {
    const g = d.general || {}, e = d.environment || {}, s = d.social || {}, gv = d.governance || {}, m = d.materiality || {};
    const rev = n(g.revenue_cr);
    const ghg = n(e.scope1_t) + n(e.scope2_t);
    const ltifr = n(s.hours_worked) > 0 ? round((n(s.lti) * 1_000_000) / n(s.hours_worked), 2) : 0;
    return [
      { title: 'Environment', rows: [
        { label: 'Energy consumed', value: n(e.energy_gj), unit: 'GJ' },
        { label: 'Renewable share', value: pct(n(e.renewable_gj), n(e.energy_gj)), unit: '%' },
        { label: 'Scope 1 + 2 emissions', value: round(ghg, 2), unit: 'tCO2e' },
        { label: 'Emission intensity', value: rev > 0 ? round(ghg / rev, 3) : '—', unit: 'tCO2e / ₹ crore' },
        { label: 'Water intensity', value: rev > 0 ? round(n(e.water_m3) / rev, 2) : '—', unit: 'm³ / ₹ crore' },
        { label: 'Waste diverted', value: pct(n(e.waste_diverted_t), n(e.waste_t)), unit: '%' },
      ] },
      { title: 'Social', rows: [
        { label: 'Women in workforce', value: pct(n(s.women), n(s.employees)), unit: '%' },
        { label: 'LTIFR (per million hours)', value: ltifr },
        { label: 'Fatalities', value: n(s.fatalities) },
        { label: 'Average training hours per employee', value: n(s.employees) > 0 ? round(n(s.training_hours) / n(s.employees), 1) : 0, unit: 'hours' },
      ] },
      { title: 'Governance', rows: [
        { label: 'Independent directors', value: pct(n(gv.independent), n(gv.board_size)), unit: '%' },
        { label: 'Women on the board', value: pct(n(gv.women_board), n(gv.board_size)), unit: '%' },
        { label: 'Confirmed corruption incidents', value: n(gv.corruption_cases) },
        { label: 'Policies in place', value: (gv.policies || []).length + ' of 7' },
      ] },
      { title: 'Material topics', rows: (m.topics || []).map((x: string) => ({ label: x, value: 'Material' })) },
    ];
  },
};
export default esg;
