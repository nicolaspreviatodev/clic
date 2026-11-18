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

    var linhas = lista.map(function (p) {
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
    });

    var temFiltro = !!((fCC && fCC.value.trim()) || (fNome && fNome.value.trim()) ||
      (fResp && fResp.value.trim()) || (fSituacao && fSituacao.value.trim()));

    global.CLIC.tabela.barraLimpar('filtros-projetos', temFiltro, limparFiltros);
    global.CLIC.tabela.paginar({
      id: 'tabela-projetos', linhas: linhas, colspan: 8, comLimpar: temFiltro, rerender: render
    });
  }

  function limparFiltros(campo) {
    var soCampo = campo && typeof campo.value === 'string';
    if (soCampo) {
      campo.value = '';
    } else {
      [fCC, fNome, fResp, fSituacao].forEach(function (c) { if (c) c.value = ''; });
    }
    salvarFiltros();
    global.CLIC.tabela.reiniciarPagina('tabela-projetos');
    render();
  }

  function restaurarFiltros() {
    var f = global.CLIC.tabela.salvos('projetos');
    if (fCC && f.cc) fCC.value = f.cc;
    if (fNome && f.nome) fNome.value = f.nome;
    if (fResp && f.responsavel) fResp.value = f.responsavel;
    if (fSituacao && f.situacao) fSituacao.value = f.situacao;
  }

  function salvarFiltros() {
    global.CLIC.tabela.salvar('projetos', {
      cc: fCC ? fCC.value : '',
      nome: fNome ? fNome.value : '',
      responsavel: fResp ? fResp.value : '',
      situacao: fSituacao ? fSituacao.value : ''
    });
  }

  function aplicar() {
    global.CLIC.tabela.reiniciarPagina('tabela-projetos');
    render();
    salvarFiltros();
  }

  if (btnFiltrar) btnFiltrar.addEventListener('click', aplicar);
  [fCC, fNome, fResp, fSituacao].forEach(function (campo) {
    if (!campo) return;
    campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); aplicar(); } });
    campo.addEventListener('change', aplicar);
  });

  // D7: "/" foca o primeiro filtro; "Esc" limpa
  global.CLIC.tabela.atalhos({ principal: fCC, aoEsc: limparFiltros });

  restaurarFiltros();
  global.CLIC.tabela.ligarLimparVazio('tabela-projetos', limparFiltros);
  render();
  global.CLIC.projetos = { render: render };
})(window);
