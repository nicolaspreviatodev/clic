/* =====================================================
   CLIC — auth.js
   Mostrar/ocultar senha, força, validação, carregando,
   fluxo "esqueci senha" em 4 etapas.
   ===================================================== */
(function () {
  'use strict';

  var DESTINO = 'dashboard-financeiro.html';

  /* ---------- Mostrar/ocultar senha ---------- */
  document.querySelectorAll('[data-olho]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      if (!input) return;
      var visivel = input.type === 'text';
      input.type = visivel ? 'password' : 'text';
      btn.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
      btn.innerHTML = visivel
        ? '<svg class="ic ic-20" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg class="ic ic-20" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>';
    });
  });

  /* ---------- Força da senha (4 segmentos) ---------- */
  document.querySelectorAll('[data-forca]').forEach(function (grupo) {
    var input = document.getElementById(grupo.getAttribute('data-forca'));
    if (!input) return;
    var segs = grupo.querySelectorAll('span');
    input.addEventListener('input', function () {
      var v = input.value;
      var pontos = 0;
      if (v.length >= 6) pontos++;
      if (v.length >= 10) pontos++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) pontos++;
      if (/[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) pontos++;
      segs.forEach(function (s, i) { s.classList.toggle('on', i < pontos); });
    });
  });

  /* ---------- Validação + carregando ---------- */
  function marcarErro(campo, msg) {
    if (!campo) return;
    var wrap = campo.closest('.clic-campo');
    if (!wrap) return;
    wrap.classList.add('clic-campo--erro');
    var erro = wrap.querySelector('.clic-campo__erro');
    if (erro && msg) erro.textContent = msg;
    campo.setAttribute('aria-invalid', 'true');
  }
  function limparErro(campo) {
    var wrap = campo && campo.closest('.clic-campo');
    if (!wrap) return;
    wrap.classList.remove('clic-campo--erro');
    campo.removeAttribute('aria-invalid');
  }
  document.querySelectorAll('.clic-campo__input').forEach(function (c) {
    c.addEventListener('input', function () { limparErro(c); });
  });

  function emailValido(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function carregar(btn, texto) {
    btn.disabled = true;
    btn.classList.add('carregando');
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = '<svg class="ic ic-20" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>' + (texto || 'Carregando...');
  }
  function parar(btn) {
    btn.disabled = false;
    btn.classList.remove('carregando');
    if (btn.dataset.original) btn.innerHTML = btn.dataset.original;
  }

  /* ---------- Formulário Entrar ---------- */
  var formEntrar = document.getElementById('form-entrar');
  if (formEntrar) {
    formEntrar.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('entrar-email');
      var senha = document.getElementById('entrar-senha');
      var ok = true;
      if (!emailValido(email.value.trim())) {
        marcarErro(email, 'Informe um e-mail válido.'); ok = false;
      }
      if (senha.value.length < 8) {
        marcarErro(senha, 'Use pelo menos 8 caracteres.'); ok = false;
      }
      if (!ok) return;
      var btn = formEntrar.querySelector('.clic-btn-auth');
      carregar(btn);
      setTimeout(function () { location.href = DESTINO; }, 800);
    });
  }

  /* ---------- Formulário Criar conta ---------- */
  var formCriar = document.getElementById('form-criar');
  if (formCriar) {
    formCriar.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = document.getElementById('criar-nome');
      var email = document.getElementById('criar-email');
      var senha = document.getElementById('criar-senha');
      var conf = document.getElementById('criar-confirmar');
      var termos = document.getElementById('criar-termos');
      var ok = true;
      if (!nome.value.trim()) { marcarErro(nome, 'Informe seu nome completo.'); ok = false; }
      if (!emailValido(email.value.trim())) { marcarErro(email, 'Informe um e-mail válido.'); ok = false; }
      if (senha.value.length < 8) { marcarErro(senha, 'Use pelo menos 8 caracteres.'); ok = false; }
      if (conf.value !== senha.value || !conf.value) { marcarErro(conf, 'As senhas não coincidem.'); ok = false; }
      if (!termos.checked) {
        termos.focus();
        termos.setAttribute('aria-invalid', 'true');
        ok = false;
      }
      if (!ok) return;
      var btn = formCriar.querySelector('.clic-btn-auth');
      carregar(btn);
      setTimeout(function () { location.href = DESTINO; }, 800);
    });
  }

  /* ---------- Esqueci senha: 4 etapas ---------- */
  var etapas = document.querySelectorAll('.auth-etapa');
  if (etapas.length) {
    var irPara = function (n) {
      etapas.forEach(function (et, i) { et.classList.toggle('ativa', i === n); });
      var foco = etapas[n].querySelector('input');
      if (foco) foco.focus();
    };

    var formEmail = document.getElementById('form-recuperar');
    if (formEmail) {
      formEmail.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('rec-email');
        if (!emailValido(email.value.trim())) {
          marcarErro(email, 'Informe um e-mail válido.');
          return;
        }
        var btn = formEmail.querySelector('.clic-btn-auth');
        carregar(btn);
        setTimeout(function () { parar(btn); irPara(1); }, 800);
      });
    }

    var formCodigo = document.getElementById('form-codigo');
    if (formCodigo) {
      formCodigo.addEventListener('submit', function (e) {
        e.preventDefault();
        var cod = document.getElementById('rec-codigo');
        if (cod.value.trim().length < 6) {
          marcarErro(cod, 'Informe o código de 6 dígitos.');
          return;
        }
        var btn = formCodigo.querySelector('.clic-btn-auth');
        carregar(btn);
        setTimeout(function () { parar(btn); irPara(2); }, 800);
      });
    }

    var formNova = document.getElementById('form-nova-senha');
    if (formNova) {
      formNova.addEventListener('submit', function (e) {
        e.preventDefault();
        var s1 = document.getElementById('nova-senha');
        var s2 = document.getElementById('nova-confirmar');
        var ok = true;
        if (s1.value.length < 6 || s1.value.length > 14) {
          marcarErro(s1, 'Digite uma senha entre 6 e 14 dígitos.'); ok = false;
        }
        if (s2.value !== s1.value || !s2.value) {
          marcarErro(s2, 'As senhas não coincidem.'); ok = false;
        }
        if (!ok) return;
        var btn = formNova.querySelector('.clic-btn-auth');
        carregar(btn);
        setTimeout(function () { location.href = 'entrar.html?redefinida=1'; }, 800);
      });
    }

    document.querySelectorAll('[data-voltar]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        irPara(0);
      });
    });
  }

  /* ---------- Entrar com ?redefinida=1 ---------- */
  if (location.search.indexOf('redefinida=1') !== -1) {
    var titulo = document.getElementById('entrar-titulo');
    var sub = document.getElementById('entrar-sub');
    if (titulo) titulo.textContent = 'Senha redefinida com sucesso!';
    if (sub) sub.textContent = 'Entre para acessar seus projetos.';
  }
})();
