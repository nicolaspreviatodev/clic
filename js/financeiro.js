/* =====================================================
   CLIC — financeiro.js
   KPIs calculados, filtros, ordenação, alternar "Pago"
   e modal de novo lançamento.
   ===================================================== */
(function (global) {
  'use strict';

  var tbody = document.querySelector('#tabela-financeiro tbody');
  if (!tbody) return;

  var fmt = global.CLIC.fmt;
  var dados = global.CLIC.dados;

  var filtroPeriodo = document.getElementById('filtro-periodo');
  var filtroProjeto = document.getElementById('filtro-projeto');
  var filtroTipo = document.getElementById('filtro-tipo');
  var ordem = { campo: null, asc: true };

  function mesAno(iso) {
    var p = String(iso).split('-');
    return p[0] + '-' + p[1];
  }

  function rotuloPeriodo(iso) {
    var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var p = String(iso).split('-');
    return MESES[Number(p[1]) - 1] + '/' + p[0];
  }

  /* ---------- Seleção dos filtros ---------- */
  function montarFiltros() {
    var d = dados.lerDados();
    if (filtroPeriodo) {
      var periodos = {};
      d.lancamentosFinanceiros.forEach(function (l) { periodos[mesAno(l.data)] = true; });
      var chaves = Object.keys(periodos).sort();
      filtroPeriodo.innerHTML = chaves.map(function (k) {
        return '<option value="' + k + '">Período: ' + rotuloPeriodo(k + '-01') + '</option>';
      }).join('');
      // out/2026 é o período do Figma
      if (periodos['2026-10']) filtroPeriodo.value = '2026-10';
      else if (chaves.length) filtroPeriodo.value = chaves[chaves.length - 1];
    }
    if (filtroProjeto) {
      var projetos = {};
      d.lancamentosFinanceiros.forEach(function (l) { projetos[l.projeto] = true; });
      filtroProjeto.innerHTML = '<option value="">Projeto: Todos</option>' +
        Object.keys(projetos).sort().map(function (p) {
          return '<option value="' + p + '">Projeto: ' + p.replace('Projeto ', '') + '</option>';
        }).join('');
    }
    if (filtroTipo) {
      filtroTipo.innerHTML = '<option value="">Tipo: Todos</option>' +
        '<option value="Entrada">Tipo: Entrada</option>' +
        '<option value="Saída">Tipo: Saída</option>';
    }
  }

  /* ---------- Filtro + ordenação ---------- */
  function listar() {
    var d = dados.lerDados();
    var lista = d.lancamentosFinanceiros.slice();

    var periodo = filtroPeriodo ? filtroPeriodo.value : '';
    var projeto = filtroProjeto ? filtroProjeto.value : '';
    var tipo = filtroTipo ? filtroTipo.value : '';

    if (periodo) lista = lista.filter(function (l) { return mesAno(l.data) === periodo; });
    if (projeto) lista = lista.filter(function (l) { return l.projeto === projeto; });
    if (tipo) lista = lista.filter(function (l) { return l.tipo === tipo; });

    if (ordem.campo) {
      lista.sort(function (a, b) {
        var x = a[ordem.campo], y = b[ordem.campo];
        if (typeof x === 'number' && typeof y === 'number') return ordem.asc ? x - y : y - x;
        return ordem.asc
          ? String(x).localeCompare(String(y), 'pt-BR')
          : String(y).localeCompare(String(x), 'pt-BR');
      });
    }
    return lista;
  }

  /* ---------- KPIs ---------- */
  function pintarKpis(lista) {
    var r = dados.resumoFinanceiro(lista);
    var els = document.querySelectorAll('#kpi-financeiro .clic-kpi__valor');
    if (els.length === 3) {
      els[0].textContent = fmt.moeda(r.entradas);
      els[1].textContent = fmt.moeda(r.saidas);
      els[2].textContent = fmt.moeda(r.saldo);
    }
  }

  /* ---------- Tabela ---------- */
  function celulaPago(l) {
    if (l.tipo === 'Entrada') return '<td>—</td>';
    var sim = l.pago !== false;
    return '<td><button class="clic-badge ' + (sim ? 'clic-badge--sim' : 'clic-badge--nao') +
      '" type="button" data-pago="' + l.id + '" aria-label="Alternar pago" title="Alternar pago">' +
      (sim ? 'Sim' : 'Não') + '</button></td>';
  }

  function pintarTabela(lista) {
    if (!lista.length) {
      tbody.innerHTML = '<tr class="linha-vazia"><td colspan="10">' +
        '<svg class="ic ic-18" viewBox="0 0 24 24" aria-hidden="true"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/>' +
        '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
        'Nenhum resultado encontrado.</td></tr>';
      return;
    }
    tbody.innerHTML = lista.map(function (l) {
      return '<tr>' +
        '<td>' + fmt.dataCurta(l.data) + '</td>' +
        '<td>' + l.descricao + '</td>' +
        '<td>' + l.cc + '</td>' +
        '<td>' + l.projeto + '</td>' +
        '<td>' + l.categoria + '</td>' +
        '<td>' + l.notaFiscal + '</td>' +
        '<td>' + l.custoProjeto + '</td>' +
        '<td class="' + (l.tipo === 'Entrada' ? 'pos' : 'neg') + '">' + l.tipo + '</td>' +
        '<td class="num">' + fmt.moeda(l.valor) + '</td>' +
        celulaPago(l) +
        '</tr>';
    }).join('');
  }

  function render() {
    var lista = listar();
    pintarTabela(lista);
    pintarKpis(lista);
    marcarOrdem();
  }

  /* ---------- Ordenação por cabeçalho ---------- */
  var CAMPOS = {
    'Data': 'data', 'Descrição': 'descricao', 'CC': 'cc', 'Projeto': 'projeto',
    'Categoria': 'categoria', 'Nota fiscal': 'notaFiscal', 'Custo de projeto': 'custoProjeto',
    'Tipo': 'tipo', 'Valor': 'valor', 'Pago': 'pago'
  };

  function marcarOrdem() {
    document.querySelectorAll('#tabela-financeiro thead th').forEach(function (th) {
      var nome = th.textContent.trim();
      th.classList.toggle('ordenada', CAMPOS[nome] === ordem.campo);
      var seta = th.querySelector('.th-seta');
      if (seta) seta.remove();
      if (CAMPOS[nome] === ordem.campo) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'ic ic-12 th-seta');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = ordem.asc
          ? '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>'
          : '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>';
        th.appendChild(svg);
      }
    });
  }

  document.querySelectorAll('#tabela-financeiro thead th').forEach(function (th) {
    var campo = CAMPOS[th.textContent.trim()];
    if (!campo) return;
    th.classList.add('ordenavel');
    th.setAttribute('tabindex', '0');
    th.setAttribute('role', 'button');
    var alternar = function () {
      if (ordem.campo === campo) ordem.asc = !ordem.asc;
      else { ordem.campo = campo; ordem.asc = true; }
      render();
    };
    th.addEventListener('click', alternar);
    th.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); }
    });
  });

  /* ---------- Alternar pago ---------- */
  tbody.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-pago]');
    if (!btn) return;
    var id = Number(btn.getAttribute('data-pago'));
    var d = dados.lerDados();
    d.lancamentosFinanceiros.forEach(function (l) {
      if (l.id === id) l.pago = l.pago === false ? true : false;
    });
    dados.salvarDados(d);
    render();
    if (global.CLIC.toast) CLIC.toast('Status de pagamento atualizado.', 'sucesso');
  });

  /* ---------- Novo lançamento ---------- */
  var btnNovo = document.querySelector('[data-novo-lancamento]');
  var formNovo = document.getElementById('form-lancamento');
  if (btnNovo && formNovo && window.bootstrap) {
    var modal = new bootstrap.Modal(document.getElementById('modal-lancamento'));
    var camposProjeto = document.getElementById('novo-projeto');
    var d0 = dados.lerDados();
    var nomes = {};
    d0.projetos.forEach(function (p) { nomes[p.nome] = true; });
    if (camposProjeto) {
      camposProjeto.innerHTML = Object.keys(nomes).map(function (n) {
        return '<option>' + n + '</option>';
      }).join('');
    }

    // A data nasce no período que está sendo visto: um lançamento novo não pode
    // "sumir" da tabela por cair num mês fora do filtro atual.
    btnNovo.addEventListener('click', function () {
      var campoData = document.getElementById('novo-data');
      var hoje = fmt.isoDeHoje();
      var periodoAtual = filtroPeriodo ? filtroPeriodo.value : '';
      if (campoData && !campoData.value) {
        campoData.value = (periodoAtual && mesAno(hoje) !== periodoAtual)
          ? periodoAtual + '-01'
          : hoje;
      }
      modal.show();
    });

    formNovo.addEventListener('submit', function (e) {
      e.preventDefault();
      var valor = Number(String(document.getElementById('novo-valor').value).replace(/\./g, '').replace(',', '.'));
      if (!valor || valor <= 0) {
        if (global.CLIC.toast) CLIC.toast('Informe um valor maior que zero.', 'erro');
        document.getElementById('novo-valor').focus();
        return;
      }
      var d = dados.lerDados();
      d.lancamentosFinanceiros.push({
        id: Date.now(),
        data: document.getElementById('novo-data').value || fmt.isoDeHoje(),
        descricao: document.getElementById('novo-descricao').value.trim() || 'Lançamento',
        cc: document.getElementById('novo-cc').value.trim() || '—',
        projeto: document.getElementById('novo-projeto').value,
        categoria: document.getElementById('novo-categoria').value,
        notaFiscal: document.getElementById('novo-nota').value.trim() || '—',
        custoProjeto: document.getElementById('novo-custo').value,
        tipo: document.getElementById('novo-tipo').value,
        valor: valor
      });
      dados.salvarDados(d);

      // o período do lançamento já está selecionado; só atualiza as opções
      montarFiltros();

      formNovo.reset();
      modal.hide();
      render();
      if (global.CLIC.toast) CLIC.toast('Lançamento salvo.', 'sucesso');
    });
  }

  /* ---------- Filtros ---------- */
  [filtroPeriodo, filtroProjeto, filtroTipo].forEach(function (sel) {
    if (sel) sel.addEventListener('change', function () {
      render();
      if (global.CLIC.tabelaFiltros) CLIC.tabelaFiltros.atualizar('financeiro', {
        periodo: filtroPeriodo.value, projeto: filtroProjeto.value, tipo: filtroTipo.value
      });
    });
  });

  montarFiltros();
  render();
  global.CLIC.financeiro = { render: render };
})(window);
