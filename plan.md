# Plan — Publicar la landing en GitHub Pages (build de Astro con GitHub Actions)

> Plan pensado para que lo ejecute un agente de IA de menor potencia, paso a paso.
> Fecha: 29/10/2026. El plan anterior (adaptación al sistema de diseño) quedó en el historial de git.

---

## 0. Cómo usar este plan (LEER ENTERO ANTES DE EMPEZAR)

### 0.1 El problema

Al subir el repo a GitHub Pages el deploy falla con:

```
ghcr.io/actions/jekyll-build-pages ...
YAML Exception reading /github/workspace/src/components/ui/Card.astro: mapping values are not allowed ...
ERROR: YOUR SITE COULD NOT BE BUILT: Invalid YAML front matter in .../src/components/sections/Caso.astro
```

**Causa:** el repo tiene Pages configurado como *"Deploy from a branch"*. En ese modo GitHub corre **Jekyll** sobre
el código fuente. Jekyll toma el bloque `--- ... ---` del principio de cada `.astro` como *front matter YAML*; como
adentro hay TypeScript, no lo puede parsear y se cae. Y aunque no se cayera, publicaría el código fuente y no la
página buildeada (`dist/`).

**Solución:**
1. Un workflow de **GitHub Actions** que instale dependencias, corra `npm run verify`, buildee la página con la URL
   de GitHub Pages y publique `dist/` con las acciones oficiales de Pages.
2. Como la página va a vivir en una **subruta** (`https://antosancho.github.io/Integral-landing-page/`), Astro tiene
   que conocer ese `base` y **todos los links absolutos a archivos de `public/`** (logo, favicon, og-image, sitemap,
   link de la 404) tienen que llevar ese prefijo.
3. El usuario cambia en GitHub *Settings → Pages → Source* a **"GitHub Actions"** (paso manual, §6).

### 0.2 Decisiones ya tomadas con el usuario (no rediscutir)

| Tema | Decisión |
|---|---|
| URL publicada | `https://antosancho.github.io/Integral-landing-page/` por ahora. El dominio `factorintegral.ar` sigue siendo el default en local y en `SITE.url`. |
| Cómo se pasa la URL | Por **variables de entorno** `SITE_URL` y `BASE_PATH`, leídas en `astro.config.ts`. Sin variables → `SITE.url` y `/` (comportamiento actual intacto). |
| Tests en CI | El workflow corre **`npm run verify` completo** antes de publicar. Si algo falla, no se publica. |
| JSON-LD (`src/lib/seo.ts`) | **No se toca.** Sigue usando `SITE.url` (identidad de la marca). |

### 0.3 Reglas para el agente

- Leé `CLAUDE.md` antes de empezar. Respetá sus convenciones (TypeScript estricto, sin `any`, imports relativos,
  funciones puras en `src/lib/` con su `.test.ts` al lado).
- **No commitear ni pushear.** No tocar la configuración de GitHub (eso lo hace el usuario).
- No cambiar textos visibles, estilos ni la calculadora.
- Hacé los pasos en orden. Al final de cada fase corré lo que dice "Verificación".
- Shell: Windows con Git Bash disponible. Para pasar variables de entorno en un comando usá Git Bash
  (`SITE_URL=... BASE_PATH=... npm run build`).

---

## 1. Fase 1 — Función pura `withBase`

### 1.1 Crear `src/lib/paths.ts`

Exportar una sola función:

```ts
export function withBase(path: string, base: string): string
```

Comportamiento exacto (es lo que validan los tests):
- Normaliza `base` para que **empiece y termine con `/`**: `''` → `/`, `/` → `/`, `/Integral-landing-page` →
  `/Integral-landing-page/`, `/Integral-landing-page/` → igual, `Integral-landing-page` → `/Integral-landing-page/`.
- Le saca a `path` las `/` del principio y concatena: `base normalizado + path sin / inicial`.
- No toca URLs absolutas: si `path` empieza con `http://`, `https://` o `#`, lo devuelve tal cual.

Comentario de una línea arriba de la función, en español, igual que el resto de `src/lib/`.

### 1.2 Crear `src/lib/paths.test.ts`

Casos (uno por `it`, o `it.each`):

| path | base | esperado |
|---|---|---|
| `/favicon.png` | `/` | `/favicon.png` |
| `/favicon.png` | `''` | `/favicon.png` |
| `/favicon.png` | `/Integral-landing-page` | `/Integral-landing-page/favicon.png` |
| `/favicon.png` | `/Integral-landing-page/` | `/Integral-landing-page/favicon.png` |
| `favicon.png` | `/Integral-landing-page/` | `/Integral-landing-page/favicon.png` |
| `/brand/factor-integral-horizontal-oscuro.png` | `/Integral-landing-page` | `/Integral-landing-page/brand/factor-integral-horizontal-oscuro.png` |
| `/` | `/` | `/` |
| `/` | `/Integral-landing-page` | `/Integral-landing-page/` |
| `''` | `/Integral-landing-page` | `/Integral-landing-page/` |
| `#contacto` | `/Integral-landing-page` | `#contacto` |
| `https://factorintegral.ar/x.png` | `/Integral-landing-page` | `https://factorintegral.ar/x.png` |

