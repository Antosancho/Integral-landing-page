import { describe, expect, it } from 'vitest';
import { contactoCopy } from '../data/contacto';
import { isEmail, isPhone, isSpam, validateContact, type ContactInput } from './validation';

const E = contactoCopy.errors;
const valid: ContactInput = {
  nombre: 'Ana',
  negocio: '',
  contacto: 'ana@ejemplo.com',
  mensaje: 'Quiero automatizar mis boletas',
  web: '',
};

describe('validateContact', () => {
  it('válido completo', () => {
    expect(validateContact(valid, E)).toEqual({});
  });
  it('todo vacío', () => {
    expect(validateContact({ nombre: '', negocio: '', contacto: '', mensaje: '', web: '' }, E)).toEqual({
      nombre: E.nameRequired,
      contacto: E.contactRequired,
      mensaje: E.messageRequired,
    });
  });
  it('email incompleto', () => {
    expect(validateContact({ ...valid, contacto: 'hola@x' }, E).contacto).toBe(E.contactInvalid);
  });
  it('email y teléfono válidos', () => {
    expect(isEmail('hola@factorintegral.ar')).toBe(true);
    expect(isPhone('+54 9 3464 12-3456')).toBe(true);
    expect(validateContact({ ...valid, contacto: '+54 9 3464 12-3456' }, E)).toEqual({});
  });
  it('123 inválido', () => {
    expect(validateContact({ ...valid, contacto: '123' }, E).contacto).toBe(E.contactInvalid);
  });
  it('spam', () => {
    expect(isSpam({ ...valid, web: 'x' })).toBe(true);
    expect(isSpam(valid)).toBe(false);
  });
});
