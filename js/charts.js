/* =====================================================
   CLIC — charts.js
   Gráficos em SVG puro, com destaque no hover, tooltip,
   animação de entrada e API para os dashboards.
   ===================================================== */
(function (global) {
  'use strict';

  var NAVY = '#0C3C67';
  var AZUL = '#4F76A0';
  var AMARELO = '#FFB703';
  var GRADE = '#E3EAF3';
  var TEXTO = '#395054';
  var REDUZ = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ---------- Tooltip ---------- */
  function prepararTip(el) {
    el.classList.add('clic-chart');
    var tip = el.querySelector('.clic-chart__tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'clic-chart__tip';
      tip.setAttribute('role', 'status');
      el.appendChild(tip);
    }
    return tip;
  }

  function ligarTip(el, formas, textos) {
    var tip = prepararTip(el);
    formas.forEach(function (forma, i) {
      if (!forma || !textos[i]) return;
      forma.setAttribute('tabindex', '0');
      forma.setAttribute('role', 'img');
      forma.setAttribute('aria-label', textos[i]);
      var mostrar = function () {
        tip.textContent = textos[i];
        tip.classList.add('visivel');
        formas.forEach(function (f) { if (f) f.setAttribute('opacity', f === forma ? '1' : '0.55'); });
      };
      var esconder = function () {
        tip.classList.remove('visivel');
        formas.forEach(function (f) { if (f) f.setAttribute('opacity', '1'); });
      };
      forma.addEventListener('mouseenter', mostrar);
      forma.addEventListener('focus', mostrar);
      forma.addEventListener('mouseleave', esconder);
      forma.addEventListener('blur', esconder);
    });
  }

  /* ---------- Animação de entrada ---------- */
  // O timestamp do primeiro requestAnimationFrame pode ser anterior ao
  // performance.now() capturado, o que deixaria o progresso negativo.
  function progresso(t, ini, dur) {
    var p = (t - ini) / dur;
    return p < 0 ? 0 : (p > 1 ? 1 : p);
  }

  function animarAlturas(formas, alvos) {
    if (REDUZ) return;
    var ini = performance.now();
    var dur = 600;
    formas.forEach(function (f, i) {
      f.setAttribute('y', alvos[i].y + alvos[i].h);
      f.setAttribute('height', 0);
    });
    function passo(t) {
      var p = progresso(t, ini, dur);
      var e = 1 - Math.pow(1 - p, 3);
      formas.forEach(function (f, i) {
        var h = Math.max(0, alvos[i].h * e);
        f.setAttribute('height', h);
        f.setAttribute('y', alvos[i].y + (alvos[i].h - h));
      });
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  function animarLarguras(formas, alvos) {
    if (REDUZ) return;
    var ini = performance.now();
    var dur = 600;
    formas.forEach(function (f) { f.setAttribute('width', 0); });
    function passo(t) {
      var p = progresso(t, ini, dur);
      var e = 1 - Math.pow(1 - p, 3);
      formas.forEach(function (f, i) {
        f.setAttribute('width', Math.max(0, alvos[i].w * e));
      });
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* ---------- Donut ---------- */
  function donut(el, dados, centroValor, centroRotulo) {
    if (!el || !dados || !dados.length) return;
    var W = 220, H = 176, cx = 88, cy = 88, r = 66, esp = 22;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img' });
    var total = dados.reduce(function (s, d) { return s + d.pct; }, 0) || 100;
    var ang = -Math.PI / 2;
    var formas = [], textos = [];

    dados.forEach(function (d) {
      var frac = d.pct / total;
      var fim = ang + frac * Math.PI * 2;
      var x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
      var x2 = cx + r * Math.cos(fim), y2 = cy + r * Math.sin(fim);
      var grande = frac > 0.5 ? 1 : 0;
      var path = svgEl('path', {
        d: 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + grande + ' 1 ' + x2 + ' ' + y2,
        fill: 'none', stroke: d.cor, 'stroke-width': esp, 'stroke-linecap': 'butt'
      });
      svg.appendChild(path);
      formas.push(path);
      textos.push(d.rotulo + ': ' + d.pct + '%');
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
    ligarTip(el, formas, textos);
  }

  /* ---------- Barras verticais agrupadas ---------- */
  var estadoBarras = {};

  function barrasAgrupadas(el, dados, chave) {
    if (!el || !dados || !dados.length) return;
    var id = chave || (el.id || 'barras');
    var ocultas = estadoBarras[id] || {};

    var W = 1020, H = 240, base = 228, topo = 0;
    var max = 0;
    dados.forEach(function (d) { max = Math.max(max, d.receitas || 0, d.despesas || 0); });
    max = Math.max(max, 1000);
    var escala = Math.pow(10, Math.floor(Math.log10(max)));
    max = Math.ceil(max / escala) * escala;

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    for (var v = 0; v <= max; v += max / 3) {
      var y = base - (v / max) * (base - topo);
      svg.appendChild(svgEl('line', { x1: 0, y1: y, x2: W, y2: y, stroke: GRADE, 'stroke-width': 1 }));
    }

    var grupoW = W / dados.length;
    var formas = [], alvos = [], textos = [];

    dados.forEach(function (d, i) {
      var x0 = i * grupoW + grupoW / 2 - 22;
      if (!ocultas.receitas) {
        var hR = (d.receitas / max) * (base - topo);
        var r = svgEl('rect', { x: x0, y: base - hR, width: 38, height: hR, fill: NAVY });
        svg.appendChild(r);
        formas.push(r); alvos.push({ y: base - hR, h: hR });
        textos.push(d.rotulo + ' · receitas: ' + (global.CLIC ? CLIC.fmt.moeda(d.receitas) : d.receitas));
      }
      if (!ocultas.despesas) {
        var hD = (d.despesas / max) * (base - topo);
        var m = svgEl('rect', { x: x0 + 44, y: base - hD, width: 38, height: hD, fill: AMARELO });
        svg.appendChild(m);
        formas.push(m); alvos.push({ y: base - hD, h: hD });
        textos.push(d.rotulo + ' · despesas: ' + (global.CLIC ? CLIC.fmt.moeda(d.despesas) : d.despesas));
      }
      var t = svgEl('text', { x: i * grupoW + grupoW / 2, y: H - 2, 'text-anchor': 'middle', fill: TEXTO, 'font-family': 'Inter, sans-serif', 'font-size': 12 });
      t.textContent = d.rotulo;
      svg.appendChild(t);
    });

    el.innerHTML = '';
    el.appendChild(svg);
    ligarTip(el, formas, textos);
    animarAlturas(formas, alvos);

    // guarda para o liga/desliga da legenda
    estadoBarras[id] = ocultas;
    el._dadosBarras = dados;
    el._idBarras = id;
  }

  // Legenda das barras agrupadas liga/desliga a série
  function ligarLegendaBarras() {
    document.querySelectorAll('.dash-barras__legenda span').forEach(function (span) {
      if (span.dataset.ligado === 'sim') return;
      span.dataset.ligado = 'sim';
      span.setAttribute('role', 'button');
      span.setAttribute('tabindex', '0');
      span.classList.add('clic-legenda-toggle');
      var alternar = function () {
        var alvo = document.getElementById('barras-periodo');
        if (!alvo || !alvo._dadosBarras) return;
        var id = alvo._idBarras;
        var estado = estadoBarras[id] || {};
        var serie = /receita/i.test(span.textContent) ? 'receitas' : 'despesas';
        estado[serie] = !estado[serie];
        estadoBarras[id] = estado;
        span.classList.toggle('desligada', !!estado[serie]);
        barrasAgrupadas(alvo, alvo._dadosBarras, id);
      };
      span.addEventListener('click', alternar);
      span.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); }
      });
    });
  }

  /* ---------- Barras horizontais ---------- */
  function barrasHorizontais(el, dados, max) {
    if (!el || !dados || !dados.length) return;
    var W = 604, linhaH = 57, H = dados.length * linhaH + 20;
    var maior = Math.max.apply(null, dados.map(function (d) { return d.valor; }).concat([max || 1]));
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    var formas = [], alvos = [], textos = [];

    dados.forEach(function (d, i) {
      var y = i * linhaH + 10;
      var w = Math.max(4, (d.valor / maior) * (W - 60));
      var rect = svgEl('rect', { x: 0, y: y, width: w, height: 38, fill: NAVY });
      svg.appendChild(rect);
      formas.push(rect); alvos.push({ y: y, w: w });
      textos.push(d.rotulo + ': ' + (global.CLIC ? CLIC.fmt.horas(d.valor) : d.valor));
      var t = svgEl('text', { x: 0, y: y + 58, fill: TEXTO, 'font-family': 'Inter, sans-serif', 'font-size': 12 });
      t.textContent = d.rotulo;
      svg.appendChild(t);
    });

    el.innerHTML = '';
    el.appendChild(svg);
    ligarTip(el, formas, textos);
    animarLarguras(formas, alvos);
  }

  /* ---------- Gráfico de linha (mockup landing) ---------- */
  function linha(el) {
    if (!el) return;
    var W = 422, H = 116;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    [6, 40, 74].forEach(function (y) {
      svg.appendChild(svgEl('line', { x1: 34, y1: y, x2: 412, y2: y, stroke: AZUL, 'stroke-opacity': .2, 'stroke-width': 1 }));
    });
    var pontos = [[34, 80], [90, 70], [150, 74], [210, 52], [270, 58], [330, 34], [412, 26]];
    var d = pontos.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    svg.appendChild(svgEl('path', { d: d + ' L412 96 L34 96 Z', fill: '#EAF1F9' }));
    var traco = svgEl('path', { d: d, fill: 'none', stroke: AZUL, 'stroke-width': 2.5 });
    svg.appendChild(traco);
    el.innerHTML = '';
    el.appendChild(svg);

    // desenha a linha (D6) — desligado com prefers-reduced-motion
    if (!REDUZ && traco.getTotalLength) {
      var comp = traco.getTotalLength();
      traco.style.strokeDasharray = comp;
      traco.style.strokeDashoffset = comp;
      traco.animate(
        [{ strokeDashoffset: comp }, { strokeDashoffset: 0 }],
        { duration: 600, easing: 'ease-out', fill: 'forwards' }
      );
    }
  }

  /* ---------- Barras semanais (mockup horas) ---------- */
  function semana(el) {
    if (!el) return;
    var W = 376, H = 96;
    var alturas = [64, 80, 72, 88, 56, 32, 96];
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    var formas = [], alvos = [];
    alturas.forEach(function (h, i) {
      var rect = svgEl('rect', {
        x: i * 54.67, y: H - h, width: 48, height: h, rx: 6,
        fill: i === 3 ? AMARELO : AZUL
      });
      svg.appendChild(rect);
      formas.push(rect); alvos.push({ y: H - h, h: h });
    });
    el.innerHTML = '';
    el.appendChild(svg);
    animarAlturas(formas, alvos);
  }

  /* ---------- Contagem animada de KPI ---------- */
  function contar(el, valorFinal, formato) {
    if (!el) return;
    if (REDUZ) { el.textContent = formato(valorFinal); return; }
    var ini = performance.now();
    var dur = 600;
    function passo(t) {
      var p = Math.min(1, (t - ini) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = formato(valorFinal * e);
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  global.CLIC = global.CLIC || {};
  global.CLIC.charts = {
    donut: donut,
    barrasAgrupadas: barrasAgrupadas,
    barrasHorizontais: barrasHorizontais,
    linha: linha,
    semana: semana,
    contar: contar,
    ligarLegendaBarras: ligarLegendaBarras
  };

  /* ---------- Inicialização das ilustrações da landing ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    linha(document.getElementById('mock-linha'));
    semana(document.getElementById('mock-semana'));
    ligarLegendaBarras();
  });
})(window);
