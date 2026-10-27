import type { CalculatorTask } from '../data/types';
import { formatARS, formatHours } from './format';

export const WEEKS_PER_MONTH = 4.33;
export const WORK_HOURS_PER_MONTH = 160;
export const SECONDS_PER_WORK_MONTH = WORK_HOURS_PER_MONTH * 3600;
export const DEFAULT_SALARY = 1_200_000;

export interface TaskSelection {
  id: string;
  checked: boolean;
  timesPerWeek: number;
}

export interface CalculatorResult {
  minutesPerWeek: number;
  hoursPerMonth: number;
  hourlyRate: number;
  monthlyCost: number;
  yearlyCost: number;
  monthlySavings: number;
  costPerSecond: number;
  hasTasks: boolean;
}

export function sanitizeNonNegative(value: unknown, opts: { integer?: boolean } = {}): number {
  const integer = opts.integer ?? true;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return integer ? Math.floor(value) : value;
}

export function initialSelections(tasks: readonly CalculatorTask[]): TaskSelection[] {
  return tasks.map((t) => ({ id: t.id, checked: t.defaultChecked, timesPerWeek: t.defaultTimesPerWeek }));
}

export function calculate(
  tasks: readonly CalculatorTask[],
  selections: readonly TaskSelection[],
  salary: number,
): CalculatorResult {
  const safeSalary = sanitizeNonNegative(salary, { integer: false });
  let minutesPerWeek = 0;
  let hasTasks = false;
  for (const sel of selections) {
    if (!sel.checked) continue;
    const task = tasks.find((t) => t.id === sel.id);
    if (!task) continue;
    hasTasks = true;
    minutesPerWeek += task.minutes * sanitizeNonNegative(sel.timesPerWeek);
  }
  const hoursPerMonth = (minutesPerWeek / 60) * WEEKS_PER_MONTH;
  const hourlyRate = safeSalary / WORK_HOURS_PER_MONTH;
  const monthlyCost = hoursPerMonth * hourlyRate;
  return {
    minutesPerWeek,
    hoursPerMonth,
    hourlyRate,
    monthlyCost,
    yearlyCost: monthlyCost * 12,
    monthlySavings: monthlyCost / 2,
    costPerSecond: monthlyCost / SECONDS_PER_WORK_MONTH,
    hasTasks,
  };
}

export function liveAmount(result: CalculatorResult, elapsedMs: number): number {
  if (!result.hasTasks) return 0;
  return result.monthlyCost + result.costPerSecond * (elapsedMs / 1000);
}

export function buildPrefillMessage(
  tasks: readonly CalculatorTask[],
  selections: readonly TaskSelection[],
  result: CalculatorResult,
): string {
  const parts: string[] = [];
  for (const sel of selections) {
    if (!sel.checked) continue;
    const task = tasks.find((t) => t.id === sel.id);
    if (!task) continue;
    const label = task.label.charAt(0).toLowerCase() + task.label.slice(1);
    parts.push(`${label} (${sanitizeNonNegative(sel.timesPerWeek)} por semana)`);
  }
  if (parts.length === 0) return '';
  return `Hacemos a mano: ${parts.join(', ')}. Según la calculadora son unas ${formatHours(result.hoursPerMonth)} horas por mes (${formatARS(result.monthlyCost)}). Quiero ver qué se puede automatizar.`;
}
