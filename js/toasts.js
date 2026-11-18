/* =====================================================
   CLIC — toasts.js
   Avisos discretos no canto superior direito (3 s).
   Uso: CLIC.toast('Registro salvo.', 'sucesso')
        tipos: sucesso | erro | info
   ===================================================== */
(function (global) {
  'use strict';

  var ICONES = {
    sucesso: '<path d="M20 6 9 17l-5-5"/>',
    erro: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
  };
  var CORES = { sucesso: '#2E9E6B', erro: '#D64545', info: '#4F76A0' };

  function container() {
    var c = document.getElementById('clic-toasts');
    if (!c) {
      c = document.createElement('div');
      c.id = 'clic-toasts';
      c.className = 'clic-toasts';
      c.setAttribute('aria-live', 'polite');
      c.setAttribute('aria-atomic', 'true');
      document.body.appendChild(c);
    }
    return c;
  }

  function toast(mensagem, tipo) {
    var t = tipo || 'sucesso';
    var el = document.createElement('div');
    el.className = 'clic-toast clic-toast--' + t;
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<svg class="ic ic-18" viewBox="0 0 24 24" aria-hidden="true" style="color:' + (CORES[t] || CORES.info) + '">' +
      (ICONES[t] || ICONES.info) + '</svg><span>' + mensagem + '</span>';
    container().appendChild(el);

    // entra
    requestAnimationFrame(function () { el.classList.add('visivel'); });

    // sai
    setTimeout(function () {
      el.classList.remove('visivel');
      setTimeout(function () { el.remove(); }, 220);
    }, 3000);
  }

  global.CLIC = global.CLIC || {};
  global.CLIC.toast = toast;
})(window);
