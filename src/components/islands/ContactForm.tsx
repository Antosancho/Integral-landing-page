import { useCallback, useEffect, useLayoutEffect, useRef, useState, type SubmitEvent } from 'react';
import type { contactoCopy } from '../../data/contacto';
import { submitContact } from '../../lib/contact-submit';
import { consumeContactPrefill, subscribeContactPrefill } from '../../lib/prefill';
import { TEXTAREA_LIMITS, textareaHeight } from '../../lib/textarea';
import {
  buttonBase,
  buttonDisabled,
  buttonSize,
  buttonVariant,
  inputClass,
  labelClass,
  textareaClass,
} from '../ui/classes';
import { isSpam, validateContact, type ContactErrors, type ContactInput } from '../../lib/validation';

interface Props {
  copy: typeof contactoCopy;
  email: string | null;
  endpoint: string | null;
  onNavigate?: (url: string) => void;
}

type Status =
  { kind: 'idle' } | { kind: 'submitting' } | { kind: 'sent' } | { kind: 'mailto' } | { kind: 'error' };

type FieldName = 'nombre' | 'contacto' | 'mensaje';

const FIELD_ORDER: readonly FieldName[] = ['nombre', 'contacto', 'mensaje'];

export default function ContactForm({ copy, email, endpoint, onNavigate }: Props) {
  const [nombre, setNombre] = useState('');
  const [negocio, setNegocio] = useState('');
  const [contacto, setContacto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [web, setWeb] = useState('');
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const mensajeEl = useRef<HTMLTextAreaElement>(null);
  const refs = {
    nombre: useRef<HTMLInputElement>(null),
    contacto: useRef<HTMLInputElement>(null),
    mensaje: mensajeEl,
  };

  const lastPrefill = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const mensajeRef = useRef('');
  mensajeRef.current = mensaje;

  useEffect(() => {
    const apply = (incoming: string) => {
      const current = mensajeRef.current;
      const replace = current.trim() === '' || current === lastPrefill.current;
      const next = replace ? incoming : `${current}\n\n${incoming}`;
      lastPrefill.current = incoming;
      mensajeRef.current = next;
      setMensaje(next);
    };
    const pending = consumeContactPrefill();
    if (pending) apply(pending);
    return subscribeContactPrefill(apply);
  }, []);

  const fitMensaje = useCallback(() => {
    const el = mensajeEl.current;
    if (!el) return;
    // Al pasar por 'auto' la página se achica un instante: guardar scrolls para que no salten.
    const pageY = window.scrollY;
    const innerTop = el.scrollTop;
    el.style.height = 'auto';
    const cs = window.getComputedStyle(el);
    const borderY = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
    const { height, scrollable } = textareaHeight({
      scrollHeight: el.scrollHeight,
      borderY,
      ...TEXTAREA_LIMITS,
    });
    el.style.height = `${height}px`;
    el.style.overflowY = scrollable ? 'auto' : 'hidden';
    el.scrollTop = innerTop;
    if (window.scrollY !== pageY) window.scrollTo(window.scrollX, pageY);
  }, []);

  useLayoutEffect(() => {
    fitMensaje();
  }, [mensaje, fitMensaje]);

  useEffect(() => {
    window.addEventListener('resize', fitMensaje);
    return () => window.removeEventListener('resize', fitMensaje);
  }, [fitMensaje]);

  const navigate = onNavigate ?? ((url: string) => window.location.assign(url));
  const { form } = copy;

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === 'submitting' || submittingRef.current) return;
    const input: ContactInput = { nombre, negocio, contacto, mensaje, web };

    if (isSpam(input)) {
      setErrors({});
      setStatus({ kind: 'sent' });
      return;
    }

    const found = validateContact(input, copy.errors);
    setErrors(found);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      setStatus({ kind: 'idle' });
      refs[first].current?.focus();
      return;
    }

    setStatus({ kind: 'submitting' });
    submittingRef.current = true;
    let result: Awaited<ReturnType<typeof submitContact>>;
    try {
      result = await submitContact(input, { endpoint, email, subject: form.mailSubject });
    } finally {
      submittingRef.current = false;
    }
    if (result.kind === 'sent') {
      setNombre('');
      setNegocio('');
      setContacto('');
      setMensaje('');
      setStatus({ kind: 'sent' });
    } else if (result.kind === 'mailto') {
      navigate(result.url);
      setStatus({ kind: 'mailto' });
    } else {
      setStatus({ kind: 'error' });
    }
  };

  const errorProps = (field: FieldName) =>
    errors[field] ? { 'aria-invalid': true as const, 'aria-describedby': `${field}-error` } : {};

  const errorText = (field: FieldName) =>
    errors[field] ? (
      <p id={`${field}-error`} className="text-label text-danger mt-1.5 flex items-start gap-1.5 font-medium">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="mt-0.5 size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        {errors[field]}
      </p>
    ) : null;

  const submitting = status.kind === 'submitting';

  return (
    <form id="formulario-contacto" noValidate onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="nombre" className={labelClass}>
          {form.nameLabel}
        </label>
        <input
          ref={refs.nombre}
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          value={nombre}
          onChange={(e) => setNombre(e.currentTarget.value)}
          className={inputClass}
          {...errorProps('nombre')}
        />
        {errorText('nombre')}
      </div>

      <div>
        <label htmlFor="negocio" className={labelClass}>
          {form.businessLabel}
        </label>
        <p id="negocio-hint" className="text-ink-subtle mb-1.5 text-sm">
          {form.businessHint}
        </p>
        <input
          id="negocio"
          name="negocio"
          type="text"
          autoComplete="organization"
          aria-describedby="negocio-hint"
          value={negocio}
          onChange={(e) => setNegocio(e.currentTarget.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contacto-campo" className={labelClass}>
          {form.contactLabel}
        </label>
        <input
          ref={refs.contacto}
          id="contacto-campo"
          name="contacto"
          type="text"
          autoComplete="on"
          value={contacto}
          onChange={(e) => setContacto(e.currentTarget.value)}
          className={inputClass}
          {...errorProps('contacto')}
        />
        {errorText('contacto')}
      </div>

      <div>
        <label htmlFor="mensaje" className={labelClass}>
          {form.messageLabel}
        </label>
        <textarea
          ref={refs.mensaje}
          id="mensaje"
          name="mensaje"
          rows={5}
          style={{ minHeight: TEXTAREA_LIMITS.minHeight, maxHeight: TEXTAREA_LIMITS.maxHeight }}
          value={mensaje}
          onChange={(e) => setMensaje(e.currentTarget.value)}
          className={textareaClass}
          {...errorProps('mensaje')}
        />
        {errorText('mensaje')}
      </div>

      <div aria-hidden="true" className="hidden">
        <label>
          Web
          <input
            name="web"
            tabIndex={-1}
            autoComplete="off"
            value={web}
            onChange={(e) => setWeb(e.currentTarget.value)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${buttonBase} ${buttonSize.lg} ${buttonVariant.primary} ${buttonDisabled} w-full`}
      >
        {submitting ? form.submitting : form.submit}
      </button>

      <p role="status" className="text-sm">
        {status.kind === 'sent' && form.success}
        {status.kind === 'mailto' && (
          <>
            {form.mailtoSuccess}{' '}
            {email && (
              <a href={`mailto:${email}`} className="text-link underline">
                {email}
              </a>
            )}
          </>
        )}
        {status.kind === 'error' && form.error}
      </p>
    </form>
  );
}
