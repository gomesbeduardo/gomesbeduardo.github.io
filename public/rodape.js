// Rodapé: o botão "Feito com o Claude Code" abre o <dialog> modal (spec 004).
(function () {
  var btn = document.getElementById('claude-btn'), dlg = document.getElementById('sobre-site');
  if (!btn || !dlg || typeof dlg.showModal !== 'function') return;
  var titulo = dlg.querySelector('h2'), raiz = document.documentElement;
  function lenis() { return window.__lenis; }
  btn.addEventListener('click', function () {
    dlg.showModal();
    raiz.classList.add('modal-aberto');
    if (lenis() && lenis().stop) lenis().stop();
    dlg.scrollTop = 0;
    if (titulo) titulo.focus({ preventScroll: true });
  });
  dlg.addEventListener('close', function () {
    raiz.classList.remove('modal-aberto');
    if (lenis() && lenis().start) lenis().start();
    btn.focus({ preventScroll: true });
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.closest('[data-fechar]')) dlg.close();
  });
})();
