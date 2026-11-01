import type { CSSProperties } from 'react';
import type { ServiceModule } from './types';

/** CSS variables that colour a block in a service's colour. */
export function svcStyle(s: Pick<ServiceModule, 'colorToken'> | undefined): CSSProperties {
  const t = s?.colorToken || 'brand';
  return { ['--c' as any]: `var(--${t})`, ['--cs' as any]: `var(--${t}-soft)` } as CSSProperties;
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}
