# BNO Agro — Landing Page

Landing page premium para **BNO Agro**, servicios agrícolas aéreos con drones
en Río Cuarto, Córdoba, Argentina (pulverización, siembra, fertilización aérea
y agricultura de precisión).

Construida 100% con **HTML5, CSS3 y JavaScript vanilla (ES2025)**, sin
frameworks ni librerías externas.

## Estructura del proyecto

```
/
├── index.html              → Documento principal (todas las secciones)
├── style.css                → Sistema de diseño completo + estilos
├── app.js                   → Interacciones, animaciones y lógica
├── README.md                 → Este archivo
└── assets/
    ├── img/                  → Imágenes / capturas reales del servicio (a reemplazar)
    ├── icons/                → favicon.svg, site.webmanifest
    ├── videos/                → Video de drone para el hero (a reemplazar)
    └── fonts/                 → (opcional, si se auto-hostean las tipografías)
```

## Cómo usarlo

1. Abrí `index.html` en cualquier navegador moderno — no requiere build ni
   servidor (aunque se recomienda servirlo con un servidor local para
   `fetch`/rutas relativas correctas, por ejemplo `npx serve` o la extensión
   Live Server de VS Code).
2. Reemplazá los assets de ejemplo:
   - `assets/videos/hero.mp4` — video real de drone sobrevolando cultivo
     (si se agrega, reemplazar el `<canvas id="fieldCanvas">` del hero por
     un `<video>` con ese archivo, o superponerlo).
   - Fotos reales en `assets/img/` para reemplazar los paneles procedurales
     (`[data-visual]`) de las tarjetas de servicios y la galería.
   - `assets/img/og-cover.jpg` para las meta tags Open Graph / Twitter Card.
   - `assets/icons/apple-touch-icon.png` (180×180).
3. Actualizá el dominio real en las etiquetas `canonical`, `og:url`,
   `og:image` y en el JSON-LD (`schema.org`) de `index.html`.

## Diseño

- **Paleta:** negro profundo (`#07090A`), blanco cálido (`#F6F7F3`), verde de
  precisión (`#38E07A`) y grises neutros — alto contraste, sin ruido visual.
- **Tipografías:** Instrument Sans (display / titulares), Inter (texto de
  cuerpo), Geist Mono (datos, coordenadas, eyebrows y etiquetas técnicas) —
  cargadas vía Google Fonts.
- **Elemento de firma:** el fondo del hero es una animación procedural en
  `<canvas>` que simula surcos de cultivo y una línea de escaneo tipo
  telemetría de drone (no depende de video externo). El mismo lenguaje visual
  — grillas, líneas de vuelo, datos monoespaciados — se repite en las
  secciones de servicios, comparativa y CTA final para narrar la marca de
  punta a punta.
- **Motion:** reveals con `IntersectionObserver`, contadores animados en
  estadísticas, línea de progreso en el timeline de "Cómo trabajamos", tilt
  y magnetismo en botones/cards (desactivado automáticamente si el usuario
  tiene `prefers-reduced-motion` activado).

## Rendimiento y SEO

- Sin dependencias de terceros (excepto Google Fonts, con `preconnect`).
- `defer` en el script principal, animaciones basadas en `transform`/`opacity`
  y `requestAnimationFrame`, `IntersectionObserver` para lazy-reveal.
- Meta tags completas: Open Graph, Twitter Cards, `canonical`, `robots`,
  `theme-color`, manifest y JSON-LD `LocalBusiness` con los datos de contacto
  de BNO Agro.
- Sitemap: al tratarse de una landing de una sola página, no requiere
  `sitemap.xml` adicional; si se agregan más páginas, generarlo y
  referenciarlo desde `robots.txt`.

## Accesibilidad

- Skip link al contenido principal.
- Foco visible (`:focus-visible`) en todos los elementos interactivos.
- Roles/atributos ARIA en navbar móvil, acordeón FAQ y lightbox.
- Contraste alto en textos sobre fondo oscuro y claro.
- Respeta `prefers-reduced-motion` desactivando animaciones no esenciales.

## Contacto de la empresa

- **WhatsApp:** +54 9 3584 24-7501
- **Email:** bnoagro1@gmail.com
- **Instagram:** [@bno.agro](https://instagram.com/bno.agro)
- **Ubicación:** Río Cuarto, Córdoba, Argentina
