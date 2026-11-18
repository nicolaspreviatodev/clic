/* =====================================================
   CLIC — app.js
   Estrutura comum das telas internas: menu ativo,
   sidebar mobile, sair com aviso e matriz de permissões.
   ===================================================== */
(function (global) {
  'use strict';

  /* ---------- Item ativo do menu ---------- */
  var pagina = location.pathname.split('/').pop() || 'dashboard-financeiro.html';
  var mapa = {
    'dashboard-financeiro.html': 'Dashboard',
    'dashboard-horas.html': 'Dashboard',
    'dashboard-reembolso.html': 'Dashboard',
    'financeiro.html': 'Financeiro',
    'projetos.html': 'Projetos',
    'horas.html': 'Horas',
    'horas-funcionario.html': 'Horas',
    'usuarios.html': 'Usuários',
    'usuario-editar.html': 'Usuários',
    'em-construcao.html': null
  };
  var alvo = mapa[pagina];
  if (alvo) {
    document.querySelectorAll('.clic-menu-btn').forEach(function (b) {
      if (b.textContent.trim() === alvo) {
        b.classList.add('ativo');
        b.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------- Sidebar no mobile ---------- */
  var sidebar = document.querySelector('.clic-sidebar');
  var abrir = document.querySelector('[data-abrir-menu]');
  if (sidebar && abrir) {
    abrir.addEventListener('click', function () {
      sidebar.classList.toggle('aberta');
      abrir.setAttribute('aria-expanded', sidebar.classList.contains('aberta'));
    });
    document.addEventListener('click', function (e) {
      if (!sidebar.classList.contains('aberta')) return;
      if (sidebar.contains(e.target) || abrir.contains(e.target)) return;
      sidebar.classList.remove('aberta');
      abrir.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- Sair ---------- */
  document.querySelectorAll('[data-sair]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (global.CLIC.sessao) CLIC.sessao.limpar();
      try { sessionStorage.setItem('clic.aviso', 'Você saiu da sua conta.'); } catch (err) {}
      location.href = 'entrar.html';
    });
  });

  /* ---------- Matriz de permissões ---------- */
  // "Ver" desmarcado desabilita e desmarca os demais da linha
  function ligarMatriz() {
    document.querySelectorAll('.perm-table tbody tr').forEach(function (tr) {
      var checks = tr.querySelectorAll('.perm-check');
      if (checks.length < 4) return;
      var ver = checks[0];
      var outros = [checks[1], checks[2], checks[3]];
      var sincronizar = function () {
        outros.forEach(function (c) {
          c.disabled = !ver.checked;
          if (!ver.checked) c.checked = false;
        });
      };
      ver.addEventListener('change', sincronizar);
      sincronizar();
    });
  }
  ligarMatriz();

  /* ---------- Aviso de saída ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    try {
      var aviso = sessionStorage.getItem('clic.aviso');
      if (aviso) {
        sessionStorage.removeItem('clic.aviso');
        if (global.CLIC.toast) CLIC.toast(aviso, 'info');
      }
    } catch (e) {}
  });
})(window);
