# Estado del proyecto — traspaso

Documento para retomar el trabajo en una conversación nueva.
Última actualización: 11 de septiembre de 2026.

El README.md documenta **cómo funciona** el sitio. Este archivo cuenta
**dónde estamos, qué se decidió y por qué, y qué falta**.

## Para retomar en una conversación nueva

1. Leer este archivo entero y el README antes de tocar nada.
2. `git status` y `git log`: el autor commitea y sube él mismo, con
   mensajes cortos del estilo "fasciculos 10-9". Ver si hubo cambios
   después de la última actualización de este archivo.
3. Mirar en `D:\Martin\PORTFOLIO WEB` si dejó material nuevo en la
   carpeta del proyecto de turno.
4. Levantar el servidor (sección 2) y abrir el sitio.
5. No hacer cambios hasta que el autor pida algo. Después de cada cambio:
   subir el `?v=` si se tocó CSS o JS, verificar en el navegador y
   **actualizar este archivo**. Commitear o subir sólo si lo pide.

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
index.html          1941 líneas — estructura y contenido (14 secciones)
css/styles.css      2923 líneas — todo el estilo; config en :root
javascript/main.js  3196 líneas — 22 módulos
assets/             164 MB (!) — ver "Problemas conocidos"
```

**Cache-busting manual:** el link del CSS y el script llevan `?v=N`.
**Hay que subir ese número cada vez que se toca CSS o JS.** Va en **v=99**.

---

## 2. Cómo se trabaja acá

- **Servidor de pruebas:** `.herramientas/servidor.ps1`, en el **puerto 8100**.
  Desde Claude Code se levanta con `preview_start` y el nombre
  `portfolio` (está en `.claude/launch.json`); a mano,
  `powershell -NoProfile -ExecutionPolicy Bypass -File .herramientas/servidor.ps1`.
  Soporta *range requests* —imprescindible para servir video—, tolera que
  el navegador aborte descargas y manda `no-store`. Sin eso se cae al
  servir el mp4 grande. Antes vivía en la carpeta temporal de cada sesión
  y se perdía al cerrarla; ahora está en el repo. La carpeta empieza con
  punto para que GitHub Pages no la publique.
- **El autor revisa en un portátil de 1366x768** → unos **630 px
  útiles**. Verificar siempre ahí, además de 375 y 1920.
- **El panel del navegador saca capturas sólo cuando está a la vista.**
  Con el panel oculto devuelve una imagen en blanco ("not compositing
  frames") y además congela requestAnimationFrame y los
  IntersectionObserver, así que el scroll suave y las animaciones parecen
  rotos cuando no lo están: para probar anclas, desactivar scroll-behavior
  y usar saltos instantáneos. Con el panel visible se ve todo y las
  coordenadas del mouse son 1:1 con el viewport, **si antes se hace
  `resize_window` con preset desktop**; con un viewport emulado más grande
  que el panel, la captura sale escalada y las coordenadas no coinciden.
- **Igual conviene medir el DOM por JavaScript** y no fiarse de mirar: es
  lo que detecta un desborde de 1 px o un contraste flojo.
- **Leer PDFs:** no hay poppler ni ImageMagick ni Python real. Se
  rasterizan con la **API nativa de Windows** (Windows.Data.Pdf) desde
  PowerShell, con **`.herramientas/pdf.ps1`**: `-Info` lista páginas y
  tamaños; `-Destino` carpeta y `-Ancho` las saca todas como `01.jpg`…;
  `-Pagina N` saca una. Dibuja la página al doble y la achica con
  bicubica, calidad 80. Una tanda de 40 páginas de un PDF de 64 MB tarda
  un par de minutos. **Ojo con la memoria:** cargar 40 páginas de 1100 px
  a la vez con System.Drawing hace caer el proceso; hay que liberar cada
  imagen al terminar con ella.
- **Leer PSD:** `.herramientas/psd-a-jpg.ps1 -Origen x.psd -Destino y.jpg
  [-Ancho -Alto]`. Ni System.Drawing ni WPF abren PSD; esto lee la imagen
  compuesta que va al final del archivo. Si el PSD se guardó sin
  "Maximizar compatibilidad" puede salir en blanco.
- **Recortar GIF animados:** `.herramientas/recortar-gif.ps1` (ver
  Estrella, sección 5). System.Drawing aplana los GIF a un cuadro.
- **JPG enormes** (el wireframe de Estrella medía 6208x29216):
  System.Drawing se queda sin memoria. Se abren con WPF, `BitmapImage` con
  `DecodePixelWidth`, que decodifica ya achicado.
- **El panel del navegador también congela los eventos de scroll** y los
  IntersectionObserver cuando está oculto: poner `scrollTop` a mano no
  dispara el evento. Para probar la lógica, despacharlo con
  `dispatchEvent(new Event('scroll'))`. Y **el cursor de la herramienta se
  queda donde quedó**: si una prueba scrollea un pase debajo de él, el
  hover lo frena y parece roto. Moverlo a una esquina antes (`hover`
  necesita una captura previa).
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
  Para convertir material del autor: `.herramientas/convertir.ps1
  -Origen ... -Destino ... -Ancho N` —un archivo o una carpeta entera,
  nunca agranda, calidad 82 salvo que se pida otra—.

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
| 8 | 3 Esencias | #p-esencias | **contenido real del autor** |
| 9 | Fascículos | #p-fasciculos | **tapas y libro interactivo con los tres fascículos del autor** (desde PDF); dobles páginas de relleno |
| 10 | Almacenit | #p-almacenit | **contenido real del autor** |
| 11 | Estrella de Maldonado (destacado) | #p-estrella | **contenido real del autor** (con tres GIF) |
| 12 | Remeras Delira | #p-remeras | **visor 3D + contenido real** |
| 13 | Mush Type | #p-mush | **contenido real del autor** |
| 14 | Contacto / footer | #contact | terminada |

---

## 5. Qué se hizo (13 de agosto al 10 de septiembre)

### Hero
- Asterisco: cuerpo 1.125em, translateX -0.269em. Tracking de la palabra
  ajustado: la r a -0,045 em y la o con márgenes **asimétricos**, porque
  meterla en un span mata el par de kerning "Po" y hay que devolverlo.
- **Retoque del 14 de septiembre:** el autor vio la o pegada a la r. Se la
  corrió 0,012 em más a la izquierda devolviendo lo mismo por derecha
  (`.hero__o`: margin-left −0,0281 em, margin-right 0,0195 em). Medido a
  1366x630 (cuerpo 214,2 px) dibujando cada letra en un canvas en su
  posición real y comparando la tinta fila por fila: antes P-o 9 px y o-r
  2 px; ahora P-o 6 px y o-r 4 px. La o se movió 2,58 px; la r, el
  asterisco y el ancho de la palabra (784,41 px) quedaron exactamente
  igual.
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

**El año del proyecto** va en el pie del panel, a la derecha del "Ver
más" y sobre su misma línea de base (`.index__pie` y `.index__anio`).
Cierra contra el mismo margen que la categoría del ítem —no contra el
borde del bloque naranja— y eso sale de dejarle libre la columna del
signo + / −, que mide 12 px más el medianil de la lista. Verificado de
375 a 1920: cierra exacto con la categoría en todos, con 0 px de desvío.
Lleva el cuerpo y el color de la categoría, porque cae en esa misma
columna, y numeración tabular para que los diez queden del mismo ancho.

Los años, por si hay que rehacerlos: Suma 2025, Centenera 2025, Green Eat
2024, Cerveceros 2025, 3 Esencias 2024, Fascículos 2025, Almacenit 2024,
Estrella 2025, Remeras 2022, Mush 2026.

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

### 3 Esencias — reemplazó a Dosel
La sección que era **Dosel** pasó a ser **3 Esencias**, un proyecto de
packaging de whiskey, licor y ron. Cambió el contenido entero: título,
volanta, textos, imágenes y la entrada del índice. También cambiaron los
identificadores —`p-dosel` → `p-esencias`, `ix-dosel` → `ix-esencias`,
`pnl-dosel` → `pnl-esencias`—, así que hay que tocar los enlaces
Siguiente de Cerveceros y Anterior de Fascículos, el `data-href` y el
"Ver más" del índice, el mapa de secciones del principio del HTML y la
tabla del README. Verificado: cero anclas rotas.

Maquetada sobre `3 esencias/imagenes/web/referencia.jpg` (1920x4113),
medida por escaneo de píxeles. Caja útil de la referencia: x 163 a 1736,
**1573 de ancho**.

Orden: dos tomas del set a lo ancho · una foto con el texto al lado · las
tres presentaciones, una por fila.

- **No hizo falta ninguna clase nueva.** Todo sale de piezas que ya
  existían: `.grid-2` para la apertura y para el bloque de texto, y
  `.row-fit .row-fit--even` para las tres filas de abajo.
- **La fila de imagen y texto va en `.grid-2` y no en `.split`.** En la
  referencia las dos columnas miden lo mismo —la pieza ocupa 768 de los
  1573 útiles, que es la mitad justa descontada la calle— mientras que el
  `.split` reparte 0.9 y 1.1 y dejaría la imagen bastante más chica. El
  texto conserva su tope de 38ch, así que no llena la columna entera;
  tampoco lo hace en el montaje del autor.
- **Las tres filas de abajo comparten geometría.** Cada una es una
  `.row-fit`: las dos piezas comparten el alto y el ancho sale de su
  `--ar`. Medido en la referencia, las tres filas miden 771 px de alto y
  las calles horizontal y vertical son de 49 y 50 px —de ahí el `--even`,
  que iguala la calle entre filas con la de adentro—.
- **La pieza 07 se recortó 14 px arriba y abajo al convertirla.** Venía en
  1.1833 y sus dos hermanas de fila en 1.2007; sin igualarlas, su fila
  salía 6 px más alta y el corte entre las dos columnas quedaba 4 px
  corrido respecto de las otras dos filas. El montaje del autor ya la
  traía recortada. Es la única imagen a la que se le tocó el encuadre.
- **La sección lleva `project--fit`**, como Centenera y Cerveceros. Sin
  eso el tope de `--media-max-h` les recorta el alto a las filas, las
  piezas se angostan para sostener su proporción y dejan de llegar al
  margen derecho: a 1366 la fila pide 613 px de alto contra los 454 del
  tope. Medido de 768 a 1920, las tres filas llegan a los dos márgenes.
- Fuente: nueve JPG de `3 esencias/imagenes/web`, más `imagen indice.jpg`.
  Convertidas a **1,7 MB en total** en `assets/images/esencias/` (01 a
  09), con el ancho de salida según lo grande que se ve cada pieza —1400
  las de arriba, 1100 las botellas, 1600 las escenas— y sin agrandar
  ninguna. La del índice va cuadrada a 1181 px, como las otras nueve.

**El nombre de la marca no se parte nunca.** "3 Esencias" lleva un espacio
duro (`&nbsp;`) en los cuatro lugares donde se ve como texto: el nombre
del índice, el título de la sección, los dos enlaces de navegación y la
bajada. Sin eso el "3" quedaba al final de un renglón y "Esencias" al
principio del siguiente. **Va con `&nbsp;` y no con un `<span>` de
`nowrap`** a propósito: meter la marca en un span mataría el kerning
contra las comillas que la rodean, que es el mismo problema que ya está
anotado para el asterisco del hero. Verificado de 320 a 1920 px: una sola
línea en los cuatro sitios. Si se reescribe el texto, hay que volver a
poner el espacio duro.

**Dos rótulos los puse yo y conviene que los revise el autor:** la volanta
dice **"Packaging"** —era "Juego de mesa"— y el título del bloque de
abajo dice **"Los tres packagings"** —era "Elementos del juego"—. El
montaje venía con los de Dosel porque es una captura de la página vieja
con las fotos nuevas encima.

**Sin uso desde este cambio:** los diez archivos de
`assets/images/dosel/` (1,4 MB) y `assets/images/indice/05-dosel.jpg`
(1,1 MB). **No se borraron.**

### Accesibilidad y uso (14 de septiembre)
Salió de una auditoría que pidió el autor, en escritorio (1366x630 y 1920)
y en mobile (375x812). Ya estaba bien y no se tocó: contraste AA en todos
los textos, 137 paradas de Tab con foco visible y sin caer en paneles
cerrados, alt en las 169 imágenes, sin anclas rotas ni ids duplicados,
modales que cierran con Escape y devuelven el foco, movimiento reducido en
videos, cinta y pases. De la lista que se le pasó eligió los puntos 1 a 7,
9, 10 y 11. **El 8 —versiones chicas de las imágenes para mobile— no se
hizo.**

1. **Indicaciones de uso (`.ayuda`).** Una línea chica con dos textos, uno
   para mouse ("Hacé clic…") y otro para el dedo ("Tocá…"); elige el CSS
   con `(hover: none), (pointer: coarse)`. Están en las sábanas de
   Almacenit, las cartas de Remeras y las Aplicaciones de Mush, y —solo con
   el dedo— arriba de las tapas de Fascículos. La de la cinta de Green Eat
   se sacó el 15 de septiembre (ver "Retoques del 15 de septiembre").
   **Los textos los escribí yo: conviene que el autor los revise.**
   - **Remeras:** el aviso del visor 3D decía "la rueda acerca" también
     con el dedo. Ahora con el dedo dice "Arrastrá con el dedo para
     girarla, o usá los botones de abajo" —los botones se nombran solo si
     están a la vista—.
   - **Libro:** debajo del título, "Hacé clic en una página, arrastrá su
     esquina o usá las flechas para pasarla" / "Tocá una página o deslizá
     para pasarla".
   - **Almacenit, módulo 21 nuevo.** La ventana se envuelve en
     `.scroll-caja` y lleva una pista al pie (degradado y flecha) que se va
     al empezar a recorrerla. **Con el dedo arranca cerrada**, con un botón
     encima ("Tocá para recorrer la página"): antes atrapaba el scroll de la
     página, porque ocupa 327 de 375 px de ancho y 520 de alto y al
     deslizar por encima se recorrían 2,4 a 2,9 pantallas de sábana antes
     de seguir. Se vuelve a cerrar sola al salir de pantalla. Además es
     una región que toma el foco y se recorre con las flechas.
2. **Índice más liviano.** Al abrir la página se bajaban 10,7 MB sin
   scrollear; 8,8 eran las diez imágenes del índice (1200 px, hasta 1,5 MB
   cada una), que se precargaban todas. Pasaron a **1000 px y calidad 82:
   1,5 MB en total**, con los mismos nombres. Y la precarga espera a que
   el índice esté a 600 px de la pantalla: al abrir se baja una sola, la
   de la vista previa.
3. **Formulario en iPhone:** con el dedo los campos van a 16 px. Con menos,
   Safari acerca la pantalla al tocarlos.
4. **Vistas grandes como ventanas.** La carta de Remeras y la aplicación
   ampliada de Mush llevan `role="dialog"`, `aria-modal` y un nombre (el
   alt de la pieza + ", en grande"); el libro ya lo tenía. Mientras están
   abiertas, `bloquearFondo()` pone `inert` a los hijos del body salvo la
   vista, así el Tab no se escapa a la página tapada. `liberarFondo()` va
   **antes** de devolver el foco: un elemento inerte no puede recibirlo.
5. **Áreas táctiles.** "Ver más" del índice medía 22 px de alto (el mínimo
   de WCAG es 24): un `::before` le agranda el área por fuera, sin mover
   nada. La lupa de las cartas se ve de 34 px y se toca de 46.
6. **Vista previa al compartir.** Open Graph, tarjeta de X y `canonical`,
   con la imagen `assets/compartir.jpg` (1200x630, 51 KB) sacada de
   `PORTFOLIO WEB/compartir.psd`. El `theme-color` pasó de #F3F0EA —el beige
   de una dirección descartada— a #FFFFFF.
7. **Botón de pausa (`.pausa`).** **No queda ninguno.** Hubo seis —los
   tres videos en loop, la cinta de Green Eat y los dos pases de Mush— y
   el 15 de septiembre **el autor los quitó todos**; se borraron también
   la función `botonPausa()` y los estilos. Lo que sigue describe cómo
   eran, por si alguna vez se vuelve a hablar del tema. Cuadrado, en la esquina, se ve de 34 px y se toca de 44.
   Con movimiento reducido arranca en pausa y, si alguien lo aprieta, se le
   hace caso. El botón corta el `pointerdown`: si no, en la cinta y el pase
   empezaba un arrastre y el click no llegaba. La cinta, además, ahora se
   queda quieta del todo: la velocidad se acercaba a cero sin llegar y
   seguía corriéndose fracciones de píxel. **Los 4 GIF no se pueden
   pausar.**
8. **Salto de accesibilidad:** "Saltar a los proyectos", a `#projects`. Antes
   iba al hero, que está justo debajo del menú.
