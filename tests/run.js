/* Tests del motor en Node: node tests/run.js
   Carga los ficheros de datos y el motor simulando el objeto window. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {}, globalThis: null, console };
ctx.window.MI = {};
ctx.MI = ctx.window.MI;
vm.createContext(ctx);

const load = (f) => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
ctx.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
ctx.TextEncoder = TextEncoder; ctx.TextDecoder = TextDecoder; ctx.btoa = btoa; ctx.atob = atob;
['data/config.js', 'data/skills.js', 'data/techs.js', 'data/cards.js', 'data/challenges.js', 'data/optout.js', 'data/phrases.js', 'js/util.js', 'js/engine.js', 'js/ai.js', 'js/scoring.js', 'js/match.js', 'js/album.js', 'js/story.js'].forEach(load);

const MI = ctx.window.MI;
const cfg = MI.data.config;
const engine = MI.engine;
let failures = 0;
function check(cond, msg) { if (!cond) { failures++; console.error('FALLO:', msg); } else console.log('ok  ', msg); }

// 1. Validación de catálogos
const v = engine.validate(MI.data);
v.errors.forEach((e) => console.error('  -', e));
check(v.ok, `catálogos válidos (${MI.data.cards.length} cartas, ${MI.data.challenges.length} retos, ${MI.data.skills.length} habilidades, ${MI.data.techs.length} tecnologías)`);

// 2. Regla del campeón: para cada reto con tech, toda carta campeona supera a toda carta no campeona (sin criptonita).
let championRuleOk = true;
MI.data.challenges.filter((c) => c.tech).forEach((ch) => {
  const evs = MI.data.cards.map((card) => ({ card, ev: engine.evaluate(card, ch, { withTwist: true, abilities: false }, cfg) }));
  const champs = evs.filter((x) => x.ev.champion && !x.ev.kryptonite);
  const others = evs.filter((x) => !x.ev.champion);
  champs.forEach((c) => others.forEach((o) => { if (o.ev.score >= c.ev.score) { championRuleOk = false; console.error(`  ${ch.id}: ${o.card.id} (${o.ev.score.toFixed(2)}) >= campeón ${c.card.id} (${c.ev.score.toFixed(2)})`); } }));
});
check(championRuleOk, 'el campeón de la tecnología del reto siempre puntúa más que cualquier no campeón');

// 3. Criptonita reduce la puntuación
const fer = MI.data.cards.find((c) => c.id === 'fernando-lopez');
const reactCh = MI.data.challenges.find((c) => c.id === 'react-white-screen');
const evK = engine.evaluate(fer, reactCh, {}, cfg);
check(evK.kryptonite && evK.score < evK.base, 'la criptonita (React para Fernando) reduce la puntuación');

// 4. Reproducibilidad con semilla
const util = (function () { // copia mínima del RNG para no depender del DOM
  function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  return { rng };
})();
const r1 = engine.resolve(fer, MI.data.challenges.find((c) => c.id === 'blockchain-from-scratch'), { withTwist: true, rng: util.rng(42) }, cfg);
const r2 = engine.resolve(fer, MI.data.challenges.find((c) => c.id === 'blockchain-from-scratch'), { withTwist: true, rng: util.rng(42) }, cfg);
check(r1.total === r2.total && r1.outcome === r2.outcome, 'misma semilla, mismo resultado');
check(r1.champion && r1.outcome === 'resolved', `Fernando resuelve la blockchain desde cero como campeón (total ${r1.total.toFixed(1)} vs umbral ${r1.threshold})`);

// 5. La IA elige al campeón cuando lo tiene en la mano
const hand = MI.data.cards.filter((c) => ['fernando-lopez', 'vicent-perez', 'holtrix', 'daniel-m'].includes(c.id));
const pick = MI.ai.choose(hand, MI.data.challenges.find((c) => c.id === 'blockchain-from-scratch'), 'cto', util.rng(1), cfg, engine);
check(pick && pick.id === 'fernando-lopez', 'la IA nivel cto envía al campeón EVM al reto de blockchain');

// 6. Habilidad del amo del calabozo: ignora criptonita y burnout
const dp = MI.data.cards.find((c) => c.id === 'daniel-primo');
const worst = engine.resolve(dp, MI.data.challenges.find((c) => c.id === 'db-breach'), { withTwist: true, rng: () => 0 }, cfg);
check(worst.burnout === false, 'Daniel Primo nunca entra en burnout');

// 7. Habilidades especiales nuevas y orden de potencia de las épicas
const sergi = MI.data.cards.find((c) => c.id === 'sergi-edo');
const mapChallenge = { tech: 'python', difficulty: 3, skills: { data_mining: 3 }, twist: { text: 'Cambian las coordenadas.', skills: { security: 3 }, tech: 'linux' } };
const mapEval = engine.evaluate(sergi, mapChallenge, { withTwist: true }, cfg);
check(!mapEval.withTwist && !mapEval.weights.security, 'Cartógrafo de datos ignora el giro en tickets de análisis de datos');

const alexAvalos = MI.data.cards.find((c) => c.id === 'alex-avalos');
const linuxChallenge = MI.data.challenges.find((c) => c.tech === 'linux');
const rootResult = engine.resolve(alexAvalos, linuxChallenge, { rng: () => 0 }, cfg);
check(rootResult.die === 2, 'Acceso root suma +1 al dado en tickets Linux');

const joseAngel = MI.data.cards.find((c) => c.id === 'jose-angel-socarrades');
const symfonyChallenge = MI.data.challenges.find((c) => c.tech === 'symfony');
const symfonyResult = engine.resolve(joseAngel, symfonyChallenge, { rng: () => 0 }, cfg);
check(symfonyResult.die === 2, 'Symfony de guardia suma +1 al dado en tickets Symfony');

const rarityOrder = ['comun', 'rara', 'epica', 'legendaria'];
const cardPower = (c) => rarityOrder.indexOf(c.rarity) * 10 + Object.values(c.skills).reduce((sum, value) => sum + value, 0) / Object.keys(c.skills).length;
const powerOrder = MI.data.cards.slice().sort((a, b) => cardPower(b) - cardPower(a)).slice(0, 5).map((c) => c.id);
check(powerOrder.join(',') === 'daniel-primo,yuri,jose-manuel-gomez,sergi-edo,andres-cabrera', 'orden de potencia: Daniel, Yuri, José Manuel, Sergi y Andrés');

// 8. Partida a dos jugadores: crear, jugar A, exportar/importar, jugar B, resolver; firma y ofuscación
{
  const Mx = MI.match;
  const cardsById = {}; MI.data.cards.forEach((c) => { cardsById[c.id] = c; });
  const chById = {}; MI.data.challenges.forEach((c) => { chById[c.id] = c; });
  const m = Mx.create('Ana', 'semilla-test', MI.data.cards, MI.data.challenges);
  check(m.hands.A.length === cfg.arcade.handSize && m.tickets.length === cfg.arcade.tickets && !m.hands.A.some((id) => m.hands.B.includes(id)), 'reparto: dos manos disjuntas y tickets fijados por la semilla');
  const playsA = m.tickets.map((t, i) => ({ cardId: m.hands.A[i % m.hands.A.length], die: 1 + (i % 6) }));
  Mx.commitPlays(m, 'A', 'Ana', 'sA', playsA);
  const text = Mx.exportText(m);
  check(!text.includes(playsA[0].cardId) || text.indexOf(playsA[0].cardId) < text.indexOf('"blob"'), 'las jugadas de A no aparecen en claro en el fichero exportado');
  const m2 = Mx.importText(text);
  check(m2.status === 'A-done' && m2.id === m.id, 'importación verifica la firma y conserva el estado');
  const linked = Mx.fromUrlPayload(Mx.toUrlPayload(m));
  check(linked.status === 'A-done' && linked.id === m.id, 'enlace comparte una partida firmada y conserva el estado');
  let tampered = false; try { Mx.importText(text.replace('"Ana"', '"Eva"')); } catch (e) { tampered = true; }
  check(tampered, 'un fichero manipulado se rechaza por firma');
  const playsB = m2.tickets.map((t, i) => ({ cardId: m2.hands.B[(i + 1) % m2.hands.B.length], die: 6 }));
  Mx.commitPlays(m2, 'B', 'Bea', 'sB', playsB);
  check(m2.tickets.every((t) => chById[t]), 'los tickets del fichero existen en el catálogo');
  const r1 = Mx.resolve(m2, cardsById, chById, engine);
  check(r1.points && r1.points.A && typeof r1.points.A.total === 'number' && r1.points.A.items.length > 0, `puntos malandrín calculados en la resolución a dos (A +${r1.points.A.total} · B +${r1.points.B.total})`);
  const r2 = Mx.resolve(Mx.importText(Mx.exportText(m2)), cardsById, chById, engine);
  check(r1.tickets.length === cfg.arcade.tickets && r1.rep.A === r2.rep.A && r1.rep.B === r2.rep.B && ['A', 'B', 'draw'].includes(r1.winner), `resolución determinista de la partida a dos (A ${r1.rep.A} · B ${r1.rep.B} · gana ${r1.winner})`);
  const cheat = Mx.importText(Mx.exportText(m2)); cheat.hands.B[0] = 'daniel-primo';
  let rejected = false; try { Mx.importText(JSON.stringify(cheat)); } catch (e) { rejected = true; }
  check(rejected, 'cambiar la mano en el fichero invalida la firma');
  // El enlace de la partida resuelta: sin `result` dentro, reconstruido al abrirlo.
  // Un enlace de 6.000 caracteres lo cortan los mensajeros; este ronda los 1.500.
  const resuelta = Mx.importText(Mx.exportText(m2));
  resuelta.result = Mx.resolve(resuelta, cardsById, chById, engine);
  resuelta.status = 'resolved';
  const carga = Mx.toUrlPayload(resuelta);
  const enlace = 'https://cainuriel.github.io/malandrineitor/#match=' + carga;
  check(enlace.length < 2000, `el enlace de la partida resuelta cabe en un mensaje (${enlace.length} caracteres)`);
  const bruto = JSON.parse(Buffer.from(carga.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  check(!bruto.result, 'el enlace no arrastra el resultado: se reconstruye en destino');
  const vuelta = Mx.fromUrlPayload(carga);
  check(vuelta.status === 'resolved' && !!vuelta.result, 'al abrir el enlace se reconstruye el resultado');
  check(JSON.stringify(vuelta.result) === JSON.stringify(resuelta.result), 'el resultado reconstruido es idéntico al que calculó quien resolvió');
  let cortado = false, mensaje = '';
  try { Mx.fromUrlPayload(carga.slice(0, Math.floor(carga.length * 0.8))); } catch (e) { cortado = true; mensaje = e.message; }
  check(cortado && /incompleto/.test(mensaje), 'un enlace cortado avisa de que ha llegado incompleto, no de manipulación');

  // Perfil firmado
  const p = { name: 'Ana', games: 3, wins: 2, losses: 1, draws: 0, bestRep: 90, history: [] };
  p.sig = Mx.sign(p);
  check(Mx.verify(p), 'perfil con firma válida');
  p.wins = 99;
  check(!Mx.verify(p), 'perfil manipulado detectado');
}

// 8. Rescate del amo del calabozo en una partida a dos
{
  const Mx = MI.match;
  const cardsById = {}; MI.data.cards.forEach((c) => { cardsById[c.id] = c; });
  const chById = {}; MI.data.challenges.forEach((c) => { chById[c.id] = c; });
  const m = Mx.create('Ana', 'rescate', MI.data.cards, MI.data.challenges);
  m.hands.A = ['daniel-primo', 'holtrix', 'xabat-karrera', 'vicent-perez', 'paulo-carvajal'];
  m.tickets = ['blockchain-from-scratch', 'db-breach', 'react-white-screen', 'cert-expired', 'mvp-agentic'];
  // Ticket 1: HolTrix a la blockchain (se quema seguro). Ticket 2: rescate de HolTrix y lo manda otra vez.
  const playsA = [{ cardId: 'holtrix', die: 1 }, { cardId: 'holtrix', die: 6, rescue: 'holtrix' }, { cardId: 'daniel-primo', die: 3 }, { cardId: 'daniel-primo', die: 3 }, { cardId: 'daniel-primo', die: 3 }];
  Mx.commitPlays(m, 'A', 'Ana', 's', playsA);
  Mx.commitPlays(m, 'B', 'Bea', 's', m.tickets.map((t, i) => ({ cardId: m.hands.B[0], die: 3 })));
  const r = Mx.resolve(m, cardsById, chById, engine);
  check(r.tickets[0].A.burnout === true, 'HolTrix se quema en la blockchain');
  check(r.tickets[1].A.cardId === 'holtrix' && !r.tickets[1].A.nobody, 'el rescate del calabozo devuelve a HolTrix a la mano en el siguiente ticket');
  check(r.points.A.items.some((i) => i.label === 'Rescate del calabozo'), 'el rescate puntúa');
  const m2 = Mx.create('Ana', 'rescate2', MI.data.cards, MI.data.challenges);
  m2.hands.A = ['holtrix', 'xabat-karrera', 'vicent-perez', 'paulo-carvajal', 'hugo-s'];
  m2.tickets = m.tickets;
  Mx.commitPlays(m2, 'A', 'Ana', 's', playsA.map((p) => ({ cardId: p.cardId === 'daniel-primo' ? 'hugo-s' : p.cardId, die: p.die, rescue: p.rescue })));
  Mx.commitPlays(m2, 'B', 'Bea', 's', m2.tickets.map(() => ({ cardId: m2.hands.B[0], die: 3 })));
  const r2 = Mx.resolve(m2, cardsById, chById, engine);
  check(r2.tickets[1].A.nobody === true, 'sin el amo del calabozo en la mano, el rescate se ignora');
}

// 9. Modo historia: sobres, recortes y recompensas
{
  const st = MI.story;
  const s = { coins: 1000, owned: {}, chapter: 1, wins: {}, opened: 0, sprints: 0, log: [] };
  const res = st.openPack(s, 'calabozo', false);
  check(res && res.cards.length === 3 && res.cards.every((x) => x.card.rarity !== 'comun') && s.coins === 1000 - 120, 'el sobre calabozo da 3 cartas no comunes y cobra 120');
  const poor = { coins: 10, owned: {}, chapter: 1, wins: {}, opened: 0, sprints: 0, log: [] };
  check(st.openPack(poor, 'basico', false) === null && poor.coins === 10, 'sin malandricoins no hay sobre');
  const dupState = { coins: 100, owned: {}, seen: {}, chapter: 1, wins: {}, opened: 0, sprints: 0, log: [] };
  MI.data.cards.forEach((c) => { dupState.owned[c.id] = 1; });
  const dup = st.openPack(dupState, 'basico', false);
  check(dup.cards.every((x) => x.dup) && dupState.owned[dup.cards[0].card.id] >= 2 && dupState.seen[dup.cards[0].card.id], 'las repetidas se conservan y la carta queda descubierta');
  const before = dupState.coins;
  const got = st.sell(dupState, dup.cards[0].card.id);
  check(got > 0 && dupState.coins === before + got && st.sell(dupState, 'no-existe') === 0, 'vender una repetida paga según rareza');
  const single = { coins: 0, owned: { 'holtrix': 1 }, seen: { 'holtrix': true }, chapter: 1, wins: {}, opened: 0, sprints: 0, log: [] };
  check(st.sell(single, 'holtrix') === 0 && single.owned.holtrix === 1, 'la última copia no se vende');
}

// 10. Campaña: puntos de control al perder y avance al ganar
{
  const st = MI.story, C = MI.data.config.story;
  check(st.checkpointFor(1) === 1 && st.checkpointFor(3) === 1 && st.checkpointFor(4) === 4 && st.checkpointFor(6) === 4 && st.checkpointFor(10) === 7,
    'los puntos de control (' + C.checkpoints.join(', ') + ') se resuelven hacia atrás');
  const base = () => ({ coins: 0, owned: {}, seen: {}, chapter: 6, wins: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 }, opened: 0, sprints: 0, log: [] });
  const ch = C.chapters[5];
  const lose = base(); st.reward(lose, ch, { result: 'loss', resolved: 0, improved: 2, pays: 1 });
  check(lose.chapter === 4, 'perder en el capítulo 6 devuelve al punto de control 4');
  check(Object.keys(lose.owned).length === 0 && lose.coins >= 0, 'perder no quita cartas ni deja el saldo en negativo');
  const win = base(); st.reward(win, ch, { result: 'win', resolved: 4, improved: 1, pays: 3 });
  check(win.chapter === 7 && win.coins > 0, 'ganar avanza al capítulo siguiente y paga');
  const last = base(); last.chapter = C.chapters.length;
  st.reward(last, C.chapters[C.chapters.length - 1], { result: 'win', resolved: 5, improved: 0, pays: 5 });
  check(last.chapter === C.chapters.length && last.finished === 1, 'ganar la auditoría final marca la campaña como terminada');
}

// 11. Frases: nada del nombre del rival escrito a mano (rompía las partidas a dos)
{
  const ph = MI.data.phrases, rivalName = cfg.rival.name;
  const all = [];
  ['win', 'loss', 'draw'].forEach((k) => { (ph[k].title || []).forEach((t) => all.push(t)); (ph[k].phrase || []).forEach((t) => all.push(t)); });
  check(!all.some((t) => t.includes(rivalName)), `ninguna frase lleva "${rivalName}" escrito a mano`);
  check(all.some((t) => t.includes('{rival}')), 'las frases usan el marcador {rival}');
  const fill = (t, r) => t.replace(/\{rival\}/g, r);
  check(fill(ph.loss.title[0], 'Dani#1234') === 'Dani#1234 SE LLEVA EL SPRINT', 'el marcador se sustituye por el rival de la partida');
}

// 12. Desgaste: tres burnouts y el malandrín deja la empresa
{
  const st = MI.story, C = MI.data.config.story, L = C.burnoutLimit;
  const base = () => ({ coins: 0, owned: { 'holtrix': 1, 'vicent-perez': 2, 'daniel-primo': 1 }, seen: {}, strikes: {}, chapter: 1, wins: {}, opened: 0, sprints: 0, log: [] });
  const hand = ['holtrix', 'vicent-perez', 'daniel-primo'];

  // Se quema una vez por sprint: al llegar al límite, fuera
  let s = base(), r;
  for (let i = 1; i <= L; i++) r = st.wearAndTear(s, { hand, cards: { 'holtrix': { burnouts: 1 } } });
  check(!s.owned['holtrix'] || s.owned['holtrix'] === 0, `a los ${L} burnouts la carta deja la empresa`);
  check(r.lost.length === 1 && r.lost[0].card.id === 'holtrix', 'el resumen informa de quién se va');

  // Con dos copias solo se pierde una
  s = base();
  for (let i = 1; i <= L; i++) st.wearAndTear(s, { hand, cards: { 'vicent-perez': { burnouts: 1 } } });
  check(s.owned['vicent-perez'] === 1, 'con dos copias solo se pierde una');

  // El contador vuelve a cero si termina un sprint sin quemarse
  s = base();
  st.wearAndTear(s, { hand, cards: { 'holtrix': { burnouts: L - 1 } } });
  check((s.strikes['holtrix'] || 0) === L - 1, 'el desgaste se acumula dentro de la campaña');
  const warn = st.wearAndTear(s, { hand, cards: {} });
  check(!s.strikes['holtrix'] && s.owned['holtrix'] === 1, 'sobrevivir un sprint entero pone el contador a cero');
  check(warn.lost.length === 0, 'sin burnouts no se pierde a nadie');

  // Aviso de cuerda floja
  s = base();
  const w = st.wearAndTear(s, { hand, cards: { 'holtrix': { burnouts: L - 1 } } });
  check(w.warn.some((x) => x.card.id === 'holtrix' && x.strikes === L - 1), 'avisa de quién está en la cuerda floja');

  // El amo del calabozo no se quema nunca, así que nunca se va
  const dp = MI.data.cards.find((c) => c.id === 'daniel-primo');
  const hard = MI.data.challenges.find((c) => c.id === 'db-breach');
  const res = engine.resolve(dp, hard, { withTwist: true, rng: () => 0 }, cfg);
  check(res.burnout === false, 'Daniel Primo nunca se quema, así que nunca deja la empresa');
}

console.log(failures === 0 ? '\nTodo correcto.' : `\n${failures} fallo(s).`);
process.exit(failures === 0 ? 0 : 1);
