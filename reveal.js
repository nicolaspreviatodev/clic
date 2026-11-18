/* =====================================================
   CLIC — reveal.js
   Reveal on scroll via IntersectionObserver
   ===================================================== */
(function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var alvos = document.querySelectorAll('.reveal');
  if (!alvos.length) return;

  if (reduz || !('IntersectionObserver' in window)) {
    alvos.forEach(function (el) { el.classList.add('reveal-visivel'); });
    return;
  }

  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('reveal-visivel');
        obs.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  alvos.forEach(function (el) { obs.observe(el); });
})();
