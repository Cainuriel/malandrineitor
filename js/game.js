/* Modo arcade: contra la máquina (Boluda S.A.) o a dos jugadores por fichero JSON.
   La lógica numérica está en engine.js, ai.js y match.js. Aquí solo estado de pantalla y render. */
window.MI = window.MI || {};

MI.game = (function () {
  const el = MI.util.el;
  let S = null;          // estado de la partida en curso
  let container = null;
  let screen = 'setup';  // setup | play | end | export | resolved

  const fmt = (n) => (Math.round(n * 10) / 10).toFixed(1);
  const sign = (n) => (n >= 0 ? '+' : '') + n;
  const byId = () => ({ cards: MI.util.byId(MI.data.cards), challenges: MI.util.byId(MI.data.challenges), techs: MI.util.byId(MI.data.techs), skills: MI.util.byId(MI.data.skills) });

  /* ---------- Creación de partidas ---------- */
  function newAiGame(opts) {
    const cfg = MI.data.config;
    const seed = opts.seed || Math.random().toString(36).slice(2, 10);
    const d = MI.match.deal(seed, MI.album.activeCards(), MI.data.challenges);
    const lk = byId();
    S = {
      mode: 'ai', seed, rng: MI.util.rng(seed + '|play'), level: opts.level || cfg.arcade.aiLevel,
      myName: myTag(), oppName: cfg.rival.name,
      hands: { me: d.hands.A.map((id) => lk.cards[id]), opp: d.hands.B.map((id) => lk.cards[id]) },
      rep: { me: cfg.points.startReputation, opp: cfg.points.startReputation },
      burnout: { me: {}, opp: {} }, rescueUsed: { me: false, opp: false }, pendingRescue: null,
      tickets: d.tickets.map((id) => lk.challenges[id]),
      ticket: 0, phase: 'choose', selected: null, lastResult: null, log: [], over: null, plays: [], stats: newStats()
    };
    screen = 'play';
  }

  function myTag() { const p = MI.match.profile.load(); return p.tag || p.name || 'Tú'; }
  function newStats() { return { streak: 0, burnouts: 0, pays: 0, resolved: 0, improved: 0, items: [] }; }

  // Modo historia: mano propia elegida, mano de Boluda, tickets del capítulo y callback al terminar.
  function newStoryGame(opts) {
    const cfg = MI.data.config;
    S = {
      mode: 'ai', story: opts, seed: 'historia', rng: MI.util.rng(Math.random() * 1e9), level: opts.level,
      myName: myTag(), oppName: opts.oppName || cfg.rival.name,
      hands: { me: opts.hand.slice(), opp: opts.oppHand.slice() },
      rep: { me: cfg.points.startReputation, opp: cfg.points.startReputation },
      burnout: { me: {}, opp: {} }, rescueUsed: { me: false, opp: false }, pendingRescue: null,
      tickets: opts.tickets.slice(),
      ticket: 0, phase: 'choose', selected: null, lastResult: null, log: [], over: null, plays: [], stats: newStats()
    };
    screen = 'play';
  }

  function newP2pGame(match, role, name) {
    const cfg = MI.data.config;
    const lk = byId();
    const playerSeed = Math.random().toString(36).slice(2, 10);
    const other = role === 'A' ? 'B' : 'A';
    S = {
      mode: 'p2p', match, role, playerSeed, rng: MI.util.rng(match.seed + '|' + role + '|' + playerSeed),
      myName: name, oppName: match.players[other].name || 'Rival (pendiente)',
      hands: { me: match.hands[role].map((id) => lk.cards[id]), opp: match.hands[other].map((id) => lk.cards[id]) },
      rep: { me: cfg.points.startReputation, opp: null },
      burnout: { me: {}, opp: {} }, rescueUsed: { me: false, opp: false }, pendingRescue: null,
      tickets: match.tickets.map((id) => lk.challenges[id]),
      ticket: 0, phase: 'choose', selected: null, lastResult: null, log: [], over: null, plays: [], stats: newStats()
    };
    MI.match.role.set(match.id, role);
    screen = 'play';
  }

  function current() { return S.tickets[S.ticket]; }
  function canRescue(who) { return MI.engine.canRescue(S.hands[who], S.burnout[who], S.rescueUsed[who]); }
  function rescue(who, cardId) {
    if (!canRescue(who) || !S.burnout[who][cardId]) return false;
    delete S.burnout[who][cardId]; S.rescueUsed[who] = true;
    if (who === 'me') S.pendingRescue = cardId;
    S.log.unshift({ cls: 'ok', html: `<b>${who === 'me' ? S.myName : S.oppName}</b> · El amo del calabozo rescata a ${byId().cards[cardId].name}.` });
    return true;
  }
  function available(who) { return S.hands[who].filter((c) => !S.burnout[who][c.id]); }

  /* ---------- Turno ---------- */
  function play() {
    const cfg = MI.data.config;
    const ch = current();
    const mine = S.selected;
    const noCard = () => ({ nobody: true, outcome: 'complicated', points: cfg.points.complicated[ch.difficulty], total: 0, threshold: cfg.thresholds[ch.difficulty], burnout: false });

    const me = mine ? MI.engine.resolve(mine, ch, { withTwist: true, rng: S.rng }, cfg) : noCard();
    S.plays.push({ cardId: mine ? mine.id : null, die: mine ? me.die : 0, rescue: S.pendingRescue || undefined });
    const didRescue = !!S.pendingRescue; S.pendingRescue = null;

    let opp = null, oppCard = null, pay = null;
    if (S.mode === 'ai') {
      // Boluda usa el rescate en cuanto puede: rescata la carta quemada de más rareza.
      if (canRescue('opp')) { const burned = Object.keys(S.burnout.opp).map((id) => byId().cards[id]).sort((a, b) => ['comun', 'rara', 'epica', 'legendaria'].indexOf(b.rarity) - ['comun', 'rara', 'epica', 'legendaria'].indexOf(a.rarity)); if (burned[0]) rescue('opp', burned[0].id); }
      oppCard = MI.ai.choose(available('opp'), ch, S.level, S.rng, cfg, MI.engine);
      opp = oppCard ? MI.engine.resolve(oppCard, ch, { withTwist: true, rng: S.rng }, cfg) : noCard();
      if (me.total > opp.total) pay = 'me'; else if (opp.total > me.total) pay = 'opp';
      S.rep.opp += opp.points + (pay === 'opp' ? cfg.points.payBonus : 0);
      if (opp.burnout && oppCard) S.burnout.opp[oppCard.id] = cfg.burnoutTurns + 1;
    }
    S.rep.me += me.points + (pay === 'me' ? cfg.points.payBonus : 0);
    if (me.burnout && mine) S.burnout.me[mine.id] = cfg.burnoutTurns + 1;

    // Puntos malandrín del ticket
    const st = S.stats;
    st.streak = me.outcome === 'resolved' ? st.streak + 1 : 0;
    if (me.outcome === 'resolved') st.resolved++; else if (me.outcome === 'improved') st.improved++;
    if (me.burnout) st.burnouts++;
    if (pay === 'me') st.pays++;
    const ticketItems = MI.scoring.ticket(me, { challenge: ch, pay: pay === 'me', streak: st.streak, rescued: didRescue });
    st.items.push(...ticketItems);

    const logLine = (who, r, card, bonus) => ({
      cls: r.outcome === 'resolved' ? 'ok' : (r.outcome === 'complicated' ? 'bad' : ''),
      html: `<b>${who}</b> · ${ch.title}: ${card ? card.name : 'nadie disponible'} → <b>${MI.engine.outcomeLabel[r.outcome]}</b> (${fmt(r.total)} vs ${r.threshold}) ${sign(r.points + bonus)}`
    });
    if (opp) S.log.unshift(logLine(S.oppName, opp, oppCard, pay === 'opp' ? cfg.points.payBonus : 0));
    S.log.unshift(logLine(S.myName, me, mine, pay === 'me' ? cfg.points.payBonus : 0));

    S.lastResult = { me, opp, myCard: mine, oppCard, pay, items: ticketItems };
    S.phase = 'reveal';
    if (S.mode === 'ai' && (S.rep.me <= 0 || S.rep.opp <= 0)) S.over = S.rep.me <= 0 ? (S.rep.opp <= 0 ? 'draw' : 'opp') : 'me';
    render();
  }

  function next() {
    ['me', 'opp'].forEach((who) => { for (const id in S.burnout[who]) { S.burnout[who][id]--; if (S.burnout[who][id] <= 0) delete S.burnout[who][id]; } });
    S.ticket++;
    S.selected = null; S.lastResult = null; S.phase = 'choose';
    if (S.ticket >= S.tickets.length || S.over) finish();
    render();
  }

  function finish() {
    if (S.mode === 'ai') {
      if (!S.over) S.over = S.rep.me > S.rep.opp ? 'me' : (S.rep.opp > S.rep.me ? 'opp' : 'draw');
      const result = S.over === 'me' ? 'win' : (S.over === 'opp' ? 'loss' : 'draw');
      const st = S.stats;
      st.items.push(...MI.scoring.sprint({ result, burnouts: st.burnouts, pays: st.pays, tickets: S.tickets.length }));
      S.points = MI.scoring.total(st.items, S.level);
      MI.match.profile.record({ mode: S.story ? 'story' : 'ai', rival: S.oppName + ' (' + S.level + ')', me: S.rep.me, opp: S.rep.opp, result, points: S.points, seed: S.seed });
      screen = 'end';
    } else {
      MI.match.commitPlays(S.match, S.role, S.myName, S.playerSeed, S.plays);
      if (S.role === 'B') {
        const lk = byId();
        S.match.result = MI.match.resolve(S.match, lk.cards, lk.challenges, MI.engine);
        S.match.status = 'resolved';
        recordP2p(S.match, 'B');
        screen = 'resolved';
      } else {
        screen = 'export';
      }
    }
  }

  function recordP2p(match, role) {
    const r = match.result; const other = role === 'A' ? 'B' : 'A';
    MI.match.profile.record({ mode: 'p2p', matchId: match.id, rival: match.players[other].name, me: r.rep[role], opp: r.rep[other], result: r.winner === role ? 'win' : (r.winner === other ? 'loss' : 'draw'), points: r.points && r.points[role] ? r.points[role].total : 0 });
  }

  function renderPoints(items, total, level) {
    if (!items || !items.length) return el('p', { class: 'small muted', text: 'Sin puntos malandrín esta vez.' });
    return el('div', { class: 'panel points' }, [
      el('h3', { text: 'Puntos malandrín: +' + total + (level && MI.data.config.scoring.levelFactor[level] !== 1 ? ' (×' + MI.data.config.scoring.levelFactor[level] + ' por nivel ' + level + ')' : '') }),
      el('div', { class: 'points-list' }, items.map((i) => el('span', { class: 'pill', text: i.label + ' +' + i.points })))
    ]);
  }

  /* ---------- Importar / exportar ---------- */
  function download(text, filename) {
    const blob = new Blob([text], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function loadMatchText(text, name) {
    let match;
    try { match = MI.match.importText(text); } catch (e) { alert(e.message); return; }
    if (match.status === 'resolved') { S = { mode: 'p2p', match, role: MI.match.role.get(match.id) }; if (S.role) recordP2p(match, S.role); screen = 'resolved'; render(); return; }
    if (match.status === 'A-done') {
      if (MI.match.role.get(match.id) === 'A') { alert('Esta partida la creaste tú. Tiene que jugarla tu rival.'); return; }
      newP2pGame(match, 'B', name); render(); return;
    }
    alert('Esta partida está en estado "' + match.status + '" y no se puede continuar desde aquí.');
  }

  /* ---------- Render: configuración ---------- */
  function renderSetup(c) {
    const cfg = MI.data.config;
    const prof = MI.match.profile.load();
    let level = cfg.arcade.aiLevel, seed = '';
    const name = prof.tag || prof.name;
    c.innerHTML = '';
    const ensureName = () => { if (!name) { MI.app.onboarding(); return false; } return true; };

    c.appendChild(el('div', { class: 'setup' }, [
      el('h1', { text: 'Modo arcade' }),
      el('p', { class: 'lead', text: `Se reparten ${cfg.arcade.handSize} malandrines a cada jugador. Durante ${cfg.arcade.tickets} tickets, los dos mandáis un malandriner para el mismo ticket; quien obtiene mejor resultado se lleva la paga. Gana quien acaba con más reputación.` }),
      el('div', { class: 'row' }, [el('span', { class: 'pill', text: 'Juegas como ' + name }), el('span', { class: 'pill', text: (prof.points || 0) + ' puntos malandrín' }), el('button', { class: 'ghost small-btn', text: 'Ver perfil', onclick: () => MI.app.go('perfil') })]),
      el('h2', { style: { marginTop: '22px' }, text: 'Contra ' + cfg.rival.name }),
      el('div', { class: 'panel' }, [
        el('p', { class: 'small muted', text: cfg.rival.name + ' — "' + cfg.rival.tagline + '". La empresa rival juega con una mano propia y elige según el nivel. Si alguien llega a cero, queda eliminado.' }),
        el('div', { class: 'opt' }, [el('label', { text: 'Nivel de la máquina' }), el('select', { onchange: (e) => { level = e.target.value; } }, [
          el('option', { value: 'junior', text: 'Junior (elige con dudas)' }),
          el('option', { value: 'senior', text: 'Senior (juega bien)', selected: 'selected' }),
          el('option', { value: 'cto', text: 'CTO (no falla una)' })
        ])]),
        el('div', { class: 'opt' }, [el('label', { text: 'Semilla (opcional)' }), el('input', { placeholder: 'Misma semilla, mismo reparto', oninput: (e) => { seed = e.target.value; } })]),
        el('div', { class: 'actions' }, [el('button', { class: 'primary', text: 'Repartir cartas', onclick: () => { if (ensureName()) { newAiGame({ level, seed: seed || undefined }); render(); } } })])
      ]),
      el('h2', { style: { marginTop: '22px' }, text: 'A dos jugadores (por fichero)' }),
      el('div', { class: 'panel' }, [
        el('p', { class: 'small muted', text: 'Uno crea la partida y juega sus tickets a ciegas. Exporta el fichero y se lo pasa al rival, que juega los mismos tickets y resuelve la partida. Devuelve el fichero resuelto y los dos ven el resultado. Las jugadas van ofuscadas y firmadas.' }),
        el('div', { class: 'actions', style: { justifyContent: 'flex-start' } }, [
          el('button', { class: 'primary', text: 'Crear partida y jugar primero', onclick: () => { if (ensureName()) { const m = MI.match.create(name, null, MI.album.activeCards(), MI.data.challenges); newP2pGame(m, 'A', name); render(); } } })
        ]),
        el('div', { class: 'opt' }, [el('label', { text: 'Cargar fichero' }), el('input', { type: 'file', accept: '.json,application/json', onchange: (e) => {
          const f = e.target.files[0]; if (!f) return;
          if (!ensureName()) { e.target.value = ''; return; }
          f.text().then((t) => loadMatchText(t, name));
        } })]),
        el('div', { class: 'opt' }, [el('label', { text: 'o pegar el JSON' }), el('textarea', { rows: '3', placeholder: 'Pega aquí el contenido del fichero', id: 'paste-match' })]),
        el('div', { class: 'actions', style: { justifyContent: 'flex-start' } }, [el('button', { text: 'Cargar lo pegado', onclick: () => { const t = document.getElementById('paste-match').value.trim(); if (t && ensureName()) loadMatchText(t, name); } })])
      ]),
    ]));
  }

  /* ---------- Render: partida ---------- */
  function renderHud() {
    const cfg = MI.data.config;
    const oppRep = S.rep.opp == null ? '?' : S.rep.opp;
    return el('div', { class: 'hud' }, [
      el('div', { class: 'player me' }, [el('div', { class: 'who', text: S.myName + ' · ' + cfg.company.name }), el('div', { class: 'rep', html: S.rep.me + '<small>reputación</small>' })]),
      el('div', { class: 'center' }, [
        el('div', { class: 'ticket-n', text: `Ticket ${Math.min(S.ticket + 1, S.tickets.length)} de ${S.tickets.length}` }),
        el('div', { class: 'progress' }, S.tickets.map((_, i) => el('i', { class: i < S.ticket ? 'done' : (i === S.ticket ? 'now' : '') }))),
        el('div', { class: 'small muted', text: S.mode === 'ai' ? 'Nivel ' + S.level + ' · semilla ' + S.seed : 'Partida ' + S.match.id })
      ]),
      el('div', { class: 'player' }, [el('div', { class: 'who', text: S.oppName + (S.mode === 'ai' ? '' : ' · ' + cfg.company.name) }), el('div', { class: 'rep', html: oppRep + '<small>reputación</small>' })])
    ]);
  }

  function renderTicket(ch, revealed) {
    const lk = byId();
    const diff = el('span', { class: 'diff', title: 'Dificultad ' + ch.difficulty }, [1, 2, 3, 4, 5].map((i) => el('i', { class: i <= ch.difficulty ? 'on' : '' })));
    const weights = Object.entries(ch.skills).sort((a, b) => b[1] - a[1]).map(([k, w]) => el('span', { class: 'pill w', html: `${lk.skills[k].short} <b>×${w}</b>`, title: lk.skills[k].name }));
    let twist = null;
    if (ch.twist) {
      twist = revealed
        ? el('div', { class: 'twist revealed reveal' }, [el('span', { class: 'lbl', text: 'Giro' }), ch.twist.text, ' ',
            ...Object.entries(ch.twist.skills || {}).map(([k, w]) => el('span', { class: 'pill w', html: `${lk.skills[k].short} <b>+${w}</b>` })),
            ch.twist.tech ? el('span', { class: 'pill tech', text: 'Ahora la tecnología es ' + lk.techs[ch.twist.tech].name }) : null])
        : el('div', { class: 'twist' }, [el('span', { class: 'lbl', text: 'Giro oculto' }), 'Este ticket tiene un giro que se revela después de elegir. Un malandrín polivalente lo aguanta mejor.']);
    }
    return el('div', { class: 'ticket' }, [
      el('div', { class: 'kicker' }, ['Ticket #' + ch.id, diff, el('span', { text: 'Umbral ' + MI.data.config.thresholds[ch.difficulty] })]),
      el('h2', { text: ch.title }),
      el('p', { class: 'situation', text: ch.situation }),
      el('div', { class: 'meta' }, [ch.tech ? el('span', { class: 'pill tech', text: 'Tecnología principal: ' + lk.techs[ch.tech].name }) : el('span', { class: 'pill', text: 'Sin tecnología principal' }), ...weights]),
      twist
    ]);
  }

  function renderResult(r, bonus) {
    const cfg = MI.data.config;
    if (r.nobody) return el('div', { class: 'result' }, [el('div', { class: 'outcome complicated' }, [el('span', { text: 'Nadie disponible' }), el('span', { class: 'pts', text: sign(r.points) })])]);
    return el('div', { class: 'result reveal' }, [
      el('div', { class: 'r' }, [el('span', { text: 'Media ponderada' }), el('span', { text: fmt(r.base) })]),
      r.champion ? el('div', { class: 'r' }, [el('span', { class: 'tag-champ', text: 'Campeón de la tecnología' }), el('span', { text: '→ ' + fmt(r.score / (r.kryptonite ? cfg.kryptonite.factor : 1)) })]) : null,
      r.kryptonite ? el('div', { class: 'r' }, [el('span', { class: 'tag-kry', text: 'Criptonita' }), el('span', { text: '× ' + cfg.kryptonite.factor })]) : null,
      el('div', { class: 'r' }, [el('span', { text: 'Factor viernes' }), el('span', { html: `+${fmt(r.luck)} <span class="die">${r.die}</span>` })]),
      el('div', { class: 'r' }, [el('span', { text: 'Total / umbral' }), el('span', { text: fmt(r.total) + ' / ' + r.threshold })]),
      el('div', { class: 'outcome ' + r.outcome }, [el('span', { text: MI.engine.outcomeLabel[r.outcome] + (r.burnout ? ' · burnout' : '') }), el('span', { class: 'pts', text: sign(r.points) + (bonus ? ' +' + bonus + ' paga' : '') })])
    ]);
  }

  function openCardDetail(card, ch) {
    MI.album.openDetail(card, { highlight: Object.keys(ch.skills), context: ch });
  }

  function renderPlay(c) {
    const cfg = MI.data.config;
    const ch = current();
    const R = S.lastResult;
    c.innerHTML = '';
    const left = el('div', {});
    left.appendChild(renderHud());
    left.appendChild(renderTicket(ch, S.phase === 'reveal'));

    const mySlot = el('div', { class: 'slot' }, [el('div', { class: 'slot-title', text: 'Tu malandrín' })]);
    const oppSlot = el('div', { class: 'slot' }, [el('div', { class: 'slot-title', text: 'El de ' + S.oppName })]);
    if (S.phase === 'choose') {
      mySlot.appendChild(S.selected ? MI.card.render(S.selected, { size: 'm', highlight: Object.keys(ch.skills) }) : el('div', { class: 'placeholder', text: 'Elige una carta de tu mano y pulsa "Enviar". Con "Ver ficha" la lees entera antes de decidir.' }));
      oppSlot.appendChild(MI.card.renderBack({ size: 'm' }));
      oppSlot.appendChild(el('div', { class: 'small muted', text: S.mode === 'ai' ? available('opp').length + ' disponibles en su mano' : 'Juega a ciegas: verás su jugada al resolver la partida.' }));
    } else {
      mySlot.appendChild(R.myCard ? MI.card.render(R.myCard, { size: 'm', highlight: Object.keys(R.me.weights || ch.skills) }) : el('div', { class: 'placeholder', text: 'Sin carta' }));
      mySlot.appendChild(renderResult(R.me, R.pay === 'me' ? cfg.points.payBonus : 0));
      if (!R.me.nobody) mySlot.appendChild(MI.fx.stamp(R.me.outcome, { pay: R.pay === 'me' }));
      if (S.mode === 'ai') {
        oppSlot.appendChild(R.oppCard ? MI.card.render(R.oppCard, { size: 'm', highlight: Object.keys(R.opp.weights || ch.skills) }) : el('div', { class: 'placeholder', text: 'Sin carta' }));
        oppSlot.appendChild(renderResult(R.opp, R.pay === 'opp' ? cfg.points.payBonus : 0));
      } else {
        oppSlot.appendChild(MI.card.renderBack({ size: 'm' }));
        oppSlot.appendChild(el('div', { class: 'small muted', text: 'La jugada del rival se compara al resolver la partida. La paga se decide entonces.' }));
      }
    }
    left.appendChild(el('div', { class: 'table' }, [mySlot, oppSlot]));
    if (S.phase === 'reveal' && S.mode === 'ai') left.appendChild(el('div', { class: 'pay', text: R.pay ? (R.pay === 'me' ? 'Te llevas la paga' : S.oppName + ' se lleva la paga') : 'Empate: nadie se lleva la paga' }));
    if (S.phase === 'reveal' && R.items && R.items.length) left.appendChild(el('div', { class: 'points-list center' }, R.items.map((i) => el('span', { class: 'pill', text: i.label + ' +' + i.points }))));
    if (S.phase === 'choose' && canRescue('me')) left.appendChild(el('p', { class: 'small', style: { color: 'var(--ok)', textAlign: 'center' }, text: 'El amo del calabozo está en tu mano: puedes rescatar a un malandrín quemado (una vez por partida).' }));

    // Mano con botón "Ver ficha"
    const hand = el('div', { class: 'hand' }, S.hands.me.map((card) => {
      const turns = S.burnout.me[card.id];
      const state = turns ? 'burnout' : (S.phase === 'reveal' ? 'dimmed' : '');
      const node = MI.card.render(card, { size: 's', selectable: !turns && S.phase === 'choose', highlight: Object.keys(ch.skills), state, onSelect: () => { S.selected = card; render(); } });
      if (S.selected && S.selected.id === card.id && S.phase === 'choose') node.classList.add('selected');
      const rescueBtn = turns && S.phase === 'choose' && canRescue('me') ? el('button', { class: 'small-btn rescue', text: 'Rescatar del calabozo', onclick: (e) => { e.stopPropagation(); rescue('me', card.id); render(); } }) : null;
      return el('div', { class: 'hand-item' }, [node, el('div', { class: 'row', style: { gap: '6px', justifyContent: 'center' } }, [el('button', { class: 'ghost small-btn', text: 'Ver ficha', onclick: (e) => { e.stopPropagation(); openCardDetail(card, ch); } }), rescueBtn])]);
    }));
    left.appendChild(el('div', { class: 'hand-wrap' }, [
      el('div', { class: 'hand-title' }, [el('h2', { text: 'Tu mano' }), el('span', { class: 'small muted', text: 'En naranja, las habilidades que pide el ticket.' })]),
      hand
    ]));
    const lastOne = S.ticket + 1 >= S.tickets.length || S.over;
    left.appendChild(el('div', { class: 'actions' }, S.phase === 'choose'
      ? [el('button', { class: 'primary', text: S.selected ? 'Enviar a ' + S.selected.name : (available('me').length ? 'Elige un malandrín' : 'Nadie disponible: asumir el golpe'), disabled: (!S.selected && available('me').length) ? 'disabled' : null, onclick: play })]
      : [el('button', { class: 'primary', text: lastOne ? (S.mode === 'ai' ? 'Ver resultado final' : (S.role === 'A' ? 'Terminar y exportar' : 'Resolver la partida')) : 'Siguiente ticket', onclick: next })]));

    const log = el('div', { class: 'panel log' }, [el('h3', { text: 'Registro del sprint' }), ...(S.log.length ? S.log.map((e) => el('div', { class: 'entry ' + e.cls, html: e.html })) : [el('div', { class: 'entry', text: 'Aún no ha pasado nada. Todo en verde. Sospechoso.' })])]);
    c.appendChild(el('div', { class: 'game' }, [left, log]));
  }

  /* ---------- Render: finales ---------- */
  // El pantallazo se muestra una sola vez por partida, antes del resumen.
  function maybeSplash() {
    if (S.splashDone) return;
    S.splashDone = true;
    const kind = S.over === 'me' ? 'win' : (S.over === 'opp' ? 'loss' : 'draw');
    MI.fx.splash(kind, { score: `${S.myName} ${S.rep.me} · ${S.oppName} ${S.rep.opp}` });
  }

  function renderEnd(c) {
    c.innerHTML = '';
    const msg = { me: 'Has ganado el sprint', opp: S.oppName + ' gana el sprint', draw: 'Empate técnico' }[S.over];
    maybeSplash();
    const summary = { result: S.over === 'me' ? 'win' : (S.over === 'opp' ? 'loss' : 'draw'), resolved: S.stats.resolved, improved: S.stats.improved, pays: S.stats.pays, points: S.points, rep: S.rep.me };
    c.appendChild(el('div', { class: 'endgame' }, [
      el('h1', { text: msg }),
      el('div', { class: 'score', text: `${S.myName} ${S.rep.me} · ${S.oppName} ${S.rep.opp}` + (S.story ? '' : ' · semilla ' + S.seed) }),
      renderPoints(S.stats.items, S.points, S.level),
      el('div', { class: 'actions' }, S.story
        ? [el('button', { class: 'primary', text: 'Volver a la oficina', onclick: () => { const cb = S.story.onFinish; S = null; screen = 'setup'; cb(summary); } })]
        : [el('button', { class: 'primary', text: 'Jugar otra vez', onclick: () => { S = null; screen = 'setup'; render(); } }), el('button', { text: 'Ver álbum', onclick: () => MI.app.go('album') })]),
      el('div', { class: 'panel log static' }, [el('h3', { text: 'Registro del sprint' }), ...S.log.map((e) => el('div', { class: 'entry ' + e.cls, html: e.html }))])
    ]));
  }

  function renderExport(c) {
    c.innerHTML = '';
    const text = MI.match.exportText(S.match);
    const fname = 'malandrineitor-' + S.match.id + '.json';
    c.appendChild(el('div', { class: 'endgame' }, [
      el('h1', { text: 'Sprint terminado' }),
      el('div', { class: 'score', text: `Has acabado con ${S.rep.me} de reputación. Ahora le toca a tu rival.` }),
      el('p', { class: 'lead', style: { margin: '0 auto 18px' }, text: 'Descarga el fichero y pásaselo por donde quieras. Tus jugadas van ofuscadas: tu rival no puede verlas hasta que termine las suyas. Cuando te devuelva el fichero resuelto, cárgalo en "Modo arcade" para ver quién gana.' }),
      el('div', { class: 'actions' }, [el('button', { class: 'primary', text: 'Descargar ' + fname, onclick: () => download(text, fname) }), el('button', { text: 'Copiar al portapapeles', onclick: (e) => { navigator.clipboard.writeText(text).then(() => { e.target.textContent = 'Copiado'; }); } })]),
      el('textarea', { class: 'export-box', readonly: 'readonly', rows: '8', text }),
      el('div', { class: 'actions' }, [el('button', { text: 'Volver al inicio', onclick: () => { S = null; screen = 'setup'; render(); } })])
    ]));
  }

  function renderResolved(c) {
    c.innerHTML = '';
    const m = S.match, r = m.result, lk = byId();
    const role = S.role || MI.match.role.get(m.id);
    const A = m.players.A.name, B = m.players.B.name;
    const winnerText = r.winner === 'draw' ? 'Empate técnico' : (m.players[r.winner].name + ' gana el sprint');
    if (!S.splashDone) {
      S.splashDone = true;
      const kind = !role ? 'draw' : (r.winner === role ? 'win' : (r.winner === 'draw' ? 'draw' : 'loss'));
      MI.fx.splash(kind, { title: role ? undefined : winnerText, score: `${A} ${r.rep.A} · ${B} ${r.rep.B}` });
    }
    const mine = role && r.winner === role ? 'Has ganado.' : (role && r.winner !== 'draw' ? 'Has perdido.' : '');
    const rows = r.tickets.map((t, i) => {
      const ch = lk.challenges[t.ticket];
      const cell = (x) => el('div', { class: 'res-cell ' + x.outcome }, [
        el('b', { text: x.cardId ? lk.cards[x.cardId].name : 'Nadie' }),
        el('span', { text: `${MI.engine.outcomeLabel[x.outcome]} · ${fmt(x.total)}/${x.threshold} · ${sign(x.points)}${x.champion ? ' · campeón' : ''}${x.kryptonite ? ' · criptonita' : ''}` })
      ]);
      return el('div', { class: 'res-row' }, [
        el('div', { class: 'res-ticket' }, [el('span', { class: 'muted small', text: 'Ticket ' + (i + 1) }), el('b', { text: ch.title })]),
        cell(t.A), cell(t.B),
        el('div', { class: 'res-pay', text: t.pay ? m.players[t.pay].name + ' se lleva la paga' : 'Sin paga' })
      ]);
    });
    const text = MI.match.exportText(m);
    const fname = 'malandrineitor-' + m.id + '-resuelta.json';
    c.appendChild(el('div', { class: 'endgame' }, [
      el('h1', { text: winnerText }),
      el('div', { class: 'score', text: `${A} ${r.rep.A} · ${B} ${r.rep.B}. ${mine}` }),
      role && r.points && r.points[role] ? renderPoints(r.points[role].items, r.points[role].total) : null,
      el('div', { class: 'res-table' }, [el('div', { class: 'res-row head' }, [el('div', { text: '' }), el('div', { text: A }), el('div', { text: B }), el('div', { text: '' })]), ...rows]),
      role === 'B' ? el('p', { class: 'lead', style: { margin: '18px auto' }, text: 'Devuélvele el fichero resuelto a ' + A + ' para que vea el resultado.' }) : null,
      el('div', { class: 'actions' }, [
        role === 'B' ? el('button', { class: 'primary', text: 'Descargar ' + fname, onclick: () => download(text, fname) }) : null,
        el('button', { text: 'Volver al inicio', onclick: () => { S = null; screen = 'setup'; render(); } })
      ])
    ]));
  }

  function render(c) {
    if (c) container = c;
    if (!S) screen = 'setup';
    ({ setup: renderSetup, play: renderPlay, end: renderEnd, export: renderExport, resolved: renderResolved })[screen](container);
  }

  return { render, newStoryGame, state: () => S };
})();