9. **Las 10 barras Anterior/Siguiente** se llamaban todas "Navegación entre
   proyectos"; ahora "Navegación desde Suma", "…desde Centenera FC", etc.
10. **Foco en el formulario:** la línea pasa a 2 px con una sombra interior,
    sin mover el formulario.

**Dos herramientas nuevas en `.herramientas/`:** `psd-a-jpg.ps1` lee la
imagen compuesta que Photoshop guarda dentro del PSD (8 bits, RGB o gris,
sin comprimir o RLE) y la exporta, con recorte al centro si se le da ancho
y alto. Y `recortar-gif.ps1`, descripta en Estrella.

### Retoques del 15 de septiembre
Después de ver la tanda de accesibilidad, el autor pidió:

- **Sin ningún botón de pausa.** Primero se sacaron los de Suma, Green Eat
  (video y cinta) y la portada de Mush, y en un segundo pedido los de los
  dos pases de Mush. Se borró también la función `botonPausa()` y la clase
  `.pausa`.
- **Sin indicación en la cinta** de Green Eat: "se sobreentiende".
- **La de las tapas, solo con el dedo y antes de las tapas.** Con mouse ya
  las anuncia el hover. Clase nueva `.ayuda--solo-tactil`, que en
  escritorio no ocupa lugar.
