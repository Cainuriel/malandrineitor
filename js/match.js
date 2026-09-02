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

  const ERROR_CORTADO = 'El enlace de la partida ha llegado incompleto o no es válido. Algunas aplicaciones de mensajería cortan los enlaces: pide que te lo reenvíen, o pega aquí el enlace completo.';

  // Reconstruye el resultado a partir de las jugadas ofuscadas de la propia partida.
  // Es determinista: los dados van dentro de las jugadas y las habilidades se reaplican.
  M.rebuildResult = function (match) {
    const mi = root.MI;
    return M.resolve(match, util().byId(mi.data.cards), util().byId(mi.data.challenges), mi.engine);
  };

  /* ---------- Enlace compacto (v2) ----------
     El enlace no lleva JSON: lleva los bytes justos. El JSON de la partida encadenaba
     dos base64 —las jugadas ofuscadas ya venían en base64 y luego se codificaba el
     objeto entero—, y además mandaba nombres de cartas y de tickets que se pueden
     deducir de la semilla ahora que el catálogo está cerrado. Con `result` dentro el
     enlace de vuelta llegaba a 6.260 caracteres y las aplicaciones de mensajería solo
     hacían pulsable el principio.

     Estructura:
       1  versión (2)
       1  estado (0 A-playing, 1 A-done, 2 B-done, 3 resolved)
       2  longitud total declarada: si no cuadra, el enlace llegó cortado. La firma va
          al final, así que sin este dato un enlace truncado se confundiría con uno
          manipulado y mandaría a buscar donde no es.
       1+ identificador de la partida, con su longitud delante
       1+ semilla, con su longitud delante
       4  fecha de creación en segundos desde 1970
       4  huella del catálogo: si no coincide, el reparto sería otro y se avisa
       por jugador (A y B): 1 estado, 1+ nombre, y si ha jugado, 6 bytes de jugadas
       8  firma
     Las jugadas caben en un byte cada una: la carta es su posición en la mano (0-4,
     o 7 si no había nadie disponible) y el dado son tres bits. El sexto byte describe
     el rescate del calabozo, que ocurre como mucho una vez. Esos seis bytes van
     cifrados con el mismo flujo XOR de siempre, así que las jugadas siguen sin verse.

     Los enlaces del formato antiguo (JSON en base64, empiezan por "{") se siguen
     abriendo: se detectan por el primer byte. */

  const ESTADOS = ['A-playing', 'A-done', 'B-done', 'resolved'];
  const SIN_CARTA = 7;

  function activeCards() {
    const fuera = new Set(root.MI.data.optout || []);
    return root.MI.data.cards.filter((c) => !fuera.has(c.id));
  }

  // Huella del catálogo y de los parámetros que determinan el reparto. Si cambian, el
  // enlace ya no describe la misma partida y hay que decirlo en vez de repartir otra.
  M.catalogFingerprint = function () {
    const c = cfg();
    const s = activeCards().map((x) => x.id).join(',') + '|' + root.MI.data.challenges.map((x) => x.id).join(',')
      + '|' + c.arcade.handSize + 'x' + c.arcade.tickets;
    return util().hash(s) >>> 0;
  };

  function bytesToBase64Url(bytes) {
    let s = '';
    bytes.forEach((b) => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function base64UrlToBytes(payload) {
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
    return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  }

  // Flujo XOR sobre bytes sueltos, con la misma clave que M.obfuscate.
  function xorBytes(bytes, key) {
    const r = util().rng(util().hash(cfg().secret + '|' + key));
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ Math.floor(r() * 256);
    return out;
  }

  function firmaDe(bytes) {
    let s = '';
    bytes.forEach((b) => { s += String.fromCharCode(b); });
    const c = s + cfg().secret;
    const h1 = util().hash(c), h2 = util().hash(c + h1.toString(16));
    const out = new Uint8Array(8);
    for (let i = 0; i < 4; i++) { out[i] = (h1 >>> (8 * (3 - i))) & 255; out[4 + i] = (h2 >>> (8 * (3 - i))) & 255; }
    return out;
  }

  // Las cinco jugadas de un jugador en seis bytes, cifradas.
  function empaquetarJugadas(match, role) {
    const mano = match.hands[role];
    const jugadas = (M.plays(match, role) || { plays: [] }).plays;
    const n = cfg().arcade.tickets;
    const out = new Uint8Array(n + 1);
    let rescate = 255;
    for (let i = 0; i < n; i++) {
      const p = jugadas[i] || {};
      const idx = p.cardId ? mano.indexOf(p.cardId) : -1;
      const die = Math.max(0, Math.min(7, p.die || 0));
      out[i] = ((idx < 0 ? SIN_CARTA : idx) & 7) | (die << 3);
      if (p.rescue) { const ri = mano.indexOf(p.rescue); if (ri >= 0) rescate = (i << 3) | ri; }
    }
    out[n] = rescate;
    return xorBytes(out, match.id + '|' + role);
  }

  function desempaquetarJugadas(bytes, mano, id, role) {
    const claro = xorBytes(bytes, id + '|' + role);
    const n = cfg().arcade.tickets;
    const plays = [];
    for (let i = 0; i < n; i++) {
      const idx = claro[i] & 7, die = (claro[i] >> 3) & 7;
      plays.push({ cardId: idx === SIN_CARTA ? null : (mano[idx] || null), die });
    }
    if (claro[n] !== 255) {
      const ticket = (claro[n] >> 3) & 31, carta = claro[n] & 7;
      if (plays[ticket] && mano[carta]) plays[ticket].rescue = mano[carta];
    }
    return plays;
  }

  // El formato compacto da por hecho que las manos y los tickets salen de la semilla.
  // Si una partida no cumple eso —manos puestas a mano, o un catálogo distinto— el
  // enlace corto la repartiría de otra forma, así que se recurre al formato largo,
  // que es autosuficiente. En una partida normal nunca ocurre.
  function reproducibleDesdeLaSemilla(match) {
    try {
      const d = M.deal(match.seed, activeCards(), root.MI.data.challenges);
      return JSON.stringify(d.hands) === JSON.stringify(match.hands)
        && JSON.stringify(d.tickets) === JSON.stringify(match.tickets);
    } catch (e) { return false; }
  }

  function legacyToJson(match) {
    const lite = Object.assign({}, match);
    delete lite.result; delete lite.sig;
    lite.sig = M.sign(lite);
    const bytes = enc().encode(JSON.stringify(lite));
    return bytesToBase64Url(bytes);
  }

  M.toUrlPayload = function (match) {
    if (!reproducibleDesdeLaSemilla(match)) return legacyToJson(match);
    const enc8 = enc();
    const partes = [];
    const push = (arr) => partes.push(arr instanceof Uint8Array ? arr : new Uint8Array(arr));
    const cadena = (s) => { const b = enc8.encode(String(s == null ? '' : s)).slice(0, 255); push([b.length]); push(b); };
    const u32 = (n) => push([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);

    push([2, Math.max(0, ESTADOS.indexOf(match.status)), 0, 0]);   // longitud, rellenada al final
    cadena(match.id);
    cadena(match.seed);
    u32(Math.floor(new Date(match.created || Date.now()).getTime() / 1000));
    u32(M.catalogFingerprint());
    ['A', 'B'].forEach((role) => {
      const p = match.players[role];
      push([p.done ? 1 : 0]);
      cadena(p.name);
      if (p.done && p.blob) push(empaquetarJugadas(match, role));
    });

    let total = 0; partes.forEach((x) => { total += x.length; });
    const cuerpo = new Uint8Array(total);
    let o = 0; partes.forEach((x) => { cuerpo.set(x, o); o += x.length; });
    const largo = total + 8;
    cuerpo[2] = (largo >> 8) & 255; cuerpo[3] = largo & 255;
    const final = new Uint8Array(largo);
    final.set(cuerpo, 0); final.set(firmaDe(cuerpo), total);
    return bytesToBase64Url(final);
  };

  M.fromUrlPayload = function (payload) {
    let bytes;
    try { bytes = base64UrlToBytes(payload); } catch (e) { throw new Error(ERROR_CORTADO); }
    if (bytes[0] === 0x7B) return legacyFromJson(bytes);      // enlaces del formato antiguo
    if (bytes[0] !== 2) throw new Error(ERROR_CORTADO);
    try { return leerBinario(bytes); }
    catch (e) { if (e.esDelJuego) throw e; throw new Error(ERROR_CORTADO); }
  };

  function leerBinario(bytes) {
    // Primero la longitud: un enlace cortado es mucho más probable que uno retocado, y
    // conviene decirlo por su nombre. base64 puede añadir hasta dos bytes de relleno.
    const declarada = (bytes[2] << 8) + bytes[3];
    if (bytes.length < declarada || bytes.length > declarada + 2) throw new Error(ERROR_CORTADO);
    const util8 = bytes.slice(0, declarada);
    const cuerpo = util8.slice(0, declarada - 8), firma = util8.slice(declarada - 8);
    const esperada = firmaDe(cuerpo);
    for (let i = 0; i < 8; i++) if (firma[i] !== esperada[i]) throw delJuego('La firma del enlace no coincide. Alguien lo ha tocado, o es de otra versión del juego.');

    const dec8 = dec();
    let i = 1;
    const estado = ESTADOS[cuerpo[i++]] || 'A-playing';
    i += 2;   // la longitud ya se ha usado
    const cadena = () => { const n = cuerpo[i++]; const s = dec8.decode(cuerpo.slice(i, i + n)); i += n; return s; };
    const u32 = () => { const n = (cuerpo[i] << 24 >>> 0) + (cuerpo[i + 1] << 16) + (cuerpo[i + 2] << 8) + cuerpo[i + 3]; i += 4; return n >>> 0; };

    const id = cadena(), seed = cadena();
    const created = new Date(u32() * 1000).toISOString();
    const huella = u32();
    if (huella !== M.catalogFingerprint()) throw delJuego('Esta partida se creó con otra versión del juego: el catálogo de cartas o de tickets ha cambiado y el reparto ya no sería el mismo. Pídele a tu rival que la cree de nuevo.');

    const d = M.deal(seed, activeCards(), root.MI.data.challenges);
    const match = { v: 1, id, seed, created, hands: d.hands, tickets: d.tickets,
      players: { A: { name: null, done: false, blob: null }, B: { name: null, done: false, blob: null } },
      status: estado, result: null };

    ['A', 'B'].forEach((role) => {
      const done = cuerpo[i++] === 1;
      const name = cadena();
      match.players[role].name = name || null;
      match.players[role].done = done;
      if (done) {
        const n = cfg().arcade.tickets + 1;
        const plays = desempaquetarJugadas(cuerpo.slice(i, i + n), match.hands[role], id, role);
        i += n;
        // Se vuelve a ofuscar con el formato de siempre: el resto del juego lee `blob`.
        match.players[role].blob = M.obfuscate({ plays }, id + '|' + role);
      }
    });

    if (match.status === 'resolved') match.result = M.rebuildResult(match);
    match.sig = M.sign(Object.assign({}, match, { sig: undefined }));
    return match;
  }

  function delJuego(mensaje) { const e = new Error(mensaje); e.esDelJuego = true; return e; }

  // Enlaces creados antes del formato binario: JSON completo en base64.
  function legacyFromJson(bytes) {
    let match;
    try { match = M.importText(dec().decode(bytes)); }
    catch (e) { if (e.message && e.message.includes('firma')) throw e; throw new Error(ERROR_CORTADO); }
    if (match.status === 'resolved' && !match.result) match.result = M.rebuildResult(match);
    return match;
  }

  /* ---------- Perfil de jugador (localStorage) ---------- */
  const PROFILE_KEY = 'mi.profile';
  const ROLE_KEY = 'mi.match.';
  function storage() { try { return root.localStorage; } catch (e) { return null; } }

  M.profile = {
    empty: () => ({ name: '', tag: '', points: 0, games: 0, wins: 0, losses: 0, draws: 0, bestRep: 0, byMode: {}, cardStats: {}, history: [] }),
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
      // Recuento exacto por modo: el historial se recorta a 50 entradas y no sirve para contar.
      p.byMode = p.byMode || {};
      const m = p.byMode[entry.mode] = p.byMode[entry.mode] || { games: 0, wins: 0, losses: 0, draws: 0, points: 0 };
      m.games++;
      m.points += entry.points || 0;
      if (entry.result === 'win') m.wins++; else if (entry.result === 'loss') m.losses++; else m.draws++;
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
    // Acumula estadísticas por carta: veces enviada, resuelta y quemada.
    // map: { idCarta: { sent, resolved, burnouts } }
    recordCards(map) {
      if (!map || !Object.keys(map).length) return;
      const p = M.profile.load();
      p.cardStats = p.cardStats || {};
      for (const id in map) {
        const c = p.cardStats[id] = p.cardStats[id] || { sent: 0, resolved: 0, burnouts: 0 };
        c.sent += map[id].sent || 0;
        c.resolved += map[id].resolved || 0;
        c.burnouts += map[id].burnouts || 0;
      }
      M.profile.save(p);
      return p;
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
