/* ============================================================
   MARTÍN — PORTFOLIO · script.js (vanilla, sin dependencias)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Menú móvil ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Filtro de proyectos ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      var filter = btn.getAttribute("data-filter");

      projectCards.forEach(function (card) {
        var categories = card.getAttribute("data-category") || "";
        var matches = filter === "all" || categories.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });

  /* Tap para revelar la ficha técnica en pantallas táctiles */
  projectCards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (window.matchMedia("(hover: none)").matches) {
        var wasOpen = card.classList.contains("spec-open");
        projectCards.forEach(function (c) { c.classList.remove("spec-open"); });
        if (!wasOpen) card.classList.add("spec-open");
      }
    });
  });

  /* ---------- Acordeón de proceso ---------- */
  var processItems = document.querySelectorAll(".process-item");
  processItems.forEach(function (item) {
    var trigger = item.querySelector(".process-trigger");
    trigger.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      processItems.forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".process-trigger").setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Copiar email al portapapeles ---------- */
  var copyBtn = document.getElementById("copyEmailBtn");
  var emailText = document.getElementById("emailText");

  if (copyBtn && emailText) {
    copyBtn.addEventListener("click", function () {
      var email = emailText.textContent.trim();

      function showCopied() {
        copyBtn.classList.add("copied");
        setTimeout(function () { copyBtn.classList.remove("copied"); }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showCopied).catch(function () {
          fallbackCopy(email, showCopied);
        });
      } else {
        fallbackCopy(email, showCopied);
      }
    });
  }

  function fallbackCopy(text, onSuccess) {
    var temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand("copy"); onSuccess(); } catch (e) { /* noop */ }
    document.body.removeChild(temp);
  }

  /* ---------- Validación del formulario de contacto ---------- */
  var form = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("inputName");
      var email = document.getElementById("inputEmail");
      var message = document.getElementById("inputMessage");

      var valid = true;

      valid = validateField(name, name.value.trim().length > 1) && valid;
      valid = validateField(email, isValidEmail(email.value.trim())) && valid;
      valid = validateField(message, message.value.trim().length > 5) && valid;

      if (valid) {
        formStatus.textContent = "¡Gracias! Tu mensaje quedó listo — conectá este formulario a tu servicio de envío preferido (Formspree, Resend, etc.) para recibirlo por email.";
        form.reset();
      } else {
        formStatus.textContent = "Revisá los campos marcados antes de enviar.";
      }
    });

    [document.getElementById("inputName"), document.getElementById("inputEmail"), document.getElementById("inputMessage")].forEach(function (input) {
      input.addEventListener("input", function () {
        var fieldWrap = input.closest(".field");
        if (fieldWrap) fieldWrap.classList.remove("has-error");
      });
    });
  }

  function validateField(input, isValid) {
    var fieldWrap = input.closest(".field");
    if (fieldWrap) fieldWrap.classList.toggle("has-error", !isValid);
    return isValid;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* ---------- Año dinámico ---------- */
  var footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = "© " + new Date().getFullYear();
  }

})();
