import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(path.resolve(process.cwd(), 'src/styles/global.css'), 'utf8');

const tokens = new Map<string, string>();
for (const m of css.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/g)) {
  tokens.set(m[1], m[2].trim().toLowerCase().replace(/\s+/g, ' '));
}

const EXPECTED: Record<string, string> = {
  bg: '#081420',
  surface: '#0f2236',
  'surface-sunken': '#0b1a2a',
  'surface-hover': '#152c44',
  'surface-selected': '#1a3a5c',
  'surface-header': '#0a1826',
  border: '#24405c',
  'border-control': '#6c84a0',
  'border-strong': '#c9d6e3',
  ink: '#eef3f7',
  'ink-muted': '#a9b8c7',
  'ink-subtle': '#8fa1b4',
  'ink-disabled': '#5d7189',
  'ink-on-brand': '#ffffff',
  'ink-on-header-muted': '#93a8bd',
  link: '#7fb2e6',
  primary: '#2f6ba8',
  'primary-hover': '#255a8f',
  'primary-pressed': '#1f4f7f',
  'primary-soft': '#14304d',
  'on-primary-soft': '#cfe1f4',
  'focus-ring': '#7fb2e6',
  danger: '#ff8b7e',
  'danger-soft': '#3b1512',
  'danger-border': '#ff8b7e',
  warning: '#fbbf24',
  'warning-soft': '#3a2a07',
  success: '#5fd3ad',
  'success-soft': '#0f3329',
  info: '#7fb2e6',
  'info-soft': '#13304e',
  'header-hover': 'rgb(255 255 255 / 0.08)',
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function ratio(fg: string, bg: string): number {
  const f = tokens.get(fg);
  const b = tokens.get(bg);
  if (!f || !b) throw new Error(`Token inexistente: ${fg} o ${bg}`);
  return contrast(f, b);
}

describe('tokens del sistema de diseño', () => {
  it('cada token del DS existe con su valor exacto', () => {
    for (const [name, value] of Object.entries(EXPECTED)) {
      expect(tokens.get(name), name).toBe(value);
    }
  });

  it('no quedan tokens viejos', () => {
    for (const name of ['text', 'muted', 'accent', 'accent-soft', 'surface-2', 'bg-deep', 'field-border']) {
      expect(tokens.has(name), name).toBe(false);
    }
  });

  it('el texto tiene contraste de al menos 4.5:1', () => {
    const pairs: [string, string][] = [
      ['ink', 'bg'],
      ['ink', 'surface'],
      ['ink', 'surface-selected'],
      ['ink-muted', 'bg'],
      ['ink-muted', 'surface'],
      ['ink-muted', 'surface-sunken'],
      ['ink-muted', 'surface-selected'],
      ['ink-subtle', 'surface'],
      ['link', 'bg'],
      ['link', 'surface'],
      ['link', 'surface-sunken'],
      ['info', 'info-soft'],
      ['success', 'surface'],
      ['success', 'bg'],
      ['danger', 'surface'],
      ['danger', 'danger-soft'],
      ['ink-on-brand', 'primary'],
      ['ink-on-brand', 'primary-hover'],
      ['ink-on-brand', 'surface-header'],
      ['ink-on-header-muted', 'surface-header'],
      ['on-primary-soft', 'primary-soft'],
    ];
    for (const [fg, bg] of pairs) {
      expect(ratio(fg, bg), `${fg}/${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('los controles tienen contraste de al menos 3:1', () => {
    const pairs: [string, string][] = [
      ['border-control', 'surface'],
      ['border-control', 'bg'],
      ['focus-ring', 'surface'],
      ['focus-ring', 'bg'],
      ['focus-ring', 'surface-header'],
    ];
    for (const [fg, bg] of pairs) {
      expect(ratio(fg, bg), `${fg}/${bg}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('define los radios del DS', () => {
    expect(css).toContain('--radius-sm: 6px');
    expect(css).toContain('--radius-md: 10px');
    expect(css).toContain('--radius-lg: 16px');
  });

  it('define las fuentes del DS', () => {
    expect(css).toContain("--font-sans: 'IBM Plex Sans'");
    expect(css).toContain("--font-display: 'Plus Jakarta Sans Variable'");
  });

  it('declara la base oscura y la barra de scroll', () => {
    expect(css).toContain('color-scheme: dark');
    expect(css).toContain('@utility scrollbar-ds');
  });
});
