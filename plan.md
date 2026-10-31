# Plan — Aplicar el reporte de diseño de Felipe (30/10/2026) a la landing

> Plan pensado para que lo ejecute un agente de IA de menor potencia, paso a paso.
> Fecha: 31/10/2026. El plan anterior (deploy a GitHub Pages) quedó en el historial de git.

---

## 0. Cómo usar este plan (LEER ENTERO ANTES DE EMPEZAR)

### 0.1 El problema

Felipe comparó la landing actual con una versión hecha por otra IA. Conclusión: la nuestra gana en contenido,
estructura y SEO; la otra gana en **presentación**. Hay que quedarse con nuestra base y llevarle esa presentación:
titular más ajustado, botones píldora claros, contenedores grandes con esquinas de 28 px, resultado de la
calculadora en un panel oscuro, una sola familia de letra, menos tonos de azul, menos relleno vertical, logo más
grande y sin fondo. Además: textos menos repetidos, "fiado" unificado como "cuentas corrientes", una franja
"Y también" con rubros de servicios, y el campo de sueldo con separador de miles.

### 0.2 Decisiones ya tomadas con el usuario (no rediscutir)

| Tema | Decisión |
|---|---|
| Alcance (cambio 1) | **Foco en comercios** + franja **"Y también"** con 4 rubros de servicios. El sistema Integral se señala como "Para comercios". |
| Diseño (cambios 4, 5, 9–14) | **Se aplica el reporte**, aunque se aparte del DS Integral. Se agregan tokens nuevos en `global.css`; se actualizan tests y `CLAUDE.md`. El DS de la app no se toca. |
| Fiado (cambio 3) | **Unificar todo**: la palabra "fiado" desaparece de la página; se dice "cuentas corrientes" / "cuenta corriente". |
| WhatsApp (cambio 2) | Botones de WhatsApp en hero y contacto **programados pero ocultos** mientras `SITE.whatsapp` sea `null`. No inventar número. |
| Precio (cambio 20) | **No se toca**: CLAUDE.md prohíbe mostrar precios. "¿Cuánto cuesta?" sigue diciendo "Se cotiza según cada comercio". |
| Caso real (cambio 8) | Sigue **desactivado** (`caso.enabled = false`). Solo se ajustan sus clases para que pasen los tests nuevos. |
| Formulario (cambio 7) | No hay backend (`PUBLIC_CONTACT_ENDPOINT`). No se puede probar que el mensaje llegue: queda informado como pendiente. |
| Hosting | **Producción = Netlify** (en la raíz del dominio, sin `BASE_PATH`). GitHub Pages queda solo como vista previa; no se toca su workflow. |
| Cartel "Powered by Netlify" | No viene del código del repo: lo agrega Netlify. Se revisa en la configuración del sitio en Netlify (lo hace el usuario). No se hace nada en código; se informa. |
| Variables CSS (cambio 19) | Ya existen (tokens en `@theme`). Solo se agregan las nuevas de este plan. |

### 0.3 Reglas para el agente

- Leé `CLAUDE.md` antes de empezar. Respetá: textos **solo** en `src/data/` o `src/config/site.ts`; colores solo por
  tokens; nada de hex en componentes; TypeScript estricto sin `any`; imports relativos; voseo; nada de "gratis",
  precios, "remoto", plazos, factura electrónica, AFIP/ARCA.
- **No commitear ni pushear.**
- **No cambiar** las fórmulas, minutos, tareas ni valores de control de la calculadora (700 min → 50,5 h →
  $ 378.875 → $ 4.546.500 → $ 189.438).
- Hacé las fases en orden. Al final de cada fase corré lo que dice **Verificación** y no sigas si falla.
- Shell: Windows. Usá la herramienta Bash (Git Bash). Para builds con base de GitHub Pages:
  `MSYS_NO_PATHCONV=1 SITE_URL=https://antosancho.github.io BASE_PATH=/Integral-landing-page npm run build`.
- Si un paso no se puede cumplir tal cual, elegí la opción más cercana al espíritu del plan y anotalo para el
  resumen final. No inventes datos (números de teléfono, clientes, cifras).

---

## 1. Fase 1 — Logo sin fondo (cambio 6)

