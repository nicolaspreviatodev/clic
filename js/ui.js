/* =====================================================
   CLIC — ui.js
   Detalhes comuns: pular para o conteúdo, voltar ao topo,
   logo da home rolando ao topo e chips do hero.
   ===================================================== */
(function (global) {
  'use strict';

  var REDUZ = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pular para o conteúdo ---------- */
  var main = document.querySelector('main');
  if (main && !document.querySelector('.pular-conteudo')) {
    if (!main.id) main.id = 'conteudo';
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    var pular = document.createElement('a');
    pular.className = 'visually-hidden-focusable pular-conteudo';
    pular.href = '#' + main.id;
    pular.textContent = 'Pular para o conteúdo';
    document.body.insertBefore(pular, document.body.firstChild);
  }

  /* ---------- Voltar ao topo (páginas longas) ---------- */
  var longa = document.body.classList.contains('page-landing') ||
    document.body.classList.contains('page-sobre');
  if (longa && !document.querySelector('.clic-voltar-topo')) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'clic-voltar-topo';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    btn.innerHTML = '<svg class="ic ic-20" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>';
    document.body.appendChild(btn);

    var mostrar = function () {
      btn.classList.toggle('visivel', window.scrollY > 600);
    };
    window.addEventListener('scroll', mostrar, { passive: true });
    mostrar();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUZ ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Logo da home: volta ao topo sem recarregar ---------- */
  var naHome = /(^|\/)index\.html$/.test(location.pathname) || location.pathname === '/' ||
    /\/clic\/$/.test(location.pathname) || location.pathname === '';
  if (naHome) {
    document.querySelectorAll('.clic-header__logo, .clic-footer__marca a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: REDUZ ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- Chips do hero levam à seção correspondente ---------- */
  var MAPA_CHIPS = {
    'clic-hero__chip--projetos': 'projetos',
    'clic-hero__chip--financeiro': 'financeiro',
    'clic-hero__chip--horas': 'horas',
    'clic-hero__chip--reembolso': 'reembolso'
  };
  document.querySelectorAll('.clic-hero__chip').forEach(function (chip) {
    var destino = null;
    Object.keys(MAPA_CHIPS).forEach(function (cls) {
      if (chip.classList.contains(cls)) destino = MAPA_CHIPS[cls];
    });
    if (!destino) return;
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('role', 'link');
    var ir = function () {
      var alvo = document.getElementById(destino);
      if (alvo) alvo.scrollIntoView({ behavior: REDUZ ? 'auto' : 'smooth', block: 'start' });
    };
    chip.addEventListener('click', ir);
    chip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); }
    });
  });

  /* ---------- "Ferramentas" ativo enquanto a seção está na tela ---------- */
  var secaoFerramentas = document.getElementById('ferramentas');
  var linkFerramentas = document.querySelector('.clic-nav__link[href="#ferramentas"]');
  if (secaoFerramentas && linkFerramentas && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        linkFerramentas.classList.toggle('ativo', en.isIntersecting);
        if (en.isIntersecting) linkFerramentas.setAttribute('aria-current', 'true');
        else linkFerramentas.removeAttribute('aria-current');
      });
    }, { threshold: 0.35 });
    obs.observe(secaoFerramentas);
  }
})(window);
