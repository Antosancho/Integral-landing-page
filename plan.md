# Plan — Landing de Factor Integral (Astro + React + Tailwind)

> Plan pensado para que lo ejecuten agentes de IA paso a paso.
> Fecha: 27/10/2026. Idioma de la página: español rioplatense con voseo.

---

## 0. Cómo usar este plan (LEER ENTERO ANTES DE EMPEZAR)

### 0.1 Objetivo

Rehacer desde cero el proyecto como una **landing de una sola página en Astro**, con buen SEO (HTML pre-renderizado),
que respete la **estética del prototipo** (tema oscuro azul noche, acento celeste, Plus Jakarta Sans, tarjetas
redondeadas, botones píldora) y cuyos **textos estén ajustados al contexto real de la empresa** (ver §2).

Alcance de esta etapa ("estructura avanzada"):
- Las 12 secciones maquetadas, con el contenido leído desde archivos de datos (`src/data/*`).
- Calculadora 100 % funcional (isla React), con los bugs del prototipo corregidos y tests.
- Formulario de contacto validado en el front; el envío usa un endpoint configurable y, si no hay, cae a `mailto:`.
- SEO técnico completo: meta tags, Open Graph, JSON-LD, sitemap, robots, favicon, 404.
- Tests unitarios, de componentes y de la página ya generada (`dist/`).

### 0.2 Reparto entre agentes

| Fase | Agente | Secciones del plan | Puede correr en paralelo con |
|---|---|---|---|
| A | **Agente A — Base** | §3, §4, §5, §6, §7, §8, §9 | Nadie (va primero) |
| B | **Agente B — Islas interactivas** | §10, §11 | Agente C |
| C | **Agente C — Secciones y layout** | §12, §13, §14 | Agente B |
| D | Revisión (orquestador / revisor) | §15 | — |

**Regla de propiedad de archivos:** cada agente SOLO crea o modifica los archivos que su fase lista como propios.
Si necesitás cambiar un archivo de otro agente, NO lo toques: anotalo en tu reporte final.

### 0.3 Reglas generales para todos los agentes

1. Sistema: Windows, pero usá la herramienta Bash (sintaxis POSIX). Directorio del proyecto:
   `H:\anton\Proyectos\Integral-landing-page` (en Bash: `/h/anton/Proyectos/Integral-landing-page`).
2. **Antes de empezar**, corré `node -v`. Tiene que ser **≥ 22.23.4** (Astro 7.4 lo exige). Si es menor, **frená y
   reportá** "Node desactualizado"; no intentes instalar Node ni bajar versiones de paquetes.
3. **No hagas `git commit`, `git push` ni cambios de ramas.** El usuario commitea.
4. No inventes datos (clientes, cifras de ahorro, precios, testimonios, teléfonos). Si falta algo, usá `null` en la
   configuración y hacé que la UI oculte ese elemento. **Nunca** se debe ver en pantalla `[A CONFIRMAR]`, `TODO` ni
   "lorem".
5. Copiá los textos de §7 **tal cual**. No los "mejores" ni agregues frases.
6. TypeScript estricto. Nada de `any`. Imports con rutas relativas (no configures alias).
7. Estilos SOLO con clases de Tailwind que usen los tokens de §6. Prohibido poner colores hex sueltos en componentes
   (la única excepción es el script de la imagen OG y el favicon SVG).
8. Después de cada paso con código, corré el comando de verificación que indica el paso. Si falla, arreglalo antes
   de seguir. Si no podés arreglarlo en 3 intentos, frená y reportá el error exacto.
9. Al terminar, reportá: archivos creados/modificados, salida resumida de los comandos de verificación y cualquier
   desvío del plan.

---

## 1. Decisiones de arquitectura (ya tomadas, no rediscutir)

| Tema | Decisión | Por qué |
|---|---|---|
| Framework | **Astro 7.4** (salida estática) | HTML pre-renderizado = mejor SEO y primera carga |
| Interactividad | **Islas React 19** solo en calculadora y formulario | El resto es HTML puro, sin JS |
| Estilos | **Tailwind CSS 4** vía `@tailwindcss/vite`, tokens en `@theme` | Pedido del usuario |
| Fuente | `@fontsource-variable/plus-jakarta-sans` (self-hosted) | Sin pedidos a Google Fonts, menos CLS |
| Contenido | Archivos TS tipados en `src/data/` | Editar textos sin tocar componentes; tipado = menos errores |
| Tests | **Vitest 5** + Testing Library + jsdom; tests del `dist/` con `node-html-parser` | Detectar bugs de lógica, UI y SEO |
| Typecheck | `astro check` | Revisa `.astro`, `.ts` y `.tsx` |
| FAQ | `<details>/<summary>` nativo (sin JS) | Accesible y liviano |
| Menú móvil | `<script>` chico dentro de `Header.astro` | No justifica una isla React |
| Comunicación calculadora → formulario | Store en `globalThis` (`src/lib/prefill.ts`) | Las islas son independientes; el store compartido sobrevive aunque el bundler duplique el módulo |

Configuración verificada (se probó en un proyecto aparte el 27/10/2026): Astro 7.4.2 + @astrojs/react 7.1.1 +
@astrojs/sitemap + Tailwind 4.3 + Vitest 5 con `getViteConfig` compila, genera el sitemap, hidrata la isla y pasa
`astro check` sin errores.

---

## 2. Reglas de contenido (salen del contexto de la empresa)

- La empresa está en **Chabás y alrededores (sur de Santa Fe)**. El diferencial es la **presencia**: van al local a
  relevar, instalar y capacitar. **No** decir "remoto" ni "todo el país".
- Cliente inicial: almacenes, minimarkets, kioscos, despensas; además pymes de la zona (p. ej. distribuidoras mayoristas).
- Argumento central: **"Perdés plata y no la ves."** El foco es la plata que se pierde y se recupera.
- **No** hay clientes ni casos de éxito: la sección "Caso real" se construye pero queda **desactivada** (`enabled: false`).
- **No** afirmar factura electrónica ni integración con ARCA/AFIP. **No** presentar IA dentro del sistema Integral
  como disponible. **No** prometer app móvil, versión web ni plazos.
- **No** presentar nada como gratis ("gratis", "gratuito", "sin cargo" están prohibidos).
- **No** mostrar precios.
- WhatsApp todavía no está definido → `whatsapp: null` → los links a WhatsApp no se muestran.

---

## 3. Estructura final del proyecto

```
/
├─ .gitignore
├─ .nvmrc                        → "24"
├─ .prettierrc.json
├─ .vscode/extensions.json
├─ astro.config.ts
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts              → tests unitarios y de componentes (jsdom)
├─ vitest.build.config.ts        → tests sobre dist/ (node)
├─ README.md
├─ plan.md
├─ public/
│  ├─ favicon.svg
│  └─ og-image.png               → generada por scripts/generate-og.mjs
├─ scripts/
│  └─ generate-og.mjs
├─ src/
│  ├─ config/site.ts             → datos globales del sitio (nombre, URL, email, nav…)
│  ├─ data/                      → TODO el texto de la página
│  │  ├─ types.ts
│  │  ├─ hero.ts  areas.ts  problema.ts  calculadora.ts  servicios.ts  rubros.ts
│  │  ├─ metodo.ts  caso.ts  equipo.ts  faq.ts  contacto.ts  footer.ts
│  │  └─ content.test.ts         → reglas de contenido (palabras prohibidas, estructura)
│  ├─ lib/
│  │  ├─ format.ts (+ .test.ts)          → formato de pesos y horas es-AR
│  │  ├─ contact.ts (+ .test.ts)         → links wa.me y mailto
│  │  ├─ seo.ts (+ .test.ts)             → JSON-LD
│  │  ├─ prefill.ts (+ .test.ts)         → store calculadora → formulario
│  │  ├─ calculator.ts (+ .test.ts)      → [Agente B] fórmulas puras
│  │  ├─ validation.ts (+ .test.ts)      → [Agente B] validación del formulario
│  │  └─ contact-submit.ts (+ .test.ts)  → [Agente B] envío del formulario
│  ├─ styles/global.css          → Tailwind + tokens
│  ├─ layouts/BaseLayout.astro
│  ├─ components/
│  │  ├─ seo/SEO.astro
│  │  ├─ ui/ Container.astro  Section.astro  SectionLabel.astro  SectionHeading.astro
│  │  │      Button.astro  Card.astro  Avatar.astro  LogoMark.astro
│  │  ├─ layout/ Header.astro  Footer.astro  FloatingCTA.astro
│  │  ├─ sections/ Hero.astro  AreasMarquee.astro  Problema.astro  CalculadoraSection.astro
│  │  │            Servicios.astro  Rubros.astro  Metodo.astro  Caso.astro  Equipo.astro
│  │  │            FAQ.astro  Contacto.astro
│  │  └─ islands/ CostCalculator.tsx (+ .test.tsx)  ContactForm.tsx (+ .test.tsx)
│  └─ pages/
│     ├─ index.astro
│     ├─ 404.astro
│     └─ robots.txt.ts
└─ tests/
   ├─ setup.ts
   └─ build/
      ├─ helpers.ts
      ├─ seo.test.ts             → [Agente A]
      └─ structure.test.ts       → [Agente C]
```

---

## FASE A — Agente A (Base)

**Archivos propios del Agente A:** todo lo de §3 **excepto** `src/lib/calculator.ts`, `src/lib/validation.ts`,
`src/lib/contact-submit.ts` (y sus tests), `tests/build/structure.test.ts` y `README.md`.
El Agente A crea **versiones stub** (provisorias) de las secciones y de las islas; los Agentes B y C las reemplazan.

## 4. Limpiar el proyecto viejo e instalar

### 4.1 Verificar Node
- `node -v` ≥ 22.23.4. Si no, frenar (ver §0.3).

### 4.2 Borrar el scaffold de Vite
Borrar exactamente esto (nada más):
```
src/  public/  node_modules/  index.html  vite.config.ts  tsconfig.json  tsconfig.app.json
tsconfig.node.json  eslint.config.js  package.json  package-lock.json
```
**No borrar:** `.git/`, `.gitattributes`, `.gitignore`, `README.md`, `plan.md`.

