/* Calendário do GitHub: dica por dia (hover, foco, toque) e navegação por teclado (spec 002b R3 e R4).
   O texto da dica é o texto .sr-only da própria célula, já localizado no build. */
(function () {
  'use strict';
  var cals = document.querySelectorAll('.cal');
  if (!cals.length) return;
  var ABRE = null; // { dica, cel }
  var porPonteiro = 0; // até quando um foco recente veio de clique ou toque (célula já visível, sem rolagem)
  var guardaScroll = 0; // o foco por seta pode rolar o .cal-scroll; esse scroll não fecha a dica

  function texto(cel) {
    var s = cel.querySelector('.sr-only');
    return s ? s.textContent.trim() : '';
  }

  function posicionar(dica, cel, scroll) {
    var r = cel.getBoundingClientRect();
    var sr = scroll.getBoundingClientRect();
    var esq = Math.max(0, sr.left), dir = Math.min(window.innerWidth, sr.right);
    var w = dica.offsetWidth, h = dica.offsetHeight;
    var x = r.left + r.width / 2 - w / 2;
    x = Math.min(x, dir - w);
    x = Math.max(x, esq);
    var topo = document.querySelector('.top'); // cabeçalho fixo: a dica não fica sob ele
    var limite = topo ? Math.max(0, topo.getBoundingClientRect().bottom) : 0;
    var y = r.top - h - 6;
    if (y < limite) y = r.bottom + 6;
    dica.style.left = Math.round(x) + 'px';
    dica.style.top = Math.round(y) + 'px';
  }

  // Enquanto aberta, a dica acompanha o quadrado a cada quadro (a seção ainda sobe no reveal do GSAP).
  function seguir() {
    if (!ABRE) return;
    posicionar(ABRE.dica, ABRE.cel, ABRE.scroll);
    ABRE.raf = requestAnimationFrame(seguir);
  }

  function fechar() {
    if (!ABRE) return;
    cancelAnimationFrame(ABRE.raf);
    ABRE.dica.classList.remove('vista', 'aberta');
    ABRE = null;
  }

  function abrir(cal, cel) {
    var dica = cal._dica;
    if (ABRE) fechar();
    dica.textContent = texto(cel);
    dica.classList.add('aberta'); // display: block, para medir; fechada ela fica display: none (fora da comparação de paridade)
    posicionar(dica, cel, cal._scroll);
    dica.classList.add('vista');
    ABRE = { dica: dica, cel: cel, scroll: cal._scroll, raf: 0 };
    ABRE.raf = requestAnimationFrame(seguir);
  }

  function celula(alvo) {
    return alvo && alvo.closest ? alvo.closest('.cal-dia') : null;
  }

  Array.prototype.forEach.call(cals, function (cal) {
    var tabela = cal.querySelector('.cal-tabela');
    var scroll = cal.querySelector('.cal-scroll');
    if (!tabela || !scroll) return;
    var dica = document.createElement('div');
    dica.className = 'cal-dica';
    dica.setAttribute('role', 'tooltip');
    dica.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dica); // no body: o .cal.reveal fica com transform do GSAP, que prenderia o position: fixed
    cal._dica = dica;
    cal._scroll = scroll;

    // dias em ordem de data (o DOM está em ordem de linha)
    var dias = Array.prototype.slice.call(tabela.querySelectorAll('.cal-dia')).sort(function (a, b) {
      return a.getAttribute('data-data') < b.getAttribute('data-data') ? -1 : 1;
    });

    function mover(de, para) {
      if (!para || para === de) return;
      de.setAttribute('tabindex', '-1');
      para.setAttribute('tabindex', '0');
      guardaScroll = Date.now() + 250;
      para.focus();
    }

    tabela.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      var c = celula(e.target);
      if (c) abrir(cal, c);
    });
    tabela.addEventListener('pointerout', function (e) {
      if (e.pointerType === 'touch') return;
      var c = celula(e.target);
      if (c && celula(e.relatedTarget) !== c && ABRE && ABRE.cel === c) fechar();
    });
    tabela.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch') return;
      var c = celula(e.target);
      if (c) abrir(cal, c);
    });
    tabela.addEventListener('focusin', function (e) {
      var c = celula(e.target);
      if (!c) return;
      Array.prototype.forEach.call(dias, function (d) { if (d !== c && d.getAttribute('tabindex') === '0') d.setAttribute('tabindex', '-1'); });
      c.setAttribute('tabindex', '0');
      if (Date.now() > porPonteiro) guardaScroll = Date.now() + 250; // foco por teclado: o navegador rola a célula para a vista
      abrir(cal, c);
    });
    tabela.addEventListener('focusout', function (e) {
      if (celula(e.target)) fechar();
    });
    tabela.addEventListener('keydown', function (e) {
      var c = celula(e.target);
      if (!c || e.altKey || e.ctrlKey || e.metaKey) return;
      var i = dias.indexOf(c), alvo = null;
      switch (e.key) {
        case 'ArrowUp': alvo = dias[i - 1]; break;
        case 'ArrowDown': alvo = dias[i + 1]; break;
        case 'ArrowLeft': alvo = dias[i - 7]; break;
        case 'ArrowRight': alvo = dias[i + 7]; break;
        case 'Home': case 'End':
          var linha = c.parentNode.querySelectorAll('.cal-dia');
          alvo = linha[e.key === 'Home' ? 0 : linha.length - 1];
          break;
        default: return;
      }
      e.preventDefault();
      mover(c, alvo);
    });
  });

  document.addEventListener('pointerdown', function (e) {
    porPonteiro = Date.now() + 400;
    if (!celula(e.target)) fechar();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fechar();
  });
  // Rolar fecha a dica (R3), exceto o scroll do próprio navegador logo após um foco por teclado (guardaScroll).
  function aoRolar() {
    if (ABRE && Date.now() > guardaScroll) fechar();
  }
  window.addEventListener('scroll', aoRolar, { capture: true, passive: true });
})();
