/* Puntos malandrín: elementos que puntúan además de la reputación, para dar variedad al marcador.
   Puro. Parámetros en config.scoring. Devuelve listas de { label, points } para mostrar el desglose. */
(function (root) {
  const S = {};
  const cfg = () => root.MI.data.config.scoring;

  // Puntos de un ticket. r: resultado de engine.resolve (o { nobody: true }); ctx: { challenge, pay, streak, rescued }
  S.ticket = function (r, ctx) {
    const c = cfg(); const items = [];
    if (ctx.rescued) items.push({ label: 'Rescate del calabozo', points: c.rescue });
    if (!r || r.nobody) return items;
    if (r.outcome === 'resolved') {
      items.push({ label: 'Ticket resuelto', points: c.resolved });
      if (r.champion) items.push({ label: 'Campeón de la tecnología', points: c.champion });
      if (r.withTwist && ctx.challenge.twist) items.push({ label: 'Giro superado', points: c.twistSurvived });
      if (r.kryptonite) items.push({ label: 'Criptonita desafiada', points: c.kryptoniteDefied });
      if (r.die >= root.MI.data.config.luck.dieFaces) items.push({ label: 'Viernes perfecto', points: c.perfectFriday });
      if (ctx.challenge.difficulty >= 4) items.push({ label: 'Ticket de los gordos', points: c.hardTicket });
      if (ctx.streak >= 3) items.push({ label: 'Racha de ' + ctx.streak, points: c.streak3 });
    } else if (r.outcome === 'improved') {
      items.push({ label: 'Parche puesto', points: c.improved });
    }
    if (ctx.pay) items.push({ label: 'La paga', points: c.pay });
    return items;
  };

  // Puntos de fin de sprint. s: { result: 'win'|'loss'|'draw', burnouts, pays, tickets, level }
  S.sprint = function (s) {
    const c = cfg(); const items = [];
    if (s.burnouts === 0) items.push({ label: 'Sprint sin burnout', points: c.noBurnout });
    if (s.pays === s.tickets && s.tickets > 0) items.push({ label: 'Pleno de pagas', points: c.allPays });
    if (s.result === 'win') items.push({ label: 'Victoria', points: c.win });
    if (s.result === 'draw') items.push({ label: 'Empate', points: c.draw });
    return items;
  };

  S.total = function (items, level) {
    const f = (level && cfg().levelFactor[level]) || 1;
    return Math.round(items.reduce((a, i) => a + i.points, 0) * f);
  };

  root.MI = root.MI || {};
  root.MI.scoring = S;
})(typeof window !== 'undefined' ? window : globalThis);
