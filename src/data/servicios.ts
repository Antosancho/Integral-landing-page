import type { SectionIntro, Service } from './types';

export const serviciosIntro: SectionIntro = {
  label: 'Servicios',
  titleLines: ['Tres servicios.', 'Un solo objetivo.'],
  intro: 'Que dejes de perder plata en tareas que se pueden hacer solas.',
};

export const servicios: readonly Service[] = [
  {
    code: 's/01',
    audience: 'Para cualquier negocio',
    title: 'Automatización con IA',
    description: 'La IA hace el trabajo repetitivo: lee boletas y documentos, ordena los datos y avisa cuando algo no cierra.',
    includes: ['Lectura de boletas por foto, PDF o mail', 'Asistentes por WhatsApp', 'Avisos y reportes automáticos'],
    cta: { label: 'Consultar', href: '#contacto', cta: 'servicio-s01' },
  },
  {
    code: 's/02',
    audience: 'Para comercios',
    title: 'Sistema de gestión Integral',
    description: 'Nuestro propio sistema para comercios: stock, ventas y caja en la computadora del local, con los módulos que tu negocio necesita.',
    includes: ['Caja rápida con lector de código de barras', 'Stock con alertas de vencimiento', 'Cuenta corriente por cliente'],
    cta: { label: 'Consultar', href: '#contacto', cta: 'servicio-s02' },
  },
  {
    code: 's/03',
    audience: 'Para cualquier negocio',
    title: 'Estudio de ahorro',
    description: 'Vamos a tu negocio, relevamos cómo trabajan y te decimos cuánta plata se puede recuperar y por dónde conviene empezar.',
    includes: ['Relevamiento en tu local', 'Ahorro estimado en pesos', 'Qué conviene resolver primero'],
    cta: { label: 'Consultar', href: '#contacto', cta: 'servicio-s03' },
  },
];
