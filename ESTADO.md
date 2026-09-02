# Estado del proyecto — traspaso

Documento para retomar el trabajo en una conversación nueva.
Última actualización: 2 de septiembre de 2026.

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
index.html          1816 líneas — estructura y contenido (14 secciones)
css/styles.css      2452 líneas — todo el estilo; config en :root
javascript/main.js  2048 líneas — 18 módulos
assets/             151 MB (!) — ver "Problemas conocidos"
```

**Cache-busting manual:** el link del CSS y el script llevan `?v=N`.
**Hay que subir ese número cada vez que se toca CSS o JS.** Va en **v=85**.

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
familia (Inter). Todo con esquinas rectas salvo tres excepciones
puntuales: el carrusel de Green Eat, las cartas de Remeras y los puntos
del pase de Mush. Es la tercera dirección que se probó: antes hubo una
editorial con serif y una de "pizarrón", las dos descartadas. No
reproponerlas.

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
| 6 | Green Eat | #p-green-eat | **contenido real del autor** |
| 7 | Cerveceros del Sur (destacado) | #p-cerveceros | **contenido real del autor** |
| 8 | Dosel | #p-dosel | maqueta de wireframe |
| 9 | Fascículos | #p-fasciculos | maqueta de wireframe |
| 10 | Almacenit | #p-almacenit | **contenido real del autor** |
| 11 | Estrella de Maldonado (destacado) | #p-estrella | maqueta de wireframe |
| 12 | Remeras Delira | #p-remeras | **visor 3D + contenido real** |
| 13 | Mush Type | #p-mush | **contenido real del autor** |
| 14 | Contacto / footer | #contact | terminada |

---

## 5. Qué se hizo (13 de agosto al 2 de septiembre)

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
- **Esquinas redondeadas, contra la regla general.** Son capturas
  full-bleed, sin marco de teléfono: el redondeo es lo que las hace leer
  como pantallas. No extenderlo al resto. Es una de las **tres**
  excepciones del sitio, junto con las cartas de Remeras y los puntos del
  pase de Mush; todo lo demás va con esquinas rectas.
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

### Cerveceros del Sur — contenido real
Maquetada sobre `REFERENCIA.jpg` (1920x6538) de `D:\Martin\PORTFOLIO
WEB\4CERVECEROS DEL SUR`, medida por escaneo de píxeles. La caja útil de
la referencia va de x 146 a 1773 —1628 de ancho— y **todas las calles
miden 45 px**, horizontales y verticales por igual.

Orden: apertura a todo el ancho · texto + logosímbolo · "Variables del
logo" con el GIF a todo el ancho · "Aplicaciones" con las 11 fotos en
cuatro filas justificadas.

- **Las 11 fotos van en orden de lectura**, 1 a 11. Se confirmó cruzando
  la proporción de cada hueco de la referencia con la de cada archivo:
  las once coinciden al tercer decimal.
- **El GIF se copia sin tocar** (2,5 MB): System.Drawing lo aplanaría y
  perdería la animación. El logo `.png` también, por la transparencia.
- El logosímbolo usa el patrón **`.marcas`** de Suma: su alto lo fija el
  texto de al lado, no sus propias medidas. Verificado: los dos miden lo
  mismo al píxel.
- La sección lleva **`project--fit`**. Sin eso las filas se angostan al
  recortarles el alto y dejan de llegar al margen derecho. La
  contrapartida es que a 1366x630 las filas 1 y 4 miden 805 y 834 px de
  alto: **más que la pantalla**. Es la proporción de la referencia.

### Piezas de CSS nuevas para esta sección
| Clase | Para qué |
|---|---|
| `.fig--ar` + `style="--ar"` | Proporción arbitraria. `--ar` es la relación ancho/alto del archivo y hace dos cosas con un solo número: le da la proporción al marco y reparte el ancho de la fila. Son la misma cosa: en una fila de alto común, el ancho de cada pieza es proporcional a su ratio, así que el `flex-grow` puede **ser** el ratio. Va en un `style` porque es un dato de la imagen, no una decisión de diseño. |
| `.fig-stack--ar` + `.fig-stack__in` | Columna de dos piezas apiladas que ocupa el lugar de una en la fila. **El contenido va en absoluto**, igual que `.marcas`: si queda en el flujo, su alto intrínseco —los dos altos más la calle— estira la fila y deja la pieza de al lado corta por abajo (medido: 33 px a 1920). Fuera del flujo, la calle sale del alto disponible y los pies coinciden. |
| `.row-fit--even` | Calle vertical igual a la horizontal. Centenera usa el medianil vertical más ancho porque su referencia lo tenía así; la de Cerveceros los tiene iguales. |

### Remeras — visor 3D
La remera grande es un modelo 3D de verdad: se arrastra para girarla y la
rueda acerca. Las miniaturas de al lado **no cambian el modelo sino su
textura** — se comprobó que los **siete** `.glb` del autor tienen la
geometría byte por byte idéntica (mismo SHA), así que se baja **una sola
malla de 968 KB y después un JPG por diseño**. Las siete texturas más las
siete miniaturas suman 1,36 MB.

Los siete diseños: 2pac, Billie, Kendrick, Rauw, Lil Supa, Jordan y Miko.
Para sumar uno nuevo alcanza con su `.glb`: se le saca la textura y se
tira el resto.

**Las medidas de este bloque se encadenan desde un solo número.** El alto
del visor (`--visor-h`) manda todo lo demás: las siete miniaturas tienen
que entrar en ese mismo alto, así que el lado de cada una es lo que sobra
después de las seis calles dividido siete (`--pick`), y ese lado es
también el ancho de su columna en la retícula. Si algún día son más o
menos de siete, se cambian el 6 y el 7 del `calc` y se acomoda todo solo.

El marco del visor **no lleva fondo ni filete** —es el blanco de la
página— y su alto es una medida de pantalla, no un `aspect-ratio`: es una
ventana sobre un objeto que gira y su forma da igual, porque el encuadre
se recalcula solo. A 1366 el marco quedó en **624x449** (antes 270x452) y
a 1920 en 663x566, el 50 % del ancho útil.

**El encuadre usa el radio en planta medido sobre los vértices**, no la
caja. Costó dos intentos: con el lado mayor la prenda entraba de frente y
se salía unos 25° después —la silueta de una forma girada es más ancha
que cualquiera de sus lados—; con la diagonal de la caja entraba siempre
pero sobraba un 10 % de aire, porque supone picos en las esquinas y los
de una remera están en las mangas. Recorrer los 25.000 vértices una vez
cuesta nada y deja la pieza lo más grande posible sin salirse nunca.

**En mobile arranca más cerca y hay manejadores.** El margen ahí es 1,0
—tangente al cuadro— contra 1,10 en escritorio: de frente pasa del 82 %
al 87 % del ancho, y en una vuelta completa el peor margen es de 3 px,
sin recortar. Los cuatro botones (girar ↺ ↻, − y +) son de 44 px y sólo
se ven en pantalla chica; con el dedo se puede arrastrar para girar, pero
no hay rueda para acercar. El giro por botón no salta: fija un destino y
el bucle lo recorre.

**El texto de este bloque tiene que caber en el alto del visor**, y ese
alto se achica justo cuando el texto se alarga: al subir el zoom del
navegador la ventana mide menos píxeles CSS, la columna se angosta —más
renglones— y a la vez el visor, que va en `svh`, se acorta. A 125 % el
texto se pasaba 204 px por debajo.

Por eso ahí el cuerpo **no es fijo**: baja con el ancho de la ventana
(`clamp(13px, 0.06rem + 1.23vw, 19px)`), y además se le soltó el tope de
38ch de medida. Es el único bloque del sitio donde el texto no manda su
propio alto, así que es el único donde vale apartarse de la escala general;
por debajo de 1024 la retícula se apila y vuelve al cuerpo de siempre.

Margen sobrante medido, de 1024 a 2039 px de ancho y con ventanas de
360 a 940 px de alto: **entre 28 y 61 px**. Nunca se pasa. Si se agrega
texto, hay que volver a medir; el peor caso es 1242 de ancho, no 1024.

### Cartas que se dan vuelta (Remeras)
El bloque "Diseños en uso" son **12 cartas en 3 filas de 4** que giran al
tocarlas: adelante el diseño, atrás la prenda puesta. El botón con el más
de abajo abre la misma carta en grande, donde también gira; se sale
tocando fuera, con Escape o con el botón de cerrar. Se eliminó la tira
`.screens` que antes se llamaba así, y el bloque "Diferentes diseños"
pasó a llevar ese nombre.

- Fuente: `D:\Martin\PORTFOLIO WEB\9REMERAS CUSTOM\cards`, 24 PNG de
  1400x1600 y **84 MB**. A 900 px y calidad 80 quedaron en **3,3 MB**.
- **Las esquinas venían redondeadas dentro del PNG**, en transparencia,
  con un radio de 160 px. Se aplastaron sobre blanco y el redondeo lo
  rehace el CSS con `border-radius: 12.2% / 10.68%`: como la carta siempre
  guarda la proporción 7:8, esas dos cifras dan la misma esquina circular
  a cualquier tamaño. Va medio punto más grande que el horneado (11,43 %)
  a propósito: el arco original trae su antialiasing y al aplastarlo sobre
  blanco quedaba un filo claro en las esquinas. Recortando por
  dentro sobre la carta grande —3,7 px—, desaparece.
- El giro es 3D real —`preserve-3d`, `backface-visibility` y perspectiva
  de 1400 px—, no un cambio de imagen. El JS sólo pone y saca una clase.
- La vista grande se arma **una sola vez y se reusa**: clonar la carta
  entera agregaría dos `<img>` por cada apertura. Abre del mismo lado que
  estaba la carta chica.
- El alto de la carta grande sale de un solo `min()` con tres términos:
  lo que permite el alto de pantalla, lo que permite el ancho —de ahí el
  `8/7`— y un tope duro. Con alto fijo más `max-width` no alcanzaba: en
  mobile se iba a 527 px sobre una ventana de 375.
- Sin uso desde este cambio: `01-billie.jpg` a `05-hasbulla.jpg` en
  `assets/images/remeras/` (944 KB).

**La rueda pide el foco antes de acercar.** Si zoomeara siempre, bastaba
con que el cursor pasara por encima al bajar por la página para que el
scroll quedara secuestrado y la prenda se fuera de golpe a un primer
plano; con el visor ancho eso tapa media pantalla. Agarrar la pieza le da
el foco, y ahí sí la rueda acerca. Ctrl + rueda funciona siempre.

- Va en **WebGL2 a mano, sin three.js** (módulo 16 de `main.js`, ~260
  líneas). No valía romper la regla de cero dependencias por una pieza:
  el archivo trae una sola malla con posición, normal y UV, que es justo
  lo que hace falta dibujar.
- Del `.glb` se saca la textura incrustada; el color lo pone el visor.
- **El encuadre usa un límite cilíndrico, no la esfera envolvente.** Al
  girar sólo en horizontal la silueta nunca supera el mayor de los lados
  x y z; con la esfera —media diagonal— la prenda quedaba un 50 % más
  lejos de lo necesario. Y el fov de la perspectiva es el vertical: en un
  marco más alto que ancho hay que mirar también el horizontal, si no la
  prenda se sale por los costados.

**El peso.** El primer export pesaba 31,2 MB —617.014 vértices y
1.078.212 triángulos—, inaceptable para bajar en una página. El autor lo
decimó en Blender y quedó en **32.346 triángulos y 24.859 vértices**. Con
la textura incrustada quitada, `assets/models/remera.glb` pesa **968 KB**
y carga en 218 ms. La silueta renderizada difiere apenas un 0,2 % de la
del modelo de un millón de triángulos.

Al bajar de 65.536 vértices, los índices pasaron de `uint32` a `uint16`.
El visor ya lo contempla: lee el `componentType` del accessor.

**Si hay que regenerar el archivo** (por ejemplo al sumar más remeras),
el proceso es: tomar cualquiera de los dos `.glb` del autor y quitarle la
imagen incrustada, porque el color lo pone el visor. Dos trampas de
PowerShell que costaron un rato:
- `$arr += [byte]` convierte un `byte[]` en `Object[]` y `BinaryWriter`
  deja de escribirlo: el trozo JSON salía vacío. Hay que reservar el
  array entero con `New-Object byte[]`.
- El índice del `bufferView` de la imagen hay que anotarlo **antes** de
  borrar la lista `images`, si no queda declarado apuntando fuera del
  archivo y el `.glb` sale inválido.

### Almacenit — contenido real
Maquetada sobre `referencia.jpg` (6151x8710) de `D:\Martin\PORTFOLIO
WEB\7WEB ALMACENIT`, medida por escaneo de píxeles. Caja útil de la
referencia: x 478 a 5675 (5198 de ancho); el texto ocupa el 43 % y el
mockup el 56 %, que es **justo lo que da el `.split` de siempre** —no
hizo falta retícula nueva—.

- Texto con **CTA** debajo (`.btn .btn--primary`, el mismo del hero) que
  abre el sitio publicado en pestaña nueva.
- El mockup es un **PNG con transparencia** (58 % de sus píxeles), así
  que va sin caja detrás: clase nueva `.fig__frame--bare`, que apaga el
  fondo del marco una vez cargada la imagen. En la referencia flota sobre
  el blanco.
- **El mockup va grande, y para eso hizo falta una calle angosta.** En la
  referencia ocupa el 56 % del ancho útil contra el 43 % del texto, y
  entre los dos queda apenas un 0,8 %. Con el gap normal del `.split`
  —4,4 %— no entraban las dos medidas, así que hay una variante
  `.split--mock` (43fr / 56fr con gap de ~10 px). Esa calle tan angosta
  funciona porque **la pieza trae su propio aire**: el trazo naranja deja
  blanco de sobra contra su borde izquierdo. Verificado a 1366, 1600 y
  1920: el párrafo nunca desborda y la imagen nunca pisa al texto.
- El archivo está **recortado a su caja de tinta** (de 1920x1080 a
  1748x1016 del original, exportado a 1500x872). Así el ancho de la
  columna es el de la pieza y no queda margen muerto: a 1366 el mockup
  pasó de 541 a 692 px, un 37 % más grande.
- **Por qué las sábanas se veían flacas.** El alto de
  `.fig__frame--scroll` salía de un `aspect-ratio`, y el tope de
  `--media-max-h` se lo recortaba; para conservar la proporción la
  ventana se angostaba sola. A 1366 quedaba en **195 px de los 605** que
  tenía la columna. Ahora el alto es una medida de pantalla
  (`clamp(320px, 64svh, 640px)`) y el ancho lo manda la columna: **605 px
  a 1366, 649 a 1920.** Se recorren 6,8 y 5,6 veces su ventana.
- `ar-3x7` quedó sin uso, pero se dejó: es parte del juego de
  proporciones genéricas, no una clase de esta sección.
- Sin uso: `01-home.jpg` y `02-detalle.jpg` (980 KB), reemplazados por
  `home.jpg` y `detalle.jpg`.

### Mush Type — contenido real

**Portada.** El JPG de apertura pasó a ser video, con el mismo patrón que
el antes/después de Suma: sin controles, en loop, mudo, `playsinline`, y
el `src` en `data-src` para que el módulo 14 lo cargue recién cuando la
pieza se acerca al viewport. Origen: `MUSH FUENTE/mush portada 2` →
`assets/video/mush-portada.mp4` (725 KB).

Va en banda **3:1** desde tablet, como el wireframe, y ahí recorta: el
archivo es 16:9. Antes de recortar se midió el video en el navegador
—dibujando cuadros en un canvas y buscando los píxeles que se apartan del
color de la esquina— y la tipografía vive entre el **32% y el 62%** del
alto; el 3:1 se come el 20% de arriba y el 20% de abajo, o sea puro fondo
amarillo. En mobile la banda quedaba de 109 px y no se leía nada, así que
por debajo de 768 px vuelve a 16:9 y a `contain`. El `--ar` de la apertura
va en `.fig--apertura` y no inline, si no la media query no lo puede pisar.

**Dos pases del universo gráfico**, uno a cada lado del texto, con las
**dieciséis** piezas de `universo grafico` repartidas ocho y ocho, en
orden de archivo: `universo/a/01-08` son la 1 a la 9 y `universo/b/01-08`
la 10 a la 17 (en la carpeta del autor no hay 6). Pesan 1 MB en total, a
1000x1250 y calidad 82. Módulo 18 del JS, clases `.pase*`.

Sale del montaje que dejó el autor en `universo grafico/referencia.jpg`,
una captura del sitio en vivo con la propuesta pegada encima. Medido por
escaneo de píxeles: pases de 452 y 451 y texto de 540 sobre un tramo útil
de 1562, con calles de unos 59 px. De ahí salen las tres fracciones de
`.split--universo` —0.84fr 1fr 0.84fr— y el gap que ya usaba `.split`.

**El cambio de pieza es un desplazamiento, no un fundido.** La que entra
viene desde la derecha y empuja fuera del cuadro a la anterior. Los
tiempos salen de medir el sitio que dio de referencia el autor
(animography.net, que usa Swiper): **3000 ms quieta y 1100 ms
corriéndose, con la curva `ease`**.

En el marco hay dos `<img>`: una a la vista y la otra aparcada afuera, a
la derecha. Al terminar cada desplazamiento **se intercambian los papeles**
en vez de reescribir el `src` de la que se ve, así que el cuadro nunca
queda en blanco.

**El `loading="lazy"` de la imagen aparcada hay que sacarlo.** Fue un bug
real y costó encontrarlo: la que espera su turno está fuera del marco, y
para el navegador eso es estar fuera de pantalla, así que con `lazy`
puesto **no baja nunca** —no llega el `onload` y el pase se queda clavado
en la primera pieza—. Lo saca `despertar()`, la primera vez que el pase
entra en pantalla o cambia de pieza. Se deja puesto en el HTML para no
bajar las dos primeras piezas hasta que alguien se acerque, y para que
sin JavaScript igual se vea una.

**Los puntos, uno por pieza.** Reemplazan a la barra maciza de antes: el
de la pieza en pantalla se estira y se va llenando de naranja, como en el
montaje. Las medidas salen de ahí: puntos de 6 px, calles de 6 y el
activo de 108. Los pone el JS, así que el HTML no sabe cuántas piezas
hay; sin JavaScript la fila queda vacía y no se dibuja nada. **Son lo
único redondeado del sitio junto con el carrusel de Green Eat y las
cartas de Remeras** —así los dibujó el autor—.

El de la derecha arranca con medio ciclo de adelanto (`data-desfase`)
para que los dos no se muevan al mismo tiempo a los costados del texto.
En el montaje del autor también están desfasados.

**Tres disposiciones según el ancho.** Las tres columnas sólo entran de
**1280** para arriba; por debajo el texto queda encajonado y se estira muy
por debajo de las imágenes. De 768 a 1279 el texto va arriba a todo el
ancho y los dos pases abajo, uno al lado del otro, con un tope de 420 px
para que cerca de 1280 no se vayan a 550x690. Por debajo de 768 se apila
todo.

**El cuerpo del texto baja con el ancho de la ventana** (de 17,5 a 20 px)
en vez de quedar clavado en 21. Es el mismo caso que el visor de remeras:
acá el texto no manda su propio alto, lo mandan los dos pases, que son
4:5 y por lo tanto miden lo que da el ancho de su columna. Al angostarse
la ventana los pases se achican y el texto, en una columna también más
angosta, se alarga: las dos cosas van en contra. Con el cuerpo de siempre,
a 1366 el texto sobraba **84 px** por debajo de las imágenes.

Margen medido entre el pie del texto y el pie de las imágenes, de 1280 a
2039: **entre 4 y 86 px, siempre del lado bueno.** El peor caso es 2039,
no 1280, porque de 1920 para arriba el gutter crece y la caja útil se
angosta. Si se agrega texto, hay que volver a medir.

**Todo lo que se mueve, se mueve junto.** El punto largo se acorta y el
chico se estira **en el mismo momento y durante el mismo tiempo** que la
imagen cruza el cuadro, con la misma curva. Por eso la duración de los
puntos la cronometra el módulo 18 y va inline, no en la hoja: en la
primera versión el CSS los movía en 320 ms con `--ease` y el JS marcaba
el punto **recién al terminar** el deslizamiento, así que el conjunto se
veía tosco. Si se cambia uno de los dos tiempos hay que cambiar el otro.

**Se arrastra y las piezas acompañan al dedo.** El lado se decide con el
primer movimiento —hacia la izquierda trae la siguiente, hacia la derecha
la anterior— y las dos imágenes se mueven como una sola tira, siempre a
100% de separación. Al soltar, si se recorrió más del 12% del ancho (con
un piso de 40 px) el cambio se completa, y si no vuelve atrás; en los dos
casos **descontando lo ya recorrido**, con un piso de 180 ms, así un
gesto casi terminado no tarda lo mismo que uno desde cero.

Para que el gesto arranque sin esperar, las dos piezas vecinas se
precargan en la caché apenas el pase entra en pantalla y después de cada
cambio. Si igual la vecina no llegó, la pieza se queda quieta en vez de
dejar un hueco.

**Cuidado con el `onload` de la vecina.** Aunque ya esté en caché y se la
pueda aparcar en el acto, el navegador dispara igual el `onload` un rato
después. Sin un cerrojo, esa segunda llamada le devolvía la vecina al
borde **en medio del arrastre** y la pieza pegaba un salto. Fue un bug
real, y es el mismo patrón que ya había aparecido en `ir()`.

**El arrastre nativo del navegador hay que apagarlo, y con tres candados.**
Si no, apenas se empieza a mover la pieza el navegador cree que le están
sacando la imagen del documento: se lleva el JPG en fantasma y —lo que
importa— **suelta la captura del puntero**, así que dejan de llegar los
`pointermove` y el gesto se muere. Desde afuera se ve como que la imagen
"no se deja arrastrar". Los tres candados son `draggable="false"` en el
HTML, `-webkit-user-drag: none` en el CSS y un `dragstart` cortado en el
módulo 18; van los tres porque cada navegador se agarra de uno distinto.
El `preventDefault` del `pointerdown` **no va en táctil**: ahí no hay
arrastre nativo que cortar y puede llevarse puesto el scroll vertical de
la página, que es justo lo que el `touch-action: pan-y` deja pasar.

También se puede usar las flechas del teclado, y al pasar el mouse por
encima se frena.

Con `prefers-reduced-motion` no avanza solo y el cambio es instantáneo:
quedan el arrastre y el teclado, y el relleno no se dibuja.

Sin uso: los diez `universo/01.jpg` a `10.jpg` sueltos (620 KB), que eran
la selección anterior de diez piezas. **No se borraron.**

**Video de presentación.** Este sí lleva controles porque tiene sonido, y
`preload="none"` porque pesa. Origen: `MUSH FUENTE/video mas chico.mp4`
(1280x720, 91 s, 2.618 kbps, 28,4 MB). El primer export era el mismo corte
a 1080p y 6.074 kbps: 69,4 MB. Misma proporción, así que el reemplazo no
tocó la maqueta. Se queda en **16:9 sin recortar**: el mismo
escaneo mostró que en varios momentos usa el cuadro entero (a los 60 s el
contenido va del 76% al 100% del alto; a los 85 s ocupa todo), así que
cualquier recorte le cortaría la pieza. A 1366 mide 1239x697.

Lleva **`poster`**. Con `preload="none"` el navegador no tiene ni un
cuadro que mostrar y dejaba el hueco gris del marco (`#F2F2F0`), que fue
lo que marcó el autor. La portada es `MUSH FUENTE/portada video.jpg`
(1921x1081), convertida a **1600x900, 80 KB**, en
`assets/images/mush-type/portada-video.jpg`. Ya viene en 16:9, así que
calza con el marco sin recortar nada y sin tocar la decisión de arriba.
Es lo único que se baja antes de que alguien apriete play.

