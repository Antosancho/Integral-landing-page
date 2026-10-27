import { describe, expect, it, vi } from 'vitest';
import { submitContact } from './contact-submit';
import type { ContactInput } from './validation';

const input: ContactInput = {
  nombre: 'Ana',
  negocio: 'Kiosco Ana',
  contacto: 'ana@ejemplo.com',
  mensaje: 'Quiero automatizar mis boletas',
  web: '',
};
const base = { endpoint: 'https://ejemplo.test/contacto', email: 'hola@factorintegral.ar', subject: 'Consulta' };

describe('submitContact', () => {
  it('ok → sent y sin web en el body', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true });
    const r = await submitContact(input, { ...base, fetchFn });
    expect(r).toEqual({ kind: 'sent' });
    const init = fetchFn.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body).not.toHaveProperty('web');
    expect(body.nombre).toBe('Ana');
    expect(init.method).toBe('POST');
  });
  it('res.ok false → error', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false });
    expect(await submitContact(input, { ...base, fetchFn })).toEqual({ kind: 'error' });
  });
  it('fetch rechaza → error', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('red'));
    expect(await submitContact(input, { ...base, fetchFn })).toEqual({ kind: 'error' });
  });
  it('sin endpoint → mailto', async () => {
    const r = await submitContact(input, { ...base, endpoint: null });
    expect(r.kind).toBe('mailto');
    if (r.kind === 'mailto') {
      expect(r.url.startsWith('mailto:hola@factorintegral.ar?subject=')).toBe(true);
      expect(r.url).toContain('Nombre%3A%20');
      expect(r.url).toContain('Negocio%3A%20');
    }
  });
  it('mailto omite Negocio vacío', async () => {
    const r = await submitContact({ ...input, negocio: '' }, { ...base, endpoint: null });
    expect(r.kind === 'mailto' && r.url.includes('Negocio')).toBe(false);
  });
  it('sin endpoint ni email → error', async () => {
    expect(await submitContact(input, { ...base, endpoint: null, email: null })).toEqual({ kind: 'error' });
  });
});
