# Estado del proyecto — traspaso

Documento para retomar el trabajo en una conversación nueva.
Última actualización: 24 de agosto de 2026.

El README.md documenta **cómo funciona** el sitio. Este archivo cuenta
**dónde estamos, qué se decidió y por qué, y qué falta**.

---

## 1. Qué es

Portfolio web de **Martin Orsini**, diseñador gráfico y ayudante de
cátedra en Diseño Gráfico 3 (cátedra Belluccia, UBA / FADU).

- Sitio estático: HTML + CSS + JS vanilla. **Sin frameworks, sin build,
  sin dependencias.**
- Repo local: Documents/GitHub/Portfolio-Martin-Orsini
- Publicado en martinadrielorsini.github.io/Portfolio-Martin-Orsini/
- Rama main, sincronizada con origin.

```
index.html          1383 líneas — estructura y contenido (14 secciones)
css/styles.css      1769 líneas — todo el estilo; config en :root
javascript/main.js   826 líneas — 14 módulos
assets/             102 MB (!) — ver "Problemas conocidos"
```

**Cache-busting manual:** el link del CSS y el script llevan `?v=N`.
**Hay que subir ese número cada vez que se toca CSS o JS.** Va en **v=54**.

---

## 2. Cómo se trabaja acá

- **Servidor de pruebas:** no hay uno en el repo. Se levanta un
  HttpListener de PowerShell. El script que funciona está en el
  scratchpad como serve2.ps1, en el **puerto 8100**, y soporta
  *range requests* (imprescindible para servir video) y tolera que el
  navegador aborte descargas. Sin eso, se cae al servir el mp4 grande.
- **El autor revisa en un portátil de 1366x768** → unos **630 px
  útiles**. Verificar siempre ahí, además de 375 y 1920.
- **El panel del navegador no saca capturas** ("not compositing frames").
  Se verifica **midiendo el DOM por JavaScript**. Además congela
  requestAnimationFrame y los IntersectionObserver, así que el scroll
  suave y las animaciones parecen rotos cuando no lo están: para probar
  anclas, desactivar scroll-behavior y usar saltos instantáneos.
- **Leer PDFs:** no hay poppler ni ImageMagick ni Python real. Se
  rasterizan con la **API nativa de Windows** (Windows.Data.Pdf) desde
  PowerShell. Hay un script hecho en el scratchpad (pdf2png.ps1).
- **PowerShell 5.1 lee los .ps1 como ANSI:** una ruta con eñe rompe el
  script. Resolver con comodín, por ejemplo 1REDISE*O DE SUMA.
- **Las variables de PowerShell no distinguen mayúsculas**: $h pisa a $H.
  Ya causó un bug real.
- **El guardián del sandbox bloquea los asteriscos sueltos** en comandos
  de PowerShell (los lee como rutas). Para escribir CSS con comentarios,
  usar Bash con heredoc.
- **Bash a veces arranca sin PATH.** Se arregla exportando
  /usr/bin y /bin al principio.
- **Procesamiento de imágenes:** System.Drawing desde PowerShell,
  calidad 82. **No hay ffmpeg**, así que el video no se puede comprimir.

---

## 3. Sistema visual

**Escuela suiza.** Blanco, negro y un solo acento naranja. Una sola
familia (Inter). Todo con esquinas rectas. Es la tercera dirección que se
probó: antes hubo una editorial con serif y una de "pizarrón", las dos
descartadas. No reproponerlas.

| Rol | Token | Valor |
|---|---|---|
| Fondo | --bg | #FFFFFF |
| Texto | --ink | #111111 |
| Acento | --accent | #DD6B0E |
| Acento como texto | --accent-ink | #B0550B |
| Bloque invertido | --dark-bg | #111111 |

Dos decisiones de contraste que **no conviene revertir sin medir**: el
acento puro sobre blanco da 3,4:1 y no sirve como texto (de ahí
--accent-ink); y sobre el naranja el texto va en **negro** (5,56:1), no
en blanco (3,4:1).

---

## 4. Estructura — 14 secciones

