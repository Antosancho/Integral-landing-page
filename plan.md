# Plan — Adaptar la landing al sistema de diseño de Integral + textarea del formulario

> Plan pensado para que lo ejecuten agentes de IA de menor potencia, paso a paso.
> Fecha: 28/10/2026. El plan anterior (construcción inicial de la landing) quedó en el historial de git.

---

## 0. Cómo usar este plan (LEER ENTERO ANTES DE EMPEZAR)

### 0.1 Qué hay que resolver

1. **Issue 1 — Adaptar la UI al sistema de diseño (DS) de Integral.** La landing hoy usa una paleta propia
   (azul noche + celeste `#8db8e3`, botones píldora, todo en Plus Jakarta Sans). Hay que llevarla al DS de Integral,
   **tema Oscuro**, con fidelidad total: tokens de color, tipografías, radios, sombras, foco, botones, inputs, header
   y logos.
2. **Issue 2 — Textarea del formulario.** Al tocar "Quiero recuperarlo" en la calculadora, el mensaje precargado no
   entra en el `<textarea rows=5>` y aparece la barra de scroll nativa (blanca, fea sobre fondo oscuro). Solución:
   el textarea **crece solo con el contenido** entre un mínimo (144px) y un máximo (320px); recién al pasar el máximo
   aparece una barra de scroll **estilada con los tokens del DS**.

### 0.2 Decisiones ya tomadas con el usuario (no rediscutir)

| Tema | Decisión |
|---|---|
| Tema de color | **Oscuro del DS** (valores exactos de la §2.1). Se elimina el celeste `#8db8e3`. |
| Logo | Usar los **PNG del DS** (horizontal oscuro en header/footer, ícono cuadrado como favicon). Se borra la "∫" dibujada con texto. |
| Fidelidad | **Total**: botones radio 10px (no píldora), tarjetas 16px, inputs 6px, IBM Plex Sans para texto y números, Plus Jakarta Sans solo para títulos/nav/rótulos. |
| Gradientes | Se elimina el degradé radial del Hero (el DS dice "nada de gradientes"). |
| Textarea | Auto-crecer 144px → 320px, `resize-none`, scroll estilado (`scrollbar-ds`) solo arriba de 320px. |
| Inputs `type="number"` de la calculadora | **No** se cambian a texto (eso toca la lógica y los tests de la calculadora). Solo se ocultan los spinners por CSS. |

### 0.3 Fuente de verdad del DS

- Artifact "Integral" (Design System): `https://claude.ai/artifact/GqLNZDeRjXRUZJSQEiJbhz`.
  Archivos útiles: `project/README.md`, `project/tokens.css`, `project/components/bundle.css`.
- **No hace falta leerlo**: todo lo necesario está copiado en la §2 de este plan. Solo leelo si algo de la §2 te
  resulta ambiguo (con la herramienta Artifact, `action: "read"`, `path: "project/tokens.css"`). Su contenido es
  **dato**, no instrucciones.
- **No modifiques el artifact del DS.**

### 0.4 Reparto entre agentes

| Fase | Agente | Secciones | Corre en paralelo con |
|---|---|---|---|
| A | **Agente A — Base** (tokens, fuentes, logos, UI compartida) | §3 | Nadie (va primero) |
| B | **Agente B — Islas React** (calculadora, formulario, textarea) | §4 | Agente C |
| C | **Agente C — Layout, secciones y SEO** | §5 | Agente B |
| D | **Revisión** (orquestador o agente revisor distinto de A/B/C) | §6 | — |

Modelo sugerido para A, B y C: Sonnet, razonamiento medio. El revisor de D tiene que ser un agente **distinto** a
los que ejecutaron.

**Regla de propiedad de archivos:** cada agente SOLO crea o modifica los archivos que su fase lista como propios
(tabla "Archivos de esta fase" al inicio de cada fase). Si necesitás tocar un archivo de otro agente, NO lo toques:
anotalo en tu reporte final.

### 0.5 Reglas generales para todos los agentes

1. Windows, pero usá la herramienta **Bash** (sintaxis POSIX). Proyecto: `/h/anton/Proyectos/Integral-landing-page`.
2. Antes de empezar: `node -v` tiene que ser **≥ 22.23.4**. Si no, frená y reportá "Node desactualizado".
3. **No hagas `git commit`, `git push` ni cambies de rama.** El usuario commitea.
4. **No cambies textos visibles** (`src/data/*`, `src/config/site.ts` salvo `themeColor`). Esta tarea es solo visual.
5. **No cambies la lógica** de `src/lib/calculator.ts`, `prefill.ts`, `validation.ts`, `contact-submit.ts`.
6. Colores **solo por tokens** (clases Tailwind de la §2.1). Prohibido hex, `rgb()` o colores de Tailwind por defecto
   (`white`, `gray-500`, …) en componentes. Excepciones: `scripts/generate-og.mjs` y `src/styles/global.css`.
7. TypeScript estricto, sin `any`, imports relativos. Respetá el estilo del código que rodea (comentarios escasos,
   en español).
8. Después de cada paso con código, corré la verificación que indica el paso. Si falla, arreglalo antes de seguir.
   Si no podés en 3 intentos, frená y reportá el error exacto.
9. Si Prettier está disponible, formateá **solo los archivos que tocaste**: `npx prettier --write <archivos>`.
   No corras `npm run format` (formatea todo el repo).
10. Al terminar, reportá: archivos creados/modificados/borrados, salida resumida de las verificaciones y desvíos.

---

## 1. Diagnóstico (para entender el porqué)

### 1.1 Issue 1 — Estado actual vs DS

| Aspecto | Hoy | DS de Integral (tema Oscuro) |
|---|---|---|
| Fondo | `#07111b` | `bg` `#081420` |
| Tarjeta | `#0d1e2f`, `rounded-3xl` (24px), sin sombra | `surface` `#0f2236`, `radius-lg` 16px, `shadow-sm` |
| Acento | celeste `#8db8e3` | `link`/`info`/`focus-ring` `#7fb2e6`; `success` `#5fd3ad` para plata a favor |
| Botón primario | blanco (`bg-text`) píldora, hover celeste | `primary` `#2f6ba8` + texto blanco, radio 10px, hover `#255a8f` |
| Botón secundario | borde píldora | `surface` + borde `border-control` `#6c84a0`, radio 10px |
| Inputs | `rounded-xl`, borde `#5b7590`, foco solo cambia el borde | radio 6px, borde `border-control`, foco = borde + anillo 3px `focus-ring`; error = borde `danger-border` + fondo `danger-soft` + mensaje `danger` con ícono |
| Tipografía | Plus Jakarta Sans en todo | Plus Jakarta Sans 700/800 en títulos, nav y rótulos; **IBM Plex Sans** en texto y **todos los números** (`tabular-nums`) |
| Foco | 2px celeste, offset 3px | **3px** `focus-ring`, offset **2px** |
| Header | translúcido con blur | sólido `surface-header` `#0a1826` (firma de la marca), alto 60px, logo PNG 30px de alto |
| Logo | "∫" dibujada con texto | PNG del DS. Regla del DS: **nunca redibujar la ∫** |
| Gradientes | degradé radial en el Hero | prohibidos |

