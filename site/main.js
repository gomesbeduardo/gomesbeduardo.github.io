(function () {
  var EN = document.documentElement.lang === 'en';
  var S = {
    typing:  { on: true, type: 45, hold: 1.8, variant: 'rand' },
    lenis:   { on: true, duration: 0.8 },
    reveal:  { on: true, dur: 0.5, offset: 24 },
    parallax:{ on: true, amount: 24 },
    tilt:    { on: true, max: 6 },
    marquee: { on: true, speed: 50 },
    count:   { on: true, dur: 1 }
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var runCount = function () {}, runTyping = function () {};

  // ---------- Digitação com erros, em ciclo ----------
  // "Desenvolvedor. " fixo; cada final é digitado com um erro realista (tecla vizinha ou letras trocadas),
  // pausa no erro, apaga até o ponto certo e redigita; fica, é apagado e o próximo entra.
  var ENDINGS = EN ? ['Information Systems at AMF.', 'Innovation at Asten AVMB.', 'TypeScript, React and Node.js.'] : ['Sistemas de Informação na AMF.', 'Inovação na Asten AVMB.', 'TypeScript, React e Node.js.'];
  var TYPOS = EN ? [
    [{ find: 'Systems', wrong: 'Sytsems' }, { find: 'Information', wrong: 'Infromation' }],
    [{ find: 'Innovation', wrong: 'Innovtaion' }, { find: 'Asten', wrong: 'Astne' }],
    [{ find: 'TypeScript', wrong: 'TypeScirpt' }, { find: 'React', wrong: 'Reavt' }]
  ] : [
    [{ find: 'Sistemas', wrong: 'Sistenas' }, { find: 'Informação', wrong: 'Infromação' }],
    [{ find: 'Inovação', wrong: 'Inivação' }, { find: 'Asten', wrong: 'Astne' }],
    [{ find: 'TypeScript', wrong: 'TypeScirpt' }, { find: 'React', wrong: 'Reavt' }]
  ];
  function plan(e) {
    var v = TYPOS[e][S.typing.variant === 'rand' || !S.typing.variant ? (Math.random() < 0.5 ? 0 : 1) : (+S.typing.variant === 2 ? 1 : 0)];
    var E = ENDINGS[e], i = E.indexOf(v.find), j = i + v.find.length, extra = 1 + Math.floor(Math.random() * 2);
    var wrong = E.slice(0, i) + v.wrong + E.slice(j, j + extra), fr = [], c = 0, k;
    for (k = 1; k <= wrong.length; k++) fr.push({ s: wrong.slice(0, k) });
    fr[fr.length - 1].pause = true;
    while (wrong[c] === E[c]) c++;
    for (k = wrong.length - 1; k >= c; k--) fr.push({ s: wrong.slice(0, k), back: true });
    for (k = c + 1; k <= E.length; k++) fr.push({ s: E.slice(0, k) });
    return fr;
  }
  function setupTyping(el) {
    var PRE = EN ? 'Developer. ' : 'Desenvolvedor. ', cycles = 0, timer = null, idx = 0, len = 0, phase = 'type', fr = plan(0), n = 0, paused = false, onScreen = true;
    var txt = document.createTextNode(PRE), caret = document.createElement('span');
    caret.className = 'caret'; el.textContent = ''; el.append(txt, caret);
    var jit = function (ms) { return ms * (0.75 + Math.random() * 0.5); };
    function step() {
      timer = null; if (paused || phase === 'end') return;
      var d;
      if (phase === 'type') {
        var f = fr[n++]; txt.nodeValue = PRE + f.s;
        d = jit(S.typing.type) * (f.back ? 0.6 : 1) + (f.pause ? 280 : 0);
        if (n >= fr.length) {
          if (++cycles >= 3) { phase = 'end'; caret.classList.add('stop'); return; }   // fica na última frase
          phase = 'hold'; len = ENDINGS[idx].length; d = S.typing.hold * 1000;
        }
      } else if (phase === 'hold') { phase = 'erase'; d = 25; }
      else if (phase === 'erase') { len--; txt.nodeValue = PRE + ENDINGS[idx].slice(0, Math.max(0, len)); if (len <= 0) { phase = 'gap'; d = 300; } else d = 25; }
      else { idx = (idx + 1) % ENDINGS.length; fr = plan(idx); n = 0; phase = 'type'; d = 0; }
      timer = setTimeout(step, d);
    }
    function sync() {
      var p = document.hidden || !onScreen;
      if (p === paused) return; paused = p; if (phase === 'end') return;
      if (paused) { clearTimeout(timer); timer = null; } else if (!timer) timer = setTimeout(step, 300);
    }
    document.addEventListener('visibilitychange', sync);
    var hero = el.closest('.hero');
    if (hero && window.IntersectionObserver) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; sync(); }).observe(hero);
    function run() { clearTimeout(timer); cycles = 0; caret.classList.remove('stop'); idx = 0; fr = plan(0); n = 0; phase = 'type'; txt.nodeValue = PRE; timer = paused ? null : setTimeout(step, 300); }
    runTyping = run; timer = setTimeout(step, 300);
  }

  // ---------- Atalhos do cabeçalho: rolagem com duração pela distância e indicador da seção ativa ----------
  var lenisRef = null, navBusy = false;
  var easeIO = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function setupNav(reduce) {
    var nav = $('.top nav'), ind = $('.nav-ind'), links = $$('.top nav a[href^="#"], #menu a[href^="#"]');
    var ids = []; links.forEach(function (a) { var id = a.getAttribute('href').slice(1); if (id && ids.indexOf(id) < 0) ids.push(id); });
    var active = null;
    function moveInd(id, dur) {
      if (!ind || !nav) return;
      var a = id && $('a[href="#' + id + '"]', nav);
      if (!a || !a.offsetWidth) { ind.classList.remove('on'); return; }
      ind.classList.add('on');
      var to = { x: a.offsetLeft, width: a.offsetWidth, y: a.offsetTop };
      if (reduce || !dur || !window.gsap) { if (window.gsap) gsap.set(ind, to); else ind.style.cssText = 'transform:translate(' + to.x + 'px,' + to.y + 'px);width:' + to.width + 'px'; }
      else gsap.to(ind, Object.assign({ duration: dur, ease: easeIO, overwrite: true }, to));
    }
    function setActive(id, dur) {
      if (id === active) return; active = id;
      links.forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      moveInd(id, dur);
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); return; }   // href="#" (marcador): não pula para o topo nem muda o endereço
      var target = document.getElementById(id); if (!target) return;
      e.preventDefault();
      var inNav = ids.indexOf(id) >= 0;
      var dest = Math.max(0, target.getBoundingClientRect().top + scrollY - 96), dist = Math.abs(dest - scrollY);
      var dur = Math.min(1.2, Math.max(0.8, 0.8 + dist / 15000)), t0 = performance.now();
      function arrive() {
        navBusy = false; window.navLast = { id: id, dist: Math.round(dist), dur: dur, ms: Math.round(performance.now() - t0) };
        try { history.replaceState(null, '', '#' + id); } catch (er) {}
        var h = $('h2', target) || target; if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
      // o menu (abaixo de 900px) fecha no clique; a rolagem começa no quadro seguinte
      requestAnimationFrame(function () {
        if (lenisRef && !reduce) {
          navBusy = true; if (inNav) setActive(id, dur);
          lenisRef.scrollTo(target, { offset: -96, duration: dur, easing: easeIO, onComplete: arrive });
        } else { if (inNav) setActive(id, 0); scrollTo(0, dest); arrive(); }
      });
    });
    addEventListener('resize', function () { moveInd(active, 0); });
    if (window.ScrollTrigger) ids.forEach(function (id) {
      var sec = document.getElementById(id); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (st) {
        if (navBusy) return;
        if (st.isActive) setActive(id, reduce ? 0 : 0.4); else if (active === id) setActive(null, 0);
      } });
    });
  }

  // ---------- Calendário (dados reais, ver #cal-dados no HTML) ----------
  function buildCalendar() {
    var cal = $('#cal'), src = $('#cal-dados'); if (!cal || !src) return;
    var dias = JSON.parse(src.textContent), h = '';
    for (var i = 0; i < dias.pad; i++) h += '<i data-l="0" style="visibility:hidden"></i>';
    dias.d.forEach(function (x) { h += '<i data-l="' + x[1] + '" title="' + x[0] + ': ' + x[2] + '"></i>'; });
    cal.innerHTML = h;
  }

  // ---------- Menu (abaixo de 900px) ----------
  function setupMenu() {
    var btn = $('#menu-btn'), menu = $('#menu'); if (!btn || !menu) return;
    function set(open, refocus) {
      btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open;
      if (open) { var f = $('a', menu); if (f) f.focus(); } else if (refocus) btn.focus();
    }
    btn.addEventListener('click', function () { set(menu.hidden, true); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false, false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) set(false, true); });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) set(false, false);
    });
  }

  // ---------- Trajetória: Ler mais ----------
  function setupMore() {
    $$('.more-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true', box = document.getElementById(b.getAttribute('aria-controls'));
        b.setAttribute('aria-expanded', String(open)); box.hidden = !open;
        b.firstChild.nodeValue = open ? (EN ? 'Read less' : 'Ler menos') : (EN ? 'Read more' : 'Ler mais');
        var t = $('.traj'); if (t) placeTraj(t);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }

  // Fio da trajetória: do centro do 1º nó ao centro do último; guarda a posição relativa de cada nó.
  function placeTraj(traj) {
    var nodes = $$('.node', traj), line = $('.traj-line', traj); if (!nodes.length || !line) return;
    var base = traj.getBoundingClientRect().top, c = function (n) { var r = n.getBoundingClientRect(); return r.top + r.height / 2 - base; };
    var top = c(nodes[0]), end = c(nodes[nodes.length - 1]);
    line.style.top = top + 'px'; line.style.bottom = 'auto'; line.style.height = (end - top) + 'px';
    nodes.forEach(function (n) { n._p = (c(n) - top) / (end - top || 1); });
  }

  // ---------- Contadores ----------
  function fmt(n) { return n.toLocaleString(EN ? 'en-US' : 'pt-BR'); }

  function init() {
    buildCalendar(); setupMenu(); setupMore();
    var tj = $('.traj'); if (tj) { placeTraj(tj); addEventListener('resize', function () { placeTraj(tj); }); addEventListener('load', function () { placeTraj(tj); }); }
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setupNav(reduce);
    var mm = window.gsap && window.ScrollTrigger ? gsap.matchMedia() : null;   // sem as bibliotecas, só o que não depende delas
    if (mm) gsap.registerPlugin(ScrollTrigger);

    // Marquee (CSS)
    $$('.stack-rows .row').forEach(function (row) {
      if (!S.marquee.on) row.parentNode.classList.add('static');
      else if (!reduce) row.style.setProperty('--mq-dur', (row.scrollWidth / 2 / S.marquee.speed) + 's');
    });

    // Faixa da stack: foco do teclado (:focus-within no CSS) e toque (um toque pausa, outro retoma)
    $$('.stack-rows .row').forEach(function (row) {
      row.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') row.classList.toggle('paused'); });
    });

    // Copiar e-mail
    var cp = $('#copy-email');
    if (cp) cp.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText('eduardobgomes100@gmail.com');
      var t = $('span', cp), u = $('use', cp);
      t.textContent = EN ? 'Copied' : 'Copiado'; u.setAttribute('href', '#i-check');
      setTimeout(function () { t.textContent = EN ? 'Copy email' : 'Copiar e-mail'; u.setAttribute('href', '#i-copy'); }, 1500);
    });

    if (mm) mm.add('(prefers-reduced-motion: no-preference)', function () {
      var lenis;
      if (S.lenis.on && window.Lenis) {
        lenis = new Lenis({ duration: S.lenis.duration }); lenisRef = lenis; window.__lenis = lenis;
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      }

      var tl = $('#typing');
      if (tl && S.typing.on) setupTyping(tl);

      // Sobre: o primeiro parágrafo acende palavra por palavra enquanto passa pelo meio da tela
      var litP = $('#sobre .lit'), litW = litP ? $$('.w', litP) : [];
      if (litW.length) { litP.classList.add('on'); gsap.to(litW, { '--k': 1, duration: 1, ease: 'none', stagger: 0.35, scrollTrigger: { trigger: litP.closest('.about') || litP, start: 'top 85%', end: 'top 45%', scrub: true } }); }

      if (S.reveal.on) {
        // O init roda com a página já pintada (depois da transição e das bibliotecas): o que já está na tela fica como está.
        var seen = function (el) { return el.getBoundingClientRect().top < innerHeight * 0.9; };
        $$('.reveal').forEach(function (el) {
          if (seen(el)) return;
          gsap.from(el, { y: S.reveal.offset, opacity: 0, duration: S.reveal.dur, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
        var stag = $$('.stag').filter(function (el) { return !seen(el); });
        if (stag.length) { gsap.set(stag, { y: S.reveal.offset, opacity: 0 });
        ScrollTrigger.batch(stag, { start: 'top 90%', once: true,
          onEnter: function (b) { gsap.to(b, { y: 0, opacity: 1, duration: S.reveal.dur, stagger: 0.06, ease: 'expo.out' }); } }); }
      }

      // Projetos: o leadgate entra primeiro (capa, depois texto); InfoHub e LMS entram em seguida, com defasagem quando estão lado a lado.
      if (S.reveal.on) {
        var enter = function (card, delay) {
          var sh = $('.shot', card), bd = $('.body', card);
          gsap.to([sh, bd], { y: 0, opacity: 1, duration: 0.65, delay: delay || 0, stagger: 0.12, ease: 'expo.out', overwrite: 'auto', clearProps: 'opacity' });
        };
        $$('.project').forEach(function (card) {
          var sh = $('.shot', card), bd = $('.body', card); if (!sh || !bd) return;
          if (card.getBoundingClientRect().top < innerHeight * 0.85) return;
          gsap.set(sh, { y: S.reveal.offset * 1.5, opacity: 0 }); gsap.set(bd, { y: S.reveal.offset, opacity: 0 });
          ScrollTrigger.create({ trigger: card, start: 'top 85%', once: true, onEnter: function () {
            var pair = card.parentNode.classList.contains('project-pair'), delay = 0;
            if (pair) { var sib = $$('.project', card.parentNode), i = sib.indexOf(card); if (i > 0 && Math.abs(sib[0].getBoundingClientRect().top - card.getBoundingClientRect().top) < 8) delay = 0.14 * i; }
            enter(card, delay);
          } });
        });
      }

      if (S.parallax.on && S.parallax.amount > 0) {
        var a = S.parallax.amount;
        $$('.hero .name-row, .hero .photo').forEach(function (el, i) {
          gsap.to(el, { y: -a * (i ? 2 : 1), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        });
      }

      if (fine && S.tilt.on) {
        $$('.project').forEach(function (row) {
          var card = $('.shot', row);
          row.addEventListener('mousemove', function (e) {
            var r = row.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(card, { rotationY: px * 2 * S.tilt.max, rotationX: -py * 2 * S.tilt.max, transformPerspective: 1200, duration: 0.4, ease: 'expo.out', overwrite: 'auto' });
          });
          row.addEventListener('mouseenter', function () { gsap.to(card, { y: -6, duration: 0.5, ease: 'expo.out', overwrite: 'auto' }); });
          row.addEventListener('mouseleave', function () {
            gsap.to(card, { rotationX: 0, rotationY: 0, y: 0, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
          });
        });
      }

      if (fine && S.tilt.on) {
        // Foto do topo: o conjunto (foto e bloco de destaque) inclina até 2°, como os cards de projeto.
        // A inclinação mora na .photo, fora do contexto 3D do .photo-card: dentro dele a metade que recua cai atrás do plano
        // do card e o clique do mouse não chega ao botão.
        $$('.photo-btn').forEach(function (btn) {
          var cartaPhoto = btn.closest('.photo'); if (!cartaPhoto) return;
          btn.addEventListener('mousemove', function (e) {
            if (cartaPhoto.classList.contains('virado') || cartaPhoto.classList.contains('girando')) return; // virado ou girando: sem inclinação
            var r = cartaPhoto.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(cartaPhoto, { rotationY: px * 4, rotationX: -py * 4, transformPerspective: 1200, duration: 0.4, ease: 'expo.out', overwrite: 'auto' });
          });
          btn.addEventListener('mouseleave', function () { gsap.to(cartaPhoto, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'expo.out', overwrite: 'auto' }); });
        });
      }

      if (S.count.on) {
        var nums = $$('.num');
        var play = function (el) {
          var v = +el.dataset.v, o = { n: 0 }, vis = $('[aria-hidden]', el);
          gsap.to(o, { n: v, duration: S.count.dur, ease: 'expo.out', onUpdate: function () { vis.textContent = fmt(Math.round(o.n)); } });
        };
        nums.forEach(function (el) { $('[aria-hidden]', el).textContent = '0'; });
        nums.forEach(function (el) { ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { play(el); } }); });
        runCount = function () { nums.forEach(function (el) { $('[aria-hidden]', el).textContent = '0'; play(el); }); };
      }
      var traj = $('.traj');
      if (traj) {
        var nodes = $$('.node', traj), fill = $('.traj-fill', traj), place = function () { placeTraj(traj); };
        traj.classList.add('anim');
        gsap.set(fill, { scaleY: 0 });
        ScrollTrigger.addEventListener('refreshInit', place);
        gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: nodes[0], start: 'center 65%', endTrigger: nodes[nodes.length - 1], end: 'center 65%', scrub: true,
          onUpdate: function (st) {
            traj.dataset.progress = st.progress.toFixed(3);
            nodes.forEach(function (n) { n.classList.toggle('on', st.progress > 0 && st.progress >= n._p - 0.002); });
          } } });
      }

      if (document.readyState === 'complete') ScrollTrigger.refresh(); else addEventListener('load', function () { ScrollTrigger.refresh(); });
      return function () { if (lenis) lenis.destroy(); lenisRef = null; };
    });
  }
  // ---------- Cabeçalho: barra no topo, pílula depois de rolar (morph no estilo Dynamic Island) ----------
  // Curva sem sobressalto, 300 ms. Só transform, opacity e clip-path animam; os itens não passam de 60% de opacidade.
  var SPRING = 'cubic-bezier(.2,.8,.2,1)';
  var MORPH = 300, LAG = 0;
  function setupHeader() {
    var top = $('.top'); if (!top) return;
    var bg = document.createElement('span'), edge = document.createElement('span');
    bg.className = 'top-bg'; edge.className = 'top-edge'; bg.setAttribute('aria-hidden', 'true'); edge.setAttribute('aria-hidden', 'true');
    top.prepend(bg, edge);
    var reduceQ = matchMedia('(prefers-reduced-motion: reduce)'), state = null, anims = [];
    function items() { return $$(':scope > :not(.top-bg):not(.top-edge)', top).filter(function (e) { return e.offsetWidth > 0; }); }
    // geometria no layout (offset*, sem transform): caixa da pílula e deslocamento de cada item na barra
    function geo() {
      var it = items(), cs = getComputedStyle(top), W = top.clientWidth, H = top.clientHeight;
      var gl = parseFloat(cs.paddingLeft), gr = W - parseFloat(cs.paddingRight), l = Infinity, r = -Infinity;
      it.forEach(function (e) { l = Math.min(l, e.offsetLeft); r = Math.max(r, e.offsetLeft + e.offsetWidth); });
      var first = it[0], left = first && (first.matches('nav') || first.matches('.back')) ? first : null;
      var pl = left ? parseFloat(getComputedStyle(left.matches('nav') ? $('a', left) : left).paddingLeft) || 0 : 0;
      var dl = left ? gl - left.offsetLeft - pl : 0, dr = gr - r;
      return { it: it, dx: it.map(function (e) { return e === left ? dl : dr; }),
        pill: 'inset(14px ' + (W - r - 8) + 'px ' + (H - 60) + 'px ' + (l - 8) + 'px round 23px)', l: l - 8, w: r - l + 16 };
    }
    function apply(next, animate) {
      if (next === state) return;
      var it = items(), from = it.map(function (e) { return getComputedStyle(e).transform; });
      var fromClip = getComputedStyle(bg).clipPath, fromBg = getComputedStyle(bg).opacity, fromEdge = getComputedStyle(edge).opacity;
      anims.forEach(function (a) { a.cancel(); }); anims = [];
      state = next; var pill = next === 'pill';
      top.classList.toggle('pill', pill); top.classList.toggle('faixa', !pill);
      var g = geo(), toClip = pill ? g.pill : 'inset(0px 0px 0px 0px round 0px)';
      bg.style.clipPath = toClip;
      edge.style.left = g.l + 'px'; edge.style.width = g.w + 'px';
      g.it.forEach(function (e, i) { e.style.transform = pill || !g.dx[i] ? '' : 'translateX(' + g.dx[i] + 'px)'; });
      if (!animate) return;
      var A = function (el, kf, o) { anims.push(el.animate(kf, Object.assign({ fill: 'backwards' }, o))); };
      A(bg, { clipPath: [fromClip, toClip] }, { duration: MORPH, easing: SPRING });
      if (pill) { A(bg, { opacity: [fromBg, 1] }, { duration: 200 }); A(edge, { opacity: [0, 1] }, { duration: 200, delay: MORPH - 200 }); }
      else { A(bg, { opacity: [fromBg, 0] }, { duration: 220 }); A(edge, { opacity: [fromEdge, 0] }, { duration: 120 }); }
      g.it.forEach(function (e, i) {
        var to = getComputedStyle(e).transform, f = from[it.indexOf(e)] || 'none';
        A(e, { transform: [(f === 'none' ? '' : f + ' ') + 'scale(.96)', to === 'none' ? 'scale(1)' : to + ' scale(1)'] }, { duration: MORPH, delay: LAG, easing: SPRING });
        A(e, { opacity: [0.6, 1] }, { duration: 240, delay: LAG, easing: 'cubic-bezier(.2,.7,.3,1)' });
      });
    }
    // Histerese: vira pílula depois de 120 px; volta à barra abaixo de 80 px, ou já abaixo de 120 px quando a rolagem inverte para cima.
    var lastY = scrollY, dir = 0;
    function want() { var y = scrollY; dir = y > lastY ? 1 : y < lastY ? -1 : dir; lastY = y; return state === 'pill' ? (y < 80 || (dir < 0 && y < 120) ? 'faixa' : 'pill') : (y > 120 ? 'pill' : 'faixa'); }
    // Sem morph antes do fim da transição de chegada (P3): restauração de rolagem e pageshow trocam o estado na hora.
    var canAnim = false; (window.pageShown || Promise.resolve()).then(function () { canAnim = true; });
    function update() { apply(want(), canAnim && !reduceQ.matches); }
    apply(scrollY > 120 ? 'pill' : 'faixa', false);
    addEventListener('scroll', update, { passive: true });
    addEventListener('pageshow', function () { apply(want(), false); });
    var refit = function () { var s = state; state = null; apply(s, false); };
    addEventListener('resize', refit);
    if (document.fonts) document.fonts.ready.then(refit);
    window.headerState = function () { return state; };
  }
  setupHeader();

  // Nome: o preenchimento de "Gomes" roda uma vez, depois da transição de chegada (CSS; reduced motion mostra cheio).
  (function () {
    var h = $('.hero h1.pre'); if (!h) return;
    (window.pageShown || Promise.resolve()).then(function () { requestAnimationFrame(function () { h.classList.remove('pre'); h.classList.add('run'); }); });
  })();

  // GSAP, ScrollTrigger e Lenis são locais (vendor/, com defer): já estão avaliados quando este script roda.
  // O init (animações, Lenis, ScrollTrigger) espera só o fim do crossfade de chegada (inicio.js), para não disputar quadros com ele.
  Promise.all([window.pageShown || Promise.resolve(), window.libsReady || Promise.resolve(false)]).then(init);
})();
