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

  engine.evaluate = function (card, challenge, opts, cfg) {
    opts = opts || {};
    const useAbilities = opts.abilities !== false;
    // Habilidad "hydration": ignora el giro. "no_weakness": ignora el giro también.
    let withTwist = !!opts.withTwist;
    if (useAbilities && engine.hasAbility(card, 'no_weakness')) withTwist = false;
    if (useAbilities && engine.hasAbility(card, 'researcher') && (challenge.skills || {}).rd) withTwist = false;

    const weights = effectiveWeights(challenge, withTwist);
    const tech = effectiveTech(challenge, withTwist);

    let sumW = 0, acc = 0;
    for (const k in weights) { sumW += weights[k]; acc += weights[k] * engine.skillValue(card, k, cfg); }
    const base = sumW > 0 ? acc / sumW : 0;

    let score = base;
    let champion = !!(tech && card.expertise === tech);
    if (!champion && useAbilities && engine.hasAbility(card, 'mentor') && weights.teaching) champion = true;
    if (champion) score = cfg.champion.floor + base * cfg.champion.factor;

    let kryptonite = false;
    if (card.kryptonite && !(useAbilities && engine.hasAbility(card, 'dungeon_master'))) {
      if (card.kryptonite.tech && tech && card.kryptonite.tech === tech) kryptonite = true;
      if (card.kryptonite.skill && topSkill(weights) === card.kryptonite.skill) kryptonite = true;
    }
    if (kryptonite) score *= cfg.kryptonite.factor;

    return { base, score, champion, kryptonite, weights, tech, withTwist };
  };

  engine.resolve = function (card, challenge, opts, cfg) {
    opts = opts || {};
    const rnd = opts.rng || Math.random;
    const ev = engine.evaluate(card, challenge, opts, cfg);

    let die = 1 + Math.floor(rnd() * cfg.luck.dieFaces);
    if (opts.abilities !== false && engine.hasAbility(card, 'autoscaling') && challenge.difficulty >= 4) die = Math.min(cfg.luck.dieFaces, die + 1);
    if (opts.abilities !== false && engine.hasAbility(card, 'reactionary') && challenge.tech === 'react') die = Math.min(cfg.luck.dieFaces, die + 2);
    const luck = die * cfg.luck.scale;

    const total = ev.score + luck;
    const threshold = cfg.thresholds[challenge.difficulty];
    let outcome;
    if (total >= threshold) outcome = 'resolved';
    else if (total >= threshold - cfg.improvedMargin) outcome = 'improved';
    else outcome = 'complicated';
    if (outcome === 'improved' && opts.abilities !== false && engine.hasAbility(card, 'craftsman') && challenge.difficulty <= 2) outcome = 'resolved';

    const points = cfg.points[outcome][challenge.difficulty];
    let burnout = outcome === 'complicated';
    if (burnout && opts.abilities !== false && (engine.hasAbility(card, 'dungeon_master') || engine.hasAbility(card, 'agent_swarm'))) burnout = false;

    return Object.assign(ev, { die, luck, total, threshold, outcome, points, burnout });
  };

  engine.outcomeLabel = { resolved: 'Resuelto', improved: 'Mejorado', complicated: 'Complicado' };

  // Habilidades activas: el rescate del amo del calabozo. Devuelve true si la carta puede rescatar.
  engine.canRescue = function (hand, burnout, usedRescue) {
    if (usedRescue) return false;
    const dm = hand.find((c) => engine.hasAbility(c, 'dungeon_master') && !burnout[c.id]);
    return !!dm && Object.keys(burnout).some((id) => hand.some((c) => c.id === id));
  };

  // Validación de los catálogos: referencias huérfanas, rangos, reglas de negocio.
  engine.validate = function (data) {
    const errors = [];
    const skillIds = new Set(data.skills.map((s) => s.id));
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
