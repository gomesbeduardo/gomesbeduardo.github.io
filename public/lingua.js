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
    for (var i = 0; i < blocos.length; i++) {
      var b = blocos[i];
      var r = b.getBoundingClientRect();
      if (r.bottom > 0) {
        // Título da seção que contém o bloco (R3), pela estrutura: o h2 com âncora da <section> (ou da coluna do rodapé).
        var sec = b.closest('section, .foot-col'), h = sec ? sec.querySelector('h2[data-ancora]') : null;
        var titulo = h ? h.getAttribute('data-ancora') : null;
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

  // R5: a primeira ação do visitante encerra todas as correções pendentes (fontes, quadro seguinte, load, init).
  var cancelado = false;
  var ENTRADAS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  function parar() {
    cancelado = true;
    for (var i = 0; i < ENTRADAS.length; i++) window.removeEventListener(ENTRADAS[i], parar, { capture: true });
  }

  // Leva o bloco à mesma distância do topo da janela. Sem animação; não passa do fim da página.
  function aplicar(tolerancia) {
    if (cancelado) return;
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
    for (var q = 0; q < ENTRADAS.length; q++) window.addEventListener(ENTRADAS[q], parar, { passive: true, capture: true });
    aplicar();
    var fontes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontes.then(function () {
      aplicar(); // a troca de fonte muda a altura do texto
      requestAnimationFrame(function () { aplicar(); });
    });
    // Correção tardia: o main.js (init) e o carregamento mexem na altura depois do primeiro quadro; só corrige
    // se o bloco saiu mais de 0,5 px do lugar.
    // Quando as duas correções tardias terminam, os ouvintes de entrada saem.
    var faltam = 2;
    var tarde = function () { aplicar(0.5); if (--faltam === 0) parar(); };
    if (document.readyState === 'complete') tarde(); else window.addEventListener('load', tarde);
    Promise.all([window.pageShown || Promise.resolve(), window.libsReady || Promise.resolve()]).then(function () {
      requestAnimationFrame(function () { requestAnimationFrame(tarde); });
    });
  }
  // ---- R4: sem repetir a abertura ----
  if (entrada) {
    var h1 = document.querySelector('.hero h1');
    if (h1) h1.setAttribute('data-sem-abertura', ''); // fica; o CSS mantém o nome escrito (global.css)

    // Contadores dentro ou acima da janela mostram o valor final e não contam de novo; os de baixo seguem animando.
    // O main.js zera cada .num no init e cria um ScrollTrigger (once) por contador, que dispara um tween em um
    // objeto { n }. Aqui: remove o gatilho dos visíveis, completa os tweens {n} já ativos e grava o valor final.
    var numerosFinais = function () {
      var nums = document.querySelectorAll('.num');
      var vis = [];
      for (var i = 0; i < nums.length; i++) { if (nums[i].getBoundingClientRect().top < window.innerHeight) vis.push(nums[i]); }
      if (!vis.length) return;
      if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (st) {
        for (var k = 0; k < vis.length; k++) { if (st.trigger === vis[k]) { st.kill(); return; } }
      });
      if (window.gsap) gsap.globalTimeline.getChildren(true, true, false).forEach(function (tw) {
        var alvo = tw.targets && tw.targets()[0];
        if (alvo && typeof alvo === 'object' && typeof alvo.n === 'number' && !alvo.nodeType) { tw.progress(1); tw.kill(); }
      });
      vis.forEach(function (el) {
        var cheio = el.querySelector('.sr-only'), tela = el.querySelector('[aria-hidden]');
        if (cheio && tela) tela.textContent = cheio.textContent;
      });
    };
    // Revelações na faixa que o main.js esconde no init (.reveal e .stag entre 0,9 e 1 da altura, capas e textos dos
    // projetos entre 0,85 e 1) têm o gatilho em 'top 88%'/'top 85%' e só disparam ao rolar. Tudo que começa acima do
    // fim da janela chega no estado final; o que está abaixo segue o main.js.
    var revelacoesFinais = function () {
      if (!window.gsap) return;
      var els = document.querySelectorAll('.reveal, .stag, .project .shot, .project .body');
      var alvos = [], gatilhos = [];
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.getBoundingClientRect().top >= window.innerHeight) continue;
        gatilhos.push(el, el.closest('.project'));
        if (+getComputedStyle(el).opacity < 0.99 || gsap.getProperty(el, 'y') !== 0) alvos.push(el);
      }
      if (!alvos.length) return;
      if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (st) {
        if (st.trigger && gatilhos.indexOf(st.trigger) !== -1) st.kill();
      });
      gsap.killTweensOf(alvos);
      gsap.set(alvos, { y: 0, opacity: 1 });
    };
    var final = function () { numerosFinais(); revelacoesFinais(); };
    Promise.all([window.pageShown || Promise.resolve(), window.libsReady || Promise.resolve()]).then(function () {
      final(); // logo depois do init, antes de pintar o zero
      requestAnimationFrame(function () { final(); requestAnimationFrame(final); });
    });
  }
  // O atributo que o inicio.js pôs no <html> sai depois do primeiro quadro.
  requestAnimationFrame(function () { requestAnimationFrame(function () { raiz.removeAttribute('data-troca-lingua'); }); });
})();
