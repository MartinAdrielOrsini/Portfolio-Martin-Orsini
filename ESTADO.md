# Estado del proyecto — traspaso

Documento para retomar el trabajo en una conversación nueva.
Última actualización: 12 de agosto de 2026.

El `README.md` documenta **cómo funciona** el sitio. Este archivo cuenta
**dónde estamos, qué se decidió y por qué, y qué falta**.

---

## 1. Qué es

Portfolio web de **Martin Orsini**, diseñador gráfico y ayudante de
cátedra en Diseño Gráfico 3 (cátedra Belluccia, UBA / FADU).

- Sitio estático: HTML + CSS + JS vanilla. **Sin frameworks, sin build,
  sin dependencias.** Se abre con doble clic en `index.html`.
- Repo: `C:\Users\damia\OneDrive\Documents\GitHub\Portfolio-Martin-Orsini`
- Publicado en GitHub Pages: `martinadrielorsini.github.io/Portfolio-Martin-Orsini/`
- Rama `main`. Al momento de escribir esto, local y `origin` están
  sincronizados.

```
index.html          1403 líneas — estructura y contenido (14 secciones)
css/styles.css      1249 líneas — todo el estilo; config en :root
javascript/main.js   509 líneas — menú, scroll, índice, formulario
assets/images/       91 archivos, 18,7 MB
README.md                        — manual de uso y sistema visual
```

---

## 2. Cómo se trabaja acá

- **No hay servidor de desarrollo en el repo.** Para previsualizar usé un
  servidor estático de PowerShell en el puerto 8099 y `preview_start`.
  Abrir el archivo con `file://` también sirve.
- **Cache-busting manual:** el `<link>` del CSS y el `<script>` llevan
  `?v=N`. **Hay que subir ese número cada vez que se tocan estilos o JS**,
  o GitHub Pages sirve la versión cacheada. Va en `v=10`. Esto ya causó
  una confusión real: se creyó que el CSS no había subido cuando en
  realidad era caché del navegador.
- **El usuario revisa en un portátil de 1366×768** → unos **630 px
  útiles** de alto. Toda la escala está calibrada para eso. Verificar
  siempre a ese tamaño, no solo en pantallas grandes.
- El panel del navegador de la herramienta **no siempre saca capturas**
  ("not compositing frames"). Cuando pasa, se verifica midiendo el DOM
  por JavaScript. Ese método demostró ser más confiable que mirar.

---

## 3. Historia de las decisiones de diseño

El proyecto cambió de dirección visual **tres veces**. Importa saberlo
para no reproponer algo ya descartado.

| Etapa | Qué se probó | Resultado |
|---|---|---|
| 1 | Editorial claro, serif display (Instrument Serif) + Space Grotesk | Descartado: "demasiado genérico" |
| 2 | **Pizarrón**: fondo verde con textura de tiza, Archivo expandida, letra manuscrita (Caveat) | **Descartado.** Se llegó a implementar con foto de pizarra real y todo |
| 3 | **Escuela suiza** ← actual | Vigente |

**La dirección actual es suiza / bauhausiana**, definida por el usuario:
función sobre forma, blanco, retícula, mucho aire, menos es más, sans
serif tipo Helvetica, sin serifas.

Todo el rastro del pizarrón fue eliminado del código (textura, Caveat,
variables `--olive`/`--stone`/`--sage`, `background-blend-mode`). Las
imágenes de referencia originales siguen en
`D:\Martin\PORTFOLIO WEB\fondo textura*.jpg` por si alguna vez se
retoma, pero **no están en el repo**.

---

## 4. Sistema visual vigente

### Color
| Rol | Token | Valor |
|---|---|---|
| Fondo | `--bg` | `#FFFFFF` |
| Texto | `--ink` | `#111111` |
| Acento (rellenos) | `--accent` | `#DD6B0E` |
| Acento (texto sobre blanco) | `--accent-ink` | `#B0550B` |
| Bloque invertido | `--dark-bg` | `#111111` |
| Sección 2 | `.section--accent` | fondo `#DD6B0E`, **texto negro** |

Dos decisiones de contraste que conviene no revertir sin medir:

- El acento puro sobre blanco da **3,4:1** → no sirve como texto. Por eso
  existe `--accent-ink`. Sobre los bloques negros el puro rinde 5,56:1 y
  va directo: `.section--dark` redefine `--accent-ink: var(--accent)`.
