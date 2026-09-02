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
| 12 | Remeras Delira | `#p-remeras` | 5 |
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

## Sistema visual — escuela suiza

Función por sobre forma. Blanco, negro y un solo acento; una sola familia
tipográfica; retícula y aire. Nada decorativo.

**Paleta** (en `:root` de `css/styles.css`):

| Rol | Token | Hex |
|---|---|---|
| Fondo | `--bg` | `#FFFFFF` |
| Texto | `--ink` | `#111111` |
| Texto secundario | `--ink-soft` | `#565656` |
| Metadatos | `--ink-faint` | `#6E6E6E` |
| Acento | `--accent` | `#DD6B0E` |
| Acento como texto | `--accent-ink` | `#B0550B` |
| Bloque invertido | `--dark-bg` | `#111111` |
| Sección 2 | `.section--accent` | fondo `#DD6B0E`, texto negro |

> El acento tal cual sobre blanco da 3,4:1 y no se lee como texto, así que
> para texto se usa una versión más quemada (5,06:1). Sobre los bloques
> negros el acento puro rinde 5,56:1 y va directo — por eso
> `.section--dark` redefine `--accent-ink` a `var(--accent)`.

Los dos proyectos destacados (Cerveceros del Sur y Estrella de Maldonado)
son bloques invertidos: negro pleno. Es el único recurso de énfasis.

Todas las esquinas son rectas: `border-radius: 0` en botones, marcos y
etiquetas. La única excepción es el carrusel de pantallas de Green Eat:
son capturas de teléfono full-bleed, sin marco alrededor, y el redondeo
es lo que las hace leer como pantallas y no como recortes.

## Tipografía

Una sola familia. **Inter** es lo más cercano a Helvetica que hay en
Google Fonts; el stack busca la Helvetica real antes de rendirse a Arial:

```
'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif
```

- **Titulares:** peso 700, tracking cerrado (`-0.032em`). El peso hace el
  trabajo que antes hacía el ancho expandido.
- **Texto:** peso 400.
- **Rótulos:** 11 px, caja alta, tracking `0.16em`.
- La jerarquía viene del tamaño y del aire, nunca de cambiar de familia.

### El hero

Es la portada, así que tiene reglas propias:


EstÃ¡ calcado de un mockup del autor (1920x1080). Los valores clave
salieron de medir esa imagen, no de estimarlos:

- **Tracking `-0.053em`.** "Portfolio" en Inter 700 mide 4,1582 em sin
  tracking; en la referencia mide 3,683 em. La diferencia repartida entre
  los nueve caracteres da âˆ’0,0528 em. El render da 3,681.
- **Cuerpo:** `min(26.5cqw, 34svh, 420px)`. La primera acota por ancho de
  contenedor, la segunda por alto de viewport. Sin el tope en `svh`, en un
  portÃ¡til bajo la palabra empujaba el call to action fuera de pantalla.
  Se mide contra el **contenedor** y no contra el viewport porque el `vw`
  incluye la barra de scroll, y eso alcanzaba para cortarla. Por debajo de
  700 px de contenedor baja a `23cqw`: el asterisco sobresale 0,255 em por
  la derecha y en mobile no hay margen fuera del contenedor donde apoyarlo.
- **El asterisco** es el glifo del tipo, no un dibujo. En Inter 700 su
  mancha ocupa 0,3975 de su em y el centro cae 0,5238 em sobre la lÃ­nea de
  base; en la referencia mide 0,516 em del titular, con el centro en el
  borde derecho de la palabra y 0,779 em sobre la base. De ahÃ­ salen
  `font-size: 1.297em`, `top: -0.328em` y `translateX(-0.281em)`.
  Verificado midiendo la tinta sobre un canvas: coincide con la referencia
  dentro de 0,0004 em.
- **CorrecciÃ³n de par en la erre.** Con ese tracking su brazo se monta
  sobre la te: escaneando la tinta del render, las cuatro letras del
  centro salÃ­an como una sola mancha. Va envuelta en un span con
  `margin-left: -0.036em` y `margin-right: 0.036em`, asÃ­ se corre a la
  izquierda sin mover el resto de la palabra ni cambiar el ancho total.
  Huecos medidos despuÃ©s de la correcciÃ³n: 0,015 Â· 0,0125 Â· 0,010 em.- **"Martin Orsini"** comparte peso (700) y color con el titular; sÃ³lo
  cambia el cuerpo.
- El hero descuenta `clamp(44px, 6.5svh, 74px)` de su alto para que asome
  la franja naranja de la secciÃ³n 2.
### El parallax de entrada

El hero es `position: sticky` con `z-index: 0` y alto fijo de una
pantalla. Todas las demás secciones son opacas y van en `z-index: 1`, así
que al scrollear **suben y lo tapan**. La sección 2 (naranja) es la que
ejecuta el corte; su contenido entra con un recorrido más largo y
escalonado (`transition-delay` por bloque) para que se lea como que la
pieza naranja lo trae con ella.

No hace falta JavaScript: es sólo `sticky` + orden de apilado.

## Contraste

Verificado recorriendo el DOM con composición de alfa: **cero textos por
debajo de AA**, en las secciones blancas, en los bloques negros y en la
sección naranja.

## Cómo cambiar o agregar imágenes

Cada hueco tiene una ruta fija y un marco con `aspect-ratio`. Copiás tu
archivo con ese nombre exacto y aparece solo, sin tocar código y sin que
el layout se mueva. Si no existe, se ve un placeholder con la etiqueta de
qué va ahí. Al cambiar una imagen, actualizá también su `alt`.

**Proporciones disponibles:** `ar-1x1` · `ar-4x3` · `ar-3x2` · `ar-7x5` ·
`ar-16x10` · `ar-2x1` · `ar-16x9` · `ar-21x9` · `ar-strip` (13:2) ·
`ar-3x4` · `ar-4x5` · `ar-5x7` · `ar-2x3` · `ar-9x16`

**El carrusel de Green Eat** no entra en este esquema: sus imágenes van
en `assets/images/green-eat/carrusel/`, numeradas `pantalla-01.jpg` a
`pantalla-21.jpg`. Para agregar o sacar una, se toca la lista del HTML y
listo — el ancho de la vuelta lo mide el JavaScript solo, así que no hay
ningún número que actualizar a mano.

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
- Índice: lista simple en mobile; desde 1024 px, lista a la izquierda y
  vista previa del proyecto seleccionado a la derecha.
- Respeta `prefers-reduced-motion`.
- `loading="lazy"` y `alt` en las 88 imágenes.
- Sin frameworks ni dependencias.

## Publicar en GitHub Pages

Settings → Pages → Source: `Deploy from a branch`, rama `main`, carpeta
`/ (root)`.
