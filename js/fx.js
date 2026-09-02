/* Efectos de tebeo: sellos de resultado sobre cada ticket y pantallazo de fin de sprint.
   Solo presentación: no toca el estado del juego. Respeta prefers-reduced-motion. */
window.MI = window.MI || {};

MI.fx = (function () {
  const el = MI.util.el;

  function reduced() {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function pick(list) { return list && list.length ? list[Math.floor(Math.random() * list.length)] : ''; }
  // {rival} lo rellena quien llama: la empresa de la máquina o el nombre del otro jugador.
  function fill(text, rival) { return (text || '').replace(/\{rival\}/g, rival || MI.data.config.rival.name); }

  const WORD = { resolved: 'RESUELTO', improved: 'MEJORADO', complicated: 'COMPLICADO' };

  /* Sello cómico. Se inserta en un contenedor con position: relative y se quita solo. */
  function stamp(outcome, opts) {
    opts = opts || {};
    const P = (MI.data.phrases || {});
    const node = el('div', { class: 'fx-stamp fx-' + outcome + (reduced() ? ' fx-still' : '') }, [
      el('div', { class: 'fx-rays' }),
      el('div', { class: 'fx-word', 'data-text': WORD[outcome] || '', text: WORD[outcome] || '' }),
      el('div', { class: 'fx-bang', text: pick((P.bang || {})[outcome] || []) }),
      opts.pay ? el('div', { class: 'fx-tag', text: 'LA PAGA' }) : null,
      el('div', { class: 'fx-kicker', text: pick((P.kicker || {})[outcome] || []) })
    ]);
    // Se desvanece sola para no tapar el desglose de puntuación.
    if (!reduced()) setTimeout(() => { node.classList.add('fade'); setTimeout(() => node.remove(), 700); }, 1500);
    else setTimeout(() => node.remove(), 2200);
    return node;
  }

  /* Pantallazo de fin de sprint. kind: 'win' | 'loss' | 'draw'.
     opts.rival: nombre del rival de ESTA partida; sustituye {rival} en título y frase.
     Sin él, en las partidas a dos aparecería el nombre de la empresa de la máquina. */
  function splash(kind, opts) {
    opts = opts || {};
    const P = (MI.data.phrases || {})[kind] || {};
    const rival = opts.rival;
    const title = fill(opts.title || pick(P.title || []), rival);
    const phrase = fill(opts.phrase || pick(P.phrase || []), rival);
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      document.removeEventListener('keydown', onKey);
      overlay.classList.add('out');
      setTimeout(() => { overlay.remove(); MI.util.unlockScroll(); if (opts.onDone) opts.onDone(); }, 320);
    };
    const onKey = (e) => { if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); close(); } };

    const overlay = el('div', { class: 'fx-splash fx-' + kind + (reduced() ? ' fx-still' : ''), onclick: close }, [
      el('div', { class: 'fx-splash-rays' }),
      el('div', { class: 'fx-splash-box' }, [
        el('div', { class: 'fx-splash-title', 'data-text': title, text: title }),
        opts.score ? el('div', { class: 'fx-splash-score', text: opts.score }) : null,
        phrase ? el('p', { class: 'fx-splash-phrase', text: phrase }) : null,
        el('button', { class: 'primary', text: 'Ver el resumen', onclick: close })
      ])
    ]);
    MI.util.lockScroll();
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    if (!reduced()) setTimeout(close, 6000);
    return overlay;
  }

  return { stamp, splash, reduced };
})();