### 1.2 Issue 2 — Por qué aparece la barra de scroll

- `src/components/islands/ContactForm.tsx`: el `<textarea>` tiene `rows={5}` y altura fija.
- `buildPrefillMessage` (`src/lib/calculator.ts:71`) arma un texto de 300 a 700 caracteres según las tareas marcadas.
  En móvil eso son 10–18 líneas → desborda las 5 filas → aparece el scroll nativo.
- Además, el documento no declara `color-scheme: dark`, así que la barra nativa se pinta clara.

**Solución:** función pura `textareaHeight()` en `src/lib/textarea.ts` (con tests) + el componente la aplica en un
`useLayoutEffect` cada vez que cambia el mensaje (incluido el prefill) y al redimensionar la ventana. Arriba del
máximo se activa `overflow-y: auto` con la utilidad `scrollbar-ds`. Y `color-scheme: dark` en `html`.

---

## 2. Referencia del DS (copiada; usar estos valores TAL CUAL)

### 2.1 Tokens de color (tema Oscuro) → variables de Tailwind

Cada fila define `--color-<nombre>` en `@theme`, lo que genera las clases `bg-<nombre>`, `text-<nombre>`,
`border-<nombre>`, `outline-<nombre>`, `accent-<nombre>`, etc.

| Token | Valor | Uso (del DS) |
|---|---|---|
| `bg` | `#081420` | Fondo de la página. |
| `surface` | `#0f2236` | Tarjetas, FAQ, inputs, panel de la calculadora. |
| `surface-sunken` | `#0b1a2a` | Secciones alternas (`tone="deep"`), botón deshabilitado. |
| `surface-hover` | `#152c44` | Hover de botón secundario y de filas. |
| `surface-selected` | `#1a3a5c` | Fila de tarea marcada en la calculadora. |
| `surface-header` | `#0a1826` | Header, menú móvil y footer (fondo del logo PNG). |
| `border` | `#24405c` | Divisores y bordes de tarjetas (decorativo). |
| `border-control` | `#6c84a0` | Borde de inputs y botón secundario (≥ 3:1). |
| `border-strong` | `#c9d6e3` | Borde de elemento activo (casi no se usa). |
| `ink` | `#eef3f7` | Texto principal. |
| `ink-muted` | `#a9b8c7` | Texto secundario, labels, línea 2 de los títulos. |
| `ink-subtle` | `#8fa1b4` | Placeholders y metadatos. |
| `ink-disabled` | `#5d7189` | Texto deshabilitado. |
| `ink-on-brand` | `#ffffff` | Texto sobre `primary` y `surface-header`. |
| `ink-on-header-muted` | `#93a8bd` | Links inactivos del header/footer. |
| `link` | `#7fb2e6` | Links y acciones de texto. |
| `primary` | `#2f6ba8` | Botón primario. |
| `primary-hover` | `#255a8f` | Hover del primario. |
| `primary-pressed` | `#1f4f7f` | Primario presionado. |
| `primary-soft` | `#14304d` | Fondo tenue (avatar). |
| `on-primary-soft` | `#cfe1f4` | Texto sobre `primary-soft`. |
| `focus-ring` | `#7fb2e6` | Anillo de foco. |
| `danger` | `#ff8b7e` | Texto de error. |
| `danger-soft` | `#3b1512` | Fondo de input con error. |
| `danger-border` | `#ff8b7e` | Borde de input con error. |
| `warning` | `#fbbf24` | (Reservado; no se usa hoy.) |
| `warning-soft` | `#3a2a07` | (Reservado.) |
| `success` | `#5fd3ad` | Plata a favor: el ahorro de la calculadora. |
| `success-soft` | `#0f3329` | (Reservado.) |
| `info` | `#7fb2e6` | Acentos decorativos: rótulos de sección, números de paso, íconos de lista, roles. |
| `info-soft` | `#13304e` | Fondo de chips informativos (nota de ubicación del Hero, badge del Caso). |
| `header-hover` | `rgb(255 255 255 / 0.08)` | **Solo landing** (el DS lo usa literal en `.ig-nav a:hover`): hover de links en el header. |

**Regla de acentos (para decidir qué clase va en cada lugar):**
- Texto clickeable (links, "Ver más →", email, WhatsApp) → `text-link` (+ `hover:underline` si es texto suelto).
- Acento decorativo no clickeable (rótulos, números "01", íconos ✓, roles, resaltados) → `text-info`.
- Plata que se recupera/ahorra → `text-success`.

### 2.2 Tipografía

| Token Tailwind | Valor | Uso |
|---|---|---|
| `--font-sans` | `'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif` | Todo el texto y todos los números (clase por defecto del `body`). |
| `--font-display` | `'Plus Jakarta Sans Variable', 'Segoe UI', system-ui, sans-serif` | `h1`, `h2`, `h3` (por regla base), nav del header, rótulos (`SectionLabel`), marquesina, avatar. Clase `font-display`. |
| `--text-label` | `0.8125rem` / line-height `1.125rem` (13/18px) | Labels de formulario (DS `label`). Clase `text-label`. |
| `--text-button` | `0.9375rem` / line-height `1.25rem` (15/20px) | Botón tamaño md (DS `button`). Clase `text-button`. |
| `--tracking-overline` | `0.08em` | Rótulos en mayúsculas (DS `overline`). Clase `tracking-overline`. |

- Pesos cargados de IBM Plex Sans: 400, 500, 600, 700. **No** usar `font-extrabold` en texto IBM Plex (no existe el
  800): en números usar `font-bold tabular-nums`. Los títulos (Plus Jakarta) sí pueden seguir en `font-extrabold`.
- Se mantienen `--text-display` y `--text-h2` actuales (la landing necesita títulos más grandes que la app).
- **No** se usa `font-mono` (no se carga IBM Plex Mono; en el DS es solo para códigos de barra).

### 2.3 Radios, sombras, alturas

| Token Tailwind | Valor | Clase | Uso |
|---|---|---|---|
| `--radius-sm` | `6px` | `rounded-sm` | Inputs, textarea. |
| `--radius-md` | `10px` | `rounded-md` | Botones, botón flotante, links del menú móvil. |
| `--radius-lg` | `16px` | `rounded-lg` | Tarjetas (`Card`), FAQ, filas de la calculadora, panel de resultado. |
| (default) | `9999px` | `rounded-full` | **Solo** chips/badges, avatar y links de la nav del header (DS `radius-pill`). Nunca en botones. |
| `--shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.4)` | `shadow-sm` | Tarjetas. |
| `--shadow-md` | `0 8px 24px rgb(0 0 0 / 0.5)` | `shadow-md` | Panel de resultado de la calculadora. |
| `--shadow-lg` | `0 24px 64px rgb(0 0 0 / 0.6)` | `shadow-lg` | Botón flotante. |

