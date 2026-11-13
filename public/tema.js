// T2: troca de tema com o tema novo descendo do topo, borda ondulada e macia (máscara SVG animada), 900 ms.
// O clique no #theme-toggle é interceptado na captura do document; é o único handler do tema.
(function () {
  var root = document.documentElement, DUR = 900, EDGE = 108;
  function wave() {
    var d = 'M-20,-20H1020V1040';
    for (var x = 1000; x >= 0; x -= 20) d += 'L' + x + ',' + (1040 + 22 * Math.sin(x / 70) + 12 * Math.sin(x / 23 + 1)).toFixed(1);
    d += 'L-20,1040Z';
    return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 2100"' +
      ' preserveAspectRatio="none"><filter id="b" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="7"/>' +
      '</filter><path filter="url(#b)" fill="#fff" d="' + d + '"/></svg>') + '")';
  }
  var mask = null;
  function label(b) { if (b) b.setAttribute('aria-label', (root.lang === 'en') ? (root.dataset.mode === 'dark' ? 'Use light theme' : 'Use dark theme') : (root.dataset.mode === 'dark' ? 'Usar tema claro' : 'Usar tema escuro')); }
  function setTheme(next, b) {
    root.dataset.theme = next; root.dataset.mode = next; label(b);
    try { localStorage.setItem('tema', next); } catch (e) {}
  }
  // Sem tema salvo, data-mode acompanha o sistema (troca ao vivo e volta do bfcache); com tema salvo, não mexe.
  var mq = matchMedia('(prefers-color-scheme: dark)');
  function sync() {
    if (root.dataset.theme) return;
    root.dataset.mode = mq.matches ? 'dark' : 'light';
    label(document.getElementById('theme-toggle'));
  }
  if (mq.addEventListener) mq.addEventListener('change', sync); else if (mq.addListener) mq.addListener(sync);
  addEventListener('pageshow', function (e) { if (e.persisted) sync(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#theme-toggle');
    if (!b) return;
    e.stopImmediatePropagation(); e.stopPropagation();
    var next = root.dataset.mode === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) { setTheme(next, b); return; }
    if (!mask) { mask = wave(); root.style.setProperty('--tx-mask', mask); }
    root.dataset.tx = 'T2';
    var vt = document.startViewTransition(function () { setTheme(next, b); });
    vt.ready.then(function () {
      var p = ['0px ' + (-EDGE * innerHeight / 100) + 'px', '0px 0px'];
      root.animate({ maskPosition: p, webkitMaskPosition: p },
        { duration: DUR, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'both', pseudoElement: '::view-transition-new(root)' });
    }, function () {});
    vt.finished.then(function () { delete root.dataset.tx; }, function () { delete root.dataset.tx; });
  }, true);
})();
