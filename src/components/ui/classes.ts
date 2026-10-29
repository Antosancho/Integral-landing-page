// Clases del sistema de diseño de Integral compartidas entre componentes Astro e islas React.
export const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors';

export const buttonSize = {
  md: 'h-10 px-4 text-button',
  lg: 'h-12 px-6 text-base',
} as const;

export const buttonVariant = {
  primary: 'bg-primary text-ink-on-brand hover:bg-primary-hover active:bg-primary-pressed',
  secondary: 'border border-border-control bg-surface text-ink hover:border-ink-muted hover:bg-surface-hover',
} as const;

export const buttonDisabled =
  'disabled:cursor-not-allowed disabled:border disabled:border-border disabled:bg-surface-sunken disabled:text-ink-disabled disabled:hover:bg-surface-sunken';

export const fieldBase =
  'rounded-sm border border-border-control bg-surface text-base text-ink placeholder:text-ink-subtle hover:border-ink-muted focus-visible:border-focus-ring focus-visible:outline-offset-0 aria-[invalid=true]:border-danger-border aria-[invalid=true]:bg-danger-soft';

export const inputClass = `${fieldBase} h-12 w-full px-3`;

export const textareaClass = `${fieldBase} w-full resize-none px-3 py-2.5 scrollbar-ds`;

export const labelClass = 'mb-1.5 block text-label font-medium text-ink-muted';
