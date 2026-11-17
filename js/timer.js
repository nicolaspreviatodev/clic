/* =====================================================
   CLIC — timer.js
   Cronômetro (Iniciar/Pausar/Finalizar), registro manual
   e total do período.
   ===================================================== */
(function () {
  'use strict';

  var card = document.getElementById('cronometro');
  if (!card) return;

  var elTempo = document.getElementById('cronometro-tempo');
  var btnIniciar = document.getElementById('btn-iniciar');
  var btnPausar = document.getElementById('btn-pausar');
  var btnFinalizar = document.getElementById('btn-finalizar');

  var segundos = 0;
  var intervalo = null;

  function formatar(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var x = s % 60;
    return String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(x).padStart(2, '0');
  }

  function atualizar() { elTempo.textContent = formatar(segundos); }

  function estado(novo) {
    card.dataset.estado = novo;
    if (novo === 'rodando') {
      btnIniciar.textContent = 'Pausar';
      btnIniciar.className = 'cronometro__btn cronometro__btn--primario';
      btnFinalizar.hidden = false;
      clearInterval(intervalo);
      intervalo = setInterval(function () { segundos++; atualizar(); }, 1000);
    } else if (novo === 'pausado') {
      clearInterval(intervalo);
      intervalo = null;
      btnIniciar.textContent = 'Continuar';
      btnIniciar.className = 'cronometro__btn cronometro__btn--primario';
      btnFinalizar.hidden = false;
    } else {
      clearInterval(intervalo);
      intervalo = null;
      btnIniciar.textContent = 'Iniciar';
      btnIniciar.className = 'cronometro__btn cronometro__btn--primario';
      btnFinalizar.hidden = true;
    }
  }

  btnIniciar.addEventListener('click', function () {
    if (card.dataset.estado === 'rodando') {
      estado('pausado');
    } else {
      estado('rodando');
    }
  });

  if (btnPausar) {
    btnPausar.addEventListener('click', function () {
      estado(card.dataset.estado === 'rodando' ? 'pausado' : 'rodando');
    });
  }

  btnFinalizar.addEventListener('click', function () {
    var duracao = formatar(segundos);
    segundos = 0;
    atualizar();
    estado('ocioso');
    var tabela = document.getElementById('tabela-horas');
    if (tabela && tabela.tBodies[0]) {
      var agora = new Date();
      var data = String(agora.getDate()).padStart(2, '0') + '/' +
        String(agora.getMonth() + 1).padStart(2, '0');
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + data + '</td>' +
        '<td>Projeto Alfa</td>' +
        '<td>26038</td>' +
        '<td>Carlos Milan</td>' +
        '<td>Cronômetro</td>' +
        '<td>09:00</td>' +
        '<td>12:30</td>' +
        '<td>' + duracao.slice(0, 5).replace(':', 'h') + '</td>' +
        '<td class="num">R$ 315,00</td>' +
        '<td><a class="acao-editar" href="#">Editar</a></td>';
      tabela.tBodies[0].appendChild(tr);
    }
  });

  // Registro manual: adiciona linha à tabela
  var formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', function (e) {
      e.preventDefault();
      var projeto = document.getElementById('reg-projeto');
      var data = document.getElementById('reg-data');
      var inicio = document.getElementById('reg-inicio');
      var fim = document.getElementById('reg-fim');
      var desc = document.getElementById('reg-descricao');
      var tabela = document.getElementById('tabela-horas');
      if (!tabela || !tabela.tBodies[0]) return;

      var d = data.value ? data.value.split('-').reverse().slice(0, 2).join('/') : '—';
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + d + '</td>' +
        '<td>' + (projeto.value || 'Projeto Alfa') + '</td>' +
        '<td>26789</td>' +
        '<td>Carlos Milan</td>' +
        '<td>' + (desc.value || '—') + '</td>' +
        '<td>' + (inicio.value || '—') + '</td>' +
        '<td>' + (fim.value || '—') + '</td>' +
        '<td>—</td>' +
        '<td class="num">R$ 0,00</td>' +
        '<td><a class="acao-editar" href="#">Editar</a></td>';
      tabela.tBodies[0].appendChild(tr);
      formRegistro.reset();
    });
  }

  estado('ocioso');
})();
