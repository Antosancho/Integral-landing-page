import { buildMailtoUrl } from './contact';
import type { ContactInput } from './validation';

export type SubmitResult = { kind: 'sent' } | { kind: 'mailto'; url: string } | { kind: 'error' };

export async function submitContact(
  input: ContactInput,
  opts: { endpoint: string | null; email: string | null; subject: string; fetchFn?: typeof fetch },
): Promise<SubmitResult> {
  const nombre = input.nombre.trim();
  const negocio = input.negocio.trim();
  const contacto = input.contacto.trim();
  const mensaje = input.mensaje.trim();

  if (opts.endpoint) {
    const doFetch = opts.fetchFn ?? fetch;
    try {
      const res = await doFetch(opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, negocio, contacto, mensaje }),
      });
      return res.ok ? { kind: 'sent' } : { kind: 'error' };
    } catch {
      return { kind: 'error' };
    }
  }

  if (opts.email) {
    const lines = [`Nombre: ${nombre}`];
    if (negocio) lines.push(`Negocio: ${negocio}`);
    lines.push(`Contacto: ${contacto}`);
    const body = `${lines.join('\n')}\n\n${mensaje}`;
    const url = buildMailtoUrl(opts.email, { subject: opts.subject, body });
    if (url) return { kind: 'mailto', url };
  }
  return { kind: 'error' };
}