### 4.3 Crear `package.json`
```json
{
  "name": "factor-integral-landing",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=22.23.4" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:build": "vitest run --config vitest.build.config.ts",
    "og": "node scripts/generate-og.mjs",
    "format": "prettier --write .",
    "verify": "npm run typecheck && npm run test && npm run build && npm run test:build"
  }
}
```

### 4.4 Instalar dependencias
```bash
npm i astro@^7.4.2 @astrojs/react@^7.1.1 @astrojs/sitemap@^3.7.4 react@^19.3.1 react-dom@^19.3.1 \
  tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 @fontsource-variable/plus-jakarta-sans@^5.3.0
npm i -D typescript@~6.0.3 @astrojs/check@^0.9.12 @types/react@^19.3.0 @types/react-dom@^19.3.0 \
  vitest@^5.0.5 jsdom@^30.1.3 @testing-library/react@^16.3.3 @testing-library/user-event@^14.6.8 \
  @testing-library/jest-dom@^7.0.1 node-html-parser@^9.0.5 sharp@^0.35.5 \
  prettier@^3.9.10 prettier-plugin-astro@^1.1.2 prettier-plugin-tailwindcss@^0.8.1
```
Verificación: `npm ls astro @astrojs/react tailwindcss vitest` no muestra `ERR` ni `missing`.

## 5. Archivos de configuración

### 5.1 `astro.config.ts`
```ts
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/config/site';

export default defineConfig({
  site: SITE.url,
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```
(Si `astro build` falla al importar `./src/config/site`, pasá el archivo a `astro.config.mjs` con la URL literal
`'https://factorintegral.ar'` y agregá un comentario `// mantener igual a SITE.url en src/config/site.ts`.)

### 5.2 `tsconfig.json`
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "react" }
}
```

### 5.3 `vitest.config.ts` (unitarios + componentes)
```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

### 5.4 `vitest.build.config.ts` (tests sobre `dist/`)
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['tests/build/**/*.test.ts'] },
});
```

### 5.5 `tests/setup.ts`
Tiene que:
1. `import '@testing-library/jest-dom/vitest';`
2. Ejecutar `cleanup()` de Testing Library en `afterEach`.
3. Definir un mock de `window.matchMedia` (jsdom no lo trae) que por defecto devuelva `matches: false` y tenga
   `addEventListener`/`removeEventListener`/`addListener`/`removeListener` como `vi.fn()`. Debe poder
   sobrescribirse en un test.
4. Definir `Element.prototype.scrollIntoView = vi.fn()` (jsdom no lo implementa).
5. Si existe la función `__resetContactPrefill` de `src/lib/prefill.ts`, llamarla en `afterEach`.

### 5.6 Otros
- `.gitignore`: el actual más `dist/`, `.astro/`, `.env`, `.env.*` (dejá `!.env.example` si lo agregás).
- `.nvmrc`: `24`
- `.prettierrc.json`: `{ "singleQuote": true, "printWidth": 110, "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"], "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }] }`
- `.vscode/extensions.json`: recomendar `astro-build.astro-vscode` y `bradlc.vscode-tailwindcss`.

## 6. Estilos globales y tokens — `src/styles/global.css`

Estructura (respetar los valores exactos):
```css
@import '@fontsource-variable/plus-jakarta-sans';
@import 'tailwindcss';

@theme {
  --font-sans: 'Plus Jakarta Sans Variable', 'Segoe UI', system-ui, sans-serif;

  --color-bg: #07111b;
  --color-bg-deep: #040a11;
  --color-surface: #0d1e2f;
  --color-surface-2: #0a1826;
  --color-border: #1d3247;
  --color-border-strong: #24394e;
  --color-text: #eef3f7;
  --color-muted: #9fb0c2;
  --color-accent: #8db8e3;
  --color-accent-soft: rgb(141 184 227 / 0.14);

  --container-page: 68.75rem; /* 1100px → clase max-w-page */

  --text-display: clamp(2.75rem, 6vw + 1rem, 5.25rem); /* H1: 84px en desktop */
  --text-display--line-height: 1.02;
  --text-h2: clamp(2rem, 2.5vw + 1.25rem, 2.75rem);   /* H2: 44px en desktop */
  --text-h2--line-height: 1.08;

  --animate-marquee: marquee 40s linear infinite;
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
}
```
Además, en `@layer base`:
- `html`: `scroll-behavior: smooth; scroll-padding-top: 5.5rem;` (la navegación es fija).
- `body`: fondo `var(--color-bg)`, color `var(--color-text)`, `font-family: var(--font-sans)`, `antialiased`.
- `:focus-visible`: `outline: 2px solid var(--color-accent); outline-offset: 3px;`
- `::selection`: fondo `var(--color-accent)`, color `var(--color-bg)`.
- `@media (prefers-reduced-motion: reduce)`: `html { scroll-behavior: auto }` y
  `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }`

Clases que salen de los tokens: `bg-bg`, `bg-bg-deep`, `bg-surface`, `bg-surface-2`, `border-border`,
`border-border-strong`, `text-text`, `text-muted`, `text-accent`, `bg-accent-soft`, `max-w-page`, `text-display`,
`text-h2`, `animate-marquee`, `font-sans`.

## 7. Configuración del sitio y contenido (`src/config/site.ts` y `src/data/*`)

### 7.1 `src/data/types.ts`
Definir y exportar:
```ts
export type TitleLines = readonly [string, string];
export interface SectionIntro { label: string; titleLines: TitleLines; intro?: string }
export interface CtaLink { label: string; href: string; cta: string } // cta → atributo data-cta (analytics futuro)
export interface HighlightText { text: string; highlight: string }      // highlight se pinta en celeste
export interface Metric { value: string; text: string }
export interface Leak { title: string; text: string }
export interface Service { code: string; title: string; description: string; includes: readonly string[]; cta: CtaLink }
export interface Rubro { title: string; text: string }
export interface Step { number: string; title: string; text: string }
export interface TeamMember { name: string; initials: string; role: string; text: string }
export interface FaqItem { question: string; answer: string }
export interface CalculatorTask {
  id: string; label: string; unit: string; minutes: number;
  defaultChecked: boolean; defaultTimesPerWeek: number;
}
```

### 7.2 `src/config/site.ts`
Exportar `const SITE` con `as const` **excepto** `email` y `whatsapp`, que se tipan `string | null`:
| Clave | Valor |
|---|---|
| `name` | `'Factor Integral'` |
| `url` | `'https://factorintegral.ar'` (comentario: dominio a confirmar) |
| `locale` / `ogLocale` | `'es-AR'` / `'es_AR'` |
| `title` | `'Automatización con IA para comercios y pymes en Chabás \| Factor Integral'` |
| `description` | `'Encontramos dónde tu comercio pierde plata y lo resolvemos con IA y sistemas a medida. Vamos a tu local en Chabás y la zona, en el sur de Santa Fe.'` |
| `ogImage` | `'/og-image.png'` |
| `themeColor` | `'#07111b'` |
| `email` | `'hola@factorintegral.ar'` (comentario: a confirmar) |
| `whatsapp` | `null` (comentario: completar en formato internacional sin `+`, ej. `549346XXXXXXX`) |
| `location` | `{ locality: 'Chabás', region: 'Santa Fe', country: 'AR', label: 'Chabás y alrededores, sur de Santa Fe' }` |
| `founders` | `['Felipe Sancho', 'Antonio Sancho']` |
| `primaryCta` | `{ label: 'Coordinar una visita', href: '#contacto', cta: 'contacto' }` |
| `headerCta` | `{ label: 'Contactar', href: '#contacto', cta: 'header-contacto' }` |
| `nav` | `[{label:'Servicios',href:'#servicios'},{label:'Para quién',href:'#rubros'},{label:'Cómo trabajamos',href:'#metodo'},{label:'Preguntas',href:'#preguntas'},{label:'Contacto',href:'#contacto'}]` |

**Importante:** `site.ts` no puede importar nada de Astro ni usar `import.meta.env` (lo carga `astro.config.ts`).

### 7.3 IDs de sección (fijos; los usan nav, tests y anclas)
| Sección | `id` de `<section>` | `id` del título (`aria-labelledby`) |
|---|---|---|
| Hero | `inicio` | `inicio-titulo` (es el H1) |
| Problema | `problema` | `problema-titulo` |
| Calculadora | `calculadora` | `calculadora-titulo` |
| Servicios | `servicios` | `servicios-titulo` |
| Para quién | `rubros` | `rubros-titulo` |
| Cómo trabajamos | `metodo` | `metodo-titulo` |
| Caso real | `caso` | `caso-titulo` |
| Quiénes somos | `equipo` | `equipo-titulo` |
| Preguntas | `preguntas` | `preguntas-titulo` |
| Contacto | `contacto` | `contacto-titulo` |
Formulario: `id="formulario-contacto"`.

### 7.4 Textos (copiar literal)

**`hero.ts`** → `export const hero`
- `overline`: `'Automatización con IA para comercios y pymes'`
- `titleLines`: `['Tu negocio entero,', 'sumado en un solo lugar.']`
- `lead`: `'Vamos a tu negocio, vemos cómo trabajan y encontramos dónde se pierde plata sin que nadie lo note. Después lo resolvemos con IA y sistemas de gestión a medida.'`
- `primary`: `{ label: 'Calculá cuánto perdés', href: '#calculadora', cta: 'hero-calculadora' }`
- `secondary`: `{ label: 'Coordinar una visita', href: '#contacto', cta: 'hero-contacto' }`
- `locationNote`: `'Chabás y alrededores · sur de Santa Fe'`

**`areas.ts`** → `export const areas: readonly string[]`
`'Control de mercadería'`, `'Precios y márgenes'`, `'Stock y pedidos'`, `'Fiado y cuentas corrientes'`,
`'Cierre de caja'`, `'Boletas y remitos'`, `'Deuda con proveedores'`, `'Reportes'`

