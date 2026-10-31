import type { CtaLink, TitleLines } from './types';

export const hero: {
  overline: string;
  titleLines: TitleLines;
  lead: string;
  primary: CtaLink;
  secondary: CtaLink;
  locationNote: string;
  whatsappLabel: string;
} = {
  overline: 'Automatización con IA para comercios y pymes',
  titleLines: ['Automatizamos los procesos', 'de tu negocio.'],
  lead: 'Vamos a tu negocio, vemos cómo trabajan y encontramos dónde se pierde plata sin que nadie lo note. Después lo resolvemos con IA y sistemas de gestión a medida.',
  primary: { label: 'Calculá cuánto perdés', href: '#calculadora', cta: 'hero-calculadora' },
  secondary: { label: 'Coordinar una visita', href: '#contacto', cta: 'hero-contacto' },
  locationNote: 'Región sur de Santa Fe',
  whatsappLabel: 'Escribinos por WhatsApp',
};
