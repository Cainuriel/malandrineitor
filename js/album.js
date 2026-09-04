/* Vista álbum: todas las cartas activas con filtro por rareza, búsqueda y ficha ampliada. */
window.MI = window.MI || {};

MI.album = (function () {
  const el = MI.util.el;
  let filter = 'all', query = '';

  function activeCards() {
    const out = new Set(MI.data.optout || []);
    return MI.data.cards.filter((c) => !out.has(c.id));
  }

  function render(container) {
    container.innerHTML = '';
    const cfg = MI.data.config;
    const grid = el('div', { class: 'album-grid' });

    const filters = el('div', { class: 'row rarity-filter' }, [
      el('button', { class: filter === 'all' ? 'active' : '', text: 'Todas', onclick: () => { filter = 'all'; render(container); } }),
      ...Object.keys(cfg.rarities).map((r) => el('button', { class: 'f-' + r + (filter === r ? ' active' : ''), text: cfg.rarities[r].name, onclick: () => { filter = r; render(container); } }))
    ]);
    const search = el('input', { type: 'search', placeholder: 'Buscar malandrín, tecnología…', value: query, oninput: (e) => { query = e.target.value; fill(); } });

    const all = activeCards();
    const found = all.filter((c) => MI.story.discovered(c.id)).length;
    container.appendChild(el('h1', { text: 'Álbum de malandrines' }));
    container.appendChild(el('p', { class: 'lead', text: `Plantilla de ${cfg.company.name}. Has descubierto ${found} de ${all.length}. Las cartas se descubren consiguiéndolas en el modo historia; Haz clic para la ficha completa.` }));
    const shopRow = el('div', { class: 'row demo-row' }, [
      el('button', { class: 'primary', text: 'Tienda de sobres', onclick: () => MI.story.openView('shop') }),
      el('span', { class: 'small muted', text: 'Las cartas se consiguen abriendo sobres en el modo historia.' })
    ]);
    const demo = MI.util.devMode() ? el('div', { class: 'row demo-row' }, [
      el('button', { class: MI.story.revealAll() ? '' : 'primary', text: MI.story.revealAll() ? 'Volver a ocultar las no descubiertas' : 'Descubrir toda la colección', onclick: () => { MI.story.setRevealAll(!MI.story.revealAll()); render(container); } }),
      el('span', { class: 'small muted', text: 'Opción de desarrollador. No aparece en la versión que se comparte con la comunidad.' })
    ]) : null;
    container.appendChild(el('div', { class: 'album-toolbar' }, [filters, search]));
    container.appendChild(shopRow);
    if (demo) container.appendChild(demo);
    container.appendChild(grid);

    function fill() {
      grid.innerHTML = '';
      const q = query.trim().toLowerCase();
      const techs = MI.util.byId(MI.data.techs);
      activeCards()
        .filter((c) => filter === 'all' || c.rarity === filter)
        .filter((c) => !q || (MI.story.discovered(c.id) && (c.name.toLowerCase().includes(q) || (c.title || '').toLowerCase().includes(q) || (techs[c.expertise] || {}).name.toLowerCase().includes(q))))
        .sort((a, b) => rarityRank(b) - rarityRank(a) || a.name.localeCompare(b.name))
        .forEach((c) => grid.appendChild(MI.story.discovered(c.id) ? MI.card.render(c, { selectable: true, onSelect: openDetail }) : MI.card.renderHidden(c)));
      if (!grid.children.length) grid.appendChild(el('p', { class: 'muted', text: q ? 'Ningún malandrín descubierto coincide con la búsqueda.' : 'Ningún malandrín coincide.' }));
    }
    fill();
  }

  function rarityRank(c) { return { comun: 0, rara: 1, epica: 2, legendaria: 3 }[c.rarity] || 0; }

  function cardUrl(card) {
    const base = location.protocol === 'file:' ? MI.data.config.shareBaseUrl : location.href.split('#')[0];
    return base + '#carta=' + card.id;
  }

  async function shareCard(card, button) {
    const url = cardUrl(card);
    const texto = card.name + ' en ¡MALANDRINEITOR!';
    if (navigator.share) {
      try { await navigator.share({ title: texto, text: texto, url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      if (button) button.textContent = 'Enlace copiado';
      MI.app.toast('Enlace de la ficha copiado.');
    } catch (e) {
      prompt('Copia este enlace para compartir la ficha:', url);
    }
  }

  // Abre la ficha de una carta por su identificador (ruta #carta=<id>).
  function openById(id) {
    const card = activeCards().find((c) => c.id === id);
    if (!card) { MI.app.toast('Ese malandrín no está en la plantilla.'); return false; }
    openDetail(card, { shared: true });
    return true;
  }

  function openDetail(card, opts) {
    opts = opts || {};
    const cfg = MI.data.config;
    const techs = MI.util.byId(MI.data.techs);
    const groups = MI.data.skillGroups;
    const rows = MI.data.skills
      .map((s) => ({ s, v: MI.engine.skillValue(card, s.id, cfg) }))
      .filter((e) => typeof card.skills[e.s.id] === 'number')
      .sort((a, b) => b.v - a.v);
    const hl = new Set(opts.highlight || []);
    const table = el('table', { class: 'skill-table' }, rows.map((e) => el('tr', { class: hl.has(e.s.id) ? 'hl' : '' }, [
      el('td', { text: e.s.name }),
      el('td', { class: 'g', text: (groups[e.s.group] || {}).name || '' }),
      el('td', { text: String(e.v) })
    ])));
    // Guarda contra el doble cierre: el botón cierra y su clic sigue subiendo hasta el modal.
    // Sin ella, unlockScroll() se llamaría dos veces y descuadraría el contador de bloqueos.
    let closed = false;
    const close = () => { if (closed) return; closed = true; modal.remove(); MI.util.unlockScroll(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    // Se cierra pulsando en cualquier parte, no solo en el fondo ni en el botón.
    // Se respeta la selección de texto: si el gesto ha sido un arrastre, no cuenta como clic.
    let downAt = null;
    const modal = el('div', { class: 'modal',
      onpointerdown: (e) => { downAt = { x: e.clientX, y: e.clientY }; },
      onclick: (e) => {
        if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
        if (window.getSelection && String(window.getSelection())) return;
        close();
      } }, [
      el('button', { class: 'close', text: 'Cerrar', onclick: close }),
      el('div', { class: 'modal-body' }, [
        MI.card.render(card, { size: 'l', topSkills: 6, highlight: opts.highlight, burns: opts.burns || 0 }),
        el('div', { class: 'detail panel' }, [
          el('h2', { text: card.name }),
          el('p', { class: 'muted', text: card.title || '' }),
          el('p', {}, [el('span', { class: 'pill', text: cfg.rarities[card.rarity].name }), ' ', el('span', { class: 'pill', text: 'Campeón: ' + (techs[card.expertise] || {}).name })]),
          opts.context ? el('p', { class: 'small', style: { color: 'var(--accent)' }, text: 'Ticket en curso: ' + opts.context.title + (opts.context.tech ? ' · tecnología ' + (techs[opts.context.tech] || {}).name : '') }) : null,
          el('p', { class: 'small muted', text: 'Las habilidades que no aparecen valen ' + cfg.skills.defaultValue + '.' }),
          table,
          // Enlace directo a esta ficha: lo primero que hace cualquiera al ver el juego
          // es buscarse, y lo segundo, enseñárselo a alguien.
          el('div', { class: 'row card-share' }, [
            el('button', { class: 'primary', text: 'Compartir esta ficha', onclick: (e) => { e.stopPropagation(); shareCard(card, e.currentTarget); } }),
            el('span', { class: 'small muted', text: 'Copia un enlace que abre el juego en esta carta.' })
          ])
        ])
      ])
    ]);
    MI.util.lockScroll();
    document.body.appendChild(modal);
    document.addEventListener('keydown', onKey);
  }

  return { render, activeCards, openDetail, openById, cardUrl };
})();