- **Una mano animada sobre el visor 3D de Remeras** (`.shirt3d__gesto`, en
  el módulo 16), a partir de un ícono que mandó el autor —una mano con el
  índice arriba y una flecha curva hacia la izquierda—. No había archivo:
  se redibujó en SVG de trazo, así hereda el color y no pesa. Aparece
  recién con el modelo puesto, centrada sobre el lienzo, con un halo
  blanco para separarse de la estampa; la mano se balancea y la flecha
  late (1,8 s). **Mide `clamp(150px, 34%, 240px)`: 212 px a 1366 y 150 en
  mobile**; empezó en 87 y 64 y el autor la pidió entre el doble y el
  triple. Sigue centrada y entra en el marco en los dos. No ataja el
  puntero. **Se va con la primera interacción**
  —arrastrar, las flechas o la rueda sobre el lienzo, o los botones de
  mobile— y se saca del DOM. Elegir otra estampa no cuenta. Con
  movimiento reducido queda quieta.
- **CV nuevo:** `D:\Martin\CV\Martin Orsini CV.pdf` (una página A4, 3,8 MB)
  pisó a `assets/cv-martin-orsini.pdf`, con el mismo nombre para no tocar
  el enlace. En la carpeta hay otro casi igual, `CV Martin Orsini .pdf`, que
  no se usó.

### Estrella de Maldonado — contenido real (14 de septiembre)
Maquetada sobre `8ESTRELLA DE MALDONADO/web/referencia.jpg`, un wireframe
de 6208x29216 sobre fondo blanco con rótulos de relleno ("Titulo",
"aaaa", lorem ipsum). Para medirla se bajó a 1920 de ancho con WPF
(`BitmapImage` con `DecodePixelWidth`: System.Drawing no abre un JPG de
ese tamaño sin quedarse sin memoria) y se escaneó. Caja útil: x 114 a
1821.

Orden: apertura (01) a todo el ancho · texto · **Afiches** 02-03-04 en una
fila · **Digital** 05 (GIF) y 06 · **Indumentaria, banderas y más** 07 a
todo el ancho, 08-09, 10-11 (GIF), y 12, 13 y 14 (GIF) a todo el ancho.

- **La sección sigue oscura** (`section--dark`, destacado). La referencia
  es blanca porque es un wireframe, no porque se quisiera cambiar.
- **El texto es el del autor**, en tres párrafos `.project__lead`: la
  presentación (termina en dos puntos), la cita del redaccional entre
  comillas tipográficas y "Este proyecto puede verse completo y con mayor
  detalle en Behance". "Behance" es un `.link-inline` que abre en pestaña
  nueva, igual que en Cerveceros. La descripción corta del índice y su
  imagen **no se tocaron**.
- **Al lado del texto va una foto del escudo bordado** (`web/imagen que va
  al lado del texto.jpg`, 2475x1659 → `piezas/texto.jpg`, 1400 px), en
  `.grid-2` como en Fascículos y 3 Esencias. No está en la referencia: la
  pidió el autor después.
- **Se probó y se descartó** poner el redaccional como imagen (una franja
  de 8000x1404) debajo de la apertura, en lugar de la cita en el texto:
  en mobile la franja quedaba de 327x57 y no se leía. El autor pidió
  volver a la cita. Quedó sin uso `piezas/redaccional.jpg` (95 KB).
- **Todas las filas son `.row-fit.row-fit--even`, también las de una sola
  pieza.** Así la calle entre cualquier par de filas es `var(--gap)` y no
  hizo falta CSS nuevo. En la referencia las calles, pegadas a mano, van de
  24 a 36 px en horizontal y de 27 a 50 en vertical; a 1920 el gap da 32.
  Las filas 08-09 y 10-11 cortan en el mismo lugar en la referencia (x
  952-976) y acá también: sale solo del reparto por `--ar`.
- **La sección lleva `project--fit`**, como Cerveceros.
- Convertidas con `convertir.ps1` en
  `assets/images/estrella-de-maldonado/piezas/`: 1800 px las de todo el
  ancho, 1200 las de a dos, 900 los afiches y 800 el teléfono. 7,5 MB la
  carpeta, de los que 5,8 son los tres GIF.