El PNG actual (`public/brand/factor-integral-horizontal-oscuro.png`, 296 × 72) es **opaco**: tiene un fondo azul
`rgb(11, 29, 49)`. El DS no tiene versión transparente. Se genera una con un script (técnica "color to alpha":
no se redibuja nada, solo se vuelve transparente el color de fondo).

### 1.1 Crear `scripts/logo-transparente.mjs`

Mismo estilo que `scripts/generate-og.mjs` (ESM, `import sharp from 'sharp'`). Lógica exacta:

```js
import sharp from 'sharp';

const SRC = 'public/brand/factor-integral-horizontal-oscuro.png';
const OUT = 'public/brand/factor-integral-horizontal-transparente.png';

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const bg = [data[0], data[1], data[2]]; // color del fondo = pixel (0,0)
const out = Buffer.alloc(info.width * info.height * 4);

for (let p = 0; p < info.width * info.height; p++) {
  const c = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
  let a = 0;
  for (let k = 0; k < 3; k++) {
    const d = c[k] > bg[k] ? (c[k] - bg[k]) / (255 - bg[k]) : c[k] < bg[k] ? (bg[k] - c[k]) / bg[k] : 0;
    a = Math.max(a, d);
  }
  if (a < 0.04) a = 0; // ruido de compresión alrededor del fondo
  for (let k = 0; k < 3; k++) {
    out[p * 4 + k] = a > 0 ? Math.round(Math.min(255, Math.max(0, (c[k] - bg[k]) / a + bg[k]))) : 0;
  }
  out[p * 4 + 3] = Math.round(a * 255);
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(OUT);
console.log(`Logo transparente generado: ${OUT}`);
```

### 1.2 `package.json`

Agregar el script `"logo": "node scripts/logo-transparente.mjs"` (al lado de `"og"`).

### 1.3 Generar el archivo

Correr `npm run logo`. Verificar con node que `public/brand/factor-integral-horizontal-transparente.png` existe, mide
296 × 72, tiene canal alfa y el pixel (0,0) tiene alfa 0:

```bash
node -e "const s=require('sharp');s('public/brand/factor-integral-horizontal-transparente.png').raw().toBuffer({resolveWithObject:true}).then(({data,info})=>console.log(info.width,info.height,info.channels,data[3]))"
# esperado: 296 72 4 0
```

El PNG opaco **no se borra** (es la fuente del script).

**Verificación fase 1:** el comando de arriba imprime `296 72 4 0`.

---

## 2. Fase 2 — Tokens nuevos en `src/styles/global.css` (cambios 4, 5, 10, 11, 14)

### 2.1 Una sola familia de letra (cambio 10)

- Borrar las 4 líneas `@import '@fontsource/ibm-plex-sans/latin-*.css';`.
- `--font-sans: 'Plus Jakarta Sans Variable', 'Segoe UI', system-ui, sans-serif;`
- `--font-display` queda igual (mismo valor que `--font-sans`; se mantiene para no tocar todas las clases `font-display`).
- Correr `npm uninstall @fontsource/ibm-plex-sans`.
- `grep -rn "ibm-plex\|IBM Plex" src scripts README.md CLAUDE.md` y corregir lo que quede (CLAUDE.md se actualiza en la fase 8).

### 2.2 Colores nuevos del botón claro (cambio 4)

Agregar dentro de `@theme`, después de `--color-header-hover`:

```css
  /* Botón principal claro (reporte 30/10/2026). */
  --color-cta: #eef3f7;
  --color-cta-hover: #c9d6e3;
  --color-on-cta: #081420;
```

No cambiar los valores de los tokens existentes.

### 2.3 Radios (cambio 5)

Agregar después de `--radius-lg: 16px;`:

```css
  --radius-field: 12px; /* campos y chips → rounded-field */
  --radius-panel: 28px; /* contenedores grandes → rounded-panel */
```

Escala final: `rounded-panel` (28) contenedores grandes · `rounded-lg` (16) tarjetas internas · `rounded-field` (12)
campos y chips · `rounded-full` botones (y avatar, nav del header). `rounded-md`/`rounded-sm` quedan definidos pero
casi sin uso.

### 2.4 Espaciado de letras de los títulos (cambio 11)

