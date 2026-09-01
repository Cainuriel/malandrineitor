/* Renderizado de cartas. MI.card.render(card, opts) -> HTMLElement
   opts: { size: 's'|'m'|'l', selectable, onSelect, tilt (bool), topSkills (n), highlight: [skillIds], state: 'burnout'|'dimmed' } */
window.MI = window.MI || {};

MI.card = (function () {
  const el = MI.util.el;

  const ICON = {
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/></svg>',
    skull:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3 6v4h10v-4c1.5-1 3-3 3-6a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 17h4"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>'
  };

  const RARITY_LETTER = { comun: 'C', rara: 'R', epica: 'E', legendaria: 'L' };

  function lookups() {
    if (!MI._lk) {
      MI._lk = { skills: MI.util.byId(MI.data.skills), techs: MI.util.byId(MI.data.techs) };
    }
    return MI._lk;
  }

  function topSkills(card, n, highlight) {
    const cfg = MI.data.config;
    const lk = lookups();
    const entries = MI.data.skills.map((s) => ({ s, v: MI.engine.skillValue(card, s.id, cfg), hl: highlight && highlight.includes(s.id) }));
    entries.sort((a, b) => (b.hl - a.hl) || (b.v - a.v) || a.s.name.localeCompare(b.s.name));
    return entries.slice(0, n);
  }

  function accentFor(card) {
    const top = topSkills(card, 1)[0];
    const g = top && MI.data.skillGroups[top.s.group];
    return g ? g.color : '#4cc9f0';
  }

  function render(card, opts) {
    opts = opts || {};
    const lk = lookups();
    const cfg = MI.data.config;
    const rarity = cfg.rarities[card.rarity] || cfg.rarities.comun;
    const tech = lk.techs[card.expertise];
    const n = opts.topSkills || (card.ability ? 5 : 6);
    const skills = topSkills(card, n, opts.highlight);

    let kryptoNode;
    if (!card.kryptonite) kryptoNode = el('span', { class: 'badge kryptonite none', html: ICON.shield + '<span>Sin puntos débiles</span>' });
    else {
      const label = card.kryptonite.tech ? (lk.techs[card.kryptonite.tech] || {}).name : (lk.skills[card.kryptonite.skill] || {}).name;
      kryptoNode = el('span', { class: 'badge kryptonite', title: 'Criptonita: ' + label, html: ICON.skull + '<span><em style="font-style:normal;opacity:.7">Criptonita:</em> ' + label + '</span>' });
    }

    const art = el('div', { class: 'card-art' });
    if (card.portrait) art.appendChild(el('img', { src: card.portrait, alt: 'Retrato de ' + card.name }));
    else art.innerHTML = MI.avatar.svg(card, { accent: accentFor(card) });
    art.appendChild(el('span', { class: 'rarity-tag', text: rarity.name }));
    art.appendChild(el('div', { class: 'ribbon', html: '<span class="lbl">Campeón</span><span class="val">' + (tech ? tech.name : card.expertise) + '</span>' }));

    const frame = el('div', { class: 'card-frame' }, [
      el('div', { class: 'card-head' }, [
        el('div', { class: 'card-name', text: card.name, title: card.name }),
        el('div', { class: 'card-gem', text: RARITY_LETTER[card.rarity] || '?' })
      ]),
      art,
      el('div', { class: 'card-title', text: card.title || '' }),
      el('div', { class: 'card-badges' }, [kryptoNode]),
      el('div', { class: 'card-skills' }, skills.map((e) => el('div', { class: 'skill' + (e.hl ? ' hl' : ''), style: { '--sk': (MI.data.skillGroups[e.s.group] || {}).color } }, [
        el('span', { class: 'k', text: e.s.short, title: e.s.name }),
        el('span', { class: 'bar' }, el('i', { style: { width: (e.v / cfg.skills.max * 100) + '%' } })),
        el('span', { class: 'v', text: String(e.v) })
      ]))),
      card.ability ? el('div', { class: 'card-ability' }, [el('b', { text: card.ability.name }), card.ability.text]) : null,
      card.quote ? el('div', { class: 'card-quote', text: '“' + card.quote + '”' }) : null,
      el('div', { class: 'card-foot' }, [el('span', { text: cfg.company.name }), el('span', { class: 'id', text: '#' + card.id })])
    ]);

    const inner = el('div', { class: 'card-inner' }, [frame, el('div', { class: 'card-holo' }), el('div', { class: 'card-shine' })]);
    const hasHl = skills.some((e) => e.hl);
    const root = el('div', { class: 'card rarity-' + card.rarity + (opts.size ? ' size-' + opts.size : '') + (opts.selectable ? ' selectable' : '') + (opts.state ? ' ' + opts.state : '') + (hasHl ? ' has-hl' : ''), 'data-card': card.id }, inner);

    if (opts.tilt !== false) attachTilt(root);
    if (opts.selectable && opts.onSelect) root.addEventListener('click', () => opts.onSelect(card, root));
    return root;
  }

  function attachTilt(root) {
    root.addEventListener('pointermove', (e) => {
      const r = root.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      root.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      root.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      root.style.setProperty('--ry', ((px - 0.5) * 16).toFixed(2) + 'deg');
      root.style.setProperty('--rx', ((0.5 - py) * 16).toFixed(2) + 'deg');
    });
    root.addEventListener('pointerleave', () => {
      root.style.setProperty('--rx', '0deg'); root.style.setProperty('--ry', '0deg');
      root.style.setProperty('--mx', '50%'); root.style.setProperty('--my', '50%');
    });
  }

  function renderBack(opts) {
    opts = opts || {};
    const cfg = MI.data.config;
    return el('div', { class: 'card card-back' + (opts.size ? ' size-' + opts.size : '') }, el('div', { class: 'card-inner' }, el('div', { class: 'back-frame' }, [
      el('div', {}, [el('div', { class: 'back-logo', text: '¡MALANDRINEITOR!' }), el('div', { class: 'back-company', text: cfg.company.name })])
    ])));
  }

  // Carta sin descubrir: silueta con la rareza visible, nada más.
  function renderHidden(card, opts) {
    opts = opts || {};
    const cfg = MI.data.config;
    const rarity = cfg.rarities[card.rarity] || cfg.rarities.comun;
    const root = el('div', { class: 'card card-hidden rarity-' + card.rarity + (opts.size ? ' size-' + opts.size : ''), 'data-card': card.id },
      el('div', { class: 'card-inner' }, el('div', { class: 'hidden-frame' }, [
        el('div', { class: 'hidden-mark', text: '?' }),
        el('div', { class: 'hidden-rarity', text: rarity.name }),
        el('div', { class: 'hidden-text', text: 'Sin descubrir' })
      ])));
    return root;
  }

  return { render, renderBack, renderHidden, topSkills, ICON };
})();
