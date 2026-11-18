/* =====================================================
   CLIC — tabela.js
   Paginação (10 linhas), estado vazio, filtros lembrados
   por página e atalhos de teclado.
   ===================================================== */
(function (global) {
  'use strict';

  var POR_PAGINA = 10;
  var CHAVE = 'clic.filtros.v1';
  var estado = {}; // por tabela: { pagina }

  /* ---------- Filtros lembrados por página ---------- */
  function lerTudo() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; }
  }
  function gravarTudo(obj) {
    try { localStorage.setItem(CHAVE, JSON.stringify(obj)); } catch (e) {}
  }

  // Devolve só os valores preenchidos (ignora '', null e 'todos')
  function ativos(mapa) {
    var saida = {};
    Object.keys(mapa || {}).forEach(function (k) {
      var v = mapa[k];
      if (v === null || v === undefined) return;
      v = String(v).trim();
      if (v && v !== 'todos') saida[k] = v;
    });
    return saida;
  }

  function salvos(pagina) {
    return lerTudo()[pagina] || {};
  }

  function salvar(pagina, mapa) {
    var tudo = lerTudo();
    var limpos = ativos(mapa);
    if (Object.keys(limpos).length) tudo[pagina] = limpos;
    else delete tudo[pagina];
    gravarTudo(tudo);
    return limpos;
  }

  function limparSalvos(pagina) {
    var tudo = lerTudo();
    delete tudo[pagina];
    gravarTudo(tudo);
  }

  /* ---------- Estado vazio ---------- */
  function linhaVazia(colspan, comLimpar) {
    return '<tr class="linha-vazia"><td colspan="' + colspan + '">' +
      '<svg class="ic ic-18" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' +
      '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/></svg>' +
      '<span>Nenhum resultado encontrado.</span>' +
      (comLimpar ? ' <button class="linha-vazia__limpar" type="button" data-limpar-filtros>Limpar filtros</button>' : '') +
      '</td></tr>';
  }

  /* ---------- Paginação ---------- */
  function montarPaginacao(total, pagina, irPara) {
    var nav = document.createElement('nav');
    nav.className = 'clic-paginacao';
    nav.setAttribute('aria-label', 'Paginação');

    var paginas = Math.ceil(total / POR_PAGINA);
    if (paginas <= 1) return nav;

    var lista = document.createElement('ul');
    lista.className = 'pagination clic-pagination';

    function item(rotulo, alvo, ativo, desabilitado, etiqueta) {
      var li = document.createElement('li');
      li.className = 'page-item' + (ativo ? ' active' : '') + (desabilitado ? ' disabled' : '');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-link';
      btn.innerHTML = rotulo;
      if (etiqueta) btn.setAttribute('aria-label', etiqueta);
      if (ativo) btn.setAttribute('aria-current', 'page');
      if (desabilitado) btn.disabled = true;
      else btn.addEventListener('click', function () { irPara(alvo); });
      li.appendChild(btn);
      return li;
    }

    lista.appendChild(item('&laquo;', pagina - 1, false, pagina === 1, 'Página anterior'));
    for (var i = 1; i <= paginas; i++) {
      lista.appendChild(item(String(i), i, i === pagina, false, 'Página ' + i));
    }
    lista.appendChild(item('&raquo;', pagina + 1, false, pagina === paginas, 'Próxima página'));

    nav.appendChild(lista);

    var resumo = document.createElement('p');
    resumo.className = 'clic-paginacao__resumo';
    var de = (pagina - 1) * POR_PAGINA + 1;
    var ate = Math.min(pagina * POR_PAGINA, total);
    resumo.textContent = de + '–' + ate + ' de ' + total;
    nav.appendChild(resumo);

    return nav;
  }

  /* ---------- Renderização de uma tabela ---------- */
  /*
    opts = {
      id: 'tabela-financeiro',
      linhas: ['<tr>…</tr>', …],   // já filtradas e ordenadas
      colspan: 10,
      comLimpar: true              // há filtro ativo nesta página?
    }
  */
  function paginar(opts) {
    var tabela = document.getElementById(opts.id);
    if (!tabela) return;
    var corpo = tabela.tBodies[0];
    var wrap = tabela.closest('.clic-tabela-wrap');
    var id = opts.id;

    if (!estado[id]) estado[id] = { pagina: 1 };

    var total = opts.linhas.length;
    var paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    if (estado[id].pagina > paginas) estado[id].pagina = paginas;
    var pagina = estado[id].pagina;

    if (!total) {
      corpo.innerHTML = linhaVazia(opts.colspan, !!opts.comLimpar);
    } else {
      var inicio = (pagina - 1) * POR_PAGINA;
      corpo.innerHTML = opts.linhas.slice(inicio, inicio + POR_PAGINA).join('');
    }

    if (!wrap) return;

    // remove a paginação anterior
    var anterior = wrap.nextElementSibling;
    if (anterior && anterior.classList && anterior.classList.contains('clic-paginacao')) {
      anterior.remove();
    }

    var irPara = function (n) {
      var p = Math.min(Math.max(1, n), paginas);
      if (p === estado[id].pagina) return;
      estado[id].pagina = p;
      if (opts.rerender) opts.rerender();
      else paginar(opts);
    };

    var nav = montarPaginacao(total, pagina, irPara);
    if (nav.childNodes.length) wrap.parentNode.insertBefore(nav, wrap.nextSibling);
  }

  /* ---------- "Limpar filtros" ---------- */
  // Só aparece quando existe algum filtro ativo na página
  function barraLimpar(containerId, visivel, aoLimpar) {
    var alvo = document.getElementById(containerId);
    if (!alvo) return;
    var existente = alvo.querySelector('[data-limpar-filtros]');
    if (!visivel) {
      if (existente) existente.remove();
      alvo.classList.remove('app-filtros--ativo');
      return;
    }
    alvo.classList.add('app-filtros--ativo');
    if (existente) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'clic-limpar-filtros';
    btn.setAttribute('data-limpar-filtros', '');
    btn.innerHTML = '<svg class="ic ic-14" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>Limpar filtros';
    btn.addEventListener('click', aoLimpar);
    var grupo = alvo.querySelector('.app-filtros__grupo');
    if (grupo) grupo.appendChild(btn);
    else alvo.appendChild(btn);
  }

  // "Limpar filtros" dentro do estado vazio
  function ligarLimparVazio(container, aoLimpar) {
    var alvo = document.getElementById(container);
    if (!alvo) return;
    if (alvo.dataset.limparVazio === 'sim') return;
    alvo.dataset.limparVazio = 'sim';
    alvo.addEventListener('click', function (e) {
      if (e.target.closest('.linha-vazia__limpar')) aoLimpar();
    });
  }

  /* ---------- Atalhos: "/" foca, "Esc" limpa ---------- */
  function atalhos(opts) {
    var principal = opts.principal;
    var aoEsc = opts.aoEsc || function () {};
    document.addEventListener('keydown', function (e) {
      var alvo = e.target;
      var digitando = alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' ||
        alvo.tagName === 'SELECT' || alvo.isContentEditable);

      if (e.key === '/' && !digitando && principal) {
        e.preventDefault();
        principal.focus();
        if (principal.select) principal.select();
        return;
      }
      if (e.key === 'Escape') {
        // Dentro de um filtro: limpa só aquele campo. Fora: limpa todos os ativos.
        if (digitando) {
          if (alvo.closest('.app-filtros') && alvo.value) {
            e.preventDefault();
            aoEsc(alvo);
          }
          return;
        }
        var raiz = document.querySelector('.app-filtros');
        var temAtivo = raiz && [].some.call(raiz.querySelectorAll('input,select'), function (c) {
          var v = String(c.value || '').trim();
          return v && v !== 'todos';
        });
        if (temAtivo) {
          e.preventDefault();
          aoEsc(null);
        }
      }
    });
  }

  global.CLIC = global.CLIC || {};
  global.CLIC.tabela = {
    POR_PAGINA: POR_PAGINA,
    paginar: paginar,
    linhaVazia: linhaVazia,
    barraLimpar: barraLimpar,
    ligarLimparVazio: ligarLimparVazio,
    atalhos: atalhos,
    ativos: ativos,
    salvos: salvos,
    salvar: salvar,
    limparSalvos: limparSalvos,
    reiniciarPagina: function (id) { if (estado[id]) estado[id].pagina = 1; }
  };
})(window);
