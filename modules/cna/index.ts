import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, pct, round, rows } from '@/lib/calc';

const cna: ServiceModule = {
  id: 'cna',
  name: 'Carbon Neutral Assurance',
  short: 'CNA',
  colorToken: 'svc-cna',
  summary: 'Residual emissions from the GHG inventory matched against retired carbon credits.',
  standards: ['ISO 14068-1:2023', 'ISO 14064-3 (verification)'],
  steps: [
    { id: 'general', title: 'Organisation and assessment period', fields: [
      ...GENERAL_FIELDS,
      { key: 'period_from', label: 'Assessment period from', type: 'text', hint: 'e.g. 01-04-2025' },
      { key: 'period_to', label: 'Assessment period to', type: 'text', hint: 'e.g. 31-03-2026' },
      { key: 'subject', label: 'Subject of the claim', type: 'select', options: ['Organisation', 'Facility', 'Product', 'Event', 'Building'] },
    ] },
    { id: 'footprint', title: 'Footprint (from the GHG service)', intro: 'Copy the totals from the GHG report of the same period.', fields: [
      { key: 'scope1_t', label: 'Scope 1', type: 'number', unit: 'tCO2e' },
      { key: 'scope2_t', label: 'Scope 2', type: 'number', unit: 'tCO2e' },
      { key: 'scope3_t', label: 'Scope 3 (included categories)', type: 'number', unit: 'tCO2e' },
      { key: 'reductions_t', label: 'Reductions achieved in the period (already reflected above)', type: 'number', unit: 'tCO2e', hint: 'For the reduction narrative; not subtracted again.' },
      { key: 'buffer_pct', label: 'Safety margin on credits', type: 'number', unit: '%', hint: 'Default 10%. Covers uncertainty in the inventory.' },
    ] },
    { id: 'credits', title: 'Carbon credits retired', intro: 'Only credits retired (cancelled) on a public registry in the client’s name count.', fields: [
      { key: 'credits', label: 'Credits', type: 'table', columns: [
        { key: 'registry', label: 'Registry', type: 'select', options: ['Verra (VCS)', 'Gold Standard', 'UNFCCC CDM', 'Global Carbon Council', 'Indian Carbon Market', 'Other'] },
        { key: 'project', label: 'Project name / ID', type: 'text' },
        { key: 'serial', label: 'Serial number range', type: 'text' },
        { key: 'vintage', label: 'Vintage year', type: 'text' },
        { key: 'tonnes', label: 'Quantity', type: 'number', unit: 'tCO2e' },
        { key: 'retired', label: 'Retired?', type: 'select', options: ['Yes', 'No'] },
      ] },
    ] },
  ],
  calculate(d) {
    const f = d.footprint || {};
    const residual = n(f.scope1_t) + n(f.scope2_t) + n(f.scope3_t);
    const buffer = f.buffer_pct === undefined || f.buffer_pct === '' ? 10 : n(f.buffer_pct);
    const required = residual * (1 + buffer / 100);
    const cr = rows(d.credits, 'credits');
    const retired = cr.filter((r) => r.retired === 'Yes').reduce((a, r) => a + n(r.tonnes), 0);
    const pending = cr.filter((r) => r.retired !== 'Yes').reduce((a, r) => a + n(r.tonnes), 0);
    const missingSerial = cr.filter((r) => !String(r.serial || '').trim()).length;
    const shortfall = Math.max(0, required - retired);
    const ok = shortfall === 0 && missingSerial === 0 && residual > 0;
    return [
      { title: 'Carbon neutrality check', rows: [
        { label: 'Residual emissions (Scope 1 + 2 + 3)', value: round(residual, 2), unit: 'tCO2e' },
        { label: `Credits required incl. ${buffer}% margin`, value: round(required, 2), unit: 'tCO2e' },
        { label: 'Credits retired', value: round(retired, 2), unit: 'tCO2e' },
        { label: 'Coverage of residual emissions', value: pct(retired, residual), unit: '%' },
        { label: 'Additional credits needed', value: round(shortfall, 2), unit: 'tCO2e', strong: true },
        { label: 'Status', value: ok ? 'Ready for verification' : 'Not yet carbon neutral', strong: true },
      ] },
      { title: 'Evidence checks', rows: [
        { label: 'Credits not yet retired', value: round(pending, 2), unit: 'tCO2e', note: 'Retire on the registry and upload the retirement certificate.' },
        { label: 'Credit rows missing a serial number', value: missingSerial },
        { label: 'Reductions achieved in the period', value: round(n(f.reductions_t), 2), unit: 'tCO2e' },
      ] },
    ];
  },
};
export default cna;
