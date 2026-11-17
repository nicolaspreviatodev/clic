/* =====================================================
   CLIC — app.js
   Menu ativo, sidebar mobile, modal de exclusão,
   matriz de permissões, "Sair".
   ===================================================== */
(function () {
  'use strict';

  // Item ativo do menu (fallback caso o HTML não marque)
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
      var rotulo = b.textContent.trim();
      if (rotulo === alvo) {
        b.classList.add('ativo');
        b.setAttribute('aria-current', 'page');
      }
    });
  }

  // Sidebar mobile
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

  // Sair
  document.querySelectorAll('[data-sair]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      location.href = 'entrar.html';
    });
  });

  // Modal de exclusão (Usuários)
  var modalEl = document.getElementById('modal-excluir');
  if (modalEl && window.bootstrap) {
    var modal = new bootstrap.Modal(modalEl);
    var nomeEl = document.getElementById('modal-excluir-nome');
    document.querySelectorAll('[data-excluir]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (nomeEl) nomeEl.textContent = btn.getAttribute('data-excluir');
        modal.show();
      });
    });
    var confirmar = document.getElementById('modal-excluir-confirmar');
    if (confirmar) {
      confirmar.addEventListener('click', function () {
        var linha = document.querySelector('[data-linha-alvo]');
        if (linha) linha.remove();
        modal.hide();
      });
    }
  }

  // Matriz de permissões: "Ver" desmarcado desabilita os demais
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

  // Salvar alterações (feedback discreto)
  document.querySelectorAll('[data-salvar]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var original = btn.textContent;
      btn.textContent = 'Salvando...';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = 'Salvo!';
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 1200);
      }, 600);
    });
  });
})();