| # | Sección | id | Estado |
|---:|---|---|---|
| 1 | Hero | #hero | terminada |
| 2 | Sobre mí (naranja) | #about | terminada |
| 3 | Índice de proyectos | #projects | terminada |
| 4 | Suma | #p-suma | **contenido real del autor** |
| 5 | Centenera FC | #p-centenera | **contenido real del autor** |
| 6 | Green Eat | #p-green-eat | **apertura con contenido real** |
| 7 | Cerveceros del Sur (destacado) | #p-cerveceros | maqueta de wireframe |
| 8 | Dosel | #p-dosel | maqueta de wireframe |
| 9 | Fascículos | #p-fasciculos | maqueta de wireframe |
| 10 | Almacenit | #p-almacenit | maqueta de wireframe |
| 11 | Estrella de Maldonado (destacado) | #p-estrella | maqueta de wireframe |
| 12 | Remeras Delira | #p-remeras | maqueta de wireframe |
| 13 | Mush Type | #p-mush | maqueta de wireframe |
| 14 | Contacto / footer | #contact | terminada |

---

## 5. Qué se hizo en esta sesión (13 al 24 de agosto)

### Hero
- Asterisco: cuerpo 1.125em, translateX -0.269em. Tracking de la palabra
  ajustado: la r a -0,045 em y la o con márgenes **asimétricos**, porque
  meterla en un span mata el par de kerning "Po" y hay que devolverlo.
- **Animación de scroll:** el asterisco baja y gira 540 grados hasta
  esconderse bajo la sección 2. Gira sobre el **centro de la mancha**
  (transform-origin 49.9% 34.04%), no sobre el de su caja.

### Pantalla de carga
El mismo asterisco girando, centrado, hasta el load. Se retira del DOM al
terminar. El noscript la desactiva. Red de seguridad a los 6 s.

### Sección 2 — Sobre mí
Calcada de un mockup del autor (1920x730) medido por escaneo de píxeles.
Cuatro columnas, todas las primeras líneas sobre una misma línea de base
y **todas las columnas cerrando sobre una misma línea al pie**. La escala
va en cqw para conservar las proporciones a cualquier ancho.

### Sección 3 — Índice
Acordeón: cada ítem despliega una descripción breve y un "Ver más".
**Siempre hay exactamente uno abierto**, así nunca hay estado vacío. La
imagen de la derecha cambia **sólo al hacer click**. El ítem abierto se
marca con bloque naranja pleno y su texto pasa a negro. Las imágenes
viven en assets/images/indice/ y son **cuadradas**.

### Contacto
Mail, redes y CV cargados. El formulario envía por **FormSubmit** vía
fetch, sin salir de la página.

### Carrusel de pantallas (Green Eat)
El bloque "Pantallas" pasó de una tira de cinco imágenes a una **cinta
continua sin extremos** con las 21 capturas del prototipo, en el orden
del recorrido: onboarding, registro, home, perfil, puntos, promos, mapa
de locales, cupones y canje.

- Fuente: `D:\Martin\PORTFOLIO WEB\3APP GREEN EAT\carrusel` (21 PNG de
  1170x2532, 14 MB). Convertidas a JPG de 480 px de ancho, calidad 82:
  **1,3 MB en total**, en `assets/images/green-eat/carrusel/`.
- **Único lugar del sitio con esquinas redondeadas.** Son capturas
  full-bleed, sin marco de teléfono: el redondeo es lo que las hace leer
  como pantallas. No extenderlo al resto.
- El módulo 15 de `main.js` clona el juego de imágenes hasta cubrir la
  ventana más una vuelta y mueve el track por `transform`, envolviendo
  la posición con un módulo. **No usa scroll nativo**: con `overflow-x`
  el salto de la vuelta se ve y además pelea con el gesto.
- Se puede arrastrar; al soltar, el impulso se apaga solo hasta volver a
  la velocidad de crucero (45 px/s, vuelta completa ~85 s).

### Iconos e ilustraciones (Green Eat)
Las cinco piezas salen de `D:\Martin\PORTFOLIO WEB\3APP GREEN
EAT\ilustraciones` (1135x1135, ~1,2 MB cada una). Convertidas a 1000 px,
**488 KB en total**, en `assets/images/green-eat/ilustraciones/`. El
orden lo manda el nombre: 01, 02 y 03 en la fila de arriba; **04 y 05
abajo, lado a lado, con el texto a la derecha**. Ojo que en la carpeta
del autor la quinta se llama `5-100.jpg`, no `5.jpg`.

- **Calidad 88, no 82.** Son ilustraciones de línea sobre plano y a 82 el
  contorno negro anillaba. Igual pesan poco.
