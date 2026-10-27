import { describe, expect, it, vi } from 'vitest';
import { consumeContactPrefill, setContactPrefill, subscribeContactPrefill } from './prefill';

describe('prefill', () => {
  it('set + consume devuelve el mensaje una sola vez', () => {
    setContactPrefill('hola');
    expect(consumeContactPrefill()).toBe('hola');
    expect(consumeContactPrefill()).toBeNull();
  });

  it('un listener suscripto recibe el mensaje', () => {
    const fn = vi.fn();
    subscribeContactPrefill(fn);
    setContactPrefill('hola');
    expect(fn).toHaveBeenCalledWith('hola');
  });

  it('después de desuscribirse no lo recibe', () => {
    const fn = vi.fn();
    const off = subscribeContactPrefill(fn);
    off();
    setContactPrefill('hola');
    expect(fn).not.toHaveBeenCalled();
  });

  it('dos listeners reciben ambos', () => {
    const a = vi.fn();
    const b = vi.fn();
    subscribeContactPrefill(a);
    subscribeContactPrefill(b);
    setContactPrefill('x');
    expect(a).toHaveBeenCalledWith('x');
    expect(b).toHaveBeenCalledWith('x');
  });
});
