import type { ServiceModule } from '@/lib/types';
import { FINANCIAL_YEARS, n, pct, round } from '@/lib/calc';

const PRINCIPLES = ['P1 Ethics and transparency', 'P2 Sustainable products', 'P3 Employee well-being', 'P4 Stakeholder engagement', 'P5 Human rights', 'P6 Environment', 'P7 Public policy advocacy', 'P8 Inclusive growth', 'P9 Consumer value'];

const brsr: ServiceModule = {
  id: 'brsr',
  name: 'Business Responsibility and Sustainability Report',
  short: 'BRSR',
  colorToken: 'svc-brsr',
  summary: 'SEBI BRSR Sections A, B and C, with BRSR Core indicators calculated from them.',
  standards: ['SEBI BRSR format (Annexure I)', 'BRSR Core (Annexure II)'],
  steps: [
    { id: 'general', title: 'Section A — General disclosures', fields: [
      { key: 'organisation', label: 'Name of the listed entity', type: 'text', required: true },
      { key: 'cin', label: 'Corporate Identity Number (CIN)', type: 'text' },
      { key: 'financial_year', label: 'Reporting year', type: 'select', options: FINANCIAL_YEARS, required: true },
      { key: 'sector', label: 'Sector', type: 'select', options: ['Manufacturing', 'Chemicals', 'Pharmaceuticals', 'Textiles', 'Automotive', 'IT and services', 'Banking and finance', 'Infrastructure', 'FMCG', 'Other'] },
      { key: 'turnover_cr', label: 'Turnover', type: 'number', unit: '₹ crore' },
      { key: 'employees', label: 'Permanent employees', type: 'number' },
      { key: 'women', label: 'Of which women', type: 'number' },
      { key: 'workers', label: 'Permanent workers', type: 'number' },
    ] },
    { id: 'sectionb', title: 'Section B — Management and process', intro: 'Tick the principles for which the company has a board-approved policy.', fields: [
      { key: 'policies', label: 'Policies in place', type: 'multiselect', options: PRINCIPLES },
      { key: 'director', label: 'Director responsible for BRSR (name, DIN)', type: 'text' },
    ] },
    { id: 'sectionc', title: 'Section C — Principle-wise performance (Core indicators)', fields: [
      { key: 'energy_gj', label: 'P6 Total energy consumption', type: 'number', unit: 'GJ' },
      { key: 'renewable_gj', label: 'P6 Of which from renewable sources', type: 'number', unit: 'GJ' },
      { key: 'water_kl', label: 'P6 Total water consumption', type: 'number', unit: 'kL' },
      { key: 'scope1_t', label: 'P6 Scope 1 emissions', type: 'number', unit: 'tCO2e' },
      { key: 'scope2_t', label: 'P6 Scope 2 emissions', type: 'number', unit: 'tCO2e' },
      { key: 'waste_t', label: 'P6 Total waste generated', type: 'number', unit: 'tonnes' },
      { key: 'waste_recovered_t', label: 'P6 Waste recovered (recycled / reused)', type: 'number', unit: 'tonnes' },
      { key: 'ltifr', label: 'P3 LTIFR (employees)', type: 'number' },
      { key: 'wellbeing_cost', label: 'P3 Spending on employee well-being', type: 'number', unit: '₹ crore' },
      { key: 'msme_purchase_pct', label: 'P8 Input material sourced from MSMEs / small producers', type: 'number', unit: '%' },
      { key: 'complaints', label: 'P9 Consumer complaints received', type: 'number' },
      { key: 'complaints_pending', label: 'P9 Consumer complaints pending', type: 'number' },
    ] },
  ],
  calculate(d) {
    const a = d.general || {}, b = d.sectionb || {}, c = d.sectionc || {};
    const to = n(a.turnover_cr);
    const ghg = n(c.scope1_t) + n(c.scope2_t);
    const per = (x: number) => (to > 0 ? round(x / to, 3) : '—');
    return [
      { title: 'BRSR Core — intensity per ₹ crore turnover', rows: [
        { label: 'Energy intensity', value: per(n(c.energy_gj)), unit: 'GJ / ₹ crore' },
        { label: 'Water intensity', value: per(n(c.water_kl)), unit: 'kL / ₹ crore' },
        { label: 'GHG (Scope 1 + 2) intensity', value: per(ghg), unit: 'tCO2e / ₹ crore' },
        { label: 'Waste intensity', value: per(n(c.waste_t)), unit: 't / ₹ crore' },
      ] },
      { title: 'BRSR Core — other indicators', rows: [
        { label: 'Renewable energy share', value: pct(n(c.renewable_gj), n(c.energy_gj)), unit: '%' },
        { label: 'Waste recovered', value: pct(n(c.waste_recovered_t), n(c.waste_t)), unit: '%' },
        { label: 'Women in permanent employees', value: pct(n(a.women), n(a.employees)), unit: '%' },
        { label: 'LTIFR', value: n(c.ltifr) },
        { label: 'Well-being spend as % of turnover', value: pct(n(c.wellbeing_cost), to), unit: '%' },
        { label: 'Sourcing from MSMEs', value: n(c.msme_purchase_pct), unit: '%' },
        { label: 'Consumer complaints resolved', value: pct(n(c.complaints) - n(c.complaints_pending), n(c.complaints)), unit: '%' },
      ] },
      { title: 'Section B — Policy coverage', rows: PRINCIPLES.map((p) => ({ label: p, value: (b.policies || []).includes(p) ? 'Yes' : 'No' })) },
    ];
  },
};
export default brsr;
