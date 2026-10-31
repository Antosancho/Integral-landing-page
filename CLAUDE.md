# Factor Integral — Landing page

Landing de una sola página para **Factor Integral**. Objetivo único: que el visitante (dueño de un comercio o pyme
de la zona) pida una visita. Plan de implementación detallado en `plan.md`.

## La empresa

- **Qué es:** empresa de la zona de **Chabás (sur de Santa Fe, Argentina)** que integra IA en los procesos de trabajo
  de comercios y empresas, y desarrolla su propio sistema de gestión, **Integral**.
- **Líneas de negocio:**
  1. **Servicio de automatización con IA** (el core): relevar los procesos de una empresa, estimar cuánto puede
     ahorrar e implementar soluciones a medida, **en persona**.
  2. **Sistema de gestión Integral** (producto propio): stock, ventas y caja para comercios, modular y adaptable por rubro.
- **Equipo:** Felipe Sancho (dirección y clientes: visitas comerciales, prioridades, precios) y Antonio Sancho
  (desarrollo). Son hermanos. Todavía **no hay clientes pagos ni casos de éxito**.
- **Mercado:** Chabás y alrededores, venta presencial. Cliente inicial: almacenes, minimarkets, kioscos, despensas;
  además pymes de la zona (ej. distribuidoras mayoristas). Foco actual: la ineficiencia administrativa.
- **Argumento central:** **"Perdés plata y no la ves."** El foco es la plata que se pierde y se recupera, más que el
  tiempo ahorrado.
- **Diferencial:** la **presencia**: relevar, instalar, capacitar y dar soporte en el local. La competencia es de
  Buenos Aires o remota.
- **Los 7 problemas típicos de un almacén:** mercadería sin controlar contra la boleta, precios calculados a mano,
  stock "a ojo", fiado sin control, cierre de caja con diferencias, papeles sueltos, deuda con proveedores poco clara.

### Sistema Integral (estado real, no exagerar)
- App de **escritorio** (Electron + React + TS), **solo Windows**, datos locales. No es web ni nube ni app móvil.
- Disponible: productos con código de barras, stock y mermas, alertas de vencimiento por lote, caja rápida con
  scanner y teclado, cobro con medios combinados, descuentos/recargos. **Fiado / cuenta corriente: se presenta como incluido.**
- **No tiene IA todavía** (en proceso). **No factura electrónicamente** ni se integra con ARCA/AFIP. Vende solo por unidad.
- Historial, estadísticas, roles, tickets, Excel, backup: **próximo / más adelante** → no prometer.
- *Factura a Costo* (lee boletas por foto con IA) es un prototipo aparte de relevancia baja; se va a integrar a Integral.

## Reglas de contenido (obligatorias para todo texto visible)

- Español rioplatense con **voseo**, frases cortas, sin jerga técnica.
- **No inventar** clientes, testimonios, cifras de ahorro, cantidad de usuarios, precios ni planes.
- **No** decir "remoto" ni "todo el país": el diferencial es ir al local.
- **No** presentar nada como gratis ("gratis", "gratuito", "sin cargo" prohibidos). **No** mostrar precios.
- **No** afirmar factura electrónica, ARCA/AFIP, IA dentro de Integral, app móvil, versión web ni plazos.
- Precio: "se cotiza según cada comercio". Nunca pedir la clave fiscal.
- Datos faltantes → `null` en la config y la UI oculta el elemento. Nunca debe verse `[A CONFIRMAR]`, `TODO` ni "lorem".
- La sección "Caso real" existe pero está **desactivada** (`caso.enabled = false`) hasta tener un caso real con permiso.
- La metodología interna y el modelo de cobro de la empresa son **confidenciales**: no van en la web ni en este repo.

## Stack

