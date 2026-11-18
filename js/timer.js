/* =====================================================
   CLIC — timer.js
   Cronômetro persistente (sobrevive a recarregar),
   registro manual e gravação na base de dados.
   ===================================================== */
(function (global) {
  'use strict';

  var CHAVE = 'clic.cronometro';
  var card = document.getElementById('cronometro');
  if (!card) return;

  var elTempo = document.getElementById('cronometro-tempo');
  var btnIniciar = document.getElementById('btn-iniciar');
  var btnFinalizar = document.getElementById('btn-finalizar');
  var timer = null;

  function fmt() { return global.CLIC.fmt; }

  // Depois de incluir um registro, mostra todo o histórico: com a "semana
  // atual" ancorada no lançamento mais recente, a linha nova mudaria a janela
  // e esconderia as anteriores.
  function atualizarTabela() {
    if (!global.CLIC.horas) return;
    if (CLIC.horas.mostrarTodos) CLIC.horas.mostrarTodos();
    else CLIC.horas.render();
  }

  function lerEstado() {
    try {
      var cru = localStorage.getItem(CHAVE);
      return cru ? JSON.parse(cru) : { estado: 'ocioso', acumuladoMs: 0, tsInicio: null };
    } catch (e) {
      return { estado: 'ocioso', acumuladoMs: 0, tsInicio: null };
    }
  }

  function gravarEstado(e) {
    try { localStorage.setItem(CHAVE, JSON.stringify(e)); } catch (err) {}
  }

  function msDecorridos(e) {
    var total = e.acumuladoMs || 0;
    if (e.estado === 'rodando' && e.tsInicio) total += Date.now() - e.tsInicio;
    return total;
  }

  function formatar(ms) {
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var x = s % 60;
    return String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(x).padStart(2, '0');
  }

  function pintar() {
    var e = lerEstado();
    elTempo.textContent = formatar(msDecorridos(e));
    card.dataset.estado = e.estado;
    if (e.estado === 'rodando') {
      btnIniciar.textContent = 'Pausar';
      btnFinalizar.hidden = false;
    } else if (e.estado === 'pausado') {
      btnIniciar.textContent = 'Continuar';
      btnFinalizar.hidden = false;
    } else {
      btnIniciar.textContent = 'Iniciar';
      btnFinalizar.hidden = true;
    }
  }

  function iniciarRelogio() {
    clearInterval(timer);
    timer = setInterval(pintar, 500);
  }

  // Iniciar / Pausar
  btnIniciar.addEventListener('click', function () {
    var e = lerEstado();
    if (e.estado === 'rodando') {
      e.acumuladoMs = msDecorridos(e);
      e.tsInicio = null;
      e.estado = 'pausado';
      gravarEstado(e);
      clearInterval(timer);
    } else {
      e.tsInicio = Date.now();
      e.estado = 'rodando';
      gravarEstado(e);
      iniciarRelogio();
    }
    pintar();
  });

  // Finalizar: grava o registro na base
  btnFinalizar.addEventListener('click', function () {
    var e = lerEstado();
    var ms = msDecorridos(e);
    if (ms < 1000) {
      if (global.CLIC.toast) CLIC.toast('Tempo insuficiente para registrar.', 'erro');
      return;
    }

    var horasDec = ms / 3600000;
    var agora = new Date();
    var inicio = new Date(agora.getTime() - ms);
    var d = CLIC.dados.lerDados();
    var s = CLIC.sessao ? CLIC.sessao.ler() : null;

    d.registrosHoras.push({
      id: Date.now(),
      data: fmt().isoDeHoje(),
      projeto: 'Projeto Alfa',
      cc: '26038',
      colaborador: s ? s.nome : 'Carlos Milan',
      descricao: 'Cronômetro',
      inicio: String(inicio.getHours()).padStart(2, '0') + ':' + String(inicio.getMinutes()).padStart(2, '0'),
      fim: fmt().horaAgora()
    });
    CLIC.dados.salvarDados(d);

    gravarEstado({ estado: 'ocioso', acumuladoMs: 0, tsInicio: null });
    clearInterval(timer);
    pintar();

    atualizarTabela();
    if (global.CLIC.toast) CLIC.toast('Registro de horas salvo.', 'sucesso');
  });

  // Registro manual
  var form = document.getElementById('form-registro');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var projeto = document.getElementById('reg-projeto');
      var codigo = document.getElementById('reg-codigo');
      var data = document.getElementById('reg-data');
      var inicio = document.getElementById('reg-inicio');
      var fim = document.getElementById('reg-fim');
      var desc = document.getElementById('reg-descricao');

      var erros = [];
      if (!projeto.value || projeto.value === 'Projeto') erros.push('projeto');
      if (!data.value) erros.push('data');
      if (!inicio.value) erros.push('início');
      if (!fim.value) erros.push('fim');
      if (!desc.value.trim()) erros.push('descrição');
      var dur = fmt().duracaoEntre(inicio.value, fim.value);
      if (inicio.value && fim.value && dur <= 0) erros.push('fim maior que o início');

      if (erros.length) {
        if (global.CLIC.toast) CLIC.toast('Confira: ' + erros.join(', ') + '.', 'erro');
        var primeiro = erros[0];
        var mapa = { projeto: projeto, data: data, 'início': inicio, fim: fim, 'descrição': desc };
        if (mapa[primeiro]) mapa[primeiro].focus();
        return;
      }

      var d = CLIC.dados.lerDados();
      var s = CLIC.sessao ? CLIC.sessao.ler() : null;
      d.registrosHoras.push({
        id: Date.now(),
        data: data.value,
        projeto: projeto.value,
        cc: codigo.value || '—',
        colaborador: s ? s.nome : 'Carlos Milan',
        descricao: desc.value.trim(),
        inicio: inicio.value,
        fim: fim.value
      });
      CLIC.dados.salvarDados(d);

      form.reset();
      atualizarTabela();
      if (global.CLIC.toast) CLIC.toast('Registro de horas salvo.', 'sucesso');
    });
  }

  // Código do centro de custo acompanha o projeto escolhido
  var selProjeto = document.getElementById('reg-projeto');
  if (selProjeto) {
    selProjeto.addEventListener('change', function () {
      var d = CLIC.dados.lerDados();
      var achou = d.projetos.filter(function (p) { return p.nome === selProjeto.value; })[0];
      var campo = document.getElementById('reg-codigo');
      if (achou && campo && !campo.value) campo.value = achou.cc;
    });
  }

  pintar();
  if (lerEstado().estado === 'rodando') iniciarRelogio();
})(window);
