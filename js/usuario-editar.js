/* =====================================================
   CLIC — usuario-editar.js
   Carrega o usuário de ?id=, aplica as permissões do
   perfil e salva alterações.
   ===================================================== */
(function (global) {
  'use strict';

  var form = document.getElementById('form-usuario-editar');
  if (!form) return;

  var dados = global.CLIC.dados;
  var id = Number(new URLSearchParams(location.search).get('id')) || null;

  var campoNome = document.getElementById('edit-nome');
  var campoEmail = document.getElementById('edit-email');
  var campoPerfil = document.getElementById('edit-perfil');
  var campoStatus = document.getElementById('edit-status');
  var linhas = document.querySelectorAll('.perm-table tbody tr');

  function pintarPermissoes(perfil) {
    var d = dados.lerDados();
    var mapa = d.permissoes[perfil] || d.permissoes['Funcionário'];
    linhas.forEach(function (tr) {
      var tela = tr.querySelector('td').textContent.trim();
      var regras = mapa[tela];
      if (!regras) return;
      var checks = tr.querySelectorAll('.perm-check');
      var ordem = ['ver', 'incluir', 'editar', 'excluir'];
      checks.forEach(function (c, i) { c.checked = !!regras[ordem[i]]; });
    });
  }

  // Abre o modal padrão de perfil (sugere permissões)
  function ligarMatriz() {
    linhas.forEach(function (tr) {
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

  function carregar() {
    var d = dados.lerDados();
    var u = id ? d.usuarios.filter(function (x) { return x.id === id; })[0] : d.usuarios[2];
    if (!u) u = d.usuarios[0];
    campoNome.value = u.nome;
    campoEmail.value = u.email;
    campoPerfil.value = u.perfil;
    campoStatus.value = u.status;
    pintarPermissoes(u.perfil);
    ligarMatriz();
    id = u.id;
  }

  campoPerfil.addEventListener('change', function () {
    pintarPermissoes(campoPerfil.value);
    ligarMatriz();
    if (global.CLIC.toast) CLIC.toast('Permissões do perfil ' + campoPerfil.value + ' aplicadas.', 'info');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!campoNome.value.trim()) {
      campoNome.focus();
      if (global.CLIC.toast) CLIC.toast('Informe o nome.', 'erro');
      return;
    }
    var d = dados.lerDados();
    d.usuarios.forEach(function (u) {
      if (u.id === id) {
        u.nome = campoNome.value.trim();
        u.email = campoEmail.value.trim().toLowerCase();
        u.perfil = campoPerfil.value;
        u.status = campoStatus.value;
      }
    });
    dados.salvarDados(d);
    if (global.CLIC.toast) CLIC.toast('Alterações salvas.', 'sucesso');
    setTimeout(function () { location.href = 'usuarios.html'; }, 900);
  });

  carregar();
})(window);
