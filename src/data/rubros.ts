import type { Rubro, RubrosExtra, SectionIntro } from './types';

export const rubrosIntro: SectionIntro = {
  label: 'Para quién',
  titleLines: ['Si tu negocio repite tareas,', 'se puede automatizar.'],
};

export const rubros: readonly Rubro[] = [
  { title: 'Almacenes y despensas', text: 'Costo real de cada compra y precios con margen parejo.' },
  { title: 'Minimarkets y autoservicios', text: 'Caja rápida con lector de códigos y alertas de vencimiento.' },
  { title: 'Kioscos', text: 'Precios al día después de cada aumento, sin hacer cuentas.' },
  { title: 'Distribuidoras mayoristas', text: 'Pedidos que llegan por WhatsApp, cargados y en orden.' },
  { title: 'Ferreterías y corralones', text: 'Presupuestos rápidos aunque tengas miles de artículos.' },
  { title: 'Agroveterinarias y forrajerías', text: 'Vencimientos por lote y cuentas corrientes de cada cliente.' },
];

export const rubrosTambien: RubrosExtra = {
  title: 'Y también',
  intro: 'La automatización con IA sirve para cualquier negocio que repite tareas.',
  items: [
    { title: 'Estudios y profesionales', text: 'Documentos y datos que hoy se cargan a mano, ordenados solos.' },
    { title: 'Consultorios', text: 'Las consultas de siempre por WhatsApp, respondidas al momento.' },
    { title: 'Gastronomía', text: 'El costo de cada plato al día con cada compra.' },
    { title: 'Talleres y servicios técnicos', text: 'Presupuestos y trabajos pendientes sin papeles sueltos.' },
  ],
};
