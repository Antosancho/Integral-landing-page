export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function buildWhatsAppUrl(phone: string | null, text?: string): string | null {
  if (!phone) return null;
  const digits = normalizePhone(phone);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function buildMailtoUrl(
  email: string | null,
  opts?: { subject?: string; body?: string },
): string | null {
  if (!email) return null;
  const params: string[] = [];
  if (opts?.subject) params.push(`subject=${encodeURIComponent(opts.subject)}`);
  if (opts?.body) params.push(`body=${encodeURIComponent(opts.body)}`);
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
}