**`problema.ts`** → `export const problema`
- `label`: `'El problema'` · `titleLines`: `['Perdés plata', 'y no la ves.']`
- `body` (HighlightText): `text: 'Boletas que nadie controla, precios calculados a mano, fiado anotado en un cuaderno. Ya usás planillas, algún sistema y WhatsApp, pero '`, `highlight: 'nada está conectado con cómo trabaja tu negocio.'`
- `metrics`: `{value:'Menos', text:'tareas manuales repetidas'}`, `{value:'Todo', text:'conectado en un solo lugar'}`, `{value:'Hoy', text:'los números a la vista, no a fin de mes'}`
- `leaksTitle`: `'Dónde se suele ir la plata'`
- `leaks` (7, en este orden):
  1. `Mercadería sin controlar` — `Nadie compara lo que entra con lo que dice la boleta.`
  2. `Precios hechos a mano` — `Márgenes desparejos, aumentos mal trasladados y ventas por debajo del costo.`
  3. `Stock a ojo` — `Se repone por intuición: falta lo que más se vende y sobra lo que no.`
  4. `Fiado sin control` — `Deudas anotadas en un cuaderno que se pierden o se olvidan.`
  5. `Caja que no cierra` — `Faltantes o sobrantes que nadie sabe explicar.`
  6. `Papeles sueltos` — `Boletas, remitos y anotaciones desparramadas.`
  7. `Deuda con proveedores` — `No se sabe bien cuánto se debe, a quién ni cuándo vence.`

**`calculadora.ts`** → `export const calculadoraCopy` y `export const calculatorTasks: readonly CalculatorTask[]`
- copy: `label: 'Calculadora'`, `titleLines: ['¿Cuánto te cuesta', 'seguir haciéndolo a mano?']`,
  `intro: 'Marcá lo que hacen a mano y cuántas veces por semana. El tiempo de cada tarea ya está estimado a la baja.'`,
  `timesLabel: 'Veces por semana'`, `salaryLabel: 'Sueldo mensual promedio de quien hace estas tareas'`,
  `monthlyLabel: 'Plata que se va por mes en tareas manuales'`, `tickerNote: 'y sigue sumando mientras leés esto'`,
  `hoursLabel: 'Horas por mes'`, `yearlyLabel: 'Por año'`, `savingsLabel: 'Si automatizás la mitad, recuperás por mes'`,
  `cta: 'Quiero recuperarlo'`, `ctaDisabled: 'Marcá al menos una tarea'`,
  `footnote: 'Estimación orientativa: toma 4,33 semanas por mes y 160 horas de trabajo por mes, sin cargas sociales.'`
- tareas (id · label · unit · minutes · defaultChecked · defaultTimesPerWeek):

| id | label | unit | min | marcada | veces |
|---|---|---|---|---|---|
| `facturas` | Cargar facturas o boletas | por factura | 5 | sí | 40 |
| `control-boletas` | Controlar que llegó todo lo de la boleta | por boleta | 8 | sí | 40 |
| `consultas` | Responder consultas repetidas | por consulta | 3 | sí | 60 |
| `pedidos` | Tomar y cargar pedidos | por pedido | 6 | no | 30 |
| `presupuestos` | Armar presupuestos | por presupuesto | 20 | no | 30 |
| `precios` | Actualizar precios o planillas | por actualización | 30 | no | 30 |
| `cierre-caja` | Cerrar la caja o armar reportes | por cierre | 20 | no | 30 |

**`servicios.ts`** → `export const serviciosIntro` (`label: 'Servicios'`, `titleLines: ['Tres servicios.', 'Un solo objetivo.']`, `intro: 'Que dejes de perder plata en tareas que se pueden hacer solas.'`) y `export const servicios: readonly Service[]`:
1. `s/01` · `Automatización con IA` · `La IA hace el trabajo repetitivo: lee boletas y documentos, ordena los datos y avisa cuando algo no cierra.` · incluye: `Lectura de boletas por foto, PDF o mail` / `Asistentes por WhatsApp` / `Avisos y reportes automáticos`
2. `s/02` · `Sistema de gestión Integral` · `Nuestro propio sistema para comercios: stock, ventas y caja en la computadora del local, con los módulos que tu negocio necesita.` · incluye: `Caja rápida con lector de código de barras` / `Stock con alertas de vencimiento` / `Fiado y cuenta corriente por cliente`
3. `s/03` · `Estudio de ahorro` · `Vamos a tu negocio, relevamos cómo trabajan y te decimos cuánta plata se puede recuperar y por dónde conviene empezar.` · incluye: `Relevamiento en tu local` / `Ahorro estimado en pesos` / `Qué conviene resolver primero`
- `cta` de cada uno: `{ label: 'Consultar', href: '#contacto', cta: 'servicio-s01' }` (`s02`, `s03` según corresponda).

**`rubros.ts`** → `export const rubrosIntro` (`label: 'Para quién'`, `titleLines: ['Si tu negocio repite tareas,', 'se puede automatizar.']`) y `export const rubros: readonly Rubro[]`:
1. `Almacenes y despensas` — `Costo real de cada boleta, precios con margen parejo y fiado bajo control.`
2. `Minimarkets y autoservicios` — `Caja rápida con lector de códigos, stock al día y alertas de vencimiento.`
3. `Kioscos` — `Precios actualizados sin hacer cuentas y control de lo que entra.`
4. `Distribuidoras mayoristas` — `Pedidos, cuentas corrientes y deuda con proveedores en orden.`
5. `Comercios de la zona` — `Si hay papeles sueltos y tareas que se repiten, hay plata para recuperar.`
6. `Pymes` — `Relevamos cómo trabajan y automatizamos lo que más tiempo y plata se lleva.`

**`metodo.ts`** → `export const metodoIntro` (`label: 'Cómo trabajamos'`, `titleLines: ['Del relevamiento', 'al sistema funcionando.']`) y `export const steps: readonly Step[]`:
1. `01` · `Relevamos` · `Vamos a tu negocio y vemos cómo se trabaja hoy, con quién y con qué herramientas. Sin suponer nada.`
2. `02` · `Priorizamos` · `Te mostramos dónde se pierde plata y arrancamos por lo que más rinde con menos cambios.`
3. `03` · `Implementamos` · `Instalamos por partes y capacitamos a tu equipo en el local, con el trabajo de todos los días.`
4. `04` · `Acompañamos` · `Seguimos cerca para ajustar y mejorar cuando el negocio lo pide.`

**`caso.ts`** → `export const caso` con `enabled: false` (comentario: activar cuando haya un caso real con permiso),
`label: 'Caso real'`, `badge: 'En prueba'`, `titleLines: ['Factura a Costo', 'de la foto al precio de venta.']`,
`text: 'Lee la foto de una boleta de proveedor y calcula el costo real y el precio de venta de cada producto.'`,
`bullets: ['Lee la boleta desde una foto', 'Costo real: descuentos, impuestos internos e IVA', 'Precio de venta con margen por rubro', 'Deuda acumulada por proveedor']`,
`table: { caption: 'Ejemplo ilustrativo', headers: ['Producto', 'Lista', 'Costo real', 'Venta'], rows: [['Producto A', '$ 3.200', '$ 2.950', '$ 3.900'], ['Producto B', '$ 1.850', '$ 1.720', '$ 2.300'], ['Producto C', '$ 5.400', '$ 5.010', '$ 6.600']] }`.

**`equipo.ts`** → `export const equipoIntro` (`label: 'Quiénes somos'`, `titleLines: ['Dos hermanos,', 'una misma idea.']`, `intro: 'Uno entiende el negocio y el otro lo convierte en sistemas. Siempre hablás con las mismas dos personas.'`) y `export const team: readonly TeamMember[]`:
1. `Felipe Sancho` · `FS` · `Dirección y clientes` · `Va a cada negocio, escucha cómo trabajan y define qué conviene resolver primero.`
2. `Antonio Sancho` · `AS` · `Desarrollo` · `Diseña y programa los sistemas y las automatizaciones con IA.`

**`faq.ts`** → `export const faqIntro` (`label: 'Preguntas frecuentes'`, `titleLines: ['Lo que nos', 'suelen preguntar.']`) y `export const faq: readonly FaqItem[]`:
1. `¿Cuánto cuesta?` — `Se cotiza según cada comercio. Después de la primera charla te pasamos un presupuesto por escrito, antes de empezar cualquier trabajo.`
2. `¿Cuánto tarda?` — `Depende de lo que haya que resolver. Trabajamos por partes, así vas viendo cada parte funcionando antes de seguir con la próxima.`
3. `¿Tengo que cambiar el sistema que uso?` — `No necesariamente. Muchas veces sumamos el control al costado de lo que ya usás.`
4. `¿Hace falta saber de tecnología?` — `No. Nosotros nos ocupamos de lo técnico y capacitamos a tu equipo en el local.`
5. `¿Qué pasa con los datos de mi negocio?` — `Son tuyos. Te explicamos dónde se guardan y quién puede verlos. Y nunca te vamos a pedir tu clave fiscal.`
6. `¿Dónde trabajan?` — `En Chabás y la zona, en el sur de Santa Fe. Vamos a tu local: relevamos, instalamos y capacitamos en persona.`

**`contacto.ts`** → `export const contactoCopy`
- `label: 'Siguiente paso'`, `titleLines: ['¿Tu negocio sigue haciendo a mano', 'lo que se puede automatizar?']`
- `lead: 'Contanos cómo trabajan hoy y coordinamos una visita a tu local.'`
- `primary: { label: 'Coordinar una visita', href: '#formulario-contacto', cta: 'contacto-formulario' }`
- `secondary: { label: 'Ver cómo trabajamos', href: '#metodo', cta: 'contacto-metodo' }`
- `form`: `nameLabel: 'Nombre'`, `businessLabel: 'Negocio'`, `businessHint: 'Opcional'`, `contactLabel: 'WhatsApp o email'`,
  `messageLabel: '¿Qué te gustaría resolver?'`, `submit: 'Enviar'`, `submitting: 'Enviando…'`,
  `success: '¡Gracias! Te vamos a responder lo antes posible.'`,
  `mailtoSuccess: 'Se abrió tu correo con el mensaje listo. Si no se abrió, escribinos a'`,
  `error: 'No pudimos enviar el mensaje. Probá de nuevo o escribinos por email.'`,
  `mailSubject: 'Consulta desde la web'`
