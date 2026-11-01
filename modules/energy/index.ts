import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, pct, round, rows } from '@/lib/calc';
import { FACTORS } from '@/lib/factors';

const CATEGORIES = ['HVAC', 'Lighting', 'Compressed air', 'Pumps', 'Motors and drives', 'Boilers and thermal', 'Cooling towers', 'Other'];

const energy: ServiceModule = {
  id: 'energy',
  name: 'Energy Audit',
  short: 'EA',
  colorToken: 'svc-energy',
  summary: 'Equipment inventory, electricity bill analysis and energy conservation measures (ECMs).',
  standards: ['BEE energy audit guidelines', 'ASHRAE 90.1 / 62.1 (HVAC)', 'ISO 50002'],
  steps: [
    { id: 'general', title: 'Organisation and reporting year', fields: GENERAL_FIELDS },
    { id: 'bills', title: 'Electricity bills', fields: [
      { key: 'billed_kwh', label: 'Electricity billed in the year', type: 'number', unit: 'kWh' },
      { key: 'bill_amount', label: 'Total bill amount', type: 'number', unit: '₹' },
      { key: 'contract_kva', label: 'Contract demand', type: 'number', unit: 'kVA' },
      { key: 'max_kva', label: 'Highest recorded demand', type: 'number', unit: 'kVA' },
      { key: 'pf', label: 'Average power factor', type: 'number', hint: 'e.g. 0.95' },
    ] },
    { id: 'equipment', title: 'Equipment inventory', fields: [
      { key: 'equipment', label: 'Equipment', type: 'table', hint: 'One row per item or group of identical items.', columns: [
        { key: 'category', label: 'Category', type: 'select', options: CATEGORIES },
        { key: 'name', label: 'Equipment', type: 'text' },
        { key: 'qty', label: 'Quantity', type: 'number' },
        { key: 'kw', label: 'Rated power each', type: 'number', unit: 'kW' },
        { key: 'load', label: 'Average load', type: 'number', unit: '%' },
        { key: 'hours', label: 'Running hours a year', type: 'number' },
      ] },
    ] },
    { id: 'ecm', title: 'Energy conservation measures', fields: [
      { key: 'ecms', label: 'ECMs', type: 'table', columns: [
        { key: 'measure', label: 'Measure', type: 'text' },
        { key: 'category', label: 'Category', type: 'select', options: CATEGORIES },
        { key: 'kwh', label: 'Saving a year', type: 'number', unit: 'kWh' },
        { key: 'cost', label: 'Investment', type: 'number', unit: '₹' },
      ] },
    ] },
  ],
  calculate(d) {
    const b = d.bills || {};
    const eq = rows(d.equipment, 'equipment');
    const kwhOf = (r: any) => n(r.qty || 1) * n(r.kw) * (n(r.load || 100) / 100) * n(r.hours);
    const estimated = eq.reduce((a, r) => a + kwhOf(r), 0);
    const billed = n(b.billed_kwh);
    const tariff = billed > 0 ? n(b.bill_amount) / billed : 0;
    const ecms = rows(d.ecm, 'ecms');
    const savedKwh = ecms.reduce((a, r) => a + n(r.kwh), 0);
    const invest = ecms.reduce((a, r) => a + n(r.cost), 0);
    const savedRs = savedKwh * tariff;
    return [
      { title: 'Bill analysis', rows: [
        { label: 'Electricity billed', value: round(billed, 0), unit: 'kWh' },
        { label: 'Average tariff', value: round(tariff, 2), unit: '₹/kWh' },
        { label: 'Demand utilisation', value: n(b.contract_kva) ? pct(n(b.max_kva), n(b.contract_kva)) : '—', unit: n(b.contract_kva) ? '%' : undefined, note: n(b.contract_kva) && pct(n(b.max_kva), n(b.contract_kva)) < 75 ? 'Below 75%: consider reducing contract demand.' : undefined },
        { label: 'Power factor', value: n(b.pf) || '—', note: n(b.pf) && n(b.pf) < 0.95 ? 'Below 0.95: add capacitor banks / APFC panel.' : undefined },
        { label: 'Equipment estimate vs bill', value: pct(estimated, billed), unit: '%', note: 'Large gaps mean missing equipment or wrong running hours.' },
      ] },
      { title: 'Consumption by category (estimated)', rows: CATEGORIES.map((c) => {
        const k = eq.filter((r) => r.category === c).reduce((a, r) => a + kwhOf(r), 0);
        return { label: c, value: round(k, 0), unit: 'kWh', note: pct(k, estimated) + '%' };
      }).filter((r) => (r.value as number) > 0) },
      { title: 'Savings from ECMs', rows: [
        { label: 'Energy saved', value: round(savedKwh, 0), unit: 'kWh/yr', note: pct(savedKwh, billed) + '% of billed' },
        { label: 'Money saved', value: round(savedRs, 0), unit: '₹/yr' },
        { label: 'Investment', value: round(invest, 0), unit: '₹' },
        { label: 'Simple payback', value: savedRs > 0 ? round(invest / savedRs, 1) : '—', unit: 'years', strong: true },
        { label: 'Emissions avoided', value: round((savedKwh * FACTORS.grid_india.value) / 1000, 2), unit: 'tCO2e/yr' },
      ] },
      { title: 'ECM list', rows: ecms.map((r) => ({ label: r.measure || 'Measure', value: tariff && n(r.kwh) ? `${round(n(r.cost) / (n(r.kwh) * tariff), 1)} yr payback` : '—', note: r.category })) },
    ];
  },
};
export default energy;
