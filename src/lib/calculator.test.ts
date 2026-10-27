import { describe, expect, it } from 'vitest';
import { calculatorTasks } from '../data/calculadora';
import {
  DEFAULT_SALARY,
  buildPrefillMessage,
  calculate,
  initialSelections,
  liveAmount,
  sanitizeNonNegative,
} from './calculator';

const init = () => initialSelections(calculatorTasks);

describe('calculator', () => {
  it('valores iniciales', () => {
    const r = calculate(calculatorTasks, init(), DEFAULT_SALARY);
    expect(r.minutesPerWeek).toBe(700);
    expect(r.hoursPerMonth).toBeCloseTo(50.5167, 3);
    expect(r.hourlyRate).toBe(7500);
    expect(r.monthlyCost).toBeCloseTo(378875, 2);
    expect(r.yearlyCost).toBeCloseTo(4546500, 0);
    expect(r.monthlySavings).toBeCloseTo(189437.5, 1);
    expect(r.costPerSecond).toBeCloseTo(0.6578, 3);
  });

  it('marcando pedidos con 30', () => {
    const sel = init().map((s) => (s.id === 'pedidos' ? { ...s, checked: true } : s));
    const r = calculate(calculatorTasks, sel, DEFAULT_SALARY);
    expect(r.minutesPerWeek).toBe(880);
    expect(r.yearlyCost).toBeCloseTo(5715600, 0);
    expect(r.monthlySavings).toBeCloseTo(238150, 1);
  });

  it('sin tareas marcadas', () => {
    const sel = init().map((s) => ({ ...s, checked: false }));
    const r = calculate(calculatorTasks, sel, DEFAULT_SALARY);
    expect(r.minutesPerWeek).toBe(0);
    expect(r.hoursPerMonth).toBe(0);
    expect(r.monthlyCost).toBe(0);
    expect(r.yearlyCost).toBe(0);
    expect(r.monthlySavings).toBe(0);
    expect(r.costPerSecond).toBe(0);
    expect(r.hasTasks).toBe(false);
    expect(liveAmount(r, 5000)).toBe(0);
    expect(buildPrefillMessage(calculatorTasks, sel, r)).toBe('');
  });

  it('sueldo 0', () => {
    const r = calculate(calculatorTasks, init(), 0);
    expect(r.hoursPerMonth).toBeGreaterThan(0);
    expect(r.monthlyCost).toBe(0);
    expect(r.yearlyCost).toBe(0);
    expect(r.monthlySavings).toBe(0);
  });

  it('sanitizeNonNegative', () => {
    expect(sanitizeNonNegative(-3)).toBe(0);
    expect(sanitizeNonNegative(NaN)).toBe(0);
    expect(sanitizeNonNegative('abc')).toBe(0);
    expect(sanitizeNonNegative(12.7)).toBe(12);
    expect(sanitizeNonNegative(12.7, { integer: false })).toBe(12.7);
  });

  it('liveAmount a 5 s', () => {
    const r = calculate(calculatorTasks, init(), DEFAULT_SALARY);
    expect(liveAmount(r, 5000)).toBeCloseTo(378878.29, 1);
  });

  it('mensaje exacto', () => {
    const sel = init();
    const r = calculate(calculatorTasks, sel, DEFAULT_SALARY);
    expect(buildPrefillMessage(calculatorTasks, sel, r)).toBe(
      'Hacemos a mano: cargar facturas o boletas (40 por semana), controlar que llegó todo lo de la boleta (40 por semana), responder consultas repetidas (60 por semana). Según la calculadora son unas 50,5 horas por mes ($ 378.875). Quiero ver qué se puede automatizar.',
    );
  });

  it('una tarea marcada con 0 veces', () => {
    const sel = init().map((s) => ({ ...s, checked: s.id === 'facturas', timesPerWeek: 0 }));
    const r = calculate(calculatorTasks, sel, DEFAULT_SALARY);
    expect(r.hasTasks).toBe(true);
    expect(r.monthlyCost).toBe(0);
  });
});