```css
  --tracking-display: -0.045em; /* H1 → tracking-display */
  --tracking-heading: -0.03em; /* H2 → tracking-heading */
```

### 2.5 Relleno vertical de secciones (cambio 14)

```css
  --spacing-section: clamp(3rem, 1.5rem + 4vw, 5.5rem); /* 48 → 88 px → py-section */
```

### 2.6 Tests: `src/styles/design-system.test.ts`

- En `EXPECTED` agregar `cta: '#eef3f7'`, `'cta-hover': '#c9d6e3'`, `'on-cta': '#081420'`.
- En "el texto tiene contraste de al menos 4.5:1" agregar los pares:
  `['on-cta', 'cta']`, `['on-cta', 'cta-hover']`, `['ink-muted', 'surface-header']`,
  `['ink-subtle', 'surface-header']`, `['success', 'surface-header']`, `['ink', 'surface-header']`, `['ink', 'surface-hover']`.
- En "los controles tienen contraste de al menos 3:1" agregar `['cta', 'bg']`, `['cta', 'surface']`, `['info', 'surface']`.
- "define los radios del DS": agregar `expect(css).toContain('--radius-field: 12px')` y `'--radius-panel: 28px'`.
- "define las fuentes del DS": cambiar a
  `expect(css).toContain("--font-sans: 'Plus Jakarta Sans Variable'")`, mantener el de `--font-display`, y agregar
  `expect(css).not.toMatch(/ibm-plex|IBM Plex/i)`.
- Test nuevo `'define tracking y espaciado de sección'`: contiene `--tracking-display: -0.045em`,
  `--tracking-heading: -0.03em` y `--spacing-section: clamp(`.

**Verificación fase 2:** `npx vitest run src/styles` pasa. (Si algún par nuevo de contraste no llega, NO bajes el
umbral: avisá en el resumen final y sacá ese par.)

---

## 3. Fase 3 — Clases compartidas y componentes base

### 3.1 `src/components/ui/classes.ts`

```ts
export const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors';

export const buttonSize = {
  md: 'h-10 px-5 text-button',
  lg: 'h-12 px-7 text-button',
} as const;

export const buttonVariant = {
  primary: 'bg-cta text-on-cta hover:bg-cta-hover',
  secondary: 'border border-border-control text-ink hover:border-ink-muted hover:bg-surface-hover',
} as const;
```

- `buttonDisabled`: reemplazar `disabled:bg-surface-sunken` por `disabled:bg-surface` y
  `disabled:hover:bg-surface-sunken` por `disabled:hover:bg-surface`.
- `fieldBase`: `rounded-sm` → `rounded-field`.
- Actualizar el comentario de arriba: "Clases de la landing (base DS Integral + ajustes del reporte 30/10/2026)…".

### 3.2 `src/components/ui/Button.astro`

Agregar prop `external?: boolean`. Si es `true`, el `<a>` lleva `target="_blank"` y `rel="noopener noreferrer"`
(si no, ambos `undefined`).

### 3.3 `src/components/ui/Card.astro`

Agregar prop `panel?: boolean` (default `false`):
- `panel` → clases `rounded-panel p-5 sm:p-10 lg:p-14` (ignora `padding`).
- sin `panel` → como hoy: `rounded-lg` + `paddingClass`.
- Común a ambos: `border-border bg-surface border shadow-sm`.

### 3.4 `src/components/ui/Section.astro`

- **Eliminar** la prop `tone` (y su lógica). Se terminan los fondos alternados: el reporte pide 3 tonos de fondo
  (base `bg`, tarjeta `surface`, pie `surface-header`).
- Clase: `py-section` en lugar de `py-20 sm:py-28`.

### 3.5 `src/components/ui/SectionHeading.astro`

- H1: `text-display tracking-display`; H2: `text-h2 tracking-heading`. Sacar `tracking-tight`.
- Prop nueva `accent?: boolean` (default `false`): si es `true`, la línea 2 va en `text-info` en lugar de
  `text-ink-muted` (cambio "color en el titular"; solo lo usa el Hero).

### 3.6 `src/components/ui/LogoMark.astro`

