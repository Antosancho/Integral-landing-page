// IMPORTANTE: este archivo no puede importar nada de Astro ni usar import.meta.env (lo carga astro.config.ts).
export const SITE = {
  name: 'Factor Integral',
  url: 'https://factorintegral.ar', // dominio a confirmar
  locale: 'es-AR',
  ogLocale: 'es_AR',
  title: 'Automatización con IA para comercios y pymes en Chabás | Factor Integral',
  description:
    'Encontramos dónde tu comercio pierde plata y lo resolvemos con IA y sistemas a medida. Vamos a tu local en Chabás y la zona, en el sur de Santa Fe.',
  ogImage: '/og-image.png',
  themeColor: '#07111b',
  email: 'hola@factorintegral.ar' as string | null, // a confirmar
  whatsapp: null as string | null, // completar en formato internacional sin `+`, ej. `549346XXXXXXX`
  location: {
    locality: 'Chabás',
    region: 'Santa Fe',
    country: 'AR',
    label: 'Chabás y alrededores, sur de Santa Fe',
  },
  founders: ['Felipe Sancho', 'Antonio Sancho'],
  primaryCta: { label: 'Coordinar una visita', href: '#contacto', cta: 'contacto' },
  headerCta: { label: 'Contactar', href: '#contacto', cta: 'header-contacto' },
  nav: [
    { label: 'Servicios', href: '#servicios' },
    { label: 'Para quién', href: '#rubros' },
    { label: 'Cómo trabajamos', href: '#metodo' },
    { label: 'Preguntas', href: '#preguntas' },
    { label: 'Contacto', href: '#contacto' },
  ],
} as const;
