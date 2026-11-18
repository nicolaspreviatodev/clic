/* =====================================================
   CLIC — formatadores.js
   Moeda, horas e datas no padrão do Figma.
   ===================================================== */
(function (global) {
  'use strict';

  var MOEDA = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });

  // R$ 20.000,00 — o Intl usa espaço não separável; o Figma usa espaço comum
  function moeda(valor) {
    return MOEDA.format(Number(valor) || 0).replace(/ /g, ' ');
  }

  // 3.5 -> "3h30" · 4 -> "4h00" · 0.75 -> "0h45"
  function horas(dec) {
    var totalMin = Math.round((Number(dec) || 0) * 60);
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    return h + 'h' + String(m).padStart(2, '0');
  }

  // minutos -> "3h30"
  function minutos(min) {
    return horas((Number(min) || 0) / 60);
  }

  // "09:00" + "12:30" -> 3.5 (horas decimais)
  function duracaoEntre(inicio, fim) {
    if (!inicio || !fim) return 0;
    var a = String(inicio).split(':');
    var b = String(fim).split(':');
    var mA = Number(a[0]) * 60 + Number(a[1] || 0);
    var mB = Number(b[0]) * 60 + Number(b[1] || 0);
    var d = mB - mA;
    return d > 0 ? d / 60 : 0;
  }

  // "2026-10-14" -> "14/10" · com ano -> "14/10/2026"
  function dataCurta(iso) {
    if (!iso) return '—';
    var p = String(iso).split('-');
    if (p.length < 3) return iso;
    return p[2] + '/' + p[1];
  }

  function dataLonga(iso) {
    if (!iso) return '—';
    var p = String(iso).split('-');
    if (p.length < 3) return iso;
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  // Date -> "2026-10-14"
  function isoDeHoje() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // Date -> "HH:MM"
  function horaAgora() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  global.CLIC = global.CLIC || {};
  global.CLIC.fmt = {
    moeda: moeda,
    horas: horas,
    minutos: minutos,
    duracaoEntre: duracaoEntre,
    dataCurta: dataCurta,
    dataLonga: dataLonga,
    isoDeHoje: isoDeHoje,
    horaAgora: horaAgora
  };
})(window);