- En la sección naranja el **blanco da 3,4:1 y el negro 5,56:1**. Por eso
  el texto es negro. Si se quiere blanco, hay que oscurecer bastante el
  naranja y deja de ser el color elegido.

### Tipografía
Una sola familia: **Inter** (lo más cercano a Helvetica en Google Fonts).
Stack: `'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif`.
Titulares en 700 con tracking cerrado; texto en 400. La jerarquía sale
del tamaño y del aire, nunca de cambiar de familia.

Si se quiere más fidelidad a Helvetica: licenciar Neue Haas Grotesk o
Helvetica Now, o autohospedar Nimbus Sans.

---

## 5. El hero (la parte más trabajada)

El usuario dio un mockup propio en 1920×1080 y pidió replicarlo. Los
valores **se midieron sobre esa imagen**, no se estimaron:

- **Tracking `-0.053em`.** "Portfolio" en Inter 700 mide 4,1582 em sin
  tracking; en la referencia mide 3,683 em. La diferencia repartida en
  nueve caracteres da −0,0528. El render da 3,662–3,681.
- **Cuerpo:** `min(26.5cqw, 34svh, 420px)`; `23cqw` por debajo de 700 px
  de contenedor. Se mide contra el **contenedor** (`cqw`) y no contra el
  viewport porque el `vw` incluye la barra de scroll y llegaba a cortar
  la palabra. El tope en `svh` existe porque sin él, en un portátil bajo,
  la palabra empujaba el call to action abajo del pliegue.
- **El asterisco** es el glifo `*` de Inter 700, no un dibujo. Posición
  derivada de medir la tinta en un canvas: la mancha ocupa 0,3975 de su
  em y su centro cae 0,5238 em sobre la base. De ahí
  `font-size: 1.297em`, `top: -0.328em`, `translateX(-0.281em)`.
  Coincide con la referencia dentro de **0,0004 em**.
- **Corrección de par en la erre** (`.hero__r`): con ese tracking su brazo
  se montaba sobre la te —las cuatro letras del centro salían como una
  sola mancha en el escaneo—. Lleva `margin-left: -0.036em` y
  `margin-right: 0.036em`, que se cancelan: la letra se corre sin mover
  el resto ni cambiar el ancho.
- El hero descuenta `clamp(44px, 6.5svh, 74px)` de su alto para que
  **asome la franja naranja** de la sección 2 (65 px a 1920×1010).

### El parallax
El hero es `position: sticky`, `z-index: 0`, alto fijo. Todas las demás
secciones son opacas con `z-index: 1`, así que al scrollear **suben y lo
tapan**. La sección 2 entra con un recorrido más largo y escalonado.
**No usa JavaScript**: es sticky + orden de apilado.

---

## 6. Estructura — 14 secciones

| # | Sección | id | Imgs |
|---:|---|---|---:|
| 1 | Hero | `#hero` | — |
| 2 | Presentación personal (naranja) | `#about` | 1 |
| 3 | Índice de proyectos | `#projects` | — |
| 4 | Rediseño de SUMA | `#p-suma` | 9 |
| 5 | Redes Centenera FC | `#p-centenera` | 8 |
| 6 | App Green Eat | `#p-green-eat` | 8 |
| 7 | **Cerveceros del Sur** ★ | `#p-cerveceros` | 14 |
| 8 | Dosel | `#p-dosel` | 9 |
| 9 | Fascículos editorial | `#p-fasciculos` | 9 |
| 10 | Web Almacenit | `#p-almacenit` | 3 |
| 11 | **Estrella de Maldonado** ★ | `#p-estrella` | 12 |
| 12 | Remeras custom | `#p-remeras` | 5 |
| 13 | Mush Type | `#p-mush` | 9 |
| 14 | Footer / contacto | `#contact` | — |

★ destacados: bloque negro invertido, más largos, con texto a dos
columnas.

**La sección 3 es una lista, no cards.** En desktop: lista numerada a la
izquierda, vista previa a la derecha que cambia al pasar el cursor o
tabular. En mobile la vista previa se oculta y queda solo la lista.

---

## 7. De dónde salió cada imagen

Todas las imágenes son **trabajos reales** del usuario, rastreados en
`D:\Martin`. Las carpetas de `D:\Martin\PORTFOLIO WEB` estaban vacías;
el material estaba disperso en las carpetas de la carrera.

