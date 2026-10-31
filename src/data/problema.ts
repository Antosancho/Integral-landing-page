import type { HighlightText, Leak, Metric, TitleLines } from './types';

export const problema: {
  label: string;
  titleLines: TitleLines;
  body: HighlightText;
  metrics: readonly Metric[];
  leaksTitle: string;
  leaks: readonly Leak[];
} = {
  label: 'El problema',
  titleLines: ['Perdés plata', 'y no la ves.'],
  body: {
    text: 'Precios calculados a mano, cuentas anotadas en un cuaderno, datos que se cargan dos veces. Ya usás planillas, algún sistema y WhatsApp, pero ',
    highlight: 'nada está conectado con cómo trabaja tu negocio.',
  },
  metrics: [
    { value: 'Menos', text: 'tareas manuales repetidas' },
    { value: 'Todo', text: 'conectado en un solo lugar' },
    { value: 'Hoy', text: 'los números a la vista' },
  ],
  leaksTitle: 'Dónde se suele ir la plata',
  leaks: [
    { title: 'Mercadería sin controlar', text: 'Nadie compara lo que entra con lo que dice la boleta.' },
    { title: 'Precios hechos a mano', text: 'Aumentos mal trasladados y ventas por debajo del costo sin darte cuenta.' },
    { title: 'Cuentas corrientes sin control', text: 'Lo que te deben y lo que debés, anotado en cuadernos y planillas sueltas.' },
    { title: 'Caja que no cierra', text: 'Faltantes o sobrantes que nadie sabe explicar.' },
    { title: 'Horas en tareas repetidas', text: 'Cargar datos, armar presupuestos o responder la misma consulta. En un comercio, un estudio o un consultorio.' },
  ],
};
