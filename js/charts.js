/* =====================================================
   CLIC — charts.js
   Gráficos SVG puros com as geometrias do Figma.
   ===================================================== */
(function () {
  'use strict';

  var NAVY = '#0C3C67';
  var AZUL = '#4F76A0';
  var AMARELO = '#FFB703';
  var GRADE = '#E3EAF3';
  var TEXTO = '#395054';

  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ---------- Donut ----------
     dados: [{rotulo, valor, pct, cor}] */
  function renderDonut(el, dados, centroValor, centroRotulo) {
    if (!el) return;
    var W = 220, H = 176, cx = 88, cy = 88, r = 66, esp = 22;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img' });
    var total = dados.reduce(function (s, d) { return s + d.pct; }, 0) || 100;
    var ang = -Math.PI / 2;
    dados.forEach(function (d) {
      var frac = d.pct / total;
      var fim = ang + frac * Math.PI * 2;
      var x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
      var x2 = cx + r * Math.cos(fim), y2 = cy + r * Math.sin(fim);
      var grande = frac > 0.5 ? 1 : 0;
      var path = svgEl('path', {
        d: 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + grande + ' 1 ' + x2 + ' ' + y2,
        fill: 'none', stroke: d.cor, 'stroke-width': esp
      });
      svg.appendChild(path);
      ang = fim;
    });
    if (centroValor) {
      var t1 = svgEl('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', fill: NAVY, 'font-family': 'Inter, sans-serif', 'font-size': 18, 'font-weight': 700 });
      t1.textContent = centroValor;
      svg.appendChild(t1);
    }
    if (centroRotulo) {
      var t2 = svgEl('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', fill: TEXTO, 'font-family': 'Inter, sans-serif', 'font-size': 11 });
      t2.textContent = centroRotulo;
      svg.appendChild(t2);
    }
    el.innerHTML = '';
    el.appendChild(svg);
  }

  /* ---------- Barras verticais agrupadas ----------
     dados: [{rotulo, receitas, despesas}] */
  function renderBarrasAgrupadas(el, dados) {
    if (!el) return;
    var W = 1020, H = 240, base = 228, topo = 0;
    var max = 60000;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    [0, 20000, 40000, 60000].forEach(function (v) {
      var y = base - (v / max) * (base - topo);
      svg.appendChild(svgEl('line', { x1: 0, y1: y, x2: W, y2: y, stroke: GRADE, 'stroke-width': 1 }));
    });
    var grupoW = W / dados.length;
    dados.forEach(function (d, i) {
      var x0 = i * grupoW + grupoW / 2 - 22;
      var hR = (d.receitas / max) * (base - topo);
      var hD = (d.despesas / max) * (base - topo);
      svg.appendChild(svgEl('rect', { x: x0, y: base - hR, width: 38, height: hR, fill: NAVY }));
      svg.appendChild(svgEl('rect', { x: x0 + 44, y: base - hD, width: 38, height: hD, fill: AMARELO }));
      var t = svgEl('text', { x: i * grupoW + grupoW / 2, y: H - 2, 'text-anchor': 'middle', fill: TEXTO, 'font-family': 'Inter, sans-serif', 'font-size': 12 });
      t.textContent = d.rotulo;
      svg.appendChild(t);
    });
    el.innerHTML = '';
    el.appendChild(svg);
  }

  /* ---------- Barras horizontais ----------
     dados: [{rotulo, valor, max}] */
  function renderBarrasHorizontais(el, dados, max) {
    if (!el) return;
    var W = 604, linhaH = 57, H = dados.length * linhaH + 20;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    dados.forEach(function (d, i) {
      var y = i * linhaH + 10;
      var w = (d.valor / max) * (W - 60);
      svg.appendChild(svgEl('rect', { x: 0, y: y, width: w, height: 38, fill: NAVY }));
      var t = svgEl('text', { x: 0, y: y + 58, fill: TEXTO, 'font-family': 'Inter, sans-serif', 'font-size': 12 });
      t.textContent = d.rotulo;
      svg.appendChild(t);
    });
    el.innerHTML = '';
    el.appendChild(svg);
  }

  /* ---------- Gráfico de linha (mockup landing) ---------- */
  function renderLinha(el) {
    if (!el) return;
    var W = 422, H = 116;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    [6, 40, 74].forEach(function (y) {
      svg.appendChild(svgEl('line', { x1: 34, y1: y, x2: 412, y2: y, stroke: AZUL, 'stroke-opacity': .2, 'stroke-width': 1 }));
    });
    var pontos = [[34, 80], [90, 70], [150, 74], [210, 52], [270, 58], [330, 34], [412, 26]];
    var d = pontos.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    svg.appendChild(svgEl('path', { d: d + ' L412 96 L34 96 Z', fill: '#EAF1F9' }));
    svg.appendChild(svgEl('path', { d: d, fill: 'none', stroke: AZUL, 'stroke-width': 2.5 }));
    el.innerHTML = '';
    el.appendChild(svg);
  }

  /* ---------- Barras semanais (mockup horas) ---------- */
  function renderSemana(el) {
    if (!el) return;
    var W = 376, H = 96;
    var alturas = [64, 80, 72, 88, 56, 32, 96];
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    alturas.forEach(function (h, i) {
      svg.appendChild(svgEl('rect', {
        x: i * 54.67, y: H - h, width: 48, height: h, rx: 6,
        fill: i === 3 ? AMARELO : AZUL
      }));
    });
    el.innerHTML = '';
    el.appendChild(svg);
  }

  /* ---------- Inicialização por página ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    // Dashboard financeiro
    renderDonut(document.getElementById('donut-receitas'),
      [
        { rotulo: 'Serviços técnicos', pct: 58, cor: NAVY },
        { rotulo: 'Consultoria', pct: 29, cor: AZUL },
        { rotulo: 'Licenças', pct: 12, cor: AMARELO }
      ], 'R$ 48 mil', 'receitas');

    renderDonut(document.getElementById('donut-despesas'),
      [
        { rotulo: 'Custo indireto', pct: 76, cor: NAVY },
        { rotulo: 'Custo direto', pct: 21, cor: AZUL },
        { rotulo: 'Reembolso', pct: 3, cor: AMARELO }
      ], 'R$ 7,3 mil', 'despesas');

    renderBarrasAgrupadas(document.getElementById('barras-periodo'), [
      { rotulo: 'mai/26', receitas: 38000, despesas: 11600 },
      { rotulo: 'jun/26', receitas: 51000, despesas: 14700 },
      { rotulo: 'jul/26', receitas: 44000, despesas: 12500 },
      { rotulo: 'ago/26', receitas: 63000, despesas: 17300 },
      { rotulo: 'set/26', receitas: 48000, despesas: 13800 },
      { rotulo: 'out/26', receitas: 58000, despesas: 8900 }
    ]);

    // Dashboard horas
    renderBarrasHorizontais(document.getElementById('barras-projetos-horas'), [
      { rotulo: 'Alfa 26038', valor: 40 },
      { rotulo: 'Alfa 24014', valor: 27 },
      { rotulo: 'Alfa 24017', valor: 17 },
      { rotulo: 'Beta 25102', valor: 15 }
    ], 40);

    // Dashboard reembolso
    renderBarrasHorizontais(document.getElementById('barras-reembolso'), [
      { rotulo: 'Alfa 26038', valor: 1500 },
      { rotulo: 'Alfa 24014', valor: 900 },
      { rotulo: 'Beta 25102', valor: 700 },
      { rotulo: 'Alfa 24017', valor: 660 }
    ], 1500);

    renderDonut(document.getElementById('donut-reembolso'),
      [
        { rotulo: 'Aprovados', pct: 65, cor: NAVY },
        { rotulo: 'Pendentes', pct: 35, cor: AZUL }
      ], null, null);

    // Mockups da landing
    renderLinha(document.getElementById('mock-linha'));
    renderSemana(document.getElementById('mock-semana'));
  });
})();