| Proyecto | Origen |
|---|---|
| SUMA | `Quinto año / DG4 / TP2 MARCA` |
| Centenera FC | `D:\Martin\centenera` + `segundo torneo` |
| Green Eat | `Cuarto año / Disenio 3 / tp3 disenio ux ui / UI` |
| Cerveceros del Sur | `Quinto año / DG4 / TP5 BEHANCE` |
| Dosel | `Sexto año / DJPDM` |
| Fascículos | `Quinto año / Disenio Grafico Editorial / tp3` |
| Almacenit | `Cuarto año / Disenio 3 / tp2 disenio web` |
| Estrella de Maldonado | `Quinto año / Disenio de identidad institucional` |
| Remeras | `OTROS / portfolio / Diseño Remera` |
| Mush Type | `Sexto año / tipomov` |
| Retrato | `D:\Martin\CV\foto cv.jpg` |

Todas fueron redimensionadas y recomprimidas (calidad 82, lado mayor
según el hueco).

---

## 8. Qué falta

### Bloqueantes para publicar en serio
1. **Email** — buscar `hola@tudominio.com` en `index.html`. Aparece en el
   `mailto:`, en el botón de copiar y en el footer.
2. **Redes** — los cuatro `href="#"` de la sección de contacto
   (Instagram, Behance, LinkedIn, CV).

### Contenido a revisar
3. **Los textos de los casos están redactados mirando las piezas, no los
   briefs reales.** Cliente, año y rol son la mejor lectura posible de
   las imágenes, no datos confirmados. **Hay que revisarlos uno por uno.**
4. **Green Eat** — en la carpeta de origen no hay capturas de pantallas de
   la app, solo el sistema de ilustración, tres boards de onboarding y
   recortes de producto. La sección se armó con eso. Si aparecen las
   pantallas exportadas, van a `assets/images/green-eat/`.
5. **Fascículos editorial** — las imágenes son del libro fotográfico de
   `Editorial / tp3`, el único editorial con JPG finales. Si "Fascículos"
   es otro TP, sus entregas están solo en PDF y hacen falta exportaciones.
6. **Nombre del libro editorial** — quedó titulado por su contenido porque
   no se encontró un título en las dobles páginas.

### Deuda técnica menor
7. El formulario de contacto **valida pero no envía**. El README explica
   cómo conectarlo a Formspree en tres pasos.
8. La sección 2 y el índice quedaron en ~1,0 pantallas cada una. Si se
   quiere más aire, subir `--section-y`; si se quiere que entren más
   ajustadas, bajarlo.

---

## 9. Problemas conocidos

- **Caché de GitHub Pages.** Ya explicado: subir el `?v=N`. Si el usuario
  reporta que "no se ve el cambio", **verificar primero contra
  `origin/main` con `git show origin/main:css/styles.css` antes de asumir
  que hay un bug.**
- **El botón de copiar email nunca se probó con un clic real.** El
  entorno de automatización deniega el permiso de portapapeles y no se
  logró emitir un clic confiable. El handler está cableado y la rama de
  respaldo (`execCommand` + mensaje de error visible) sí se verificó.
  **Probarlo a mano en un navegador real.**
- **Falsos negativos al medir.** El panel del navegador congela
  `requestAnimationFrame` y los `IntersectionObserver` cuando no está
  pintando. Eso hace que el resaltado de navegación y los fade-in
  parezcan rotos cuando no lo están. Forzar un frame antes de medir.
- **Partir texto en spans desactiva el kerning** en esos límites. La
  corrección de la erre achicó la palabra 0,5% por eso. Es esperable.
- **PowerShell 5.1 lee los `.ps1` como ANSI.** Rutas con eñe o acentos en
  un script fallan; conviene resolverlas con comodín
  (`Carrera - Quinto a*o`) o pasarlas como parámetro.

---

## 10. Cómo verificar un cambio

Lo que se usó en toda la sesión, por si sirve de guía:

1. Levantar el servidor estático y abrir con `preview_start`.
2. Medir por JavaScript en vez de mirar: alto de secciones contra
   `innerHeight - header`, `scrollWidth > innerWidth` para overflow,
   imágenes con `naturalWidth === 0` para 404, anclas rotas.
3. **Contraste con composición de alfa**, recorriendo el DOM y comparando
   cada texto contra el fondo real que tiene detrás. Esto encontró
   varios fallos que no se veían.
4. Verificar a **1366×630** (el portátil del usuario), 375 y 1920.
5. Chequear balance de llaves en CSS y JS después de editar con scripts.

Estado en la última verificación: 14 secciones · 91 imágenes, cero
fallidas · cero 404 · cero enlaces rotos · **cero textos por debajo de
AA** · sin overflow horizontal.
