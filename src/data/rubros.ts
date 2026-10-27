import type { Rubro, SectionIntro } from './types';

export const rubrosIntro: SectionIntro = {
  label: 'Para quién',
  titleLines: ['Si tu negocio repite tareas,', 'se puede automatizar.'],
};

export const rubros: readonly Rubro[] = [
  { title: 'Almacenes y despensas', text: 'Costo real de cada boleta, precios con margen parejo y fiado bajo control.' },
  { title: 'Minimarkets y autoservicios', text: 'Caja rápida con lector de códigos, stock al día y alertas de vencimiento.' },
  { title: 'Kioscos', text: 'Precios actualizados sin hacer cuentas y control de lo que entra.' },
  { title: 'Distribuidoras mayoristas', text: 'Pedidos, cuentas corrientes y deuda con proveedores en orden.' },
  { title: 'Comercios de la zona', text: 'Si hay papeles sueltos y tareas que se repiten, hay plata para recuperar.' },
  { title: 'Pymes', text: 'Relevamos cómo trabajan y automatizamos lo que más tiempo y plata se lleva.' },
];
