/* =====================================================
   CLIC — horas.js
   Tabela de horas, filtros, persistência, paginação e total.
   ===================================================== */
(function (global) {
  'use strict';

  var tabela = document.getElementById('tabela-horas');
  if (!tabela) return;

  var fmt = global.CLIC.fmt;
  var dados = global.CLIC.dados;
  var ehFuncionario = tabela.getAttribute('data-escopo') === 'proprio';
  var sessao = global.CLIC.sessao ? CLIC.sessao.ler() : null;
  var meuNome = sessao ? sessao.nome : null;

  var fPeriodo = document.getElementById('f-periodo');
  var fColaborador = document.getElementById('f-colaborador');
  var fProjeto = document.getElementById('f-projeto');
  var fCentro = document.getElementById('f-centro');
  var totalEl = document.getElementById('horas-total');
  var chavePagina = ehFuncionario ? 'horas-funcionario' : 'horas';
  var idFiltros = ehFuncionario ? 'filtros-horas-funcionario' : 'filtros-horas';

  function referencia(listaBase) {
    var maior = null;
    (listaBase || []).forEach(function (r) {
      if (!maior || r.data > maior) maior = r.data;
    });
    return maior ? new Date(maior + 'T00:00:00') : new Date();
  }

  function dentroDoPeriodo(iso, periodo, ref) {
    if (!periodo || periodo === 'todos') return true;
    var data = new Date(iso + 'T00:00:00');
    if (periodo === 'semana') {
      var ini = new Date(ref);
      var dia = ini.getDay();
      ini.setDate(ini.getDate() - (dia === 0 ? 6 : dia - 1));
      ini.setHours(0, 0, 0, 0);
      var fim = new Date(ini);
      fim.setDate(fim.getDate() + 7);
      return data >= ini && data < fim;
    }
    if (periodo === 'mes') {
      return data.getMonth() === ref.getMonth() && data.getFullYear() === ref.getFullYear();
    }
    return true;
  }

  function listar() {
    var lista = dados.lerDados().registrosHoras.slice();
    if (ehFuncionario && meuNome) {
      lista = lista.filter(function (r) { return r.colaborador === meuNome; });
    }
    var ref = referencia(lista);
    if (fPeriodo) lista = lista.filter(function (r) { return dentroDoPeriodo(r.data, fPeriodo.value, ref); });
    if (fColaborador && fColaborador.value) lista = lista.filter(function (r) { return r.colaborador === fColaborador.value; });
    if (fProjeto && fProjeto.value) lista = lista.filter(function (r) { return r.projeto === fProjeto.value; });
    if (fCentro && fCentro.value) lista = lista.filter(function (r) { return r.cc === fCentro.value; });
    lista.sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); });
    return lista;
  }

  function montarFiltros() {
    var d = dados.lerDados();
    if (fColaborador) {
      var nomes = {};
      d.registrosHoras.forEach(function (r) { nomes[r.colaborador] = true; });
      fColaborador.innerHTML = '<option value="">Colaborador: Todos</option>' +
        Object.keys(nomes).sort().map(function (n) {
          return '<option value="' + n + '">Colaborador: ' + n.split(' ')[0] + '</option>';
        }).join('');
    }
    if (fProjeto) {
      fProjeto.innerHTML = '<option value="">Projeto: Todos</option>' +
        '<option value="Projeto Alfa">Projeto: Alfa</option>' +
        '<option value="Projeto Beta">Projeto: Beta</option>';
    }
    if (fCentro) {
      var ccs = {};
      d.registrosHoras.forEach(function (r) { if (r.cc && r.cc !== '—') ccs[r.cc] = true; });
      fCentro.innerHTML = '<option value="">Centro de custo: Todos</option>' +
        Object.keys(ccs).sort().map(function (c) {
          return '<option value="' + c + '">Centro de custo: ' + c + '</option>';
        }).join('');
    }
  }

  function colunas() {
    return ehFuncionario
      ? ['data', 'projeto', 'cc', 'descricao', 'inicio', 'fim', 'horas']
      : ['data', 'projeto', 'cc', 'colaborador', 'descricao', 'inicio', 'fim', 'horas', 'custo'];
  }

  function render() {
    var lista = listar();
    var cols = colunas();
    var linhas = lista.map(function (r) {
      var h = fmt.duracaoEntre(r.inicio, r.fim);
      var celulas = {
        data: '<td>' + fmt.dataCurta(r.data) + '</td>',
        projeto: '<td>' + r.projeto + '</td>',
        cc: '<td>' + r.cc + '</td>',
        colaborador: '<td>' + r.colaborador + '</td>',
        descricao: '<td>' + r.descricao + '</td>',
        inicio: '<td>' + r.inicio + '</td>',
        fim: '<td>' + r.fim + '</td>',
        horas: '<td>' + fmt.horas(h) + '</td>',
        custo: '<td class="num">' + fmt.moeda(h * CLIC.dados.VALOR_HORA) + '</td>'
      };
      return '<tr>' + cols.map(function (c) { return celulas[c]; }).join('') +
        '<td><button class="acao-editar" type="button" data-editar="' + r.id + '">Editar</button></td></tr>';
    });
    var temFiltro = !!((fPeriodo && fPeriodo.value && fPeriodo.value !== 'todos') ||
      (fColaborador && fColaborador.value) || (fProjeto && fProjeto.value) || (fCentro && fCentro.value));
    global.CLIC.tabela.barraLimpar(idFiltros, temFiltro, limparFiltros);
    global.CLIC.tabela.paginar({
      id: 'tabela-horas', linhas: linhas, colspan: cols.length + 1, comLimpar: temFiltro, rerender: render
    });
    var totalHoras = lista.reduce(function (s, r) { return s + fmt.duracaoEntre(r.inicio, r.fim); }, 0);
    if (totalEl) totalEl.textContent = 'Total no período: ' + fmt.horas(totalHoras);
  }

  function limparFiltros(campo) {
    var soCampo = campo && typeof campo.value === 'string';
    if (soCampo) {
      // o período usa "todos" como valor neutro
      var temTodos = campo.tagName === 'SELECT' &&
        [].some.call(campo.options, function (o) { return o.value === 'todos'; });
      campo.value = temTodos ? 'todos' : '';
    } else {
      if (fPeriodo) fPeriodo.value = 'todos';
      if (fColaborador) fColaborador.value = '';
      if (fProjeto) fProjeto.value = '';
      if (fCentro) fCentro.value = '';
    }
    salvarFiltros();
    global.CLIC.tabela.reiniciarPagina('tabela-horas');
    render();
  }

  function restaurarFiltros() {
    var f = global.CLIC.tabela.salvos(chavePagina);
    if (fPeriodo && f.periodo) fPeriodo.value = f.periodo;
    if (fColaborador && f.colaborador) fColaborador.value = f.colaborador;
    if (fProjeto && f.projeto) fProjeto.value = f.projeto;
    if (fCentro && f.centro) fCentro.value = f.centro;
  }

  function salvarFiltros() {
    global.CLIC.tabela.salvar(chavePagina, {
      periodo: fPeriodo ? fPeriodo.value : '',
      colaborador: fColaborador ? fColaborador.value : '',
      projeto: fProjeto ? fProjeto.value : '',
      centro: fCentro ? fCentro.value : ''
    });
  }

  [fPeriodo, fColaborador, fProjeto, fCentro].forEach(function (sel) {
    if (sel) sel.addEventListener('change', function () {
      global.CLIC.tabela.reiniciarPagina('tabela-horas');
      render();
      salvarFiltros();
    });
  });

  global.CLIC.tabela.atalhos({ principal: fProjeto || fPeriodo, aoEsc: limparFiltros });
  tabela.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-editar]');
    if (btn && global.CLIC.toast) CLIC.toast('Use o registro manual para incluir um novo lançamento.', 'info');
  });

  montarFiltros();
  restaurarFiltros();
  global.CLIC.tabela.ligarLimparVazio('tabela-horas', limparFiltros);
  render();
  global.CLIC.horas = {
    render: render,
    mostrarTodos: function () {
      if (fPeriodo) fPeriodo.value = 'todos';
      global.CLIC.tabela.reiniciarPagina('tabela-horas');
      render();
      salvarFiltros();
    }
  };
})(window);