**Los GIF 05 y 11 se recortaron sin perder la animación.** El autor dejó
cada uno en dos versiones: el GIF entero y una imagen fija con el
encuadre que quería. No hay ffmpeg ni ImageMagick y System.Drawing aplana
los GIF a un cuadro, así que se escribió **`.herramientas/recortar-gif.ps1`**,
que trabaja sobre el archivo: decodifica el LZW de cada cuadro, recorta
los índices de color y los vuelve a codificar con la misma paleta. Quedan
intactos los tiempos, el bucle, la transparencia y el descarte.

- **El recorte lo busca solo**, comparando la imagen de encuadre contra
  cada cuadro del GIF en todas las posiciones: el 05 cae en x 84 (1400x939
  → 1222x939) y el 11 en y 141 (1400x1000 → 1400x731), con diferencias
  medias de 2,7 y 1,4 por canal, que son la compresión de la imagen fija.
- **Verificado:** al terminar reabre el GIF recortado y lo compara cuadro
  por cuadro contra el original recortado: **diferencia 0** en los 3
  cuadros del 05 y en los 4 del 11. Los dos conservan el bucle y sus
  demoras (60 cs; en el 11, 60 y tres de 50).
- El 14 va como vino (1920x886, 2,8 MB).

**Sin uso desde este cambio:** los 11 archivos sueltos de
`assets/images/estrella-de-maldonado/` (`01-mockup.jpg` a
`11-entrenamiento.jpg`), que eran el relleno. **No se borraron.**

### Fascículos — texto y fotos (13 de septiembre)
Maquetada sobre `6FASCICULOS EDITORIAL/imagenes fasciculos/referencia.jpg`
(1920x3785), una captura del sitio con las fotos pegadas encima, medida
por escaneo de píxeles. Caja útil: x 163 a 1734, **1572 de ancho**.

Orden: texto a la izquierda y la foto 1 a la derecha · las tres tapas del
libro interactivo · seis fotos en dos columnas.

- **El texto es el del autor**, entero, en un solo párrafo con
  `.project__lead`. Reemplazó a la bajada corta de antes. La descripción
  corta del índice (sección 3) **no se tocó**.
- **Texto e imagen van en `.grid-2`**, como en 3 Esencias: la foto ocupa
  758 de los 1572 útiles, la mitad justa descontada la calle.
- **Las seis fotos, en `.grid-2` con `ar-4x3`.** En la referencia las
  columnas miden 775 y 756 px con calles de 40 y 44: la diferencia es del
  pegado a mano, así que va la grilla de siempre, sin clase nueva.
- **El rótulo "Fascículo 01" que asoma en la referencia no va:** es el de
  la página vieja que quedó de fondo, y encima de seis fotos de los tres
  fascículos no dice nada. Se sacaron los tres bloques "Fascículo 01/02/03"
  con las dobles páginas de relleno.
- **La sección lleva `project--fit`.** Las fotos 4:3 a 1366x630 piden
  454 px de alto, justo el tope de `--media-max-h`: con cualquier zoom
  mayor se angostarían y dejarían de llegar al margen.
- Fuente: `1.jpg` a `7.jpg` (1898x1233 la primera y 1938x1453 las demás),
  convertidas a **1400 px, calidad 82**, en
  `assets/images/fasciculos-editorial/fotos/01.jpg` a `07.jpg`: 1,4 MB.

### Fascículos — tapas y libro interactivo
La fila de tres imágenes —la única de la sección que va de margen a
margen— son **las tres tapas de la colección**, y cada una abre su
fascículo en un **libro que se hojea**: *Los viernes* de Juan Forn,
*Panfleto: erótica y feminismo* de María Moreno y *Otra cosa es
permanecer* de Romina Paula. Los títulos salen de las tapas y portadillas
de los PDF. Para cambiar un fascículo se tocan, en su botón,
`data-libro` (la carpeta), `data-paginas`, `data-titulo`, `data-calco`,
`data-proporcion` y la imagen de la tapa.

- **Fuente: los PDF del autor** (11 de septiembre),
  `6FASCICULOS EDITORIAL/WEB/FORN.pdf`, `MORENO.pdf` y `PAULA.pdf` (43, 28
  y 64 MB). Reemplazaron a los 36 JPG de `hojas forn` con los que se había
  armado el 01, que se pisaron con los mismos nombres. Rasterizados con
  `.herramientas/pdf.ps1` a **1100x1454, calidad 80** —dibujados al doble
  y achicados— en `fasciculo-01/`, `fasciculo-02/` y `fasciculo-03/`:
  6,3, 5,3 y 6,9 MB. La `portada.jpg` de cada uno va a 800x1058. Con la
  lupa, a 1920, una página se ve a unos 1100 px: el archivo queda casi
  1:1 y el texto se lee nítido.
- **La página del PDF mide 364,54 x 481,89 pt: proporción 0,7565**, apenas
  más ancha que la de los JPG viejos (0,7545). Se cambió en el `--ar` y
  el `data-proporcion` de las tres tapas y en la constante `PROPORCION`
  del módulo 20, que es sólo el valor por defecto.
- **Forn y Moreno tienen 36 páginas y la misma estructura:** 1 tapa, 2
  retiro de tapa, 3-4 calco, 5 portadilla, 6 blanca, relatos desde la 7,
  33-34 calco, 35 retiro de contratapa y 36 contratapa. Calcos
  `3,4,33,34`. **Paula tiene 40** y dos hojas de calco más, entre relato
  y relato.
- **En el PDF de Paula las cuatro primeras páginas venían al final y en
  orden inverso.** La 1 del PDF es la portadilla, y al final vienen
  33 calco, 34 calco, 35 retiro, 36 tapa (el bloque de apertura al revés)
  y después 37-38 calco, 39 retiro y 40 contratapa (el de cierre, en
  orden). Se reordenó al copiar: 36→1, 35→2, 34→3, 33→4, las 1 a 32
  corridas cuatro lugares (5 a 36) y las 37 a 40 en su lugar. Queda con
  el mismo patrón que Forn: portadilla en la 5, los tres relatos empiezan
  en página impar (7, 17 y 27) y la carilla 3 es igual a la 38 sin
  espejar —diferencia 11 contra 141 espejada—, como en Forn la 3 es igual
  a la 34. Por eso sus calcos son **`3,4,15,16,25,26,37,38`**: las hojas
  11-12 y 21-22 que marcó el autor, contadas en el PDF, son la 15-16 y la
  25-26 del libro. **Conviene que el autor lo confirme.** Si algún día
  reexporta el PDF en orden, basta con volver a sacar las páginas y dejar
  el `data-calco` como está.
- **Las tapas van al 80 % de su columna** (`.tapas`), para que el hover
  tenga dónde crecer: al pasar el mouse crecen un 7 %, se levantan con una
  sombra y toman el filete naranja de siempre. Así se nota que se tocan.
  Verificado con hover real: de 174 a 186 px, borde y contorno naranjas.
  A 1366 miden 315x416. Llevan `fig__frame--tall`: son verticales y el
  tope de `--media-max-h` las angostaría.

**El libro pliega las hojas, no las gira** (módulo 20, sin librerías). La
primera versión giraba hojas rígidas con transforms 3D y el autor la
encontró tosca; además la escena recortaba, y la hoja en perspectiva se
cortaba justo contra el borde del libro. Ahora:

