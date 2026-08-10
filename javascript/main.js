/* ============================================================
   PORTFOLIO — JAVASCRIPT
   Módulos:
     1. Marca de JS activo
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
      return '#projects'; // projects, project-01..04, playground
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
     8 — PUNTOS DEL CARRUSEL DEL ÍNDICE
     El swipe es scroll nativo (CSS scroll-snap). Esto solo
     refleja la posición. En desktop los puntos están ocultos.
     ========================================================== */
  function initTrackDots() {
    const track = $('#indexTrack');
    const dots  = $('#trackDots');
    if (!track || !dots) return;

    const cards = $$('.pcard', track);
    const marks = $$('.track-dots__dot', dots);
    if (!cards.length || !marks.length) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const scrollable = track.scrollWidth - track.clientWidth;
      if (scrollable <= 0) return; // en desktop no hay scroll horizontal

      const ratio = track.scrollLeft / scrollable;
      const index = Math.round(ratio * (cards.length - 1));

      marks.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
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

    form.addEventListener('submit', (e) => {
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

      if (status) {
        status.textContent = '¡Gracias! Tu mensaje quedó listo para enviarse. Te respondo dentro de las próximas 48 horas.';
        status.classList.add('is-ok');
      }

      form.reset();
      fields.forEach((field) => {
        field.error.textContent = '';
        field.input.setAttribute('aria-invalid', 'false');
      });
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
     ARRANQUE
     ========================================================== */
  function init() {
    initImageFallbacks();
    initHeader();
    initMobileMenu();
    initScrollOffset();
    initActiveNav();
    initReveal();
    initTrackDots();
    initCopyEmail();
    initContactForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
