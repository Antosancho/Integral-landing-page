// Prefija una ruta de public/ con el base de Astro (la página vive en una subruta en GitHub Pages).
export function withBase(path: string, base: string): string {
  if (/^(https?:\/\/|#)/.test(path)) return path;
  let normalized = base;
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (!normalized.endsWith('/')) normalized = `${normalized}/`;
  return normalized + path.replace(/^\/+/, '');
}
