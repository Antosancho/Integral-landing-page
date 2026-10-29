import { describe, expect, it } from 'vitest';
import { TEXTAREA_LIMITS, textareaHeight } from './textarea';

const limits = { minHeight: 144, maxHeight: 320 };

describe('textareaHeight', () => {
  it('contenido corto: alto mínimo', () => {
    expect(textareaHeight({ scrollHeight: 50, borderY: 2, ...limits })).toEqual({
      height: 144,
      scrollable: false,
    });
  });
  it('contenido intermedio: alto del contenido', () => {
    expect(textareaHeight({ scrollHeight: 198, borderY: 2, ...limits })).toEqual({
      height: 200,
      scrollable: false,
    });
  });
  it('justo en el máximo: sin scroll', () => {
    expect(textareaHeight({ scrollHeight: 318, borderY: 2, ...limits })).toEqual({
      height: 320,
      scrollable: false,
    });
  });
  it('1px sobre el máximo: scroll', () => {
    expect(textareaHeight({ scrollHeight: 319, borderY: 2, ...limits })).toEqual({
      height: 320,
      scrollable: true,
    });
  });
  it('contenido muy largo: tope y scroll', () => {
    expect(textareaHeight({ scrollHeight: 900, borderY: 0, ...limits })).toEqual({
      height: 320,
      scrollable: true,
    });
  });
  it('medidas inválidas: alto mínimo', () => {
    expect(textareaHeight({ scrollHeight: NaN, borderY: 2, ...limits })).toEqual({
      height: 144,
      scrollable: false,
    });
    expect(textareaHeight({ scrollHeight: -5, borderY: 2, ...limits })).toEqual({
      height: 144,
      scrollable: false,
    });
  });
  it('límites', () => {
    expect(TEXTAREA_LIMITS.minHeight).toBe(144);
    expect(TEXTAREA_LIMITS.maxHeight).toBe(320);
    expect(TEXTAREA_LIMITS.minHeight).toBeLessThan(TEXTAREA_LIMITS.maxHeight);
  });
});