**Verificación:** `npm test` → todo verde.

---

## 2. Fase 2 — Configuración de Astro

### 2.1 `astro.config.ts`

Cambiar `defineConfig` para que lea las variables de entorno:

```ts
export default defineConfig({
  site: process.env.SITE_URL || SITE.url,
  base: process.env.BASE_PATH || '/',
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- Usar `||` (no `??`) para que una variable vacía cuente como no definida.
- `SITE_URL` es solo el **origen** (ej. `https://antosancho.github.io`), sin la subruta. La subruta va en `BASE_PATH`.
- No tocar `src/config/site.ts` (no puede usar `import.meta.env`; ver el comentario de su primera línea).

**Verificación:** `npm run build` sin variables → tiene que generar lo mismo que antes. `npm run test:build` verde.

---

## 3. Fase 3 — Links absolutos con base

En cada archivo, importar `withBase` desde `src/lib/paths.ts` (import relativo) y usar
`import.meta.env.BASE_URL` como `base`.

### 3.1 `src/components/ui/LogoMark.astro`
- `src="/brand/factor-integral-horizontal-oscuro.png"` → `src={withBase('/brand/factor-integral-horizontal-oscuro.png', import.meta.env.BASE_URL)}`.

### 3.2 `src/components/seo/SEO.astro`
- Los dos `href="/favicon.png"` (icon y apple-touch-icon) → `withBase('/favicon.png', import.meta.env.BASE_URL)`.
- `href="/sitemap-index.xml"` → `withBase('/sitemap-index.xml', import.meta.env.BASE_URL)`.
- **og:image / twitter:image:** hoy es `new URL(image, Astro.site ?? SITE.url)`. Con una subruta eso pierde el
  prefijo (`new URL('/og-image.png', 'https://x.github.io/Integral-landing-page')` → `https://x.github.io/og-image.png`).
  Cambiar a `new URL(withBase(image, import.meta.env.BASE_URL), Astro.site ?? SITE.url).toString()`.
- **canonical:** dejarlo como está (`new URL(Astro.url.pathname, Astro.site)`); `Astro.url.pathname` ya incluye el
  base. El test de la fase 4 lo confirma. Si el test muestra que **no** lo incluye, recién ahí aplicar `withBase`.

### 3.3 `src/pages/404.astro`
- `<Button href="/">` → `<Button href={withBase('/', import.meta.env.BASE_URL)}>`.

### 3.4 `src/pages/robots.txt.ts`
- Hoy: `new URL('sitemap-index.xml', site)`. Si `site` no termina en `/` y tiene subruta, `new URL` relativo pierde
  el último segmento. Cambiar a `new URL(withBase('/sitemap-index.xml', import.meta.env.BASE_URL), site)`.

### 3.5 Buscar si quedó alguno
Correr un grep en `src/` (excluyendo tests) por `src="/`, `href="/` y `'/` que apunten a archivos de `public/`
(`brand/`, `favicon`, `og-image`, `sitemap`). Los links `#ancla` **no** se tocan. Si aparece otro, aplicarle
`withBase` igual.

**Verificación:** `npm run typecheck` y `npm test` verdes.

---

## 4. Fase 4 — Tests sobre `dist/` que entiendan el base

Los tests de `tests/build/` hoy tienen hardcodeado `https://factorintegral.ar/` y `/favicon.png`. Se hacen
dependientes de las mismas variables de entorno, así sirven para el build local **y** para el build de Pages.

### 4.1 `tests/build/helpers.ts`
Agregar (importando `SITE` de `../../src/config/site` y `withBase` de `../../src/lib/paths`):

```ts
export const SITE_ORIGIN = (process.env.SITE_URL || SITE.url).replace(/\/+$/, '');
export const BASE = process.env.BASE_PATH || '/';
export const asset = (p: string) => withBase(p, BASE);          // ruta relativa al dominio
export const absolute = (p: string) => SITE_ORIGIN + asset(p);  // URL completa
```

### 4.2 `tests/build/seo.test.ts`
- canonical → `absolute('/')`.
- favicon e apple-touch-icon → `asset('/favicon.png')`.
- robots.txt → `toContain(\`Sitemap: ${absolute('/sitemap-index.xml')}\`)`.
- **Nuevo test** `og:image apunta al archivo con base`: `meta('meta[property="og:image"]')` es
  `absolute('/og-image.png')`, y lo mismo `twitter:image`.
- **Nuevo test** `link rel=sitemap con base`: `href` es `asset('/sitemap-index.xml')`.
- **Nuevo test** `404 vuelve al inicio con base`: en `404.html`, el `a` con texto "Volver al inicio" tiene
  `href === asset('/')`.

### 4.3 `tests/build/structure.test.ts`
- Los selectores `header img[src="/brand/..."]` y `footer img[src="/brand/..."]` → armarlos con
  `asset('/brand/factor-integral-horizontal-oscuro.png')` (template string dentro del selector).

