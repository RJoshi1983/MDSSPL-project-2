import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, pct, round, rows } from '@/lib/calc';
import { FACTORS } from '@/lib/factors';

const water: ServiceModule = {
  id: 'water',
  name: 'Water Audit',
  short: 'Water',
  colorToken: 'svc-water',
  summary: 'Water balance from source to discharge, losses, reuse and improvement areas.',
  standards: ['Water balance method (sources → uses → treatment → reuse → discharge)', 'CGWA / CPCB norms as applicable'],
  steps: [
    { id: 'general', title: 'Organisation and reporting year', fields: GENERAL_FIELDS },
    { id: 'sources', title: 'Water sources (inflow)', fields: [
      { key: 'sources', label: 'Sources', type: 'table', hint: 'One row per source; annual totals.', columns: [
        { key: 'source', label: 'Source', type: 'select', options: ['Borewell / groundwater', 'Municipal supply', 'Tanker', 'Surface water', 'Rainwater harvested', 'Third-party treated water'] },
        { key: 'm3', label: 'Volume', type: 'number', unit: 'm³' },
        { key: 'metered', label: 'Metered?', type: 'select', options: ['Yes', 'No — estimated'] },
      ] },
    ] },
    { id: 'uses', title: 'Water uses', fields: [
      { key: 'uses', label: 'Uses', type: 'table', columns: [
        { key: 'use', label: 'Use', type: 'select', options: ['Process', 'Cooling tower', 'Boiler feed', 'Domestic / canteen', 'Gardening', 'Washing', 'Other'] },
        { key: 'm3', label: 'Volume', type: 'number', unit: 'm³' },
      ] },
    ] },
    { id: 'outflow', title: 'Treatment, reuse and discharge', fields: [
      { key: 'treated_m3', label: 'Wastewater treated (ETP / STP)', type: 'number', unit: 'm³' },
      { key: 'reused_m3', label: 'Treated water reused / recycled', type: 'number', unit: 'm³' },
      { key: 'discharged_m3', label: 'Discharged outside the site', type: 'number', unit: 'm³' },
      { key: 'evaporation_m3', label: 'Evaporation and losses in products', type: 'number', unit: 'm³' },
      { key: 'production', label: 'Production in the year', type: 'number', hint: 'Used for specific water consumption.' },
      { key: 'production_unit', label: 'Production unit', type: 'text', hint: 'e.g. tonnes, pieces.' },
      { key: 'notes', label: 'Observations and improvement ideas', type: 'textarea' },
    ] },
  ],
  calculate(d) {
    const inflow = rows(d.sources, 'sources').reduce((a, r) => a + n(r.m3), 0);
    const unmetered = rows(d.sources, 'sources').filter((r) => r.metered !== 'Yes').reduce((a, r) => a + n(r.m3), 0);
    const used = rows(d.uses, 'uses').reduce((a, r) => a + n(r.m3), 0);
    const o = d.outflow || {};
    const fresh = Math.max(0, inflow);
    const out = n(o.discharged_m3) + n(o.evaporation_m3);
    const unaccounted = fresh + n(o.reused_m3) - used;
    const consumption = fresh - n(o.discharged_m3);
    const prod = n(o.production);
    const recs: string[] = [];
    if (pct(Math.abs(unaccounted), fresh) > 10) recs.push('Unaccounted water above 10%: install sub-meters on main headers and check for leaks.');
    if (pct(unmetered, inflow) > 20) recs.push('More than 20% of inflow is unmetered: add flow meters at each source.');
    if (pct(n(o.reused_m3), fresh) < 20) recs.push('Reuse below 20%: consider reusing treated water for gardening, flushing and cooling tower make-up.');
    if (!rows(d.sources, 'sources').some((r) => r.source === 'Rainwater harvested')) recs.push('No rainwater harvesting recorded: assess roof area for harvesting and recharge.');
    return [
      { title: 'Water balance', rows: [
        { label: 'Total fresh water inflow', value: round(fresh, 1), unit: 'm³' },
        { label: 'Total use (all purposes)', value: round(used, 1), unit: 'm³' },
        { label: 'Treated water reused', value: round(n(o.reused_m3), 1), unit: 'm³' },
        { label: 'Discharge + evaporation', value: round(out, 1), unit: 'm³' },
        { label: 'Net water consumption', value: round(consumption, 1), unit: 'm³', strong: true },
        { label: 'Unaccounted water (inflow + reuse − use)', value: round(unaccounted, 1), unit: 'm³', note: pct(Math.abs(unaccounted), fresh) + '% of inflow' },
      ] },
      { title: 'Indicators', rows: [
        { label: 'Reuse rate', value: pct(n(o.reused_m3), fresh), unit: '%' },
        { label: 'Unmetered share of inflow', value: pct(unmetered, inflow), unit: '%' },
        { label: 'Specific water consumption', value: prod > 0 ? round(consumption / prod, 3) : '—', unit: 'm³ / ' + (o.production_unit || 'unit') },
        { label: 'Emissions from supply and treatment', value: round((fresh * FACTORS.water_supply.value + n(o.treated_m3) * FACTORS.water_treatment.value) / 1000, 3), unit: 'tCO2e' },
      ] },
      { title: 'Improvement areas (auto-generated)', rows: recs.length ? recs.map((r, i) => ({ label: `${i + 1}.`, value: r })) : [{ label: '—', value: 'No automatic flags. Add your own in the notes.' }] },
    ];
  },
};
export default water;
