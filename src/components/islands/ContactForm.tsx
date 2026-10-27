import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import type { contactoCopy } from '../../data/contacto';
import { submitContact } from '../../lib/contact-submit';
import { consumeContactPrefill, subscribeContactPrefill } from '../../lib/prefill';
import { isSpam, validateContact, type ContactErrors, type ContactInput } from '../../lib/validation';

interface Props {
  copy: typeof contactoCopy;
  email: string | null;
  endpoint: string | null;
  onNavigate?: (url: string) => void;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent' }
  | { kind: 'mailto' }
  | { kind: 'error' };

type FieldName = 'nombre' | 'contacto' | 'mensaje';

const FIELD_ORDER: readonly FieldName[] = ['nombre', 'contacto', 'mensaje'];

const fieldClass =
  'w-full rounded-xl border border-field-border bg-surface-2 px-4 py-3 text-text aria-[invalid=true]:border-accent focus:border-accent';

export default function ContactForm({ copy, email, endpoint, onNavigate }: Props) {
  const [nombre, setNombre] = useState('');
  const [negocio, setNegocio] = useState('');
  const [contacto, setContacto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [web, setWeb] = useState('');
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const refs = {
    nombre: useRef<HTMLInputElement>(null),
    contacto: useRef<HTMLInputElement>(null),
    mensaje: useRef<HTMLTextAreaElement>(null),
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
      <p id={`${field}-error`} className="mt-1 text-sm text-accent">
        {errors[field]}
      </p>
    ) : null;

  const submitting = status.kind === 'submitting';

  return (
    <form id="formulario-contacto" noValidate onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="nombre" className="mb-1 block font-bold">
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
          className={fieldClass}
          {...errorProps('nombre')}
        />
        {errorText('nombre')}
      </div>

      <div>
        <label htmlFor="negocio" className="mb-1 block font-bold">
          {form.businessLabel}
        </label>
        <p id="negocio-hint" className="mb-1 text-sm text-muted">
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
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="contacto-campo" className="mb-1 block font-bold">
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
          className={fieldClass}
          {...errorProps('contacto')}
        />
        {errorText('contacto')}
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1 block font-bold">
          {form.messageLabel}
        </label>
        <textarea
          ref={refs.mensaje}
          id="mensaje"
          name="mensaje"
          rows={5}
          value={mensaje}
          onChange={(e) => setMensaje(e.currentTarget.value)}
          className={fieldClass}
          {...errorProps('mensaje')}
        />
        {errorText('mensaje')}
      </div>

      <div aria-hidden="true" className="hidden">
        <label>
          Web
          <input name="web" tabIndex={-1} autoComplete="off" value={web} onChange={(e) => setWeb(e.currentTarget.value)} />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-text px-6 py-3 text-[15px] font-bold text-bg hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? form.submitting : form.submit}
      </button>

      <p role="status" className="text-sm">
        {status.kind === 'sent' && form.success}
        {status.kind === 'mailto' && (
          <>
            {form.mailtoSuccess}{' '}
            {email && (
              <a href={`mailto:${email}`} className="text-accent underline">
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
