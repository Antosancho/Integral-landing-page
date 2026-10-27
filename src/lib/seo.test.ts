import { describe, expect, it } from 'vitest';
import { SITE } from '../config/site';
import { faq } from '../data/faq';
import { buildJsonLd } from './seo';

type Node = Record<string, unknown> & { '@type': string };

function graph(site: Parameters<typeof buildJsonLd>[0]): Node[] {
  return buildJsonLd(site, faq)['@graph'] as Node[];
}

describe('buildJsonLd', () => {
  it('tiene los 3 tipos', () => {
    expect(graph(SITE).map((n) => n['@type'])).toEqual(['ProfessionalService', 'WebSite', 'FAQPage']);
  });

  it('sin telephone cuando whatsapp es null', () => {
    const business = graph(SITE)[0]!;
    expect('telephone' in business).toBe(false);
  });

  it('con telephone cuando hay whatsapp', () => {
    const business = graph({ ...SITE, whatsapp: '5493464123456' })[0]!;
    expect(business.telephone).toBe('+5493464123456');
  });

  it('FAQPage tiene una pregunta por FAQ', () => {
    const page = graph(SITE)[2]!;
    expect((page.mainEntity as unknown[]).length).toBe(faq.length);
  });

  it('image es absoluta', () => {
    expect(graph(SITE)[0]!.image).toBe('https://factorintegral.ar/og-image.png');
  });

  it('es serializable', () => {
    expect(() => JSON.stringify(buildJsonLd(SITE, faq))).not.toThrow();
  });
});
