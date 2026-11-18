/* =====================================================
   CLIC — usuarios.js
   Lista de usuários, busca, filtros, modal de exclusão
   e criação de usuário.
   ===================================================== */
(function (global) {
  'use strict';

  var tabela = document.getElementById('tabela-usuarios');
  if (!tabela) return;

  var dados = global.CLIC.dados;
  var busca = document.getElementById('busca-usuarios');
  var fPerfil = document.getElementById('f-perfil');
  var fStatus = document.getElementById('f-status');

  var CLASSE_PERFIL = {
    'Administrador': 'clic-badge--navy',
    'Gestor': 'clic-badge--amarelo',
    'Funcionário': 'clic-badge--azul'
  };
  var CLASSE_STATUS = {
    'Ativo': 'clic-badge--azul',
    'Inativo': 'clic-badge--cinza'
  };

  function listar() {
    var d = dados.lerDados();
    var lista = d.usuarios.slice();
    var termo = busca ? busca.value.trim().toLowerCase() : '';
    if (termo) {
      lista = lista.filter(function (u) {
        return u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo);
      });
    }
    if (fPerfil && fPerfil.value) lista = lista.filter(function (u) { return u.perfil === fPerfil.value; });
    if (fStatus && fStatus.value) lista = lista.filter(function (u) { return u.status === fStatus.value; });
    return lista;
  }

  function render() {
    var lista = listar();
    var corpo = tabela.tBodies[0];

    if (!lista.length) {
      corpo.innerHTML = '<tr class="linha-vazia"><td colspan="6">' +
        '<svg class="ic ic-18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/></svg>' +
        'Nenhum resultado encontrado.</td></tr>';
      return;
    }

    corpo.innerHTML = lista.map(function (u) {
      return '<tr>' +
        '<td>' + u.nome + '</td>' +
        '<td>' + u.email + '</td>' +
        '<td><span class="clic-badge ' + (CLASSE_PERFIL[u.perfil] || 'clic-badge--azul') + '">' + u.perfil + '</span></td>' +
        '<td><span class="clic-badge ' + (CLASSE_STATUS[u.status] || 'clic-badge--azul') + '">' + u.status + '</span></td>' +
        '<td>' + u.ultimoAcesso + '</td>' +
        '<td>' +
          '<a class="acao-editar" href="usuario-editar.html?id=' + u.id + '">Editar</a> ' +
          '<button class="acao-excluir" type="button" data-excluir="' + u.id + '" data-nome="' + u.nome + '">Excluir</button>' +
        '</td></tr>';
    }).join('');
  }

  /* ---------- Filtros ---------- */
  if (busca) busca.addEventListener('input', render);
  if (fPerfil) {
    fPerfil.innerHTML = '<option value="">Perfil: Todos</option>' +
      '<option>Perfil: Administrador</option><option>Perfil: Gestor</option><option>Perfil: Funcionário</option>';
  }
  if (fStatus) {
    fStatus.innerHTML = '<option value="">Status: Todos</option>' +
      '<option>Status: Ativo</option><option>Status: Inativo</option>';
  }
  [fPerfil, fStatus].forEach(function (sel) {
    if (sel) sel.addEventListener('change', render);
  });

  /* ---------- Exclusão ---------- */
  var modalEl = document.getElementById('modal-excluir');
  var pendente = null;
  if (modalEl && window.bootstrap) {
    var modal = new bootstrap.Modal(modalEl);
    var nomeEl = document.getElementById('modal-excluir-nome');

    tabela.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-excluir]');
      if (!btn) return;
      pendente = Number(btn.getAttribute('data-excluir'));
      var nome = btn.getAttribute('data-nome') || 'este usuário';
      var sessao = global.CLIC.sessao ? CLIC.sessao.ler() : null;
      if (sessao && sessao.nome === nome) {
        if (global.CLIC.toast) CLIC.toast('Você não pode excluir o próprio usuário.', 'erro');
        pendente = null;
        return;
      }
      if (nomeEl) nomeEl.textContent = nome;
      modal.show();
    });

    var confirmar = document.getElementById('modal-excluir-confirmar');
    if (confirmar) {
      confirmar.addEventListener('click', function () {
        if (pendente !== null) {
          var d = dados.lerDados();
          d.usuarios = d.usuarios.filter(function (u) { return u.id !== pendente; });
          dados.salvarDados(d);
          render();
          if (global.CLIC.toast) CLIC.toast('Usuário excluído.', 'sucesso');
        }
        pendente = null;
        modal.hide();
      });
    }
  }

  /* ---------- Novo usuário ---------- */
  var btnNovo = document.querySelector('[data-novo-usuario]');
  var formNovo = document.getElementById('form-usuario');
  if (btnNovo && formNovo && window.bootstrap) {
    var modalNovo = new bootstrap.Modal(document.getElementById('modal-usuario'));
    btnNovo.addEventListener('click', function () { modalNovo.show(); });

    formNovo.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = document.getElementById('u-nome');
      var email = document.getElementById('u-email');
      if (!nome.value.trim()) { nome.focus(); if (global.CLIC.toast) CLIC.toast('Informe o nome.', 'erro'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        email.focus();
        if (global.CLIC.toast) CLIC.toast('Informe um e-mail válido.', 'erro');
        return;
      }
      var d = dados.lerDados();
      d.usuarios.push({
        id: Date.now(),
        nome: nome.value.trim(),
        email: email.value.trim().toLowerCase(),
        perfil: document.getElementById('u-perfil').value,
        status: document.getElementById('u-status').value,
        ultimoAcesso: '—'
      });
      dados.salvarDados(d);
      formNovo.reset();
      modalNovo.hide();
      render();
      if (global.CLIC.toast) CLIC.toast('Usuário criado.', 'sucesso');
    });
  }

  render();
  global.CLIC.usuarios = { render: render };
})(window);
