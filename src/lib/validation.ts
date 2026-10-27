import type { contactoCopy } from '../data/contacto';

export interface ContactInput {
  nombre: string;
  negocio: string;
  contacto: string;
  mensaje: string;
  web: string;
}
export type ContactErrors = Partial<Record<'nombre' | 'contacto' | 'mensaje', string>>;

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export function isPhone(v: string): boolean {
  if (!/^[\d\s()+-]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, '').length;
  return digits >= 8 && digits <= 15;
}

export function validateContact(input: ContactInput, errors: typeof contactoCopy.errors): ContactErrors {
  const result: ContactErrors = {};
  if (input.nombre.trim().length < 2) result.nombre = errors.nameRequired;
  const contacto = input.contacto.trim();
  if (!contacto) result.contacto = errors.contactRequired;
  else if (!isEmail(contacto) && !isPhone(contacto)) result.contacto = errors.contactInvalid;
  if (input.mensaje.trim().length < 10) result.mensaje = errors.messageRequired;
  return result;
}

export function isSpam(input: ContactInput): boolean {
  return input.web.trim().length > 0;
}
