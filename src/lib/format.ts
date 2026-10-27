function safe(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function formatARS(n: number): string {
  return '$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(safe(n)));
}

export function formatARSWithCents(n: number): string {
  return (
    '$ ' +
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(safe(n))
  );
}

export function formatHours(n: number): string {
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(safe(n));
}

export function formatInteger(n: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(safe(n)));
}