- `src` → `withBase('/brand/factor-integral-horizontal-transparente.png', import.meta.env.BASE_URL)`.
- Prop nueva `size?: 'md' | 'lg'` (default `'md'`): `md` → `h-10 w-auto` (40 px, ≈165 px de ancho);
  `lg` → `h-14 w-auto`. No combinar dos clases `h-*`.
- `width="296"` y `height="72"` quedan.

### 3.7 `src/components/ui/Avatar.astro`

`bg-primary-soft text-on-primary-soft` → `border-border bg-bg text-info border`. Sigue `rounded-full`.

### 3.8 `src/layouts/BaseLayout.astro` (skip link)

`focus:rounded-md focus:bg-primary … focus:text-ink-on-brand` → `focus:rounded-full focus:bg-cta … focus:text-on-cta`.

### 3.9 `src/components/design-system-usage.test.ts`

- `ROUNDED_FULL_ALLOWED = ['Avatar.astro', 'Header.astro', 'FloatingCTA.astro', 'BaseLayout.astro', 'classes.ts']`
  (salen Hero y Caso: sus chips pasan a `rounded-field`).
- Renombrar el test `'rounded-full solo en chips, avatar y nav del header'` a
  `'rounded-full solo en botones, avatar y nav del header'`.
- Reemplazar `'las clases compartidas no usan rounded-full'` por `'los botones son píldora y los campos usan rounded-field'`:
  `buttonBase` contiene `rounded-full`; `fieldBase` contiene `rounded-field`.
- Agregar a `FORBIDDEN`:
  `['tonos de fondo fuera de la paleta reducida', /\b(?:bg|disabled:bg|disabled:hover:bg|focus:bg)-(?:surface-sunken|surface-selected|primary-soft|info-soft|primary)\b/]`
  y `['prop tone de Section', /tone="deep"/]`.
  Ojo: `bg-primary-hover` también tiene que dar error (`\bbg-primary\b` matchea `bg-primary-hover` porque `-` es borde
  de palabra): está bien, ya no se usa.

**Verificación fase 3:** `npm run typecheck` va a fallar hasta terminar la fase 4 (por `tone="deep"`). Seguí.

---

## 4. Fase 4 — Secciones y layout

### 4.1 Quitar `tone="deep"`

En `Servicios.astro`, `Metodo.astro`, `FAQ.astro`, `Contacto.astro`: `<Section id="…" tone="deep">` → `<Section id="…">`.

### 4.2 `Hero.astro` (cambios 2 y 11: centrado, logo arriba, color en el titular)

- `<section … class="overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">`, `<Container class="text-center">`.
- Primer hijo: `<LogoMark decorative size="lg" class="mx-auto mb-8" />`.
- Overline igual. `<SectionHeading as="h1" id="inicio-titulo" lines={hero.titleLines} accent />`.
- Lead: `mx-auto mt-8 max-w-2xl text-lg`.
- Botones: `mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center`. Orden: primario (calculadora), secundario
  (visita), y **si hay WhatsApp** un tercer botón `variant="secondary" external href={wa} cta="hero-whatsapp"` con
  texto `hero.whatsappLabel`. `wa = buildWhatsAppUrl(SITE.whatsapp)` (de `../../lib/contact`).
- Chip de ubicación: `bg-info-soft … rounded-full` → `border-border text-info rounded-field border` (sin fondo).
  Mantener `inline-flex`, el svg y el texto. Queda centrado por el `text-center` del Container.

### 4.3 `Problema.astro` (cambios 12, 16, 17)

- Todo el contenido de la sección va **dentro** de `<Card panel>`: label, heading, párrafo, métricas, título de pérdidas
  y lista.
