/* Arranque, router de vistas, alta de cuenta y perfil. */
window.MI = window.MI || {};

MI.app = (function () {
  const el = MI.util.el;
  const views = {};
  let current = 'menu';

  function go(name) {
    current = name;
    document.querySelectorAll('.nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    const c = document.getElementById('view');
    c.innerHTML = '';
    views[name](c);
    window.scrollTo(0, 0);
    try { if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name); } catch (e) { /* file:// */ }
  }

  views.menu = function (c) {
    const cfg = MI.data.config;
    const n = MI.album.activeCards().length;
    const p = MI.match.profile.load();
    c.appendChild(el('div', { class: 'hero' }, [
      el('h1', { class: 'title', text: '¡MALANDRINEITOR!' }),
      el('p', { class: 'sub', text: 'El juego de cartas de la comunidad de Web Reactiva.' }),
      el('p', { class: 'company-line', text: cfg.company.name + ' · ' + cfg.company.tagline }),
      p.tag ? el('p', { class: 'small muted', text: 'Juegas como ' + p.tag + ' · ' + (p.points || 0) + ' puntos malandrín' }) : null
    ]));
    c.appendChild(el('div', { class: 'menu-grid' }, [
      el('button', { class: 'menu-card', onclick: () => go('story') }, [el('div', { class: 'tag', text: 'Campaña' }), el('h3', { text: 'Modo historia' }), el('p', { text: 'Ficha por Malandriner S.A., cobra, compra sobres y completa el álbum. ' + cfg.story.chapters.length + ' capítulos contra ' + cfg.rival.name + '.' })]),
      el('button', { class: 'menu-card', onclick: () => go('game') }, [el('div', { class: 'tag', text: 'Rápido' }), el('h3', { text: 'Modo arcade' }), el('p', { text: `Mano aleatoria, ${cfg.arcade.tickets} tickets contra la máquina o contra otra persona por fichero.` })]),
      el('button', { class: 'menu-card', onclick: () => go('album') }, [el('div', { class: 'tag', text: 'Colección' }), el('h3', { text: 'Álbum' }), el('p', { text: `${n} malandrines en plantilla. Habilidades, campeones y criptonitas.` })]),
      el('button', { class: 'menu-card', onclick: () => go('rules') }, [el('div', { class: 'tag', text: 'Manual' }), el('h3', { text: 'Normas' }), el('p', { text: 'Cómo se resuelve un ticket, qué es la paga, el burnout, el giro y el amo del calabozo.' })])
    ]));
    c.appendChild(el('p', { class: 'muted small', style: { textAlign: 'center', marginTop: '40px' }, text: 'Los personajes son miembros de la comunidad con nombre público; los retratos son avatares generados, no fotos. Quien no quiera aparecer, lo dice y desaparece del mazo.' }));
  };
  views.album = (c) => MI.album.render(c);
  views.game = (c) => MI.game.render(c);
  views.story = (c) => MI.story.render(c);
  views.rules = (c) => MI.rules.render(c);
  views.perfil = (c) => renderProfile(c);

  /* ---------- Alta de cuenta ---------- */
  function onboarding() {
    if (document.querySelector('.modal.onboarding')) return;
    let name = '';
    const input = el('input', { placeholder: 'Tu nombre de malandrín', maxlength: '24', autofocus: 'autofocus', oninput: (e) => { name = e.target.value.trim(); } });
    const submit = () => {
      if (!name) { input.style.borderColor = 'var(--bad)'; input.focus(); return; }
      const p = MI.match.profile.create(name);
      modal.remove();
      go(current);
      toast('Cuenta creada: ' + p.tag + '. El número evita coincidencias con otros malandrines.');
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    const modal = el('div', { class: 'modal onboarding' }, [
      el('div', { class: 'panel onboarding-box' }, [
        el('div', { class: 'tag', text: 'Alta en Malandriner S.A.' }),
        el('h2', { text: 'Tu nombre de malandrín' }),
        el('p', { class: 'small muted', text: 'Se guarda en este navegador, firmado, junto con tus puntos y tu historial. Le añadimos un número aleatorio para que no coincida con nadie.' }),
        input,
        el('div', { class: 'actions' }, [el('button', { class: 'primary', text: 'Fichar', onclick: submit })])
      ])
    ]);
    document.body.appendChild(modal);
    setTimeout(() => input.focus(), 50);
  }

  function toast(text) {
    const t = el('div', { class: 'toast', text });
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 20);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4000);
  }

  /* ---------- Perfil ---------- */
  function renderProfile(c) {
    const p = MI.match.profile.load();
    const story = MI.story.load();
    const modeLabel = { ai: 'Arcade vs máquina', p2p: 'Dos jugadores', story: 'Historia' };
    const resLabel = { win: 'victoria', loss: 'derrota', draw: 'empate' };
    c.appendChild(el('h1', { text: 'Perfil de ' + (p.tag || p.name || 'malandrín') }));
    if (p.tampered) c.appendChild(el('p', { class: 'small', style: { color: 'var(--bad)' }, text: 'El perfil guardado no superaba la comprobación de integridad y se ha reiniciado.' }));
    c.appendChild(el('div', { class: 'stats big' }, [
      stat(p.points || 0, 'puntos malandrín'), stat(p.games || 0, 'partidas'), stat(p.wins || 0, 'victorias'), stat(p.losses || 0, 'derrotas'), stat(p.draws || 0, 'empates'), stat(p.bestRep || 0, 'mejor reputación')
    ]));
    c.appendChild(renderByMode(p));
    c.appendChild(el('div', { class: 'panel', style: { marginTop: '16px' } }, [
      el('h2', { text: 'Historia' }),
      story
        ? el('div', { class: 'row' }, [
            el('span', { class: 'pill', text: 'Capítulo ' + story.chapter }), el('span', { class: 'pill', text: story.coins + ' malandricoins' }),
            el('span', { class: 'pill', text: MI.story.ownedCards(story).length + ' cartas' }), el('span', { class: 'pill', text: story.sprints + ' sprints' })
          ])
        : el('p', { class: 'muted small', text: 'Todavía no has fichado por Malandriner S.A. Las cartas se consiguen abriendo sobres en el modo historia.' }),
      el('div', { class: 'row', style: { marginTop: '10px' } }, [
        el('button', { class: 'primary', text: 'Tienda de sobres', onclick: () => MI.story.openView('shop') }),
        story ? el('button', { text: 'Ir a la oficina', onclick: () => MI.story.openView('dashboard') }) : null
      ])
    ]));
    c.appendChild(renderSquadPanel(story, p));
    const hist = p.history || [];
    c.appendChild(el('div', { class: 'panel', style: { marginTop: '16px' } }, [
      el('h2', { text: 'Histórico de partidas' }),
      hist.length ? el('div', { class: 'hist' }, [
        el('div', { class: 'hist-row head' }, ['Fecha', 'Modo', 'Rival', 'Resultado', 'Puntos'].map((t) => el('span', { text: t }))),
        ...hist.map((h) => el('div', { class: 'hist-row ' + h.result }, [
          el('span', { text: h.date.slice(0, 10) }), el('span', { text: modeLabel[h.mode] || h.mode }), el('span', { text: h.rival || '' }),
          el('span', { text: `${resLabel[h.result] || h.result} · ${h.me} a ${h.opp}` }), el('span', { class: 'mono', text: '+' + (h.points || 0) })
        ]))
      ]) : el('p', { class: 'muted small', text: 'Aún no hay partidas.' })
    ]));
    c.appendChild(el('div', { class: 'panel', style: { marginTop: '16px' } }, [
      el('h2', { text: 'Copia de seguridad' }),
      el('p', { class: 'small muted', text: 'El perfil vive en este navegador. Puedes exportarlo a un fichero e importarlo en otro. Va firmado: si se edita a mano, no se acepta.' }),
      el('div', { class: 'row' }, [
        el('button', { text: 'Exportar perfil', onclick: () => { const t = MI.match.profile.exportText(); const a = el('a', { href: URL.createObjectURL(new Blob([t], { type: 'application/json' })), download: 'malandrineitor-perfil.json' }); document.body.appendChild(a); a.click(); a.remove(); } }),
        el('label', { class: 'file-btn' }, [el('span', { text: 'Importar perfil' }), el('input', { type: 'file', accept: '.json', onchange: (e) => { const f = e.target.files[0]; if (f) f.text().then((t) => { try { MI.match.profile.importText(t); go('perfil'); toast('Perfil importado.'); } catch (err) { alert(err.message); } }); } })]),
        el('button', { class: 'ghost', text: 'Borrar perfil', onclick: () => { if (confirm('¿Borrar el perfil de este navegador?')) { MI.match.profile.reset(); go('menu'); onboarding(); } } })
      ])
    ]));
  }
  function stat(v, l) { return el('div', { class: 'stat' }, [el('b', { text: String(v) }), el('span', { text: l })]); }

  /* Tu plantilla: las cartas en propiedad, con las copias que tienes, las veces que se
     han quemado y el botón de venta, que solo aparece a partir de la segunda copia
     (la última nunca se vende). */
  function renderSquadPanel(story, prof) {
    const cfg = MI.data.config;
    if (!story) return el('span');
    const owned = MI.story.ownedCards(story)
      .sort((a, b) => (story.owned[b.id] - story.owned[a.id]) || a.name.localeCompare(b.name));
    const stats = prof.cardStats || {};
    const dups = owned.reduce((a, c) => a + Math.max(0, story.owned[c.id] - 1), 0);
    const burned = owned.filter((c) => (stats[c.id] || {}).burnouts).length;
    return el('div', { class: 'panel', style: { marginTop: '16px' } }, [
      el('h2', { text: 'Tu plantilla' }),
      el('p', { class: 'small muted', text: owned.length
        ? `${owned.length} malandrines en propiedad` + (dups ? ` · ${dups} repetida${dups === 1 ? '' : 's'} para vender` : '') + (burned ? ` · ${burned} con algún burnout a sus espaldas` : '')
        : 'Todavía no tienes cartas. Abre un sobre en la tienda.' }),
      owned.length ? el('div', { class: 'squad-list' }, owned.map((card) => {
        const n = story.owned[card.id];
        const cs = stats[card.id] || { sent: 0, resolved: 0, burnouts: 0 };
        const price = cfg.story.sellPrice[card.rarity] || 0;
        return el('div', { class: 'squad-row rarity-' + card.rarity + (cs.burnouts ? ' burned' : '') }, [
          el('span', { class: 'sq-gem' }),
          el('span', { class: 'sq-name', text: card.name }),
          el('span', { class: 'sq-rar', text: cfg.rarities[card.rarity].name }),
          el('span', { class: 'sq-n', text: n > 1 ? '×' + n : '' }),
          el('span', { class: 'sq-stats', text: cs.sent ? `${cs.sent} envíos · ${cs.resolved} resueltos` : 'sin jugar' }),
          el('span', { class: 'sq-burn' + (cs.burnouts ? ' on' : ''), text: cs.burnouts ? cs.burnouts + (cs.burnouts === 1 ? ' burnout' : ' burnouts') : '' }),
          el('span', { class: 'sq-act' }, n > 1
            ? el('button', { class: 'small-btn sell', text: 'Vender una (+' + price + ')', onclick: () => { const st = MI.story.load(); MI.story.sell(st, card.id); MI.story.save(st); go('perfil'); toast('Vendida una copia de ' + card.name + '.'); } })
            : el('button', { class: 'ghost small-btn', text: 'Ver ficha', onclick: () => MI.album.openDetail(card) }))
        ]);
      })) : null
    ]);
  }

  // Desglose por modo. Se usa el recuento exacto del perfil; los perfiles antiguos
  // se reconstruyen a partir del historial, que basta porque aún son cortos.
  function renderByMode(p) {
    const MODES = [['ai', 'Arcade contra la máquina'], ['story', 'Modo historia'], ['p2p', 'Arcade a dos jugadores']];
    let by = p.byMode;
    if (!by || !Object.keys(by).length) {
      by = {};
      (p.history || []).forEach((h) => {
        const m = by[h.mode] = by[h.mode] || { games: 0, wins: 0, losses: 0, draws: 0, points: 0 };
        m.games++; m.points += h.points || 0;
        if (h.result === 'win') m.wins++; else if (h.result === 'loss') m.losses++; else m.draws++;
      });
    }
    const rows = MODES.filter(([k]) => by[k] && by[k].games);
    return el('div', { class: 'panel', style: { marginTop: '16px' } }, [
      el('h2', { text: 'Por modo de juego' }),
      rows.length ? el('div', { class: 'bymode' }, rows.map(([k, label]) => {
        const m = by[k];
        return el('div', { class: 'bymode-card' }, [
          el('div', { class: 'bymode-name', text: label }),
          el('div', { class: 'bymode-big', text: m.games + (m.games === 1 ? ' partida' : ' partidas') }),
          el('div', { class: 'bymode-detail' }, [
            el('span', { class: 'w', text: m.wins + ' V' }), el('span', { class: 'l', text: m.losses + ' D' }),
            m.draws ? el('span', { class: 'd', text: m.draws + ' E' }) : null,
            el('span', { class: 'pts', text: '+' + m.points + ' puntos' })
          ])
        ]);
      })) : el('p', { class: 'muted small', text: 'Todavía no has terminado ninguna partida. Cuentan las tres modalidades: arcade contra la máquina, historia y arcade a dos jugadores.' })
    ]);
  }

  function init() {
    const v = MI.engine.validate(MI.data);
    if (!v.ok) {
      console.error('Datos inválidos:', v.errors);
      document.getElementById('view').appendChild(el('div', { class: 'panel', style: { borderColor: 'var(--bad)' } }, [el('h2', { text: 'Los ficheros de datos tienen errores' }), el('pre', { class: 'mono small', text: v.errors.join('\n') })]));
      return;
    }
    document.querySelectorAll('.nav button').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
    const fromHash = () => { const h = (location.hash || '').replace('#', ''); if (views[h] && h !== current) go(h); };
    window.addEventListener('hashchange', fromHash);
    const h = (location.hash || '').replace('#', '');
    go(views[h] ? h : 'menu');
    const p = MI.match.profile.load();
    if (!p.tag) onboarding();
  }

  return { go, init, onboarding, toast };
})();

document.addEventListener('DOMContentLoaded', MI.app.init);
