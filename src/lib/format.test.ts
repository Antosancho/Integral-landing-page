import { describe, expect, it } from 'vitest';
import { formatARS, formatARSWithCents, formatHours, formatInteger } from './format';

describe('format', () => {
  it('formatARS', () => {
    expect(formatARS(378875)).toBe('$ 378.875');
    expect(formatARS(189437.5)).toBe('$ 189.438');
    expect(formatARS(4546500)).toBe('$ 4.546.500');
    expect(formatARS(0)).toBe('$ 0');
    expect(formatARS(NaN)).toBe('$ 0');
    expect(formatARS(-5)).toBe('$ 0');
  });

  it('formatARSWithCents', () => {
    expect(formatARSWithCents(378875.5)).toBe('$ 378.875,50');
    expect(formatARSWithCents(0)).toBe('$ 0,00');
  });

  it('formatHours', () => {
    expect(formatHours(50.516666)).toBe('50,5');
    expect(formatHours(0)).toBe('0,0');
  });

  it('formatInteger', () => {
    expect(formatInteger(1200000)).toBe('1.200.000');
  });
});
