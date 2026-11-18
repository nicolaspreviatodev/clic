/* =====================================================
   CLIC — mockups.js
   Microanimações dos mockups da landing (D6).

   Regra: o estado de repouso é sempre o do Figma. As
   animações só acontecem quando o mockup entra na tela e
   começam do zero para terminar exatamente no estado
   desenhado. Com prefers-reduced-motion, nada anima.
   ===================================================== */
(function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURACAO = 600;

  function quandoVisivel(el, fn) {
    if (!el || reduz) return;
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.disconnect();
        fn();
      });
    }, { threshold: 0.2 });
    obs.observe(el);
  }

  /* ---------- D6 · Projetos: barras crescem até 72% / 35% / 100% ---------- */
  function projetos() {
    var mock = document.querySelector('#projetos .clic-recurso__mock');
    var barras = document.querySelectorAll('#projetos .clic-mockup__barra-prog i');
    quandoVisivel(mock, function () {
      barras.forEach(function (barra, i) {
        var alvo = barra.style.width || '0%';
        if (!barra.animate) return;
        barra.animate(
          [{ width: '0%' }, { width: alvo }],
          { duration: DURACAO, delay: i * 100, easing: 'ease-out', fill: 'none' }
        );
      });
    });
  }

  /* ---------- D6 · Financeiro: barras de categoria crescem ---------- */
  function financeiro() {
    var mock = document.querySelector('#financeiro .clic-recurso__mock');
    var barras = document.querySelectorAll('#financeiro .clic-mockup__barra-prog i');
    quandoVisivel(mock, function () {
      barras.forEach(function (barra, i) {
        var alvo = barra.style.width || '0%';
        if (!barra.animate) return;
        barra.animate(
          [{ width: '0%' }, { width: alvo }],
          { duration: DURACAO, delay: i * 100, easing: 'ease-out', fill: 'none' }
        );
      });
    });
  }

  /* ---------- D6 · Reembolso: etapas preenchem até "Em análise" ----------
     As quatro etapas são amarelas no Figma. A sequência é feita com a
     opacidade partindo de 0,35 e subindo, uma a cada 150 ms, até a segunda;
     ao terminar, tudo volta a 1 (idêntico ao Figma). */
  function reembolso() {
    var mock = document.querySelector('#reembolso .clic-recurso__mock');
    var etapas = document.querySelectorAll('#reembolso .clic-mockup__etapa');
    quandoVisivel(mock, function () {
      etapas.forEach(function (etapa) {
        if (!etapa.animate) return;
        etapa.animate([{ opacity: 0.35 }, { opacity: 1 }], {
          duration: DURACAO,
          delay: Math.min(etapas.length - 1, Array.prototype.indexOf.call(etapas, etapa)) * 150,
          easing: 'ease-out',
          fill: 'none'
        });
      });
    });
  }

  /* ---------- D6 · Horas: relógio do mockup conta em tempo real ---------- */
  function relogio() {
    var el = document.getElementById('mock-cronometro');
    if (!el || reduz) return;
    var base = 1 * 3600 + 24 * 60 + 18; // 01:24:18, o valor do Figma
    var inicio = null;
    var visivel = false;
    var observer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        visivel = en.isIntersecting;
        if (visivel && inicio === null) inicio = Date.now();
      });
    }, { threshold: 0.2 });
    observer.observe(el);

    window.setInterval(function () {
      if (!visivel || inicio === null) return;
      var s = base + Math.floor((Date.now() - inicio) / 1000);
      var h = String(Math.floor(s / 3600)).padStart(2, '0');
      var m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      var x = String(s % 60).padStart(2, '0');
      el.textContent = h + ':' + m + ':' + x;
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    projetos();
    financeiro();
    reembolso();
    relogio();
  });
})();