- `errors`: `nameRequired: 'Decinos tu nombre.'`, `contactRequired: 'Dejanos un WhatsApp o un email para responderte.'`,
  `contactInvalid: 'Revisá el WhatsApp o email: no parece válido.'`, `messageRequired: 'Contanos en pocas palabras qué te gustaría resolver.'`

**`footer.ts`** → `export const footer`
- `tagline: 'Automatización con IA y sistemas de gestión para comercios y pymes del sur de Santa Fe.'`
- `floating: { label: '¿Hablamos?', withWhatsapp: 'Escribinos por WhatsApp', withoutWhatsapp: 'Dejanos tu consulta' }`

### 7.5 Test de contenido — `src/data/content.test.ts`
Importa todos los módulos de `src/data/` y `SITE`. Junta **todos** los strings (recorrer objetos/arrays de forma
recursiva con una función `collectStrings(value): string[]`) y verifica:
1. Ningún string contiene (sin distinguir mayúsculas): `gratis`, `gratuit`, `sin cargo`, `factura electrónica`,
   `facturación electrónica`, `app móvil`, `aplicación móvil`, `desde el celular`, `todo el país`, `remoto`,
   `testimonio`, `garantizado`, `[a confirmar]`, `todo:`, `lorem`.
2. Ningún string contiene las palabras exactas `AFIP` o `ARCA` (regex con `\b`, sensible a mayúsculas).
3. `calculatorTasks`: 7 tareas, `id` únicos, minutos en orden `[5, 8, 3, 6, 20, 30, 20]`, exactamente 3 con
   `defaultChecked: true` (`facturas`, `control-boletas`, `consultas`).
4. `servicios` tiene 3 ítems con códigos `s/01`, `s/02`, `s/03` y 3 `includes` cada uno; `rubros` tiene 6;
   `steps` tiene 4 numerados `01`…`04`; `team` tiene 2; `faq` tiene 6; `areas` tiene 8; `problema.leaks` tiene 7.
5. `caso.enabled === false`.
6. `SITE.whatsapp === null` (cuando se cargue el número real, este test se actualiza a propósito).
7. Todos los `href` de `SITE.nav` empiezan con `#` y apuntan a ids de la tabla §7.3.
8. `SITE.description.length` entre 70 y 160; `SITE.title.length` entre 30 y 75.

Verificación: `npx vitest run src/data` → todo verde.

## 8. Librerías puras del Agente A (`src/lib/`)

### 8.1 `format.ts`
- Función interna `safe(n: number): number` → si `!Number.isFinite(n) || n < 0` devuelve `0`.
- `formatARS(n)` → `'$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(safe(n)))`
  (espacio normal después de `$`, **no** usar `style: 'currency'` porque mete un espacio no separable).
- `formatARSWithCents(n)` → igual pero con 2 decimales fijos (`minimumFractionDigits: 2, maximumFractionDigits: 2`).
- `formatHours(n)` → 1 decimal fijo, sin `$`.
- `formatInteger(n)` → sin decimales.

Tests `format.test.ts` (valores exactos):
| Llamada | Esperado |
|---|---|
| `formatARS(378875)` | `'$ 378.875'` |
| `formatARS(189437.5)` | `'$ 189.438'` |
| `formatARS(4546500)` | `'$ 4.546.500'` |
| `formatARS(0)` / `formatARS(NaN)` / `formatARS(-5)` | `'$ 0'` |
| `formatARSWithCents(378875.5)` | `'$ 378.875,50'` |
| `formatARSWithCents(0)` | `'$ 0,00'` |
| `formatHours(50.516666)` | `'50,5'` |
| `formatHours(0)` | `'0,0'` |
| `formatInteger(1200000)` | `'1.200.000'` |

### 8.2 `contact.ts`
- `normalizePhone(raw: string): string` → solo dígitos.
- `buildWhatsAppUrl(phone: string | null, text?: string): string | null` → `null` si `phone` es null o queda sin
  dígitos; si no, `https://wa.me/<digitos>` y, si hay `text`, `?text=` + `encodeURIComponent(text)`.
- `buildMailtoUrl(email: string | null, opts?: { subject?: string; body?: string }): string | null` → `null` si no
  hay email; si no, `mailto:<email>` + query con `subject` y `body` codificados con `encodeURIComponent`
  (unidos con `&`, solo los que existan).

Tests: `null` → `null`; `'+54 9 3464 12-3456'` → `'https://wa.me/5493464123456'`; con texto `'Hola qué tal'` →
termina en `?text=Hola%20qu%C3%A9%20tal`; mailto con subject y body → `mailto:hola@factorintegral.ar?subject=Consulta%20desde%20la%20web&body=...`;
mailto sin opciones → `mailto:hola@factorintegral.ar` (sin `?`).

### 8.3 `seo.ts`
- `buildJsonLd(site: typeof SITE, faq: readonly FaqItem[]): Record<string, unknown>` → objeto con
  `'@context': 'https://schema.org'` y `'@graph'` con 3 nodos:
  1. `ProfessionalService`: `@id` `${url}/#negocio`, `name`, `url`, `description`, `image` (URL absoluta de `ogImage`),
     `email` (solo si no es null), `telephone` (solo si `whatsapp` no es null, como `+<dígitos>`),
     `address` (`PostalAddress` con `addressLocality`, `addressRegion`, `addressCountry`),
     `areaServed` (`[{ '@type': 'City', name: 'Chabás' }, { '@type': 'State', name: 'Santa Fe' }]`),
     `founder` (array de `Person` con los nombres de `site.founders`).
  2. `WebSite`: `@id` `${url}/#sitio`, `name`, `url`, `inLanguage: 'es-AR'`, `publisher: { '@id': '<id del nodo 1>' }`.
  3. `FAQPage`: `mainEntity` = cada FAQ como `Question` con `acceptedAnswer: { '@type': 'Answer', text }`.
- La URL absoluta se arma con `new URL(path, site.url).toString()`.

Tests: tiene los 3 tipos; sin `telephone` cuando `whatsapp` es null; con `telephone: '+5493464123456'` si se pasa un
SITE con whatsapp (usar spread `{ ...SITE, whatsapp: '5493464123456' }`); `FAQPage.mainEntity.length === faq.length`;
`image === 'https://factorintegral.ar/og-image.png'`; `JSON.stringify` no tira error.

### 8.4 `prefill.ts` (lo usan calculadora y formulario)
```ts
type Listener = (message: string) => void;
interface PrefillStore { pending: string | null; listeners: Set<Listener> }
const KEY = '__factorIntegralContactPrefill';
// store guardado en globalThis[KEY] (crearlo si no existe) → compartido entre islas
export function setContactPrefill(message: string): void      // guarda pending y avisa a los listeners
export function consumeContactPrefill(): string | null          // devuelve pending y lo pone en null
export function subscribeContactPrefill(fn: Listener): () => void // devuelve la función para desuscribirse
export function __resetContactPrefill(): void                   // solo para tests: pending = null, listeners vacíos
```
Tests: set + consume devuelve el mensaje y el segundo consume da `null`; un listener suscripto recibe el mensaje;
después de desuscribirse no lo recibe; dos listeners reciben ambos.

Verificación §8: `npx vitest run src/lib` → verde.

## 9. Layout, SEO, componentes base, stubs y página

### 9.1 Archivos estáticos
- `public/favicon.svg`: 64×64, rectángulo redondeado (`rx=14`) fondo `#07111b`, el carácter `∫` centrado en `#8db8e3`,
  fuente `system-ui`, peso 700.
- `scripts/generate-og.mjs`: usa `sharp` para convertir un SVG de 1200×630 (fondo `#07111b`, "Factor Integral"
  en `#eef3f7` grande, debajo "Automatización con IA para comercios y pymes" en `#9fb0c2` y "Chabás · Santa Fe" en
  `#8db8e3`) a `public/og-image.png`. Ejecutar `npm run og` y verificar que el PNG exista y pese > 5 KB.

### 9.2 `src/components/seo/SEO.astro`
Props: `title?: string`, `description?: string`, `image?: string`, `noindex?: boolean` (por defecto los de `SITE`).
Renderiza en este orden:
`<title>`, `meta description`, `link rel="canonical"` (= `new URL(Astro.url.pathname, Astro.site)`),
`meta robots` (`index, follow` o `noindex, nofollow`), `og:type=website`, `og:site_name`, `og:locale=es_AR`,
`og:title`, `og:description`, `og:url`, `og:image` (absoluta), `og:image:width=1200`, `og:image:height=630`,
`og:image:alt`, `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`,
`link rel="icon" type="image/svg+xml" href="/favicon.svg"`, `link rel="sitemap" href="/sitemap-index.xml"`,
`meta theme-color`, y el JSON-LD: `<script type="application/ld+json" set:html={JSON.stringify(buildJsonLd(SITE, faq))} />`
**solo cuando `noindex` es false**.

### 9.3 `src/layouts/BaseLayout.astro`
- Props: las mismas de `SEO` (las pasa).
- `<html lang="es-AR">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  `<SEO {...props} />`, import de `../styles/global.css`.
- `<body class="bg-bg font-sans text-text antialiased">` con un primer hijo **skip link**:
  `<a href="#contenido" class="sr-only focus:not-sr-only ...">Saltar al contenido</a>` y después `<slot />`.

### 9.4 `src/pages/robots.txt.ts`
`export const GET: APIRoute = ({ site }) => new Response(...)` con:
```
User-agent: *
Allow: /

