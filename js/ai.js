/* Oponente heurístico. Puro. Elige la carta de su mano con mejor puntuación esperada,
   con ruido y jugadas aleatorias según el nivel (config.ai). Reserva las cartas de más valor
   para retos difíciles cuando el margen lo permite. */
(function (root) {
  const ai = {};

  ai.choose = function (hand, challenge, level, rng, cfg, engine) {
    const p = cfg.ai[level] || cfg.ai.senior;
    const rnd = rng || Math.random;
    if (hand.length === 0) return null;
    if (rnd() < p.randomPick) return hand[Math.floor(rnd() * hand.length)];

    const threshold = cfg.thresholds[challenge.difficulty];
    let best = null, bestValue = -Infinity;
    hand.forEach((card) => {
      // Valor esperado sin conocer el giro (la IA no hace trampas): evalúa sin twist.
      const ev = engine.evaluate(card, challenge, { withTwist: false }, cfg);
      const expected = ev.score + ((cfg.luck.dieFaces + 1) / 2) * cfg.luck.scale;
      let value = expected;
      // Si ya supera el umbral con holgura, prefiere no gastar cartas raras en retos fáciles.
      const surplus = expected - threshold;
      const rarityCost = { comun: 0, rara: 0.3, epica: 0.8, legendaria: 1.5 }[card.rarity] || 0;
      if (surplus > 2) value -= rarityCost;
      value += (rnd() * 2 - 1) * p.noise;
      if (value > bestValue) { bestValue = value; best = card; }
    });
    return best;
  };

  root.MI = root.MI || {};
  root.MI.ai = ai;
})(typeof window !== 'undefined' ? window : globalThis);
