/* Vista de normas del juego. Texto en prosa; los números se leen de config para no desincronizarse. */
window.MI = window.MI || {};

MI.rules = (function () {
  const el = MI.util.el;

  function render(c) {
    const cfg = MI.data.config;
    const sec = (title, paras) => el('section', { class: 'rules-section' }, [el('h2', { text: title }), ...paras.map((p) => el('p', { html: p }))]);
    c.appendChild(el('h1', { text: 'Normas de ¡MALANDRINEITOR!' }));
    c.appendChild(el('p', { class: 'lead', text: 'Eres ' + cfg.company.name + ', "' + cfg.company.tagline + '". Llegan tickets. Mandas malandrines. Cobras o te quemas.' }));
    c.appendChild(el('div', { class: 'rules' }, [
      sec('Las cartas', [
        'Cada carta es un malandrín de la comunidad con <b>habilidades</b> de 1 a 10 (Front, Back, DevOps, Seguridad, IA, Docencia y muchas más). Las que no aparecen en la carta valen ' + cfg.skills.defaultValue + '. Todos tienen <b>desarrollo dirigido por especificación</b>, porque aquí se programa con agentes, aunque cada cual a su nivel.',
        'Cada malandrín es <b>campeón</b> de una tecnología (React, AWS, Blockchain EVM, Java…) y tiene una <b>criptonita</b>: una tecnología o una disciplina que se le da rematadamente mal. Algunos no tienen puntos débiles; son pocos y se nota.',
        'Hay cuatro rarezas: común, rara, épica y legendaria. Las épicas y la legendaria traen una <b>habilidad especial</b> escrita en la carta.'
      ]),
      sec('Los tickets', [
        'Un ticket es una situación real de oficina redactada en jerga profesional: un pod en CrashLoopBackOff un viernes, una base de datos exfiltrada, un WordPress que vende cosas raras. Cada ticket pide unas habilidades con <b>pesos</b> (×3, ×2, ×1), tiene una <b>dificultad</b> de 1 a 5 y, muchas veces, una <b>tecnología principal</b>.',
        'Algunos tickets esconden un <b>giro</b> que se revela después de elegir: aparecen habilidades nuevas o, peor, cambia la tecnología principal. Un malandrín polivalente aguanta mejor los giros. Un especialista, a veces, descubre que "el framework de JavaScript" era Vue.'
      ]),
      sec('Cómo se resuelve un ticket', [
        'Se calcula la <b>media ponderada</b> de las habilidades del malandrín según los pesos del ticket (de 0 a 10).',
        'Si el malandrín es <b>campeón</b> de la tecnología principal, su puntuación pasa a ser ' + cfg.champion.floor + ' + media × ' + cfg.champion.factor + ': siempre por encima de cualquiera que no sea campeón. Mandar al campeón nunca es mala idea.',
        'Si el ticket toca su <b>criptonita</b> (la tecnología coincide, o la habilidad de más peso es su punto débil), la puntuación se multiplica por ' + cfg.kryptonite.factor + '.',
        'Se suma el <b>factor viernes</b>: un dado de ' + cfg.luck.dieFaces + ' caras multiplicado por ' + cfg.luck.scale + '. Nadie controla el viernes.',
        'El total se compara con el <b>umbral</b> de la dificultad (' + cfg.thresholds.slice(1).join(' / ') + ' para dificultad 1 a 5). Igual o por encima: <b>resuelto</b>. Hasta ' + cfg.improvedMargin + ' puntos por debajo: <b>mejorado</b>. Más abajo: <b>complicado</b>, y el malandrín entra en <b>burnout</b> durante ' + cfg.burnoutTurns + ' tickets.'
      ]),
      sec('Reputación y paga', [
        'Los dos jugadores empiezan con ' + cfg.points.startReputation + ' de <b>reputación</b> y mandan un malandriner al mismo ticket. Resolver suma (de ' + cfg.points.resolved[1] + ' a ' + cfg.points.resolved[5] + ' según dificultad), mejorar suma menos y complicar resta. Quien obtiene mayor total en el ticket <b>se lleva la paga</b>: +' + cfg.points.payBonus + '.',
        'Un sprint son ' + cfg.arcade.tickets + ' tickets con una mano de ' + cfg.arcade.handSize + ' malandrines. Gana quien acaba con más reputación. Contra la máquina, quien llega a cero queda eliminado en el acto.'
      ]),
      sec('El amo del calabozo', [
        'Daniel Primo es la carta legendaria. Es inmune a la criptonita y al burnout y, si está en tu mano y no está quemado, puedes usar una vez por partida <b>Rescatar del calabozo</b> sobre un malandrín en burnout para devolverlo a la mano antes de elegir carta. Boluda S.A. también lo hace si le toca.'
      ]),
      sec('Puntos malandrín', [
        'Además de la reputación de cada partida, acumulas <b>puntos malandrín</b> en tu perfil por cosas concretas: resolver como campeón (+' + cfg.scoring.champion + '), superar un giro (+' + cfg.scoring.twistSurvived + '), resolver pese a la criptonita (+' + cfg.scoring.kryptoniteDefied + '), sacar un ' + cfg.luck.dieFaces + ' y resolver (+' + cfg.scoring.perfectFriday + '), resolver tickets de dificultad 4 o 5 (+' + cfg.scoring.hardTicket + '), llevarte la paga (+' + cfg.scoring.pay + '), tres resueltos seguidos (+' + cfg.scoring.streak3 + '), rescatar del calabozo (+' + cfg.scoring.rescue + '), acabar el sprint sin burnout (+' + cfg.scoring.noBurnout + '), llevarte todas las pagas (+' + cfg.scoring.allPays + ') y ganar (+' + cfg.scoring.win + '). Contra la máquina se multiplican por ' + cfg.scoring.levelFactor.junior + ', ' + cfg.scoring.levelFactor.senior + ' o ' + cfg.scoring.levelFactor.cto + ' según su nivel.'
      ]),
      sec('Modos de juego', [
        '<b>Arcade contra ' + cfg.rival.name + '</b>: mano aleatoria, cinco tickets, tres niveles de máquina. Cinco minutos.',
        '<b>Arcade a dos jugadores</b>: uno crea la partida y juega a ciegas, exporta un fichero, el rival lo carga y juega los mismos tickets, y la partida se resuelve. Las jugadas van ofuscadas y el fichero firmado.',
        '<b>Historia</b>: fichas por Malandriner S.A. con un sobre de bienvenida y ' + cfg.story.startCoins + ' malandricoins. Juegas ' + cfg.story.chapters.length + ' capítulos contra Boluda con una plantilla elegida de tu colección, cobras por ticket resuelto y por sprint ganado, compras sobres (básico, pro y calabozo) y descubres el álbum. Si pierdes un sprint, vuelves al capítulo 1 conservando colección y malandricoins. Las cartas repetidas se venden en la colección según su rareza (' + Object.entries(cfg.story.sellPrice).map(([r, v]) => cfg.rarities[r].name.toLowerCase() + ' ' + v).join(', ') + '). El último capítulo es la auditoría.',
        '<b>El álbum</b> solo muestra las cartas que has tenido alguna vez en el modo historia. El arcade reparte cartas al azar de toda la plantilla: es el único sitio donde puedes ver a un malandrín que aún no has descubierto.'
      ]),
      sec('Sobre las personas', [
        'Los nombres proceden del directorio público de la comunidad de Web Reactiva; los retratos son avatares generados, no fotos; las habilidades, frases y criptonitas son ficción de juego con cariño. Quien no quiera aparecer, lo dice y desaparece del mazo.'
      ])
    ]));
  }

  return { render };
})();
