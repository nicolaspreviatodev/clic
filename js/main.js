/* =====================================================
   CLIC — main.js (landing/sobre)
   Header sticky, tooltips, smooth scroll, ano, aria-current
   ===================================================== */
(function () {
  'use strict';

  // Sombra do header ao rolar
  var header = document.querySelector('.clic-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('sombra', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Tooltips Bootstrap
  if (window.bootstrap && bootstrap.Tooltip) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
      new bootstrap.Tooltip(el);
    });
  }

  // Rolagem suave para âncoras (fallback quando scroll-behavior não suportado)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var alvo = document.querySelector(id);
      if (!alvo) return;
      e.preventDefault();
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  // Marca link atual
  var pagina = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.clic-nav__link').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === pagina || (pagina === '' && href === 'index.html')) {
      a.classList.add('ativo');
      a.setAttribute('aria-current', 'page');
    }
  });

  // Ano do footer
  document.querySelectorAll('[data-ano]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