Queda una franja de menos de 1 px de fondo a los costados: el borde de
1 px del marco deja la caja del video en 1237x695 y esa no es exactamente
16:9. Le pasa igual al video, no lo trae el póster.

**Espécimen.** Son cuatro láminas iguales de 1400x990 → `--ar: 1.4142`,
**dos arriba y dos abajo** (`.grid-2`), que es como las quiere el autor.
Estuvieron un rato en una sola fila de cuatro (`.grid-4`) por un error de
lectura del wireframe. A 1366 cada una mide 605 px y las dos filas van de
56 a 1295, los mismos márgenes que los dos videos.

**El tope de altura, otra vez.** Los dos videos salían de 804 px de ancho
en vez de 1239: con `aspect-ratio` puesto, `--media-max-h` les recortaba
el alto y, para sostener la proporción, se angostaban. Se resolvió con
`.fig__frame--tall`, igual que en el collage de Suma, Almacenit y el
visor 3D. Es la trampa que más veces apareció en este sitio.

### Sin uso en `assets/images/cerveceros-del-sur/` (4,5 MB)
Los 13 archivos viejos, de `01-packaging.jpg` a `13-table-tent.png`. Eran
las imágenes de relleno de la maqueta. **No se borraron.**

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
| .pase + .pase__marco / .pase__img / .pase__barra / .pase__punto / .pase__avance | Pase de imágenes que corren solas. La pieza que entra se desplaza desde la derecha y empuja a la anterior; son dos `<img>`, una a la vista y otra aparcada afuera, que se intercambian los papeles. Debajo, un punto por pieza y el activo se estira y se llena de naranja. Los puntos los pone el módulo 18. |
| .split--universo | Las tres columnas del universo gráfico de Mush: pase, texto, pase. Sólo desde 1280; de 768 a 1279 el texto va arriba y los dos pases abajo. Es el segundo bloque del sitio —después del visor de remeras— donde el cuerpo del texto no es fijo, porque el alto lo mandan las figuras y no el texto. |
| .video-pieza (+ --recorte) | Banda de video de margen a margen. Va siempre con .fig__frame--tall. La variante --recorte usa object-fit: cover. |
| .fig--apertura | El 3:1 de la portada de Mush, en CSS y no inline para que la media query de mobile lo pueda pisar. |
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
Quedan **tres** secciones con imágenes de relleno y textos cortos:
**Dosel, Fascículos y Estrella de Maldonado**. Las otras cuatro que
estaban en esta lista —Cerveceros, Almacenit, Remeras y Mush— ya tienen
el material real del autor.

