// The list of services, in the order used everywhere in the app.
// To add a service: create modules/<id>/index.ts and add it here.
import type { ServiceModule } from '@/lib/types';
import ghg from './ghg';
import esg from './esg';
import brsr from './brsr';
import zwtl from './zwtl';
import lca from './lca-pcf';
import water from './water';
import cna from './cna';
import netZero from './net-zero';
import energy from './energy';

export const SERVICES: ServiceModule[] = [ghg, esg, brsr, zwtl, lca, water, cna, netZero, energy];

export function getService(id: string): ServiceModule | undefined {
  return SERVICES.find((s) => s.id === id);
}
