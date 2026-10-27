import type { CtaLink, TitleLines } from './types';

export const hero: {
  overline: string;
  titleLines: TitleLines;
  lead: string;
  primary: CtaLink;
  secondary: CtaLink;
  locationNote: string;
} = {
  overline: 'Automatización con IA para comercios y pymes',
  titleLines: ['Tu negocio entero,', 'sumado en un solo lugar.'],
  lead: 'Vamos a tu negocio, vemos cómo trabajan y encontramos dónde se pierde plata sin que nadie lo note. Después lo resolvemos con IA y sistemas de gestión a medida.',
  primary: { label: 'Calculá cuánto perdés', href: '#calculadora', cta: 'hero-calculadora' },
  secondary: { label: 'Coordinar una visita', href: '#contacto', cta: 'hero-contacto' },
  locationNote: 'Chabás y alrededores · sur de Santa Fe',
};
