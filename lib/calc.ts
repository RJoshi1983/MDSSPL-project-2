// Small helpers shared by the service calculations.
import type { Field, StepData } from './types';

/** Read a value as a number; blanks and text become 0. */
export function n(v: unknown): number {
  const x = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(x) ? x : 0;
}

/** Rows of a table field (always an array). */
export function rows(step: StepData | undefined, key: string): Record<string, any>[] {
  const r = step?.[key];
  return Array.isArray(r) ? r : [];
}

export function round(x: number, dp = 2): number {
  const f = Math.pow(10, dp);
  return Math.round(x * f) / f;
}

export function pct(part: number, whole: number): number {
  return whole > 0 ? round((part / whole) * 100, 1) : 0;
}

export const FINANCIAL_YEARS = ['FY 2022-23', 'FY 2023-24', 'FY 2024-25', 'FY 2025-26', 'FY 2026-27', 'FY 2027-28'];

/** The first step every service shares: who, where, which year. */
export const GENERAL_FIELDS: Field[] = [
  { key: 'organisation', label: 'Organisation name', type: 'text', required: true },
  { key: 'facility', label: 'Facility / unit name', type: 'text', hint: 'Use "All facilities" for a company-wide project.' },
  { key: 'location', label: 'Location (city, state)', type: 'text' },
  { key: 'financial_year', label: 'Reporting year', type: 'select', options: FINANCIAL_YEARS, required: true },
  { key: 'contact', label: 'Contact person and email', type: 'text' },
];
