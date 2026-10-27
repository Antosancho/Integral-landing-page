import { describe, expect, it } from 'vitest';
import { buildMailtoUrl, buildWhatsAppUrl, normalizePhone } from './contact';

describe('contact', () => {
  it('normalizePhone deja solo dígitos', () => {
    expect(normalizePhone('+54 9 3464 12-3456')).toBe('5493464123456');
  });

  it('buildWhatsAppUrl', () => {
    expect(buildWhatsAppUrl(null)).toBeNull();
    expect(buildWhatsAppUrl('abc')).toBeNull();
    expect(buildWhatsAppUrl('+54 9 3464 12-3456')).toBe('https://wa.me/5493464123456');
    expect(buildWhatsAppUrl('+54 9 3464 12-3456', 'Hola qué tal')).toMatch(/\?text=Hola%20qu%C3%A9%20tal$/);
  });

  it('buildMailtoUrl', () => {
    expect(buildMailtoUrl(null)).toBeNull();
    expect(buildMailtoUrl('hola@factorintegral.ar')).toBe('mailto:hola@factorintegral.ar');
    expect(
      buildMailtoUrl('hola@factorintegral.ar', { subject: 'Consulta desde la web', body: 'Hola' }),
    ).toBe('mailto:hola@factorintegral.ar?subject=Consulta%20desde%20la%20web&body=Hola');
    expect(buildMailtoUrl('hola@factorintegral.ar', { body: 'Hola' })).toBe(
      'mailto:hola@factorintegral.ar?body=Hola',
    );
  });
});