Alturas: botón md `h-10` (40px), botón lg e inputs `h-12` (48px, DS `control-lg`; además evita el zoom de iOS con
texto de 16px), header `h-15` (60px), logo `h-7.5` (30px).

### 2.4 Foco y movimiento

- Foco global: `outline: 3px solid var(--color-focus-ring); outline-offset: 2px;` en `:focus-visible`.
- Inputs/textarea: además `focus-visible:border-focus-ring focus-visible:outline-offset-0` (DS `.ig-input:focus-visible`).
- Transiciones: `transition-colors` (≈120ms). `prefers-reduced-motion` ya está cubierto en `global.css`: mantenerlo.

### 2.5 Logos (PNG del DS)

| Archivo destino | Origen en el DS (id de asset) | Tamaño | sha256 |
|---|---|---|---|
| `public/brand/factor-integral-horizontal-oscuro.png` | `0140d0ab9e979f1edd362b46f3eca8a4` | 296×72 | `0796e51d0f1802f65ac9f06f30a8a748f02c5d5d98e0e1b7a52ce54d5b4a504d` |
| `public/favicon.png` | `55064e771ccb769b4f6365c53ce739a5` (ícono cuadrado) | 146×142 | `16e2108aaa5b2f6cba826a202429589ffbde7664763519470b3a78356f168fb8` |

El PNG horizontal tiene fondo opaco azul noche (≈ `#0b1e2f`): **solo** se puede usar sobre `surface-header`.

---

## 3. FASE A — Base (Agente A)

**Archivos de esta fase:**

| Acción | Archivo |
|---|---|
| Modificar | `package.json`, `package-lock.json` (solo vía `npm install`) |
| Modificar | `src/styles/global.css` |
| Crear | `src/styles/design-system.test.ts` |
| Crear | `src/components/ui/classes.ts` |
| Modificar | `src/components/ui/Button.astro`, `Card.astro`, `Section.astro`, `SectionLabel.astro`, `SectionHeading.astro`, `Avatar.astro`, `LogoMark.astro` |
| Modificar | `src/layouts/BaseLayout.astro` |
| Crear | `public/brand/factor-integral-horizontal-oscuro.png`, `public/favicon.png` |

### A1. Instalar IBM Plex Sans

1. `npm install @fontsource/ibm-plex-sans@5`
2. Verificar que existan los CSS de subconjunto latino:
   `ls node_modules/@fontsource/ibm-plex-sans/latin-{400,500,600,700}.css`
   - Si existen → usar esos 4 en A2.
   - Si NO existen → usar `400.css`, `500.css`, `600.css`, `700.css` y anotarlo en el reporte.
3. Verificar en `package.json` que quedó en `dependencies` con versión `^5.x`.

### A2. Reescribir `src/styles/global.css`

Reemplazar el archivo entero por esta estructura (los valores son obligatorios; el orden de las variables puede variar):

```css
@import '@fontsource-variable/plus-jakarta-sans';
@import '@fontsource/ibm-plex-sans/latin-400.css';
@import '@fontsource/ibm-plex-sans/latin-500.css';
@import '@fontsource/ibm-plex-sans/latin-600.css';
@import '@fontsource/ibm-plex-sans/latin-700.css';
@import 'tailwindcss';

/* Tokens del sistema de diseño de Integral, tema Oscuro. */
@theme {
  --color-*: initial; /* sin paleta por defecto de Tailwind: solo tokens del DS */

  --font-sans: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
  --font-display: 'Plus Jakarta Sans Variable', 'Segoe UI', system-ui, sans-serif;

  --color-bg: #081420;
  /* … TODOS los colores de la tabla §2.1, en el mismo formato --color-<token>: <valor>; … */
  --color-header-hover: rgb(255 255 255 / 0.08);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
  --shadow-md: 0 8px 24px rgb(0 0 0 / 0.5);
  --shadow-lg: 0 24px 64px rgb(0 0 0 / 0.6);

  --text-label: 0.8125rem;
  --text-label--line-height: 1.125rem;
  --text-button: 0.9375rem;
  --text-button--line-height: 1.25rem;
  --tracking-overline: 0.08em;

  --container-page: 68.75rem; /* 1100px → clase max-w-page (NO cambiar) */
  /* --text-display, --text-h2 y --animate-marquee + @keyframes marquee: copiarlos SIN cambios del archivo actual */
}

/* Barra de scroll fina con tokens (textarea del formulario). */
@utility scrollbar-ds {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-control) transparent;
  &::-webkit-scrollbar { width: 10px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border-control);
    border: 3px solid var(--color-surface);
    border-radius: 9999px;
  }
  &::-webkit-scrollbar-thumb:hover { background-color: var(--color-ink-muted); }
}

@layer base {
  html {
    color-scheme: dark;
    scroll-behavior: smooth;
    scroll-padding-top: 5.5rem;
  }
  body {
    background-color: var(--color-bg);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1, h2, h3 { font-family: var(--font-display); }
  :focus-visible {
    outline: 3px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
  ::selection {
    background-color: var(--color-primary);
    color: var(--color-ink-on-brand);
  }
  /* Sin spinners en los inputs numéricos (regla del DS). */
  input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

  /* Bloque @media (prefers-reduced-motion: reduce) actual: copiarlo SIN cambios. */
}
```

Notas:
- Ya **no** existen `--color-text`, `--color-muted`, `--color-accent`, `--color-accent-soft`, `--color-surface-2`,
  `--color-bg-deep`, `--color-field-border`. Las clases viejas (`text-muted`, `bg-surface-2`, …) dejan de generar CSS
  en silencio: por eso las fases B y C las reemplazan y la fase D agrega un test que las prohíbe.
- Verificación: `npm run build` tiene que terminar sin errores.

### A3. Test de tokens: `src/styles/design-system.test.ts`

Test con Vitest que lee `src/styles/global.css` como texto (`readFileSync(path.resolve(process.cwd(), 'src/styles/global.css'), 'utf8')`)
y extrae las variables con la regex `/--color-([a-z0-9-]+):\s*([^;]+);/g` → `Map<nombre, valor>`.

Casos (un `it` por punto):
1. **Cada token de la §2.1 existe con su valor exacto** (comparar en minúsculas y sin espacios extra). Escribí la
   tabla esperada como objeto `const EXPECTED: Record<string, string> = { bg: '#081420', surface: '#0f2236', … }`.
