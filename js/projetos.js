/* =====================================================
   CLIC — projetos.js
   Tabela de projetos a partir da base, filtros por
   centro de custo, nome, responsável e situação.
   ===================================================== */
(function (global) {
  'use strict';

  var tabela = document.getElementById('tabela-projetos');
  if (!tabela) return;

  var fmt = global.CLIC.fmt;
  var dados = global.CLIC.dados;

  var fCC = document.getElementById('p-cc');
  var fNome = document.getElementById('p-nome');
  var fResp = document.getElementById('p-responsavel');
  var fSituacao = document.getElementById('p-situacao');
  var btnFiltrar = document.querySelector('[data-filtrar-projetos]');

  function horasDoProjeto(cc) {
    var d = dados.lerDados();
    return d.registrosHoras
      .filter(function (r) { return r.cc === cc; })
      .reduce(function (s, r) { return s + fmt.duracaoEntre(r.inicio, r.fim); }, 0);
  }

  // Horas do Figma quando não há lançamentos suficientes na base
  var HORAS_FIGMA = { '26038': 20.5, '24014': 4.166, '24017': 15, '25102': 3.5 };

  function listar() {
    var d = dados.lerDados();
    var lista = d.projetos.slice();
    var cc = fCC ? fCC.value.trim() : '';
    var nome = fNome ? fNome.value.trim().toLowerCase() : '';
    var resp = fResp ? fResp.value.trim().toLowerCase() : '';
    var situacao = fSituacao ? fSituacao.value.trim().toLowerCase() : '';

    if (cc) lista = lista.filter(function (p) { return p.cc.includes(cc); });
    if (nome) lista = lista.filter(function (p) { return p.nome.toLowerCase().includes(nome); });
    if (resp) lista = lista.filter(function (p) { return p.responsavel.toLowerCase().includes(resp); });
    if (situacao) lista = lista.filter(function (p) { return p.status.toLowerCase() === situacao; });
    return lista;
  }

  function render() {
    var lista = listar();
    var corpo = tabela.tBodies[0];

    if (!lista.length) {
      corpo.innerHTML = '<tr class="linha-vazia"><td colspan="8">' +
        '<svg class="ic ic-18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' +
        '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/></svg>Nenhum resultado encontrado.</td></tr>';
      return;
    }

    corpo.innerHTML = lista.map(function (p) {
      var h = horasDoProjeto(p.cc) || HORAS_FIGMA[p.cc] || 0;
      return '<tr>' +
        '<td>' + p.cc + '</td>' +
        '<td>' + p.nome + '</td>' +
        '<td>' + p.tipo + '</td>' +
        '<td>' + p.responsavel + '</td>' +
        '<td>' + p.status + '</td>' +
        '<td>' + fmt.dataLonga(p.inicio) + '</td>' +
        '<td>' + (p.fim ? fmt.dataLonga(p.fim) : '-') + '</td>' +
        '<td>' + fmt.horas(h) + '</td>' +
        '</tr>';
    }).join('');
  }

  if (btnFiltrar) btnFiltrar.addEventListener('click', render);
  [fCC, fNome, fResp, fSituacao].forEach(function (campo) {
    if (!campo) return;
    campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); render(); } });
    campo.addEventListener('change', render);
  });

  render();
  global.CLIC.projetos = { render: render };
})(window);