Sitemap: <site>/sitemap-index.xml
```
(usar `new URL('sitemap-index.xml', site)`; header `Content-Type: text/plain; charset=utf-8`).

### 9.5 `src/pages/404.astro`
`BaseLayout` con `noindex`, título `'Página no encontrada | Factor Integral'`, un `<h1>` "Esta página no existe" y
un `Button` primario "Volver al inicio" a `/`.

### 9.6 Componentes UI (`src/components/ui/`)
| Componente | Props | Qué renderiza |
|---|---|---|
| `Container.astro` | `class?` | `<div class="mx-auto w-full max-w-page px-4 sm:px-6">` + slot |
| `Section.astro` | `id: string`, `tone?: 'default' \| 'deep'`, `class?` | `<section id aria-labelledby={`${id}-titulo`} class="py-20 sm:py-28 ...">` (`deep` → `bg-bg-deep`) con `Container` adentro |
| `SectionLabel.astro` | `text: string` | `<p>` chico en mayúsculas, `tracking-[0.18em]`, `text-accent`, `font-bold`, con `<span aria-hidden="true">•</span>` delante |
| `SectionHeading.astro` | `id: string`, `lines: TitleLines`, `as?: 'h1' \| 'h2'` (default `h2`) | Título `font-extrabold tracking-tight`; `h2` usa `text-h2`, `h1` usa `text-display`; línea 1 en `text-text`, línea 2 en `text-muted`, cada una en `<span class="block">` |
| `Button.astro` | `href: string`, `variant?: 'primary' \| 'secondary'`, `cta?: string`, `class?` | `<a>` píldora `rounded-full px-6 py-3 text-[15px] font-bold`; primario `bg-text text-bg hover:bg-accent`; secundario `border border-border-strong text-text hover:border-accent`; agrega `data-cta` si viene `cta` |
| `Card.astro` | `as?: 'div' \| 'article' \| 'li'`, `class?` | `rounded-3xl border border-border bg-surface p-6 sm:p-8` + slot |
| `Avatar.astro` | `initials: string`, `name: string` | Círculo `size-16 bg-accent-soft text-accent font-extrabold` con las iniciales y `aria-hidden="true"` (el nombre ya se lee al lado) |
| `LogoMark.astro` | `class?` | El `∫` en un cuadrado redondeado `bg-surface border-border text-accent` + el texto "Factor Integral" en `font-extrabold` |

### 9.7 Stubs (provisorios; los reemplazan B y C)
- Cada sección de `src/components/sections/` existe y renderiza **solo**: `Section` con su `id` (§7.3),
  `SectionLabel` y `SectionHeading` con los textos de `src/data`. Excepciones: `Hero.astro` usa
  `SectionHeading as="h1"` con `id="inicio-titulo"` dentro de `<section id="inicio" aria-labelledby="inicio-titulo">`;
  `AreasMarquee.astro` renderiza un `<div>` con la lista de áreas.
- `Header.astro`, `Footer.astro`, `FloatingCTA.astro`: stubs mínimos (`<header>` con `LogoMark` y los links de
  `SITE.nav`; `<footer>` con el nombre; `FloatingCTA` vacío).
- `islands/CostCalculator.tsx` y `islands/ContactForm.tsx`: `export default function X() { return <div data-stub="true" /> }`.

### 9.8 `src/pages/index.astro`
```astro
<BaseLayout>
  <Header />
  <main id="contenido">
    <Hero /> <AreasMarquee /> <Problema /> <CalculadoraSection /> <Servicios /> <Rubros /> <Metodo />
    {caso.enabled && <Caso />}
    <Equipo /> <FAQ /> <Contacto />
  </main>
  <Footer />
  <FloatingCTA />
</BaseLayout>
```
Este archivo ya queda final: B y C **no** lo tocan.

### 9.9 Tests SEO sobre el build — `tests/build/helpers.ts` y `tests/build/seo.test.ts`
`helpers.ts` exporta:
- `DIST = path.resolve(process.cwd(), 'dist')`
- `loadHtml(file = 'index.html')` → lee `dist/<file>`; si no existe, tira `Error('Falta dist/… — corré npm run build antes de npm run test:build')`. Devuelve el resultado de `parse()` de `node-html-parser`.
- `readDist(file)` → string del archivo.
- `visibleText(root)` → texto del `<body>` sin `<script>` ni `<style>`.

`seo.test.ts` verifica sobre `dist/index.html`:
1. `<html lang="es-AR">`.
2. `<title>` igual a `SITE.title`; `meta[name=description]` igual a `SITE.description`.
3. `link[rel=canonical]` = `https://factorintegral.ar/`.
4. Existen `og:title`, `og:description`, `og:url`, `og:image`, `og:locale` (=`es_AR`), `twitter:card` (=`summary_large_image`); `og:image` empieza con `https://`.
5. `meta[name=robots]` = `index, follow`; `meta[name=theme-color]` existe.
6. `link[rel=icon]` apunta a `/favicon.svg` y `dist/favicon.svg` existe; `dist/og-image.png` existe.
7. Hay exactamente un `script[type="application/ld+json"]`, su contenido es JSON válido y el `@graph` incluye `ProfessionalService`, `WebSite` y `FAQPage`.
8. `dist/robots.txt` contiene `Sitemap: https://factorintegral.ar/sitemap-index.xml`; `dist/sitemap-index.xml` existe.
9. `dist/404.html` existe, tiene `meta[name=robots]` = `noindex, nofollow` y **no** tiene JSON-LD.
10. Hay exactamente **un** `<h1>` en `index.html`.
11. Existe el skip link `a[href="#contenido"]` y `main#contenido`.

### 9.10 Verificación final del Agente A
```bash
npm run og && npm run verify
```
Las 4 etapas de `verify` tienen que pasar. Reportar la salida resumida.

---

## FASE B — Agente B (Islas interactivas)

**Archivos propios del Agente B:**
`src/lib/calculator.ts`, `src/lib/calculator.test.ts`, `src/lib/validation.ts`, `src/lib/validation.test.ts`,
`src/lib/contact-submit.ts`, `src/lib/contact-submit.test.ts`,
`src/components/islands/CostCalculator.tsx`, `src/components/islands/CostCalculator.test.tsx`,
`src/components/islands/ContactForm.tsx`, `src/components/islands/ContactForm.test.tsx`,
`src/components/sections/CalculadoraSection.astro`, `src/components/sections/Contacto.astro`.

**No correr `npm run build`** (el Agente C lo usa en paralelo). Verificar con `npx vitest run <archivos>` y
`npm run typecheck`.

## 10. Calculadora

### 10.1 `src/lib/calculator.ts` (funciones puras)
```ts
export const WEEKS_PER_MONTH = 4.33;
export const WORK_HOURS_PER_MONTH = 160;
export const SECONDS_PER_WORK_MONTH = WORK_HOURS_PER_MONTH * 3600;
export const DEFAULT_SALARY = 1_200_000;

export interface TaskSelection { id: string; checked: boolean; timesPerWeek: number }
export interface CalculatorResult {
  minutesPerWeek: number; hoursPerMonth: number; hourlyRate: number;
  monthlyCost: number; yearlyCost: number; monthlySavings: number;
  costPerSecond: number; hasTasks: boolean;
}
export function sanitizeNonNegative(value: unknown): number
export function initialSelections(tasks: readonly CalculatorTask[]): TaskSelection[]
export function calculate(tasks: readonly CalculatorTask[], selections: readonly TaskSelection[], salary: number): CalculatorResult
export function liveAmount(result: CalculatorResult, elapsedMs: number): number
export function buildPrefillMessage(tasks: readonly CalculatorTask[], selections: readonly TaskSelection[], result: CalculatorResult): string
```
Fórmulas (exactas):
- `sanitizeNonNegative`: si no es número finito o es < 0 → `0`; si no, `Math.floor(value)` para veces por semana. **Ojo:** para el sueldo no hay que truncar; hacé que acepte un segundo parámetro opcional `{ integer?: boolean }` (por defecto `true`) y que el sueldo se sanee con `integer: false`.
- `minutesPerWeek = Σ (task.minutes × selection.timesPerWeek)` **solo** de las selecciones con `checked: true`.
- `hoursPerMonth = minutesPerWeek / 60 × WEEKS_PER_MONTH`
- `hourlyRate = salary / WORK_HOURS_PER_MONTH`
- `monthlyCost = hoursPerMonth × hourlyRate`
- `yearlyCost = monthlyCost × 12`
- `monthlySavings = monthlyCost / 2`
- `costPerSecond = monthlyCost / SECONDS_PER_WORK_MONTH`
- `hasTasks = alguna selección checked` (aunque tenga 0 veces).
- `liveAmount = hasTasks ? monthlyCost + costPerSecond × (elapsedMs / 1000) : 0`
- `buildPrefillMessage`: si no hay tareas marcadas devuelve `''`. Si hay:
  `Hacemos a mano: <label en minúscula inicial> (<veces> por semana), … . Según la calculadora son unas <formatHours(hoursPerMonth)> horas por mes (<formatARS(monthlyCost)>). Quiero ver qué se puede automatizar.`
  Las tareas se unen con `', '` y después de la última va `'. '`. "Minúscula inicial" = solo la primera letra.

### 10.2 Tests `src/lib/calculator.test.ts` (valores verificados contra el prototipo)
1. **Valores iniciales** (`initialSelections` + sueldo 1.200.000): `minutesPerWeek === 700`;
   `hoursPerMonth ≈ 50.5167` (`toBeCloseTo(50.5167, 3)`); `hourlyRate === 7500`; `monthlyCost ≈ 378875`
   (`toBeCloseTo(378875, 2)`); `yearlyCost ≈ 4546500`; `monthlySavings ≈ 189437.5`; `costPerSecond ≈ 0.6578` (3 dec.).
2. **Marcando `pedidos` con 30**: `minutesPerWeek === 880`; `yearlyCost ≈ 5715600`; `monthlySavings ≈ 238150`.
3. **Sin tareas marcadas**: todos los números en 0, `hasTasks === false`, `liveAmount(result, 5000) === 0`,
   `buildPrefillMessage(...) === ''`.
