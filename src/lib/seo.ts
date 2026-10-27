import type { SITE } from '../config/site';
import type { FaqItem } from '../data/types';

export function buildJsonLd(site: typeof SITE, faq: readonly FaqItem[]): Record<string, unknown> {
  const businessId = `${site.url}/#negocio`;
  const business: Record<string, unknown> = {
    '@type': 'ProfessionalService',
    '@id': businessId,
    name: site.name,
    url: site.url,
    description: site.description,
    image: new URL(site.ogImage, site.url).toString(),
  };
  if (site.email) business.email = site.email;
  if (site.whatsapp) business.telephone = `+${site.whatsapp.replace(/\D/g, '')}`;
  business.address = {
    '@type': 'PostalAddress',
    addressLocality: site.location.locality,
    addressRegion: site.location.region,
    addressCountry: site.location.country,
  };
  business.areaServed = [
    { '@type': 'City', name: 'Chabás' },
    { '@type': 'State', name: 'Santa Fe' },
  ];
  business.founder = site.founders.map((name) => ({ '@type': 'Person', name }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      business,
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#sitio`,
        name: site.name,
        url: site.url,
        inLanguage: 'es-AR',
        publisher: { '@id': businessId },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}
