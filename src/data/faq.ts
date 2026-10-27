import type { FaqItem, SectionIntro } from './types';

export const faqIntro: SectionIntro = {
  label: 'Preguntas frecuentes',
  titleLines: ['Lo que nos', 'suelen preguntar.'],
};

export const faq: readonly FaqItem[] = [
  { question: '¿Cuánto cuesta?', answer: 'Se cotiza según cada comercio. Después de la primera charla te pasamos un presupuesto por escrito, antes de empezar cualquier trabajo.' },
  { question: '¿Cuánto tarda?', answer: 'Depende de lo que haya que resolver. Trabajamos por partes, así vas viendo cada parte funcionando antes de seguir con la próxima.' },
  { question: '¿Tengo que cambiar el sistema que uso?', answer: 'No necesariamente. Muchas veces sumamos el control al costado de lo que ya usás.' },
  { question: '¿Hace falta saber de tecnología?', answer: 'No. Nosotros nos ocupamos de lo técnico y capacitamos a tu equipo en el local.' },
  { question: '¿Qué pasa con los datos de mi negocio?', answer: 'Son tuyos. Te explicamos dónde se guardan y quién puede verlos. Y nunca te vamos a pedir tu clave fiscal.' },
  { question: '¿Dónde trabajan?', answer: 'En Chabás y la zona, en el sur de Santa Fe. Vamos a tu local: relevamos, instalamos y capacitamos en persona.' },
];
