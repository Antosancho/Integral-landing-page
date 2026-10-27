import type { CtaLink, TitleLines } from './types';

export const contactoCopy: {
  label: string;
  titleLines: TitleLines;
  lead: string;
  primary: CtaLink;
  secondary: CtaLink;
  form: {
    nameLabel: string;
    businessLabel: string;
    businessHint: string;
    contactLabel: string;
    messageLabel: string;
    submit: string;
    submitting: string;
    success: string;
    mailtoSuccess: string;
    error: string;
    mailSubject: string;
  };
  errors: {
    nameRequired: string;
    contactRequired: string;
    contactInvalid: string;
    messageRequired: string;
  };
} = {
  label: 'Siguiente paso',
  titleLines: ['¿Tu negocio sigue haciendo a mano', 'lo que se puede automatizar?'],
  lead: 'Contanos cómo trabajan hoy y coordinamos una visita a tu local.',
  primary: { label: 'Coordinar una visita', href: '#formulario-contacto', cta: 'contacto-formulario' },
  secondary: { label: 'Ver cómo trabajamos', href: '#metodo', cta: 'contacto-metodo' },
  form: {
    nameLabel: 'Nombre',
    businessLabel: 'Negocio',
    businessHint: 'Opcional',
    contactLabel: 'WhatsApp o email',
    messageLabel: '¿Qué te gustaría resolver?',
    submit: 'Enviar',
    submitting: 'Enviando…',
    success: '¡Gracias! Te vamos a responder lo antes posible.',
    mailtoSuccess: 'Se abrió tu correo con el mensaje listo. Si no se abrió, escribinos a',
    error: 'No pudimos enviar el mensaje. Probá de nuevo o escribinos por email.',
    mailSubject: 'Consulta desde la web',
  },
  errors: {
    nameRequired: 'Decinos tu nombre.',
    contactRequired: 'Dejanos un WhatsApp o un email para responderte.',
    contactInvalid: 'Revisá el WhatsApp o email: no parece válido.',
    messageRequired: 'Contanos en pocas palabras qué te gustaría resolver.',
  },
};