- Lista de pérdidas: ahora son 5. Grid `mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. Cada ítem **no** usa `Card`
  (quedaría igual al panel): `<li class="border-border rounded-lg border p-5">` con título y texto como hoy.

### 4.4 `CalculadoraSection.astro` (cambio 12)

Igual que Problema: label, heading, intro y la isla, todo dentro de `<Card panel>` (borrar el `<Card class="mt-12 sm:mt-16">`
interno; la isla va en un `<div class="mt-10 sm:mt-12">`).

### 4.5 `islands/CostCalculator.tsx` (cambio 13 + campo de sueldo)

- Grid: `grid gap-8 lg:grid-cols-2`.
- Fila de tarea: `rounded-lg border p-4 transition-colors` + seleccionada `border-info bg-surface-hover` / no
  seleccionada `border-border bg-surface`. (Se va `bg-surface-selected`.)
- **Panel del resultado** (el `<div>` de la derecha): `border-border bg-surface-header rounded-lg border p-5 shadow-md sm:p-8`.
- Monto grande: `mt-2 text-3xl font-extrabold tracking-heading whitespace-nowrap tabular-nums sm:text-5xl`.
- **Sueldo con separador de miles** (ver 5.1 para las funciones):
  - El estado `salaryText` guarda **solo dígitos** (arranca en `String(DEFAULT_SALARY)` = `'1200000'`).
  - `<input id="sueldo" type="text" inputMode="numeric" autoComplete="off" value={formatThousands(salaryText)}
    onChange={(e) => setSalaryText(digitsOnly(e.currentTarget.value))} …>` (sacar `min` y `step`).
  - `salary = sanitizeNonNegative(Number(salaryText), { integer: false })` sigue igual (si está vacío, `Number('')` = 0).
- No tocar `calculate`, `liveAmount`, `buildPrefillMessage` ni el CTA (salvo que ya hereda el estilo nuevo por `classes.ts`).

### 4.6 `Servicios.astro` (cambio 18)

En cada tarjeta, arriba del título: una fila `flex flex-wrap items-center gap-3` con el código (como hoy) y un chip
`border-border text-ink-muted rounded-field border px-2.5 py-0.5 text-xs font-semibold` con `s.audience`.

### 4.7 `Rubros.astro` (cambio 15)

Después de la grilla de 6 tarjetas:

```astro
<h3 class="mt-12 text-2xl font-extrabold sm:mt-16">{rubrosTambien.title}</h3>
<p class="text-ink-muted mt-3 max-w-2xl">{rubrosTambien.intro}</p>
<ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {rubrosTambien.items.map((r) => (
    <li class="border-border rounded-lg border p-5">
      <p class="font-semibold">{r.title}</p>
      <p class="text-ink-muted mt-2 text-sm">{r.text}</p>
    </li>
  ))}
</ul>
```

### 4.8 `Contacto.astro` (cambio 2)

- Sin `tone`. El `<Card>` del formulario pasa a `<Card panel>`.
- Botones: si hay WhatsApp, **primero** `<Button href={whatsapp} external cta="contacto-whatsapp">{contactoCopy.whatsappLabel}</Button>`
  y después los dos actuales. Si no hay WhatsApp, quedan los dos de hoy.
- Borrar el `<li>` con el link de texto "WhatsApp" de la lista (queda el botón). Email y ubicación quedan.

### 4.9 `layout/FloatingCTA.astro` (cambio 4)

Clases: `bg-cta text-on-cta hover:bg-cta-hover fixed right-4 bottom-4 z-40 flex flex-col rounded-full px-6 py-3 leading-tight font-bold shadow-lg transition-colors`.
La lógica (abre WhatsApp si hay número, si no `#contacto`) ya existe: no tocar.

### 4.10 `layout/Header.astro` y `layout/Footer.astro`

- Logo: `<LogoMark decorative />` / `<LogoMark />` ya toman el tamaño `md` (40 px). Nada más que hacer salvo verificar
  que el header (`h-15`) no se deforma.
- El botón "Contactar" ya hereda la píldora clara.

### 4.11 `Caso.astro` (desactivado, solo clases)

Badge: `bg-info-soft text-info inline-block rounded-full px-3 py-1 …` → `border-border text-info rounded-field inline-block border px-3 py-1 …`.

### 4.12 `pages/404.astro`

`tracking-tight` → `tracking-heading`.

**Verificación fase 4:** `npm run typecheck` pasa (la fase 5 agrega los campos de datos que usan Hero, Contacto,
Servicios y Rubros; si el typecheck falla solo por eso, hacé la fase 5 y volvé a correrlo).

---

## 5. Fase 5 — Lógica y contenido

### 5.1 `src/lib/format.ts` + `format.test.ts`

Agregar:

```ts
export function digitsOnly(text: string): string // saca todo lo que no sea 0-9
export function formatThousands(digits: string): string // '' si no hay dígitos; si no, formatInteger(Number(digits))
```

