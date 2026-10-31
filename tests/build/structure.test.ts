import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { DIST, asset, loadHtml, visibleText } from './helpers';

const root = loadHtml('index.html');
const text = visibleText(root);

describe('estructura de dist/index.html', () => {
  it('1. tiene exactamente un h1 con el titular', () => {
    const h1 = root.querySelectorAll('h1');
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toContain('Automatizamos los procesos');
  });

  it('1b. los títulos de dos líneas no quedan pegados', () => {
    expect(root.querySelector('h1')?.textContent).toContain('procesos de tu');
    expect(root.querySelector('#problema-titulo')?.textContent).toContain('plata y no');
  });

  it('2. tiene al menos 8 h2 y cada aria-labelledby apunta a un id existente', () => {
    expect(root.querySelectorAll('h2').length).toBeGreaterThanOrEqual(8);
    const sections = root.querySelectorAll('section[aria-labelledby]');
    expect(sections.length).toBeGreaterThan(0);
    for (const s of sections) {
      const id = s.getAttribute('aria-labelledby') ?? '';
      expect(root.querySelector(`[id="${id}"]`), `falta #${id}`).not.toBeNull();
    }
  });

  it('3. existen las secciones principales', () => {
    for (const id of [
      'inicio',
      'problema',
      'calculadora',
      'servicios',
      'rubros',
      'metodo',
      'equipo',
      'preguntas',
      'contacto',
      'formulario-contacto',
    ]) {
      expect(root.querySelector(`[id="${id}"]`), `falta #${id}`).not.toBeNull();
    }
  });

  it('4. el caso real está desactivado', () => {
    expect(root.querySelector('[id="caso"]')).toBeNull();
    expect(text).not.toContain('Factura a Costo');
  });

  it('5. los anclas internos apuntan a ids existentes', () => {
    const links = root.querySelectorAll('a[href^="#"]').filter((a) => a.getAttribute('href') !== '#');
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      const id = (a.getAttribute('href') ?? '').slice(1);
      expect(root.querySelector(`[id="${id}"]`), `ancla rota #${id}`).not.toBeNull();
    }
  });

  it('6. los links target=_blank tienen rel noopener', () => {
    for (const a of root.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute('rel') ?? '').toContain('noopener');
    }
  });

  it('7. todas las img tienen alt', () => {
    for (const img of root.querySelectorAll('img')) {
      expect(img.hasAttribute('alt')).toBe(true);
    }
  });

  it('8. el FAQ tiene 6 details y 6 summary', () => {
    const faq = root.querySelector('#preguntas');
    expect(faq?.querySelectorAll('details')).toHaveLength(6);
    expect(faq?.querySelectorAll('summary')).toHaveLength(6);
  });

  it('9. hay islas de calculadora y formulario', () => {
    const urls = root.querySelectorAll('astro-island').map((i) => i.getAttribute('component-url') ?? '');
    expect(urls.some((u) => u.includes('CostCalculator'))).toBe(true);
    expect(urls.some((u) => u.includes('ContactForm'))).toBe(true);
  });

  it('10. cada campo del formulario tiene su label', () => {
    const form = root.querySelector('#formulario-contacto');
    expect(form).not.toBeNull();
    const fields = (form?.querySelectorAll('input, textarea') ?? []).filter(
      (f) => f.getAttribute('name') !== 'web' && f.getAttribute('type') !== 'hidden',
    );
    expect(fields.length).toBeGreaterThan(0);
    for (const f of fields) {
      const id = f.getAttribute('id') ?? '';
      expect(id, 'campo sin id').not.toBe('');
      expect(form?.querySelector(`label[for="${id}"]`), `falta label para #${id}`).not.toBeNull();
    }
  });

  it('11. el texto visible no contiene palabras prohibidas', () => {
    const forbidden = [
      '[A CONFIRMAR]',
      'TODO',
      'lorem',
      'undefined',
      'null',
      'NaN',
      'gratis',
      'gratuito',
      'remoto',
      'todo el país',
      'factura electrónica',
      'app móvil',
      'aplicación móvil',
      'sin cargo',
    ];
    for (const word of forbidden) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = ['TODO', 'null', 'NaN', 'undefined'].includes(word)
        ? new RegExp(`\\b${escaped}\\b`)
        : new RegExp(escaped, 'i');
      expect(re.test(text), `aparece "${word}"`).toBe(false);
    }
    expect(/\b(afip|arca)\b/i.test(text), 'aparece AFIP/ARCA').toBe(false);
  });

  it('12. no quedan stubs', () => {
    expect(root.querySelectorAll('[data-stub]')).toHaveLength(0);
  });

  it('13. el segundo ul de la marquesina está aria-hidden', () => {
    const lists = root.querySelectorAll('[aria-label="Áreas del negocio que abarcamos"] ul');
    expect(lists).toHaveLength(2);
    expect(lists[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('14. el CTA flotante apunta a #contacto y no hay links a wa.me', () => {
    const cta = root.querySelector('a[data-cta="flotante"]');
    expect(cta).not.toBeNull();
    expect(cta?.getAttribute('href')).toBe('#contacto');
    expect(root.querySelectorAll('a[href*="wa.me"]')).toHaveLength(0);
  });

  it('15. el menú móvil está enlazado', () => {
    expect(root.querySelector('button[aria-controls="menu-movil"]')).not.toBeNull();
    expect(root.querySelector('#menu-movil')).not.toBeNull();
  });

  it('16. el header usa el logo PNG del DS, decorativo dentro de un link con aria-label', () => {
    const img = root.querySelector(`header img[src="${asset('/brand/factor-integral-horizontal-transparente.png')}"]`);
    expect(img).not.toBeNull();
    expect(img?.getAttribute('width')).toBe('296');
    expect(img?.getAttribute('height')).toBe('72');
    expect(img?.getAttribute('alt')).toBe('');
    expect(img?.parentNode?.getAttribute('aria-label')).toBeTruthy();
  });

  it('17. el footer usa el logo PNG con alt', () => {
    const img = root.querySelector(`footer img[src="${asset('/brand/factor-integral-horizontal-transparente.png')}"]`);
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('Factor Integral');
  });

  it('18. existen los archivos del logo y del favicon', () => {
    expect(existsSync(path.join(DIST, 'brand/factor-integral-horizontal-transparente.png'))).toBe(true);
    expect(existsSync(path.join(DIST, 'favicon.png'))).toBe(true);
  });

  it('19. no se redibuja la ∫', () => {
    expect(root.toString()).not.toContain('∫');
  });

  it('20. no hay gradientes', () => {
    const html = root.toString();
    expect(html).not.toContain('radial-gradient');
    expect(html).not.toContain('linear-gradient');
  });

  it('21. el textarea del formulario está preparado (scrollbar del DS, sin resize)', () => {
    const cls = root.querySelector('#formulario-contacto textarea#mensaje')?.getAttribute('class') ?? '';
    expect(cls).toContain('scrollbar-ds');
    expect(cls).toContain('resize-none');
  });

  it('22. el logo transparente tiene alfa', async () => {
    const { data, info } = await sharp(path.join(DIST, 'brand/factor-integral-horizontal-transparente.png'))
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(info.channels).toBe(4);
    expect(data[3]).toBe(0);
  });

  it('23. el hero tiene el logo decorativo arriba del h1', () => {
    const img = root.querySelector('#inicio img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('24. botones píldora claros', () => {
    for (const name of ['hero-calculadora', 'flotante']) {
      const cls = root.querySelector(`a[data-cta="${name}"]`)?.getAttribute('class') ?? '';
      expect(cls, name).toContain('rounded-full');
      expect(cls, name).toContain('bg-cta');
    }
  });

  it('25. problema y calculadora dentro de paneles de 28 px', () => {
    expect(root.querySelector('#problema .rounded-panel')).not.toBeNull();
    expect(root.querySelector('#calculadora .rounded-panel')).not.toBeNull();
    expect(root.querySelector('.rounded-panel #formulario-contacto')).not.toBeNull();
  });

  it('26. 5 pérdidas en "El problema"', () => {
    expect(root.querySelectorAll('#problema ul > li')).toHaveLength(5);
  });

  it('27. franja "Y también"', () => {
    const rubros = root.querySelector('#rubros');
    expect(rubros?.textContent).toContain('Y también');
    const lists = rubros?.querySelectorAll('ul') ?? [];
    expect(lists[lists.length - 1].querySelectorAll('li')).toHaveLength(4);
  });

  it('28. el sueldo muestra separador de miles', () => {
    const input = root.querySelector('#sueldo');
    expect(input?.getAttribute('type')).toBe('text');
    expect(input?.getAttribute('value')).toBe('1.200.000');
  });

  it('29. no aparece "fiado"', () => {
    expect(/fiado/i.test(text)).toBe(false);
  });

  it('30. no se empaqueta IBM Plex', () => {
    const files = readdirSync(path.join(DIST, '_astro'));
    expect(files.filter((f) => /ibm-plex/i.test(f))).toEqual([]);
  });

  it('31. secciones sin fondo alternado', () => {
    for (const s of root.querySelectorAll('section')) {
      expect(s.getAttribute('class') ?? '').not.toContain('bg-surface-sunken');
    }
  });

  it('32. hero y marquesina ocupan la primera pantalla', () => {
    const wrapper = root.querySelector('#inicio')?.parentNode;
    expect(wrapper?.classList.contains('min-h-svh')).toBe(true);
    expect(wrapper?.querySelector('[aria-label="Áreas del negocio que abarcamos"]')).not.toBeNull();
  });

  it('33. el botón "Contactar" del header se oculta abajo de lg', () => {
    // buttonBase trae inline-flex y le gana a "hidden": se oculta el contenedor, no el botón.
    const cta = root.querySelector('header a[data-cta="header-contacto"]');
    expect(cta).not.toBeNull();
    expect(cta?.classList.contains('hidden')).toBe(false);
    const wrapper = cta?.parentNode;
    expect(wrapper?.classList.contains('hidden')).toBe(true);
    expect(wrapper?.classList.contains('lg:block')).toBe(true);
  });
});
