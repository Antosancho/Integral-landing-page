import type { SectionIntro, Step } from './types';

export const metodoIntro: SectionIntro = {
  label: 'Cómo trabajamos',
  titleLines: ['Del relevamiento', 'al sistema funcionando.'],
};

export const steps: readonly Step[] = [
  { number: '01', title: 'Relevamos', text: 'Vamos a tu negocio y vemos cómo se trabaja hoy, con quién y con qué herramientas. Sin suponer nada.' },
  { number: '02', title: 'Priorizamos', text: 'Te mostramos dónde se pierde plata y arrancamos por lo que más rinde con menos cambios.' },
  { number: '03', title: 'Implementamos', text: 'Instalamos por partes y capacitamos a tu equipo en el local, con el trabajo de todos los días.' },
  { number: '04', title: 'Acompañamos', text: 'Seguimos cerca para ajustar y mejorar cuando el negocio lo pide.' },
];
