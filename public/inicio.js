// Script clássico no <head> (blocking="render"), antes da 1ª pintura: tema e acento (sem flash).
(function () {
  var root = document.documentElement;
  var theme = null;
  try { theme = localStorage.getItem('tema'); } catch (e) {}
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  root.dataset.mode = theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  try { var tl = JSON.parse(sessionStorage.getItem('troca-lingua')); if (tl && tl.caminho === location.pathname && Date.now() - tl.quando < 5000) { root.dataset.trocaLingua = ''; var ex = document.createElement('link'); ex.rel = 'expect'; ex.href = '#lingua-pronta'; ex.setAttribute('blocking', 'render'); document.head.appendChild(ex); } } catch (e) {}
})();


// window.pageShown: resolve quando a página já está visível (fim do crossfade entre páginas, ou logo, sem ele).
// O main.js espera por ela antes de iniciar GSAP, Lenis, o preenchimento do nome e o morph do cabeçalho.
(function () {
  var done; window.pageShown = new Promise(function (res) { done = res; });
  if (!('onpagereveal' in window)) { done(); return; }
  addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) { done(); return; }
    e.viewTransition.finished.then(done, done);
  });
})();

// window.libsReady: o ScrollTrigger só entra se o GSAP carregou (ele dá erro sem o GSAP). Resolve true quando os dois estão prontos.
// Sem as bibliotecas o conteúdo fica como está no HTML, visível.
var inicioSrc = document.currentScript ? document.currentScript.src : location.href;
window.libsReady = new Promise(function (res) {
  addEventListener('DOMContentLoaded', function () {
    if (!window.gsap) { res(false); return; }
    var s = document.createElement('script'); s.src = new URL('vendor/ScrollTrigger.min.js', inicioSrc).href;
    s.onload = function () { res(!!window.ScrollTrigger); }; s.onerror = function () { res(false); };
    document.head.appendChild(s);
  });
});