El flujo que viene funcionando: el autor deja en la carpeta del proyecto,
dentro de PORTFOLIO WEB, una imagen de referencia con el diseño ya
compuesto más las piezas sueltas nombradas (a.jpg, b.jpg...). Se mide la
referencia por escaneo de píxeles y se maqueta a partir de eso.

### Pendientes concretos
0. **El bloque "Aplicaciones" de Mush repite piezas del pase.** El
   abecedario, los números y el "¡Siempre!" son los mismos archivos que
   ahora aparecen en los dos pases del universo gráfico, y encima están
   recortados a 4:5 dentro de marcos 3:2, así que se los come por los
   costados. Las únicas dos que no se repiten son la foto de las
   hamburguesas (`11-ig.jpg`) y las letras sueltas (`03-letras.jpg`). Se
   le preguntó al autor qué hacer y quedó sin responder.
1. **El video de Green Eat pesa 60,4 MB.** Es el archivo más pesado del
   sitio por lejos: el segundo, el de Mush, pesa 28,4 MB. Reexportar a
   720 px de ancho, 2 Mbps, 20-30 s → 5-8 MB.
2. **assets/ pesa 150 MB.** Además del video de Green Eat hay
   originales sin usar.
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

- **Los dos videos pesados ya están en la historia de git.** `.git` pesa
  148 MB. Los únicos blobs grandes son `green-eat-prototipo.mp4` (60,4
  MB) y `mush-presentacion.mp4` (28,4 MB); el export de 69,4 MB de Mush
  nunca llegó a commitearse. Ojo: reexportar el de Green Eat achica el
  checkout pero **no** la historia —el blob viejo queda igual—, así que
  si en algún momento importa el tamaño del clon hay que reescribirla.
  Además GitHub avisa por archivos de más de 50 MB y rechaza los de más
  de 100.