- **La esquina que se agarra va al cursor y la hoja se dobla sobre la
  mediatriz** entre esa esquina y su lugar original. Quedan tres partes:
  lo que sigue apoyado de la página (recortado con `clip-path` del lado
  del lomo), la solapa doblada y, donde la página se levantó, la de
  abajo. La solapa muestra el dorso con **una sola matriz**: son dos
  reflejos seguidos —sobre el lomo, para pasar del dorso a su lugar
  final, y sobre el pliegue— y dos reflejos son una rotación. Verificado:
  el determinante da 1 y la esquina de la solapa cae exacto en el punto
  del cursor.
- **La hoja está atada al lomo:** la esquina no se aleja del punto del
  lomo de su mismo borde más que el ancho de la página, ni del otro más
  que la diagonal. Sin eso el papel se estira como goma.
- **Sombras:** la que cae sobre la página que se descubre y la curva de
  luz de la solapa son degradados alineados con el pliegue y recortados a
  su zona. Miden 4x3 páginas, porque un fondo sólo se pinta dentro de su
  caja y la solapa se sale del libro. La solapa, además, proyecta sombra
  sobre lo que tapa: va en **su propia capa** (`.pliegue-solapa`), porque
  con `filter` en la página misma el recorte se comería la sombra —el
  filtro se aplica antes que el `clip-path`—.
- **La esquina se asoma** al acercar el mouse (a menos del 17 % de la
  página de una esquina) y vuelve al alejarse. Tocar con la esquina
  asomada completa la vuelta desde ahí, sin salto.
- **Cómo se hojea:** un toque en la derecha avanza y en la izquierda
  retrocede; arrastrando se agarra la esquina de arriba o la de abajo
  según la mitad donde se apriete, y va con el cursor sin saltar. Pasada
  la mitad de la página —o con un tirón en esa dirección— la vuelta se
  completa; si no, vuelve. Flechas del pie, las del teclado, Escape, la
  cruz o tocar el fondo para cerrar. Toques seguidos no dejan hojas a
  mitad de camino.
- **La escena no recorta** (sólo con la lupa puesta) y el libro deja 10 %
  de aire arriba y abajo para que la solapa no pise la barra ni el pie.
  **Ojo:** sin recorte, un elemento de grilla no se achica por debajo de
  su contenido, así que la escena tomaba el ancho del libro y en un
  teléfono entraba de a dos, con páginas más anchas que la pantalla. Lo
  arreglan `min-width: 0` en la escena y `minmax(0, 1fr)` en la columna.
- **Carillas de calco** (`data-calco="3,4,33,34"`): dejan ver lo que
  tienen debajo, un poco empañado —imagen al 80 % y un velo blanco del
  10 %—. La 4 es la 3 espejada (por diferencia de píxeles, 7 contra 85),
  así que el reverso no hace falta mostrarlo. **Sin `backdrop-filter`:**
  se probó y lo de abajo dejaba de verse del todo. El JS dibuja debajo de
  cada calco la página que corresponde: la 5 bajo la 3, la 2 bajo la 4, la
  35 bajo la 33 y la 32 bajo la 34 —verificado—. En la captura de la
  carilla 3 se lee "Los viernes" a través. La solapa de un calco es rosa
  sobre rosa y se distingue poco: es lo que pasa con el papel.
- **De a una página en pantalla vertical,** cuando de a dos cada página
  quedaría a menos del 78 % de lo que mide sola: el mismo libro visto por
  una ventana de una página, que se corre hacia el lado que toca. Ahí la
  hoja no sigue al dedo: se hojea tocando o deslizando, y un gesto
  vertical no hojea. La ventana recorta sólo a lo ancho
  (`overflow-x: clip`), así la solapa puede salirse arriba y abajo.
- **La lupa amplía ×2** y se recorre corriendo el `transform-origin`.
  Sin ella, a 1366x630 la página mide unos 300 px de ancho y el texto no
  se distingue.
- **Las páginas se bajan de a poco:** sólo las de las hojas vecinas. Cada
  página es un elemento que se crea la primera vez y se reusa, así una
  imagen no se vuelve a pedir cuando pasa de quieta a solapa.
- **El fondo del visor es opaco** (`--dark-bg`): al 94 % y al 97 % se
  adivinaba detrás la tipografía gigante del hero.
- **Gancho de prueba:** con `?libro-prueba` en la dirección,
  `window.__libroPrueba.plegar(s, arriba, fx, fy)` congela un pliegue
  —s 1 derecha o -1 izquierda; fx y fy, dónde va la esquina, en páginas
  desde el lomo—, `soltar()` lo deshace y `estado()` devuelve vuelta,
  página y modo. Sin el parámetro no existe. Es la única forma de sacarle
  captura a un pliegue en el navegador de pruebas, que no puede arrastrar.

Verificado con eventos de puntero en modo doble: la esquina se asoma y
vuelve; el toque da vuelta la hoja; el arrastre corto regresa, el largo
completa y hacia atrás retrocede; teclado; llega a `36 / 36` con
"siguiente" deshabilitado y el libro corrido media página, y vuelve a la
tapa. A 280 px entra de a una página. Capturas del pliegue en página de
texto, de la tapa levantándose sobre el calco y del calco quieto. Barrido
de 375 a 1920: sin imágenes ni anclas rotas y sin scroll horizontal. Sin
errores de consola. **Lo que no se pudo probar es el arrastre con el mouse
real**: la herramienta se cuelga en el panel (ver la sección 10).

**Sin uso desde este cambio:** `03-pagina-a.jpg`, `04-pagina-b.jpg` y
`05-pagina-c.jpg` en `assets/images/fasciculos-editorial/`. **No se
borraron.** Las tres dobles páginas de abajo ("Fascículo 01/02/03")
siguen con imágenes de relleno.

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

Y encima del póster va un **botón de play** (`.video-play`, módulo 14b):
los controles nativos dejan el play chiquito abajo a la izquierda y cuesta
darle. Es un cuadrado naranja con la flecha en negro —la misma decisión de
contraste que el bloque naranja de la sección 2— de `clamp(64px, 9%,
104px)`: 104 en escritorio y **nunca menos de 64**, que es blanco táctil
cómodo. Centrado con `inset: 0; margin: auto` y no con `transform`, así el
`scale` del hover queda libre.

Dos detalles: viene con `hidden` desde el HTML y **lo enciende el JS**, así
que sin JavaScript no queda un botón que no hace nada; y se retira con el
evento `play`, no con el click, así que si la reproducción no arranca el
botón sigue ahí. El `display: grid` del botón le gana al `[hidden]` del
navegador, por eso hay una regla `.video-play[hidden] { display: none; }`.

**Espécimen.** Son cuatro láminas iguales de 1400x990 → `--ar: 1.4142`,
**dos arriba y dos abajo** (`.grid-2`), que es como las quiere el autor.
Estuvieron un rato en una sola fila de cuatro (`.grid-4`) por un error de
lectura del wireframe. A 1366 cada una mide 605 px y las dos filas van de
56 a 1295, los mismos márgenes que los dos videos.

**Aplicaciones.** Las seis definitivas del autor, de
`MUSH FUENTE/aplicaciones/aplicaciones definitivas` (a.jpg a f.jpg,
1617x1080 salvo la a que es 4500x3000). Convertidas a **1200x800, 1 MB en
total**, en `assets/images/mush-type/aplicaciones/`. Vienen en 3:2, que es
justo el `ar-3x2` que el bloque ya usaba, así que no hubo que tocar el
marco. Son: cartel de Mordisco, cartel de Mustard, latas, heladería ice!,
neón de Gota y fachada de Chulin.

