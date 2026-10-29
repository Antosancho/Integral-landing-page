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
    text: 'Boletas que nadie controla, precios calculados a mano, fiado anotado en un cuaderno. Ya usás planillas, algún sistema y WhatsApp, pero ',
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
    { title: 'Precios hechos a mano', text: 'Márgenes desparejos, aumentos mal trasladados y ventas por debajo del costo.' },
    { title: 'Stock a ojo', text: 'Se repone por intuición: falta lo que más se vende y sobra lo que no.' },
    { title: 'Fiado sin control', text: 'Deudas anotadas en un cuaderno que se pierden o se olvidan.' },
    { title: 'Caja que no cierra', text: 'Faltantes o sobrantes que nadie sabe explicar.' },
    { title: 'Papeles sueltos', text: 'Boletas, remitos y anotaciones desparramadas.' },
    { title: 'Deuda con proveedores', text: 'No se sabe bien cuánto se debe, a quién ni cuándo vence.' },
  ],
};