| Pieza | Elección |
|---|---|
| Framework | **Astro 7.4**, salida estática (HTML pre-renderizado por SEO) |
| Interactividad | Islas **React 19** solo en la calculadora (`client:visible`) y el formulario (`client:idle`) |
| Estilos | **Tailwind CSS 4** (`@tailwindcss/vite`), tokens en `@theme` de `src/styles/global.css` |
| Diseño | Base: DS **Integral** tema Oscuro (`https://claude.ai/artifact/GqLNZDeRjXRUZJSQEiJbhz`), con ajustes propios de la landing del reporte de diseño del 30/10/2026 (botón claro píldora, paneles de 28 px, campos de 12 px, una sola fuente, 3 tonos de fondo); los tokens están en `@theme` de `global.css` |
| Fuente | **Plus Jakarta Sans** (`@fontsource-variable/plus-jakarta-sans`), self-hosted |
| Tests | Vitest 5 + Testing Library + jsdom; tests sobre `dist/` con `node-html-parser` |
| Node | **≥ 22.23.4** (Astro 7.4 lo exige). `.nvmrc` = 24 |

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # genera dist/
npm run typecheck    # astro check
npm test             # tests unitarios y de componentes (src/**/*.test.{ts,tsx})
npm run test:build   # tests sobre dist/ (SEO y estructura) — requiere build previo
npm run verify       # typecheck + test + build + test:build (correr antes de dar algo por terminado)
npm run og           # regenera public/og-image.png
npm run logo         # regenera public/brand/factor-integral-horizontal-transparente.png
# build como GitHub Pages (vista previa; producción es Netlify) (Git Bash; en Windows anteponer MSYS_NO_PATHCONV=1 para que no mangle BASE_PATH):
SITE_URL=https://antosancho.github.io BASE_PATH=/Integral-landing-page npm run build
```

## Organización del código

```
src/
  config/site.ts        datos globales: nombre, URL, title/description SEO, email, whatsapp (null), ubicación, nav, CTAs
  data/                 TODO el texto de la página, tipado (types.ts) — un archivo por sección
    content.test.ts     reglas de contenido: palabras prohibidas, cantidades, ids de nav
  lib/                  funciones puras con tests al lado
    format.ts           pesos y horas en es-AR ("$ 378.875", "50,5"); campo con separador de miles (`formatThousands`, `editDigits`, `caretAfterDigits`)
    contact.ts          links wa.me y mailto
    seo.ts              JSON-LD (ProfessionalService + WebSite + FAQPage)
    paths.ts            withBase: prefija rutas de public/ con el base de Astro
    prefill.ts          store en globalThis: la calculadora precarga el mensaje del formulario
    calculator.ts       fórmulas de la calculadora
    validation.ts       validación del formulario
    contact-submit.ts   envío: endpoint (PUBLIC_CONTACT_ENDPOINT) → si no hay, mailto
    textarea.ts         alto del textarea que crece (144–320px; arriba, scroll con `scrollbar-ds`)
  styles/global.css     Tailwind + tokens del DS (tema Oscuro), utilidad scrollbar-ds
    design-system.test.ts   valores de tokens y contraste WCAG
  layouts/BaseLayout.astro   <html lang="es-AR">, SEO, skip link
  components/
    seo/SEO.astro       meta, canonical, Open Graph, Twitter, JSON-LD
    design-system-usage.test.ts   prohíbe tokens viejos, hex, gradientes y radios fuera del DS en componentes
    ui/                 Container, Section, SectionLabel, SectionHeading, Button, Card, Avatar, LogoMark
      classes.ts        clases de botones/campos compartidas entre Astro y las islas React
    layout/             Header (menú móvil con <script>), Footer, FloatingCTA
    sections/           una por bloque de la página (Hero … Contacto)
    islands/            CostCalculator.tsx y ContactForm.tsx (React)
  pages/                index.astro, 404.astro, robots.txt.ts
tests/
  setup.ts              jest-dom, mocks de matchMedia y scrollIntoView
  build/                seo.test.ts y structure.test.ts sobre dist/
.github/workflows/deploy.yml   build + verify + deploy a Pages
public/
  brand/                logo horizontal PNG del DS (`-oscuro`, opaco, fuente) y su versión `-transparente` (la que se usa); favicon.png = ícono del DS
```

### Orden de la página e ids de ancla
Header → Hero `#inicio` (único H1, centrado con logo) → marquesina de áreas → Problema `#problema` → Calculadora `#calculadora` →
Servicios `#servicios` → Para quién `#rubros` (incluye la franja "Y también") → Cómo trabajamos `#metodo` → (Caso `#caso`, desactivado) →
Quiénes somos `#equipo` → Preguntas `#preguntas` → Contacto `#contacto` (formulario `#formulario-contacto`) →
Footer → botón flotante. Cada sección: `<section id aria-labelledby="<id>-titulo">`.

## Convenciones

- Links a archivos de `public/` siempre con `withBase(ruta, import.meta.env.BASE_URL)`; nunca `src="/..."` a mano
  (la página vive en una subruta en GitHub Pages).