**Van en tres columnas de a dos y el orden es por columna**: a y b en la
primera, c y d en la segunda, e y f en la tercera. En el HTML siguen en su
orden natural —a, b, c, d, e, f— y quien las acomoda es el CSS, con
`grid-auto-flow: column` en `.grid-3--por-columna`. Reordenar el HTML
habría sido más corto pero sólo serviría para este ancho: de 768 para
abajo la retícula pasa a dos columnas y después a una, y ahí las piezas
saldrían barajadas. Verificado: `a c e / b d f` de 768 a 1920, `a b / c d /
e f` a 600 y una sola columna a 375.

Esto reemplazó a seis imágenes que **repetían piezas del pase** —el
abecedario, los números y el "¡Siempre!"— y encima estaban recortadas de
4:5 a 3:2. Quedaron sin uso `06-pieza-a.jpg` a `09-pieza-d.jpg`,
`11-ig.jpg` y `03-letras.jpg` en `assets/images/mush-type/`. **No se
borraron.**

**Se abren en grande y se pueden mirar de cerca** (módulo 19, clases
`.visor*`). Un click amplia 2,5x, otro devuelve la pieza entera; se sale
tocando fuera, con Escape o con la cruz, que es la misma
`.lightbox__cerrar` de las cartas de remeras.

- El marco de la grilla es un **`<button>`**, no un `<div>`: es lo que se
  clickea, así que tiene que serlo también para el teclado y para un
  lector de pantalla. La clase `.fig__frame--ampliable` le devuelve las
  medidas que el navegador le pone a los botones.
- **Al pasar por encima aparece un filete naranja** de 2 px, y lo mismo al
  llegar con el teclado. Se hace con el borde que la pieza ya tiene más un
  `outline` de 1 px: subir el borde a 2 px correría la imagen un píxel y
  movería toda la fila, mientras que el outline se dibuja por fuera y no
  ocupa lugar. Verificado a 375, 768, 1366 y 1920: la pieza no se mueve ni
  un píxel al encenderse. El outline va siempre puesto y transparente para
  poder animarle el color —de `outline: none` no hay transición posible—.
- **El selector lleva los dos nombres de clase a propósito.** Hay que
  ganarle a `.fig__frame.is-loaded`, que apaga el borde una vez cargada la
  imagen (el filete gris es del placeholder, no de la pieza). Con un solo
  nombre las dos reglas empatan en especificidad y decide cuál va última
  en el archivo: alguien reordena y el hover deja de verse.
- **El desplazamiento corre el `transform-origin`, no la imagen.** Es la
  única forma de que el punto bajo el cursor se quede quieto y, a la vez,
  de no tener que calcular ningún límite: el origen va de 0% a 100% y con
  eso nunca se ve más allá del borde. Moviendo la imagen habría que acotar
  el corrimiento a mano, y ese cálculo cambia con el zoom y con cada
  proporción.
- Con el mouse alcanza con pasar por encima; con el dedo se arrastra, y
  ampliada el marco pasa a `touch-action: none` para que el gesto vertical
  no se lo lleve la página. Un arrastre de más de 10 px no cuenta como
  click, así que recorrer la imagen no la achica sin querer.
- El marco lleva su proporción real en `--ar`, que pone el JS: así el
  hueco no cambia de forma al ampliar y la imagen no tiene que elegir
  entre `contain` y `cover`.
- **La pieza grande vive aparte y se baja recién al abrir.** En la grilla
  se ve a 394 px y no tiene sentido bajar 2 MB para eso.
  `aplicaciones/grande/` son 2,2 MB: la `a` a 2400x1600 y el resto a
  1617x1080, que es su **nativo** —no se agranda ninguna—. Mientras llega
  se muestra la chica, que ya está en caché, así que no hay hueco blanco.
- **El zoom de b a f es blando y no hay cómo evitarlo:** el archivo final
  del autor mide 1617 px y a 2,5x se renderiza a unos 3700. Las de la
  carpeta padre no sirven —son los ingredientes en bruto, con otros
  recortes y proporciones—. Si alguna vez se quiere zoom nítido, hay que
  reexportarlas más grandes desde `aplicaciones.psd`. La `a` sí tiene
  resolución de sobra.
- Van los mismos tres candados contra el arrastre nativo que en el pase
  (`draggable`, `-webkit-user-drag` y `dragstart` cortado). **Probado con
  el mouse de verdad**, no con eventos sintéticos: abrir, ampliar,
  recorrer de una esquina a la otra, achicar y cerrar, con cero
  `dragstart` en todo el recorrido.

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
| .grid-3--por-columna | Llena la retícula por columna en vez de por fila. Con seis piezas quedan tres columnas de a dos y las parejas caen una debajo de la otra. Sólo desde 768: más abajo la grilla se reacomoda sola y el orden del HTML vuelve a mandar. |
| .libro-visor + .libro / .pagina / .pliegue-sombra / .pliegue-solapa | El libro interactivo de Fascículos. Cada página es un elemento que el módulo 20 ubica, recorta con clip-path y —si hace de solapa— transforma con la matriz del pliegue. Las dos sombras del pliegue miden 4x3 páginas para poder pintarse fuera del libro. La solapa va en su propia capa para que el drop-shadow no se lo coma el recorte. |
| .tapas | La fila de tapas de Fascículos: cada tapa al 80 % de su columna; al pasar el mouse crece un 7 %, se levanta con sombra y toma el filete naranja. |
| .index__pie + .index__anio | El pie del panel del índice: el "Ver más" a la izquierda y el año a la derecha, sobre la misma línea de base. El padding derecho deja libre la columna del signo, así el año cierra contra el mismo margen que la categoría. |
| .visor + .visor__marco / .visor__img / .fig__frame--ampliable | Vista grande de una imagen con lupa. Un click amplia, otro achica; el desplazamiento corre el transform-origin y por eso nunca se pasa del borde. El marco de la grilla es un botón. Lo mueve el módulo 19. |
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
| .ayuda (+ --arriba, --centro) + .ayuda__fino / .ayuda__tactil | Indicación de uso con dos textos; el CSS muestra el del puntero que hay (`hover: none, pointer: coarse`). También la usa la línea de ayuda del libro. |
| .scroll-caja + .scroll-pista + .scroll-activar | Envoltura de las ventanas con scroll de Almacenit (la pone el módulo 21): pista al pie y, con el dedo, el botón que las abre. |
| .ayuda--solo-tactil | Indicación que solo se ve con el dedo; en escritorio no ocupa lugar. La usan las tapas de Fascículos. |
| .shirt3d__gesto (+ -mano, -flecha) | La mano animada sobre el visor 3D de Remeras; se va con la primera interacción. |
| .libro-visor__textos + .libro-visor__ayuda | Título y línea de ayuda en la barra del libro. |

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
Queda **Estrella de Maldonado** entera con imágenes de relleno y textos
cortos. **Fascículos** ya está completa: texto, fotos, tapas y los tres
libros (desde sus PDF) son del autor. Las demás —Suma, Centenera, Green Eat, Cerveceros, 3 Esencias (ex
Dosel), Almacenit, Remeras y Mush— ya tienen el material real del autor.