Tests nuevos en `format.test.ts`:
- `digitsOnly('1.200.000')` → `'1200000'`; `digitsOnly('$ 12a3')` → `'123'`; `digitsOnly('')` → `''`.
- `formatThousands('1200000')` → `'1.200.000'`; `formatThousands('0')` → `'0'`; `formatThousands('007')` → `'7'`;
  `formatThousands('')` → `''`; `formatThousands('999')` → `'999'`.

### 5.2 `src/data/types.ts`

- `Service`: agregar `audience: string;`.
- Nuevo: `export interface RubrosExtra { title: string; intro: string; items: readonly Rubro[]; }`.

### 5.3 Textos (copiar tal cual)

**`src/data/areas.ts`** (sigue en 8; más general, sin "fiado" ni "proveedores"):
```
'Control de mercadería', 'Precios y márgenes', 'Stock y pedidos', 'Cuentas corrientes',
'Cierre de caja', 'Presupuestos', 'Consultas por WhatsApp', 'Reportes'
```

**`src/data/hero.ts`**: agregar `whatsappLabel: 'Escribinos por WhatsApp'` (y al tipo).

**`src/data/contacto.ts`**: agregar `whatsappLabel: 'Escribinos por WhatsApp'` (y al tipo).

**`src/data/problema.ts`**:
- `body.text`: `'Precios calculados a mano, cuentas anotadas en un cuaderno, datos que se cargan dos veces. Ya usás planillas, algún sistema y WhatsApp, pero '` (highlight igual).
- `leaks` (5):
  1. `Mercadería sin controlar` — `Nadie compara lo que entra con lo que dice la boleta.`
  2. `Precios hechos a mano` — `Aumentos mal trasladados y ventas por debajo del costo sin darte cuenta.`
  3. `Cuentas corrientes sin control` — `Lo que te deben y lo que debés, anotado en cuadernos y planillas sueltas.`
  4. `Caja que no cierra` — `Faltantes o sobrantes que nadie sabe explicar.`
  5. `Horas en tareas repetidas` — `Cargar datos, armar presupuestos o responder la misma consulta. En un comercio, un estudio o un consultorio.`

**`src/data/servicios.ts`**:
- s/01 `audience: 'Para cualquier negocio'`.
- s/02 `audience: 'Para comercios'`; `includes[2]`: `'Cuenta corriente por cliente'`.
- s/03 `audience: 'Para cualquier negocio'`.

**`src/data/rubros.ts`** (un problema propio por rubro, sin repetir "boletas, fiado, proveedores"):
```
Almacenes y despensas — 'Costo real de cada compra y precios con margen parejo.'
Minimarkets y autoservicios — 'Caja rápida con lector de códigos y alertas de vencimiento.'
Kioscos — 'Precios al día después de cada aumento, sin hacer cuentas.'
Distribuidoras mayoristas — 'Pedidos que llegan por WhatsApp, cargados y en orden.'
Ferreterías y corralones — 'Presupuestos rápidos aunque tengas miles de artículos.'
Agroveterinarias y forrajerías — 'Vencimientos por lote y cuentas corrientes de cada cliente.'
```
Y export nuevo:
```ts
export const rubrosTambien: RubrosExtra = {
  title: 'Y también',
  intro: 'La automatización con IA sirve para cualquier negocio que repite tareas.',
  items: [
    { title: 'Estudios y profesionales', text: 'Documentos y datos que hoy se cargan a mano, ordenados solos.' },
    { title: 'Consultorios', text: 'Las consultas de siempre por WhatsApp, respondidas al momento.' },
    { title: 'Gastronomía', text: 'El costo de cada plato al día con cada compra.' },
    { title: 'Talleres y servicios técnicos', text: 'Presupuestos y trabajos pendientes sin papeles sueltos.' },
  ],
};
```

Después: `grep -rni "fiado" src` → no debe quedar ninguna aparición (salvo dentro de tests).

### 5.4 `src/data/content.test.ts`

- Importar `rubrosTambien` y sumarlo a `collectStrings([...])`.
- En "cantidades de ítems": `problema.leaks` → **5**; agregar `expect(rubrosTambien.items).toHaveLength(4)`;
  `expect(servicios.map((s) => s.audience)).toEqual(['Para cualquier negocio', 'Para comercios', 'Para cualquier negocio'])`.