4. **Sueldo 0**: horas > 0, costos 0.
5. **Veces negativas o NaN** se tratan como 0 (`sanitizeNonNegative(-3) === 0`, `(NaN) === 0`, `('abc') === 0`, `(12.7) === 12`, `(12.7, { integer: false }) === 12.7`).
6. **liveAmount**: con valores iniciales y `elapsedMs = 5000` → `≈ 378878.29` (`toBeCloseTo(378878.29, 1)`).
7. **Mensaje exacto** con los valores iniciales:
   `Hacemos a mano: cargar facturas o boletas (40 por semana), controlar que llegó todo lo de la boleta (40 por semana), responder consultas repetidas (60 por semana). Según la calculadora son unas 50,5 horas por mes ($ 378.875). Quiero ver qué se puede automatizar.`
8. Una tarea marcada con 0 veces: `hasTasks === true`, `monthlyCost === 0`.

### 10.3 `src/components/islands/CostCalculator.tsx`
Props: `{ tasks: readonly CalculatorTask[]; copy: typeof calculadoraCopy }` (se pasan desde Astro, así el contenido
sigue en `src/data`).

Estado:
- `selections: TaskSelection[]` (inicial `initialSelections(tasks)`). **Al desmarcar NO se borra `timesPerWeek`**
  (arregla el bug "vuelve a 30").
- `salary: number` (inicial `DEFAULT_SALARY`).
- `result = calculate(...)` derivado en el render (no en estado).

Contador en vivo — hook local `useLiveAmount(result)`:
- Lee `window.matchMedia('(prefers-reduced-motion: reduce)').matches` al montar.
- Si reduce motion o `!result.hasTasks` → devuelve `liveAmount(result, 0)` (o sea `monthlyCost`, o `0` sin tareas).
- Si no: guarda `start = Date.now()` cada vez que cambia `result.monthlyCost`; `setInterval` cada 100 ms que hace
  `setValue(liveAmount(result, Date.now() - start))`; limpia el intervalo en el cleanup.
- **Bug corregido:** sin tareas el contador muestra `$ 0,00` (no lo acumulado).

UI (semántica, con Tailwind y tokens):
- Contenedor en 2 columnas en `lg` (`lg:grid-cols-[1.1fr_0.9fr]`), 1 columna en móvil.
- Columna izquierda: `<fieldset>` con `<legend class="sr-only">Tareas que hacen a mano</legend>`. Por tarea:
  `<input type="checkbox" id="tarea-<id>">` + `<label for>` con `label` y debajo en `text-muted` `"<minutes> min <unit>"`.
  Si está marcada, aparece `<input type="number" min="0" step="1" inputMode="numeric">` con
  `aria-label={`${copy.timesLabel}: ${task.label}`}` y un texto visible `copy.timesLabel`.
  `onChange` → `sanitizeNonNegative(e.currentTarget.valueAsNumber)`.
- Campo sueldo: `<label for="sueldo">{copy.salaryLabel}</label>` + `<input id="sueldo" type="number" min="0" step="10000">`; saneado con `{ integer: false }`.
- Columna derecha (tarjeta `bg-surface`): 
  - `copy.monthlyLabel` + monto grande `formatARSWithCents(live)` en `text-display`-like (usar `text-4xl sm:text-5xl font-extrabold`) con `aria-hidden="true"` (cambia 10 veces por segundo; no debe leerse).
  - `<p class="sr-only" aria-live="polite">` con `${copy.monthlyLabel}: ${formatARS(result.monthlyCost)}` (valor estable para lectores de pantalla).
  - `copy.tickerNote` en `text-muted` (solo si `hasTasks`).
  - Lista `<dl>` con: `copy.hoursLabel` → `${formatHours(hoursPerMonth)} h`; `copy.yearlyLabel` → `formatARS(yearlyCost)`;
    `copy.savingsLabel` → `formatARS(monthlySavings)` (este en `text-accent`).
  - Botón `<button type="button">`: si `hasTasks`, texto `copy.cta`; si no, texto `copy.ctaDisabled` y `disabled`
    (**bug corregido**). Al hacer clic: `setContactPrefill(buildPrefillMessage(...))` y
    `document.getElementById('formulario-contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
  - `copy.footnote` en `text-xs text-muted`.
- Las horas se muestran con 1 decimal (**bug corregido**: el costo ya no "no cierra" contra horas redondeadas a entero).

### 10.4 Tests `src/components/islands/CostCalculator.test.tsx`
Usar `render(<CostCalculator tasks={calculatorTasks} copy={calculadoraCopy} />)` y `userEvent.setup()`.
1. Renderiza 7 checkboxes; 3 marcados (`getByLabelText('Cargar facturas o boletas')` está `checked`, etc.).
2. Muestra `50,5 h`, `$ 4.546.500`, `$ 189.438` y el monto grande `$ 378.875,00`.
3. Al marcar "Tomar y cargar pedidos" aparece su input con valor `30` y el año pasa a `$ 5.715.600`.
4. **Recuerda la cantidad:** poner `55` en "Veces por semana: Tomar y cargar pedidos" (clear + type), desmarcar,
   volver a marcar → el input vale `55`.
5. **Sin tareas:** desmarcar las 3 iniciales → monto grande `$ 0,00`, botón `disabled` con texto `Marcá al menos una tarea`.
6. **Contador:** `vi.useFakeTimers({ shouldAdvanceTime: false })`, render, `act(() => vi.advanceTimersByTime(5000))`
   → el texto del monto grande, parseado a número, está entre `378878` y `378879`. Restaurar con `vi.useRealTimers()`.
   (Para este test usar `fireEvent` en vez de `userEvent`, o `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.)
7. **Reduce motion:** mockear `matchMedia` con `matches: true` → después de avanzar 5000 ms sigue `$ 378.875,00`.
8. **CTA:** clic en "Quiero recuperarlo" → `consumeContactPrefill()` devuelve el mensaje exacto de §10.2-7 y
   `scrollIntoView` fue llamado (crear antes un `<div id="formulario-contacto">` en `document.body`).
9. Sueldo `0` → monto `$ 0,00` pero horas `50,5 h`.

### 10.5 `src/components/sections/CalculadoraSection.astro`
`Section id="calculadora"` + `SectionLabel` + `SectionHeading` (`calculadora-titulo`) + `copy.intro` en `text-muted`
+ `<CostCalculator client:visible tasks={calculatorTasks} copy={calculadoraCopy} />` dentro de un `Card`.

## 11. Contacto

### 11.1 `src/lib/validation.ts`
```ts
export interface ContactInput { nombre: string; negocio: string; contacto: string; mensaje: string; web: string }
export type ContactErrors = Partial<Record<'nombre' | 'contacto' | 'mensaje', string>>;
export function isEmail(v: string): boolean   // /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export function isPhone(v: string): boolean   // solo [\d\s()+-], y entre 8 y 15 dígitos
export function validateContact(input: ContactInput, errors: typeof contactoCopy.errors): ContactErrors
export function isSpam(input: ContactInput): boolean // true si el campo trampa "web" tiene algo
```
Reglas (todo con `trim()`): `nombre` ≥ 2 caracteres → si no `nameRequired`; `contacto` vacío → `contactRequired`;
`contacto` no vacío pero ni email ni teléfono → `contactInvalid`; `mensaje` ≥ 10 caracteres → si no `messageRequired`.
`negocio` es opcional.
Tests: válido completo → `{}`; todo vacío → 3 errores con los textos exactos; `'hola@x'` → `contactInvalid`;
`'hola@factorintegral.ar'` y `'+54 9 3464 12-3456'` válidos; `'123'` inválido; `isSpam` con `web: 'x'` → true.

### 11.2 `src/lib/contact-submit.ts`
```ts
export type SubmitResult = { kind: 'sent' } | { kind: 'mailto'; url: string } | { kind: 'error' };
export async function submitContact(
  input: ContactInput,
  opts: { endpoint: string | null; email: string | null; subject: string; fetchFn?: typeof fetch },
): Promise<SubmitResult>
```
- Si hay `endpoint`: `POST` JSON `{ nombre, negocio, contacto, mensaje }` (sin `web`), header
  `Content-Type: application/json`. `res.ok` → `{ kind: 'sent' }`; si no o si tira error → `{ kind: 'error' }`.
- Si no hay endpoint pero hay email → `{ kind: 'mailto', url: buildMailtoUrl(email, { subject, body }) }` donde
  `body` = `Nombre: …\nNegocio: …\nContacto: …\n\n<mensaje>` (omitir la línea "Negocio" si está vacío).
- Si no hay ninguno → `{ kind: 'error' }`.
Tests con `fetchFn = vi.fn()`: ok → `sent` y el body enviado no tiene `web`; `res.ok=false` → `error`; fetch que
rechaza → `error`; sin endpoint → `mailto` con `body` codificado que contiene `Nombre%3A%20`; sin endpoint ni email → `error`.

### 11.3 `src/components/islands/ContactForm.tsx`
Props: `{ copy: typeof contactoCopy; email: string | null; endpoint: string | null; onNavigate?: (url: string) => void }`.
`onNavigate` por defecto es `(url) => window.location.assign(url)`; existe para poder testear el caso `mailto`
(en jsdom `window.location` no se puede mockear).
- `<form id="formulario-contacto" noValidate onSubmit>` con campos controlados:
  `nombre` (`autoComplete="name"`), `negocio` (`autoComplete="organization"`, con `businessHint` "Opcional"),
  `contacto` (`autoComplete="email"`… usar `type="text"` porque acepta teléfono), `mensaje` (`<textarea rows={5}>`).
- Cada campo con `<label htmlFor>`; si hay error: `aria-invalid="true"`, `aria-describedby="<campo>-error"` y
  `<p id="<campo>-error" class="text-sm text-accent">`.
