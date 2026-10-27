import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

export const DIST = path.resolve(process.cwd(), 'dist');

export function readDist(file: string): string {
  const full = path.join(DIST, file);
  if (!existsSync(full)) {
    throw new Error(`Falta dist/${file} — corré npm run build antes de npm run test:build`);
  }
  return readFileSync(full, 'utf-8');
}

export function loadHtml(file = 'index.html'): HTMLElement {
  return parse(readDist(file));
}

export function visibleText(root: HTMLElement): string {
  const body = root.querySelector('body');
  if (!body) return '';
  const clone = parse(body.toString());
  clone.querySelectorAll('script, style').forEach((el) => el.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}