- Test nuevo `'no dice "fiado": se habla de cuentas corrientes'`: `all.filter((s) => /fiado/i.test(s))` → `[]`.
- Test nuevo `'el sistema Integral se presenta para comercios'`: `servicios[1].title` contiene `Integral` y
  `servicios[1].audience === 'Para comercios'`.

### 5.5 `src/components/islands/CostCalculator.test.tsx`

- `'se puede vaciar el sueldo y tipear sin cero adelante'`: después de `clear`, `expect(salary).toHaveValue('')`
  (ya no es `number`, así que `toHaveValue(null)` falla: reemplazarlo); después de tipear `1500000`, el valor es
  **`'1.500.000'`**.
- Test nuevo `'el sueldo arranca con separador de miles'`: `screen.getByLabelText(calculadoraCopy.salaryLabel)` tiene
  valor `'1.200.000'`.
- Test nuevo `'el sueldo ignora letras'`: limpiar, tipear `12a3` → valor `'123'`.
- Correr los tests existentes de la calculadora: los valores de control (700 min, $ 378.875, etc.) tienen que seguir
  pasando sin tocarlos. Si alguno usaba `fireEvent.change(..., { target: { value: '0' } })` sigue funcionando.

**Verificación fase 5:** `npm test` pasa entero y `npm run typecheck` pasa.

---

## 6. Fase 6 — Tests sobre `dist/` (`tests/build/structure.test.ts`)

- Tests 16, 17 y 18: cambiar el archivo del logo a `/brand/factor-integral-horizontal-transparente.png`
  (`asset(...)` y `existsSync(path.join(DIST, 'brand/factor-integral-horizontal-transparente.png'))`). El 16 sigue
  buscando `header img[...]` (ya no es el único img del sitio: el hero tiene otro; `querySelector` del header alcanza).
- Tests nuevos (numerar 22 en adelante):
  - **22.** `el logo transparente tiene alfa`: con `sharp` (import dinámico o `import sharp from 'sharp'`), leer
    `path.join(DIST, 'brand/factor-integral-horizontal-transparente.png')` con `.raw().toBuffer({ resolveWithObject: true })`:
    `info.channels === 4` y `data[3] === 0`.
  - **23.** `el hero tiene el logo decorativo arriba del h1`: `#inicio img` existe, `alt === ''`.
  - **24.** `botones píldora claros`: `a[data-cta="hero-calculadora"]` tiene en `class` `rounded-full` y `bg-cta`;
    `a[data-cta="flotante"]` también.
  - **25.** `problema y calculadora dentro de paneles de 28 px`: `#problema .rounded-panel` y `#calculadora .rounded-panel`
    existen; `#formulario-contacto` está dentro de un `.rounded-panel` (`root.querySelector('.rounded-panel #formulario-contacto')`).
  - **26.** `5 pérdidas en "El problema"`: `#problema ul > li` tiene largo 5.
  - **27.** `franja "Y también"`: el texto de `#rubros` contiene `Y también` y hay 4 `li` en la última `ul` de `#rubros`.
  - **28.** `el sueldo muestra separador de miles`: `#sueldo` tiene `type="text"` y `value="1.200.000"` (la isla se
    pre-renderiza).
  - **29.** `no aparece "fiado"`: `/fiado/i.test(text)` es `false`.
  - **30.** `no se empaqueta IBM Plex`: `readdirSync(path.join(DIST, '_astro'))` no tiene archivos con `ibm-plex` en el nombre.
  - **31.** `secciones sin fondo alternado`: ningún `section` tiene `bg-surface-sunken` en `class`.
- Test 14 sigue igual (sin WhatsApp no hay links a `wa.me`).

**Verificación fase 6:** `npm run build && npm run test:build` pasa. Después probá también el build de GitHub Pages
(comando de 0.3) + `npm run test:build`.

---

## 7. Fase 7 — Prueba de WhatsApp (temporal, NO dejar cambios)

