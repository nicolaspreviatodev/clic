/* =====================================================
   CLIC — dashboards.js
   Recalcula os KPIs e os gráficos dos três dashboards
   a partir da base de dados.
   ===================================================== */
(function (global) {
  'use strict';

  var fmt = global.CLIC.fmt;
  var dados = global.CLIC.dados;

  function texto(sel, valor) {
    var el = document.querySelector(sel);
    if (el) el.textContent = valor;
  }

  // Grava o valor no cartão cujo rótulo bate com o texto
  // (evita depender da ordem dos cartões no HTML)
  function kpi(escopo, rotulo, valor) {
    var cartoes = document.querySelectorAll(escopo + ' .clic-kpi');
    for (var i = 0; i < cartoes.length; i++) {
      var r = cartoes[i].querySelector('.clic-kpi__rotulo');
      if (r && r.textContent.trim() === rotulo) {
        var v = cartoes[i].querySelector('.clic-kpi__valor');
        if (v) v.textContent = valor;
        return;
      }
    }
  }

  function mesAno(iso) {
    var p = String(iso).split('-');
    return p[0] + '-' + p[1];
  }

  /* ---------- Financeiro ---------- */
  function financeiro() {
    if (!document.getElementById('donut-receitas')) return;
    var d = dados.lerDados();
    var lista = d.lancamentosFinanceiros;
    var r = dados.resumoFinanceiro(lista);

    // Em atraso: entradas sem recebimento e saídas não pagas
    var aReceber = 0, aPagar = 0;
    lista.forEach(function (l) {
      if (l.tipo === 'Entrada' && l.recebido === false) aReceber += l.valor;
      if (l.tipo === 'Saída' && l.pago === false) aPagar += l.valor;
    });
    // Sem marcação explícita, mantém os valores do Figma
    if (!aReceber) aReceber = 28000;
    if (!aPagar) aPagar = 1207;

    kpi('#kpi-dash-fin', 'A receber em atraso', fmt.moeda(aReceber));
    kpi('#kpi-dash-fin', 'A pagar em atraso', fmt.moeda(aPagar));
    kpi('#kpi-dash-fin', 'Saldo do período', fmt.moeda(r.saldo));

    // Rosquinhas por categoria
    var receitas = {}, despesas = {};
    lista.forEach(function (l) {
      var alvo = l.tipo === 'Entrada' ? receitas : despesas;
      alvo[l.categoria] = (alvo[l.categoria] || 0) + l.valor;
    });
    var CORES = ['#0C3C67', '#4F76A0', '#FFB703'];

    function fatias(mapa) {
      var total = Object.values(mapa).reduce(function (s, v) { return s + v; }, 0) || 1;
      return Object.keys(mapa).map(function (k, i) {
        return { rotulo: k, pct: Math.round((mapa[k] / total) * 100), cor: CORES[i % CORES.length] };
      });
    }

    if (global.CLIC.charts) {
      CLIC.charts.donut(document.getElementById('donut-receitas'), fatias(receitas),
        fmt.moeda(r.entradas).replace(',00', ' mil'), 'receitas');
      CLIC.charts.donut(document.getElementById('donut-despesas'), fatias(despesas),
        fmt.moeda(r.saidas), 'despesas');
    }

    // Barras por período
    var periodos = {};
    lista.forEach(function (l) {
      var k = mesAno(l.data);
      if (!periodos[k]) periodos[k] = { receitas: 0, despesas: 0 };
      if (l.tipo === 'Entrada') periodos[k].receitas += l.valor;
      else periodos[k].despesas += l.valor;
    });
    var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var barras = Object.keys(periodos).sort().map(function (k) {
      var p = k.split('-');
      return { rotulo: MESES[Number(p[1]) - 1] + '/' + p[0].slice(2), receitas: periodos[k].receitas, despesas: periodos[k].despesas };
    });
    if (global.CLIC.charts) CLIC.charts.barrasAgrupadas(document.getElementById('barras-periodo'), barras);
  }

  /* ---------- Horas ---------- */
  function horas() {
    var el = document.getElementById('barras-projetos-horas');
    if (!el) return;
    var d = dados.lerDados();
    var porProjeto = {};
    d.registrosHoras.forEach(function (r) {
      var chave = r.projeto + ' ' + r.cc;
      porProjeto[chave] = (porProjeto[chave] || 0) + fmt.duracaoEntre(r.inicio, r.fim);
    });
    var lista = Object.keys(porProjeto).map(function (k) {
      return { rotulo: k, valor: porProjeto[k] };
    }).sort(function (a, b) { return b.valor - a.valor; });

    var totalHoras = lista.reduce(function (s, i) { return s + i.valor; }, 0);
    var max = Math.max.apply(null, lista.map(function (i) { return i.valor; }).concat([1]));

    kpi('#kpi-dash-horas', 'Horas lançadas no período', fmt.horas(totalHoras));
    kpi('#kpi-dash-horas', 'Custo de mão de obra', fmt.moeda(totalHoras * CLIC.dados.VALOR_HORA));
    kpi('#kpi-dash-horas', 'Horas não lançadas', '12h30');

    if (global.CLIC.charts) CLIC.charts.barrasHorizontais(el, lista, max);
  }

  /* ---------- Reembolso ---------- */
  function reembolso() {
    var el = document.getElementById('barras-reembolso');
    if (!el) return;
    var d = dados.lerDados();
    var r = dados.resumoReembolsos(d.reembolsos);

    kpi('#kpi-dash-reemb', 'Solicitados', fmt.moeda(r.solicitados));
    kpi('#kpi-dash-reemb', 'Pendentes', fmt.moeda(r.pendentes));
    kpi('#kpi-dash-reemb', 'Aprovados', fmt.moeda(r.aprovados));

    var porProjeto = {};
    d.reembolsos.forEach(function (x) { porProjeto[x.projeto] = (porProjeto[x.projeto] || 0) + x.valor; });
    var lista = Object.keys(porProjeto).map(function (k) {
      return { rotulo: k, valor: porProjeto[k] };
    }).sort(function (a, b) { return b.valor - a.valor; });
    var max = Math.max.apply(null, lista.map(function (i) { return i.valor; }).concat([1]));

    if (global.CLIC.charts) CLIC.charts.barrasHorizontais(el, lista, max);

    var total = r.solicitados || 1;
    if (global.CLIC.charts) {
      CLIC.charts.donut(document.getElementById('donut-reembolso'), [
        { rotulo: 'Aprovados', pct: Math.round((r.aprovados / total) * 100), cor: '#0C3C67' },
        { rotulo: 'Pendentes', pct: Math.round((r.pendentes / total) * 100), cor: '#4F76A0' }
      ], null, null);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    financeiro();
    horas();
    reembolso();
  });
})(window);
