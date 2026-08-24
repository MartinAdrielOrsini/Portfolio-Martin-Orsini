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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