El flujo que viene funcionando: el autor deja en la carpeta del proyecto,
dentro de `D:\Martin\PORTFOLIO WEB`, una imagen de referencia con el
diseño ya compuesto —muchas veces una captura del sitio publicado con las
piezas nuevas pegadas encima— más las piezas sueltas numeradas o con
letras. Se mide la referencia por escaneo de píxeles y se maqueta a partir
de eso. **Ojo:** esas capturas traen los rótulos viejos de la página que
se usó de fondo (así pasó con "Juego de mesa" en 3 Esencias).

### Decidido por el autor: no volver a proponer
El 10 de septiembre se le pasó al autor la lista de pendientes chicos y
respondió que **sólo había que corregir "Remeras custom"** —hecho: dice
"Remeras Delira" en todos lados— y que **el resto está bien como está**:
- El mail `martinorsain@hotmail.com`, con "orsain".
- FormSubmit.
- "SUMA" en mayúsculas en el enlace Anterior de Centenera.
- "Trabajemos juntos!" sin signo de apertura en la sección 2.
- El video de Green Eat de 61 MB.

El 15 de septiembre, después de probarlas, sacó y **no hay que volver a
proponer**:
- Botones de pausa: ni en los videos en loop, ni en la cinta de Green Eat,
  ni en los pases de Mush.
- Una indicación de uso en la cinta de Green Eat.
- La indicación de las tapas con mouse (queda solo con el dedo).

### Pendientes concretos
1. **Confirmar el orden de Paula (fascículo 03).** Hecho el 11 de
   septiembre: los tres libros salen de los PDF del autor. Falta que el
   autor confirme el reorden de las cuatro primeras páginas y que sus
   calcos quedaron en 3-4, 15-16, 25-26 y 37-38 (en el PDF, 11-12 y
   21-22). Detalle en la sección 5.
2. **Fascículos, rótulo de las fotos.** Hecho el 13 de septiembre: las
   dobles páginas de relleno se reemplazaron por las seis fotos del autor.
   Se sacó el rótulo "Fascículo 01" que traía la referencia; si el autor
   quiere uno encima de las fotos, que diga cuál.
3. **Estrella de Maldonado:** hecha el 14 de septiembre (sección 5). Quedan
   sin tocar la descripción corta y la imagen del índice
   (`indice/08-estrella.jpg`), por si el autor quiere cambiarlas.
4. **Probar con mouse real el arrastre de las hojas** del libro de
   Fascículos: en el panel de pruebas no se pudo (ver sección 10).
5. **Zoom de Aplicaciones de Mush, blando en b a f:** los archivos del
   autor miden 1617 px. Si quiere zoom nítido hay que reexportarlas más
   grandes desde `aplicaciones.psd` (3000 px alcanza). Se le ofreció.
6. **Rótulos de 3 Esencias** que puse yo: la volanta "Packaging" y el
   bloque "Los tres packagings". El autor no los objetó.
7. **La solapa de las carillas de calco** se distingue poco al plegarse
   (rosa sobre rosa). Si el autor lo pide, se le puede marcar más el borde.
8. **En mobile los dos teléfonos de Green Eat** quedan de 155 px de ancho y
   el prototipo se ve chico. Se ofreció apilarlos; sin respuesta.
9. **CV:** resuelto el 15 de septiembre, lo reemplazó el autor por uno
   nuevo (3,8 MB, una página, verificado).
10. **Peso:** `assets/` son 164 MB y `.git` 162 MB. El grueso son los
    videos (Green Eat 61 MB, Mush 29 MB). Ver la sección 9 antes de
    tocar nada.
11. **Revisar los textos de las indicaciones de uso** (sección 5,
    "Accesibilidad y uso"): los escribí yo.
12. **Probar en un teléfono de verdad** lo que el panel no deja ver: que la
    ventana de Almacenit se vuelva a cerrar al salir de pantalla, que su
    pista se vaya al recorrerla, y el aviso de Remeras con el dedo (el
    modelo no terminó de cargar en la emulación).
13. **Imágenes para mobile (srcset):** el teléfono baja las mismas de
    1800 px que el escritorio. Se ofreció y el autor no lo eligió.
14. **Los 4 GIF** (variables de Cerveceros y tres de Estrella) se mueven sin
    poder pausarse. Sin ffmpeg no hay cómo pasarlos a video.

### Archivos sin uso (unos 12 MB, **no se borraron**)
Quedaron sin ninguna referencia en HTML, CSS ni JS —verificado el 11 de
septiembre—. Borrarlos sólo si el autor lo pide.

| Archivos | Peso | Por qué |
|---|---:|---|
| `cerveceros-del-sur/01-packaging.jpg` a `13-table-tent.png` | 4,5 MB | relleno de la maqueta |
| `dosel/` entera | 1,4 MB | Dosel pasó a ser 3 Esencias |
| `indice/05-dosel.jpg` | 1,1 MB | ídem |
| `green-eat/01-card.jpg` a `08-wraps.png` | 1,5 MB | los reemplazaron el carrusel y las ilustraciones |
| `almacenit/01-home.jpg`, `02-detalle.jpg` | 980 KB | reemplazados por `home.jpg` y `detalle.jpg` |
| `remeras/01-billie.jpg` a `05-hasbulla.jpg` | 944 KB | reemplazados por las cartas |
| `mush-type/universo/01.jpg` a `10.jpg` (sueltos) | 640 KB | la selección vieja; ahora son `universo/a` y `universo/b` |
| `mush-type/06-pieza-a.jpg` a `09-pieza-d.jpg`, `11-ig.jpg`, `03-letras.jpg` | 592 KB | las Aplicaciones viejas |
| `fasciculos-editorial/01-card.jpg` a `13-spread-g.jpg` (los 13 sueltos) | ~1,3 MB | relleno de la maqueta; desde el 13 de septiembre la sección usa `fotos/` y las carpetas `fasciculo-0N/` |
| `retrato.jpg` | 208 KB | desde que se rehízo la sección 2 |

---

## 9. Problemas conocidos

- **Los dos videos pesados ya están en la historia de git.** `.git` pesa
  162 MB. Los únicos blobs grandes son `green-eat-prototipo.mp4` (60,4
  MB) y `mush-presentacion.mp4` (28,4 MB); el export de 69,4 MB de Mush
  nunca llegó a commitearse. Ojo: reexportar el de Green Eat achica el
  checkout pero **no** la historia —el blob viejo queda igual—, así que
  si en algún momento importa el tamaño del clon hay que reescribirla.
  Además GitHub avisa por archivos de más de 50 MB y rechaza los de más
  de 100.
- **Caché de GitHub Pages.** Sirve el HTML cacheado unos minutos. Si el
  autor dice "no se ve el cambio", verificar primero contra origin/main
  antes de asumir que hay un bug. Ya pasó una vez.
- **GitHub Pages puede quedarse sin reconstruir.** El 8 de septiembre
  sirvió más de una hora un build viejo con el commit ya en `origin/main`
  (se veía en la cabecera `Last-Modified`). Lo destrabó un commit vacío:
  `git commit --allow-empty -m "rebuild pages"` y push. Para saber qué
  se sirve de verdad, pedir el HTML con un parámetro al azar en la URL y
  buscar ahí el cambio.
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

