/* =====================================================
   CLIC — horas.js
   Tabela de horas a partir da base, filtros, totais
   e visão restrita do funcionário.
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

  // Referência de "semana atual": a data do lançamento mais recente da lista
  // já restrita ao escopo. Os dados do protótipo são de out/2026 — usar o
  // relógio real deixaria a tabela sempre vazia. E como o funcionário enxerga
  // apenas os próprios registros, a janela precisa ser relativa a eles, não ao
  // histórico inteiro.
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
    var d = dados.lerDados();
    var lista = d.registrosHoras.slice();

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
    var corpo = tabela.tBodies[0];
    var cols = colunas();

    if (!lista.length) {
      corpo.innerHTML = '<tr class="linha-vazia"><td colspan="' + (cols.length + 1) + '">' +
        '<svg class="ic ic-18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/></svg>' +
        'Nenhum resultado encontrado.</td></tr>';
    } else {
      corpo.innerHTML = lista.map(function (r) {
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
      }).join('');
    }

    // total do período
    var totalHoras = lista.reduce(function (s, r) { return s + fmt.duracaoEntre(r.inicio, r.fim); }, 0);
    if (totalEl) totalEl.textContent = 'Total no período: ' + fmt.horas(totalHoras);
  }

  [fPeriodo, fColaborador, fProjeto, fCentro].forEach(function (sel) {
    if (sel) sel.addEventListener('change', render);
  });

  // Editar: por ora apenas sinaliza (formulário completo fica no registro manual)
  tabela.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-editar]');
    if (!btn) return;
    if (global.CLIC.toast) CLIC.toast('Use o registro manual para incluir um novo lançamento.', 'info');
  });

  montarFiltros();
  render();
  global.CLIC.horas = {
    render: render,
    // Depois de incluir um registro, volta o filtro para "todo o histórico":
    // com "semana atual" ancorada no lançamento mais recente, a linha nova
    // mudaria a janela e esconderia as anteriores.
    mostrarTodos: function () {
      if (fPeriodo) fPeriodo.value = 'todos';
      render();
    }
  };
})(window);