### 4.4 **Nuevo test** en `tests/build/seo.test.ts`: los assets de Astro llevan el base
- Recorrer todos los `script[src]`, `link[rel="stylesheet"][href]` y `link[rel="preload"][href]` (y cualquier
  `href`/`src` que empiece con `/`) de `index.html` y verificar que **todos** empiecen con `asset('/')`.
  Esto atrapa cualquier link absoluto que se haya olvidado en la fase 3.

### 4.5 **Nuevo test**: todo archivo referenciado existe en `dist/`
- Para cada `src`/`href` de `index.html` que empiece con `asset('/')` y no termine en `/`: sacarle el prefijo
  `asset('/')` y verificar con `existsSync(path.join(DIST, resto))` que el archivo exista. Así se confirma que
  favicon, logo, og-image, CSS y JS se van a encontrar en Pages.

**Verificación (las dos, en este orden):**
1. Build local: `npm run verify` → todo verde.
2. Build como Pages (Git Bash):
   ```bash
   SITE_URL=https://antosancho.github.io BASE_PATH=/Integral-landing-page npm run build
   SITE_URL=https://antosancho.github.io BASE_PATH=/Integral-landing-page npm run test:build
   ```
   → todo verde. Revisar a mano `dist/index.html`: el canonical tiene que ser
   `https://antosancho.github.io/Integral-landing-page/` y el logo `/Integral-landing-page/brand/...`.
3. Volver a correr `npm run build` sin variables para dejar `dist/` como estaba.

---

## 5. Fase 5 — Workflow de GitHub Actions

### 5.1 Crear `.github/workflows/deploy.yml`

```yaml
name: Deploy a GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Verificar (typecheck + tests + build + tests de build)
        run: npm run verify
      - id: pages
        uses: actions/configure-pages@v5
      - name: Build para Pages
        run: npm run build
        env:
          SITE_URL: ${{ steps.pages.outputs.origin }}
          BASE_PATH: ${{ steps.pages.outputs.base_path }}
      - name: Tests sobre el build de Pages
        run: npm run test:build
        env:
          SITE_URL: ${{ steps.pages.outputs.origin }}
          BASE_PATH: ${{ steps.pages.outputs.base_path }}
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Notas:
- `configure-pages` devuelve `origin` = `https://antosancho.github.io` y `base_path` = `/Integral-landing-page`.
  El día que se configure `factorintegral.ar` como dominio propio, devuelve ese origen y `base_path` vacío → la
  config cae en `/` sola, sin tocar código.
- `npm run verify` corre con los valores por defecto (factorintegral.ar, `/`); después se rebuildea para Pages.
- No hace falta `.nojekyll`: con el deploy por Actions Jekyll no corre.
- Si `npm ci` falla por el lockfile, **no** regenerarlo a ciegas: reportarlo.

### 5.2 Validar el YAML
- Indentación con 2 espacios, sin tabs. Si hay `npx` disponible, se puede validar con
  `npx --yes yaml-lint .github/workflows/deploy.yml` (opcional; si no anda, revisarlo a ojo).

---

## 6. Fase 6 — Documentación y paso manual

### 6.1 `CLAUDE.md`
- En **Comandos**, agregar una línea: build como Pages
  `SITE_URL=https://antosancho.github.io BASE_PATH=/Integral-landing-page npm run build`.
- En **Organización del código**, agregar `paths.ts  withBase: prefija rutas de public/ con el base de Astro` en `lib/`
  y `.github/workflows/deploy.yml` (build + verify + deploy a Pages).
- En **Convenciones**, agregar: "Links a archivos de `public/` siempre con `withBase(ruta, import.meta.env.BASE_URL)`;
  nunca `src="/..."` a mano (la página vive en una subruta en GitHub Pages)."

### 6.2 `README.md`
- Agregar sección corta "Deploy" con: se publica sola en cada push a `main` vía GitHub Actions; requisito único:
  *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

### 6.3 Paso manual del usuario (el agente NO lo hace, solo lo informa al final)
1. GitHub → repo → *Settings → Pages → Source*: cambiar de "Deploy from a branch" a **"GitHub Actions"**.
2. Commit + push a `main` (o *Actions → Deploy a GitHub Pages → Run workflow*).

---

## 7. Checklist final

- [ ] `src/lib/paths.ts` + `paths.test.ts` con todos los casos de §1.2.
- [ ] `astro.config.ts` lee `SITE_URL` y `BASE_PATH`.
- [ ] Logo, favicon (×2), link sitemap, og:image, twitter:image, 404 y robots.txt usan `withBase`.
- [ ] Tests de `tests/build/` usan `asset()`/`absolute()`; tests nuevos de §4.2, §4.4 y §4.5.
- [ ] `npm run verify` verde sin variables.
- [ ] Build + `test:build` verdes con `SITE_URL`/`BASE_PATH` de Pages.
- [ ] `dist/` regenerado sin variables al final.
- [ ] `.github/workflows/deploy.yml` creado.
- [ ] `CLAUDE.md` y `README.md` actualizados.
- [ ] Nada commiteado. Informe final con: archivos tocados, salida resumida de los tests y el paso manual de §6.3.