1. Levantar el servidor con `preview_start`, nombre `portfolio` (puerto 8100).
2. **Medir por JavaScript, no mirar.** Alto de secciones, scrollWidth
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
6. **No usar `left_click_drag` en este panel.** Se cuelga a los 30 s y
   deja el botón del mouse apretado: los clics que siguen llegan con un
   movimiento fantasma —el final de aquel arrastre— o se cuelgan también.
   Pasó probando el libro de Fascículos. Para arrastres, eventos de
   puntero sintéticos midiendo el efecto, con los tres candados contra el
   arrastre nativo ya puestos; los clics reales, sólo en el viewport
   nativo del panel (preset desktop) y antes de cualquier arrastre.
7. **Scripts de `javascript_tool` cortos.** Aunque la herramienta corte a
   los 45 s, el script sigue corriendo en la página: sus clics se mezclan
   con los pasos siguientes y dan resultados que no se entienden.
8. **El libro de Fascículos tiene un gancho de prueba:** abriendo la
   página con `?libro-prueba`, `window.__libroPrueba.plegar(s, arriba,
   fx, fy)` congela un pliegue y `soltar()` lo deshace. Es la única forma
   de sacarle captura a un pliegue en este panel. Detalle en la sección 5.
9. Subir el ?v=.

---

## 11. Estado de verificación

**Sin pausa en los pases y mano más grande (15 de septiembre),** medido en
el DOM: se sirve `?v=99`; no queda ningún `.pausa` ni referencias a
`botonPausa` en HTML, CSS o JS; el pase de Mush sigue pasando solo (de
pieza 1 a 2 en unos 3 s). La mano mide 212x212 sobre un marco de 624x449 a
1366x630 y 150x150 sobre 327x496 en mobile, centrada al píxel y dentro del
marco en los dos; el centro sigue siendo el lienzo y se va al tocarlo. Sin
scroll horizontal, llaves balanceadas, consola sin errores.

**Retoques del 15 de septiembre,** medido en el DOM: se sirve `?v=98`;
quedan 2 botones de pausa, los dos en pases; no aparece el texto de la
cinta; la indicación de las tapas no se ve con mouse y con el dedo va
centrada, 11 px arriba de la fila. El CV responde 200 con 3.940.308 bytes,
igual que el archivo del autor. **Mano del visor 3D:** con el modelo listo
se ve, centrada al píxel sobre el lienzo, con la animación puesta y
`pointer-events: none` (el punto del centro sigue siendo el lienzo); un
pointerdown sobre el lienzo la oculta y a los 400 ms ya no está en el DOM.
En mobile también aparece y el aviso dice "Arrastrá con el dedo para
girarla, o usá los botones de abajo". El dibujo se revisó en una captura a
360 px. Sin scroll horizontal, llaves balanceadas y consola sin errores.
**No se pudo ver la animación en movimiento** (el panel no compone
cuadros).

**Accesibilidad y uso (14 de septiembre),** medido en el DOM a 1366x630 y
en emulación mobile 375x812 con dedo. Se sirve `?v=97`, 11 metas de
compartir y la imagen responde 200. Las 5 indicaciones muestran el texto
de mouse en escritorio y el de dedo en mobile. Las 10 barras tienen nombre
propio y el salto va a `#projects`. **Vistas grandes:** carta, aplicación
ampliada y libro se anuncian como `dialog` con `aria-modal` y nombre; con
cualquiera abierta, `main` y el header quedan inertes, el foco está
adentro y **siete Tab reales no salen de la carta**; al cerrar se libera
todo (0 marcados) y el foco vuelve al botón que la abrió. **Pausa:** seis
botones; la cinta queda con la misma posición durante 1,5 s en pausa y
vuelve a andar; el pase pasa de pieza cada ~3 s, en pausa se queda cinco
muestras seguidas en la misma y al reanudar sigue; el video marca
`data-pausado` y cambia la etiqueta. **Índice:** al abrir se baja 1 imagen y
las 10 al acercarse. Tocar 9 px por encima de "Ver más" y 3 px a la
izquierda de la lupa de las cartas acierta el enlace y el botón. **Mobile:**
campos a 16 px, sin scroll horizontal; la ventana de Almacenit arranca con
`overflow: hidden` y el botón (327x520, cartel de 204x38) encima, y al
tocarlo pasa a `auto`; la pista se va cuando llega el evento de scroll.
Llaves balanceadas en CSS y JS y consola sin errores. **No se pudo ver**
—el panel oculto no dispara scroll ni IntersectionObserver—: que la
ventana se cierre sola al salir de pantalla y el aviso de Remeras con el
dedo.

**Estrella, texto con imagen (14 de septiembre),** medido en el DOM: sin
la imagen del redaccional; tres párrafos con la cita recuperada y el
último con la frase nueva; el enlace abre Behance en pestaña nueva; la
foto del escudo carga a 1400x938. Texto e imagen arrancan a la misma
altura y la imagen llega al margen derecho: 605x405 a 1366, 649x435 a
1920. **El texto queda más alto que la foto:** 88 px a 1366, 63 a 1920 y
163 a 1093x504 (zoom 125 %). En mobile se apila. Sin scroll horizontal ni
errores de consola.

**Estrella de Maldonado (14 de septiembre),** medido en el DOM: las 14
piezas responden 200 con su tipo (tres `image/gif`) y cargan a su tamaño;
no queda ninguna imagen de relleno; sin scroll horizontal y sin errores de
consola. El enlace "Behance" abre la galería del proyecto en pestaña nueva.
A 1366x630, 1920x1080 y 1093x504 **las nueve filas llegan a los dos
márgenes** (56-1295, 288-1617 y 56-1022) y todas las calles, horizontales
y verticales, miden lo mismo: 29, 32 y 25 px. En mobile se apila. Dos
piezas son más altas que la pantalla del autor —la apertura (876 px a
1366) y la fila Digital (655)—: es la proporción de la referencia, igual
que en Cerveceros. **No se pudo ver** la animación de los GIF en el panel;
que animan se verificó sobre los archivos (cuadros, demoras y bucle).

**Fascículos, texto y fotos (13 de septiembre),** medido en el DOM: las
siete fotos responden 200, no queda ninguna imagen de relleno ni rótulo en
la sección, sin scroll horizontal y sin errores de consola. A 1366x630 la
caja útil va de 56 a 1295; las seis fotos miden 605x454 y llegan a los dos
márgenes; la foto 1, 605x393. **El texto queda más alto que la foto que
tiene al lado:** 503x447 a 1366 (54 px más), 26 px más a 1920 y 135 px más
a 1093x504 (zoom 125 %). La medida del texto coincide con la referencia
—36 % de la caja allá, 38-41 % acá—; lo que cambia es que el texto real es
más largo que el de relleno del montaje. Se le consultó al autor.

**Fascículos desde PDF (11 de septiembre),** medido en el DOM a 1366x630:
las 112 páginas y las tres portadas responden 200 y cargan a 1100 px; las
tres tapas miden 315x416 (0,7565) y no hay scroll horizontal; cada libro
abre con su título y su cantidad de páginas (36, 36 y 40). En Paula,
hojeando con el teclado: en 14-15 la carilla 15 es calco y deja ver la 17,
en 24-25 la 25 deja ver la 27, en 36-37 la 37 deja ver la 39, y llega a
`40 / 40` en la contratapa. En Forn y Moreno la 3 es calco y deja ver la
5. Sin errores de consola. **Lo que no se pudo ver** es cómo quedan en
pantalla: el panel estaba oculto, así que las capturas salían en blanco,
y para que las vueltas terminaran hubo que cambiar requestAnimationFrame
por un setTimeout dentro de la prueba —el panel oculto lo congela—.

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