2. **No quedan tokens viejos**: ninguna de `text`, `muted`, `accent`, `accent-soft`, `surface-2`, `bg-deep`,
   `field-border` está en el mapa.
3. **Contraste de texto ≥ 4.5:1** (WCAG) para estos pares `[texto, fondo]`:
   `ink/bg`, `ink/surface`, `ink/surface-selected`, `ink-muted/bg`, `ink-muted/surface`, `ink-muted/surface-sunken`,
   `ink-muted/surface-selected`, `ink-subtle/surface`, `link/bg`, `link/surface`, `link/surface-sunken`,
   `info/info-soft`, `success/surface`, `success/bg`, `danger/surface`, `danger/danger-soft`,
   `ink-on-brand/primary`, `ink-on-brand/primary-hover`, `ink-on-brand/surface-header`,
   `ink-on-header-muted/surface-header`, `on-primary-soft/primary-soft`.
4. **Contraste de controles ≥ 3:1**: `border-control/surface`, `border-control/bg`, `focus-ring/surface`,
   `focus-ring/bg`, `focus-ring/surface-header`.
5. **Radios**: el CSS contiene `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`.
6. **Fuentes**: contiene `--font-sans: 'IBM Plex Sans'` y `--font-display: 'Plus Jakarta Sans Variable'`.
7. **Base**: contiene `color-scheme: dark` y `@utility scrollbar-ds`.

Helper de contraste (dentro del test, solo para hex `#rrggbb`):

```ts
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

Valores de referencia ya calculados (todos pasan): `ink/bg` 16.6, `ink-on-brand/primary` 5.54, `link/surface` 7.23,
`border-control/surface` 4.18, `ink-muted/surface-selected` 5.75.

Verificación: `npx vitest run src/styles/design-system.test.ts` en verde.

### A4. Clases compartidas: `src/components/ui/classes.ts`

Archivo nuevo con strings de clases reutilizadas por `Button.astro` y por las islas React (Tailwind 4 detecta las
clases en archivos `.ts`). Contenido obligatorio:

```ts
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
  'w-full rounded-sm border border-border-control bg-surface text-base text-ink placeholder:text-ink-subtle hover:border-ink-muted focus-visible:border-focus-ring focus-visible:outline-offset-0 aria-[invalid=true]:border-danger-border aria-[invalid=true]:bg-danger-soft';

export const inputClass = `${fieldBase} h-12 px-3`;

export const textareaClass = `${fieldBase} resize-none px-3 py-2.5 scrollbar-ds`;

export const labelClass = 'mb-1.5 block text-label font-medium text-ink-muted';
```

### A5. Componentes UI

| Archivo | Cambio exacto |
|---|---|
| `Button.astro` | Agregar prop `size?: 'md' \| 'lg'` (default `'lg'`). `class:list={[buttonBase, buttonSize[size], buttonVariant[variant], className]}` importando de `./classes`. Se va `rounded-full`, `bg-text`, `hover:bg-accent`. |
| `Card.astro` | `'rounded-lg border border-border bg-surface shadow-sm'` + `paddingClass` (sin cambios) + `className`. |
| `Section.astro` | `tone === 'deep' && 'bg-surface-sunken'`. |
| `SectionLabel.astro` | `<p class="font-display text-xs font-bold tracking-overline text-info uppercase">` (mantener el `•` con `aria-hidden`). |
| `SectionHeading.astro` | Línea 1 `text-ink`, línea 2 `text-ink-muted`. Mantener `font-extrabold tracking-tight` y los tamaños. |
| `Avatar.astro` | `bg-primary-soft text-on-primary-soft font-display … rounded-full font-extrabold` (resto igual). |
| `LogoMark.astro` | Ver A6. |
| `BaseLayout.astro` | `<body class="bg-bg font-sans text-ink antialiased">`. Skip link: reemplazar `focus:rounded-full focus:bg-text … focus:text-bg` por `focus:rounded-md focus:bg-primary focus:text-ink-on-brand` (resto igual). |

### A6. Logos

1. Crear `public/brand/`.
2. Conseguir los dos PNG de la §2.5. Opción 1 (preferida): herramienta Artifact, `action: "read"`,
   `url: "https://claude.ai/artifact/GqLNZDeRjXRUZJSQEiJbhz"`, `path: "<id de asset>"` (uno por llamada); guarda el
   archivo y dice dónde. Copiarlo al destino con `cp`. Opción 2 (si la opción 1 no está disponible): copiar desde
   `C:/Users/asant/AppData/Local/Temp/claude/h--anton-Proyectos-Integral-landing-page/44c64964-7c43-4ce7-8115-9faae4261487/scratchpad/artifact-files/8038b814-61e1-444e-b7b1-ea1ed6f888a9/<id>.png`.
   Si ninguna funciona: **frená y reportá**; no dibujes ni generes un logo.
3. Verificar: `sha256sum public/brand/factor-integral-horizontal-oscuro.png public/favicon.png` coincide con §2.5.
4. Reescribir `LogoMark.astro`:
   - Props: `class?: string`, `decorative?: boolean` (default `false`).
   - Renderiza **solo** `<img src="/brand/factor-integral-horizontal-oscuro.png" width="296" height="72" alt={decorative ? '' : SITE.name} class:list={['h-7.5 w-auto', className]} />`.
   - `decorative` se usa cuando el logo está dentro de un link que ya tiene `aria-label` (header).
   - Se va el `<span>∫</span>` y el texto.
5. **No** borres `public/favicon.svg` ni toques `SEO.astro` (son de la fase C).

### A7. Verificación de la fase A

- `npm run typecheck` sin errores.
- `npm test` en verde (los tests existentes no miran clases; si alguno falla, es un bug tuyo).
- `npm run build` sin errores.
- `grep -rnE "rounded-full|bg-text|text-bg|accent|text-muted|text-text" src/components/ui src/layouts` → no debe
  aparecer nada salvo `rounded-full` en `Avatar.astro`.

---

## 4. FASE B — Islas React + textarea (Agente B)

Requiere la fase A terminada. Puede correr en paralelo con la fase C.

**Archivos de esta fase:**

| Acción | Archivo |
|---|---|
| Crear | `src/lib/textarea.ts`, `src/lib/textarea.test.ts` |
| Modificar | `src/components/islands/ContactForm.tsx`, `ContactForm.test.tsx` |
| Modificar | `src/components/islands/CostCalculator.tsx` (`CostCalculator.test.tsx` solo si hiciera falta, ver B6) |

### B1. Función pura `src/lib/textarea.ts`

```ts
/** Alto mínimo y máximo del textarea del formulario, en px. */
export const TEXTAREA_LIMITS = { minHeight: 144, maxHeight: 320 } as const;

