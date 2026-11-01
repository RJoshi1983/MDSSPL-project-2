import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, pct, round, rows } from '@/lib/calc';
import { FACTORS } from '@/lib/factors';

const ROUTES = ['Recycled', 'Reused', 'Composted', 'Co-processed', 'Incinerated (energy recovery)', 'Incinerated (no recovery)', 'Landfilled'];
const STREAM_COLUMNS = [
  { key: 'stream', label: 'Waste stream', type: 'text' as const },
  { key: 'route', label: 'Disposal route', type: 'select' as const, options: ROUTES },
  { key: 'kg', label: 'Quantity', type: 'number' as const, unit: 'kg' },
];

const zwtl: ServiceModule = {
  id: 'zwtl',
  name: 'Zero Waste to Landfill',
  short: 'ZWTL',
  colorToken: 'svc-zwtl',
  summary: 'Hazardous and non-hazardous waste streams, diversion rate and landfill emissions.',
  standards: ['Zero-waste-to-landfill diversion criteria', 'Hazardous and Other Wastes Rules, 2016', 'GHG Protocol Scope 3 Category 5'],
  steps: [
    { id: 'general', title: 'Organisation and reporting year', fields: [
      ...GENERAL_FIELDS,
      { key: 'industry', label: 'Industry', type: 'select', options: ['Automotive', 'Chemicals', 'Food processing', 'Pharmaceuticals', 'Textiles', 'Electronics', 'Commercial building', 'Other'] },
      { key: 'frequency', label: 'Data entry frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'] },
    ] },
    { id: 'nonhaz', title: 'Non-hazardous waste', intro: 'One row per stream and route, totalled for the reporting year (e.g. "Cardboard — Recycled — 12,400 kg").', fields: [
      { key: 'streams', label: 'Non-hazardous streams', type: 'table', columns: STREAM_COLUMNS },
    ] },
    { id: 'haz', title: 'Hazardous waste', intro: 'Use the categories on your hazardous waste authorisation (Form 4 returns).', fields: [
      { key: 'streams', label: 'Hazardous streams', type: 'table', columns: STREAM_COLUMNS },
    ] },
  ],
  calculate(d) {
    const all: Record<string, any>[] = [...rows(d.nonhaz, 'streams').map((r) => ({ ...r, h: false })), ...rows(d.haz, 'streams').map((r) => ({ ...r, h: true }))];
    const total = all.reduce((a, r) => a + n(r.kg), 0);
    const by = (route: string) => all.filter((r) => r.route === route).reduce((a, r) => a + n(r.kg), 0);
    const landfill = by('Landfilled');
    const noRecovery = by('Incinerated (no recovery)');
    const diverted = total - landfill - noRecovery;
    const rate = pct(diverted, total);
    const level = rate >= 99 ? 'Meets 99%+ diversion' : rate >= 90 ? '90–99% diversion' : 'Below 90% diversion';
    const emissions = landfill * FACTORS.waste_landfill.value + (by('Recycled') + by('Reused')) * FACTORS.waste_recycled.value + (by('Co-processed') + by('Incinerated (energy recovery)') + noRecovery) * FACTORS.waste_incinerated.value;
    return [
      { title: 'Diversion summary', rows: [
        { label: 'Total waste generated', value: round(total / 1000, 3), unit: 'tonnes' },
        { label: 'Hazardous', value: round(all.filter((r) => r.h).reduce((a, r) => a + n(r.kg), 0) / 1000, 3), unit: 'tonnes' },
        { label: 'Diverted from landfill', value: round(diverted / 1000, 3), unit: 'tonnes' },
        { label: 'Diversion rate', value: rate, unit: '%', strong: true },
        { label: 'Status', value: level, note: 'Thresholds are typical certification levels; confirm against the scheme you certify to.' },
      ] },
      { title: 'By disposal route', rows: ROUTES.map((r) => ({ label: r, value: round(by(r) / 1000, 3), unit: 'tonnes' })) },
      { title: 'Link to GHG Scope 3 (Category 5)', rows: [
        { label: 'Waste emissions', value: round(emissions / 1000, 3), unit: 'tCO2e', note: 'Copy the landfilled kg into the GHG service, Scope 3 step.' },
        { label: 'Landfilled quantity for GHG', value: round(landfill, 0), unit: 'kg' },
      ] },
    ];
  },
};
export default zwtl;
