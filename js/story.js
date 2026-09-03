/* Modo historia: economía de malandricoins, sobres, colección, descubrimiento de cartas y campaña por capítulos
   contra la empresa rival. Estado firmado en localStorage['mi.story']. La partida en sí la lleva js/game.js (newStoryGame). */
window.MI = window.MI || {};

MI.story = (function () {
  const el = MI.util.el;
  const KEY = 'mi.story';
  const REVEAL_KEY = 'mi.revealAll';
  let view = 'dashboard';   // dashboard | shop | collection | squad
  let container = null;
  let lastSummary = null;   // resumen del último sprint

  const cfg = () => MI.data.config.story;
  const lk = () => ({ cards: MI.util.byId(MI.data.cards) });
  const ORDER = ['comun', 'rara', 'epica', 'legendaria'];
  const rivalName = () => MI.data.config.rival.name;

  /* ---------- Estado ---------- */
  function empty() { return { coins: cfg().startCoins, owned: {}, seen: {}, strikes: {}, chapter: 1, wins: {}, opened: 0, sprints: 0, log: [] }; }
  function load() {
    try {
      const raw = localStorage.getItem(KEY); if (!raw) return null;
      const s = JSON.parse(raw);
      if (!MI.match.verify(s)) { const e = empty(); e.tampered = true; return e; }
      delete s.sig; s.seen = s.seen || {}; s.strikes = s.strikes || {}; return s;
    } catch (e) { return null; }
  }
  function save(s) {
    const c = Object.assign({}, s); delete c.sig; delete c.tampered;
    c.sig = MI.match.sign(c);
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* sin almacenamiento */ }
  }
  function start() {
    const s = empty();
    const pack = openPack(s, cfg().starterPack, true);
    s.log.unshift({ date: new Date().toISOString(), text: 'Bienvenido a Malandriner S.A. Sobre de bienvenida: ' + pack.cards.map((x) => x.card.name).join(', ') + '.' });
    save(s);
    return { state: s, pack };
  }
  function reset() { localStorage.removeItem(KEY); lastSummary = null; }

  /* ---------- Descubrimiento (álbum) ---------- */
  function revealAll() { try { return localStorage.getItem(REVEAL_KEY) === '1'; } catch (e) { return false; } }
  function setRevealAll(v) { try { if (v) localStorage.setItem(REVEAL_KEY, '1'); else localStorage.removeItem(REVEAL_KEY); } catch (e) { /* nada */ } }
  // Una carta se ha descubierto si se ha tenido alguna vez en la historia (o si está activado el modo demostración).
  function discovered(cardId) {
    if (revealAll()) return true;
    const s = load();
    return !!(s && s.seen && s.seen[cardId]);
  }

  /* ---------- Economía ---------- */
  function pickRarity(weights, rng) {
    const entries = Object.entries(weights).filter((e) => e[1] > 0);
    const total = entries.reduce((a, e) => a + e[1], 0);
    let r = rng() * total;
    for (const [rar, w] of entries) { r -= w; if (r <= 0) return rar; }
    return entries[entries.length - 1][0];
  }

  // Abre un sobre. Descuenta el precio (salvo free) y añade cartas. Las repetidas se conservan para venderlas.
  function openPack(s, packId, free) {
    const pack = cfg().packs[packId];
    if (!pack) throw new Error('Sobre desconocido: ' + packId);
    if (!free && s.coins < pack.price) return null;
    const rng = MI.util.rng(Math.random() * 1e9);
    const active = MI.album.activeCards();
    const n = rng.int(pack.cards[0], pack.cards[1]);
    const result = { packId, pack, cards: [], spent: free ? 0 : pack.price };
    for (let i = 0; i < n; i++) {
      let rar = pickRarity(pack.weights, rng);
      let pool = active.filter((c) => c.rarity === rar);
      while (!pool.length && ORDER.indexOf(rar) > 0) { rar = ORDER[ORDER.indexOf(rar) - 1]; pool = active.filter((c) => c.rarity === rar); }
      let card = rng.pick(pool);
      if (free) { const fresh = pool.filter((c) => !s.owned[c.id]); if (fresh.length) card = rng.pick(fresh); }
      const dup = !!s.owned[card.id];
      s.owned[card.id] = (s.owned[card.id] || 0) + 1;
      s.seen = s.seen || {}; s.seen[card.id] = true;
      result.cards.push({ card, dup, isNew: !dup });
    }
    if (!free) s.coins -= pack.price;
    s.opened++;
    return result;
  }

  // Vende una copia repetida. Nunca la última copia.
  function sell(s, cardId) {
    if (!s.owned[cardId] || s.owned[cardId] < 2) return 0;
    const card = lk().cards[cardId];
    const price = cfg().sellPrice[card.rarity] || 0;
    s.owned[cardId]--; s.coins += price;
    s.log.unshift({ date: new Date().toISOString(), text: 'Vendida una copia de ' + card.name + ' por ' + price + ' malandricoins.' });
    return price;
  }

  // Solo cartas activas: una retirada por data/optout.js deja de poder jugarse aunque
  // siga en la colección guardada, y una borrada del catálogo desaparece sin romper
  // nada (byId no la encuentra y filter(Boolean) la descarta).
  function ownedCards(s) {
    const activas = MI.util.byId(MI.album.activeCards());
    return Object.keys(s.owned).filter((id) => s.owned[id] > 0).map((id) => activas[id]).filter(Boolean);
  }

  /* ---------- Campaña ---------- */
  function chapter(s) { const list = cfg().chapters; return list[Math.min(s.chapter, list.length) - 1]; }
  // Último punto de control igual o anterior al capítulo dado.
  function checkpointFor(n) {
    const cps = (cfg().checkpoints || [1]).slice().sort((a, b) => a - b);
    let back = cps[0] || 1;
    cps.forEach((c) => { if (c <= n) back = c; });
    return back;
  }
  function isCheckpoint(n) { return (cfg().checkpoints || []).includes(n); }

  function chapterTickets(ch, rng) {
    const all = MI.data.challenges.filter((t) => t.difficulty <= (ch.maxDifficulty || 5) && t.difficulty >= (ch.minDifficulty || 1));
    return rng.shuffle(all).slice(0, MI.data.config.arcade.tickets);
  }
  function rivalHand(ch, rng, exclude) {
    const active = MI.album.activeCards().filter((c) => !exclude.includes(c.id));
    let pool = active.filter((c) => ch.rivalRarity.includes(c.rarity));
    if (pool.length < MI.data.config.arcade.handSize) pool = active;
    return rng.shuffle(pool).slice(0, MI.data.config.arcade.handSize);
  }

    /* Desgaste: suma los quemados de este sprint, retira a quien llegue al límite y resta uno
      a quien haya aguantado el sprint entero sin quemarse. Devuelve
     { lost: [{card, copiesLeft}], warn: [{card, strikes}] } para avisar en el resumen.
     Se aplica al terminar el sprint, no durante: quitar una carta de la mano a media partida
     dejaría al jugador sin poder jugarla y sin explicación. */
  function wearAndTear(s, summary) {
    const limit = cfg().burnoutLimit, cards = lk().cards;
    const out = { lost: [], warn: [] };
    if (!limit) return out;
    s.strikes = s.strikes || {};
    const played = summary.cards || {};
    Object.keys(played).forEach((id) => {
      const burns = played[id].burnouts || 0;
      if (!burns || !s.owned[id]) return;
      s.strikes[id] = (s.strikes[id] || 0) + burns;
      if (s.strikes[id] >= limit) {
        s.owned[id]--;
        s.strikes[id] = 0;
        const card = cards[id];
        out.lost.push({ card, copiesLeft: s.owned[id] });
        s.log.unshift({ date: new Date().toISOString(), text: card.name + ' deja Malandriner S.A. tras quemarse ' + limit + ' veces.' + (s.owned[id] > 0 ? ' Te queda otra copia en plantilla.' : '') });
      }
    });
    // Cada sprint limpio cura una sola quemadura; recuperarse de dos requiere dos sprints.
    if (cfg().burnoutReset) (summary.hand || []).forEach((id) => {
      if ((!played[id] || !played[id].burnouts) && s.strikes[id]) {
        s.strikes[id]--;
        if (!s.strikes[id]) delete s.strikes[id];
      }
    });
    (summary.hand || []).forEach((id) => {
      const n = s.strikes[id] || 0;
      if (n > 0 && n < limit && s.owned[id]) out.warn.push({ card: cards[id], strikes: n });
    });
    return out;
  }

  // Recompensa de un sprint terminado. summary: { result, resolved, improved, pays, hand, cards }
  function reward(s, ch, summary) {
    const r = cfg().rewards;
    let coins = summary.resolved * r.resolved + summary.improved * r.improved + summary.pays * r.pay;
    const items = [{ label: 'Tickets resueltos', coins: summary.resolved * r.resolved }, { label: 'Parches puestos', coins: summary.improved * r.improved }, { label: 'Pagas', coins: summary.pays * r.pay }];
    let note = '';
    if (summary.result === 'win') {
      coins += r.win; items.push({ label: 'Sprint ganado', coins: r.win });
      if (!s.wins[ch.id]) { coins += r.chapterFirstWin; items.push({ label: 'Capítulo superado por primera vez', coins: r.chapterFirstWin }); }
      s.wins[ch.id] = (s.wins[ch.id] || 0) + 1;
      if (s.chapter === ch.id && s.chapter < cfg().chapters.length) s.chapter++;
      else if (s.chapter === ch.id) { s.finished = (s.finished || 0) + 1; note = 'Has superado la auditoría final. La historia se puede volver a jugar desde el principio con toda tu colección.'; }
    } else if (summary.result === 'loss' && s.chapter > 1) {
      const mode = cfg().onLoss;
      if (mode === 'restart') {
        s.chapter = 1;
        note = rivalName() + ' se queda el contrato. Vuelves al capítulo 1; la colección y los malandricoins se conservan.';
      } else if (mode === 'checkpoint') {
        const back = checkpointFor(s.chapter);
        if (back < s.chapter) {
          s.chapter = back;
          note = rivalName() + ' se queda el contrato. Vuelves al punto de control (capítulo ' + back + '); la colección y los malandricoins se conservan.';
        } else {
          note = rivalName() + ' se queda el contrato, pero estás en un punto de control: repites capítulo.';
        }
      } else {
        note = rivalName() + ' se queda el contrato. Repites el capítulo.';
      }
    }
    const wear = wearAndTear(s, summary);
    s.coins += coins; s.sprints++;
    s.log.unshift({ date: new Date().toISOString(), text: `${ch.name}: ${({ win: 'victoria', loss: 'derrota', draw: 'empate' })[summary.result]} · +${coins} malandricoins` + (note ? ' · ' + note : '') });
    s.log = s.log.slice(0, 30);
    return { coins, items, note, wear };
  }

  /* ---------- Arte de los sobres (SVG) ---------- */
  const PACK_ART = {
    bienvenida: { a: '#80ed99', b: '#1f6f4a', c: '#0b1020', foil: '#c9ffd9', label: 'BIENVENIDA' },
    basico:     { a: '#9aa3ad', b: '#3b4452', c: '#0b1020', foil: '#e6ebf0', label: 'BÁSICO' },
    pro:        { a: '#3a86ff', b: '#0b3d91', c: '#0b1020', foil: '#bcd4ff', label: 'PRO' },
    calabozo:   { a: '#ffd60a', b: '#f72585', c: '#2b0a3d', foil: '#fff3b0', label: 'CALABOZO' }
  };
  function packSvg(packId, opts) {
    const p = PACK_ART[packId] || PACK_ART.basico;
    const pack = cfg().packs[packId] || {};
    const uid = packId + (opts && opts.uid ? opts.uid : '');
    const n = pack.cards ? (pack.cards[0] === pack.cards[1] ? String(pack.cards[0]) : pack.cards[0] + '–' + pack.cards[1]) : '';
    const sparkles = packId === 'calabozo' ? [[40, 60], [200, 40], [60, 300], [210, 280], [130, 190]].map(([x, y]) => `<path d="M${x} ${y - 9} L${x + 2.5} ${y - 2.5} L${x + 9} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 9} L${x - 2.5} ${y + 2.5} L${x - 9} ${y} L${x - 2.5} ${y - 2.5} Z" fill="#fff" opacity=".9"><animate attributeName="opacity" values=".2;1;.2" dur="${1.4 + (x % 5) / 4}s" repeatCount="indefinite"/></path>`).join('') : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 360" class="pack-svg" role="img" aria-label="${pack.name || 'Sobre'}">
  <defs>
    <linearGradient id="pk-${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset=".55" stop-color="${p.b}"/><stop offset="1" stop-color="${p.c}"/></linearGradient>
    <linearGradient id="pf-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="${p.foil}" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="pp-${uid}" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="transparent"/><rect width="7" height="18" fill="#fff" opacity=".06"/></pattern>
    <clipPath id="pc-${uid}"><rect x="10" y="10" width="240" height="340" rx="18"/></clipPath>
    <filter id="ps-${uid}"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#000" flood-opacity=".55"/></filter>
  </defs>
  <g filter="url(#ps-${uid})">
    <rect x="10" y="10" width="240" height="340" rx="18" fill="url(#pk-${uid})"/>
  </g>
  <g clip-path="url(#pc-${uid})">
    <rect x="10" y="10" width="240" height="340" fill="url(#pp-${uid})"/>
    <rect class="pack-foil" x="-120" y="10" width="140" height="340" fill="url(#pf-${uid})" transform="skewX(-20)"><animate attributeName="x" values="-160;320" dur="3.2s" repeatCount="indefinite"/></rect>
    <!-- tira de apertura -->
    <g class="pack-strip">
      <rect x="10" y="10" width="240" height="46" fill="#0b1020" opacity=".55"/>
      <line x1="10" y1="56" x2="250" y2="56" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-dasharray="6 6"/>
      <text x="130" y="40" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11" letter-spacing="3" fill="#fff" opacity=".8">ABRIR POR AQUÍ</text>
    </g>
    <!-- logotipo -->
    <text x="130" y="150" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="26" fill="#fff" letter-spacing="-1">¡MALANDRI-</text>
    <text x="130" y="178" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="26" fill="#fff" letter-spacing="-1">NEITOR!</text>
    <rect x="70" y="192" width="120" height="2" fill="#fff" opacity=".6"/>
    <text x="130" y="222" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" letter-spacing="5" fill="#fff">${p.label}</text>
    <!-- sello con número de cartas -->
    <circle cx="130" cy="280" r="34" fill="#0b1020" opacity=".75"/>
    <circle cx="130" cy="280" r="34" fill="none" stroke="${p.foil}" stroke-width="2"/>
    <text x="130" y="276" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="24" fill="#fff">${n}</text>
    <text x="130" y="294" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="9" letter-spacing="2" fill="${p.foil}">CARTAS</text>
    <text x="130" y="336" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="9" letter-spacing="3" fill="#fff" opacity=".7">MALANDRINER S.A.</text>
    ${sparkles}
  </g>
</svg>`;
  }

  /* ---------- Apertura cinematográfica ---------- */
  function cinematic(pack, onDone) {
    const total = pack.cards.length;
    let idx = -1;
    const overlay = el('div', { class: 'opening-overlay' });
    const stage = el('div', { class: 'opening-stage' });
    overlay.appendChild(stage);
    MI.util.lockScroll();
    document.body.appendChild(overlay);
    const cleanup = () => { overlay.remove(); MI.util.unlockScroll(); document.removeEventListener('keydown', onKey); if (onDone) onDone(); };
    const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } if (e.key === 'Escape') { showSummary(); } };
    document.addEventListener('keydown', onKey);

    function showPack() {
      stage.innerHTML = '';
      const art = el('div', { class: 'op-pack', html: packSvg(pack.packId, { uid: 'op' }) });
      stage.appendChild(el('div', { class: 'op-title', text: pack.pack.name }));
      stage.appendChild(art);
      stage.appendChild(el('p', { class: 'op-hint', text: total + (total === 1 ? ' carta dentro.' : ' cartas dentro.') + ' Pulsa para abrir.' }));
      const btn = el('button', { class: 'primary op-btn', text: 'Abrir sobre', onclick: advance });
      stage.appendChild(btn);
      setTimeout(() => art.classList.add('shake'), 200);
    }

    function tearThenNext() {
      const art = stage.querySelector('.op-pack');
      if (!art) return showCard(0);
      art.classList.remove('shake'); art.classList.add('tear');
      stage.querySelectorAll('.op-btn, .op-hint').forEach((n) => n.remove());
      setTimeout(() => showCard(0), 650);
    }

    function showCard(i) {
      idx = i;
      const x = pack.cards[i];
      stage.innerHTML = '';
      const rar = MI.data.config.rarities[x.card.rarity].name;
      const burst = el('div', { class: 'op-burst rar-' + x.card.rarity });
      const cardNode = MI.card.render(x.card, { size: 'l' });
      cardNode.classList.add('op-card', 'holo-on');
      stage.appendChild(el('div', { class: 'op-counter', text: (i + 1) + ' / ' + total }));
      stage.appendChild(burst);
      stage.appendChild(cardNode);
      stage.appendChild(el('div', { class: 'op-caption rar-' + x.card.rarity }, [
        el('div', { class: 'op-rarity', text: rar }),
        el('div', { class: 'op-name', text: x.card.name }),
        el('div', { class: 'op-status ' + (x.isNew ? 'new' : 'dup'), text: x.isNew ? '¡Nueva en tu colección!' : 'Repetida: puedes venderla en la colección' })
      ]));
      stage.appendChild(el('div', { class: 'op-actions' }, [
        el('button', { class: 'primary op-btn', text: i + 1 < total ? 'Siguiente carta' : 'Ver todas', onclick: advance })
      ]));
      requestAnimationFrame(() => { burst.classList.add('go'); cardNode.classList.add('go'); });
      setTimeout(() => cardNode.classList.remove('holo-on'), 2200);
    }

    function showSummary() {
      idx = total;
      stage.innerHTML = '';
      stage.appendChild(el('div', { class: 'op-title', text: pack.pack.name + ': ' + total + (total === 1 ? ' carta' : ' cartas') }));
      stage.appendChild(el('div', { class: 'op-grid' }, pack.cards.map((x, i) => {
        const node = MI.card.render(x.card, { size: 's', tilt: false });
        node.classList.add('flip-in'); node.style.animationDelay = (i * 0.12) + 's';
        return el('div', { class: 'hand-item' }, [node, el('span', { class: 'pill ' + (x.isNew ? 'new' : ''), text: x.isNew ? 'Nueva' : 'Repetida' })]);
      })));
      stage.appendChild(el('p', { class: 'op-hint', text: 'Las fichas completas están en la colección.' }));
      stage.appendChild(el('div', { class: 'op-actions' }, [
        el('button', { class: 'primary op-btn', text: 'Cerrar', onclick: cleanup }),
        el('button', { class: 'op-btn', text: 'Ver la colección', onclick: () => { view = 'collection'; cleanup(); } })
      ]));
    }

    function advance() {
      if (idx === -1 && stage.querySelector('.op-pack') && !stage.querySelector('.op-pack.tear')) return tearThenNext();
      if (idx >= 0 && idx + 1 < total) return showCard(idx + 1);
      if (idx + 1 === total) return showSummary();
      if (idx === total) return cleanup();
    }
    showPack();
  }

  /* ---------- Vistas ---------- */
  function render(c) {
    if (c) container = c;
    container.innerHTML = '';
    let s = load();
    if (!s) return renderIntro(container);
    ({ dashboard: renderDashboard, shop: renderShop, collection: renderCollection, squad: renderSquad })[view](container, s);
  }
  function go(v) { view = v; render(); }
  // Entrada desde fuera del modo historia (álbum, perfil): fija la vista y navega.
  function openView(v) {
    view = load() ? v : 'dashboard';   // sin partida empezada, la pantalla de alta
    MI.app.go('story');
  }

  function renderIntro(c) {
    c.appendChild(el('div', { class: 'setup' }, [
      el('h1', { text: 'Modo historia' }),
      el('p', { class: 'lead', text: 'Acabas de entrar en Malandriner S.A. con un sobre de bienvenida y cuatro duros. Gana sprints contra ' + rivalName() + ', cobra malandricoins, compra sobres, descubre el álbum y llega a la auditoría final.' }),
      el('div', { class: 'panel' }, [
        el('h2', { text: 'Cómo funciona' }),
        el('p', { class: 'small muted', text: 'Cada capítulo es un sprint de cinco tickets con tu plantilla (cinco malandrines de tu colección). ' + rivalName() + ' mejora de capítulo en capítulo: ' + cfg().chapters.length + ' capítulos hasta la auditoría, con puntos de control en el ' + (cfg().checkpoints || [1]).join(', el ') + '. Si pierdes un sprint vuelves al último punto de control, pero conservas la colección y los malandricoins. Las cartas repetidas se pueden vender. El álbum solo muestra las cartas que has tenido alguna vez.' }),
        el('div', { class: 'actions floating-cta' }, [el('button', { class: 'primary', text: 'Fichar por Malandriner S.A.', onclick: () => { const r = start(); view = 'dashboard'; cinematic(r.pack, () => render()); } })])
      ])
    ]));
  }

  function coinsPill(s) { return el('span', { class: 'pill coins', html: '<b>' + s.coins + '</b> malandricoins' }); }

  function storyNav(s, active) {
    return el('div', { class: 'story-nav' }, [
      ...[['dashboard', 'Oficina'], ['squad', 'Jugar capítulo'], ['shop', 'Tienda de sobres'], ['collection', 'Colección']].map(([v, t]) => el('button', { class: v === active ? 'active' : '', text: t, onclick: () => go(v) })),
      coinsPill(s)
    ]);
  }

  function renderDashboard(c, s) {
    const ch = chapter(s);
    const owned = ownedCards(s);
    const total = MI.album.activeCards().length;
    const N = MI.data.config.arcade.handSize;
    c.appendChild(el('h1', { text: 'Malandriner S.A. · Oficina' }));
    c.appendChild(storyNav(s, 'dashboard'));
    if (s.tampered) c.appendChild(el('p', { class: 'small', style: { color: 'var(--bad)' }, text: 'La partida guardada no supera la comprobación de integridad y se ha reiniciado.' }));
    if (lastSummary) { c.appendChild(renderSummary(lastSummary)); lastSummary = null; }
    const chapterCard = el('div', { class: 'panel chapter-card' }, [
      el('div', { class: 'tag', text: 'Capítulo ' + ch.id + ' de ' + cfg().chapters.length }),
      el('h2', { text: ch.name }),
      el('p', { class: 'muted', text: ch.desc }),
      el('div', { class: 'row small' }, [el('span', { class: 'pill', text: rivalName() + ': ' + ch.level }), el('span', { class: 'pill', text: 'Dificultad ' + (ch.minDifficulty || 1) + ' a ' + (ch.maxDifficulty || 5) }), s.wins[ch.id] ? el('span', { class: 'pill', text: 'Superado ' + s.wins[ch.id] + ' veces' }) : null]),
      el('p', { class: 'small muted difficulty-note', text: 'La dificultad la fija el capítulo y no se cambia durante la historia. “Capítulo ' + ch.id + ' de ' + cfg().chapters.length + '” indica tu avance, no un selector.' }),
      el('div', { class: 'actions floating-cta' }, [
        el('button', { class: 'primary', text: owned.length >= N ? 'Elegir plantilla y jugar' : 'Necesitas ' + N + ' cartas', disabled: owned.length >= N ? null : 'disabled', onclick: () => go('squad') }),
        owned.length < N && s.coins < cfg().packs.basico.price ? el('button', { text: 'Pedir un sobre de emergencia', onclick: () => { const st = load(); const pk = openPack(st, 'basico', true); st.log.unshift({ date: new Date().toISOString(), text: 'Sobre de emergencia. Recepción te mira raro.' }); save(st); cinematic(pk, () => render()); } }) : null
      ])
    ]);
    const stateCard = el('div', { class: 'panel' }, [
      el('h2', { text: 'Estado' }),
      el('div', { class: 'stats' }, [
        stat(s.coins, 'malandricoins'), stat(owned.length + ' / ' + total, 'cartas distintas'), stat(s.opened, 'sobres abiertos'), stat(s.sprints, 'sprints jugados')
      ]),
      el('div', { class: 'row', style: { marginTop: '10px' } }, [el('button', { text: 'Tienda de sobres', onclick: () => go('shop') }), el('button', { text: 'Ver colección', onclick: () => go('collection') })])
    ]);
    const chaptersCard = el('div', { class: 'panel' }, [
      el('h2', { text: 'Capítulos' }),
      ...cfg().chapters.map((x) => el('div', { class: 'chapter-row ' + (x.id < s.chapter ? 'done' : (x.id === s.chapter ? 'now' : 'locked')) + (isCheckpoint(x.id) ? ' cp' : '') }, [
        el('b', { text: x.id + '. ' + x.name }),
        el('span', { class: 'small muted', text: (isCheckpoint(x.id) ? 'punto de control · ' : '') + (x.id < s.chapter ? 'superado' : (x.id === s.chapter ? 'en curso' : (s.wins[x.id] ? 'superado antes' : 'bloqueado'))) })
      ])),
      el('p', { class: 'small muted', style: { marginTop: '10px' }, text: 'Si pierdes un sprint vuelves al último punto de control. Las cartas se pierden si acumulan tres burnouts y los malandricoins no se pierden nunca.' })
    ]);
    const diaryCard = el('div', { class: 'panel' }, [
      el('h2', { text: 'Diario de la oficina' }),
      ...(s.log.length ? s.log.slice(0, 8).map((e) => el('div', { class: 'entry small', text: e.date.slice(0, 10) + ' · ' + e.text })) : [el('p', { class: 'muted small', text: 'Nada todavía.' })]),
      el('div', { class: 'actions', style: { justifyContent: 'flex-start', marginTop: '14px' } }, [el('button', { class: 'ghost small-btn', text: 'Reiniciar la historia', onclick: () => { if (confirm('¿Borrar la historia y empezar de cero? La colección se pierde.')) { reset(); render(); } } })])
    ]);
    c.appendChild(el('div', { class: 'story-cols' }, [
      el('div', { class: 'story-col' }, [chapterCard, stateCard]),
      el('div', { class: 'story-col' }, [chaptersCard, diaryCard])
    ]));
  }

  function stat(v, l) { return el('div', { class: 'stat' }, [el('b', { text: String(v) }), el('span', { text: l })]); }

  function renderSummary(sum) {
    return el('div', { class: 'panel summary' }, [
      el('h2', { text: sum.title }),
      el('div', { class: 'row' }, sum.items.filter((i) => i.coins).map((i) => el('span', { class: 'pill', text: i.label + ': +' + i.coins }))),
      el('p', { class: 'small', style: { color: 'var(--accent)', marginTop: '8px' }, text: '+' + sum.coins + ' malandricoins · +' + sum.points + ' puntos malandrín' }),
      sum.note ? el('p', { class: 'small', style: { color: 'var(--warn)' }, text: sum.note }) : null,
      sum.wear && sum.wear.lost.length ? el('div', { class: 'wear-lost' }, [
        el('b', { text: sum.wear.lost.length === 1 ? 'Deja la empresa' : 'Dejan la empresa' }),
        el('p', { class: 'small', text: sum.wear.lost.map((x) => x.card.name + (x.copiesLeft > 0 ? ' (te queda otra copia)' : '')).join(', ') + '. ' + (cfg().burnoutLimit) + ' burnouts son demasiados para cualquiera.' })
      ]) : null,
      sum.wear && sum.wear.warn.length ? el('p', { class: 'small', style: { color: 'var(--warn)' }, text: (sum.wear.warn.some((x) => x.strikes >= cfg().burnoutLimit - 1) ? 'En la cuerda floja: ' : 'Con algún burnout: ') + sum.wear.warn.map((x) => x.card.name + ' (' + x.strikes + ' de ' + cfg().burnoutLimit + ')').join(', ') + '.' }) : null
    ]);
  }

  function renderShop(c, s) {
    c.appendChild(el('h1', { text: 'Tienda de sobres' }));
    c.appendChild(storyNav(s, 'shop'));
    c.appendChild(el('p', { class: 'lead', text: 'Los sobres se pagan con malandricoins. Las cartas repetidas se guardan y se pueden vender en la colección según su rareza. La tienda no hace devoluciones, como todas.' }));
    const grid = el('div', { class: 'packs' }, Object.entries(cfg().packs).filter(([, p]) => !p.hidden).map(([id, p]) => el('div', { class: 'panel pack pack-' + id }, [
      el('div', { class: 'pack-art', html: packSvg(id, { uid: 'shop' }) }),
      el('h2', { text: p.name }),
      el('p', { class: 'small muted', text: p.desc }),
      el('div', { class: 'row small' }, Object.entries(p.weights).filter((e) => e[1] > 0).map(([r, w]) => el('span', { class: 'pill f-' + r, text: MI.data.config.rarities[r].name + ' ' + w + ' %' }))),
      el('div', { class: 'actions', style: { justifyContent: 'flex-start' } }, [el('button', { class: 'primary', text: 'Comprar por ' + p.price, disabled: s.coins >= p.price ? null : 'disabled', onclick: () => {
        const st = load(); const res = openPack(st, id, false);
        if (!res) return;
        save(st);
        cinematic(res, () => render());
      } })])
    ])));
    c.appendChild(grid);
  }

  function renderCollection(c, s) {
    const active = MI.album.activeCards();
    c.appendChild(el('h1', { text: 'Colección' }));
    c.appendChild(storyNav(s, 'collection'));
    const owned = active.filter((x) => s.owned[x.id]).length;
    const dups = active.reduce((a, x) => a + Math.max(0, (s.owned[x.id] || 0) - 1), 0);
    c.appendChild(el('p', { class: 'lead', text: `${owned} de ${active.length} malandrines en plantilla. Las cartas apagadas aún no las tienes.` + (dups ? ` Tienes ${dups} repetida${dups === 1 ? '' : 's'} para vender.` : '') }));
    const grid = el('div', { class: 'album-grid' }, active
      .sort((a, b) => (s.owned[b.id] ? 1 : 0) - (s.owned[a.id] ? 1 : 0) || ORDER.indexOf(b.rarity) - ORDER.indexOf(a.rarity) || a.name.localeCompare(b.name))
      .map((card) => {
        const n = s.owned[card.id] || 0;
        const st = s.strikes[card.id] || 0;
        const node = n ? MI.card.render(card, { selectable: true, burns: st, onSelect: (cd) => MI.album.openDetail(cd, { burns: st }) }) : MI.card.renderHidden(card);
        const price = cfg().sellPrice[card.rarity] || 0;
        return el('div', { class: 'hand-item' }, [node,
          el('div', { class: 'row', style: { gap: '6px', justifyContent: 'center' } }, [
            el('span', { class: 'pill', text: n ? 'x' + n : 'No la tienes' }),
            st ? el('span', { class: 'pill strikes', text: st + ' de ' + cfg().burnoutLimit + ' burnouts' }) : null,
            n > 1 ? el('button', { class: 'small-btn sell', text: 'Vender una (+' + price + ')', onclick: () => { const stt = load(); sell(stt, card.id); save(stt); render(); } }) : null
          ])]);
      }));
    c.appendChild(grid);
  }

  function renderSquad(c, s) {
    const ch = chapter(s);
    const owned = ownedCards(s);
    // La plantilla es de cinco, salvo que alinees a alguien con plaza extra (Yuri).
    // El cupo es dinámico: se recalcula cada vez que cambia la selección.
    const base = MI.data.config.arcade.handSize;
    const porId = MI.util.byId(owned);
    const elegidas = () => picked.map((id) => porId[id]).filter(Boolean);
    const cupo = () => base + MI.engine.extraSlots(elegidas());
    let picked = (s.lastSquad || []).filter((id) => s.owned[id]);
    picked = picked.slice(0, base + MI.engine.extraSlots(picked.map((id) => porId[id]).filter(Boolean)));
    c.appendChild(el('h1', { text: 'Capítulo ' + ch.id + ': ' + ch.name }));
    c.appendChild(storyNav(s, 'squad'));
    const leyenda = el('p', { class: 'lead' });
    c.appendChild(leyenda);
    const counter = el('span', { class: 'pill' });
    const btn = el('button', { class: 'primary', onclick: () => {
      const st = load(); st.lastSquad = picked.slice(); save(st);
      startSprint(st, ch, picked);
    } });
    const extraNota = el('span', { class: 'pill extra-slot' });
    const refresh = () => {
      const N = cupo();
      if (picked.length > N) picked = picked.slice(0, N);   // al soltar la plaza extra sobra uno
      counter.textContent = picked.length + ' / ' + N + ' elegidos';
      btn.textContent = picked.length === N ? 'Empezar el sprint' : 'Elige ' + (N - picked.length) + ' más';
      btn.disabled = picked.length !== N;
      const conPlaza = elegidas().filter((c) => MI.engine.hasPower(c, 'extra_slot'));
      extraNota.style.display = conPlaza.length ? '' : 'none';
      if (conPlaza.length) extraNota.textContent = conPlaza[0].name + ' abre una plaza: ' + conPlaza[0].power.name;
      leyenda.textContent = 'Elige ' + N + ' malandrines para este sprint. ' + ch.desc;
      grid.querySelectorAll('.card').forEach((n) => n.classList.toggle('selected', picked.includes(n.dataset.card)));
    };
    const grid = el('div', { class: 'album-grid squad-grid' }, owned
      .sort((a, b) => ORDER.indexOf(b.rarity) - ORDER.indexOf(a.rarity) || a.name.localeCompare(b.name))
      .map((card) => el('div', { class: 'hand-item' }, [
        MI.card.render(card, { size: 'm', selectable: true, burns: s.strikes[card.id] || 0, onSelect: () => { if (picked.includes(card.id)) picked = picked.filter((x) => x !== card.id); else if (picked.length < cupo()) picked.push(card.id); refresh(); } }),
        el('button', { class: 'ghost small-btn', text: 'Ver ficha', onclick: (e) => { e.stopPropagation(); MI.album.openDetail(card); } })
      ])));
    c.appendChild(el('div', { class: 'row squad-tools' }, [counter, extraNota, el('button', { class: 'ghost small-btn', text: 'Elegir automáticamente', onclick: () => { picked = autoSquad(owned, base); refresh(); } })]));
    c.appendChild(grid);
    c.appendChild(el('div', { class: 'actions floating-cta' }, [btn]));
    refresh();
  }

  // La elección automática ficha primero a quien abre plaza: una carta más siempre
  // compensa, porque el sprint son cinco tickets y la sexta es relevo contra el burnout.
  function autoSquad(owned, base) {
    const score = (c) => ORDER.indexOf(c.rarity) * 10 + Object.values(c.skills).reduce((a, v) => a + v, 0) / Object.keys(c.skills).length;
    const orden = owned.slice().sort((a, b) => score(b) - score(a));
    const elegidos = orden.filter((c) => MI.engine.hasPower(c, 'extra_slot'));
    const tope = base + MI.engine.extraSlots(elegidos);
    orden.forEach((c) => { if (elegidos.length < tope && !elegidos.includes(c)) elegidos.push(c); });
    return elegidos.slice(0, tope).map((c) => c.id);
  }

  function startSprint(s, ch, squadIds) {
    const rng = MI.util.rng(Math.random() * 1e9);
    const cards = lk().cards;
    const myHand = squadIds.map((id) => cards[id]);
    const oppHand = rivalHand(ch, rng, squadIds);
    const tickets = chapterTickets(ch, rng);
    MI.game.newStoryGame({
      hand: myHand, oppHand, tickets, level: ch.level,
      oppName: MI.data.config.rival.name + ' · cap. ' + ch.id,
      // Se llama al terminar el sprint (no al pulsar el botón), para que cerrar la
      // pestaña en la pantalla final no haga perder monedas ni avance de capítulo.
      onFinish: (summary) => {
        const st = load();
        const rw = reward(st, ch, summary);
        save(st);
        lastSummary = { title: summary.result === 'win' ? 'Sprint ganado: ' + ch.name : (summary.result === 'draw' ? 'Empate en ' + ch.name : rivalName() + ' gana ' + ch.name), items: rw.items, coins: rw.coins, points: summary.points, note: rw.note, wear: rw.wear };
        view = 'dashboard';
      }
    });
    MI.app.go('game');
  }

  return { render, load, save, start, reset, openPack, sell, ownedCards, chapter, checkpointFor, reward, wearAndTear, go, openView, discovered, revealAll, setRevealAll, packSvg, cinematic };
})();