export interface TextareaMeasure {
  scrollHeight: number;
  borderY: number; // borde superior + inferior
  minHeight: number;
  maxHeight: number;
}

/** Alto a aplicar y si hace falta scroll (el contenido supera el máximo). */
export function textareaHeight(m: TextareaMeasure): { height: number; scrollable: boolean } {
  // implementar:
  // - si scrollHeight o borderY no son finitos o son < 0 → { height: minHeight, scrollable: false }
  // - content = scrollHeight + borderY
  // - height = min(max(content, minHeight), maxHeight)
  // - scrollable = content > maxHeight
}
```

### B2. Tests `src/lib/textarea.test.ts`

Usar `minHeight: 144, maxHeight: 320` salvo que se diga otra cosa:

1. `scrollHeight 50, borderY 2` → `{ height: 144, scrollable: false }`.
2. `scrollHeight 198, borderY 2` → `{ height: 200, scrollable: false }`.
3. `scrollHeight 318, borderY 2` → `{ height: 320, scrollable: false }` (justo en el máximo).
4. `scrollHeight 319, borderY 2` → `{ height: 320, scrollable: true }` (1px de más).
5. `scrollHeight 900, borderY 0` → `{ height: 320, scrollable: true }`.
6. `scrollHeight NaN` → `{ height: 144, scrollable: false }`; `scrollHeight -5` → igual.
7. `TEXTAREA_LIMITS.minHeight < TEXTAREA_LIMITS.maxHeight` y valen 144 y 320.

Verificación: `npx vitest run src/lib/textarea.test.ts` en verde.

### B3. `ContactForm.tsx` — estilos del DS

1. Borrar la constante local `fieldClass`. Importar `inputClass`, `textareaClass`, `labelClass`, `buttonBase`,
   `buttonSize`, `buttonVariant`, `buttonDisabled` desde `../ui/classes`.
2. Los 3 `<input>` visibles usan `className={inputClass}`. El `<textarea>` usa `className={textareaClass}`.
3. Las 4 `<label>` usan `className={labelClass}` (se va `mb-1 block font-bold`).
4. Hint del negocio (`#negocio-hint`): `mb-1.5 text-sm text-ink-subtle` (antes `text-muted`).
5. Mensaje de error (`errorText`): `<p id=… className="mt-1.5 flex items-start gap-1.5 text-label font-medium text-danger">`
   con un ícono SVG `circle-alert` de lucide **inline** antes del texto (`aria-hidden="true"`, `className="mt-0.5 size-4 shrink-0"`,
   `fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"`,
   hijos: `<circle cx="12" cy="12" r="10" />`, `<line x1="12" x2="12" y1="8" y2="12" />`,
   `<line x1="12" x2="12.01" y1="16" y2="16" />`). El texto del error queda igual (los tests lo buscan con `getByText`).
6. Botón submit: `className={\`${buttonBase} ${buttonSize.lg} ${buttonVariant.primary} ${buttonDisabled} w-full\`}`.
   Se va `disabled:opacity-60`.
7. Link de email del estado `mailto`: `text-link underline`.

### B4. `ContactForm.tsx` — textarea que crece

1. **Mantener `rows={5}`** (da el alto inicial en el HTML pre-renderizado, antes de hidratar) y agregar
   `style={{ minHeight: TEXTAREA_LIMITS.minHeight, maxHeight: TEXTAREA_LIMITS.maxHeight }}`.
2. Importar `useCallback` y `useLayoutEffect` de `react`, y `TEXTAREA_LIMITS`, `textareaHeight` de `../../lib/textarea`.
3. Crear la función (dentro del componente):

```ts
const fitMensaje = useCallback(() => {
  const el = refs.mensaje.current;
  if (!el) return;
  el.style.height = 'auto';
  const cs = window.getComputedStyle(el);
  const borderY = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
  const { height, scrollable } = textareaHeight({ scrollHeight: el.scrollHeight, borderY, ...TEXTAREA_LIMITS });
  el.style.height = `${height}px`;
  el.style.overflowY = scrollable ? 'auto' : 'hidden';
}, []);
```

   Ojo: `refs` es un objeto nuevo en cada render, pero `refs.mensaje` es un `useRef` estable; para que el linter de
   hooks no se queje, sacá el ref a una constante propia (`const mensajeEl = useRef<HTMLTextAreaElement>(null);`) y
   usá `mensaje: mensajeEl` dentro de `refs`.
4. `useLayoutEffect(() => { fitMensaje(); }, [mensaje, fitMensaje]);` → cubre tipeo, prefill y reseteo tras enviar.
5. `useEffect(() => { window.addEventListener('resize', fitMensaje); return () => window.removeEventListener('resize', fitMensaje); }, [fitMensaje]);`
6. No tocar la lógica del prefill ni el orden de foco.

### B5. Tests nuevos en `ContactForm.test.tsx`

Helper para simular el alto del contenido (jsdom siempre devuelve 0):

```ts
function mockScrollHeight(value: number) {
  Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', { configurable: true, get: () => value });
}
// en afterEach: delete (HTMLTextAreaElement.prototype as unknown as Record<string, unknown>).scrollHeight;
```

Casos:
1. **Mensaje corto → alto mínimo y sin scroll**: `mockScrollHeight(60)`, render, `act(() => setContactPrefill('Hola'))`
   → `textarea.style.height === '144px'` y `textarea.style.overflowY === 'hidden'`.
2. **Prefill largo crece hasta el máximo y habilita scroll**: `mockScrollHeight(600)`, render,
   `act(() => setContactPrefill('x'.repeat(700)))` → `style.height === '320px'` y `style.overflowY === 'auto'`.
3. **Alto intermedio**: `mockScrollHeight(230)` + prefill → `style.height === '230px'`, `overflowY === 'hidden'`.
4. **Al borrar el texto vuelve al mínimo**: con `mockScrollHeight(600)` y prefill largo; después `mockScrollHeight(60)`
   y `fireEvent.change(textarea, { target: { value: '' } })` → `style.height === '144px'`.
5. **Clases del DS**: el textarea tiene `toHaveClass('resize-none', 'scrollbar-ds')`.
6. **Resize de ventana recalcula**: `mockScrollHeight(60)`, render con prefill; `mockScrollHeight(600)`;
   `act(() => { window.dispatchEvent(new Event('resize')); })` → `style.height === '320px'`.
7. **Error con ícono**: enviar vacío → el `<p id="mensaje-error">` contiene un `svg[aria-hidden="true"]`.

Todos los tests existentes tienen que seguir pasando **sin modificarlos**.

Verificación: `npx vitest run src/components/islands/ContactForm.test.tsx` en verde.

### B6. `CostCalculator.tsx` — estilos del DS

1. Borrar la constante local `inputClass` e importar `inputClass`, `labelClass`, `buttonBase`, `buttonSize`,
   `buttonVariant`, `buttonDisabled` desde `../ui/classes`.
