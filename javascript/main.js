/* ============================================================
   PORTFOLIO — JAVASCRIPT
   Módulos:
     1. Marca de JS activo · dónde abre la página
     2. Placeholders de imágenes
     3. Header (sombra al hacer scroll)
     4. Menú mobile
     5. Scroll suave y offset del header
     6. Enlace activo en la navegación
     7. Reveal al entrar en viewport
     8. Puntos del carrusel del índice
     9. Copiar email
    10. Validación del formulario
    11. Año del copyright
    12. Pantalla de carga
    13. El asterisco del hero (baja y gira con el scroll)
    14. Videos en loop
    15. Carrusel de pantallas (cinta continua, sin extremos)
    16. Visor 3D de remeras (WebGL a mano, sin libreria)
    17. Cartas de remeras (giro y vista grande)
    18. Pase de imagenes (avanza solo, con barra de progreso)
   Vanilla ES6+. Sin dependencias.
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


  /* ==========================================================
     1 — MARCA DE JS ACTIVO
     Los estados iniciales del reveal solo existen bajo .js, así
     que sin JavaScript la página se ve completa igual.
     ========================================================== */
  document.documentElement.classList.add('js');


  /* ==========================================================
     1b — DÓNDE ABRE LA PÁGINA
     Por defecto el navegador devuelve el scroll a donde estabas la
     última vez (history.scrollRestoration = 'auto'). En un sitio de
     una sola página eso hace que "entrar" te deje en medio de los
     proyectos en vez de en la portada: pasaba en el celular, sin
     ancla en la URL. Con 'manual' abre siempre arriba.

     Las anclas siguen funcionando igual: si la URL trae #algo, no se
     toca nada y el navegador salta a esa sección como siempre.
     ========================================================== */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  (function abrirEnLaPortada() {
    // Si el usuario ya empezó a scrollear mientras cargaba, no se le
    // arrebata la página de las manos.
    let tocado = false;
    const marcar = () => { tocado = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) => {
      window.addEventListener(ev, marcar, { passive: true, once: true });
    });

    const alTope = () => {
      if (tocado || window.location.hash || !window.scrollY) return;
      window.scrollTo(0, 0);
    };

    alTope();
    // El navegador puede restaurar después de este script: se reintenta
    // al terminar de cargar y un instante más tarde, porque Safari en
    // iOS lo hace incluso después del load.
    window.addEventListener('load', () => {
      alTope();
      window.setTimeout(alTope, 250);
    });

    // Caso aparte: volver con "atrás" o recuperar la pestaña al reabrir
    // el navegador. Ahí la página sale de la caché de sesión ya armada y
    // con su scroll puesto, así que scrollRestoration ni se consulta;
    // el único aviso es pageshow con persisted en true.
    window.addEventListener('pageshow', (e) => {
      if (e.persisted && !window.location.hash) window.scrollTo(0, 0);
    });
  })();


  /* ==========================================================
     2 — PLACEHOLDERS DE IMÁGENES
     Mientras el archivo real no exista en /images, la <img>
     falla y se oculta: queda el placeholder diseñado del marco.
     Al soltar la imagen real aparece sola, sin tocar el layout.
     ========================================================== */
  function initImageFallbacks() {
    const images = $$('.fig__frame img');

    const markMissing = (img) => {
      img.classList.add('is-missing');
      if (img.parentElement) img.parentElement.classList.remove('is-loaded');
    };

    // Con la imagen cargada se apaga el placeholder del marco: si no, la
    // trama se vería por detrás de los PNG con transparencia.
    const markLoaded = (img) => {
      img.classList.remove('is-missing');
      if (img.parentElement) img.parentElement.classList.add('is-loaded');
    };

    images.forEach((img) => {
      img.addEventListener('error', () => markMissing(img));
      img.addEventListener('load', () => {
        if (img.naturalWidth > 0) markLoaded(img);
      });

      // La imagen puede haberse resuelto antes de que corriera este script.
      if (img.complete) {
        if (img.naturalWidth === 0) markMissing(img);
        else markLoaded(img);
      }
    });
  }


  /* ==========================================================
     3 — HEADER
     ========================================================== */
  function initHeader() {
    const header = $('#siteHeader');
    if (!header) return;

    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }


  /* ==========================================================
     4 — MENÚ MOBILE
     ========================================================== */
  function initMobileMenu() {
    const toggle   = $('#menuToggle');
    const nav      = $('#primaryNav');
    const backdrop = $('#navBackdrop');
    if (!toggle || !nav) return;

    const desktop = window.matchMedia('(min-width: 1024px)');

    const open = () => {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      if (backdrop) {
        backdrop.hidden = false;
        // Un frame de espera para que la transición de opacidad se vea.
        requestAnimationFrame(() => backdrop.classList.add('is-visible'));
      }
    };

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      if (backdrop) {
        backdrop.classList.remove('is-visible');
        window.setTimeout(() => { backdrop.hidden = true; }, 320);
      }
    };

    const isOpen = () => nav.classList.contains('is-open');

    toggle.addEventListener('click', () => (isOpen() ? close() : open()));
    if (backdrop) backdrop.addEventListener('click', close);

    // Al elegir una sección, el menú se cierra solo.
    $$('.nav__link', nav).forEach((link) => {
      link.addEventListener('click', () => { if (isOpen()) close(); });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        close();
        toggle.focus();
      }
    });

    // Si se pasa a desktop con el menú abierto, se limpia el estado.
    const onBreakpoint = (e) => { if (e.matches && isOpen()) close(); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else desktop.addListener(onBreakpoint); // Safari viejo
  }


  /* ==========================================================
     5 — SCROLL SUAVE + OFFSET DEL HEADER
     El scroll suave lo hace CSS (scroll-behavior). Acá solo se
     mantiene actualizado el scroll-margin-top de las secciones
     para que el header sticky no tape los títulos.
     ========================================================== */
  function initScrollOffset() {
    const header   = $('#siteHeader');
    const sections = $$('main section[id]');
    if (!header || !sections.length) return;

    const apply = () => {
      const offset = header.offsetHeight + 8;
      sections.forEach((s) => { s.style.scrollMarginTop = offset + 'px'; });
    };

    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('load', apply);

    /* El hero es la excepción y necesita ir a mano.
       Al ser sticky, mientras está pegado su borde superior queda
       siempre a la altura del header, así que el navegador lo da por
       visible y al pulsar un enlace a #hero no scrollea: cambia el
       hash y te deja donde estabas. Le pasaba a los cuatro enlaces que
       apuntan ahí —la marca, "Inicio", "Volver arriba" y el salto de
       accesibilidad—. El destino real es el principio del documento. */
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#hero"]');
      if (!link || e.defaultPrevented) return;
      // Se respetan los clics con modificador (abrir en otra pestaña).
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
      });
      // El hash se actualiza igual que lo haría el navegador, pero
      // después de decidir nosotros el destino.
      if (window.history && history.pushState) history.pushState(null, '', '#hero');
    });
  }


  /* ==========================================================
     6 — ENLACE ACTIVO EN LA NAVEGACIÓN
     Las secciones de proyectos y playground marcan "Proyectos".
     ========================================================== */
  function initActiveNav() {
    const links = $$('.nav__link');
    const sections = $$('main section[id]');
    const header = $('#siteHeader');
    if (!links.length || !sections.length) return;

    const groupOf = (id) => {
      if (id === 'hero') return '#hero';
      if (id === 'about') return '#about';
      if (id === 'contact') return '#contact';
      return '#projects'; // projects y todas las secciones p-*
    };

    let currentHash = null;
    let ticking = false;

    const setActive = (hash) => {
      if (hash === currentHash) return;
      currentHash = hash;
      links.forEach((l) => {
        l.classList.toggle('is-active', l.getAttribute('href') === hash);
      });
    };

    // Las secciones de proyecto son bastante más altas que la pantalla,
    // así que comparar porcentajes visibles no sirve: se toma la última
    // sección cuyo inicio ya cruzó la línea de lectura.
    const update = () => {
      ticking = false;

      const line = (header ? header.offsetHeight : 0) + window.innerHeight * 0.28;
      let currentId = sections[0].id;

      sections.forEach((s) => {
        if (s.getBoundingClientRect().top <= line) currentId = s.id;
      });

      // Al final de la página gana siempre la última sección, aunque su
      // inicio no llegue a cruzar la línea.
      const atBottom = window.innerHeight + window.scrollY >=
                       document.documentElement.scrollHeight - 2;
      if (atBottom) currentId = sections[sections.length - 1].id;

      setActive(groupOf(currentId));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }


  /* ==========================================================
     7 — REVEAL AL ENTRAR EN VIEWPORT
     ========================================================== */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    // Sin IntersectionObserver o con movimiento reducido: todo visible.
    if (!('IntersectionObserver' in window) || prefersReducedMotion.matches) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // una sola vez
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((el) => observer.observe(el));

    // Si el usuario activa "reducir movimiento" a mitad de camino.
    const onChange = (e) => {
      if (e.matches) items.forEach((el) => el.classList.add('is-visible'));
    };
    if (prefersReducedMotion.addEventListener) prefersReducedMotion.addEventListener('change', onChange);
    else prefersReducedMotion.addListener(onChange);
  }


  /* ==========================================================
     8 — ÍNDICE DE PROYECTOS
     Acordeón: cada ítem abre un panel con una descripción breve y
     un "Ver más" que sí lleva al caso. Siempre hay exactamente uno
     abierto —nunca ninguno—, así la vista previa de la derecha no
     se queda sin nada que mostrar y la sección nunca se ve vacía.

     En desktop, además, la imagen de la derecha se adelanta al pasar
     el cursor: es un vistazo, no una selección. Al sacar el mouse
     vuelve la del ítem abierto. En mobile no hay vista previa al
     costado y la imagen la muestra el propio panel.
     ========================================================== */
  function initProjectIndex() {
    const list = $('#indexList');
    if (!list) return;

    const rows = $$('.index__row', list);
    if (!rows.length) return;

    const preview = $('#indexPreview');
    const img     = $('#indexPreviewImg');

    const btnDe = (row) => $('.index__item', row);
    let abierta = rows.find((r) => r.classList.contains('is-open')) || rows[0];
    let pintada = btnDe(abierta);          // qué imagen está puesta ahora

    // --- Vista previa de la derecha (sólo desktop) -----------------
    const pintar = (btn) => {
      if (!preview || !img || !btn || btn === pintada) return;
      pintada = btn;

      const destino = btn.dataset.href;
      if (destino) preview.setAttribute('href', destino);

      const src = btn.dataset.img;
      if (!src || img.getAttribute('src') === src) return;

      // Cambio con un fundido corto en vez de un salto seco.
      preview.classList.add('is-swapping');
      const listo = () => {
        img.removeEventListener('load', listo);
        img.removeEventListener('error', listo);
        preview.classList.remove('is-swapping');
      };
      img.addEventListener('load', listo);
      img.addEventListener('error', listo);
      img.setAttribute('src', src);
      img.setAttribute('alt', btn.dataset.alt || '');
      // Si viene de caché no dispara load, así que se destraba igual.
      if (img.complete) listo();
    };

    // --- Abrir / cerrar --------------------------------------------
    const cerrar = (row) => {
      row.classList.remove('is-open');
      btnDe(row).setAttribute('aria-expanded', 'false');
      // Un panel cerrado no debe ser tabulable: su "Ver más" quedaría
      // en el orden de foco sin verse.
      const panel = $('.index__panel', row);
      if (panel) panel.inert = true;
    };

    const abrir = (row) => {
      if (row === abierta) return;
      cerrar(abierta);
      row.classList.add('is-open');
      btnDe(row).setAttribute('aria-expanded', 'true');
      const panel = $('.index__panel', row);
      if (panel) panel.inert = false;
      abierta = row;
      pintar(btnDe(row));
    };

    // Estado inicial: el primero abierto, el resto cerrados e inertes.
    rows.forEach((r) => { if (r !== abierta) cerrar(r); });
    const panelAbierto = $('.index__panel', abierta);
    if (panelAbierto) panelAbierto.inert = false;
    btnDe(abierta).setAttribute('aria-expanded', 'true');

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.index__item');
      if (btn && list.contains(btn)) abrir(btn.parentElement);
    });

    // La imagen cambia SÓLO al hacer click. Antes también se adelantaba
    // al pasar el cursor, pero eso dejaba la vista previa mostrando algo
    // distinto del ítem abierto: el costado dejaba de ser el reflejo de
    // la selección y pasaba a seguir al mouse.

    // Precarga silenciosa: al abrir un ítem la imagen ya está lista.
    const precargar = () => rows.forEach((r) => {
      const src = btnDe(r).dataset.img;
      if (src) { const p = new Image(); p.src = src; }
    });
    if ('requestIdleCallback' in window) window.requestIdleCallback(precargar);
    else window.setTimeout(precargar, 1200);
  }


  /* ==========================================================
     9 — COPIAR EMAIL
     navigator.clipboard con fallback para contextos no seguros
     (por ejemplo, abrir el index.html con file://).
     ========================================================== */
  function initCopyEmail() {
    const button = $('#copyEmail');
    const label  = $('#copyEmailLabel');
    const status = $('#copyStatus');
    if (!button) return;

    const email = button.dataset.email || '';
    let resetTimer = null;

    const feedback = (ok) => {
      if (label) label.textContent = ok ? 'Copiado' : 'Copiar';
      button.classList.toggle('is-done', ok);
      if (status) {
        status.textContent = ok
          ? 'Email copiado al portapapeles.'
          : 'No se pudo copiar. Seleccionalo a mano, por favor.';
      }

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        if (label) label.textContent = 'Copiar';
        button.classList.remove('is-done');
        if (status) status.textContent = '';
      }, 2600);
    };

    // Fallback para navegadores viejos o páginas servidas sin HTTPS.
    const legacyCopy = (text) => {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.top = '-1000px';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();

      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }

      document.body.removeChild(field);
      return ok;
    };

    button.addEventListener('click', () => {
      if (!email) return;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email)
          .then(() => feedback(true))
          .catch(() => feedback(legacyCopy(email)));
      } else {
        feedback(legacyCopy(email));
      }
    });
  }


  /* ==========================================================
     10 — VALIDACIÓN DEL FORMULARIO
     Validación básica en cliente. No hay backend: al validar
     correctamente se muestra una confirmación.
     Para recibir los mensajes de verdad, agregá action y method
     al <form> (Formspree, Basin, Netlify Forms, etc.) y sacá el
     e.preventDefault() del final.
     ========================================================== */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const status = $('#formStatus');

    const fields = [
      {
        input: $('#fName'),
        error: $('#errName'),
        validate: (v) => {
          if (!v) return 'Escribí tu nombre.';
          if (v.length < 2) return 'El nombre es demasiado corto.';
          return '';
        }
      },
      {
        input: $('#fEmail'),
        error: $('#errEmail'),
        validate: (v) => {
          if (!v) return 'Necesito un email para responderte.';
          if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return 'Ese email no parece válido.';
          return '';
        }
      },
      {
        input: $('#fMessage'),
        error: $('#errMessage'),
        validate: (v) => {
          if (!v) return 'Contame algo, aunque sea corto.';
          if (v.length < 10) return 'Un poco más de detalle, por favor.';
          return '';
        }
      }
    ].filter((f) => f.input && f.error);

    const check = (field) => {
      const message = field.validate(field.input.value.trim());
      field.error.textContent = message;
      field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    };

    fields.forEach((field) => {
      // Primero al salir del campo; después, en vivo mientras se corrige.
      field.input.addEventListener('blur', () => check(field));
      field.input.addEventListener('input', () => {
        if (field.input.getAttribute('aria-invalid') === 'true') check(field);
      });
    });

    /* Envío real. El destino sale del action del <form>: si algún día se
       cambia de servicio, se toca ahí y nada más. Se manda por fetch en
       vez de dejar que el navegador haga el POST para no perder la página
       ni el mensaje de estado; sin JavaScript el form postea solo y el
       servicio responde con su propia pantalla de gracias. */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let firstInvalid = null;
      fields.forEach((field) => {
        const ok = check(field);
        if (!ok && !firstInvalid) firstInvalid = field.input;
      });

      if (firstInvalid) {
        if (status) {
          status.textContent = 'Revisá los campos marcados.';
          status.classList.remove('is-ok');
        }
        firstInvalid.focus();
        return;
      }

      const limpiar = () => {
        form.reset();
        fields.forEach((field) => {
          field.error.textContent = '';
          field.input.setAttribute('aria-invalid', 'false');
        });
      };

      const destino = form.getAttribute('action');
      if (!destino) {
        // Sin servicio configurado: se comporta como antes, sólo validando.
        if (status) {
          status.textContent = '¡Gracias! Tu mensaje quedó listo para enviarse.';
          status.classList.add('is-ok');
        }
        limpiar();
        return;
      }

      const boton = form.querySelector('button[type="submit"]');
      if (boton) boton.disabled = true;
      if (status) {
        status.textContent = 'Enviando…';
        status.classList.remove('is-ok');
      }

      try {
        const r = await fetch(destino.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        if (status) {
          status.textContent = '¡Gracias! Tu mensaje llegó. Te respondo a la brevedad.';
          status.classList.add('is-ok');
        }
        limpiar();
      } catch (err) {
        // Que nunca quede en la nada: si el envío falla, se ofrece el mail.
        if (status) {
          status.textContent = 'No se pudo enviar. Escribime directo a martinorsain@hotmail.com';
          status.classList.remove('is-ok');
        }
      } finally {
        if (boton) boton.disabled = false;
      }
    });
  }


  /* ==========================================================
     11 — AÑO DEL COPYRIGHT
     ========================================================== */
  function initYear() {
    const el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }


  /* ==========================================================
     12 — PANTALLA DE CARGA
     Se va cuando termina de cargar la página. Al final se saca
     del árbol: aunque quede invisible, su fondo opaco seguiría
     puesto por encima de todo.
     ========================================================== */
  function initLoader() {
    const loader = $('#loader');
    if (!loader) return;

    let cerrado = false;
    const cerrar = () => {
      if (cerrado) return;
      cerrado = true;
      loader.classList.add('is-done');
      window.setTimeout(() => loader.remove(), 600);
    };

    if (document.readyState === 'complete') cerrar();
    else window.addEventListener('load', cerrar);

    // Red de seguridad: si una imagen o la tipografía nunca terminan,
    // el evento load no llega y la pantalla taparía el sitio para
    // siempre. Seis segundos es el techo.
    window.setTimeout(cerrar, 6000);
  }


  /* ==========================================================
     13 — EL ASTERISCO DEL HERO
     Al scrollear se descuelga: baja en vertical mientras gira en
     sentido horario, hasta esconderse debajo de la sección 2.

     Sólo se mueve en Y. El tope de arriba es su posición de
     reposo y el de abajo, el borde inferior del hero: como el
     hero es sticky con z-index 0 y la sección 2 es opaca y va en
     z-index 1, al pasar ese borde el asterisco queda tapado. No
     hace falta ocultarlo a mano.

     El recorrido se mide, no se estima, y se recalcula al cambiar
     el tamaño de la ventana. La escritura va dentro de un
     requestAnimationFrame para no tocar estilos en cada evento de
     scroll.
     ========================================================== */
  function initHeroMark() {
    const mark   = $('.hero__mark');
    const hero   = $('#hero');
    const sec2   = $('#about');
    const header = $('#siteHeader');
    if (!mark || !hero || !sec2) return;

    const GIRO = 540;          // grados en todo el recorrido
    let recorrido = 0;         // px que baja el asterisco
    let tramo = 1;             // px de scroll en los que sucede
    let yActual = 0;
    let pedido = false;

    const pintar = () => {
      pedido = false;
      const p = Math.min(1, Math.max(0, window.scrollY / tramo));

      /* Apagar el hero cuando ya está tapado. Es sticky durante toda la
         página, así que sin esto se sigue repintando detrás de cada
         sección y en mobile a veces se cuela por encima. En p >= 1 la
         sección 2 lo cubrió por completo: a partir de ahí no hay nada
         que mostrar. */
      hero.classList.toggle('is-covered', p >= 1);

      if (prefersReducedMotion.matches) {
        yActual = 0;
        mark.style.setProperty('--ast-y', '0px');
        mark.style.setProperty('--ast-r', '0deg');
        return;
      }
      yActual = p * recorrido;
      mark.style.setProperty('--ast-y', yActual.toFixed(2) + 'px');
      mark.style.setProperty('--ast-r', (p * GIRO).toFixed(2) + 'deg');
    };

    const medir = () => {
      // El asterisco puede estar corrido en este momento: se le resta
      // lo que ya bajó para recuperar su posición de reposo, en vez de
      // ponerlo en cero y provocar un salto visible.
      const m = mark.getBoundingClientRect();
      const h = hero.getBoundingClientRect();
      recorrido = Math.max(0, h.bottom - (m.top - yActual));
      const sec2Top = sec2.getBoundingClientRect().top + window.scrollY;
      tramo = Math.max(1, sec2Top - (header ? header.offsetHeight : 0));
      pintar();
    };

    const alScrollear = () => {
      if (pedido) return;
      pedido = true;
      window.requestAnimationFrame(pintar);
    };

    window.addEventListener('scroll', alScrollear, { passive: true });
    window.addEventListener('resize', medir);
    // Las medidas cambian cuando entra la tipografía: el cuerpo del
    // titular manda el tamaño y la posición del asterisco.
    window.addEventListener('load', medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener('change', pintar);
    }
    medir();
  }


  /* ==========================================================
     14 — VIDEOS EN LOOP
     Piezas que se reproducen solas, sin controles. El archivo no
     se baja al abrir la página: el src vive en data-src y se pone
     recién cuando la pieza está por entrar en pantalla. Cuando
     sale, se pausa —no tiene sentido decodificar video que nadie
     está mirando—.

     Con prefers-reduced-motion no arranca nunca: queda el poster,
     que es el primer cuadro.
     ========================================================== */
  function initLoopVideos() {
    const videos = $$('video[data-src]');
    if (!videos.length) return;

    const cargar = (v) => {
      if (v.dataset.cargado) return;
      v.dataset.cargado = '1';
      v.src = v.dataset.src;
    };

    const arrancar = (v) => {
      if (prefersReducedMotion.matches) return;
      cargar(v);
      const p = v.play();
      // Si el navegador rechaza el autoplay, no hay nada que romper:
      // queda el poster puesto.
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    if (!('IntersectionObserver' in window)) {
      videos.forEach(arrancar);
      return;
    }

    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) arrancar(e.target);
        else if (e.target.dataset.cargado) e.target.pause();
      });
    }, { rootMargin: '200px 0px' });

    videos.forEach((v) => obs.observe(v));

    // Si el usuario cambia la preferencia de movimiento en caliente
    const onMQ = () => {
      videos.forEach((v) => { if (prefersReducedMotion.matches) v.pause(); });
    };
    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener('change', onMQ);
    }
  }


  /* ==========================================================
     15 — CARRUSEL DE PANTALLAS
     Una cinta que no tiene extremos: al llegar al final vuelve a
     empezar, y hacia atras lo mismo. No hay "primera" ni "ultima"
     imagen, asi que tampoco hay rebote ni tope.

     Como funciona. El juego de imagenes del HTML se clona las veces
     que hagan falta para que el track sea mas ancho que la ventana
     mas una vuelta entera. Despues se mueve por transform y la
     posicion se envuelve con un modulo sobre el ancho de una vuelta:
     cuando x llega a ese ancho vuelve a 0, y como en ese punto lo que
     se ve es identico, el salto no se nota. Es la razon por la que no
     se usa scroll nativo: con overflow-x el salto se ve y ademas
     pelea con el gesto.

     La velocidad es una sola variable (px por milisegundo) que ademas
     absorbe el arrastre: al soltar, el impulso del gesto se va
     apagando hasta volver solo a la velocidad de crucero. Por eso la
     cinta nunca se detiene.

     Con prefers-reduced-motion la velocidad de crucero es cero: no se
     mueve sola, pero se puede arrastrar y sigue sin extremos.
     ========================================================== */
  function initCarousels() {
    const carruseles = $$('[data-carousel]');
    if (!carruseles.length) return;

    carruseles.forEach(armar);

    function armar(carousel) {
      const track = $('.carousel__track', carousel);
      if (!track) return;

      const originales = Array.from(track.children);
      if (!originales.length) return;

      /* Velocidad de crucero, en px por milisegundo. 0.045 son unos
         45 px/s: a esta escala una pantalla entra cada cuatro segundos
         y la vuelta completa dura cerca de minuto y medio. */
      const VEL_CRUCERO = 0.045;

      let ancho = 0;          /* lo que mide una vuelta, con su gap */
      let x = 0;              /* posicion dentro de la vuelta */
      let v = 0;              /* velocidad actual */
      let raf = 0;
      let corriendo = false;
      let arrastrando = false;
      let cargadas = false;
      let ultimo = 0;
      let xInicio = 0, pInicio = 0, pUltimo = 0, tUltimo = 0, vArrastre = 0;

      const objetivo = () => (prefersReducedMotion.matches ? 0 : VEL_CRUCERO);
      const envolver = (n) => (ancho > 0 ? ((n % ancho) + ancho) % ancho : 0);

      /* --- Construccion y medida ---------------------------------
         Se rehace entera en cada resize: el ancho de las piezas sale
         de su alto, y el alto esta en svh. */
      function juego() {
        const frag = document.createDocumentFragment();
        originales.forEach((n) => {
          const c = n.cloneNode(true);
          /* Los clones son la misma imagen repetida: para un lector de
             pantalla serian veintiun repeticiones de la lista. */
          c.setAttribute('aria-hidden', 'true');
          frag.appendChild(c);
        });
        track.appendChild(frag);
      }

      function medir() {
        track.replaceChildren.apply(track, originales);

        /* Un juego clonado alcanza para saber cuanto mide la vuelta:
           es la distancia entre una pieza y su copia. Medido asi entra
           el gap sin tener que leerlo del computed style. */
        juego();
        ancho = track.children[originales.length].offsetLeft -
                track.children[0].offsetLeft;
        if (!(ancho > 0)) return false;

        /* Hay que cubrir la ventana mas una vuelta entera, porque la
           posicion se mueve dentro de esa vuelta: en el peor caso se
           ve desde el final de la vuelta hasta una ventana mas alla.

           El ancho de referencia no puede salir solo del contenedor:
           si se mide antes de que el layout este resuelto viene en
           cero y la cinta queda corta. El de la ventana nunca lo es. */
        const visible = Math.max(carousel.clientWidth,
                                 document.documentElement.clientWidth || 0);
        const falta = ancho + visible;

        /* El tope es una red de seguridad: con ancho > 0 cada vuelta
           suma, asi que el bucle siempre termina solo. */
        let vueltas = 0;
        while (track.scrollWidth < falta && vueltas < 12) {
          juego();
          vueltas++;
        }

        return true;
      }

      function pintar() {
        track.style.transform = 'translate3d(' + (-x) + 'px, 0, 0)';
      }

      /* --- El bucle ---------------------------------------------- */
      function frame(t) {
        if (!ultimo) ultimo = t;
        let dt = t - ultimo;
        ultimo = t;
        /* Volver de una pestaña en segundo plano no puede dar un salto
           de varios segundos de recorrido. */
        if (dt > 100) dt = 100;

        if (!arrastrando) {
          /* Convergencia hacia la velocidad de crucero, independiente
             de los fps: a mas dt, mas parte del camino se recorre. */
          v += (objetivo() - v) * (1 - Math.exp(-dt / 260));
          x = envolver(x + v * dt);
        }

        pintar();
        raf = requestAnimationFrame(frame);
      }

      function arrancar() {
        if (corriendo) return;
        corriendo = true;
        ultimo = 0;
        raf = requestAnimationFrame(frame);
      }

      function parar() {
        if (!corriendo) return;
        corriendo = false;
        cancelAnimationFrame(raf);
      }

      /* --- Arrastre ----------------------------------------------
         El impulso no se frena de golpe: se guarda como velocidad y el
         bucle lo lleva de vuelta al crucero. */
      carousel.addEventListener('pointerdown', (e) => {
        if (e.button > 0) return;
        arrastrando = true;
        carousel.classList.add('is-dragging');
        xInicio = x;
        pInicio = pUltimo = e.clientX;
        tUltimo = e.timeStamp;
        vArrastre = 0;
        v = 0;
        /* La captura es una mejora —permite seguir el gesto fuera del
           elemento—, no un requisito: si el puntero ya no existe tira
           excepcion y no puede llevarse el arrastre puesto con ella. */
        try { carousel.setPointerCapture(e.pointerId); } catch (err) {}
      });

      carousel.addEventListener('pointermove', (e) => {
        if (!arrastrando) return;
        const dt = Math.max(1, e.timeStamp - tUltimo);
        vArrastre = -(e.clientX - pUltimo) / dt;
        pUltimo = e.clientX;
        tUltimo = e.timeStamp;
        x = envolver(xInicio - (e.clientX - pInicio));
      });

      const soltar = () => {
        if (!arrastrando) return;
        arrastrando = false;
        carousel.classList.remove('is-dragging');
        /* Con movimiento reducido la cinta se queda exactamente donde la
           soltaron: la inercia tambien es movimiento que nadie pidio. */
        if (prefersReducedMotion.matches) { v = 0; return; }
        /* Un flick muy rapido no puede mandar la cinta a otra galaxia */
        v = Math.max(-2.5, Math.min(2.5, vArrastre));
      };

      carousel.addEventListener('pointerup', soltar);
      carousel.addEventListener('pointercancel', soltar);
      carousel.addEventListener('lostpointercapture', soltar);

      /* Rueda horizontal, para trackpads. El gesto vertical no se
         toca: ese es el de la pagina. */
      carousel.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        x = envolver(x + e.deltaX);
        v = 0;
      }, { passive: false });

      /* --- Carga de las imagenes ---------------------------------
         Vienen en lazy para no bajar 1,2 MB al abrir la pagina. Pero
         dentro de un overflow hidden el navegador no siempre las ve
         venir y apareceria un hueco a mitad del recorrido, asi que
         cuando la cinta esta por entrar en pantalla se fuerzan. */
      function cargar() {
        if (cargadas) return;
        cargadas = true;
        $$('img', track).forEach((img) => { img.loading = 'eager'; });
      }

      /* --- Puesta en marcha -------------------------------------- */
      if (!medir()) return;
      pintar();

      let pendiente = 0;
      const remedir = () => {
        clearTimeout(pendiente);
        pendiente = setTimeout(() => {
          const anterior = ancho;
          const frac = anterior > 0 ? x / anterior : 0;
          if (medir()) {
            x = envolver(frac * ancho);   /* se conserva el punto de la vuelta */
            pintar();
          }
        }, 150);
      };

      if ('ResizeObserver' in window) {
        new ResizeObserver(remedir).observe(carousel);
      } else {
        window.addEventListener('resize', remedir);
      }

      /* El armado corre en DOMContentLoaded, cuando la tipografia y las
         imagenes todavia pueden mover las medidas. Una pasada mas al
         terminar la carga sale barata y deja la cinta bien provista. */
      if (document.readyState !== 'complete') {
        window.addEventListener('load', remedir, { once: true });
      }

      /* Fuera de pantalla no hay nada que mirar: el bucle se corta para
         no gastar bateria. Al volver retoma donde estaba. */
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entradas) => {
          entradas.forEach((en) => {
            if (en.isIntersecting) { cargar(); arrancar(); }
            else parar();
          });
        }, { rootMargin: '300px 0px' });
        obs.observe(carousel);
      } else {
        cargar();
        arrancar();
      }
    }
  }


  /* ==========================================================
     16 — VISOR 3D DE REMERAS
     La remera es un modelo de verdad: se arrastra para girarla y
     se usa la rueda para acercar. Al elegir una miniatura no se
     cambia el modelo, solo su textura —las dos remeras comparten
     la misma malla, byte por byte—.

     Va en WebGL a mano, sin ninguna libreria. El sitio no tiene
     dependencias y no valia la pena romper eso por una pieza: el
     archivo trae una sola malla con posicion, normal y UV, que es
     justo lo que hace falta dibujar.

     Sin WebGL2, o si el modelo no carga, queda la foto de la
     remera que ya estaba en el HTML y nadie se entera.
     ========================================================== */
  function initShirt3D() {
    const host = $('[data-shirt3d]');
    if (!host) return;

    const canvas  = $('.shirt3d__canvas', host);
    const aviso   = $('.shirt3d__status', host);
    const botones = $$('[data-shirt-tex]', host);
    if (!canvas || !botones.length) return;

    const gl = canvas.getContext('webgl2', {
      antialias: true, alpha: true, premultipliedAlpha: false
    });
    if (!gl) { host.classList.add('is-unsupported'); return; }

    host.classList.add('is-3d');

    /* --- Matrices. Lo minimo para una camara que orbita. -------- */
    const perspectiva = (fov, aspecto, cerca, lejos) => {
      const f = 1 / Math.tan(fov / 2), d = cerca - lejos;
      return [f / aspecto, 0, 0, 0,  0, f, 0, 0,
              0, 0, (lejos + cerca) / d, -1,
              0, 0, (2 * lejos * cerca) / d, 0];
    };
    const multiplicar = (a, b) => {
      const r = new Array(16);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
        r[i * 4 + j] = s;
      }
      return r;
    };
    const rotarX = (a) => { const c = Math.cos(a), s = Math.sin(a);
      return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; };
    const rotarY = (a) => { const c = Math.cos(a), s = Math.sin(a);
      return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; };
    const trasladar = (x, y, z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];

    /* --- Programa ---------------------------------------------- */
    const VERT = `#version 300 es
      in vec3 aPos; in vec3 aNor; in vec2 aUV;
      uniform mat4 uProj, uVista;
      out vec3 vNor; out vec2 vUV;
      void main() {
        vNor = mat3(uVista) * aNor;
        vUV = aUV;
        gl_Position = uProj * uVista * vec4(aPos, 1.0);
      }`;

    /* La luz va fija a la camara: asi la prenda se lee igual desde
       cualquier angulo y no hay una cara que quede a oscuras. */
    const FRAG = `#version 300 es
      precision highp float;
      in vec3 vNor; in vec2 vUV;
      uniform sampler2D uTex;
      out vec4 color;
      void main() {
        vec3 n = normalize(vNor);
        if (!gl_FrontFacing) n = -n;
        vec3 base = texture(uTex, vUV).rgb;
        float luz = 0.30;
        luz += max(dot(n, normalize(vec3( 0.35,  0.55, 0.75))), 0.0) * 0.80;
        luz += max(dot(n, normalize(vec3(-0.65,  0.25, 0.40))), 0.0) * 0.30;
        luz += max(dot(n, normalize(vec3( 0.10, -0.60, 0.30))), 0.0) * 0.18;
        /* Un borde apenas mas claro despega la silueta del fondo
           blanco; sin esto la remera negra se corta como una mancha. */
        float borde = pow(1.0 - abs(n.z), 3.0) * 0.22;
        vec3 c = base * luz + borde;
        color = vec4(pow(c, vec3(1.0 / 2.2)), 1.0);
      }`;

    const compilar = (tipo, fuente) => {
      const s = gl.createShader(tipo);
      gl.shaderSource(s, fuente.replace(/^\s+/gm, ''));
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s));
      }
      return s;
    };

    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compilar(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compilar(gl.FRAGMENT_SHADER, FRAG));
      gl.bindAttribLocation(prog, 0, 'aPos');
      gl.bindAttribLocation(prog, 1, 'aNor');
      gl.bindAttribLocation(prog, 2, 'aUV');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog));
      }
    } catch (e) { host.classList.add('is-unsupported'); return; }

    const uProj  = gl.getUniformLocation(prog, 'uProj');
    const uVista = gl.getUniformLocation(prog, 'uVista');
    const uTex   = gl.getUniformLocation(prog, 'uTex');

    /* --- Estado de la camara ----------------------------------- */
    let giro = 0, altura = 0, distancia = 3;
    /* Los botones no saltan al angulo nuevo: fijan un destino y el bucle
       lleva el giro hasta ahi. Arrastrando, destino y giro van juntos. */
    let giroDestino = 0;
    const chico = window.matchMedia('(max-width: 1023px)');
    let centro = [0, 0, 0], radio = 1;
    let indices = 0, vao = null, textura = null;
    let hayQuePintar = true, raf = 0, corriendo = false;
    /* El encuadre se rehace mientras nadie haya tocado la pieza: asi
       aguanta que el lienzo cambie de forma, pero no le pisa la camara
       al que ya la movio. */
    let encuadrado = false, tocado = false;

    const FOV_Y = 0.7;
    let medidas = { x: 1, y: 1, z: 1 }, radioPlanta = 1;
    function encuadrar(aspecto) {
      /* El fov de la perspectiva es el vertical; el horizontal sale de la
         forma del lienzo. En un marco mas alto que ancho el campo
         horizontal queda mucho mas cerrado, y la prenda —mas ancha que
         alta— se salia por los costados. Hay que satisfacer los dos.

         El limite es un cilindro, no la esfera envolvente: al girar en
         horizontal el alto no cambia, asi que solo hace falta el radio en
         planta. Con la esfera —media diagonal en 3D— la pieza quedaba un
         50 % mas lejos de lo necesario y sobraba aire.

         Ese radio es el que se midio sobre los vertices, no el lado mayor
         de la caja: la silueta de una forma girada un angulo t es mas
         ancha que cualquiera de sus lados, y con el lado mayor la prenda
         entraba de frente y se salia unos 25 grados despues. */
      const medioAncho = radioPlanta;
      const medioAlto  = medidas.y * 0.5;
      const fovX = 2 * Math.atan(Math.tan(FOV_Y / 2) * aspecto);
      const porAlto  = medioAlto  / Math.sin(FOV_Y / 2);
      const porAncho = medioAncho / Math.sin(fovX / 2);
      /* En pantalla chica la prenda arranca mas cerca: el marco es chico
         y de lejos no se le ve la estampa. Con el radio medido sobre los
         vertices, el margen 1,0 ya la deja tangente al cuadro —lo mas
         grande posible sin salirse nunca, gire como gire—, asi que ahi
         no hace falta dejar aire de mas. En escritorio el marco es ancho
         y conviene un poco de respiro alrededor. */
      distancia = Math.max(porAlto, porAncho) * (chico.matches ? 1.0 : 1.10);
      encuadrado = true;
    }

    const pedirCuadro = () => {
      hayQuePintar = true;
      if (!corriendo) { corriendo = true; raf = requestAnimationFrame(pintar); }
    };

    /* --- Lectura del .glb ---------------------------------------
       Un glb son dos trozos pegados: el JSON que describe la escena
       y el binario con los numeros. Aca solo interesa una malla con
       posicion, normal, UV e indices. */
    function leerGlb(buffer) {
      const dv = new DataView(buffer);
      if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('no es un glb');
      const total = dv.getUint32(8, true);
      let off = 12, json = null, binOff = 0;
      while (off + 8 <= total) {
        const largo = dv.getUint32(off, true);
        const tipo  = dv.getUint32(off + 4, true);
        const datos = off + 8;
        if (tipo === 0x4E4F534A) {
          json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, datos, largo)));
        } else if (tipo === 0x004E4942) {
          binOff = datos;
        }
        off = datos + largo;
      }
      if (!json) throw new Error('sin JSON');

      const prim = json.meshes[0].primitives[0];
      const leer = (i, Tipo, porVertice) => {
        const acc = json.accessors[i];
        const bv = json.bufferViews[acc.bufferView];
        const inicio = binOff + (bv.byteOffset || 0) + (acc.byteOffset || 0);
        return new Tipo(buffer, inicio, acc.count * porVertice);
      };

      const pos = leer(prim.attributes.POSITION, Float32Array, 3);
      const nor = leer(prim.attributes.NORMAL, Float32Array, 3);
      const uv  = leer(prim.attributes.TEXCOORD_0, Float32Array, 2);
      const acIdx = json.accessors[prim.indices];
      const idx = leer(prim.indices, acIdx.componentType === 5123 ? Uint16Array : Uint32Array, 1);

      /* El encuadre sale del min/max que el propio archivo declara:
         no hace falta recorrer 600.000 vertices para saberlo. */
      const acPos = json.accessors[prim.attributes.POSITION];
      const mn = acPos.min, mx = acPos.max;
      centro = [(mn[0]+mx[0])/2, (mn[1]+mx[1])/2, (mn[2]+mx[2])/2];
      /* El radio es el de la esfera que envuelve la pieza —media
         diagonal—, no el del lado mas largo. Como la camara orbita, con
         el lado mas largo la prenda entraba de frente pero se salia del
         cuadro al girarla. */
      const dx = mx[0]-mn[0], dy = mx[1]-mn[1], dz = mx[2]-mn[2];
      medidas = { x: dx, y: dy, z: dz };

      /* Radio real en planta: la distancia mas grande del eje de giro a
         un vertice. Es lo unico que hace falta para saber cuanto ocupa
         la prenda gire como gire, y hay que medirlo de verdad: la
         diagonal de la caja lo sobreestima un 10 % porque supone picos
         en las esquinas, y los de una remera estan en las mangas. Ese
         10 % se paga en aire alrededor. Son 25.000 vertices, una pasada. */
      let mayor = 0;
      for (let p = 0; p < pos.length; p += 3) {
        const ex = pos[p] - centro[0], ez = pos[p + 2] - centro[2];
        const s = ex * ex + ez * ez;
        if (s > mayor) mayor = s;
      }
      radioPlanta = Math.sqrt(mayor);
      /* Este radio —el de la esfera envolvente— no encuadra: solo fija
         los planos de recorte y los topes del zoom, donde conviene que
         sobre. El encuadre lo hace encuadrar(), con el cilindro. */
      radio = Math.sqrt(dx*dx + dy*dy + dz*dz) * 0.5;

      return { pos, nor, uv, idx };
    }

    function subirMalla(m) {
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buf = (datos, sitio, tam) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(sitio);
        gl.vertexAttribPointer(sitio, tam, gl.FLOAT, false, 0, 0);
      };
      buf(m.pos, 0, 3);
      buf(m.nor, 1, 3);
      buf(m.uv,  2, 2);
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      indices = m.idx.length;
      tipoIndice = m.idx.BYTES_PER_ELEMENT === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
      encuadrado = false;   /* el encuadre se calcula al primer dibujo,
                               cuando ya se sabe la forma del lienzo */
    }
    let tipoIndice = gl.UNSIGNED_INT;

    /* --- Texturas ------------------------------------------------ */
    const cache = new Map();
    function ponerTextura(url) {
      if (cache.has(url)) { textura = cache.get(url); pedirCuadro(); return Promise.resolve(); }
      const img = new Image();
      return new Promise((ok) => {
        img.onload = () => {
          const t = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, t);
          /* Sin voltear: las UV de glTF tienen el origen arriba, igual que
             la primera fila de la imagen. Volteando, la estampa sale
             cabeza abajo. */
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          const anis = gl.getExtension('EXT_texture_filter_anisotropic');
          if (anis) {
            gl.texParameterf(gl.TEXTURE_2D, anis.TEXTURE_MAX_ANISOTROPY_EXT,
              Math.min(8, gl.getParameter(anis.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
          }
          cache.set(url, t);
          textura = t;
          pedirCuadro();
          ok();
        };
        img.onerror = () => ok();
        img.src = url;
      });
    }

    /* --- Dibujo -------------------------------------------------- */
    function medirLienzo() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        encuadrado = false;   /* el lienzo cambio de forma: reencuadrar */
        pedirCuadro();
      }
    }

    function pintar() {
      corriendo = false;
      if (!hayQuePintar) return;
      hayQuePintar = false;
      medirLienzo();

      /* Si los botones dejaron un giro pendiente, se recorre de a poco y
         se pide otro cuadro: es lo que hace que la prenda gire en vez de
         saltar al angulo nuevo. */
      if (Math.abs(giroDestino - giro) > 0.002) {
        giro += (giroDestino - giro) * 0.18;
        pedirCuadro();
      } else {
        giro = giroDestino;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (!vao || !textura) return;

      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);          /* el material es doubleSided */

      const aspecto = canvas.width / canvas.height;
      if (!encuadrado && !tocado) encuadrar(aspecto);
      const proj = perspectiva(FOV_Y, aspecto, radio * 0.05, radio * 40);
      let vista = trasladar(-centro[0], -centro[1], -centro[2]);
      vista = multiplicar(rotarY(giro), vista);
      vista = multiplicar(rotarX(altura), vista);
      vista = multiplicar(trasladar(0, 0, -distancia), vista);

      gl.useProgram(prog);
      gl.uniformMatrix4fv(uProj, false, new Float32Array(proj));
      gl.uniformMatrix4fv(uVista, false, new Float32Array(vista));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textura);
      gl.uniform1i(uTex, 0);
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, indices, tipoIndice, 0);
      gl.bindVertexArray(null);
    }

    /* --- Controles ------------------------------------------------
       El gesto vertical de la pagina se respeta: touch-action deja
       pasar el pan-y, asi que en mobile se gira en horizontal y la
       pagina sigue scrolleando en vertical. */
    let arrastrando = false, px = 0, py = 0;

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      arrastrando = true;
      tocado = true;
      px = e.clientX; py = e.clientY;
      canvas.classList.add('is-dragging');
      /* Agarrar la pieza le da el foco, que es lo que despues habilita
         la rueda. Tambien deja el teclado listo sin tener que tabular. */
      try { canvas.focus({ preventScroll: true }); } catch (err) { canvas.focus(); }
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!arrastrando) return;
      giro   += (e.clientX - px) * 0.008;
      giroDestino = giro;          /* el arrastre manda: no hay easing */
      altura += (e.clientY - py) * 0.008;
      const tope = Math.PI / 2 - 0.05;
      altura = Math.max(-tope, Math.min(tope, altura));
      px = e.clientX; py = e.clientY;
      pedirCuadro();
    });
    const soltar = () => { arrastrando = false; canvas.classList.remove('is-dragging'); };
    canvas.addEventListener('pointerup', soltar);
    canvas.addEventListener('pointercancel', soltar);
    canvas.addEventListener('lostpointercapture', soltar);

    /* La rueda acerca, pero solo despues de agarrar la pieza. Si zoomeara
       siempre, bastaria con que el cursor pasara por encima al bajar por
       la pagina para que el scroll quedara secuestrado y la remera se
       fuera de golpe a un primer plano. Con el visor ancho eso tapa media
       pantalla. Pidiendo el foco primero, el que solo pasa de largo
       scrollea normal y el que quiere mirar la prenda ya hizo click. */
    canvas.addEventListener('wheel', (e) => {
      if (document.activeElement !== canvas && !e.ctrlKey) return;
      e.preventDefault();
      tocado = true;
      distancia *= Math.exp(e.deltaY * 0.0012);
      distancia = Math.max(radio * 1.15, Math.min(radio * 9, distancia));
      pedirCuadro();
    }, { passive: false });

    /* Con teclado: flechas para girar, mas y menos para acercar. */
    canvas.addEventListener('keydown', (e) => {
      const paso = 0.12;
      if (e.key === 'ArrowLeft')  { giro -= paso; giroDestino = giro; }
      else if (e.key === 'ArrowRight') { giro += paso; giroDestino = giro; }
      else if (e.key === 'ArrowUp')    altura -= paso;
      else if (e.key === 'ArrowDown')  altura += paso;
      else if (e.key === '+' || e.key === '=') distancia *= 0.9;
      else if (e.key === '-' || e.key === '_') distancia *= 1.1;
      else return;
      e.preventDefault();
      tocado = true;
      const tope = Math.PI / 2 - 0.05;
      altura = Math.max(-tope, Math.min(tope, altura));
      distancia = Math.max(radio * 1.15, Math.min(radio * 9, distancia));
      pedirCuadro();
    });

    /* --- Manejadores en pantalla ---------------------------------
       Con el dedo se puede girar arrastrando, pero no hay rueda para
       acercar y afinar el giro es incomodo. Estos botones solo se ven en
       pantalla chica; en escritorio ya estan el raton y el teclado. */
    $$('[data-shirt-cmd]', host).forEach((b) => {
      b.addEventListener('click', () => {
        if (!vao) return;
        tocado = true;
        const cmd = b.dataset.shirtCmd;
        if (cmd === 'mas')        distancia *= 0.80;
        else if (cmd === 'menos') distancia *= 1.25;
        else if (cmd === 'izq')   giroDestino -= 0.55;
        else if (cmd === 'der')   giroDestino += 0.55;
        distancia = Math.max(radio * 1.15, Math.min(radio * 9, distancia));
        pedirCuadro();
      });
    });

    if ('ResizeObserver' in window) new ResizeObserver(pedirCuadro).observe(canvas);
    else window.addEventListener('resize', pedirCuadro);

    /* --- Miniaturas ---------------------------------------------- */
    function elegir(boton) {
      botones.forEach((b) => {
        const activo = b === boton;
        b.classList.toggle('is-active', activo);
        b.setAttribute('aria-pressed', activo ? 'true' : 'false');
      });
      ponerTextura(boton.dataset.shirtTex);
    }
    botones.forEach((b) => {
      b.addEventListener('click', () => { if (vao) elegir(b); });
    });

    /* --- Carga ---------------------------------------------------
       El modelo pesa y no tiene sentido bajarlo para quien nunca
       llega hasta aca: se pide recien cuando la seccion se acerca. */
    let pedido = false;
    function cargar() {
      if (pedido) return;
      pedido = true;
      host.classList.add('is-loading');
      if (aviso) aviso.textContent = 'Cargando el modelo…';

      fetch(host.dataset.shirt3d)
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then((buf) => {
          subirMalla(leerGlb(buf));
          host.classList.remove('is-loading');
          host.classList.add('is-ready');
          if (aviso) aviso.textContent = 'Arrastrá para girarla. Una vez agarrada, la rueda acerca.';
          return elegir(botones[0]);
        })
        .catch(() => {
          host.classList.remove('is-loading');
          host.classList.add('is-unsupported');
        });
    }

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => { if (en.isIntersecting) { cargar(); obs.disconnect(); } });
      }, { rootMargin: '400px 0px' });
      obs.observe(host);
    } else {
      cargar();
    }
  }


  /* ==========================================================
     17 — CARTAS DE REMERAS
     Cada carta se da vuelta al tocarla —adelante el diseño, atras
     la prenda puesta— y el boton con el mas de abajo la abre en
     grande, donde tambien se da vuelta. Se sale tocando fuera de
     la carta, con Escape o con el boton de cerrar.

     El giro lo hace CSS; aca solo se pone y se saca una clase. La
     vista grande se arma una sola vez y se reusa: clonar la carta
     entera traeria dos <img> mas por cada apertura.
     ========================================================== */
  function initCards() {
    const lista = $('[data-cards]');
    if (!lista) return;

    const cartas = $$('.card', lista);
    if (!cartas.length) return;

    /* --- Las cartas de la grilla -------------------------------- */
    cartas.forEach((carta) => {
      const flip = $('.card__flip', carta);
      const zoom = $('.card__zoom', carta);
      if (!flip) return;

      flip.addEventListener('click', () => {
        const dadaVuelta = flip.classList.toggle('is-flipped');
        flip.setAttribute('aria-pressed', dadaVuelta ? 'true' : 'false');
      });

      if (zoom) zoom.addEventListener('click', () => abrir(carta, zoom));
    });

    /* --- La vista grande ----------------------------------------
       Se construye al vuelo la primera vez que hace falta: si nadie
       toca el mas, no se agrega nada al arbol ni se baja nada. */
    let caja = null, marco = null, caraA = null, caraB = null;
    let quienAbrio = null;

    function construir() {
      caja = document.createElement('div');
      caja.className = 'lightbox';
      caja.hidden = true;

      marco = document.createElement('button');
      marco.type = 'button';
      marco.className = 'lightbox__flip';
      marco.setAttribute('aria-pressed', 'false');

      const dentro = document.createElement('span');
      dentro.className = 'card__inner';
      caraA = document.createElement('span');
      caraA.className = 'card__face';
      caraB = document.createElement('span');
      caraB.className = 'card__face card__face--dorso';
      caraA.appendChild(document.createElement('img'));
      caraB.appendChild(document.createElement('img'));
      dentro.appendChild(caraA);
      dentro.appendChild(caraB);
      marco.appendChild(dentro);

      const cerrar = document.createElement('button');
      cerrar.type = 'button';
      cerrar.className = 'lightbox__cerrar';
      cerrar.setAttribute('aria-label', 'Cerrar');
      cerrar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.6" ' +
        'stroke-linecap="round"></path></svg>';

      caja.appendChild(marco);
      caja.appendChild(cerrar);
      document.body.appendChild(caja);

      marco.addEventListener('click', () => {
        const dadaVuelta = marco.classList.toggle('is-flipped');
        marco.setAttribute('aria-pressed', dadaVuelta ? 'true' : 'false');
      });
      cerrar.addEventListener('click', salir);

      /* Tocar el fondo cierra; tocar la carta no, porque el click no
         llega hasta aca —lo ataja el boton de arriba—. */
      caja.addEventListener('click', (e) => { if (e.target === caja) salir(); });
    }

    function abrir(carta, boton) {
      if (!caja) construir();

      const imgs = $$('.card__face img', carta);
      const a = $('img', caraA), b = $('img', caraB);
      a.src = imgs[0].src; a.alt = imgs[0].alt;
      b.src = imgs[1].src; b.alt = imgs[1].alt;

      /* La carta grande abre del mismo lado que estaba la chica: si el
         que mira ya la habia dado vuelta, no se la devolvemos. */
      const alDorso = $('.card__flip', carta).classList.contains('is-flipped');
      marco.classList.toggle('is-flipped', alDorso);
      marco.setAttribute('aria-pressed', alDorso ? 'true' : 'false');

      quienAbrio = boton;
      caja.hidden = false;
      /* Leer una medida fuerza el reflow, y con eso el navegador toma el
         estado cerrado antes de que se agregue la clase: la transicion
         de opacidad arranca desde ahi. Se hace asi y no con un
         requestAnimationFrame porque en una pestaña de fondo el cuadro
         puede no llegar nunca y la caja quedaria invisible pero puesta,
         tapando la pagina. */
      void caja.offsetWidth;
      caja.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      marco.focus();
    }

    function salir() {
      if (!caja || caja.hidden) return;
      caja.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      window.setTimeout(() => { caja.hidden = true; }, 320);
      if (quienAbrio) { quienAbrio.focus(); quienAbrio = null; }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') salir();
    });
  }


  /* ==========================================================
     18 — PASE DE IMAGENES
     Las piezas van pasando solas y, debajo, un punto por pieza
     muestra cual esta en pantalla y cuanto le falta.

     El cambio es un desplazamiento, no un fundido: la que entra
     viene desde la derecha y empuja fuera del cuadro a la que
     estaba. Los tiempos —3000 ms quieta y 1100 ms corriendose,
     con la curva ease— salen de medir el sitio que dio de
     referencia el autor.

     En el marco hay dos <img>: una a la vista y la otra aparcada
     afuera. Al terminar cada desplazamiento se intercambian los
     papeles en vez de reescribir el src de la que se ve, asi que
     el cuadro nunca queda en blanco.

     TODO LO QUE SE MUEVE, SE MUEVE JUNTO. El punto largo se
     acorta y el chico se estira en el mismo momento y durante el
     mismo tiempo que la imagen cruza el cuadro, con la misma
     curva. Por eso el ancho de los puntos lo cronometra este
     modulo y no el CSS: si cada cosa lleva su propio tiempo, el
     conjunto se ve tosco.

     El relleno naranja, en cambio, si va cuadro a cuadro y no por
     transicion: asi se puede frenar y reanudar en cualquier punto
     —mientras se arrastra, o cuando el pase sale de pantalla— sin
     que pegue un salto.

     Se puede arrastrar con el dedo o el mouse y las piezas
     acompañan el gesto. Al soltar, si se recorrio lo suficiente
     el cambio se completa y si no vuelve atras, en los dos casos
     a la velocidad de siempre y descontando lo ya recorrido.

     Con prefers-reduced-motion no avanza solo y los cambios son
     instantaneos: quedan el arrastre y el teclado, y el relleno
     no se dibuja.
     ========================================================== */
  function initPase() {
    $$('[data-pase]').forEach(armar);

    function armar(pase) {
      const imgs  = $$('.pase__img', pase);
      const barra = $('.pase__barra', pase);
      const marco = $('.pase__marco', pase);
      if (imgs.length < 2 || !marco) return;

      /* Cuantas piezas tiene este pase. Va en el HTML porque cada uno
         lleva las suyas: el de la izquierda las ocho de universo/a y el
         de la derecha las ocho de universo/b. */
      const CUANTAS = Math.max(2, parseInt(pase.dataset.cuantas, 10) || 10);
      const ESPERA  = 3000;          /* lo que queda quieta cada pieza */
      const DESLIZ  = 1100;          /* lo que tarda en correrse */
      const MINIMO  = 180;           /* ningun tramo dura menos que esto */

      /* Las rutas salen de la primera imagen: 01.jpg, 02.jpg... asi el
         HTML no repite ocho veces el nombre de la misma carpeta. */
      const rutas = [];
      for (let i = 1; i <= CUANTAS; i++) {
        rutas.push(imgs[0].src.replace(/\d+\.jpg$/, String(i).padStart(2, '0') + '.jpg'));
      }
      const ALT = imgs[0].alt;

      const duracion = () => (prefersReducedMotion.matches ? 0 : DESLIZ);
      const vecina = (dir) => (((actual + dir) % CUANTAS) + CUANTAS) % CUANTAS;

      /* pct es donde queda la imagen, en porcentaje del ancho del marco:
         0 es a la vista y 100 es aparcada afuera, a la derecha. */
      function colocar(img, pct, ms) {
        img.style.transition = ms ? 'transform ' + ms + 'ms ease' : 'none';
        img.style.transform = 'translateX(' + pct + '%)';
      }

      let frente = imgs[0], detras = imgs[1];
      colocar(frente, 0, 0);
      colocar(detras, 100, 0);

      /* --- Los puntos ---------------------------------------------
         Uno por pieza, puestos aca y no en el HTML: el HTML no tiene
         por que saber cuantas piezas hay. El relleno es un solo
         elemento que se muda al punto que toca. */
      const puntos = [];
      let avance = null;
      if (barra) {
        for (let i = 0; i < CUANTAS; i++) {
          const p = document.createElement('span');
          p.className = 'pase__punto';
          barra.appendChild(p);
          puntos.push(p);
        }
        avance = document.createElement('span');
        avance.className = 'pase__avance';
        barra.setAttribute('aria-valuemin', '1');
        barra.setAttribute('aria-valuemax', String(CUANTAS));
      }

      let actual = 0;
      /* El desfase deja a los dos pases fuera de fase, para que no se
         muevan los dos a la vez a los costados del texto. */
      let transcurrido = Math.min(ESPERA, parseInt(pase.dataset.desfase, 10) || 0);
      let ultimo = 0;
      let raf = 0, corriendo = false, quieto = false, cambiando = false;
      /* De que lado esta aparcada la vecina: 1 a la derecha, -1 a la
         izquierda, 0 si todavia no hay ninguna preparada. */
      let lado = 0;

      const detenido = () => quieto || prefersReducedMotion.matches;

      /* El ancho de los puntos lo cronometra el JS —ver la nota de
         arriba— asi que la duracion va inline, no en la hoja. */
      function marcarPunto(indice, ms) {
        if (!puntos.length) return;
        puntos.forEach(function (p, i) {
          p.style.transitionDuration = (ms || 0) + 'ms';
          p.classList.toggle('is-activo', i === indice);
        });
        if (avance) puntos[indice].appendChild(avance);
        if (barra) barra.setAttribute('aria-valuenow', String(indice + 1));
      }

      function pintarAvance() {
        if (!avance) return;
        const parte = (detenido() || cambiando) ? 0 : Math.min(1, transcurrido / ESPERA);
        avance.style.width = (parte * 100).toFixed(2) + '%';
      }

      /* La primera pieza viene con loading="lazy" para no bajarla hasta
         que alguien se acerque. Pero apenas el pase empieza a andar hay
         que sacarselo: la imagen que espera su turno esta aparcada fuera
         del marco, y para el navegador eso es estar fuera de pantalla,
         asi que con lazy puesto no baja nunca —no llega el onload y el
         pase se queda clavado en la primera pieza—. */
      let despierto = false;
      function despertar() {
        if (despierto) return;
        despierto = true;
        imgs.forEach(function (i) { i.removeAttribute('loading'); });
        precargarVecinas();
      }

      /* Las dos de al lado, en la cache del navegador. Sin esto, al
         empezar a arrastrar hacia un lado la pieza vecina todavia no
         llego y el gesto no arranca hasta que baja. */
      function precargarVecinas() {
        [1, -1].forEach(function (d) { (new Image()).src = rutas[vecina(d)]; });
      }

      /* --- Completar un cambio -------------------------------------
         Las dos imagenes ya estan donde tienen que estar; esto las
         lleva a destino y confirma. ms es lo que dura el tramo que
         falta: en el cambio automatico es el deslizamiento entero y al
         soltar un arrastre es lo que quedaba sin recorrer. */
      function completar(destino, hacia, ms) {
        cambiando = true;
        transcurrido = 0;
        colocar(frente, -hacia * 100, ms);
        colocar(detras, 0, ms);
        marcarPunto(destino, ms);
        pintarAvance();
        window.setTimeout(function () {
          /* La que entro pasa al frente y la que salio se aparca. */
          const salio = frente;
          frente = detras;
          detras = salio;
          colocar(detras, 100, 0);
          frente.alt = ALT;
          frente.removeAttribute('aria-hidden');
          detras.alt = '';
          detras.setAttribute('aria-hidden', 'true');
          actual = destino;
          lado = 0;
          cambiando = false;
          pintarAvance();
          precargarVecinas();
        }, ms);
      }

      /* Deja la vecina de ese lado cargada y aparcada, lista para
         acompañar al dedo. Devuelve si ya se la puede mostrar. */
      function prepararVecina(dir) {
        if (lado === dir) return true;
        const url = rutas[vecina(dir)];
        /* Una sola vez. Aunque la imagen ya este en la cache y se la
           pueda aparcar en el acto, el navegador dispara igual el onload
           un rato despues: sin este cerrojo, esa segunda llamada le
           devolvia la vecina al borde en medio del arrastre y la pieza
           pegaba un salto. */
        let hecho = false;
        const listo = function () {
          if (hecho) return;
          hecho = true;
          colocar(detras, dir * 100, 0);
          lado = dir;
        };
        detras.onload = listo;
        detras.onerror = function () { lado = 0; };
        if (detras.src !== url) detras.src = url;
        if (detras.complete && detras.naturalWidth > 0) { listo(); return true; }
        return false;
      }

      /* --- El cambio automatico ----------------------------------- */
      function ir(indice, hacia) {
        const destino = ((indice % CUANTAS) + CUANTAS) % CUANTAS;
        if (destino === actual || cambiando) return;
        despertar();

        let lanzado = false;
        const salir = function () {
          if (lanzado) return;
          lanzado = true;
          colocar(detras, hacia * 100, 0);
          /* Un reflow entre aparcarla y largarla. Sin esto el navegador
             junta las dos escrituras y la pieza aparece en su destino
             sin haberse movido. */
          void detras.offsetWidth;
          lado = hacia;
          completar(destino, hacia, duracion());
        };

        const url = rutas[destino];
        detras.onload = salir;
        detras.onerror = function () { cambiando = false; };
        if (detras.src !== url) detras.src = url;
        if (detras.complete && detras.naturalWidth > 0) salir();
      }

      const siguiente = () => ir(actual + 1, 1);
      const anterior  = () => ir(actual - 1, -1);

      /* --- El reloj ----------------------------------------------- */
      function cuadro(t) {
        corriendo = false;
        if (!ultimo) ultimo = t;
        let dt = t - ultimo;
        ultimo = t;
        /* Volver de una pestaña en segundo plano no puede saltear
           media docena de piezas de golpe. */
        if (dt > 250) dt = 250;

        if (!detenido() && !cambiando) {
          transcurrido += dt;
          if (transcurrido >= ESPERA) siguiente();
        }
        pintarAvance();
        arrancar();
      }

      function arrancar() {
        if (corriendo) return;
        corriendo = true;
        raf = requestAnimationFrame(cuadro);
      }
      function parar() {
        corriendo = false;
        cancelAnimationFrame(raf);
        ultimo = 0;
      }

      /* --- Arrastre -----------------------------------------------
         Las piezas acompañan al dedo. El lado se decide con el primer
         movimiento: hacia la izquierda trae la siguiente y hacia la
         derecha la anterior. Si esa vecina todavia no cargo, la pieza
         se queda quieta en vez de dejar un hueco.

         Al soltar, un gesto corto vuelve atras: hace falta recorrer una
         parte del ancho para que el cambio se confirme, si no cualquier
         roce saltea una pieza. */
      let agarrado = false, x0 = 0, movido = 0, ancho = 1;

      function arrastrarA(d) {
        const pct = (d / ancho) * 100;
        colocar(frente, pct, 0);
        if (lado !== 0) colocar(detras, lado * 100 + pct, 0);
      }

      marco.addEventListener('pointerdown', function (e) {
        if (e.button > 0 || cambiando) return;
        despertar();
        agarrado = true; quieto = true; movido = 0; lado = 0;
        ancho = marco.getBoundingClientRect().width || 1;
        x0 = e.clientX;
        marco.classList.add('is-dragging');
        try { marco.setPointerCapture(e.pointerId); } catch (err) {}
      });

      marco.addEventListener('pointermove', function (e) {
        if (!agarrado) return;
        const d = e.clientX - x0;
        if (d === 0) { movido = 0; arrastrarA(0); return; }
        /* Arrastrar hacia la izquierda trae la siguiente. */
        movido = prepararVecina(d < 0 ? 1 : -1) ? d : 0;
        arrastrarA(movido);
      });

      const soltar = function () {
        if (!agarrado) return;
        agarrado = false;
        marco.classList.remove('is-dragging');

        const umbral = Math.max(40, ancho * 0.12);
        const recorrido = Math.min(1, Math.abs(movido) / ancho);
        /* Lo que falta —o lo que hay que deshacer— a la misma velocidad
           que el desplazamiento automatico, descontando lo ya andado.
           Sin el descuento, un gesto casi completo tardaria lo mismo que
           uno desde cero y se veria pesado. */
        const restante = Math.max(MINIMO, Math.round(duracion() * (1 - recorrido)));
        const vuelta   = Math.max(MINIMO, Math.round(duracion() * recorrido));

        if (lado !== 0 && Math.abs(movido) >= umbral) {
          completar(vecina(lado), lado, restante);
        } else if (lado !== 0) {
          colocar(frente, 0, vuelta);
          colocar(detras, lado * 100, vuelta);
        }
        quieto = false;
        ultimo = 0;
        transcurrido = 0;
      };
      marco.addEventListener('pointerup', soltar);
      marco.addEventListener('pointercancel', soltar);
      marco.addEventListener('lostpointercapture', soltar);

      /* Con el teclado, para quien no puede arrastrar. */
      marco.tabIndex = 0;
      marco.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') anterior();
        else if (e.key === 'ArrowRight') siguiente();
        else return;
        e.preventDefault();
        transcurrido = 0;
      });

      /* Al pasar por encima se frena: si alguien se detuvo a mirar una
         pieza, no se le cambia debajo del cursor. */
      marco.addEventListener('pointerenter', function () { quieto = true; });
      marco.addEventListener('pointerleave', function () {
        if (!agarrado) { quieto = false; ultimo = 0; }
      });

      /* --- Puesta en marcha ---------------------------------------
         Fuera de pantalla no corre: no tiene sentido gastar cuadros ni
         bajar imagenes que nadie esta mirando. */
      marcarPunto(actual, 0);
      pintarAvance();
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (en) {
            if (en.isIntersecting) { despertar(); ultimo = 0; arrancar(); }
            else parar();
          });
        }, { rootMargin: '200px 0px' });
        obs.observe(pase);
      } else {
        despertar();
        arrancar();
      }
    }
  }


  /* ==========================================================
     ARRANQUE
     ========================================================== */
  function init() {
    initLoader();
    initImageFallbacks();
    initHeader();
    initMobileMenu();
    initScrollOffset();
    initActiveNav();
    initReveal();
    initProjectIndex();
    initCopyEmail();
    initContactForm();
    initYear();
    initHeroMark();
    initLoopVideos();
    initCarousels();
    initShirt3D();
    initCards();
    initPase();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
