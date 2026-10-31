import { describe, expect, it } from 'vitest';
import {
  caretAfterDigits,
  digitsOnly,
  editDigits,
  formatARS,
  formatARSWithCents,
  formatHours,
  formatInteger,
  formatThousands,
} from './format';

describe('format', () => {
  it('formatARS', () => {
    expect(formatARS(378875)).toBe('$ 378.875');
    expect(formatARS(189437.5)).toBe('$ 189.438');
    expect(formatARS(4546500)).toBe('$ 4.546.500');
    expect(formatARS(0)).toBe('$ 0');
    expect(formatARS(NaN)).toBe('$ 0');
    expect(formatARS(-5)).toBe('$ 0');
  });

  it('formatARSWithCents', () => {
    expect(formatARSWithCents(378875.5)).toBe('$ 378.875,50');
    expect(formatARSWithCents(0)).toBe('$ 0,00');
  });

  it('formatHours', () => {
    expect(formatHours(50.516666)).toBe('50,5');
    expect(formatHours(0)).toBe('0,0');
  });

  it('formatInteger', () => {
    expect(formatInteger(1200000)).toBe('1.200.000');
  });

  it('digitsOnly', () => {
    expect(digitsOnly('1.200.000')).toBe('1200000');
    expect(digitsOnly('$ 12a3')).toBe('123');
    expect(digitsOnly('')).toBe('');
  });

  it('formatThousands', () => {
    expect(formatThousands('1200000')).toBe('1.200.000');
    expect(formatThousands('0')).toBe('0');
    expect(formatThousands('007')).toBe('7');
    expect(formatThousands('')).toBe('');
    expect(formatThousands('999')).toBe('999');
    expect(formatThousands('12345678901234567890')).toBe('12.345.678.901.234.567.890');
  });

  it('editDigits: tipear, pegar y borrar', () => {
    // tipear al final
    expect(editDigits('120000', '120.0005', 8, 'insertText')).toEqual({ digits: '1200005', caretDigits: 7 });
    // pegar con puntos
    expect(editDigits('', '1.500.000', 9, 'insertFromPaste')).toEqual({ digits: '1500000', caretDigits: 7 });
    // borrar un dígito del medio: 1.5|00.000 -> el cursor queda después del 1
    expect(editDigits('1500000', '1.00.000', 2, 'deleteContentBackward')).toEqual({ digits: '100000', caretDigits: 1 });
    // vaciar
    expect(editDigits('1200000', '', 0, 'deleteContentBackward')).toEqual({ digits: '', caretDigits: 0 });
    // ceros adelante
    expect(editDigits('', '007', 3, 'insertText')).toEqual({ digits: '7', caretDigits: 1 });
  });

  it('editDigits: borrar solo el punto borra el dígito de al lado', () => {
    // Backspace con el cursor en 1.|500.000
    expect(editDigits('1500000', '1500.000', 1, 'deleteContentBackward')).toEqual({ digits: '500000', caretDigits: 0 });
    // Suprimir con el cursor en 1|.500.000
    expect(editDigits('1500000', '1500.000', 1, 'deleteContentForward')).toEqual({ digits: '100000', caretDigits: 1 });
  });

  it('caretAfterDigits', () => {
    expect(caretAfterDigits('1.500.000', 0)).toBe(0);
    expect(caretAfterDigits('1.500.000', 1)).toBe(1);
    expect(caretAfterDigits('1.500.000', 2)).toBe(3);
    expect(caretAfterDigits('1.500.000', 7)).toBe(9);
    expect(caretAfterDigits('1.500.000', 20)).toBe(9);
  });
});
