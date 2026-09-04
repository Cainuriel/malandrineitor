/* Motor de resolución. Puro: no toca el DOM. Usable en navegador y en Node (tests/run.js).
   API:
     MI.engine.validate(data)                       -> { ok, errors[] }
     MI.engine.skillValue(card, skillId, cfg)        -> número
     MI.engine.evaluate(card, challenge, opts, cfg)  -> { base, score, champion, kryptonite, weights }
     MI.engine.resolve(card, challenge, opts, cfg)   -> evaluate + { luck, total, threshold, outcome, points }
   opts: { withTwist: bool, rng: fn, abilities: bool }
*/
(function (root) {
  const engine = {};

  function effectiveWeights(challenge, withTwist) {
    const w = Object.assign({}, challenge.skills || {});
    if (withTwist && challenge.twist && challenge.twist.skills) {
      for (const k in challenge.twist.skills) w[k] = (w[k] || 0) + challenge.twist.skills[k];
    }
    return w;
  }

  function effectiveTech(challenge, withTwist) {
    if (withTwist && challenge.twist && challenge.twist.tech) return challenge.twist.tech;
    return challenge.tech || null;
  }

  function topSkill(weights) {
    let best = null, bw = -1;
    for (const k in weights) if (weights[k] > bw) { bw = weights[k]; best = k; }
    return best;
  }

  engine.skillValue = function (card, skillId, cfg) {
    const v = card.skills && card.skills[skillId];
    return typeof v === 'number' ? v : cfg.skills.defaultValue;
  };

  engine.hasAbility = function (card, abilityId) {
    return !!(card.ability && card.ability.id === abilityId);
  };

  /* ---------- Habilidades de las épicas, dirigidas por datos ----------
     Antes cada habilidad era una línea codificada a mano en este fichero, y eso las
     condenaba a ser estrechas: la de Symfony se activaba en 1 ticket de 141. Ahora la
     habilidad declara su efecto en la propia carta y ajustarla es editar `data/cards.js`.

     Un efecto es `{ <tipo>, when }`. Tipos:
       die: n         suma n al factor viernes (tope: las caras del dado)
       noTwist: true  ignora el giro del ticket, salga mejor o peor
       twistProof     el giro nunca le perjudica: se queda con la mejor de las dos
                      versiones del ticket. Es lo que se quiere casi siempre, porque
                      `noTwist` a secas puede empeorar la jugada cuando el giro añade
                      justo las habilidades que la carta domina (medido: a Sergi Edo le
                      bajaba del 24% al 23% de tickets resueltos)
       champion: true cuenta como campeón aunque la tecnología no sea la suya
       noKryptonite   su criptonita no le penaliza
       upgrade: true  un "parche puesto" pasa a "resuelto"

     `when` acota cuándo se aplica; sin `when`, siempre:
       techs: [...]        la tecnología del ticket es alguna de estas
       skills: [...]       el ticket pide alguna de estas habilidades
       minDifficulty / maxDifficulty
     Con `techs` y `skills` a la vez basta con que se cumpla una de las dos: así se
     cubren familias enteras (todo el PHP, todo el front) en vez de una sola etiqueta.

     Un matiz que importa: `noTwist` se decide ANTES de aplicar el giro, así que su
     `when` mira el ticket tal como viene; los demás miran el ticket ya resuelto, con
     el giro aplicado si lo hubiera. Si no, un giro que cambia la tecnología decidiría
     si se ignora ese mismo giro. */
  function effectsOf(card) {
    const a = card && card.ability;
    if (!a) return [];
    if (Array.isArray(a.effects)) return a.effects;
    return a.effect ? [a.effect] : [];
  }

  function matchWhen(when, challenge, tech, weights) {
    if (!when) return true;
    if (when.minDifficulty && challenge.difficulty < when.minDifficulty) return false;
    if (when.maxDifficulty && challenge.difficulty > when.maxDifficulty) return false;
    const pideTech = !!(when.techs && when.techs.length);
    const pideSkill = !!(when.skills && when.skills.length);
    if (!pideTech && !pideSkill) return true;
    if (pideTech && tech && when.techs.indexOf(tech) >= 0) return true;
    if (pideSkill && when.skills.some((k) => (weights || {})[k])) return true;
    return false;
  }

  // Efectos que se cumplen ahora mismo, de un tipo concreto.
  function activeEffects(card, kind, challenge, tech, weights) {
    return effectsOf(card).filter((e) => e[kind] !== undefined && e[kind] !== false && matchWhen(e.when, challenge, tech, weights));
  }

  engine.evaluate = function (card, challenge, opts, cfg) {
    opts = opts || {};
    const useAbilities = opts.abilities !== false;

    // El giro se decide sobre el ticket sin retorcer (ver el comentario de arriba).
    let withTwist = !!opts.withTwist;
    if (useAbilities && activeEffects(card, 'noTwist', challenge, challenge.tech, challenge.skills).length) withTwist = false;

    // "El giro nunca le perjudica": se calculan las dos versiones del ticket y se
    // devuelve la mejor. `_twistDone` corta la recursión; el resto de habilidades
    // (campeón, criptonita) se siguen aplicando en las dos ramas.
    if (withTwist && useAbilities && !opts._twistDone
        && activeEffects(card, 'twistProof', challenge, challenge.tech, challenge.skills).length) {
      const base = { abilities: opts.abilities, _twistDone: true };
      const con = engine.evaluate(card, challenge, Object.assign({ withTwist: true }, base), cfg);
      const sin = engine.evaluate(card, challenge, Object.assign({ withTwist: false }, base), cfg);
      return sin.score > con.score ? sin : con;
    }

    const weights = effectiveWeights(challenge, withTwist);
    const tech = effectiveTech(challenge, withTwist);

    let sumW = 0, acc = 0;
    for (const k in weights) { sumW += weights[k]; acc += weights[k] * engine.skillValue(card, k, cfg); }
    const base = sumW > 0 ? acc / sumW : 0;

    let score = base;
    let champion = !!(tech && card.expertise === tech);
    if (!champion && useAbilities && activeEffects(card, 'champion', challenge, tech, weights).length) champion = true;
    if (champion) score = cfg.champion.floor + base * cfg.champion.factor;

    let kryptonite = false;
    const inmune = useAbilities && activeEffects(card, 'noKryptonite', challenge, tech, weights).length;
    if (card.kryptonite && !inmune) {
      if (card.kryptonite.tech && tech && card.kryptonite.tech === tech) kryptonite = true;
      if (card.kryptonite.skill && topSkill(weights) === card.kryptonite.skill) kryptonite = true;
    }
    if (kryptonite) score *= cfg.kryptonite.factor;

    return { base, score, champion, kryptonite, weights, tech, withTwist };
  };

  engine.resolve = function (card, challenge, opts, cfg) {
    opts = opts || {};
    const rnd = opts.rng || Math.random;
    const useAbilities = opts.abilities !== false;
    const ev = engine.evaluate(card, challenge, opts, cfg);

    // El dado se tira siempre igual y solo después se le suman los bonos: así una
    // partida a dos se reproduce con el dado guardado, pase lo que pase con las cartas.
    let die = 1 + Math.floor(rnd() * cfg.luck.dieFaces);
    if (useAbilities) {
      const bono = activeEffects(card, 'die', challenge, ev.tech, ev.weights).reduce((n, e) => n + (e.die || 0), 0);
      if (bono) die = Math.max(1, Math.min(cfg.luck.dieFaces, die + bono));
    }
    const luck = die * cfg.luck.scale;

    const total = ev.score + luck;
    const threshold = cfg.thresholds[challenge.difficulty];
    let outcome;
    if (total >= threshold) outcome = 'resolved';
    else if (total >= threshold - cfg.improvedMargin) outcome = 'improved';
    else outcome = 'complicated';
    if (outcome === 'improved' && useAbilities && activeEffects(card, 'upgrade', challenge, ev.tech, ev.weights).length) outcome = 'resolved';

    const points = cfg.points[outcome][challenge.difficulty];
    // Las legendarias no se queman: es su rasgo de rareza, y de ninguna otra.
    // Ver config.legendary.noBurnout y CLAUDE.md, "Superpoderes de las legendarias".
    let burnout = outcome === 'complicated';
    if (burnout && card.rarity === 'legendaria' && (cfg.legendary || {}).noBurnout !== false) burnout = false;

    return Object.assign(ev, { die, luck, total, threshold, outcome, points, burnout });
  };

  engine.outcomeLabel = { resolved: 'Resuelto', improved: '¡Parche puesto!', complicated: 'Complicado' };

  /* ---------- Superpoderes de las legendarias ----------
     Cada carta legendaria tiene un `power` propio, además de su `ability` pasiva.
     Hay dos clases, y se distinguen porque se usan en momentos distintos:

       kind: 'active'  se activa durante la partida, desde un botón, y se gasta.
                       Hoy solo existe 'rescue' (Daniel Primo).
       kind: 'roster'  no se pulsa: cambia las reglas al formar la plantilla.
                       Hoy solo existe 'extra_slot' (Yuri).

     Añadir un superpoder nuevo es añadir su `power` a la carta y su caso aquí. El
     botón de la partida es el mismo para todos: lee el poder de la carta y usa su
     etiqueta, así que un poder activo nuevo no toca la interfaz. */
  // Superpoderes que el motor sabe aplicar, con su tipo. Añadir uno pasa por aquí.
  const POWERS = { rescue: 'active', extra_slot: 'roster' };
  const EFFECT_KINDS = ['die', 'noTwist', 'twistProof', 'champion', 'noKryptonite', 'upgrade'];
  engine.POWERS = POWERS;

  engine.powerOf = function (card) { return (card && card.power) || null; };
  engine.hasPower = function (card, powerId) { return !!(card && card.power && card.power.id === powerId); };

  // Portador disponible de un poder activo: en mano, sin quemar y con usos pendientes.
  engine.powerHolder = function (hand, burnout, used, powerId) {
    return hand.find((c) => engine.hasPower(c, powerId) && !burnout[c.id] && !(used || {})[c.id]) || null;
  };

  // ¿Se puede activar ahora mismo un poder activo? Cada poder pone su condición.
  engine.canUsePower = function (hand, burnout, used, powerId) {
    const holder = engine.powerHolder(hand, burnout, used, powerId);
    if (!holder) return false;
    if (powerId === 'rescue') return Object.keys(burnout || {}).some((id) => hand.some((c) => c.id === id));
    return true;
  };

  // Poderes activos que hay ahora mismo en la mano, con su carta y si se pueden usar.
  engine.activePowers = function (hand, burnout, used) {
    return hand
      .filter((c) => c.power && c.power.kind === 'active')
      .map((c) => ({ card: c, power: c.power, usable: engine.canUsePower(hand, burnout, used, c.power.id) }));
  };

  // Plazas extra en la plantilla que aportan las cartas elegidas (poder 'extra_slot').
  engine.extraSlots = function (cards) {
    return (cards || []).reduce((n, c) => n + (engine.hasPower(c, 'extra_slot') ? (c.power.value || 1) : 0), 0);
  };

  // Compatibilidad: el rescate del calabozo es el primer poder activo y su nombre
  // sigue vivo en el protocolo a dos jugadores (`plays[i].rescue`).
  engine.canRescue = function (hand, burnout, usedRescue) {
    if (usedRescue) return false;
    return engine.canUsePower(hand, burnout, {}, 'rescue');
  };

  // Validación de los catálogos: referencias huérfanas, rangos, reglas de negocio.
  engine.validate = function (data) {
    const errors = [];
    const skillIds = new Set(data.skills.map((s) => s.id));
    const powerIds = new Set();
    const techIds = new Set(data.techs.map((t) => t.id));
    const rarities = new Set(Object.keys(data.config.rarities));
    const cardIds = new Set();

    if (data.config.champion.floor < data.config.skills.max) errors.push('config.champion.floor debe ser >= config.skills.max para garantizar la regla del campeón.');

    data.cards.forEach((c) => {
      const p = `carta ${c.id}`;
      if (!c.id || cardIds.has(c.id)) errors.push(`${p}: id ausente o duplicado`);
      cardIds.add(c.id);
      if (!c.name) errors.push(`${p}: sin nombre`);
      if (!rarities.has(c.rarity)) errors.push(`${p}: rareza desconocida "${c.rarity}"`);
      if (!techIds.has(c.expertise)) errors.push(`${p}: expertise desconocida "${c.expertise}"`);
      if (!c.skills || typeof c.skills.spec_driven !== 'number') errors.push(`${p}: debe declarar spec_driven`);
      for (const k in c.skills || {}) {
        if (!skillIds.has(k)) errors.push(`${p}: habilidad desconocida "${k}"`);
        const v = c.skills[k];
        if (typeof v !== 'number' || v < 1 || v > data.config.skills.max) errors.push(`${p}: valor fuera de rango en "${k}"`);
      }
      if (c.kryptonite) {
        if (c.kryptonite.tech && !techIds.has(c.kryptonite.tech)) errors.push(`${p}: criptonita tech desconocida`);
        if (c.kryptonite.skill && !skillIds.has(c.kryptonite.skill)) errors.push(`${p}: criptonita skill desconocida`);
        if (c.kryptonite.tech && c.kryptonite.tech === c.expertise) errors.push(`${p}: expertise y criptonita no pueden coincidir`);
      }
      if (c.ability && (c.rarity === 'comun' || c.rarity === 'rara')) errors.push(`${p}: solo épicas y legendarias tienen habilidad especial`);
      if (c.rarity === 'epica' && !c.ability) errors.push(`${p}: toda épica debe tener habilidad`);
      // Los efectos se declaran en la carta: si están mal escritos no hacen nada y no
      // se notaría jugando, así que se comprueban aquí.
      const efectos = c.ability ? (Array.isArray(c.ability.effects) ? c.ability.effects : (c.ability.effect ? [c.ability.effect] : [])) : [];
      if (c.ability && !efectos.length) errors.push(`${p}: la habilidad "${c.ability.id}" no declara ningún efecto`);
      efectos.forEach((e, i) => {
        const q = `${p}: efecto ${i + 1} de "${c.ability.id}"`;
        const tipos = EFFECT_KINDS.filter((k) => e[k] !== undefined);
        if (!tipos.length) errors.push(`${q}: no hace nada (tipos válidos: ${EFFECT_KINDS.join(', ')})`);
        Object.keys(e).forEach((k) => { if (k !== 'when' && EFFECT_KINDS.indexOf(k) < 0) errors.push(`${q}: propiedad desconocida "${k}"`); });
        if (e.die !== undefined && (typeof e.die !== 'number' || e.die < 1 || e.die > data.config.luck.dieFaces)) errors.push(`${q}: el bono al dado debe estar entre 1 y ${data.config.luck.dieFaces}`);
        // Inmunidad al burnout: es rasgo de rareza, ninguna habilidad puede darla.
        if (e.noBurnout !== undefined) errors.push(`${q}: el burnout lo decide la rareza, no una habilidad`);
        const w = e.when;
        if (w) {
          Object.keys(w).forEach((k) => { if (['techs', 'skills', 'minDifficulty', 'maxDifficulty'].indexOf(k) < 0) errors.push(`${q}: condición desconocida "${k}"`); });
          (w.techs || []).forEach((t) => { if (!techIds.has(t)) errors.push(`${q}: tecnología desconocida "${t}"`); });
          (w.skills || []).forEach((k) => { if (!skillIds.has(k)) errors.push(`${q}: habilidad desconocida "${k}"`); });
          if ((w.techs && !w.techs.length) || (w.skills && !w.skills.length)) errors.push(`${q}: lista de condiciones vacía`);
        }
      });
      // Superpoderes: exclusivos de las legendarias, uno por carta y sin repetir.
      if (c.power) {
        if (c.rarity !== 'legendaria') errors.push(`${p}: solo las legendarias tienen superpoder`);
        if (!POWERS[c.power.id]) errors.push(`${p}: superpoder desconocido "${c.power.id}"`);
        else if (POWERS[c.power.id] !== c.power.kind) errors.push(`${p}: el superpoder "${c.power.id}" es de tipo ${POWERS[c.power.id]}, no ${c.power.kind}`);
        if (!c.power.name || !c.power.text) errors.push(`${p}: el superpoder necesita nombre y descripción`);
        if (powerIds.has(c.power.id)) errors.push(`${p}: el superpoder "${c.power.id}" ya lo tiene otra carta`);
        powerIds.add(c.power.id);
      }
    });

    const chIds = new Set();
    data.challenges.forEach((ch) => {
      const p = `reto ${ch.id}`;
      if (!ch.id || chIds.has(ch.id)) errors.push(`${p}: id ausente o duplicado`);
      chIds.add(ch.id);
      if (ch.tech && !techIds.has(ch.tech)) errors.push(`${p}: tech desconocida "${ch.tech}"`);
      if (!(ch.difficulty >= 1 && ch.difficulty <= 5)) errors.push(`${p}: dificultad fuera de 1..5`);
      const n = Object.keys(ch.skills || {}).length;
      if (n === 0 || n > 4) errors.push(`${p}: entre 1 y 4 habilidades`);
      for (const k in ch.skills || {}) if (!skillIds.has(k)) errors.push(`${p}: habilidad desconocida "${k}"`);
      if (ch.twist) {
        for (const k in ch.twist.skills || {}) if (!skillIds.has(k)) errors.push(`${p}: giro con habilidad desconocida "${k}"`);
        if (ch.twist.tech && !techIds.has(ch.twist.tech)) errors.push(`${p}: giro con tech desconocida`);
      }
    });

    (data.optout || []).forEach((id) => { if (!cardIds.has(id)) errors.push(`optout: id desconocido "${id}"`); });

    return { ok: errors.length === 0, errors };
  };

  root.MI = root.MI || {};
  root.MI.engine = engine;
})(typeof window !== 'undefined' ? window : globalThis);