- Van a **marco pleno**, sin `fig__frame--contain`: ya vienen compuestas
  sobre su propio fondo crema y son cuadradas, así que el `--contain`
  sólo agregaba aire sobre el que la pieza ya trae. Esa clase sigue en
  uso en Cerveceros, donde sí hay recortes con transparencia.
- El párrafo de cierre lleva **`.project__lead`** para entrar en el mismo
  cuerpo que la bajada con la que abre la sección. Verificado: las siete
  propiedades tipográficas coinciden.
- El cierre usa **`.split--figs`** (1.3fr / 0.7fr), la variante nueva:
  misma proporción que `--wide` pero con la columna ancha del lado de las
  figuras y **sin `stretch`**, así la primera línea del texto queda a la
  altura del borde superior de las ilustraciones. La proporción salió de
  medir el montaje de referencia del autor: 1,864 contra 1,857 que da la
  regla. Al entrar de a dos, cada pieza se achica sola —a 1366 pasan de
  452 a 368 px— sin ningún tamaño puesto a mano.

### Sin uso en `assets/images/green-eat/` (1,5 MB)
`01-card.jpg`, `02-onboarding-a.jpg`, `03-onboarding-b.jpg`,
`04-onboarding-c.jpg`, `05-sistema.jpg`, `06-cafe.png`,
`07-hamburguesa.png` y `08-wraps.png`. Los reemplazaron el carrusel y
las ilustraciones nuevas. **No se borraron:** confirmar con el autor.

### Secciones de proyecto
- Títulos y volantas alineados con el índice; la ficha
  "Cliente / Categoría / Rol" se eliminó de las diez.
- Las diez maquetadas a partir del PDF de wireframes del autor.
- **Suma, Centenera y la apertura de Green Eat** ya tienen el contenido
  definitivo.

---

## 6. Piezas de CSS creadas (todas comentadas en el archivo)

| Clase | Para qué |
|---|---|
| .row-fit + .fit-16 / .fit-10 / .fit-08 | Fila justificada: las piezas comparten alto y el ancho sale de su proporción. El flex-grow **es** la relación de aspecto. |
| .project--fit | Levanta el tope --media-max-h de una sección entera, para que las filas lleguen a los dos márgenes. |
| .project--phones + .phones + .phone | Maquetas de teléfono dibujadas en CSS: marco #C3AE8F, anillo negro, muesca y pantalla. Se miden al **17 % del ancho del contenedor**. |
| .phone__cta | Área clicable que cubre **sólo** el botón dentro de una captura, con área táctil ampliada a 44 px. |
| .carousel + .carousel__track / .carousel__item | Cinta continua sin extremos. Va **fuera de `.container`** para llegar a los dos bordes sin usar `vw`, que incluye la barra de scroll. Como corta la cadena de hermanos, hay una regla `.project .carousel + .container` que le devuelve el aire al bloque siguiente. |
| .fig__frame--tall | Marco sin tope de altura. |
| .marcas / .marcas__in | Columna cuyo alto lo fija el texto de al lado. |
| .fig-stack, .trio, .screens, .fig--narrow | Ayudantes que pedían los wireframes. |
| ar-3x1, ar-3x5, ar-3x7, ar-27x10, ar-9x11 | Proporciones nuevas. |

---

## 7. Decisiones que conviene no repensar

1. **El tope --media-max-h (72svh)** existe para que ninguna figura sea
   más alta que la pantalla. Pero al recortarle el alto, la pieza **se
   angosta** para mantener su proporción, y la fila deja de llegar al
   margen derecho. Por eso Centenera lleva .project--fit. **Es la causa
   más frecuente del síntoma "no llega al margen", y se dispara al
   cambiar el zoom**, porque el zoom cambia la relación ancho/alto.
2. **Columnas que deben terminar donde termina el texto** (los logos de
   Suma): el contenido va en **absoluto**. Si queda en el flujo, su alto
   intrínseco entra en el cálculo de la fila y termina estirando el texto
   en vez de al revés. Pasó igual con la vista previa del índice.
3. **Los teléfonos de Green Eat se miden contra el contenedor (17 %)**,
   no contra el alto del texto ni contra el ancho de su columna. Atarlos
   al texto los dejaba diminutos; dejarlos llenar la columna, enormes.
   El 17 % salió de medir la referencia del autor usando el header
   (76 px) como escala.
4. **Inter es un 5 % más ancha** que los tipos de los mockups del autor.
   Se compensa cerrando el tracking, pero sólo hasta dejar ~3 % de
   diferencia: más allá la palabra se apelmaza.
