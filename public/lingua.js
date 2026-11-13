// Troca de língua no mesmo ponto de leitura (spec 001d R2 e R3). Script clássico, carregado com defer
// nas páginas que têm o seletor PT/EN. Sem JS, o link continua abrindo a outra página no topo.
(function () {
  var CHAVE = 'troca-lingua';
  var ESPERA_MAX = 5000;
  var raiz = document.documentElement;

  // Posição de repouso do bloco: o top medido menos o deslocamento vertical (translateY) do próprio bloco e dos
  // ancestrais. Extensão do R2: um clique no meio da animação de entrada (gsap `y`) guarda onde o bloco vai ficar,
  // não onde ele está passando; na página nova o bloco já nasce no estado final.
  function repouso(el) {
    var t = el.getBoundingClientRect().top;
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var tr = getComputedStyle(n).transform;
      if (tr && tr !== 'none') { try { t -= new DOMMatrix(tr).m42; } catch (err) {} }
    }
    return t;
  }

  // ---- R2: no clique no link do outro idioma, guarda o bloco de leitura que está no topo da janela ----
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('.lang a[hreflang], .foot-lang a[hreflang]') : null;
    if (!a || a.hasAttribute('aria-current')) return;
    var blocos = document.querySelectorAll('[data-ancora]');
    var titulo = null;
    for (var i = 0; i < blocos.length; i++) {
      var b = blocos[i];
      if (/-titulo$/.test(b.getAttribute('data-ancora'))) titulo = b.getAttribute('data-ancora');
      var r = b.getBoundingClientRect();
      if (r.bottom > 0) {
        try {
          sessionStorage.setItem(CHAVE, JSON.stringify({ caminho: new URL(a.href).pathname, ancora: b.getAttribute('data-ancora'), titulo: titulo, top: repouso(b), quando: Date.now() }));
        } catch (err) {}
        return; // sem preventDefault: a navegação segue o href
      }
    }
  }, true);

  // ---- R3: lê e apaga a entrada (válida ou não) ----
  var entrada = null;
  try {
    var bruto = sessionStorage.getItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    var e0 = bruto && JSON.parse(bruto);
    if (e0 && e0.caminho === location.pathname && Date.now() - e0.quando < ESPERA_MAX && typeof e0.top === 'number') entrada = e0;
  } catch (err) {}

  function achar(id) { return id ? document.querySelector('[data-ancora="' + id + '"]') : null; }

  // Leva o bloco à mesma distância do topo da janela. Sem animação; não passa do fim da página.
  function aplicar(tolerancia) {
    var el = achar(entrada.ancora), ref = entrada.top;
    if (!el) { el = achar(entrada.titulo); }
    if (!el) return;
    var delta = repouso(el) - ref;
    if (Math.abs(delta) <= (tolerancia || 0.01)) return;
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var y = Math.min(max, Math.max(0, window.scrollY + delta)); // alvo fracionário: o layout também é
    if (y === window.scrollY) return;
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
  }

  if (entrada) {
    aplicar();
    var fontes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontes.then(function () {
      aplicar(); // a troca de fonte muda a altura do texto
      requestAnimationFrame(function () { aplicar(); });
    });
    // Correção tardia: o main.js (init) e o carregamento mexem na altura depois do primeiro quadro; só corrige
    // se o bloco saiu mais de 0,5 px do lugar.
    var tarde = function () { aplicar(0.5); };
    window.addEventListener('load', tarde);
    Promise.all([window.pageShown || Promise.resolve(), window.libsReady || Promise.resolve()]).then(function () {
      requestAnimationFrame(function () { requestAnimationFrame(tarde); });
    });
  }
  // O atributo que o inicio.js pôs no <html> sai depois do primeiro quadro.
  requestAnimationFrame(function () { requestAnimationFrame(function () { raiz.removeAttribute('data-troca-lingua'); }); });
})();
