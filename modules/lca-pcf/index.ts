import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, pct, round, rows } from '@/lib/calc';
import { FACTORS } from '@/lib/factors';

const BOUNDARIES = ['Cradle-to-gate', 'Gate-to-gate', 'Cradle-to-grave', 'Cradle-to-cradle', 'Gate-to-grave'];
const STAGES = ['A1 Raw material supply', 'A2 Transport to factory', 'A3 Manufacturing', 'A4 Transport to customer', 'B Use stage', 'C End of life', 'D Benefits beyond the system'];

const lca: ServiceModule = {
  id: 'lca-pcf',
  name: 'Life Cycle Assessment / Product Carbon Footprint',
  short: 'LCA / PCF',
  colorToken: 'svc-lca-pcf',
  summary: 'Product footprint per functional unit, by life cycle stage, mapped to the EPD structure.',
  standards: ['ISO 14040 / 14044', 'ISO 14067', 'EN 15804 stage structure (EPD)'],
  steps: [
    { id: 'general', title: 'Organisation and reporting year', fields: GENERAL_FIELDS },
    { id: 'scope', title: 'Goal and scope', fields: [
      { key: 'product', label: 'Product name', type: 'text', required: true },
      { key: 'functional_unit', label: 'Functional unit', type: 'text', hint: 'e.g. "1 tonne of finished steel coil" or "1 m² of floor tile".' },
      { key: 'units_produced', label: 'Functional units produced in the year', type: 'number', hint: 'Used to divide annual totals down to one functional unit.' },
      { key: 'boundary', label: 'System boundary', type: 'select', options: BOUNDARIES },
      { key: 'method', label: 'Impact method', type: 'select', options: ['IPCC GWP100 (AR5)', 'IPCC GWP100 (AR6)', 'EF 3.1'] },
    ] },
    { id: 'materials', title: 'A1 — Raw materials', fields: [
      { key: 'materials', label: 'Materials (annual totals)', type: 'table', columns: [
        { key: 'material', label: 'Material', type: 'text' },
        { key: 'kg', label: 'Quantity', type: 'number', unit: 'kg' },
        { key: 'ef', label: 'Emission factor', type: 'number', unit: 'kgCO2e/kg' },
        { key: 'source', label: 'Factor source', type: 'text' },
      ] },
    ] },
    { id: 'process', title: 'A2–A4 — Transport and manufacturing', fields: [
      { key: 'inbound_tkm', label: 'A2 Inbound transport', type: 'number', unit: 'tonne-km' },
      { key: 'electricity_kwh', label: 'A3 Electricity', type: 'number', unit: 'kWh' },
      { key: 'diesel_l', label: 'A3 Diesel', type: 'number', unit: 'litres' },
      { key: 'gas_m3', label: 'A3 Natural gas', type: 'number', unit: 'm³' },
      { key: 'outbound_tkm', label: 'A4 Outbound transport', type: 'number', unit: 'tonne-km' },
    ] },
    { id: 'later', title: 'B–D — Use, end of life and benefits', intro: 'Only needed for boundaries beyond the factory gate. Enter annual totals in kgCO2e.', fields: [
      { key: 'use_kg', label: 'B Use stage', type: 'number', unit: 'kgCO2e' },
      { key: 'eol_kg', label: 'C End of life', type: 'number', unit: 'kgCO2e' },
      { key: 'benefit_kg', label: 'D Recycling credit (enter as a positive number)', type: 'number', unit: 'kgCO2e' },
    ] },
  ],
  calculate(d) {
    const s = d.scope || {}, p = d.process || {}, l = d.later || {};
    const a1 = rows(d.materials, 'materials').reduce((a, r) => a + n(r.kg) * n(r.ef), 0);
    const a2 = n(p.inbound_tkm) * FACTORS.road_freight.value;
    const a3 = n(p.electricity_kwh) * FACTORS.grid_india.value + n(p.diesel_l) * FACTORS.diesel.value + n(p.gas_m3) * FACTORS.natural_gas.value;
    const a4 = n(p.outbound_tkm) * FACTORS.road_freight.value;
    const b = n(l.use_kg), c = n(l.eol_kg), dd = -n(l.benefit_kg);
    const boundary: string = s.boundary || 'Cradle-to-gate';
    const stageVals = [a1, a2, a3, a4, b, c, dd];
    const inScope = (i: number) => {
      if (boundary === 'Gate-to-gate') return i === 2;
      if (boundary === 'Cradle-to-gate') return i <= 2;
      if (boundary === 'Gate-to-grave') return i >= 2 && i <= 5;
      if (boundary === 'Cradle-to-grave') return i <= 5;
      return true; // cradle-to-cradle includes module D
    };
    const total = stageVals.reduce((a, v, i) => a + (inScope(i) ? v : 0), 0);
    const units = n(s.units_produced);
    return [
      { title: 'Product carbon footprint', rows: [
        { label: 'Product', value: s.product || '—' },
        { label: 'Boundary', value: boundary },
        { label: 'Annual footprint (in boundary)', value: round(total / 1000, 3), unit: 'tCO2e' },
        { label: 'Footprint per functional unit', value: units > 0 ? round(total / units, 3) : '—', unit: 'kgCO2e / ' + (s.functional_unit || 'unit'), strong: true },
      ] },
      { title: 'By life cycle stage (EPD modules)', rows: STAGES.map((st, i) => ({
        label: st,
        value: inScope(i) ? round(stageVals[i] / 1000, 3) : 'Outside boundary',
        unit: inScope(i) ? 'tCO2e' : undefined,
        note: inScope(i) ? pct(stageVals[i], total) + '% of total' : undefined,
      })) },
    ];
  },
};
export default lca;
