/* Partidas a dos jugadores por fichero JSON y perfil de jugador en localStorage.
   Ofuscación y firma con una semilla fija (config.secret): no es seguridad, evita trampas triviales.
   Puro salvo MI.match.profile (localStorage). Usable en Node para tests.

   Protocolo (ver docs/DOS_JUGADORES.md):
     1. A crea la partida: semilla de partida, tickets fijados, manos repartidas (A = primeras N cartas, B = siguientes N).
     2. A juega sus tickets a ciegas. Sus jugadas se guardan ofuscadas. Exporta el fichero (status 'A-done').
     3. B carga el fichero, juega a ciegas, y al terminar el juego resuelve ambas jugadas y exporta (status 'resolved').
     4. A carga el fichero resuelto y ve el resultado.
*/
(function (root) {
  const M = {};
  const enc = () => new TextEncoder();
  const dec = () => new TextDecoder();

  function cfg() { return root.MI.data.config; }
  function util() { return root.MI.util; }

  // Flujo XOR reproducible a partir de secret + key. Salida base64.
  M.obfuscate = function (obj, key) {
    const bytes = enc().encode(JSON.stringify(obj));
    const r = util().rng(util().hash(cfg().secret + '|' + key));
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ Math.floor(r() * 256);
    let s = '';
    out.forEach((b) => { s += String.fromCharCode(b); });
    return btoa(s);
  };
  M.reveal = function (b64, key) {
    const s = atob(b64);
    const r = util().rng(util().hash(cfg().secret + '|' + key));
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) ^ Math.floor(r() * 256);
    return JSON.parse(dec().decode(out));
  };

  // Firma: dos hashes FNV encadenados sobre el JSON canónico (claves ordenadas) + secret.
  function canonical(obj) {
    if (Array.isArray(obj)) return '[' + obj.map(canonical).join(',') + ']';
    if (obj && typeof obj === 'object') return '{' + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
    return JSON.stringify(obj);
  }
  M.sign = function (obj) {
    const c = canonical(obj) + cfg().secret;
    const h1 = util().hash(c), h2 = util().hash(c + h1.toString(16));
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  };
  M.verify = function (signed) {
    const copy = Object.assign({}, signed); delete copy.sig;
    return signed.sig === M.sign(copy);
  };

  /* ---------- Partida ---------- */
  M.newId = function () { return 'm-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36); };

  M.deal = function (seed, activeCards, challenges) {
    const c = cfg();
    const rng = util().rng(seed);
    const cards = rng.shuffle(activeCards);
    const n = c.arcade.handSize;
    if (cards.length < n * 2) throw new Error('No hay cartas suficientes para dos manos de ' + n);
    return {
      hands: { A: cards.slice(0, n).map((x) => x.id), B: cards.slice(n, n * 2).map((x) => x.id) },
      tickets: rng.shuffle(challenges).slice(0, c.arcade.tickets).map((x) => x.id)
    };
  };

  M.create = function (nameA, seed, activeCards, challenges) {
    seed = seed || Math.random().toString(36).slice(2, 10);
    const d = M.deal(seed, activeCards, challenges);
    return {
      v: 1, id: M.newId(), seed,
      created: new Date().toISOString(),
      hands: d.hands, tickets: d.tickets,
      players: { A: { name: nameA, done: false, blob: null }, B: { name: null, done: false, blob: null } },
      status: 'A-playing', result: null
    };
  };

  // Guarda las jugadas de un jugador (ofuscadas) y avanza el estado.
  M.commitPlays = function (match, role, name, playerSeed, plays) {
    match.players[role].name = name;
    match.players[role].done = true;
    match.players[role].blob = M.obfuscate({ playerSeed, plays }, match.id + '|' + role);
    match.status = role === 'A' ? 'A-done' : 'B-done';
    return match;
  };

  M.plays = function (match, role) {
    const p = match.players[role];
    if (!p.done || !p.blob) return null;
    return M.reveal(p.blob, match.id + '|' + role);
  };

  // Resuelve la partida completa (ambos jugadores terminados). Determinista.
  M.resolve = function (match, cardsById, challengesById, engine) {
    const c = cfg();
    const tickets = match.tickets;
    const out = { tickets: [], rep: { A: c.points.startReputation, B: c.points.startReputation }, winner: null };
    const plays = { A: M.plays(match, 'A').plays, B: M.plays(match, 'B').plays };
    const burnout = { A: {}, B: {} };
    const rescued = { A: false, B: false };
    const stats = { A: { streak: 0, burnouts: 0, pays: 0, items: [] }, B: { streak: 0, burnouts: 0, pays: 0, items: [] } };
    const scoring = root.MI.scoring;
    tickets.forEach((tid, i) => {
      const ch = challengesById[tid];
      const row = { ticket: tid };
      const res = {};
      const didRescue = { A: false, B: false };
      ['A', 'B'].forEach((role) => {
        const play = plays[role][i] || {};
        // Rescate del calabozo (una vez por partida, con el amo del calabozo en mano y sin quemar)
        if (play.rescue && !rescued[role] && burnout[role][play.rescue]) {
          const hand = match.hands[role].map((id) => cardsById[id]).filter(Boolean);
          if (engine.canRescue(hand, burnout[role], false)) { delete burnout[role][play.rescue]; rescued[role] = true; didRescue[role] = true; }
        }
        const card = play.cardId ? cardsById[play.cardId] : null;
        const legal = card && match.hands[role].includes(card.id) && !burnout[role][card.id];
        if (legal) {
          const die = Math.min(c.luck.dieFaces, Math.max(1, play.die | 0));
          res[role] = engine.resolve(card, ch, { withTwist: true, rng: () => (die - 1) / c.luck.dieFaces }, c);
          res[role].cardId = card.id;
          if (res[role].burnout) burnout[role][card.id] = c.burnoutTurns + 1;
        } else {
          res[role] = { nobody: true, cardId: null, outcome: 'complicated', points: c.points.complicated[ch.difficulty], total: 0, threshold: c.thresholds[ch.difficulty], burnout: false };
        }
      });
      let pay = null;
      if (res.A.total > res.B.total) pay = 'A'; else if (res.B.total > res.A.total) pay = 'B';
      ['A', 'B'].forEach((role) => {
        out.rep[role] += res[role].points + (pay === role ? c.points.payBonus : 0);
        const st = stats[role];
        st.streak = res[role].outcome === 'resolved' ? st.streak + 1 : 0;
        if (res[role].burnout) st.burnouts++;
        if (pay === role) st.pays++;
        if (scoring) st.items.push(...scoring.ticket(res[role], { challenge: ch, pay: pay === role, streak: st.streak, rescued: didRescue[role] }));
      });
      ['A', 'B'].forEach((role) => { for (const id in burnout[role]) { burnout[role][id]--; if (burnout[role][id] <= 0) delete burnout[role][id]; } });
      row.A = res.A; row.B = res.B; row.pay = pay; row.rep = { A: out.rep.A, B: out.rep.B };
      out.tickets.push(row);
    });
    out.winner = out.rep.A > out.rep.B ? 'A' : (out.rep.B > out.rep.A ? 'B' : 'draw');
    out.points = {};
    ['A', 'B'].forEach((role) => {
      const st = stats[role];
      const result = out.winner === role ? 'win' : (out.winner === 'draw' ? 'draw' : 'loss');
      if (scoring) st.items.push(...scoring.sprint({ result, burnouts: st.burnouts, pays: st.pays, tickets: tickets.length }));
      out.points[role] = { items: st.items, total: scoring ? scoring.total(st.items) : 0 };
    });
    return out;
  };

  M.exportText = function (match) {
    const copy = Object.assign({}, match); delete copy.sig;
    copy.sig = M.sign(copy);
    return JSON.stringify(copy, null, 2);
  };
  M.importText = function (text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { throw new Error('El fichero no es un JSON válido.'); }
    if (!obj || obj.v !== 1 || !obj.id || !obj.players) throw new Error('El fichero no es una partida de ¡MALANDRINEITOR!.');
    if (!M.verify(obj)) throw new Error('La firma del fichero no coincide. Alguien lo ha tocado, o es de otra versión.');
    return obj;
  };

  /* ---------- Perfil de jugador (localStorage) ---------- */
  const PROFILE_KEY = 'mi.profile';
  const ROLE_KEY = 'mi.match.';
  function storage() { try { return root.localStorage; } catch (e) { return null; } }

  M.profile = {
    empty: () => ({ name: '', tag: '', points: 0, games: 0, wins: 0, losses: 0, draws: 0, bestRep: 0, history: [] }),
    load() {
      const s = storage(); if (!s) return M.profile.empty();
      try {
        const raw = s.getItem(PROFILE_KEY); if (!raw) return M.profile.empty();
        const p = JSON.parse(raw);
        if (!M.verify(p)) { const e = M.profile.empty(); e.tampered = true; return e; }
        delete p.sig; return p;
      } catch (e) { return M.profile.empty(); }
    },
    save(p) {
      const s = storage(); if (!s) return;
      const copy = Object.assign({}, p); delete copy.sig; delete copy.tampered;
      copy.sig = M.sign(copy);
      s.setItem(PROFILE_KEY, JSON.stringify(copy));
    },
    record(entry) {
      // entry: { mode: 'ai'|'p2p'|'story', rival, me, opp, result: 'win'|'loss'|'draw', points, matchId?, detail? }
      const p = M.profile.load();
      if (entry.matchId && p.history.some((h) => h.matchId === entry.matchId)) return p; // no duplicar
      p.games++;
      p.points = (p.points || 0) + (entry.points || 0);
      if (entry.result === 'win') p.wins++; else if (entry.result === 'loss') p.losses++; else p.draws++;
      p.bestRep = Math.max(p.bestRep || 0, entry.me);
      p.history.unshift(Object.assign({ date: new Date().toISOString() }, entry));
      p.history = p.history.slice(0, 50);
      M.profile.save(p);
      return p;
    },
    // Crea la cuenta: nombre de malandrín + número aleatorio para que no coincida con otro.
    create(name) {
      const p = M.profile.load();
      p.name = name;
      p.tag = name + '#' + String(Math.floor(1000 + Math.random() * 9000));
      p.created = new Date().toISOString();
      M.profile.save(p); return p;
    },
    setName(name) { const p = M.profile.load(); p.name = name; if (!p.tag) p.tag = name + '#' + String(Math.floor(1000 + Math.random() * 9000)); M.profile.save(p); return p; },
    exportText() { const p = M.profile.load(); const c = Object.assign({}, p); c.sig = M.sign(c); return JSON.stringify(c, null, 2); },
    importText(text) { const p = JSON.parse(text); if (!M.verify(p)) throw new Error('El perfil no supera la comprobación de integridad.'); delete p.sig; M.profile.save(p); return p; },
    reset() { const s = storage(); if (s) s.removeItem(PROFILE_KEY); }
  };

  // Recuerda qué papel (A/B) juega este navegador en cada partida, para saber quién soy al importar el resultado.
  M.role = {
    set(matchId, role) { const s = storage(); if (s) s.setItem(ROLE_KEY + matchId, role); },
    get(matchId) { const s = storage(); return s ? s.getItem(ROLE_KEY + matchId) : null; }
  };

  root.MI = root.MI || {};
  root.MI.match = M;
})(typeof window !== 'undefined' ? window : globalThis);