- Campo trampa: `<div aria-hidden="true" class="hidden"><label>Web<input name="web" tabIndex={-1} autoComplete="off"></label></div>`.
- Al montar: `consumeContactPrefill()` y si devuelve texto lo pone en `mensaje`; además
  `subscribeContactPrefill(msg => setMensaje(msg))` con cleanup.
- Submit: si `isSpam` → mostrar éxito sin enviar nada. Si hay errores → mostrarlos y poner foco en el primer campo
  con error. Si no → estado `submitting` (botón deshabilitado con `copy.submitting`) → `submitContact` →
  `sent`: mostrar `copy.success` y limpiar el formulario; `mailto`: `onNavigate(url)` y mostrar
  `copy.mailtoSuccess` + el email como link `mailto:`; `error`: mostrar `copy.error`.
- El mensaje de estado va en `<p role="status">`.

### 11.4 Tests `src/components/islands/ContactForm.test.tsx`
1. Renderiza los 4 campos accesibles por label (`getByLabelText('Nombre')`, etc.) y el botón `Enviar`.
2. Enviar vacío → aparecen los 3 mensajes de error, `aria-invalid="true"` en los 3 campos y el foco queda en "Nombre".
3. Prefill **antes** de montar (`setContactPrefill('Hola')` y después `render`) → el textarea vale `Hola`.
4. Prefill **después** de montar (`act(() => setContactPrefill('Otro'))`) → el textarea vale `Otro`.
5. Con `endpoint='https://ejemplo.test/contacto'` y `vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))`,
   completar bien y enviar → aparece `copy.success` y `fetch` fue llamado 1 vez.
6. Sin endpoint, con email y `onNavigate={vi.fn()}` → después de enviar, `onNavigate` fue llamado con una URL que
   empieza con `mailto:hola@factorintegral.ar` y aparece el texto de `mailtoSuccess`.
7. Honeypot lleno → no llama a `fetch` y muestra `copy.success`.
8. Fetch con `ok: false` → aparece `copy.error`.

### 11.5 `src/components/sections/Contacto.astro`
- `Section id="contacto" tone="deep"`. Grilla 2 columnas en `lg`.
- Columna izquierda: `SectionLabel`, `SectionHeading` (`contacto-titulo`), `lead`, los dos `Button`
  (`primary` primario, `secondary` secundario), y una lista de datos de contacto:
  email como `<a href={buildMailtoUrl(SITE.email)}>` (si `SITE.email` no es null); WhatsApp como link
  `buildWhatsAppUrl(SITE.whatsapp)` con `target="_blank" rel="noopener noreferrer"` **solo si** no es null;
  `SITE.location.label`.
- Columna derecha: `Card` con `<ContactForm client:idle copy={contactoCopy} email={SITE.email} endpoint={import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? null} />`.
- Agregar `src/env.d.ts` **solo si** `astro check` se queja del tipo de `PUBLIC_CONTACT_ENDPOINT`
  (declarar `interface ImportMetaEnv { readonly PUBLIC_CONTACT_ENDPOINT?: string }`). Ese archivo es propiedad del Agente B.

### 11.6 Verificación final del Agente B
```bash
npx vitest run src/lib src/components/islands && npm run typecheck
```
Todo verde. **No** correr `npm run build`.

---

## FASE C — Agente C (Secciones estáticas y layout)

**Archivos propios del Agente C:** `src/components/layout/*`, y en `src/components/sections/`: `Hero.astro`,
`AreasMarquee.astro`, `Problema.astro`, `Servicios.astro`, `Rubros.astro`, `Metodo.astro`, `Caso.astro`,
`Equipo.astro`, `FAQ.astro`; además `tests/build/structure.test.ts` y `README.md`.
**No tocar** `CalculadoraSection.astro`, `Contacto.astro` ni nada de `islands/` (los hace el Agente B en paralelo).

Reglas visuales comunes: contenido dentro de `Section`/`Container`; tarjetas con `Card`; separación entre bloques
`mt-12 sm:mt-16`; textos secundarios `text-muted`; grillas móviles de 1 columna (sin scroll horizontal a 360 px).

## 12. Layout

### 12.1 `Header.astro`
- `<header class="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur">` con `Container`
  en fila: `LogoMark` dentro de `<a href="#inicio" aria-label="Factor Integral, ir al inicio">`;
  `<nav aria-label="Principal">` con `SITE.nav` (oculto en móvil: `hidden md:flex`); `Button` primario
  con `SITE.headerCta` (label, href y cta) (oculto en móvil).
- Móvil: `<button type="button" class="md:hidden" aria-controls="menu-movil" aria-expanded="false" aria-label="Abrir menú">`
  con ícono SVG de 3 líneas (`aria-hidden`), y `<nav id="menu-movil" aria-label="Menú móvil" hidden>` con los links + el botón.
- `<script>` (Astro lo empaqueta) que: alterna `hidden` en `#menu-movil` y `aria-expanded`/`aria-label`
  ("Abrir menú"/"Cerrar menú") en el botón; cierra el menú al hacer clic en un link y con `Escape`.

### 12.2 `Footer.astro`
`<footer class="border-t border-border bg-bg-deep">`: `LogoMark` + `footer.tagline`; `<nav aria-label="Pie de página">`
con `SITE.nav`; línea final `` `${SITE.location.label} · © ${new Date().getFullYear()} ${SITE.name}` ``.

### 12.3 `FloatingCTA.astro`
- `const wa = buildWhatsAppUrl(SITE.whatsapp)`.
- `<a>` fijo `fixed bottom-4 right-4 z-40` píldora `bg-text text-bg font-bold shadow-lg`, con `data-cta="flotante"`:
  - si `wa`: `href={wa}`, `target="_blank"`, `rel="noopener noreferrer"`, texto `footer.floating.label` + subtexto `withWhatsapp`;
  - si no: `href="#contacto"`, subtexto `withoutWhatsapp`.
- `aria-label` = `` `${label} ${subtexto}` ``.

## 13. Secciones

### 13.1 `Hero.astro`
- `<section id="inicio" aria-labelledby="inicio-titulo" class="relative overflow-hidden pt-36 pb-20 sm:pt-44">`.
- Fondo decorativo: un `<div aria-hidden="true">` absoluto con un gradiente radial suave usando `accent-soft`
  (ej. `bg-[radial-gradient(ellipse_at_top,var(--color-accent-soft),transparent_60%)]`).
- Overline `— {hero.overline} —` en `text-accent` mayúsculas chicas.
- `SectionHeading as="h1" id="inicio-titulo" lines={hero.titleLines}` → **único H1 de la página**.
- `hero.lead` en `text-lg text-muted max-w-2xl`.
- Dos `Button` (primario y secundario) con sus `cta`.
- Chip `hero.locationNote` (`rounded-full bg-accent-soft text-accent text-sm px-4 py-1.5`) con un ícono de pin SVG `aria-hidden`.

### 13.2 `AreasMarquee.astro`
- `<div class="overflow-hidden border-y border-border py-5" aria-label="Áreas del negocio que abarcamos">`.
- Adentro un `<div class="flex w-max animate-marquee gap-10 motion-reduce:animate-none">` con **dos** `<ul>` iguales;
  el segundo con `aria-hidden="true"`. Cada `<li>` en `text-muted font-bold` separados por un `•` decorativo.
- Pausar con hover: `hover:[animation-play-state:paused]`.
- Con `motion-reduce`, además permitir `flex-wrap` del primer `<ul>` y ocultar el segundo (`motion-reduce:hidden`).

### 13.3 `Problema.astro`
- `SectionLabel`, `SectionHeading` (`problema-titulo`), párrafo con `body.text` + `<strong class="text-accent font-semibold">{body.highlight}</strong>`.
- 3 métricas en grilla `sm:grid-cols-3`: valor en `text-5xl font-extrabold`, texto en `text-muted`.
- `<h3>{leaksTitle}</h3>` y `<ul>` de 7 `Card as="li"` en grilla `sm:grid-cols-2 lg:grid-cols-4`, cada una con `<h4>`? → **No**:
  usar `<p class="font-bold">` para el título de cada ítem (evitar saltar niveles de encabezado).

### 13.4 `Servicios.astro`
- Intro + grilla `lg:grid-cols-3` de 3 `Card as="article"`: código (`s/01`) en `font-mono text-accent text-sm`,
  `<h3>` título, descripción `text-muted`, `<ul>` de `includes` con check SVG `aria-hidden`, y al pie
  `<a href={cta.href} data-cta={cta.cta}>Consultar <span aria-hidden="true">→</span></a>` en `text-accent`.

### 13.5 `Rubros.astro`
- Intro + grilla `sm:grid-cols-2 lg:grid-cols-3` de 6 `Card as="article"` con `<h3>` y texto.

### 13.6 `Metodo.astro`
- Intro + `<ol>` en grilla `md:grid-cols-2 lg:grid-cols-4`; cada `<li>` es una `Card` con el número (`01`) en
  `font-mono text-accent`, `<h3>` y texto.

### 13.7 `Caso.astro`
- Sección `id="caso"` completa con `caso.*`: badge (`bg-accent-soft text-accent rounded-full`), bullets,
  y la tabla de maqueta `caso.table` (`<table>` con `<caption>`, `<th scope="col">` y las filas).
- **No** se muestra porque `caso.enabled` es `false` (lo controla `index.astro`).

### 13.8 `Equipo.astro`
- Intro + grilla `md:grid-cols-2` de 2 `Card as="article"`: `Avatar` + `<h3>` nombre + rol en `text-accent` + texto.

### 13.9 `FAQ.astro`
- Intro + lista de `<details name="faq" class="group rounded-2xl border border-border bg-surface">` (el atributo
  `name` hace que se abra de a una en navegadores modernos).
- `<summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold [&::-webkit-details-marker]:hidden">`
  con la pregunta y un `+` que rota a `×` con `group-open:rotate-45` (`aria-hidden`).
- Respuesta en `<p class="px-5 pb-5 text-muted">`.

## 14. Tests de estructura y README