5. **La página abre siempre arriba** (scrollRestoration en manual, más
   un manejo de pageshow para la caché de sesión). Volver con "atrás"
   también lleva al hero: fue pedido explícito del autor.
6. **El hero se apaga** (visibility hidden) cuando la sección 2 lo tapa.
   Es sticky durante toda la página y se colaba por encima en mobile.
   También se le quitó un will-change que mantenía una capa viva.
7. **Los textos de los casos los escribe el autor.** Cuando el wireframe
   deja lugar para más texto del que hay, se deja el hueco: no inventar
   contenido sobre sus proyectos.

---

## 8. Qué falta

### Contenido definitivo
Siete secciones siguen con imágenes de relleno y textos cortos:
**Cerveceros, Dosel, Fascículos, Almacenit, Estrella, Remeras y Mush**.

El flujo que viene funcionando: el autor deja en la carpeta del proyecto,
dentro de PORTFOLIO WEB, una imagen de referencia con el diseño ya
compuesto más las piezas sueltas nombradas (a.jpg, b.jpg...). Se mide la
referencia por escaneo de píxeles y se maqueta a partir de eso.

### Pendientes concretos
1. **El video de Green Eat pesa 60,4 MB.** Es el problema más grave del
   sitio. Reexportar a 720 px de ancho, 2 Mbps, 20-30 s → 5-8 MB.
2. **assets/ pesa 102 MB.** Además del video hay originales sin usar.
3. **Confirmar el mail:** figura martinorsain@hotmail.com, con "orsain"
   y no "orsini". Está en cuatro lugares. Si es un tipeo, se pierden
   los mensajes sin que nadie se entere.
4. **Activar FormSubmit:** la primera vez que alguien envíe el
   formulario llega un mail de confirmación. Hasta hacer click ahí, los
   mensajes no llegan.
5. **Los enlaces Siguiente/Anterior** entre proyectos todavía dicen
   "SUMA" y "Remeras custom"; los demás ya coinciden con el índice.
6. **La sección 2** dice "Trabajemos juntos!" sin signo de apertura,
   mientras el footer dice "¡Trabajemos juntos!".
7. **El CV pesa 4,15 MB** y no se pudo abrir para verificar que sea el
   archivo correcto.
8. **En mobile los dos teléfonos de Green Eat** quedan de 155 px de
   ancho cada uno y el prototipo se ve muy chico. Se ofreció apilarlos.
9. **retrato.jpg** quedó sin uso desde que se rehízo la sección 2.

---

## 9. Problemas conocidos

- **Caché de GitHub Pages.** Sirve el HTML cacheado unos minutos. Si el
  autor dice "no se ve el cambio", verificar primero contra origin/main
  antes de asumir que hay un bug. Ya pasó una vez.
- **Las imágenes se cachean por nombre.** Al reemplazar una manteniendo
  el nombre hay que abrir con Ctrl+F5 o en incógnito. Ya pasó.
- **El botón de copiar email nunca se probó con un clic real:** el
  entorno deniega el permiso de portapapeles.
- **La pausa del video al salir de pantalla no se pudo verificar:**
  depende de un IntersectionObserver y el panel los congela.
- **Partir texto en spans desactiva el kerning** en esos límites.
- **El asterisco del hero:** el parpadeo en mobile se arregló, pero no se
  pudo reproducir acá. Si volviera a aparecer, el siguiente paso sería
  envolver el hero y la sección 2 en un contenedor propio para que el
  sticky termine ahí.

---

## 10. Cómo verificar un cambio

1. Levantar serve2.ps1 (puerto 8100) y abrir con preview_start.
2. **Medir por JavaScript, no mirar.** Alto de secciones, scrollWidth
   contra innerWidth para overflow, naturalWidth igual a cero para
   imágenes rotas, anclas rotas, contraste por composición de alfa.
3. Verificar a **1366x630**, 375 y 1920. Para problemas de "no llega al
   margen", probar además **varios zooms**: 125, 100, 90, 80 y 67 por
   ciento, simulados cambiando el tamaño de ventana.
4. Chequear balance de llaves en CSS y JS después de editar con scripts.
5. Subir el ?v=.

---

## 11. Estado de verificación

Última pasada completa: cero imágenes rotas, cero anclas rotas, sin
scroll horizontal de 375 a 2039 px, sin errores de consola, contraste
por encima de AA en todas las secciones revisadas.
