import { describe, expect, it } from 'vitest';
import { SITE } from '../config/site';
import { hero } from './hero';
import { areas } from './areas';
import { problema } from './problema';
import { calculadoraCopy, calculatorTasks } from './calculadora';
import { serviciosIntro, servicios } from './servicios';
import { rubrosIntro, rubros } from './rubros';
import { metodoIntro, steps } from './metodo';
import { caso } from './caso';
import { equipoIntro, team } from './equipo';
import { faqIntro, faq } from './faq';
import { contactoCopy } from './contacto';
import { footer } from './footer';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
}

const all = collectStrings([
  SITE,
  hero,
  areas,
  problema,
  calculadoraCopy,
  calculatorTasks,
  serviciosIntro,
  servicios,
  rubrosIntro,
  rubros,
  metodoIntro,
  steps,
  caso,
  equipoIntro,
  team,
  faqIntro,
  faq,
  contactoCopy,
  footer,
]);

const FORBIDDEN = [
  'gratis',
  'gratuit',
  'sin cargo',
  'factura electrónica',
  'facturación electrónica',
  'app móvil',
  'aplicación móvil',
  'desde el celular',
  'todo el país',
  'remoto',
  'testimonio',
  'garantizado',
  '[a confirmar]',
  'todo:',
  'lorem',
];

const SECTION_IDS = [
  'inicio',
  'problema',
  'calculadora',
  'servicios',
  'rubros',
  'metodo',
  'caso',
  'equipo',
  'preguntas',
  'contacto',
];

describe('reglas de contenido', () => {
  it('junta strings de todos los módulos', () => {
    expect(all.length).toBeGreaterThan(100);
  });

  it.each(FORBIDDEN)('ningún string contiene "%s"', (word) => {
    const hits = all.filter((s) => s.toLowerCase().includes(word));
    expect(hits).toEqual([]);
  });

  it('no menciona AFIP ni ARCA', () => {
    expect(all.filter((s) => /\b(afip|arca)\b/i.test(s))).toEqual([]);
  });

  it('calculatorTasks cumple la estructura', () => {
    expect(calculatorTasks).toHaveLength(7);
    expect(new Set(calculatorTasks.map((t) => t.id)).size).toBe(7);
    expect(calculatorTasks.map((t) => t.minutes)).toEqual([5, 8, 3, 6, 20, 30, 20]);
    expect(calculatorTasks.filter((t) => t.defaultChecked).map((t) => t.id)).toEqual([
      'facturas',
      'control-boletas',
      'consultas',
    ]);
  });

  it('cantidades de ítems', () => {
    expect(servicios).toHaveLength(3);
    expect(servicios.map((s) => s.code)).toEqual(['s/01', 's/02', 's/03']);
    servicios.forEach((s) => expect(s.includes).toHaveLength(3));
    expect(rubros).toHaveLength(6);
    expect(steps.map((s) => s.number)).toEqual(['01', '02', '03', '04']);
    expect(team).toHaveLength(2);
    expect(faq).toHaveLength(6);
    expect(areas).toHaveLength(8);
    expect(problema.leaks).toHaveLength(7);
  });

  it('el caso real está desactivado', () => {
    expect(caso.enabled).toBe(false);
  });

  it('whatsapp todavía no está definido', () => {
    expect(SITE.whatsapp).toBeNull();
  });

  it('la navegación apunta a ids existentes', () => {
    for (const item of SITE.nav) {
      expect(item.href.startsWith('#')).toBe(true);
      expect(SECTION_IDS).toContain(item.href.slice(1));
    }
  });

  it('largos de title y description', () => {
    expect(SITE.description.length).toBeGreaterThanOrEqual(70);
    expect(SITE.description.length).toBeLessThanOrEqual(160);
    expect(SITE.title.length).toBeGreaterThanOrEqual(30);
    expect(SITE.title.length).toBeLessThanOrEqual(75);
  });
});