- **Textos solo en `src/data/` o `src/config/site.ts`**, nunca hardcodeados en componentes.
- **Colores solo por tokens del DS** (`bg-bg`, `bg-surface`, `bg-surface-header`, `text-ink`,
  `text-ink-muted`, `text-link`, `text-info`, `text-success`, `bg-cta`/`text-on-cta` (botón principal), `border-border`, `border-border-control`, …).
  Nada de hex ni paleta por defecto de Tailwind (desactivada con `--color-*: initial`). Links → `text-link`; acentos
  decorativos → `text-info`; plata a favor → `text-success`. Nada de gradientes. Nunca redibujar la "∫" del logo.
  Fondos permitidos: `bg-bg` (base), `bg-surface` (tarjeta/panel), `bg-surface-header` (header, pie y panel del
  resultado), `bg-surface-hover` (hover/selección). Prohibidos en componentes: `surface-sunken`, `surface-selected`,
  `primary-soft`, `info-soft`, `bg-primary`.
- Campos de formulario con `inputClass` / `textareaClass` / `labelClass` de `ui/classes.ts` (borde `border-control`,
  error en `danger`); botones de las islas con `buttonBase` + `buttonSize` + `buttonVariant` (+ `buttonDisabled`).
- `Card` maneja su padding con la prop `padding` (`md`/`sm`); no pasarle clases `p-*`. `Card panel` es el contenedor grande. `Section` ya no tiene `tone`; usa `py-section` (48–88 px).
- El menú de escritorio aparece desde `lg:`; debajo se usa el menú móvil.
- Patrón de sección: etiqueta corta en mayúsculas con punto (`SectionLabel`) + título en dos líneas
  (`SectionHeading`, línea 2 en `text-ink-muted`) + contenido en tarjetas (`Card`). Radios: `rounded-panel` (28) contenedores grandes · `rounded-lg` (16) tarjetas internas · `rounded-field` (12) campos y chips · `rounded-full` botones, avatar y nav del header. Títulos en Plus Jakarta (`font-display`, regla base en h1–h3); números con `tabular-nums`. Títulos: H1 `tracking-display` (-0.045em), H2 `tracking-heading` (-0.03em); `SectionHeading accent` pinta la línea 2 en `text-info` (solo el hero).
- Botones de WhatsApp (hero y contacto) solo se renderizan si `SITE.whatsapp` tiene número.
- HTML semántico y accesible: un solo H1, jerarquía H2/H3, FAQ con `<details>`, foco visible, labels en todos los
  campos, `prefers-reduced-motion` respetado (marquesina y contador).
- Los CTA llevan `data-cta="<nombre>"` para medir con analytics más adelante.
- Lógica en funciones puras de `src/lib/` con su `.test.ts` al lado; los componentes solo arman UI.
- TypeScript estricto, sin `any`, imports relativos.

## Calculadora (no cambiar sin actualizar tests)

- 7 tareas con minutos fijos (5, 8, 3, 6, 20, 30, 20); 3 marcadas al inicio (40, 40, 60 veces/semana); sueldo inicial $ 1.200.000.
- `horas/mes = min/semana ÷ 60 × 4,33` · `valor hora = sueldo ÷ 160` · `costo/mes = horas × valor hora` ·
  `año = ×12` · `ahorro = ÷2` · contador en vivo: `+ costo/mes ÷ (160 × 3600)` por segundo.
- Valores de control: 700 min/semana → 50,5 h → $ 378.875/mes → $ 4.546.500/año → $ 189.438 de ahorro.
- El campo de sueldo es `type=text` y muestra separador de miles (`formatThousands`); al editar en el medio el cursor no salta al final y borrar un punto borra el dígito de al lado (`editDigits` + `caretAfterDigits`). El monto grande puede partirse en dos líneas (`wrap-anywhere`) antes que salirse del panel.
- "Quiero recuperarlo" precarga el formulario con un resumen del cálculo (vía `src/lib/prefill.ts`).

## Deploy

Producción en **Netlify** (build `npm run build`, publica `dist/`, Node desde `.nvmrc`, sin `BASE_PATH`). GitHub Pages
(`.github/workflows/deploy.yml`, subruta `/Integral-landing-page`) queda como vista previa.

## Pendientes de contenido

Número de WhatsApp (`SITE.whatsapp`, hoy `null`), dominio definitivo (`factorintegral.ar` a confirmar), email
confirmado, logo en SVG (hoy PNG del DS en `public/brand/` y `public/favicon.png`), imagen OG definitiva, backend del formulario (`PUBLIC_CONTACT_ENDPOINT`), analytics, y
un caso real con permiso para activar la sección "Caso real".

## Git

No commitear ni pushear sin que el usuario lo pida.
