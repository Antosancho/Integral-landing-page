import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react';
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
import {
  caretAfterDigits,
  editDigits,
  formatARS,
  formatARSWithCents,
  formatHours,
  formatThousands,
} from '../../lib/format';
import { setContactPrefill } from '../../lib/prefill';
import {
  buttonBase,
  buttonDisabled,
  buttonSize,
  buttonVariant,
  fieldBase,
  inputClass,
  labelClass,
} from '../ui/classes';

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

export default function CostCalculator({ tasks, copy }: Props) {
  const [checks, setChecks] = useState<TaskSelection[]>(() => initialSelections(tasks));
  const [timesText, setTimesText] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialSelections(tasks).map((s) => [s.id, String(s.timesPerWeek)])),
  );
  // Sueldo: solo dígitos + cuántos dígitos quedan a la izquierda del cursor (-1 = no mover el cursor).
  // Cada edición crea un objeto nuevo, así siempre se re-renderiza y el cursor no salta al final.
  const [salaryInput, setSalaryInput] = useState({ digits: String(DEFAULT_SALARY), caretDigits: -1 });
  const salaryText = salaryInput.digits;
  const salaryRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const el = salaryRef.current;
    if (!el || salaryInput.caretDigits < 0 || document.activeElement !== el) return;
    const pos = caretAfterDigits(el.value, salaryInput.caretDigits);
    el.setSelectionRange(pos, pos);
  }, [salaryInput]);

  const handleSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const inputType = (e.nativeEvent as InputEvent).inputType ?? '';
    setSalaryInput(editDigits(salaryText, el.value, el.selectionStart ?? el.value.length, inputType));
  };

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
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="sr-only">Tareas que hacen a mano</legend>
          {tasks.map((task) => {
            const sel = selections.find((s) => s.id === task.id);
            const checked = sel?.checked ?? false;
            return (
              <div
                key={task.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 transition-colors ${checked ? 'border-info bg-surface-hover' : 'border-border bg-surface'}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`tarea-${task.id}`}
                    aria-describedby={`tarea-${task.id}-detalle`}
                    checked={checked}
                    onChange={(e) => setChecked(task.id, e.currentTarget.checked)}
                    className="accent-link mt-1 size-5"
                  />
                  <div>
                    <label htmlFor={`tarea-${task.id}`} className="block cursor-pointer font-semibold">
                      {task.label}
                    </label>
                    <span id={`tarea-${task.id}-detalle`} className="text-ink-muted block text-sm">
                      {task.minutes} min {task.unit}
                    </span>
                  </div>
                </div>
                {checked && sel && (
                  <div className="flex items-center gap-2">
                    <span className="text-ink-muted text-sm">{copy.timesLabel}</span>
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
                      className={`${fieldBase} h-12 w-24 px-3 text-right tabular-nums`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>

        <div>
          <label htmlFor="sueldo" className={labelClass}>
            {copy.salaryLabel}
          </label>
          <input
            ref={salaryRef}
            id="sueldo"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={formatThousands(salaryText)}
            onChange={handleSalaryChange}
            className={`${inputClass} tabular-nums`}
          />
        </div>
      </div>

      <div className="border-border bg-surface-header min-w-0 rounded-lg border p-5 shadow-md sm:p-8">
        <p className="text-ink-muted">{copy.monthlyLabel}</p>
        <p aria-hidden="true" className="mt-2 text-3xl font-extrabold tracking-heading tabular-nums wrap-anywhere sm:text-5xl">
          {formatARSWithCents(live)}
        </p>
        <p className="sr-only" aria-live="polite">
          {`${copy.monthlyLabel}: ${formatARS(result.monthlyCost)}`}
        </p>
        {result.hasTasks && <p className="text-ink-muted mt-1 text-sm">{copy.tickerNote}</p>}

        <dl className="mt-6 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <dt className="text-ink-muted">{copy.hoursLabel}</dt>
            <dd className="shrink-0 font-semibold whitespace-nowrap tabular-nums">{`${formatHours(result.hoursPerMonth)} h`}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <dt className="text-ink-muted">{copy.yearlyLabel}</dt>
            <dd className="shrink-0 font-semibold whitespace-nowrap tabular-nums">
              {formatARS(result.yearlyCost)}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <dt className="text-ink-muted">{copy.savingsLabel}</dt>
            <dd className="text-success shrink-0 font-semibold whitespace-nowrap tabular-nums">
              {formatARS(result.monthlySavings)}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          disabled={!result.hasTasks}
          onClick={handleCta}
          className={`${buttonBase} ${buttonSize.lg} ${buttonVariant.primary} ${buttonDisabled} mt-6 w-full`}
        >
          {result.hasTasks ? copy.cta : copy.ctaDisabled}
        </button>

        <p className="text-ink-subtle mt-4 text-xs">{copy.footnote}</p>
      </div>
    </div>
  );
}
