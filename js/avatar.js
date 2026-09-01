/* Avatares SVG procedurales y deterministas. La semilla es card.id, así el retrato de cada
   malandrín es siempre el mismo. Estilo plano, sin pretensión de parecido: es un "personaje de juego".
   MI.avatar.svg(card, opts) -> string SVG (viewBox 0 0 200 200) */
window.MI = window.MI || {};

MI.avatar = (function () {
  const SKIN = ['#f5d0b0', '#e8b894', '#d29a72', '#b57a53', '#8d5a3c', '#6b4130', '#f7dcc4', '#c98e6a'];
  const HAIR = ['#1b1b1f', '#3b2a20', '#5a3d2b', '#8b5a2b', '#c48a3f', '#d9c27e', '#6e6e73', '#e5e5ea', '#b23a48', '#3d5a80'];
  const BG   = ['#1f2a44', '#2d1f44', '#1f3d3a', '#44261f', '#1f2f44', '#3a1f44', '#22343c', '#3b3320'];

  function pickers(seed) {
    const r = MI.util.rng(MI.util.hash('avatar:' + seed));
    return { r, pick: (arr) => arr[Math.floor(r() * arr.length)], chance: (p) => r() < p };
  }

  // Peinados: paths sobre una cabeza centrada en (100,95), radio ~46.
  const HAIRS = [
    (c) => `<path fill="${c}" d="M54 92 C54 55 80 42 100 42 C120 42 146 55 146 92 L146 84 C140 70 120 60 100 60 C80 60 60 70 54 84 Z"/>`, // corto
    (c) => `<path fill="${c}" d="M52 100 C50 50 90 36 112 40 C140 44 150 66 148 100 C144 84 136 74 128 72 C120 78 112 70 104 66 C92 70 84 82 80 84 C70 82 60 86 52 100 Z"/>`, // despeinado
    (c) => `<path fill="${c}" d="M50 96 C48 50 80 34 100 36 C124 36 152 52 150 98 C150 120 142 140 142 150 L128 150 C132 130 134 110 126 92 C112 96 96 88 88 78 C80 90 66 100 62 112 C60 124 60 140 58 150 L44 150 C48 130 50 110 50 96 Z"/>`, // media melena
    (c) => `<circle cx="70" cy="60" r="12" fill="${c}"/><circle cx="88" cy="48" r="13" fill="${c}"/><circle cx="108" cy="46" r="13" fill="${c}"/><circle cx="128" cy="54" r="12" fill="${c}"/><circle cx="138" cy="72" r="11" fill="${c}"/><circle cx="60" cy="78" r="11" fill="${c}"/><path fill="${c}" d="M58 80 C64 56 88 44 106 44 C126 44 142 58 142 80 Z"/>`, // rizado
    (c) => `<path fill="${c}" d="M56 90 C56 60 78 46 100 46 C122 46 144 60 144 90 C138 78 124 70 100 70 C76 70 62 78 56 90 Z"/><path fill="${c}" d="M140 92 C150 96 150 116 140 118 Z"/><path fill="${c}" d="M60 92 C50 96 50 116 60 118 Z"/>`, // corto con patillas
    (c) => `<path fill="#2b2f3a" d="M52 92 C52 58 76 40 100 40 C124 40 148 58 148 92 L152 92 C158 92 160 100 154 102 L46 102 C40 100 42 92 48 92 Z"/><path fill="#3d4352" d="M60 76 C70 60 84 52 100 52 C116 52 130 60 140 76 Z"/>`, // gorro
    () => '', // rapado
    (c) => `<path fill="${c}" d="M56 96 C54 58 78 40 100 40 C122 40 146 58 144 96 C142 92 138 86 136 82 C118 86 92 84 66 84 C62 86 58 92 56 96 Z"/><rect x="60" y="80" width="80" height="8" rx="4" fill="${c}"/>` // flequillo recto
  ];

  function glasses(kind) {
    if (kind === 'round') return `<g fill="none" stroke="#1b1b1f" stroke-width="3"><circle cx="82" cy="98" r="11"/><circle cx="118" cy="98" r="11"/><path d="M93 98 H107"/><path d="M71 96 L60 92"/><path d="M129 96 L140 92"/></g>`;
    if (kind === 'square') return `<g fill="none" stroke="#1b1b1f" stroke-width="3"><rect x="69" y="88" width="24" height="18" rx="4"/><rect x="107" y="88" width="24" height="18" rx="4"/><path d="M93 96 H107"/><path d="M69 94 L60 92"/><path d="M131 94 L140 92"/></g>`;
    return '';
  }

  function beard(kind, c) {
    if (kind === 'full') return `<path fill="${c}" d="M62 108 C64 136 80 150 100 150 C120 150 136 136 138 108 C132 122 118 126 100 126 C82 126 68 122 62 108 Z"/>`;
    if (kind === 'goatee') return `<path fill="${c}" d="M86 126 C90 140 110 140 114 126 C108 132 92 132 86 126 Z"/>`;
    if (kind === 'stubble') return `<path fill="${c}" opacity="0.35" d="M64 110 C68 134 82 146 100 146 C118 146 132 134 136 110 C130 122 118 126 100 126 C82 126 70 122 64 110 Z"/>`;
    return '';
  }

  function svg(card, opts) {
    opts = opts || {};
    const P = pickers(card.id || card.name);
    const skin = P.pick(SKIN);
    const hairC = P.pick(HAIR);
    const bg = P.pick(BG);
    const hairFn = P.pick(HAIRS);
    const gl = P.chance(0.45) ? P.pick(['round', 'square']) : '';
    const bd = P.chance(0.5) ? P.pick(['full', 'goatee', 'stubble']) : '';
    const smile = P.chance(0.7);
    const shirt = opts.accent || '#4cc9f0';
    const shirt2 = P.pick(['#ffffff', '#0b1020', '#e0e1dd']);
    const eyeY = 98;
    const brow = P.chance(0.5) ? 'M72 86 Q82 82 92 86' : 'M72 84 Q82 84 92 86';
    const brow2 = P.chance(0.5) ? 'M108 86 Q118 82 128 86' : 'M108 86 Q118 84 128 84';
    const dots = [];
    for (let i = 0; i < 14; i++) dots.push(`<circle cx="${Math.floor(P.r() * 200)}" cy="${Math.floor(P.r() * 200)}" r="${(1 + P.r() * 2).toFixed(1)}" fill="#ffffff" opacity="${(0.05 + P.r() * 0.12).toFixed(2)}"/>`);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Avatar de ${card.name}">
  <defs>
    <linearGradient id="bg-${card.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#0b1020"/>
    </linearGradient>
    <clipPath id="clip-${card.id}"><rect width="200" height="200" rx="14"/></clipPath>
  </defs>
  <g clip-path="url(#clip-${card.id})">
    <rect width="200" height="200" fill="url(#bg-${card.id})"/>
    <circle cx="100" cy="110" r="78" fill="${shirt}" opacity="0.12"/>
    ${dots.join('')}
    <!-- cuerpo -->
    <path fill="${shirt}" d="M30 200 C30 160 60 146 100 146 C140 146 170 160 170 200 Z"/>
    <path fill="${shirt2}" opacity="0.9" d="M86 150 L100 172 L114 150 L108 148 L100 160 L92 148 Z"/>
    <!-- cuello y cabeza -->
    <rect x="86" y="126" width="28" height="26" rx="8" fill="${skin}"/>
    <rect x="54" y="52" width="92" height="96" rx="44" fill="${skin}"/>
    <!-- orejas -->
    <circle cx="54" cy="102" r="9" fill="${skin}"/><circle cx="146" cy="102" r="9" fill="${skin}"/>
    ${beard(bd, hairC)}
    <!-- cejas y ojos -->
    <path d="${brow}" stroke="${hairC}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="${brow2}" stroke="${hairC}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="${eyeY}" r="4" fill="#1b1b1f"/><circle cx="118" cy="${eyeY}" r="4" fill="#1b1b1f"/>
    <circle cx="83.5" cy="${eyeY - 1.5}" r="1.3" fill="#fff"/><circle cx="119.5" cy="${eyeY - 1.5}" r="1.3" fill="#fff"/>
    ${glasses(gl)}
    <!-- nariz y boca -->
    <path d="M100 104 L96 114 L104 114" stroke="#00000033" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${smile ? '<path d="M88 124 Q100 134 112 124" stroke="#7a2e2e" stroke-width="3" fill="none" stroke-linecap="round"/>' : '<path d="M90 126 H110" stroke="#7a2e2e" stroke-width="3" fill="none" stroke-linecap="round"/>'}
    <!-- pelo -->
    ${hairFn(hairC)}
  </g>
</svg>`;
  }

  return { svg };
})();
