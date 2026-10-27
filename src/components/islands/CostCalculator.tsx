import { useEffect, useState } from 'react';
import type { calculadoraCopy } from '../../data/calculadora';
import type { CalculatorTask } from '../../data/types';
import {
  DEFAULT_SALARY,
  buildPrefillMessage,
  calculate,
  initialSelections,
  liveAmount,
  sanitizeNonNegative,
  type CalculatorResult,
  type TaskSelection,
} from '../../lib/calculator';
import { formatARS, formatARSWithCents, formatHours } from '../../lib/format';
import { setContactPrefill } from '../../lib/prefill';

interface Props {
  tasks: readonly CalculatorTask[];
  copy: typeof calculadoraCopy;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useLiveAmount(result: CalculatorResult): number {
  const [reduce] = useState(prefersReducedMotion);
  const [value, setValue] = useState(() => liveAmount(result, 0));
  const animate = !reduce && result.hasTasks;

  useEffect(() => {
    if (!animate) return;
    const start = Date.now();
    setValue(liveAmount(result, 0));
    const id = setInterval(() => {
      setValue(liveAmount(result, Date.now() - start));
    }, 100);
    return () => clearInterval(id);
  }, [animate, result.monthlyCost]);

  return animate ? value : liveAmount(result, 0);
}

const inputClass =
  'w-full rounded-xl border border-field-border bg-surface-2 px-3 py-2 text-text focus:border-accent';

export default function CostCalculator({ tasks, copy }: Props) {
  const [checks, setChecks] = useState<TaskSelection[]>(() => initialSelections(tasks));
  const [timesText, setTimesText] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialSelections(tasks).map((s) => [s.id, String(s.timesPerWeek)])),
  );
  const [salaryText, setSalaryText] = useState<string>(String(DEFAULT_SALARY));

  const selections: TaskSelection[] = checks.map((s) => ({
    ...s,
    timesPerWeek: sanitizeNonNegative(Number(timesText[s.id] ?? '')),
  }));
  const salary = sanitizeNonNegative(Number(salaryText), { integer: false });

  const result = calculate(tasks, selections, salary);
  const live = useLiveAmount(result);

  const setChecked = (id: string, checked: boolean) =>
    setChecks((prev) => prev.map((s) => (s.id === id ? { ...s, checked } : s)));

  const handleCta = () => {
    if (!result.hasTasks) return;
    setContactPrefill(buildPrefillMessage(tasks, selections, result));
    document
      .getElementById('formulario-contacto')
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('mensaje')?.focus({ preventScroll: true });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="sr-only">Tareas que hacen a mano</legend>
          {tasks.map((task) => {
            const sel = selections.find((s) => s.id === task.id);
            const checked = sel?.checked ?? false;
            return (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`tarea-${task.id}`}
                    aria-describedby={`tarea-${task.id}-detalle`}
                    checked={checked}
                    onChange={(e) => setChecked(task.id, e.currentTarget.checked)}
                    className="mt-1 size-5 border-field-border accent-accent"
                  />
                  <div>
                    <label htmlFor={`tarea-${task.id}`} className="block cursor-pointer font-bold">
                      {task.label}
                    </label>
                    <span id={`tarea-${task.id}-detalle`} className="block text-sm text-muted">
                      {task.minutes} min {task.unit}
                    </span>
                  </div>
                </div>
                {checked && sel && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">{copy.timesLabel}</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      aria-label={`${copy.timesLabel}: ${task.label}`}
                      value={timesText[task.id] ?? ''}
                      onChange={(e) => {
                        const text = e.currentTarget.value;
                        setTimesText((prev) => ({ ...prev, [task.id]: text }));
                      }}
                      className="w-24 rounded-xl border border-field-border bg-surface px-3 py-2 text-text focus:border-accent"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>

        <div>
          <label htmlFor="sueldo" className="mb-2 block font-bold">
            {copy.salaryLabel}
          </label>
          <input
            id="sueldo"
            type="number"
            min={0}
            step={10000}
            inputMode="numeric"
            value={salaryText}
            onChange={(e) => setSalaryText(e.currentTarget.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-muted">{copy.monthlyLabel}</p>
        <p aria-hidden="true" className="mt-2 text-3xl font-extrabold whitespace-nowrap tabular-nums sm:text-5xl">
          {formatARSWithCents(live)}
        </p>
        <p className="sr-only" aria-live="polite">
          {`${copy.monthlyLabel}: ${formatARS(result.monthlyCost)}`}
        </p>
        {result.hasTasks && <p className="mt-1 text-sm text-muted">{copy.tickerNote}</p>}

        <dl className="mt-6 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">{copy.hoursLabel}</dt>
            <dd className="font-bold">{`${formatHours(result.hoursPerMonth)} h`}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">{copy.yearlyLabel}</dt>
            <dd className="font-bold">{formatARS(result.yearlyCost)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">{copy.savingsLabel}</dt>
            <dd className="font-bold text-accent">{formatARS(result.monthlySavings)}</dd>
          </div>
        </dl>

        <button
          type="button"
          disabled={!result.hasTasks}
          onClick={handleCta}
          className="mt-6 w-full rounded-full bg-text px-6 py-3 text-[15px] font-bold text-bg hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-text"
        >
          {result.hasTasks ? copy.cta : copy.ctaDisabled}
        </button>

        <p className="mt-4 text-xs text-muted">{copy.footnote}</p>
      </div>
    </div>
  );
}