### 14.1 `tests/build/structure.test.ts` (usa `tests/build/helpers.ts`)
Sobre `dist/index.html`:
1. Exactamente un `h1` y su texto contiene `Tu negocio entero`.
2. Hay al menos 8 `h2`, y **cada** `section[aria-labelledby]` tiene un elemento con ese id.
3. Existen las secciones `#inicio`, `#problema`, `#calculadora`, `#servicios`, `#rubros`, `#metodo`, `#equipo`,
   `#preguntas`, `#contacto` y `#formulario-contacto`.
4. **No** existe `#caso` y el texto visible no contiene `Factura a Costo`.
5. Todos los `a[href^="#"]` (excepto `href="#"`) apuntan a un id que existe en la página.
6. Todo `a[target="_blank"]` tiene `rel` con `noopener`.
7. Todas las `img` tienen `alt`.
8. Hay 6 `details` y 6 `summary` dentro de `#preguntas`.
9. Hay un `astro-island` cuyo `component-url` contiene `CostCalculator` y otro con `ContactForm`.
10. En `#formulario-contacto`, cada `input`/`textarea` visible (excluir `name="web"`) tiene un `label[for=<id>]`.
11. El texto visible no contiene: `[A CONFIRMAR]`, `TODO`, `lorem`, `undefined`, `null`, `NaN`, `gratis`, `gratuito`, `remoto`, `todo el país`.
12. No queda ningún `[data-stub]` (todas las islas reemplazadas).
13. El segundo `<ul>` del marquee tiene `aria-hidden="true"`.
14. Hay un link `a[data-cta="flotante"]` y, como `whatsapp` es null, su `href` es `#contacto` y no hay ningún link a `wa.me`.
15. El botón del menú móvil tiene `aria-controls="menu-movil"` y existe `#menu-movil`.

Nota: los tests 9, 10 y 12 dependen del Agente B. Si cuando los corrés todavía hay stubs, anotalo en el reporte
(no es un error tuyo) y no modifiques archivos del Agente B.

### 14.2 `README.md` (reemplazar el del template)
Secciones: qué es el proyecto (2 líneas); requisitos (Node ≥ 22.23.4, `.nvmrc`); comandos (`dev`, `build`,
`preview`, `test`, `test:build`, `typecheck`, `verify`, `og`); estructura de carpetas (resumida de §3); **cómo editar
textos** (todo en `src/data/` y `src/config/site.ts`); cómo activar WhatsApp (completar `SITE.whatsapp` y actualizar
el test de contenido); cómo activar el caso real (`caso.enabled = true`); variable `PUBLIC_CONTACT_ENDPOINT` para el
formulario; lista de **pendientes de contenido**: número de WhatsApp, dominio definitivo, email confirmado, logo en
SVG, imagen OG definitiva, backend del formulario, analytics (los CTA ya tienen `data-cta`).

### 14.3 Verificación final del Agente C
```bash
npm run typecheck && npm run build && npm run test:build
```
`seo.test.ts` tiene que pasar entero. En `structure.test.ts` solo pueden fallar 9, 10 y 12 si el Agente B no terminó.

---

## FASE D — Revisión

## 15. Checklist de revisión (orquestador o agente revisor)
1. `npm run verify` pasa completo (typecheck + unit + build + tests de build).
2. `npm run dev` levanta y la home responde 200.
3. Revisar a mano en el código:
   - Ningún color hex en componentes (`grep -rn "#[0-9a-fA-F]\{6\}" src/components src/layouts` → vacío).
   - Ningún texto de interfaz fuera de `src/data` o `src/config` (salvo labels técnicos como "Saltar al contenido", "Abrir menú").
   - Las islas usan `client:visible` (calculadora) y `client:idle` (formulario); ninguna otra isla.
   - Los 5 bugs del prototipo están corregidos: contador en 0 sin tareas; botón deshabilitado sin tareas; horas con
     1 decimal; nota con 4,33 semanas y 160 h; la cantidad se conserva al desmarcar.
4. Reglas de contenido de §2 respetadas en el HTML generado.
5. Tamaño de JS en `dist/_astro/*.js` razonable (las islas son las únicas que cargan React).

---

## FASE E — Correcciones de la revisión (Agente E)

La revisión independiente (27/10/2026) aprobó la estructura. Corregir estos puntos **en este orden**. Podés tocar
cualquier archivo del proyecto salvo `plan.md` y `CLAUDE.md`. Los valores esperados de los tests de la calculadora
(§10.2) **no cambian**. Después de cada punto, `npx vitest run` de los archivos afectados.

### E.1 Marquesina cortada con movimiento reducido — `AreasMarquee.astro`
- Al contenedor animado (`flex w-max animate-marquee …`) agregarle `motion-reduce:w-auto motion-reduce:flex-wrap`.
- Sacar `gap-10` del contenedor y poner `pr-10` en cada `<ul>` (arregla el salto de ~20 px en cada vuelta).
- Reemplazar el `aria-label` del `<div>` sin rol por `role="region"` + el mismo `aria-label`.

### E.2 Monto grande partido en móvil — `CostCalculator.tsx`
- Al monto grande: `whitespace-nowrap tabular-nums` y tamaño `text-3xl sm:text-5xl`. **No** cambiar `format.ts`.

### E.3 "Quiero recuperarlo" pisa lo escrito — `ContactForm.tsx`
- Guardar en un `useRef` el último mensaje precargado. Al recibir un prefill (al montar o por suscripción):
  si `mensaje.trim()` está vacío **o** es igual al último precargado → reemplazar; si no → agregar
  `mensaje + '\n\n' + nuevo`. Actualizar el ref.
- Tests nuevos: (a) usuario escribe "Mi texto", luego `setContactPrefill('Resumen')` → textarea `Mi texto\n\nResumen`;
  (b) dos prefills seguidos sin escribir nada → queda solo el segundo.

### E.4 Inputs numéricos que no se pueden vaciar — `CostCalculator.tsx`
- Guardar en estado el **texto** de cada input (`timesText` por tarea y `salaryText`). Para `calculate()` convertir con
  `sanitizeNonNegative(Number(text))` (texto vacío → 0). El input muestra el texto tal cual.
- Test nuevo: limpiar el sueldo → el input queda vacío (`''`) y el monto grande muestra `$ 0,00`; tipear `1500000` →
  el input vale `1500000` (no `01500000`).
- Los tests existentes (recordar `55`, valores iniciales, etc.) tienen que seguir pasando.

### E.5 Bordes de inputs con contraste bajo (WCAG 1.4.11) — `global.css` + islas
- Nuevo token `--color-field-border: #5b7590;` en `@theme` (no tocar `--color-border-strong`).
- Verificar con una función de contraste (calcularla en un script Node descartable) que `#5b7590` da ≥ 3:1 contra
  `#0d1e2f` y `#0a1826`; si no, aclarar el tono hasta lograrlo y usar ese valor.
- Usar `border-field-border` en todos los `input`/`textarea` de las dos islas (checkboxes incluidos).

### E.6 Scroll con movimiento reducido y foco — `CostCalculator.tsx`
- `scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })` usando el mismo `matchMedia`.
- Después del scroll, mover el foco al textarea del formulario: `document.getElementById('mensaje')?.focus({ preventScroll: true })`
  (verificar el id real del textarea en `ContactForm.tsx`).
- Actualizar el test de CTA para verificar el foco (crear un `<textarea id="…">` dentro del div de prueba).

### E.7 Padding de tarjetas que no se aplica — `Card.astro`
- Agregar prop `padding?: 'md' | 'sm'` (default `'md'` = `p-6 sm:p-8`; `'sm'` = `p-5 sm:p-6`) y no concatenar
  clases de padding. Actualizar `Problema.astro` y `Caso.astro` para usar `padding="sm"` y quitar su `p-*`.
- Revisar con `grep -rn "<Card" src` que ningún otro uso pase clases `p-`.

### E.8 Header entre 768 y ~1000 px
- Links del nav y botón con `whitespace-nowrap`. El nav de escritorio y el botón pasan de `md:` a `lg:`; el botón de
  menú móvil pasa de `md:hidden` a `lg:hidden`.

### E.9 Botón flotante tapa el footer
- `Footer.astro`: padding inferior `pb-28 md:pb-12` (o el equivalente que deje el copyright libre).

### E.10 Títulos concatenados sin espacio — `SectionHeading.astro`
- Insertar `{' '}` entre los dos `<span class="block">`. Test nuevo en `tests/build/structure.test.ts`: el texto del
  `h1` contiene `entero, sumado` y el de `#problema-titulo` contiene `plata y no`.

### E.11 Detalles chicos
- `LogoMark.astro`: usar `SITE.name` en lugar del texto escrito a mano.
- `ContactForm.tsx`: el campo de contacto con `autoComplete="on"` (acepta teléfono o email).
- `SEO.astro`: escapar `<` en el JSON-LD: `JSON.stringify(...).replace(/</g, '\u003c')`.
- `CostCalculator.tsx`: borrar el comentario `eslint-disable` huérfano.
- `CalculadoraSection.astro` y `Contacto.astro`: mismo espaciado entre `SectionLabel` y `SectionHeading` que el resto de las secciones (revisar cuál usan las otras).
- Formulario: evitar doble envío (si `status === 'submitting'`, ignorar el submit). Test nuevo: dos clics rápidos en
  Enviar con un `fetch` que tarda (promesa que se resuelve después) → `fetch` llamado 1 vez.
- Calculadora: test nuevo de que al desmontar no quedan timers (`vi.getTimerCount()` es 0 después de `unmount()` con timers falsos).

### E.12 Tests de contenido más estrictos
- `src/data/content.test.ts`: el regex de `AFIP`/`ARCA` pasa a no distinguir mayúsculas (`/\b(afip|arca)\b/i`).
- `tests/build/structure.test.ts` (test 11): agregar a la lista sobre el HTML visible `factura electrónica`,
  `app móvil`, `aplicación móvil`, `sin cargo` y la regex `/\b(afip|arca)\b/i`.

### E.13 Verificación final
`npm run verify` completo en verde. Reportar la cantidad de tests por etapa y cualquier desvío.
