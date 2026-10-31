import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOTS = ['src/components', 'src/layouts', 'src/pages'];

// Archivos de UI (sin tests) que tienen que respetar el sistema de diseño de Integral.
const files = ROOTS.flatMap((root) =>
  readdirSync(path.resolve(process.cwd(), root), { recursive: true })
    .map((f) => path.join(root, String(f)).replace(/\\/g, '/'))
    .filter((f) => /\.(astro|tsx|ts)$/.test(f) && !/\.test\.tsx?$/.test(f)),
).map((file) => ({ file, source: readFileSync(path.resolve(process.cwd(), file), 'utf8') }));

const FORBIDDEN: Array<[string, RegExp]> = [
  [
    'clases de tokens viejos',
    /\b(?:text|bg|border|accent|outline|ring|from|to)-(?:text|muted|accent|accent-soft|surface-2|bg-deep|field-border)\b/,
  ],
  ['text-bg / bg-text', /\b(?:text-bg|bg-text)\b/],
  ['radios fuera del DS', /\brounded-(?:xl|2xl|3xl)\b/],
  ['fuente mono', /\bfont-mono\b/],
  ['gradientes', /gradient/],
  [
    'tonos de fondo fuera de la paleta reducida',
    /\b(?:bg|disabled:bg|disabled:hover:bg|focus:bg)-(?:surface-sunken|surface-selected|primary-soft|info-soft|primary)\b/,
  ],
  ['prop tone de Section', /tone="deep"/],
  ['colores hex sueltos', /(?<![\w&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/],
  ['funciones de color sueltas', /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/],
  ['opacidad sobre texto (rompe el contraste medido)', /\bopacity-\d+\b/],
  [
    'w-full junto a otro ancho',
    /(?<![\w-])w-full\b[^'"`]*(?<![\w-])w-(?!full\b)[\w.[\]-]+|(?<![\w-])w-(?!full\b)[\w.[\]-]+[^'"`]*(?<![\w-])w-full\b/,
  ],
  [
    'paleta por defecto de Tailwind',
    /\b(?:bg|text|border)-(?:white|black|gray|slate|zinc|neutral|red|blue|sky|green)(?:-\d{2,3})?\b/,
  ],
];

const ROUNDED_FULL_ALLOWED = ['Avatar.astro', 'Header.astro', 'FloatingCTA.astro', 'BaseLayout.astro', 'classes.ts'];

describe('uso del sistema de diseño en componentes', () => {
  it('encuentra archivos para revisar', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const [name, re] of FORBIDDEN) {
    it(`sin ${name}`, () => {
      const hits = files.flatMap(({ file, source }) => {
        const m = source.match(re);
        return m ? [`${file}: ${m[0]}`] : [];
      });
      expect(hits).toEqual([]);
    });
  }

  it('rounded-full solo en botones, avatar y nav del header', () => {
    const hits = files
      .filter(({ source }) => /\brounded-full\b/.test(source))
      .map(({ file }) => path.basename(file))
      .filter((name) => !ROUNDED_FULL_ALLOWED.includes(name));
    expect(hits).toEqual([]);
  });

  it('los botones son píldora y los campos usan rounded-field', () => {
    const classes = files.find(({ file }) => file.endsWith('ui/classes.ts'));
    expect(classes).toBeDefined();
    expect(classes?.source).toMatch(/buttonBase =\s*'[^']*\brounded-full\b/);
    expect(classes?.source).toMatch(/fieldBase =\s*'[^']*\brounded-field\b/);
  });
});
