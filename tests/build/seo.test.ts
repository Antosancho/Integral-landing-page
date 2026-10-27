import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from '../../src/config/site';
import { DIST, loadHtml, readDist } from './helpers';

const html = loadHtml('index.html');
const meta = (selector: string) => html.querySelector(selector)?.getAttribute('content');

describe('SEO de index.html', () => {
  it('lang es-AR', () => {
    expect(html.querySelector('html')?.getAttribute('lang')).toBe('es-AR');
  });

  it('title y description', () => {
    expect(html.querySelector('title')?.text).toBe(SITE.title);
    expect(meta('meta[name="description"]')).toBe(SITE.description);
  });

  it('canonical', () => {
    expect(html.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://factorintegral.ar/');
  });

  it('Open Graph y Twitter', () => {
    expect(meta('meta[property="og:title"]')).toBeTruthy();
    expect(meta('meta[property="og:description"]')).toBeTruthy();
    expect(meta('meta[property="og:url"]')).toBeTruthy();
    expect(meta('meta[property="og:image"]')).toMatch(/^https:\/\//);
    expect(meta('meta[property="og:locale"]')).toBe('es_AR');
    expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image');
  });

  it('robots y theme-color', () => {
    expect(meta('meta[name="robots"]')).toBe('index, follow');
    expect(html.querySelector('meta[name="theme-color"]')).not.toBeNull();
  });

  it('favicon y og-image', () => {
    expect(html.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.svg');
    expect(existsSync(path.join(DIST, 'favicon.svg'))).toBe(true);
    expect(existsSync(path.join(DIST, 'og-image.png'))).toBe(true);
  });

  it('JSON-LD válido', () => {
    const scripts = html.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const data = JSON.parse(scripts[0]!.text) as { '@graph': { '@type': string }[] };
    const types = data['@graph'].map((n) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['ProfessionalService', 'WebSite', 'FAQPage']));
  });

  it('robots.txt y sitemap', () => {
    expect(readDist('robots.txt')).toContain('Sitemap: https://factorintegral.ar/sitemap-index.xml');
    expect(existsSync(path.join(DIST, 'sitemap-index.xml'))).toBe(true);
  });

  it('404', () => {
    const notFound = loadHtml('404.html');
    expect(notFound.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(notFound.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
  });

  it('un solo h1', () => {
    expect(html.querySelectorAll('h1')).toHaveLength(1);
  });

  it('skip link y main', () => {
    expect(html.querySelector('a[href="#contenido"]')).not.toBeNull();
    expect(html.querySelector('main#contenido')).not.toBeNull();
  });
});
