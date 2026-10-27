import type { CalculatorTask, TitleLines } from './types';

export const calculadoraCopy: {
  label: string;
  titleLines: TitleLines;
  intro: string;
  timesLabel: string;
  salaryLabel: string;
  monthlyLabel: string;
  tickerNote: string;
  hoursLabel: string;
  yearlyLabel: string;
  savingsLabel: string;
  cta: string;
  ctaDisabled: string;
  footnote: string;
} = {
  label: 'Calculadora',
  titleLines: ['¿Cuánto te cuesta', 'seguir haciéndolo a mano?'],
  intro: 'Marcá lo que hacen a mano y cuántas veces por semana. El tiempo de cada tarea ya está estimado a la baja.',
  timesLabel: 'Veces por semana',
  salaryLabel: 'Sueldo mensual promedio de quien hace estas tareas',
  monthlyLabel: 'Plata que se va por mes en tareas manuales',
  tickerNote: 'y sigue sumando mientras leés esto',
  hoursLabel: 'Horas por mes',
  yearlyLabel: 'Por año',
  savingsLabel: 'Si automatizás la mitad, recuperás por mes',
  cta: 'Quiero recuperarlo',
  ctaDisabled: 'Marcá al menos una tarea',
  footnote: 'Estimación orientativa: toma 4,33 semanas por mes y 160 horas de trabajo por mes, sin cargas sociales.',
};

export const calculatorTasks: readonly CalculatorTask[] = [
  { id: 'facturas', label: 'Cargar facturas o boletas', unit: 'por factura', minutes: 5, defaultChecked: true, defaultTimesPerWeek: 40 },
  { id: 'control-boletas', label: 'Controlar que llegó todo lo de la boleta', unit: 'por boleta', minutes: 8, defaultChecked: true, defaultTimesPerWeek: 40 },
  { id: 'consultas', label: 'Responder consultas repetidas', unit: 'por consulta', minutes: 3, defaultChecked: true, defaultTimesPerWeek: 60 },
  { id: 'pedidos', label: 'Tomar y cargar pedidos', unit: 'por pedido', minutes: 6, defaultChecked: false, defaultTimesPerWeek: 30 },
  { id: 'presupuestos', label: 'Armar presupuestos', unit: 'por presupuesto', minutes: 20, defaultChecked: false, defaultTimesPerWeek: 30 },
  { id: 'precios', label: 'Actualizar precios o planillas', unit: 'por actualización', minutes: 30, defaultChecked: false, defaultTimesPerWeek: 30 },
  { id: 'cierre-caja', label: 'Cerrar la caja o armar reportes', unit: 'por cierre', minutes: 20, defaultChecked: false, defaultTimesPerWeek: 30 },
];
