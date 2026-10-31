// Clases de la landing (base DS Integral + ajustes del reporte 30/10/2026) compartidas entre componentes Astro e islas React.
export const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors';

export const buttonSize = {
  md: 'h-10 px-5 text-button',
  lg: 'h-12 px-7 text-button',
} as const;

export const buttonVariant = {
  primary: 'bg-cta text-on-cta hover:bg-cta-hover',
  secondary: 'border border-border-control text-ink hover:border-ink-muted hover:bg-surface-hover',
} as const;

export const buttonDisabled =
  'disabled:cursor-not-allowed disabled:border disabled:border-border disabled:bg-surface disabled:text-ink-disabled disabled:hover:bg-surface';

export const fieldBase =
  'rounded-field border border-border-control bg-surface text-base text-ink placeholder:text-ink-subtle hover:border-ink-muted focus-visible:border-focus-ring focus-visible:outline-offset-0 aria-[invalid=true]:border-danger-border aria-[invalid=true]:bg-danger-soft';

export const inputClass = `${fieldBase} h-12 w-full px-3`;

export const textareaClass = `${fieldBase} w-full resize-none px-3 py-2.5 scrollbar-ds`;

export const labelClass = 'mb-1.5 block text-label font-medium text-ink-muted';
