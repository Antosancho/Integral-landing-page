import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contactoCopy } from '../../data/contacto';
import { setContactPrefill } from '../../lib/prefill';
import ContactForm from './ContactForm';

const { form, errors } = contactoCopy;
const EMAIL = 'hola@factorintegral.ar';

type Props = Partial<Parameters<typeof ContactForm>[0]>;
const renderForm = (props: Props = {}) =>
  render(<ContactForm copy={contactoCopy} email={EMAIL} endpoint={null} {...props} />);

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(form.nameLabel), 'Ana');
  await user.type(screen.getByLabelText(form.contactLabel), 'ana@ejemplo.com');
  await user.type(screen.getByLabelText(form.messageLabel), 'Quiero automatizar mis boletas');
}

describe('ContactForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza los 4 campos y el botón', () => {
    renderForm();
    expect(screen.getByLabelText(form.nameLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(form.businessLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(form.contactLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(form.messageLabel)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: form.submit })).toBeInTheDocument();
  });

  it('enviar vacío muestra errores y enfoca el nombre', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: form.submit }));
    expect(screen.getByText(errors.nameRequired)).toBeInTheDocument();
    expect(screen.getByText(errors.contactRequired)).toBeInTheDocument();
    expect(screen.getByText(errors.messageRequired)).toBeInTheDocument();
    for (const label of [form.nameLabel, form.contactLabel, form.messageLabel]) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
    }
    expect(screen.getByLabelText(form.nameLabel)).toHaveFocus();
  });

  it('prefill antes de montar', () => {
    setContactPrefill('Hola');
    renderForm();
    expect(screen.getByLabelText(form.messageLabel)).toHaveValue('Hola');
  });

  it('prefill después de montar', () => {
    renderForm();
    act(() => setContactPrefill('Otro'));
    expect(screen.getByLabelText(form.messageLabel)).toHaveValue('Otro');
  });

  it('un prefill no pisa lo que escribió la persona: lo agrega', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(form.messageLabel), 'Mi texto');
    act(() => setContactPrefill('Resumen'));
    expect(screen.getByLabelText(form.messageLabel)).toHaveValue('Mi texto\n\nResumen');
  });

  it('dos prefills seguidos sin escribir: queda solo el segundo', () => {
    renderForm();
    act(() => setContactPrefill('Primero'));
    act(() => setContactPrefill('Segundo'));
    expect(screen.getByLabelText(form.messageLabel)).toHaveValue('Segundo');
  });

  it('no envía dos veces con dos clics rápidos', async () => {
    let resolveFetch: (v: { ok: boolean }) => void = () => {};
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderForm({ endpoint: 'https://ejemplo.test/contacto' });
    await fillValid(user);
    const btn = screen.getByRole('button', { name: form.submit });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveFetch({ ok: true });
    });
    expect(await screen.findByText(form.success)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('envía al endpoint y muestra éxito', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderForm({ endpoint: 'https://ejemplo.test/contacto' });
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: form.submit }));
    expect(await screen.findByText(form.success)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(form.nameLabel)).toHaveValue('');
  });

  it('sin endpoint usa mailto', async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    renderForm({ onNavigate });
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: form.submit }));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledTimes(1));
    expect(onNavigate.mock.calls[0][0]).toMatch(new RegExp(`^mailto:${EMAIL}`));
    expect(await screen.findByText(new RegExp(form.mailtoSuccess))).toBeInTheDocument();
  });

  it('honeypot lleno no envía y muestra éxito', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderForm({ endpoint: 'https://ejemplo.test/contacto' });
    await fillValid(user);
    await user.type(screen.getByLabelText('Web'), 'spam');
    await user.click(screen.getByRole('button', { name: form.submit }));
    expect(await screen.findByText(form.success)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetch con ok false muestra error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const user = userEvent.setup();
    renderForm({ endpoint: 'https://ejemplo.test/contacto' });
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: form.submit }));
    expect(await screen.findByText(form.error)).toBeInTheDocument();
  });
});

function mockScrollHeight(value: number) {
  Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => value,
  });
}

describe('ContactForm — textarea que crece', () => {
  afterEach(() => {
    delete (HTMLTextAreaElement.prototype as unknown as Record<string, unknown>).scrollHeight;
  });

  const getTextarea = () => screen.getByLabelText(form.messageLabel) as HTMLTextAreaElement;

  it('mensaje corto: alto mínimo y sin scroll', () => {
    mockScrollHeight(60);
    renderForm();
    act(() => setContactPrefill('Hola'));
    expect(getTextarea().style.height).toBe('144px');
    expect(getTextarea().style.overflowY).toBe('hidden');
  });

  it('prefill largo: crece hasta el máximo y habilita scroll', () => {
    mockScrollHeight(600);
    renderForm();
    act(() => setContactPrefill('x'.repeat(700)));
    expect(getTextarea().style.height).toBe('320px');
    expect(getTextarea().style.overflowY).toBe('auto');
  });

  it('alto intermedio: sigue al contenido', () => {
    mockScrollHeight(230);
    renderForm();
    act(() => setContactPrefill('x'.repeat(300)));
    expect(getTextarea().style.height).toBe('230px');
    expect(getTextarea().style.overflowY).toBe('hidden');
  });

  it('al borrar el texto vuelve al mínimo', () => {
    mockScrollHeight(600);
    renderForm();
    act(() => setContactPrefill('x'.repeat(700)));
    expect(getTextarea().style.height).toBe('320px');
    mockScrollHeight(60);
    fireEvent.change(getTextarea(), { target: { value: '' } });
    expect(getTextarea().style.height).toBe('144px');
  });

  it('usa las clases del DS', () => {
    renderForm();
    expect(getTextarea()).toHaveClass('resize-none', 'scrollbar-ds');
  });

  it('al redimensionar la ventana recalcula', () => {
    mockScrollHeight(60);
    renderForm();
    act(() => setContactPrefill('Hola'));
    expect(getTextarea().style.height).toBe('144px');
    mockScrollHeight(600);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(getTextarea().style.height).toBe('320px');
  });

  it('el error del mensaje lleva ícono', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: form.submit }));
    const p = document.getElementById('mensaje-error');
    expect(p?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
