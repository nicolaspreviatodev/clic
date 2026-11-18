/* =====================================================
   CLIC — sessao.js
   Login simulado, proteção das telas internas e perfil.
   Chave: sessionStorage['clic.sessao'] (ou localStorage
   quando "Manter conectado" está marcado).
   ===================================================== */
(function (global) {
  'use strict';

  var CHAVE = 'clic.sessao';

  // Contas do protótipo (qualquer senha com 8+ caracteres funciona)
  var CONTAS = [
    { email: 'carloseduardomilann@gmail.com', nome: 'Carlos Milan',   perfil: 'Administrador' },
    { email: 'nicolassilvapreviato@gmail.com', nome: 'Nicolas Silva', perfil: 'Gestor' },
    { email: 'luccas.matheus@gmail.com',      nome: 'Luccas Matheus', perfil: 'Gestor' },
    { email: 'luizbueno@gmail.com',           nome: 'Luiz Bueno',     perfil: 'Gestor' },
    { email: 'salinhastropa@gmail.com',       nome: 'Lucas Willian',  perfil: 'Funcionário' }
  ];

  function ler() {
    try {
      var cru = sessionStorage.getItem(CHAVE) || localStorage.getItem(CHAVE);
      return cru ? JSON.parse(cru) : null;
    } catch (e) { return null; }
  }

  function gravar(usuario, manter) {
    var json = JSON.stringify(usuario);
    try {
      if (manter) localStorage.setItem(CHAVE, json);
      else sessionStorage.setItem(CHAVE, json);
    } catch (e) {}
  }

  function limpar() {
    try {
      sessionStorage.removeItem(CHAVE);
      localStorage.removeItem(CHAVE);
    } catch (e) {}
  }

  function iniciais(nome) {
    var partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return 'CL';
    var a = partes[0].charAt(0);
    var b = partes.length > 1 ? partes[partes.length - 1].charAt(0) : partes[0].charAt(1) || '';
    return (a + b).toUpperCase();
  }

  function nomeDoEmail(email) {
    var base = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
    return base.replace(/\b\w/g, function (c) { return c.toUpperCase(); }) || 'Usuário CLIC';
  }

  // Procura a conta; devolve {usuario} ou {erro}
  function autenticar(email, senha) {
    var normalizado = String(email || '').trim().toLowerCase();
    var conta = null;
    for (var i = 0; i < CONTAS.length; i++) {
      if (CONTAS[i].email === normalizado) { conta = CONTAS[i]; break; }
    }
    if (conta) {
      return { usuario: { email: conta.email, nome: conta.nome, perfil: conta.perfil } };
    }
    // E-mail válido fora da lista: entra como Gestor, nome tirado do endereço
    return { usuario: { email: normalizado, nome: nomeDoEmail(normalizado), perfil: 'Gestor' } };
  }

  function existeConta(email) {
    var normalizado = String(email || '').trim().toLowerCase();
    return CONTAS.some(function (c) { return c.email === normalizado; });
  }

  function inicioPorPerfil(perfil) {
    return perfil === 'Funcionário' ? 'horas-funcionario.html' : 'dashboard-financeiro.html';
  }

  // Guarda síncrona: sem sessão, volta ao login antes de pintar a tela
  function exigirSessao() {
    var s = ler();
    if (!s) {
      location.replace('entrar.html');
      return null;
    }
    return s;
  }

  // Preenche nome, iniciais e cargo na sidebar
  function preencherSidebar() {
    var s = ler();
    if (!s) return;
    var nome = document.querySelector('.clic-sidebar__nome');
    var cargo = document.querySelector('.clic-sidebar__cargo');
    var avatar = document.querySelector('.clic-sidebar__avatar');
    if (nome) nome.textContent = s.nome;
    if (cargo) cargo.textContent = s.perfil;
    if (avatar) avatar.textContent = iniciais(s.nome);
  }

  // Funcionário enxerga apenas o item Horas (frame 07d)
  function aplicarPerfil() {
    var s = ler();
    if (!s || s.perfil !== 'Funcionário') return;
    document.querySelectorAll('.clic-sidebar__menu .clic-menu-btn').forEach(function (b) {
      var rotulo = b.textContent.trim();
      if (rotulo !== 'Horas') b.remove();
    });
  }

  global.CLIC = global.CLIC || {};
  global.CLIC.sessao = {
    CHAVE: CHAVE,
    contas: CONTAS,
    ler: ler,
    gravar: gravar,
    limpar: limpar,
    autenticar: autenticar,
    existeConta: existeConta,
    iniciais: iniciais,
    inicioPorPerfil: inicioPorPerfil,
    exigirSessao: exigirSessao,
    preencherSidebar: preencherSidebar,
    aplicarPerfil: aplicarPerfil
  };

  // Aplicações automáticas em qualquer tela que carregue este script
  document.addEventListener('DOMContentLoaded', function () {
    preencherSidebar();
    aplicarPerfil();
  });
})(window);
