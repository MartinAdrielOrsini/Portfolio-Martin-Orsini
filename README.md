# Portfolio Web — Martin Orsini

Sitio estático. Se abre haciendo doble clic en `index.html`, sin instalar nada.

```
index.html            → estructura y contenido (14 secciones)
css/styles.css        → estilos (config de colores y tipografías al inicio)
javascript/main.js    → menú, scroll, animaciones, formulario, copiar email
assets/images/        → imágenes por proyecto (18,7 MB)
```

## Estructura — 14 secciones

| # | Sección | id | Imágenes |
|---:|---|---|---:|
| 1 | Hero | `#hero` | — |
| 2 | Presentación personal | `#about` | 1 |
| 3 | Índice de proyectos | `#projects` | (usa las cards) |
| 4 | Rediseño de SUMA | `#p-suma` | 9 |
| 5 | Redes Centenera FC | `#p-centenera` | 8 |
| 6 | App Green Eat | `#p-green-eat` | 8 |
| 7 | Cerveceros del Sur ★ | `#p-cerveceros` | 14 |
| 8 | Dosel | `#p-dosel` | 9 |
| 9 | Fascículos editorial | `#p-fasciculos` | 9 |
| 10 | Web Almacenit | `#p-almacenit` | 3 |
| 11 | Estrella de Maldonado ★ | `#p-estrella` | 12 |
| 12 | Remeras custom | `#p-remeras` | 5 |
| 13 | Mush Type | `#p-mush` | 9 |
| 14 | Footer / contacto | `#contact` | — |

★ = proyecto destacado (sección oscura, más largo y con bloque de texto
en dos columnas).

Cada proyecto tiene la misma columna vertebral —cabecera con eyebrow,
título, ficha, imagen de apertura, bajada y galería— pero varía la
retícula: `stack`, `grid-2`, `grid-3`, `grid-4` o `grid-asym` según las
proporciones del material.

## Qué falta

**Las 88 imágenes cargan.** Queda pendiente:

1. **Email** — buscá `hola@tudominio.com` en `index.html`.
2. **Redes** — los `href="#"` de la sección de contacto.
3. **Green Eat** — en `tp3 disenio ux ui / UI` no hay capturas de las
   pantallas de la app, sólo el sistema de ilustración, los tres boards
   de onboarding y los recortes de producto. Armé la sección con eso. Si
   tenés las pantallas exportadas, entran en `assets/images/green-eat/`.
4. **Fascículos editorial** — las imágenes que puse son del libro
   fotográfico de `Editorial / tp3`, el único editorial con JPG finales.
   Si "Fascículos" es otro TP, sus entregas están sólo en PDF y hacen
   falta exportaciones en imagen.
5. **Los textos** — están redactados mirando las piezas, no los briefs.
   Revisá cliente, año y rol de cada caso.

## Sistema visual — pizarrón

La web es un pizarrón de aula. Todo el lenguaje gráfico sale de ahí.

**Paleta** (en `:root` de `css/styles.css`):

| Rol | Token | Hex |
|---|---|---|
| Pizarrón verde (base) | `--bg` | `#4F5321` OLIVE |
| Pizarrón negro (destacados) | `--dark-bg` | `#191B10` |
| Tiza (texto) | `--ink` | `#DEDBD2` STONE |
| Acento, rellenos | `--accent` | `#C87330` RUST |
| Acento, texto | `--accent-ink` | `#EFB985` |
| Reserva | `--sage` | `#9CA35A` SAGE |

> El rust puro sobre el verde da 2,3:1 de contraste y no se lee. Por eso
> como **texto** se usa `--accent-ink`, un rust aclarado que da 4,6:1 y
> que además es exactamente el aspecto de una tiza naranja. El rust puro
> queda para rellenos (fondo de botón, barra del hero).

**Textura**, toda en CSS, sin imágenes:
- `--grano` — ruido `feTurbulence` en un SVG embebido, fijo sobre toda
  la página con `mix-blend-mode: overlay`. Es el poro de la pizarra.
- `--manchones` — gradientes radiales muy tenues: tiza mal borrada.
- Viñeta en `body::after`: los bordes de un pizarrón nunca están tan
  limpios como el centro.

Las superficies que pintan su propio fondo (header, menú mobile,
secciones negras, navegación entre proyectos) reaplican el grano como
capa de `background` con `background-blend-mode`, porque tapan la capa
fija.

## Tipografía

- **Títulos:** Archivo (variable), eje de ancho `wdth 125` —24% más
  expandida que la normal—, peso 800, en caja alta, con un halo de tiza
  hecho con dos `text-shadow` muy abiertos.
- **Texto e interfaz:** Space Grotesk.
- **Anotaciones a mano:** Caveat, en epígrafes, el aviso de scroll, el
  "Ver caso" y la navegación entre proyectos. Es lo que en un pizarrón
  se escribiría al margen.
- Sin serif en ninguna parte.

Para cambiar el grado de expansión, tocá `--wdth-expanded` en el bloque
`:root` (rango válido: 62 a 125).

## Contraste

Verificado recorriendo el DOM: **cero textos por debajo de AA**. Si
tocás la paleta, revisá que la tiza translúcida (`--ink-soft`,
`--ink-faint`) no baje de 0.84 de alfa: sobre el verde pierde contraste
mucho más rápido que sobre el negro.

## Cómo cambiar o agregar imágenes

Cada hueco tiene una ruta fija y un marco con `aspect-ratio`. Copiás tu
archivo con ese nombre exacto y aparece solo, sin tocar código y sin que
el layout se mueva. Si no existe, se ve un placeholder con la etiqueta de
qué va ahí. Al cambiar una imagen, actualizá también su `alt`.

**Proporciones disponibles:** `ar-1x1` · `ar-4x3` · `ar-3x2` · `ar-7x5` ·
`ar-16x10` · `ar-2x1` · `ar-16x9` · `ar-21x9` · `ar-strip` (13:2) ·
`ar-3x4` · `ar-4x5` · `ar-5x7` · `ar-2x3` · `ar-9x16`

**Casos especiales:**
- `fig__frame--scroll` — capturas de sitio completas (Almacenit): la
  imagen se recorre dentro del marco.
- `fig__frame--contain` — recortes con transparencia (iconos, productos
  de Green Eat): entran completos y con aire, sin recorte.
- `ar-strip` — tiras muy apaisadas; en mobile se arrastran en horizontal.

## El formulario de contacto

Valida en el navegador pero **no envía nada**: no hay servidor detrás.
Para recibir los mensajes:

1. Creá un formulario en [Formspree](https://formspree.io) o similar.
2. Agregá al `<form id="contactForm">`:
   `action="https://formspree.io/f/TU-ID" method="POST"`.
3. En `javascript/main.js`, quitá el `e.preventDefault()` del final del
   `submit` (el que corre cuando la validación pasó).

## Detalles técnicos

- Mobile-first, verificado sin scroll horizontal de 320 px a 2560 px.
- Menú hamburguesa en mobile, navegación horizontal desde 1024 px.
- Índice: carrusel con swipe en mobile, 2 columnas desde 1024 px y 3
  desde 1440 px. Los puntos del carrusel se generan solos, uno por card.
- Respeta `prefers-reduced-motion`.
- `loading="lazy"` y `alt` en las 88 imágenes.
- Sin frameworks ni dependencias.

## Publicar en GitHub Pages

Settings → Pages → Source: `Deploy from a branch`, rama `main`, carpeta
`/ (root)`.