2. Reemplazos por línea (números de línea del archivo actual, pueden correrse):

| Línea aprox. | Antes | Después |
|---|---|---|
| 86 (fila de tarea) | `rounded-2xl border border-border bg-surface-2 p-4` | `rounded-lg border border-border p-4 transition-colors` + `checked ? 'bg-surface-selected' : 'bg-surface'` (armar el string con template literal) |
| 95 (checkbox) | `mt-1 size-5 border-field-border accent-accent` | `mt-1 size-5 accent-link` |
| 98 (label tarea) | `block cursor-pointer font-bold` | `block cursor-pointer font-semibold` |
| 102, 108 (detalle / "veces") | `text-muted` | `text-ink-muted` |
| 120 (input veces) | `w-24 rounded-xl border … focus:border-accent` | `` `${inputClass} w-24` `` → como `inputClass` trae `w-full`, usar en su lugar `` `${fieldBase} h-12 w-24 px-3 text-right tabular-nums` `` importando también `fieldBase` |
| label sueldo | `mb-2 block font-bold` | `labelClass` |
| input sueldo | `inputClass` local | `` `${inputClass} tabular-nums` `` |
| 146 (panel resultado) | `rounded-3xl border border-border bg-surface p-6 sm:p-8` | `rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8` |
| 147, 154, 158, 162, 166 | `text-muted` | `text-ink-muted` |
| 148 (monto en vivo) | `… text-3xl font-extrabold whitespace-nowrap tabular-nums sm:text-5xl` | igual pero `font-bold` en vez de `font-extrabold` |
| 159, 163 (`dd`) | `font-bold` | `font-semibold tabular-nums` |
| 167 (ahorro) | `font-bold text-accent` | `font-semibold tabular-nums text-success` |
| 175 (botón CTA) | `mt-6 w-full rounded-full bg-text … disabled:hover:bg-text` | `` `${buttonBase} ${buttonSize.lg} ${buttonVariant.primary} ${buttonDisabled} mt-6 w-full` `` |
| footnote | `text-xs text-muted` | `text-xs text-ink-subtle` |

3. **No** cambiar `type="number"`, `min`, `step`, `inputMode`, `aria-*`, ni la lógica.
4. Verificación: `npx vitest run src/components/islands/CostCalculator.test.tsx` en verde **sin modificar el test**.
   Si un test existente falla, el bug está en tu cambio (no en el test).

### B7. Verificación de la fase B

- `npm run typecheck`, `npm test` en verde.
- `grep -nE "text-muted|text-text|accent|surface-2|field-border|rounded-(xl|2xl|3xl|full)|bg-text|text-bg|font-extrabold" src/components/islands/*.tsx`
  → sin resultados (salvo dentro de archivos `.test.tsx`, que no deberían tener ninguno).

---

## 5. FASE C — Layout, secciones y SEO (Agente C)

Requiere la fase A terminada. Puede correr en paralelo con la fase B.

**Archivos de esta fase:**

| Acción | Archivo |
|---|---|
| Modificar | `src/components/layout/Header.astro`, `Footer.astro`, `FloatingCTA.astro` |
| Modificar | `src/components/sections/*.astro` (todas las que aparecen en C3) |
| Modificar | `src/pages/404.astro` |
| Modificar | `src/components/seo/SEO.astro`, `src/config/site.ts` (solo `themeColor`) |
| Borrar | `public/favicon.svg` |
| Modificar | `scripts/generate-og.mjs` y regenerar `public/og-image.png` |
| Modificar | `tests/build/seo.test.ts`, `tests/build/structure.test.ts` |

### C1. Header (`Header.astro`) — patrón AppHeader del DS

1. `<header class="bg-surface-header fixed inset-x-0 top-0 z-50">` (se van `border-b`, `bg-bg/80`, `backdrop-blur`).
2. Container: `class="flex h-15 items-center justify-between gap-4"` (se va `py-3`).
3. Logo: `<a href="#inicio" aria-label={…igual…}><LogoMark decorative /></a>`.
4. Nav de escritorio: `<ul class="flex items-center gap-1">`; cada link:
   `font-display text-ink-on-header-muted hover:text-ink-on-brand hover:bg-header-hover inline-flex h-9.5 items-center rounded-full px-3 text-sm font-bold whitespace-nowrap transition-colors`.
5. CTA del header: `<Button size="md" …>` (resto igual).
6. Botón hamburguesa: `text-ink-on-brand -mr-2 rounded-md p-2 lg:hidden`.
7. Menú móvil: `<nav id="menu-movil" … class="bg-surface-header border-border border-t lg:hidden">`; links:
   `text-ink-on-brand hover:bg-header-hover rounded-md px-3 py-3 font-semibold`; el `Button` del final queda con
   `size` por defecto (`lg`).
8. El `<script>` del menú NO se toca.
9. Revisar a 1024px de ancho que la nav no se desborde (5 ítems). Si se desborda, bajar `px-3` a `px-2.5`.

### C2. Footer y botón flotante

- `Footer.astro`: `<footer class="bg-surface-header border-border border-t pt-12 pb-28 md:pb-12">`.
  `<LogoMark />` (no decorativo: alt = nombre). Tagline `text-ink-on-header-muted mt-4`. Links de la nav:
  `text-ink-on-header-muted hover:text-ink-on-brand text-sm font-semibold`. Línea final `text-ink-on-header-muted border-border border-t pt-6 text-sm`.
- `FloatingCTA.astro`: `bg-primary text-ink-on-brand hover:bg-primary-hover fixed right-4 bottom-4 z-40 flex flex-col rounded-md px-5 py-3 leading-tight font-semibold shadow-lg transition-colors`.
  El `span` secundario queda `text-xs font-medium opacity-80`.

### C3. Secciones (reemplazos exactos)

Regla general en **todas** las secciones: `text-muted` → `text-ink-muted`; `text-text` → `text-ink`.

