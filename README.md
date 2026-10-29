# Factor Integral — Landing page

Landing de una sola página (Astro + React + Tailwind) para Factor Integral, empresa de automatización con IA y
sistemas de gestión para comercios y pymes de Chabás y alrededores (sur de Santa Fe).
El objetivo: que el dueño de un comercio pida una visita.

## Requisitos

- Node **≥ 22.23.4** (ver `.nvmrc`, que fija 24).

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # genera dist/
npm run preview      # sirve dist/ localmente
npm test             # tests unitarios y de componentes
npm run test:build   # tests sobre dist/ (requiere build previo)
npm run typecheck    # astro check
npm run verify       # typecheck + test + build + test:build
npm run og           # regenera public/og-image.png
```

## Deploy

Se publica sola en cada push a `main` con GitHub Actions (`.github/workflows/deploy.yml`: verify, build y deploy).
Requisito único: *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

## Estructura

```
src/
  config/site.ts   datos globales (nombre, URL, email, WhatsApp, nav, CTAs)
  data/            todo el texto de la página, un archivo por sección
  lib/             funciones puras con sus tests
  styles/          Tailwind + tokens de diseño
  layouts/         BaseLayout
  components/      seo/, ui/, layout/, sections/, islands/ (React)
  pages/           index, 404, robots.txt
tests/             setup y tests sobre dist/
```

## Cómo editar textos

Todo el contenido está en `src/data/*` y `src/config/site.ts`. No hay textos hardcodeados en los componentes.
Colores solo mediante los tokens de `src/styles/global.css`.

## Cómo activar WhatsApp

Completar `SITE.whatsapp` en `src/config/site.ts` (formato internacional sin `+`, por ejemplo `549346XXXXXXX`) y
actualizar el test de contenido que hoy asume que es `null`. Los links a WhatsApp aparecen solos.

## Cómo activar el caso real

Poner `caso.enabled = true` en `src/data/caso.ts` cuando haya un caso real con permiso del cliente, y revisar
los tests de estructura (que hoy esperan que `#caso` no exista).

## Formulario de contacto

La variable `PUBLIC_CONTACT_ENDPOINT` define a dónde se envía el formulario. Si no está definida, se abre un
`mailto:`.

## Pendientes de contenido

- Número de WhatsApp
- Dominio definitivo
- Email confirmado
- Logo en SVG
- Imagen OG definitiva
- Backend del formulario
- Analytics (los CTA ya tienen `data-cta`)