- **Caché de GitHub Pages.** Sirve el HTML cacheado unos minutos. Si el
  autor dice "no se ve el cambio", verificar primero contra origin/main
  antes de asumir que hay un bug. Ya pasó una vez.
- **Las imágenes y los videos se cachean por nombre.** Al reemplazar uno
  manteniendo el nombre hay que abrir con Ctrl+F5 o en incógnito. Ya
  pasó, y volvió a aplicar al cambiar el video de Mush por el liviano:
  el `?v=` versiona el CSS y el JS, no los assets.
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
3. **Medir por JavaScript, no mirar.** Alto de secciones, scrollWidth
   contra innerWidth para overflow, naturalWidth igual a cero para
   imágenes rotas, anclas rotas, contraste por composición de alfa.
3. Verificar a **1366x630**, 375 y 1920. Para problemas de "no llega al
   margen", probar además **varios zooms**: 125, 100, 90, 80 y 67 por
   ciento, simulados cambiando el tamaño de ventana.
4. Chequear balance de llaves en CSS y JS después de editar con scripts.
5. **Los gestos, con el mouse de verdad** (`computer` / `left_click_drag`),
   no con `PointerEvent` hechos a mano. Un evento sintético no dispara el
   arrastre nativo del navegador ni la pérdida de captura del puntero, así
   que un arrastre puede pasar todas las pruebas sintéticas y estar roto
   para el que lo usa. Ya pasó, con el pase de Mush.
6. Subir el ?v=.

---

## 11. Estado de verificación

Última pasada completa (2 de septiembre): cero imágenes rotas —las 170—,
cero anclas rotas, sin scroll horizontal de 375 a 2039 px, sin errores de
consola, contraste por encima de AA en todas las secciones revisadas.

Del pase de Mush se verificó además, midiendo el DOM: los dos recorren
sus ocho piezas y vuelven al arranque, las imágenes que entran cargan
todas, el desplazamiento sale de translateX(100%) a 0 con la que sale
yendo a -100% en 1100 ms, y el punto activo, el relleno y el
`aria-valuenow` coinciden siempre. **Lo único que no se pudo ver es cómo
queda la animación en movimiento**, porque el panel no compone cuadros:
eso hay que mirarlo en un navegador de verdad.