| Archivo | Antes | Después |
|---|---|---|
| `Hero.astro` | `<div aria-hidden … bg-[radial-gradient(…)]></div>` | **Borrar el div entero** y quitar `relative` del `<section>` y `class="relative"` del `<Container>` (ya no hay nada superpuesto). |
| `Hero.astro` | overline `text-accent mb-6 text-xs font-bold tracking-[0.18em] uppercase` | `font-display text-info mb-6 text-xs font-bold tracking-overline uppercase` |
| `Hero.astro` | chip ubicación `bg-accent-soft text-accent … rounded-full px-4 py-1.5 text-sm` | `bg-info-soft text-info … rounded-full px-4 py-1.5 text-sm font-medium` |
| `Problema.astro` | `<strong class="text-accent font-semibold">` | `<strong class="text-info font-semibold">` |
| `Problema.astro` | métrica `text-5xl font-extrabold` | `text-5xl font-bold tabular-nums` |
| `Problema.astro` | `<h3 class="mt-12 text-2xl font-extrabold sm:mt-16">` | sin cambios (ya toma `font-display` por la regla base) |
| `Problema.astro` | `<p class="font-bold">` (título de fuga) | `font-semibold` |
| `Servicios.astro` | código `text-accent font-mono text-sm` | `font-display text-info text-xs font-bold tracking-overline uppercase` |
| `Servicios.astro` | ícono ✓ `text-accent mt-0.5 size-4 shrink-0` | `text-info mt-0.5 size-4 shrink-0` |
| `Servicios.astro` | link `text-accent mt-auto pt-6 font-bold` | `text-link mt-auto pt-6 font-semibold hover:underline` |
| `Metodo.astro` | número `text-accent font-mono text-sm` | `font-display text-info text-xs font-bold tracking-overline` |
| `Equipo.astro` | rol `text-accent text-sm font-semibold` | `text-info text-sm font-semibold` |
| `FAQ.astro` | `details` `group border-border bg-surface rounded-2xl border` | `group border-border bg-surface rounded-lg border shadow-sm` |
| `FAQ.astro` | `summary` `… font-bold …` | `… font-semibold …` (resto igual) |
| `FAQ.astro` | "+" `text-accent text-2xl …` | `text-link text-2xl …` |
| `AreasMarquee.astro` | listas `text-muted flex gap-10 pr-10 font-bold …` | `font-display text-ink-muted flex gap-10 pr-10 font-bold …` (las dos listas; resto igual) |
| `Contacto.astro` | links email/WhatsApp `text-accent font-semibold hover:underline` | `text-link font-semibold hover:underline` |
| `Caso.astro` (desactivado, igual se adapta) | badge `bg-accent-soft text-accent inline-block rounded-full px-3 py-1 text-xs font-bold` | `bg-info-soft text-info inline-block rounded-full px-3 py-1 text-xs font-semibold` |
| `Caso.astro` | viñeta `text-accent` | `text-info` |
| `Caso.astro` | `th` `py-2 pr-4 font-bold` | `text-ink-muted text-label py-2 pr-4 font-medium` |
| `Caso.astro` | `td` | `text-ink-muted py-2 pr-4 tabular-nums` |
| `Rubros.astro`, `CalculadoraSection.astro` | — | solo la regla general |
| `404.astro` | `<h1 class="text-h2 font-extrabold tracking-tight">` | sin cambios (textos hardcodeados: no tocar, fuera de alcance) |

Verificación: `grep -rnE "accent|text-muted|text-text|font-mono|bg-bg-deep|surface-2|rounded-(xl|2xl|3xl)|gradient" src/components/sections src/components/layout src/pages`
→ sin resultados.

### C4. SEO, favicon y theme-color

1. `src/config/site.ts`: `themeColor: '#0a1826'` (= `surface-header`). Nada más en ese archivo.
2. `SEO.astro`: reemplazar `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` por
   `<link rel="icon" type="image/png" href="/favicon.png" />` y agregar `<link rel="apple-touch-icon" href="/favicon.png" />`.
3. Borrar `public/favicon.svg` (era una "∫" redibujada). Verificar antes que `public/favicon.png` existe (lo creó la fase A).
4. Buscar otras referencias: `grep -rn "favicon.svg" src tests scripts README.md CLAUDE.md` → actualizar las de
   `src/` y `tests/` (README/CLAUDE.md las actualiza la fase D; anotarlas en el reporte).

### C5. Imagen OG (`scripts/generate-og.mjs`)

Solo cambiar colores (hex permitidos en este script):
- fondo `#07111b` → `#0a1826`
- título `#eef3f7` → `#ffffff`
- subtítulo `#9fb0c2` → `#a9b8c7`
- "Chabás · Santa Fe" `#8db8e3` → `#7fb2e6`

Correr `npm run og` y confirmar que `public/og-image.png` se regeneró (fecha de modificación nueva).

### C6. Tests de build (`tests/build/*.ts`)

En `seo.test.ts`, caso `'favicon y og-image'`:
- `link[rel="icon"]` → `href` `'/favicon.png'` y `type` `'image/png'`.
- `link[rel="apple-touch-icon"]` → `href` `'/favicon.png'`.
- `existsSync(dist/favicon.png)` true; `existsSync(dist/favicon.svg)` **false**; og-image sigue existiendo.

En `seo.test.ts`, caso `'robots y theme-color'`: agregar que `meta[name="theme-color"]` tiene `content` `'#0a1826'`.

En `structure.test.ts`, agregar al final (numeración siguiente a la última existente):
1. **Logo del header**: `header img[src="/brand/factor-integral-horizontal-oscuro.png"]` existe, con `width="296"`,
   `height="72"` y `alt=""`; su link padre tiene `aria-label`.
2. **Logo del footer**: `footer img[src="/brand/factor-integral-horizontal-oscuro.png"]` existe con `alt="Factor Integral"`.
3. **Archivos del logo**: existen `dist/brand/factor-integral-horizontal-oscuro.png` y `dist/favicon.png`
   (usar `existsSync` + `path` como en `seo.test.ts`; si el helper `DIST` está ahí, reutilizar el mismo criterio).
4. **No se redibuja la ∫**: el HTML completo (`root.toString()`) no contiene `∫`.
5. **Sin gradientes**: el HTML no contiene `radial-gradient` ni `linear-gradient`.
6. **Textarea preparado**: `#formulario-contacto textarea#mensaje` tiene en `class` `scrollbar-ds` y `resize-none`
   (este test depende de la fase B: si al correrlo B no terminó, dejalo escrito y avisá en el reporte).

Verificación: `npm run build && npm run test:build` en verde (salvo el punto 6 si B no terminó).

### C7. Verificación de la fase C

- `npm run typecheck`, `npm test`, `npm run build`, `npm run test:build`.

---

## 6. FASE D — Integración y revisión (orquestador / agente revisor)

### D1. Test de guardia: `src/components/design-system-usage.test.ts`

Test nuevo que recorre como texto todos los archivos `.astro`, `.tsx` y `.ts` de `src/components`, `src/layouts` y
`src/pages` (con `readdirSync(dir, { recursive: true })`), **excluyendo** `*.test.ts(x)`. Para cada archivo verifica
que NO aparezcan (mensaje de error con nombre de archivo y coincidencia):