Para comprobar que los botones ocultos funcionan:
1. Cambiar temporalmente `whatsapp: null` por `whatsapp: '5493460000000'` en `src/config/site.ts`.
2. `npm run build` y verificar con `grep -o 'data-cta="[a-z-]*whatsapp[a-z-]*"' dist/index.html` que aparecen
   `hero-whatsapp` y `contacto-whatsapp`, y que esos `<a>` tienen `target="_blank"` y `rel="noopener noreferrer"`.
3. **Volver** `whatsapp` a `null` (`git diff src/config/site.ts` no debe mostrar ese cambio) y rebuildear.

---

## 8. Fase 8 — Documentación

### 8.1 `CLAUDE.md`

- Tabla Stack: fila **Fuente** → solo **Plus Jakarta Sans** (`@fontsource-variable/plus-jakarta-sans`), self-hosted.
  Fila **Diseño** → "Base: DS **Integral** tema Oscuro, con ajustes propios de la landing del reporte de diseño del
  30/10/2026 (botón claro píldora, paneles de 28 px, campos de 12 px, una sola fuente, 3 tonos de fondo)".
- Comandos: agregar `npm run logo   # regenera public/brand/factor-integral-horizontal-transparente.png`.
- Árbol de `public/brand/`: "logo horizontal PNG del DS (`-oscuro`, opaco, fuente) y su versión `-transparente`
  (la que se usa)".
- Convenciones:
  - Colores: agregar `bg-cta`/`text-on-cta` (botón principal). Fondos permitidos: `bg-bg` (base), `bg-surface`
    (tarjeta/panel), `bg-surface-header` (header, pie y panel del resultado), `bg-surface-hover` (hover/selección).
    Prohibidos en componentes: `surface-sunken`, `surface-selected`, `primary-soft`, `info-soft`, `bg-primary`.
  - Radios: `rounded-panel` (28) contenedores grandes · `rounded-lg` (16) tarjetas internas · `rounded-field` (12)
    campos y chips · `rounded-full` botones, avatar y nav del header.
  - `Card` tiene `panel` para contenedores grandes. `Section` ya no tiene `tone`; usa `py-section` (48–88 px).
  - Títulos: H1 `tracking-display` (-0.045em), H2 `tracking-heading` (-0.03em); `SectionHeading accent` pinta la
    línea 2 en `text-info` (solo el hero).
  - Botones de WhatsApp (hero y contacto) solo se renderizan si `SITE.whatsapp` tiene número.
- Sección Calculadora: "El campo de sueldo es `type=text` y muestra separador de miles (`formatThousands`)."
- Agregar una sección corta **Deploy**: "Producción en **Netlify** (build `npm run build`, publica `dist/`, Node desde
  `.nvmrc`, sin `BASE_PATH`). GitHub Pages (`.github/workflows/deploy.yml`, subruta `/Integral-landing-page`) queda
  como vista previa." Ajustar el comentario del comando de build de GitHub Pages para que diga que es la vista previa.
- Orden de la página: Hero centrado con logo; Rubros incluye la franja "Y también".

### 8.2 `README.md`

`grep -n "IBM\|Plex\|tone" README.md` y actualizar si menciona algo de lo cambiado.

---

## 9. Checklist final

1. `npm run verify` pasa entero (typecheck + test + build + test:build).
2. Build de GitHub Pages (comando de 0.3) + `npm run test:build` pasa.
3. `git status`: solo cambiaron archivos de este plan + `package.json`/`package-lock.json` + el PNG transparente
   nuevo + `scripts/logo-transparente.mjs`. `src/config/site.ts` sin cambios en `whatsapp`.
4. `grep -rn "rounded-xl\|rounded-2xl\|#[0-9a-fA-F]\{6\}" src/components` → nada nuevo.
5. Si tenés forma de ver la página (`npm run dev` + navegador), revisá a **375 px** y **1440 px**: que el monto de la
   calculadora no se desborde del panel oscuro, que el hero esté centrado, que el logo del header no se corte. Si no
   tenés navegador, decilo en el resumen.
6. Resumen final para el usuario: qué cambios del reporte quedaron hechos (por número), cuáles no y por qué
   (2 parcial: falta número; 7: falta backend; 8: no hay caso real; 20: no se muestran precios; Netlify: no es del repo),
   y cualquier desvío del plan.
