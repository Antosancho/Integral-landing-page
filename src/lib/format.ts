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

export function digitsOnly(text: string): string {
  return text.replace(/[^0-9]/g, '');
}

function trimLeadingZeros(digits: string): string {
  return digits.replace(/^0+(?=\d)/, '');
}

// Agrupa de a tres sobre el texto (no pasa por Number: no pierde precisión con números largos).
export function formatThousands(digits: string): string {
  return trimLeadingZeros(digitsOnly(digits)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export interface DigitsEdit {
  digits: string; // solo dígitos, sin ceros adelante
  caretDigits: number; // cuántos dígitos quedan a la izquierda del cursor
}

// Interpreta una edición sobre un campo con separador de miles. `raw` es el valor del campo después de editar y
// `caret` la posición del cursor en `raw`. Si solo se borró un punto, borra el dígito de al lado (si no, el
// borrado no haría nada).
export function editDigits(previous: string, raw: string, caret: number, inputType = ''): DigitsEdit {
  let digits = digitsOnly(raw);
  let caretDigits = digitsOnly(raw.slice(0, caret)).length;
  const separatorOnly = digits === previous && raw.length < formatThousands(previous).length;
  if (separatorOnly && inputType === 'deleteContentBackward' && caretDigits > 0) {
    digits = digits.slice(0, caretDigits - 1) + digits.slice(caretDigits);
    caretDigits -= 1;
  } else if (separatorOnly && inputType === 'deleteContentForward') {
    digits = digits.slice(0, caretDigits) + digits.slice(caretDigits + 1);
  }
  const trimmed = trimLeadingZeros(digits);
  return { digits: trimmed, caretDigits: Math.max(0, caretDigits - (digits.length - trimmed.length)) };
}

// Posición del cursor en `formatted` justo después de `count` dígitos.
export function caretAfterDigits(formatted: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] >= '0' && formatted[i] <= '9' && ++seen === count) return i + 1;
  }
  return formatted.length;
}
