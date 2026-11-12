// Surpresas: curiosidades escondidas (palavras, foto, botão, console). 
(function () {
  var EN = document.documentElement.lang === 'en';
  var TXT_PT = {
    c1: 'Meu primeiro contato com programação foi o CS50 de Harvard, online, em 2018. O primeiro exercício é um hello, world em C.',
    c2: 'Na pandemia eu mexia em mods de jogos, principalmente Minecraft.',
    c3: 'O leadgate tem cerca de 570 testes. A IA dele é avaliada com um conjunto de casos guardado à parte, que não entra no desenvolvimento.',
    c4: 'Fui campeão do CodeRace 2026 com o AgroPlanner.',
    c5: '1º lugar no 1º Ideathon de SI da AMF, em outubro de 2025, com a equipe Mentor.Me.',
    c6: 'A frase do rodapé é do Zen of Python e também está no README do meu perfil no GitHub.',
    c7: 'PMOC é o plano de manutenção de ar-condicionado que a Lei 13.589/2018 exige em prédios de uso coletivo. Lidero o sistema que gere isso na CentralEng.',
    c8: 'Fui professor bolsista no JET e dei aulas de tecnologia para 100 alunos de 4 escolas públicas.',
    c9: 'Este site começou por uma spec, como meus outros projetos. A spec 001 descreve esta página.',
    c10: 'Sou cofundador do YourMentor desde outubro de 2025, quando ele ainda se chamava Mentor.Me.'
  };
  var TXT_EN = {
    c1: 'My first contact with programming was Harvard\'s CS50, online, in 2018. The first exercise is a hello, world in C.',
    c2: 'During the pandemic I tinkered with game mods, mostly Minecraft.',
    c3: 'leadgate has about 570 tests. Its AI is evaluated on a held-out set of cases that is not used during development.',
    c4: 'I won CodeRace 2026 with AgroPlanner.',
    c5: '1st place at the 1st AMF Information Systems Ideathon, in October 2025, with team Mentor.Me.',
    c6: 'The footer quote is from the Zen of Python and is also in the README of my GitHub profile.',
    c7: 'PMOC is the air-conditioning maintenance plan that Brazilian Law 13.589/2018 requires in buildings for collective use. I lead the system that manages it at CentralEng.',
    c8: 'I was a scholarship teacher at JET and taught technology to 100 students from 4 public schools.',
    c9: 'This site started from a spec, like my other projects. Spec 001 describes this page.',
    c10: 'I have been a co-founder of YourMentor since October 2025, back when it was called Mentor.Me.'
  };
  var TXT = EN ? TXT_EN : TXT_PT;
  // Ficha do verso da foto (spec 005): fatos que já estão na Trajetória do site, encurtados.
  var FICHA = EN ? [
    ['At YourMentor', 'Back end in Python, FastAPI and PostgreSQL; architecture, data model and monetization.'],
    ['Before', 'ToPark, Apr 2024 to Oct 2025: a startup for booking parking spaces, in the first cohort of the InovAMF incubator.'],
    ['Based in', 'Santa Maria, Brazil']
  ] : [
    ['No YourMentor', 'Back-end em Python, FastAPI e PostgreSQL; arquitetura, modelo de dados e monetização.'],
    ['Antes', 'ToPark, de abr/2024 a out/2025: startup de reserva de vagas de estacionamento, na primeira turma da incubadora InovAMF.'],
    ['Base', 'Santa Maria, RS']
  ];
  var T = EN ? { curio: 'Curiosity', testes: 'Test results', volta: 'flip back', fechar: 'Close', cat: '$ cat curiosity.txt', ilus: '# illustrative output', spec: '# Spec 001: portfolio', of: ' of ', found: ' found', all: '. You found them all.', yes: 'yes', no: 'no', ret: ' found', term: 'Terminal' }
             : { curio: 'Curiosidade', testes: 'Resultado dos testes', volta: 'virar de volta', fechar: 'Fechar', cat: '$ cat curiosidade.txt', ilus: '# saída ilustrativa', spec: '# Spec 001: portfólio', of: ' de ', found: ' achados', all: '. Você achou tudo.', yes: 'sim', no: 'não', ret: ' achados', term: 'Terminal' };
  var IDS = Object.keys(TXT), TOTAL = IDS.length;
  // Comandos do terminal por curiosidade (linhas com "$ " são digitadas como comando).
  var CMD = {
    c1: ['$ make hello', '$ ./hello', 'hello, world'],
    c3: ['$ npm test', EN ? '# illustrative output' : '# saída ilustrativa', '570 passing']
  };
  var SPARK = '<svg class="sp-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5l2.6 2.6M14.9 14.9l2.6 2.6M6.5 17.5l2.6-2.6M14.9 9.1l2.6-2.6"/></svg>';
  var reduce = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- Configuração e achados ----------
  var ACH = 'achados';
  var ligado = true;
  function lerAchados() {
    try { var a = JSON.parse(localStorage.getItem(ACH) || '[]'); return Array.isArray(a) ? a.filter(function (id) { return TXT[id]; }) : []; } catch (e) { return []; }
  }
  function marcar(id) {
    var a = lerAchados(), novo = a.indexOf(id) < 0;
    if (novo) { a.push(id); try { localStorage.setItem(ACH, JSON.stringify(a)); } catch (e) {} }
    return { n: a.length, fechou: novo && a.length === TOTAL };
  }
  function contagem(r) { return r.fechou ? TOTAL + T.of + TOTAL + T.all : r.n + T.of + TOTAL + T.found; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fecharBtn(rotulo) { var b = el('button', 'sp-x', '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'); b.type = 'button'; b.setAttribute('aria-label', rotulo); return b; }

  // ---------- Núcleo: uma peça aberta por vez ----------
  // Cada curiosidade tem a sua apresentação (MODO); o botão "Me conta uma curiosidade" usa a da curiosidade sorteada.
  var MODO = { c1: 'terminal', c2: 'bloco', c3: 'testes', c4: 'banner', c5: 'popover', c6: 'repl', c7: 'gaveta', c8: 'acordeao', c9: 'folha', c10: 'virar' };
  var cur = null; // { el, origem, fechar(devolver), fora }
  function fecharAtual(devolver) { if (!cur) return; var c = cur; cur = null; c.fechar(!!devolver); }
  function devolverFoco(o) { if (o && document.contains(o)) o.focus({ preventScroll: true }); }
  function sair(t) {
    if (reduce()) { t.remove(); return; }
    if (t.classList.contains('sp-acc')) { t.classList.remove('abre'); setTimeout(function () { t.remove(); }, 320); return; }
    t.classList.add('sp-sai'); setTimeout(function () { t.remove(); }, 260);
  }
  function nova(cls, label, origem, fora) {
    var t = el('div', 'sp-pec ' + cls);
    t.setAttribute('role', 'dialog'); t.setAttribute('aria-label', label); t.setAttribute('aria-live', 'polite'); t.tabIndex = -1;
    var x = fecharBtn(T.fechar + ' ' + label.toLowerCase());
    x.addEventListener('click', function () { fecharAtual(true); });
    cur = { el: t, origem: origem, fora: !!fora, fechar: function (dev) { sair(t); if (dev) devolverFoco(origem); } };
    return { t: t, x: x };
  }
  function corpo(texto, cont) {
    var p = el('p', 'sp-txt'); p.textContent = texto;
    var n = el('p', 'sp-cont'); n.textContent = cont;
    return [p, n];
  }
  function nosso(t) { return cur && cur.el === t; }
  function noVisor(t) {
    var r = t.getBoundingClientRect();
    if (r.top < 8) window.scrollBy({ top: r.top - 8, behavior: 'instant' });
    else if (r.bottom > innerHeight - 8) window.scrollBy({ top: r.bottom - innerHeight + 8, behavior: 'instant' });
  }
  // Posição absoluta perto do gatilho (abaixo; acima se faltar espaço ou se preferir).
  function ancorar(t, origem, prefCima) {
    var r = origem.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight, gap = 12;
    var left = Math.min(Math.max(16, r.left), innerWidth - w - 16);
    var cima = prefCima ? r.top - h - gap >= 8 : (r.bottom + gap + h > innerHeight - 8 && r.top - h - gap >= 8);
    var top = cima ? r.top - h - gap : r.bottom + gap;
    t.style.left = (left + scrollX) + 'px'; t.style.top = (top + scrollY) + 'px';
    t.classList.toggle('sp-cima', cima);
    t.style.setProperty('--ax', Math.min(Math.max(16, r.left + r.width / 2 - left), w - 16) + 'px');
    noVisor(t);
  }
  function entrar(t) { document.body.appendChild(t); }
  // Digita linhas de comando ("$ " ou ">>> ") e mostra as demais.
  function escrever(pre, linhas, ativo) {
    var RX = /^(\$ |>>> )/;
    function linhaEl(s) {
      var span = el('span', RX.test(s) ? 'sp-cmd' : s.indexOf('# ') === 0 ? 'sp-com' : 'sp-out');
      pre.appendChild(span); pre.appendChild(document.createTextNode('\n')); return span;
    }
    if (reduce()) { linhas.forEach(function (s) { linhaEl(s).textContent = s; }); return; }
    var i = 0;
    (function proxima() {
      if (i >= linhas.length || !ativo()) return;
      var s = linhas[i++], span = linhaEl(s), m = RX.exec(s);
      if (!m) { span.textContent = s; setTimeout(proxima, 260); return; }
      var k = m[0].length; span.textContent = m[0];
      (function letra() {
        if (!ativo()) return;
        span.textContent = s.slice(0, ++k);
        if (k < s.length) setTimeout(letra, 45); else setTimeout(proxima, 320);
      })();
    })();
  }

  var MODOS = {};

  // 1. Terminal (c1)
  MODOS.terminal = function (id, texto, cont, origem) {
    var linhas = (CMD[id] || [T.cat]).concat(['# ' + texto]);
    var o = nova('sp-term sp-m-sobe', 'Terminal', origem, true), t = o.t;
    var bar = el('div', 'sp-term-bar', '<span class="sp-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>eduardo@portfolio: ~</span>');
    bar.appendChild(o.x);
    var sr = el('p', 'sr-only'); sr.textContent = linhas.join('. ') + '. ' + cont;
    var pre = el('pre', 'sp-term-body'); pre.setAttribute('aria-hidden', 'true');
    var n = el('p', 'sp-cont'); n.textContent = cont;
    t.appendChild(bar); t.appendChild(sr); t.appendChild(pre); t.appendChild(n);
    entrar(t);
    if (innerWidth < 640 || !origem) t.classList.add('sp-centro'); else ancorar(t, origem);
    escrever(pre, linhas, function () { return nosso(t); });
    t.focus({ preventScroll: true });
    return t;
  };

  // 2. Bloco: o painel se monta com quadrados (c2)
  MODOS.bloco = function (id, texto, cont, origem) {
    var o = nova('sp-bl', T.curio, origem, true), t = o.t;
    var c = el('div', 'sp-bl-c'); corpo(texto, cont).forEach(function (e) { c.appendChild(e); }); c.appendChild(o.x);
    t.appendChild(c);
    entrar(t);
    var S = 16, cols = Math.ceil(t.offsetWidth / S), rows = Math.ceil(t.offsetHeight / S);
    var g = el('div', 'sp-bl-g'); g.setAttribute('aria-hidden', 'true');
    g.style.gridTemplateColumns = 'repeat(' + cols + ',' + S + 'px)'; g.style.gridAutoRows = S + 'px';
    for (var i = 0; i < cols * rows; i++) {
      var q = el('i'); q.style.setProperty('--d', Math.round(Math.random() * 300) + 'ms');
      if (Math.random() < .12) q.className = 'm';
      g.appendChild(q);
    }
    t.insertBefore(g, c);
    ancorar(t, origem);
    t.focus({ preventScroll: true });
    return t;
  };

  // 3. Corredor de testes (c3): pontos que enchem e a contagem sobe até 570
  MODOS.testes = function (id, texto, cont, origem) {
    var o = nova('sp-testes sp-m-sobe', T.testes, origem, false), t = o.t;
    var topo = el('div', 'sp-t-top', '<span class="sp-t-cmd">$ npm test</span>'); topo.appendChild(o.x);
    var dots = el('div', 'sp-t-dots'); dots.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 57; i++) { var d = el('i'); d.style.setProperty('--d', (i * 7) + 'ms'); dots.appendChild(d); }
    var num = el('p', 'sp-t-num'); num.setAttribute('aria-hidden', 'true');
    var sr = el('p', 'sr-only'); sr.textContent = '570 passing. ' + T.ilus;
    var rest = corpo(texto, cont);
    t.appendChild(topo); t.appendChild(dots); t.appendChild(num); t.appendChild(sr); rest.forEach(function (e) { t.appendChild(e); });
    var host = origem.closest('.projects'), ref = host && $('.project.featured', host);
    if (ref) ref.insertAdjacentElement('afterend', t);
    else { var m = origem.closest('.sp-mais'); (m || origem).insertAdjacentElement('afterend', t); }
    if (reduce()) num.innerHTML = '<b>570</b> passing';
    else {
      var t0 = performance.now(), DUR = 520;
      (function passo(now) {
        if (!nosso(t)) return;
        var k = Math.min(1, ((now || performance.now()) - t0) / DUR);
        num.innerHTML = '<b>' + Math.round(570 * k) + '</b> passing';
        if (k < 1) requestAnimationFrame(passo);
      })(t0);
    }
    t.focus({ preventScroll: true });
    setTimeout(function () { if (nosso(t)) noVisor(t); }, 60);
    return t;
  };

  // 4. Faixa de chegada que sobe do centro de baixo (c4)
  MODOS.banner = function (id, texto, cont, origem) {
    var o = nova('sp-banner sp-m-banner', T.curio, origem, false), t = o.t;
    t.appendChild(el('div', 'sp-xadrez')).setAttribute('aria-hidden', 'true');
    var c = el('div', 'sp-banner-c'); corpo(texto, cont).forEach(function (e) { c.appendChild(e); }); c.appendChild(o.x);
    t.appendChild(c);
    entrar(t); t.focus({ preventScroll: true });
    return t;
  };

  // 5. Balão com seta, preso à palavra (c5)
  MODOS.popover = function (id, texto, cont, origem) {
    var o = nova('sp-pop', T.curio, origem, true), t = o.t;
    corpo(texto, cont).forEach(function (e) { t.appendChild(e); }); t.appendChild(o.x);
    entrar(t); ancorar(t, origem); t.focus({ preventScroll: true });
    return t;
  };

  // 6. REPL de Python (c6)
  MODOS.repl = function (id, texto, cont, origem) {
    var o = nova('sp-repl sp-m-sobe', 'Python', origem, true), t = o.t;
    var bar = el('div', 'sp-repl-bar', '<span>python3</span>'); bar.appendChild(o.x);
    var pre = el('pre', 'sp-repl-body'); pre.setAttribute('aria-hidden', 'true');
    var linhas = ['>>> import this', 'In the face of ambiguity, refuse the temptation to guess.'];
    var sr = el('p', 'sr-only'); sr.textContent = linhas.join('. ');
    t.appendChild(bar); t.appendChild(sr); t.appendChild(pre);
    var c = el('div', 'sp-repl-t'); corpo(texto, cont).forEach(function (e) { c.appendChild(e); }); t.appendChild(c);
    entrar(t); ancorar(t, origem, true);
    escrever(pre, linhas, function () { return nosso(t); });
    t.focus({ preventScroll: true });
    return t;
  };

  // 7. Gaveta lateral, entra pela direita (c7)
  MODOS.gaveta = function (id, texto, cont, origem) {
    var o = nova('sp-gaveta sp-m-gaveta', 'PMOC', origem, true), t = o.t;
    var h = el('h3', 'sp-g-h', 'PMOC'); t.appendChild(h);
    corpo(texto, cont).forEach(function (e) { t.appendChild(e); }); t.appendChild(o.x);
    entrar(t); t.focus({ preventScroll: true });
    return t;
  };

  // 8. Acordeão: abre embaixo do texto e empurra o resto (c8)
  MODOS.acordeao = function (id, texto, cont, origem) {
    var o = nova('sp-acc', T.curio, origem, false), t = o.t;
    var inn = el('div', 'sp-acc-in'), c = el('div', 'sp-acc-c');
    corpo(texto, cont).forEach(function (e) { c.appendChild(e); }); c.appendChild(o.x);
    inn.appendChild(c); t.appendChild(inn);
    var host = origem.closest('li, .traj-card');
    if (host) host.appendChild(t); else (origem.closest('.sp-mais') || origem).insertAdjacentElement('afterend', t);
    void t.offsetHeight;
    t.classList.add('abre');
    t.focus({ preventScroll: true });
    setTimeout(function () { if (nosso(t)) noVisor(t); }, 340);
    return t;
  };

  // 9. Folha de documento que sobe de baixo (c9)
  MODOS.folha = function (id, texto, cont, origem) {
    var o = nova('sp-folha sp-m-folha', 'Spec 001', origem, false), t = o.t;
    var bar = el('div', 'sp-folha-bar', '<span>docs/specs/001-portfolio.md</span>'); bar.appendChild(o.x);
    var c = el('div', 'sp-folha-c', '<h3>' + T.spec + '</h3>');
    corpo(texto, cont).forEach(function (e) { c.appendChild(e); });
    t.appendChild(bar); t.appendChild(c);
    entrar(t); t.focus({ preventScroll: true });
    return t;
  };
  MODOS.canto = MODOS.banner;

  // 10. Virar (c10): o cartão gira e mostra a curiosidade no verso
  function animar(host, de, para, fim) {
    if (reduce() || !host.animate) { fim(); return; }
    var a = host.animate([{ transform: 'perspective(900px) rotateY(' + de + 'deg)' }, { transform: 'perspective(900px) rotateY(' + para + 'deg)' }],
      { duration: 200, easing: de === 0 ? 'cubic-bezier(.5,0,1,.5)' : 'cubic-bezier(0,.5,.5,1)' });
    a.onfinish = fim;
  }
  // Foto do topo: carta de duas faces. O .photo-card gira inteiro (a caixa não muda de tamanho); o verso fica dentro dele.
  var GIRO = 500;
  function inertar(e, v) {
    if (!e) return;
    if (v) { e.setAttribute('inert', ''); e.setAttribute('aria-hidden', 'true'); } else { e.removeAttribute('inert'); e.removeAttribute('aria-hidden'); }
  }
  function limparFoto(host) {
    (host._t || []).forEach(clearTimeout); host._t = [];
    var v = $('.sp-verso', host); if (v) v.remove();
    host.classList.remove('girando');
  }
  function virarFoto(host, texto, cont, origem) {
    var card = $('.photo-card', host), btn = $('.photo-btn', host);
    limparFoto(host);
    host._origem = origem;
    cur = { el: host, origem: origem, fora: false, fechar: function (dev) { desvirarFoto(host, dev); } };
    if (window.gsap) { window.gsap.killTweensOf(host); window.gsap.set(host, { rotationX: 0, rotationY: 0 }); }
    var v = el('div', 'sp-verso');
    v.setAttribute('role', 'group'); v.setAttribute('aria-label', T.curio); v.setAttribute('aria-live', 'polite');
    v.appendChild(el('p', 'sec-label', T.curio));
    var p = el('p', 'sp-txt'); p.textContent = texto; p.id = 'sp-v-' + Math.random().toString(36).slice(2, 8);
    v.appendChild(p);
    var dl = el('dl', 'sp-ficha');
    FICHA.forEach(function (f) {
      var g = el('div'), dt = el('dt'), dd = el('dd'); dt.textContent = f[0]; dd.textContent = f[1];
      g.appendChild(dt); g.appendChild(dd); dl.appendChild(g);
    });
    v.appendChild(dl);
    var rod = el('div', 'sp-rodape');
    var n = el('p', 'sp-cont'); n.textContent = cont;
    var b = el('button', 'sp-volta', T.volta); b.type = 'button'; b.setAttribute('aria-describedby', p.id);
    b.addEventListener('click', function () { fecharAtual(true); });
    rod.appendChild(n); rod.appendChild(b); v.appendChild(rod);
    card.appendChild(v);
    void host.offsetHeight;
    var r = reduce(), dur = r ? 150 : GIRO;
    host.classList.add('girando', 'virado');
    inertar(btn, true);
    b.focus({ preventScroll: true });
    host._t.push(setTimeout(function () { host.classList.remove('girando'); }, dur));
    return host;
  }
  function desvirarFoto(host, devolver) {
    if (!host.classList.contains('virado')) return;
    if (cur && cur.el === host) cur = null;
    var btn = $('.photo-btn', host), v = $('.sp-verso', host), dur = reduce() ? 150 : GIRO;
    (host._t || []).forEach(clearTimeout); host._t = [];
    inertar(v, true);
    inertar(btn, false);
    host.classList.add('girando');
    host.classList.remove('virado');
    if (devolver) devolverFoco(host._origem);
    host._t.push(setTimeout(function () { limparFoto(host); }, dur));
  }
  function desvirar(host, devolver) {
    if (host.classList.contains('photo')) { desvirarFoto(host, devolver); return; }
    if (!host.classList.contains('virado')) return;
    if (cur && cur.el === host) cur = null;
    animar(host, 0, 90, function () {
      host.classList.remove('virado');
      var v = $('.sp-verso', host); if (v) v.remove();
      if (devolver) devolverFoco(host._origem);
      animar(host, -90, 0, function () {});
    });
  }
  MODOS.virar = function (id, texto, cont, origem) {
    var host = origem && origem.closest('[data-flip], .traj-card, .sp-mais');
    if (!host) return MODOS.banner(id, texto, cont, origem);
    if (host.classList.contains('virado')) { desvirar(host, true); return host; }
    if (host.classList.contains('photo')) return virarFoto(host, texto, cont, origem);
    host._origem = origem;
    cur = { el: host, origem: origem, fora: false, fechar: function (dev) { desvirar(host, dev); } };
    animar(host, 0, 90, function () {
      var v = el('div', 'sp-verso');
      v.setAttribute('role', 'group'); v.setAttribute('aria-label', T.curio); v.setAttribute('aria-live', 'polite');
      var p = el('p', 'sp-txt'); p.textContent = texto; p.id = 'sp-v-' + Math.random().toString(36).slice(2, 8);
      var n = el('p', 'sp-cont'); n.textContent = cont;
      var b = el('button', 'sp-volta', T.volta); b.type = 'button'; b.setAttribute('aria-describedby', p.id);
      b.addEventListener('click', function () { fecharAtual(true); });
      v.appendChild(p); v.appendChild(n); v.appendChild(b);
      host.appendChild(v);
      host.classList.add('virado');
      b.focus({ preventScroll: true });
      animar(host, -90, 0, function () {});
    });
    return host;
  };

  // ---------- API ----------
  function mostrar(id, modo, origemEl) {
    if (!TXT[id]) return null;
    fecharAtual(false);
    var r = marcar(id), cont = contagem(r);
    var f = MODOS[modo] || MODOS[MODO[id]] || MODOS.banner;
    var out = f(id, TXT[id], cont, origemEl);
    document.dispatchEvent(new CustomEvent('surpresa', { detail: { id: id, modo: modo, achados: r.n } }));
    return out;
  }

  // Esc fecha a peça aberta; clique fora fecha as que não ficam presas ao texto.
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur && !document.querySelector('.aviso.falha.on')) fecharAtual(true); }); // o aviso de falha do e-mail fica por cima: o primeiro Esc é dele
  document.addEventListener('pointerdown', function (e) {
    if (cur && cur.fora && !cur.el.contains(e.target) && !(cur.origem && cur.origem.contains(e.target))) fecharAtual(false);
  });
  var larg = innerWidth;
  addEventListener('resize', function () { if (innerWidth !== larg) { larg = innerWidth; if (cur && cur.fora) fecharAtual(false); } });

  // ---------- Gatilhos ----------
  function prepararPalavras() {
    $$('span.sp[data-c]').forEach(function (s) {
      if (!ligado) return; // desligado: fica texto puro
      var b = el('button', 'sp-word', s.innerHTML + SPARK);
      b.type = 'button';
      b.dataset.c = s.dataset.c; b.dataset.modo = s.dataset.modo;
      s.replaceWith(b);
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); mostrar(b.dataset.c, b.dataset.modo, b); });
    });
  }
  function prepararFoto() {
    var f = $('#sp-foto'); if (!f) return;
    var cliques = [];
    f.addEventListener('click', function () {
      if (!ligado) return;
      var agora = Date.now();
      cliques = cliques.filter(function (t) { return agora - t < 3000; });
      cliques.push(agora);
      if (cliques.length >= 5) { cliques = []; mostrar('c10', 'virar', f); }
    });
  }
  var baralho = [];
  function embaralhar(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function proximaCuriosidade() {
    if (!baralho.length) {
      var ach = lerAchados();
      baralho = embaralhar(IDS.filter(function (id) { return ach.indexOf(id) < 0; })).concat(embaralhar(ach.slice()));
    }
    return baralho.shift();
  }
  function prepararBotao() {
    var b = $('#sp-curio'); if (!b) return;
    if (!ligado) { b.closest('.sp-mais').hidden = true; return; }
    b.insertAdjacentHTML('afterbegin', SPARK);
    b.addEventListener('click', function () { var id = proximaCuriosidade(); mostrar(id, MODO[id], b); });
  }

  // ---------- Console ----------
  window.curiosidades = window.curiosities = function () {
    var ach = lerAchados();
    console.table(IDS.map(function (id) { return { id: id, [EN ? 'found' : 'achada']: ach.indexOf(id) >= 0 ? T.yes : T.no, [EN ? 'text' : 'texto']: ach.indexOf(id) >= 0 ? TXT[id] : '?' }; }));
    return ach.length + T.of + TOTAL + T.found;
  };
  function saudar() {
    var acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e4a843';
    var G = [
      '   ▄██████████▄   ',
      ' ▄██████████████▄ ',
      '████▀▀      ▀▀████',
      '████              ',
      '████              ',
      '████     ████████ ',
      '████     ████████ ',
      '████▄▄      ▄▄████',
      ' ▀██████████████▀ ',
      '   ▀██████████▀   '
    ].join('\n');
    console.log('%c' + G, 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.1;color:' + acc);
    console.log(EN ? '%cHi. If you opened DevTools, you probably like details. This page has 10 hidden curiosities, spread across every section. Happy hunting.' : '%cOi. Se você abriu o DevTools, deve gostar de detalhe. Esta página tem 10 curiosidades escondidas, espalhadas por todas as seções. Boa caça.',
      'font-family:"Funnel Sans","Funnel Sans Fallback",system-ui,sans-serif;font-size:14px;font-weight:600;line-height:1.5;color:' + acc);
    console.log(EN ? 'To see what you have found so far, run curiosities() here in the console.' : 'Para ver o que você já achou, rode curiosidades() aqui no console.');
  }

  window.surpresas = { mostrar: mostrar, achados: lerAchados, ligado: function () { return ligado; } };

  function init() {
    prepararPalavras(); prepararFoto(); prepararBotao();
    if (ligado) saudar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
