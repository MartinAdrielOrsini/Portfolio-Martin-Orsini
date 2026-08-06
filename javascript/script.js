/* ============================================================
   PORTFOLIO — script.js (vanilla, sin dependencias)
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

  /* ---------- Carrusel de proyectos ---------- */
  var track = document.getElementById("carouselTrack");
  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");

  function cardStep() {
    var card = track.querySelector(".work-card");
    if (!card) return 320;
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap || "24");
    return card.getBoundingClientRect().width + gap;
  }

  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -cardStep(), behavior: "smooth" });
    });
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: cardStep(), behavior: "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Índice lateral: punto activo según sección visible ---------- */
  var indexDots = document.querySelectorAll(".page-index a");
  var trackedSections = ["hero", "about", "work", "project-01", "project-02", "project-03", "project-04", "project-05", "project-06"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && indexDots.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            indexDots.forEach(function (dot) {
              dot.classList.toggle("is-active", dot.getAttribute("data-index") === id);
            });
          }
        });
      },
      { threshold: 0.5 }
    );
    trackedSections.forEach(function (el) { sectionObserver.observe(el); });
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

  /* ---------- Año dinámico ---------- */
  var footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = "© " + new Date().getFullYear();
  }

})();