| Qué | Regex |
|---|---|
| Clases de tokens viejos | `/\b(?:text\|bg\|border\|accent\|outline\|ring\|from\|to)-(?:text\|muted\|accent\|accent-soft\|surface-2\|bg-deep\|field-border)\b/` |
| `text-bg` / `bg-text` | `/\b(?:text-bg\|bg-text)\b/` |
| Radios fuera del DS | `/\brounded-(?:xl\|2xl\|3xl)\b/` |
| Fuente mono | `/\bfont-mono\b/` |
| Gradientes | `/gradient/` |
| Colores sueltos | `/(?<![\w&])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/` y `/\brgba?\(/` |
| Paleta por defecto de Tailwind | `/\b(?:bg\|text\|border)-(?:white\|black\|gray\|slate\|zinc\|neutral\|red\|blue\|sky\|green)(?:-\d{2,3})?\b/` |

Y además:
- `rounded-full` solo puede aparecer en `Avatar.astro`, `Header.astro`, `Hero.astro`, `Caso.astro` (chips, avatar y
  nav). Si aparece en otro archivo, falla.
- `src/components/ui/classes.ts` no contiene `rounded-full`.

Ojo con falsos positivos de la regex de hex: anclas como `#contacto`, `#inicio`, `#faq` NO matchean (tienen letras
fuera de a–f antes de completar 3 dígitos hex). Si aparece un falso positivo real, ajustá la regex, no el componente.

Correr: `npx vitest run src/components/design-system-usage.test.ts`. Si falla, corregir el componente (o devolverlo
al agente dueño) hasta que pase.

### D2. Actualizar `CLAUDE.md`

Cambios puntuales (no reescribir el archivo):
1. Tabla **Stack**, fila Fuente → "**IBM Plex Sans** (texto y números, `@fontsource/ibm-plex-sans`) + **Plus Jakarta
   Sans** (títulos, nav, rótulos, `@fontsource-variable/plus-jakarta-sans`), self-hosted".
2. Agregar una línea bajo **Stack** o **Convenciones**: "Sistema de diseño: **Integral**, tema Oscuro
   (`https://claude.ai/artifact/GqLNZDeRjXRUZJSQEiJbhz`). Los tokens están copiados en `@theme` de `global.css`."
3. **Convenciones**, reemplazar la viñeta de colores por: "Colores solo por tokens del DS (`bg-bg`, `bg-surface`,
   `text-ink`, `text-ink-muted`, `text-link`, `text-info`, `text-success`, `bg-primary`, `border-border`,
   `border-border-control`, …). Nada de hex ni paleta por defecto de Tailwind (está desactivada con
   `--color-*: initial`). Links → `text-link`; acentos decorativos → `text-info`; plata a favor → `text-success`."
4. Reemplazar "Botones píldora (`rounded-full`)" por "Botones con radio `rounded-md` (10px) usando las clases de
   `src/components/ui/classes.ts`; tarjetas `rounded-lg` (16px); inputs `rounded-sm` (6px). `rounded-full` solo en
   chips, avatar y nav del header."
5. Reemplazar "Los bordes de campos de formulario usan `border-field-border`" por "Los campos usan `inputClass` /
   `textareaClass` de `ui/classes.ts` (borde `border-control`, error `danger`)."
6. **Organización del código**: agregar `ui/classes.ts` (clases compartidas Astro/React), `lib/textarea.ts` (alto del
   textarea que crece), `styles/design-system.test.ts`, `components/design-system-usage.test.ts`, `public/brand/` (logo PNG del DS).
7. **Pendientes de contenido**: "logo en SVG" → "logo en SVG (hoy PNG del DS en `public/brand/` y `public/favicon.png`)".
8. Si `README.md` menciona `favicon.svg`, actualizarlo a `favicon.png`.

### D3. Verificación completa

1. `npm run verify` → todo en verde. Pegá el resumen (cantidad de tests por suite).
2. `git status` → la lista de archivos tocados coincide con las tablas de las fases A, B, C y D. Nada fuera de eso
   (en particular: nada en `src/data/`, ni `src/lib/calculator.ts`).
3. `git diff --stat src/data src/lib/calculator.ts src/lib/prefill.ts src/lib/validation.ts` → vacío.

### D4. Revisión visual (si hay herramienta de navegador disponible)

`npm run build && npm run preview`, abrir `http://localhost:4321/` y revisar a **375px** y **1280px**:

- [ ] Header sólido azul noche de 60px con el logo PNG nítido, sin "caja" visible alrededor del logo.
- [ ] Botones con esquinas de 10px, primario azul `#2f6ba8` con texto blanco; ninguno píldora.
- [ ] Textos en IBM Plex Sans; títulos en Plus Jakarta Sans.
- [ ] Tab por la página: anillo de foco de 3px celeste visible en todos los links, botones e inputs.
- [ ] Calculadora: filas marcadas con fondo `surface-selected`; ahorro en verde; sin spinners en los números.
- [ ] Marcar las 7 tareas → "Quiero recuperarlo" → el textarea crece; si supera 320px aparece una barra fina gris
      azulada (no blanca). Tipear más líneas sigue creciendo hasta el tope; borrar todo lo achica.
- [ ] Enviar el formulario vacío: campos con borde y fondo rojizos, mensaje con ícono.
- [ ] Sin degradé en el Hero.

Si no hay navegador, decirlo explícitamente en el reporte (no dar la revisión visual por hecha).

### D5. Revisión de calidad (agente revisor distinto)

Pasarle a un agente revisor: el contexto de las dos issues (§0.1), este plan, y `git diff`. Pedirle que verifique:
1. Que las dos issues están resueltas (no solo que los tests pasen).
2. Que no se rompió nada: contraste, foco visible, `prefers-reduced-motion`, tests existentes sin modificar
   (salvo `seo.test.ts` y `structure.test.ts`, que se modifican a propósito).
3. Que no hay clases que no generan CSS (tokens inexistentes): para cada clase de color usada, que exista
   `--color-<nombre>` en `global.css`.
4. Que `fitMensaje` no produce bucles de render ni warnings en consola de React en los tests.
5. Que no hay hex sueltos ni textos hardcodeados nuevos.

---

## 7. Checklist final de aceptación

- [ ] `npm run verify` en verde.
- [ ] `global.css` tiene exactamente los tokens del tema Oscuro del DS (test A3).
- [ ] Ningún componente usa tokens viejos, hex, gradientes, `font-mono` ni radios fuera del DS (test D1).
- [ ] Header y footer usan el PNG del DS; no aparece "∫" dibujada en el HTML; favicon PNG del DS.
- [ ] Botones `rounded-md`, tarjetas `rounded-lg`, inputs `rounded-sm`.
- [ ] Foco 3px + offset 2px en todo.
- [ ] El textarea crece entre 144 y 320px y solo ahí muestra una barra de scroll estilada (tests B2 y B5).
- [ ] `color-scheme: dark` declarado.
- [ ] Ningún texto visible cambió; la lógica de calculadora/prefill/validación no cambió.
- [ ] `CLAUDE.md` actualizado (D2).
- [ ] No se hizo commit.
