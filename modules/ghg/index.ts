import type { ServiceModule } from '@/lib/types';
import { GENERAL_FIELDS, n, rows, round } from '@/lib/calc';
import { FACTORS, GWP, REFRIGERANTS } from '@/lib/factors';

const t = (kg: number) => round(kg / 1000, 3); // kg -> tonnes

const ghg: ServiceModule = {
  id: 'ghg',
  name: 'GHG Accounting',
  short: 'GHG',
  colorToken: 'svc-ghg',
  summary: 'Scope 1, 2 and 3 greenhouse gas inventory for one or many facilities.',
  standards: ['GHG Protocol Corporate Standard', 'ISO 14064-1', 'DEFRA / CEA / IPCC factors'],
  steps: [
    { id: 'general', title: 'Organisation and reporting year', fields: GENERAL_FIELDS },
    {
      id: 'scope1',
      title: 'Scope 1 — Direct emissions',
      intro: 'Fuels burned and refrigerant leaks at sites you own or control. Enter totals for the reporting year.',
      fields: [
        { key: 'diesel', label: 'Diesel (generators, boilers, vehicles)', type: 'number', unit: 'litres' },
        { key: 'petrol', label: 'Petrol (company vehicles)', type: 'number', unit: 'litres' },
        { key: 'lpg', label: 'LPG', type: 'number', unit: 'litres' },
        { key: 'natural_gas', label: 'Natural gas / PNG', type: 'number', unit: 'm³' },
        { key: 'coal', label: 'Coal', type: 'number', unit: 'kg' },
        {
          key: 'refrigerants',
          label: 'Refrigerant top-ups (leaks)',
          type: 'table',
          hint: 'Add one row per gas refilled during the year.',
          columns: [
            { key: 'gas', label: 'Gas', type: 'select', options: REFRIGERANTS },
            { key: 'kg', label: 'Quantity refilled', type: 'number', unit: 'kg' },
          ],
        },
      ],
    },
    {
      id: 'scope2',
      title: 'Scope 2 — Purchased electricity',
      intro: 'Take these from your electricity bills.',
      fields: [
        { key: 'grid_kwh', label: 'Grid electricity purchased', type: 'number', unit: 'kWh' },
        { key: 'renewable_kwh', label: 'Of which renewable (green tariff / PPA / RECs)', type: 'number', unit: 'kWh', hint: 'Counted as zero in the market-based total.' },
      ],
    },
    {
      id: 'scope3',
      title: 'Scope 3 — Value chain (selected categories)',
      fields: [
        { key: 'flight_km', label: 'Business travel — domestic flights', type: 'number', unit: 'passenger-km' },
        { key: 'car_km', label: 'Business travel — car / taxi', type: 'number', unit: 'km' },
        { key: 'commute_bus_km', label: 'Employee commuting — bus', type: 'number', unit: 'passenger-km' },
        { key: 'commute_rail_km', label: 'Employee commuting — rail', type: 'number', unit: 'passenger-km' },
        { key: 'freight_tkm', label: 'Upstream transport of goods', type: 'number', unit: 'tonne-km' },
        { key: 'waste_landfill_kg', label: 'Waste sent to landfill', type: 'number', unit: 'kg', hint: 'If you use the ZWTL service, use its landfill total here.' },
        { key: 'waste_recycled_kg', label: 'Waste recycled', type: 'number', unit: 'kg' },
      ],
    },
  ],
  calculate(d) {
    const s1 = d.scope1 || {};
    const s2 = d.scope2 || {};
    const s3 = d.scope3 || {};
    const fuel = (k: string) => n(s1[k]) * FACTORS[k].value;
    const refrig = rows(s1, 'refrigerants').reduce((a, r) => a + n(r.kg) * (GWP[r.gas] ?? 0), 0);
    const scope1 = fuel('diesel') + fuel('petrol') + fuel('lpg') + fuel('natural_gas') + fuel('coal') + refrig;
    const loc = n(s2.grid_kwh) * FACTORS.grid_india.value;
    const mkt = Math.max(0, n(s2.grid_kwh) - n(s2.renewable_kwh)) * FACTORS.grid_india.value;
    const c6 = n(s3.flight_km) * FACTORS.flight_domestic.value + n(s3.car_km) * FACTORS.car_average.value;
    const c7 = n(s3.commute_bus_km) * FACTORS.bus.value + n(s3.commute_rail_km) * FACTORS.rail.value;
    const c4 = n(s3.freight_tkm) * FACTORS.road_freight.value;
    const c5 = n(s3.waste_landfill_kg) * FACTORS.waste_landfill.value + n(s3.waste_recycled_kg) * FACTORS.waste_recycled.value;
    const scope3 = c4 + c5 + c6 + c7;
    return [
      {
        title: 'Summary',
        rows: [
          { label: 'Scope 1', value: t(scope1), unit: 'tCO2e' },
          { label: 'Scope 2 (location-based)', value: t(loc), unit: 'tCO2e' },
          { label: 'Scope 2 (market-based)', value: t(mkt), unit: 'tCO2e' },
          { label: 'Scope 3 (selected categories)', value: t(scope3), unit: 'tCO2e' },
          { label: 'Total (Scope 1 + 2 location + 3)', value: t(scope1 + loc + scope3), unit: 'tCO2e', strong: true },
        ],
      },
      {
        title: 'Scope 1 detail',
        rows: [
          { label: 'Diesel', value: t(fuel('diesel')), unit: 'tCO2e', note: FACTORS.diesel.source },
          { label: 'Petrol', value: t(fuel('petrol')), unit: 'tCO2e', note: FACTORS.petrol.source },
          { label: 'LPG', value: t(fuel('lpg')), unit: 'tCO2e', note: FACTORS.lpg.source },
          { label: 'Natural gas', value: t(fuel('natural_gas')), unit: 'tCO2e', note: FACTORS.natural_gas.source },
          { label: 'Coal', value: t(fuel('coal')), unit: 'tCO2e', note: FACTORS.coal.source },
          { label: 'Refrigerants', value: t(refrig), unit: 'tCO2e', note: 'IPCC AR5 GWP-100' },
        ],
      },
      {
        title: 'Scope 3 detail',
        rows: [
          { label: 'Cat. 4 Upstream transport', value: t(c4), unit: 'tCO2e' },
          { label: 'Cat. 5 Waste generated in operations', value: t(c5), unit: 'tCO2e' },
          { label: 'Cat. 6 Business travel', value: t(c6), unit: 'tCO2e' },
          { label: 'Cat. 7 Employee commuting', value: t(c7), unit: 'tCO2e' },
        ],
      },
    ];
  },
};
export default ghg;
