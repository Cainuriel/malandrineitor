/* Parámetros del motor. Todo lo numérico del juego vive aquí. Ver CLAUDE.md, "Fórmula de resolución". */
window.MI = window.MI || {};
MI.data = MI.data || {};

MI.data.config = {
  company: { name: 'Malandriner S.A.', tagline: 'Especialistas en todo tipo de software' },
  rival:   { name: 'Caballerosos S.A.', tagline: 'Software fino como seda medieval' },   // la empresa de la máquina

  // Semilla fija para ofuscar partidas a dos jugadores y firmar el perfil. No es seguridad: evita trampas triviales.
  secret: 'malandrineitor-v1-calabozo',

  skills: {
    defaultValue: 2,       // valor de una habilidad no declarada en la carta
    max: 10
  },

  // Bonus de campeón: score = floor + base * factor. floor >= 10 garantiza que el campeón
  // supera a cualquier carta sin expertise (cuyo máximo es 10).
  champion: { floor: 10, factor: 0.4 },

  // Penalización por criptonita (se multiplica la puntuación).
  kryptonite: { factor: 0.5 },

  // "El factor viernes": dado de N caras, escalado. d6 * 0.5 => 0.5..3 puntos.
  luck: { dieFaces: 6, scale: 0.5 },

  // Umbral de éxito por dificultad (índice = dificultad 1..5).
  thresholds: [null, 4.5, 6, 7.5, 9, 10.5],
  improvedMargin: 2.5,   // total >= umbral - margen => "mejorado"

  points: {
    resolved:    [null, 10, 15, 20, 30, 40],
    improved:    [null, 4, 6, 8, 12, 16],
    complicated: [null, -5, -8, -10, -15, -20],
    payBonus: 5,          // "la paga": para quien obtiene mayor total en el ticket
    startReputation: 50
  },

  burnoutTurns: 2,

  rarities: {
    comun:      { name: 'Común',      weight: 60 },
    rara:       { name: 'Rara',       weight: 27 },
    epica:      { name: 'Épica',      weight: 10 },
    legendaria: { name: 'Legendaria', weight: 3 }
  },

  arcade: {
    handSize: 5,
    tickets: 5,
    aiLevel: 'senior'    // junior | senior | cto
  },

  // Puntos malandrín (acumulables en el perfil). Se suman a la reputación de la partida.
  scoring: {
    resolved: 3, improved: 1,
    champion: 3,            // resolver siendo campeón de la tecnología
    twistSurvived: 4,       // resolver un ticket con giro
    kryptoniteDefied: 6,    // resolver pese a la criptonita
    perfectFriday: 2,       // resolver con un 6 en el dado
    hardTicket: 5,          // resolver dificultad 4 o 5
    pay: 2,                 // llevarse la paga
    streak3: 5,             // tres resueltos seguidos
    rescue: 3,              // usar el rescate del calabozo
    noBurnout: 10,          // sprint sin ningún burnout
    allPays: 15,            // llevarse todas las pagas del sprint
    win: 20, draw: 5,
    levelFactor: { junior: 0.8, senior: 1, cto: 1.3 }   // multiplicador final contra la máquina
  },

  // Modo historia
  story: {
    startCoins: 40,
    starterPack: 'bienvenida',
    rewards: { resolved: 8, improved: 3, complicated: 0, pay: 2, win: 30, chapterFirstWin: 50 },
    sellPrice: { comun: 4, rara: 10, epica: 25, legendaria: 80 },   // venta manual de una carta repetida
    // Qué pasa al perder un sprint (la colección y los malandricoins se conservan siempre):
    //   'checkpoint' -> vuelves al último punto de control alcanzado (config.story.checkpoints)
    //   'restart'    -> vuelves al capítulo 1
    //   'retry'      -> repites el mismo capítulo
    onLoss: 'checkpoint',
    checkpoints: [1, 4, 7],   // capítulos que actúan como punto de control al superarlos
    packs: {
      bienvenida: { name: 'Sobre de bienvenida', price: 0, cards: [5, 5], weights: { comun: 70, rara: 28, epica: 2, legendaria: 0 }, hidden: true, desc: 'Cinco cartas distintas para empezar. Cortesía de recepción.' },
      basico:   { name: 'Sobre básico',   price: 30,  cards: [1, 2], weights: { comun: 72, rara: 25, epica: 3,  legendaria: 0 }, desc: 'Una o dos cartas. Lo que hay en el cajón de recepción.' },
      pro:      { name: 'Sobre pro',      price: 60,  cards: [2, 3], weights: { comun: 45, rara: 40, epica: 13, legendaria: 2 }, desc: 'Dos o tres cartas. Alguien ha ido a la papelería buena.' },
      calabozo: { name: 'Sobre calabozo', price: 120, cards: [3, 3], weights: { comun: 0,  rara: 55, epica: 37, legendaria: 8 }, desc: 'Tres cartas, ninguna común. Huele a mazmorra y a café.' }
    },
    chapters: [
      { id: 1,  name: 'Prácticas en Malandriner S.A.',       level: 'junior', maxDifficulty: 2, rivalRarity: ['comun'],                 desc: 'Enfrente mandan becarios, pero con modales. Tú también mandas becarios.' },
      { id: 2,  name: 'Primer cliente serio',                level: 'junior', maxDifficulty: 3, rivalRarity: ['comun', 'rara'],         desc: 'Tickets con giro. Los de enfrente han fichado a alguien con barba y con reverencia.' },
      { id: 3,  name: 'La tienda de los 40.000 productos',   level: 'senior', maxDifficulty: 3, rivalRarity: ['comun', 'rara'],         desc: 'Nadie sabe dónde está el ERP. La competencia tampoco, aunque lo niega con elegancia.' },
      { id: 4,  name: 'Semana de incidentes',                level: 'senior', maxDifficulty: 4, rivalRarity: ['rara'],                  desc: 'Todo se cae a la vez. Enfrente ya han mandado seniors y una nota manuscrita.' },
      { id: 5,  name: 'El cliente que paga tarde',           level: 'senior', minDifficulty: 2, maxDifficulty: 4, rivalRarity: ['rara', 'epica'], desc: 'Mucho alcance, poco presupuesto y una servilleta por especificación.' },
      { id: 6,  name: 'La migración imposible',              level: 'cto',    minDifficulty: 3, maxDifficulty: 5, rivalRarity: ['rara', 'epica'], desc: 'Symfony 2.8, Java 8 y un COBOL que nadie confiesa.' },
      { id: 7,  name: 'Guardia de agosto',                   level: 'cto',    minDifficulty: 3, maxDifficulty: 5, rivalRarity: ['epica'],          desc: 'Toda la oficina de vacaciones. Todos los servidores despiertos.' },
      { id: 8,  name: 'Fuga de datos',                       level: 'cto',    minDifficulty: 3, maxDifficulty: 5, rivalRarity: ['epica'],          desc: 'Seguridad, cumplimiento y una llamada de la AEPD.' },
      { id: 9,  name: 'La startup del cuñado',               level: 'cto',    minDifficulty: 4, maxDifficulty: 5, rivalRarity: ['epica', 'legendaria'], desc: 'Tres pivotes, algo con IA y una demo el lunes.' },
      { id: 10, name: 'La auditoría final',                  level: 'cto',    minDifficulty: 4, maxDifficulty: 5, rivalRarity: ['epica', 'legendaria'], desc: 'El CTO de la competencia juega en persona. Viene con su propio calabozo y con guantes.' }
    ]
  },

  // Interruptores de demostración. Quitar antes de compartir con la comunidad.
  demo: {
    revealAllButton: true    // botón "Descubrir toda la colección" en el álbum
  },

  ai: {
    // Ruido añadido a la evaluación de cada carta (desviación en puntos) y probabilidad de jugada aleatoria.
    junior: { noise: 3.0, randomPick: 0.35 },
    senior: { noise: 1.0, randomPick: 0.05 },
    cto:    { noise: 0.0, randomPick: 0.0 }
  }
};
