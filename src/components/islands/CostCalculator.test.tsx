import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculadoraCopy, calculatorTasks } from '../../data/calculadora';
import { consumeContactPrefill } from '../../lib/prefill';
import CostCalculator from './CostCalculator';

const renderCalc = () => render(<CostCalculator tasks={calculatorTasks} copy={calculadoraCopy} />);

function bigAmount(): HTMLElement {
  const el = document.querySelector<HTMLElement>('p[aria-hidden="true"]');
  if (!el) throw new Error('No se encontró el monto grande');
  return el;
}

function parseARS(text: string): number {
  return Number(text.replace('$', '').trim().replace(/\./g, '').replace(',', '.'));
}

const timesInput = (label: string) => screen.getByLabelText(`${calculadoraCopy.timesLabel}: ${label}`);

describe('CostCalculator', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('renderiza 7 checkboxes con 3 marcados', () => {
    renderCalc();
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    expect(screen.getByLabelText('Cargar facturas o boletas')).toBeChecked();
    expect(screen.getByLabelText('Controlar que llegó todo lo de la boleta')).toBeChecked();
    expect(screen.getByLabelText('Responder consultas repetidas')).toBeChecked();
    expect(screen.getByLabelText('Tomar y cargar pedidos')).not.toBeChecked();
  });

  it('muestra los valores iniciales', () => {
    renderCalc();
    expect(screen.getByText('50,5 h')).toBeInTheDocument();
    expect(screen.getByText('$ 4.546.500')).toBeInTheDocument();
    expect(screen.getByText('$ 189.438')).toBeInTheDocument();
    expect(bigAmount()).toHaveTextContent('$ 378.875,00');
  });

  it('al marcar pedidos aparece su input con 30 y cambia el año', async () => {
    const user = userEvent.setup();
    renderCalc();
    await user.click(screen.getByLabelText('Tomar y cargar pedidos'));
    expect(timesInput('Tomar y cargar pedidos')).toHaveValue(30);
    expect(screen.getByText('$ 5.715.600')).toBeInTheDocument();
  });

  it('recuerda la cantidad al desmarcar y volver a marcar', async () => {
    const user = userEvent.setup();
    renderCalc();
    const check = screen.getByLabelText('Tomar y cargar pedidos');
    await user.click(check);
    const input = timesInput('Tomar y cargar pedidos');
    await user.clear(input);
    await user.type(input, '55');
    expect(input).toHaveValue(55);
    await user.click(check);
    await user.click(check);
    expect(timesInput('Tomar y cargar pedidos')).toHaveValue(55);
  });

  it('sin tareas: monto en cero y botón deshabilitado', async () => {
    const user = userEvent.setup();
    renderCalc();
    await user.click(screen.getByLabelText('Cargar facturas o boletas'));
    await user.click(screen.getByLabelText('Controlar que llegó todo lo de la boleta'));
    await user.click(screen.getByLabelText('Responder consultas repetidas'));
    expect(bigAmount()).toHaveTextContent('$ 0,00');
    const btn = screen.getByRole('button', { name: 'Marcá al menos una tarea' });
    expect(btn).toBeDisabled();
  });

  it('el contador en vivo avanza con el tiempo', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    renderCalc();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    const n = parseARS(bigAmount().textContent ?? '');
    expect(n).toBeGreaterThanOrEqual(378878);
    expect(n).toBeLessThanOrEqual(378879);
  });

  it('con reduce motion el monto no se mueve', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList) as typeof window.matchMedia;
    try {
      vi.useFakeTimers({ shouldAdvanceTime: false });
      renderCalc();
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(bigAmount()).toHaveTextContent('$ 378.875,00');
    } finally {
      window.matchMedia = original;
    }
  });

  it('el CTA guarda el mensaje y hace scroll al formulario', async () => {
    const target = document.createElement('div');
    target.id = 'formulario-contacto';
    document.body.appendChild(target);
    const textarea = document.createElement('textarea');
    textarea.id = 'mensaje';
    document.body.appendChild(textarea);
    const user = userEvent.setup();
    renderCalc();
    await user.click(screen.getByRole('button', { name: 'Quiero recuperarlo' }));
    expect(consumeContactPrefill()).toBe(
      'Hacemos a mano: cargar facturas o boletas (40 por semana), controlar que llegó todo lo de la boleta (40 por semana), responder consultas repetidas (60 por semana). Según la calculadora son unas 50,5 horas por mes ($ 378.875). Quiero ver qué se puede automatizar.',
    );
    expect(target.scrollIntoView).toHaveBeenCalled();
    expect(textarea).toHaveFocus();
  });

  it('se puede vaciar el sueldo y tipear sin cero adelante', async () => {
    const user = userEvent.setup();
    renderCalc();
    const salary = screen.getByLabelText(calculadoraCopy.salaryLabel);
    await user.clear(salary);
    expect(salary).toHaveValue('');
    expect((salary as HTMLInputElement).value).toBe('');
    expect(bigAmount()).toHaveTextContent('$ 0,00');
    await user.type(salary, '1500000');
    expect((salary as HTMLInputElement).value).toBe('1.500.000');
  });

  it('el sueldo arranca con separador de miles', () => {
    renderCalc();
    expect(screen.getByLabelText(calculadoraCopy.salaryLabel)).toHaveValue('1.200.000');
  });

  it('el sueldo ignora letras', async () => {
    const user = userEvent.setup();
    renderCalc();
    const salary = screen.getByLabelText(calculadoraCopy.salaryLabel);
    await user.clear(salary);
    await user.type(salary, '12a3');
    expect(salary).toHaveValue('123');
  });

  it('el sueldo acepta pegar un número con puntos', async () => {
    const user = userEvent.setup();
    renderCalc();
    const salary = screen.getByLabelText(calculadoraCopy.salaryLabel);
    await user.clear(salary);
    await user.paste('1.500.000');
    expect(salary).toHaveValue('1.500.000');
  });

  it('borrar en el medio del sueldo no manda el cursor al final', async () => {
    const user = userEvent.setup();
    renderCalc();
    const salary = screen.getByLabelText(calculadoraCopy.salaryLabel) as HTMLInputElement;
    await user.click(salary);
    salary.setSelectionRange(3, 3); // 1.2|00.000
    await user.keyboard('{Backspace}');
    expect(salary).toHaveValue('100.000');
    expect(salary.selectionStart).toBe(1);
  });

  it('Backspace después de un punto borra el dígito anterior', async () => {
    const user = userEvent.setup();
    renderCalc();
    const salary = screen.getByLabelText(calculadoraCopy.salaryLabel) as HTMLInputElement;
    await user.click(salary);
    salary.setSelectionRange(2, 2); // 1.|200.000
    await user.keyboard('{Backspace}');
    expect(salary).toHaveValue('200.000');
    expect(salary.selectionStart).toBe(0);
  });

  it('al desmontar no quedan timers', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    const { unmount } = renderCalc();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('sueldo 0: monto en cero pero horas intactas', () => {
    renderCalc();
    fireEvent.change(screen.getByLabelText(calculadoraCopy.salaryLabel), { target: { value: '0' } });
    expect(bigAmount()).toHaveTextContent('$ 0,00');
    expect(screen.getByText('50,5 h')).toBeInTheDocument();
  });
});
