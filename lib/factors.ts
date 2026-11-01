// EMISSION FACTOR TABLE — EXAMPLE VALUES
// -----------------------------------------------------------------------------
// These are typical published values used so the app works out of the box.
// BEFORE USING RESULTS IN A CLIENT REPORT, check each one against the latest
// edition of its source (DEFRA/DESNZ conversion factors, CEA CO2 baseline
// database for the Indian grid, IPCC AR5/AR6 GWPs) and update the number here.
// Every report shows the factor used and its source, so changes are traceable.
// -----------------------------------------------------------------------------

export interface Factor {
  value: number; // kg CO2e per unit
  unit: string; // the activity unit
  source: string;
}

export const FACTORS: Record<string, Factor> = {
  // Scope 1 — fuels
  diesel: { value: 2.66, unit: 'litre', source: 'DEFRA (diesel, 100% mineral) — verify latest' },
  petrol: { value: 2.35, unit: 'litre', source: 'DEFRA (petrol, 100% mineral) — verify latest' },
  lpg: { value: 1.56, unit: 'litre', source: 'DEFRA (LPG) — verify latest' },
  natural_gas: { value: 2.04, unit: 'm³', source: 'DEFRA (natural gas) — verify latest' },
  coal: { value: 2.4, unit: 'kg', source: 'DEFRA (coal, industrial) — verify latest' },
  // Scope 2 — electricity
  grid_india: { value: 0.727, unit: 'kWh', source: 'CEA CO2 Baseline Database (India grid) — verify latest version' },
  // Scope 3
  flight_domestic: { value: 0.246, unit: 'passenger-km', source: 'DEFRA (domestic flight, with RF) — verify latest' },
  car_average: { value: 0.17, unit: 'km', source: 'DEFRA (average car) — verify latest' },
  bus: { value: 0.1, unit: 'passenger-km', source: 'DEFRA (local bus) — verify latest' },
  rail: { value: 0.035, unit: 'passenger-km', source: 'DEFRA (national rail) — verify latest' },
  road_freight: { value: 0.107, unit: 'tonne-km', source: 'DEFRA (HGV, average laden) — verify latest' },
  waste_landfill: { value: 0.467, unit: 'kg', source: 'DEFRA (commercial & industrial waste to landfill) — verify latest' },
  waste_recycled: { value: 0.021, unit: 'kg', source: 'DEFRA (closed-loop / open-loop recycling) — verify latest' },
  waste_incinerated: { value: 0.021, unit: 'kg', source: 'DEFRA (combustion / co-processing) — verify latest' },
  water_supply: { value: 0.149, unit: 'm³', source: 'DEFRA (water supply) — verify latest' },
  water_treatment: { value: 0.272, unit: 'm³', source: 'DEFRA (water treatment) — verify latest' },
};

/** Global warming potentials (100-year). IPCC AR5 values — switch to AR6 if your programme requires it. */
export const GWP: Record<string, number> = {
  'R-410A': 2088,
  'R-134a': 1430,
  'R-32': 675,
  'R-22': 1810,
  'R-404A': 3922,
  'CO2': 1,
};

export const REFRIGERANTS = Object.keys(GWP);
