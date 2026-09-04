/* Capturas con Playwright (opcional): CHROME_PATH=/ruta/a/chrome node tests/screenshots.js
   Genera docs/img/*.png en escritorio (1400px) y móvil (390px) abriendo index.html por file://.
   También recorre el flujo completo a dos jugadores (A juega, exporta; B importa, juega, resuelve). */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const out = path.join(__dirname, '..', 'docs', 'img');
  fs.mkdirSync(out, { recursive: true });
  const url = 'file://' + path.join(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const errors = [];
  const dialogs = [];          // avisos del juego (alert): se comprueban, no son errores
  let failures = 0;
  const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FALLO: ') + msg); if (!ok) failures++; };

  async function newPage(mobile) {
    const ctx = await browser.newContext(mobile
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
      : { viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1.5 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
    return page;
  }
  const go = async (page, view) => { await page.goto(url + '#' + view); await page.waitForTimeout(350); };
  // Alta de cuenta (aparece en el primer arranque de cada contexto)
  const signup = async (page, name) => {
    if (await page.locator('.modal.onboarding').count()) { await page.fill('.modal.onboarding input', name); await page.click('.modal.onboarding button.primary'); await page.waitForTimeout(200); }
  };

  // Recorre la apertura cinematográfica de un sobre hasta cerrarla, capturando la primera carta.
  const openAll = async (page, shot) => {
    let guard = 0;
    while (await page.locator('.opening-overlay').count() && guard++ < 12) {
      await page.click('.opening-overlay .op-btn >> nth=0');
      await page.waitForTimeout(1100);
      if (shot && guard === 1) { await page.waitForTimeout(600); await page.screenshot({ path: shot }); }
    }
  };

  for (const mobile of [false, true]) {
    const sfx = mobile ? '-mobile' : '';
    const page = await newPage(mobile);
    await go(page, 'menu');
    await page.screenshot({ path: path.join(out, `onboarding${sfx}.png`) });
    await signup(page, 'Fernando');
    await page.screenshot({ path: path.join(out, `menu${sfx}.png`) });
    await go(page, 'album');
    await page.screenshot({ path: path.join(out, `album-hidden${sfx}.png`), fullPage: false });
    // El botón solo existe en modo desarrollador; las capturas del álbum necesitan
    // las cartas visibles, así que se activa la bandera y se pide el repintado.
    await page.evaluate(() => { MI.story.setRevealAll(true); MI.app.go('album'); });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `album${sfx}.png`), fullPage: !mobile });

    if (!mobile) {
      for (const id of ['daniel-primo', 'jose-manuel-gomez', 'fernando-lopez', 'holtrix']) {
        const card = page.locator(`.card[data-card="${id}"]`);
        await card.scrollIntoViewIfNeeded();
        await card.hover({ position: { x: 90, y: 120 } });
        await page.waitForTimeout(250);
        await card.screenshot({ path: path.join(out, `card-${id}.png`) });
      }
    }

    // Partida contra la empresa rival
    await go(page, 'game');
    // La semilla solo existe con config.developer.enabled; sin ella el reparto es aleatorio.
    const semilla = page.locator('.setup input[placeholder="Misma semilla, mismo reparto"]');
    if (await semilla.count()) await semilla.fill('poc-2');
    await page.click('.setup button.primary');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, `game-choose${sfx}.png`), fullPage: true });
    await page.locator('.deck-actions .deck-btn').first().scrollIntoViewIfNeeded();
    await page.locator('.deck-actions .deck-btn >> nth=0').evaluate((b) => b.click());
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `game-detail${sfx}.png`) });
    await page.click('.modal .close');
    // El mazo ya trae carta activa: basta con enviar.
    await page.waitForTimeout(200);
    await page.locator('.actions button.primary').evaluate((b) => b.click());
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, `game-reveal${sfx}.png`), fullPage: true });

    // Normas y perfil
    await go(page, 'rules');
    await page.screenshot({ path: path.join(out, `rules${sfx}.png`), fullPage: !mobile });

    // Modo historia: fichar, sobre de bienvenida, tienda, plantilla, sprint completo, oficina
    await go(page, 'story');
    await page.click('text=Fichar por Malandriner S.A.');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, `story-pack${sfx}.png`) });
    await openAll(page, path.join(out, `story-open-card${sfx}.png`));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `story-dashboard${sfx}.png`), fullPage: true });
    // Dar dinero para probar la tienda (solo en la prueba)
    await page.evaluate(() => { const s = MI.story.load(); s.coins = 500; MI.story.save(s); MI.story.go('shop'); });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(out, `story-shop${sfx}.png`), fullPage: true });
    await page.click('.pack-pro button.primary');
    await page.waitForTimeout(600);
    await openAll(page, path.join(out, `story-open-pro${sfx}.png`));
    await page.click('.pack-calabozo button.primary');
    await page.waitForTimeout(600);
    await openAll(page);
    await page.evaluate(() => MI.story.go('collection'));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `story-collection${sfx}.png`), fullPage: !mobile });
    await page.evaluate(() => MI.story.go('squad'));
    await page.waitForTimeout(200);
    await page.click('text=Elegir automáticamente');
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(out, `story-squad${sfx}.png`), fullPage: !mobile });
    await page.click('.actions button.primary');
    await page.waitForTimeout(300);
    for (let i = 0; i < 5; i++) {
      const rescue = page.locator('.deck-btn.rescue');
      if (await rescue.count() && await rescue.first().isVisible()) await rescue.first().evaluate((b) => b.click());
      await page.waitForTimeout(100);
      await page.locator('.actions button.primary').evaluate((b) => b.click());
      await page.waitForTimeout(150);
      if (await page.locator('.endgame').count()) break;
      await page.locator('.actions button.primary').evaluate((b) => b.click());
      await page.waitForTimeout(150);
      if (await page.locator('.endgame').count()) break;
    }
    await page.screenshot({ path: path.join(out, `story-end${sfx}.png`), fullPage: true });
    await page.click('text=Volver a la oficina');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `story-after${sfx}.png`), fullPage: true });
    await go(page, 'perfil');
    await page.screenshot({ path: path.join(out, `perfil${sfx}.png`), fullPage: true });
    const prof = await page.evaluate(() => MI.match.profile.load());
    console.log((mobile ? 'móvil' : 'escritorio') + ' · perfil:', prof.tag, 'puntos', prof.points, 'partidas', prof.games);
    await page.close();
  }

  /* Flujo a dos jugadores por enlace, que es la forma recomendada de compartir:
     A crea la partida y juega; comparte el enlace; B lo abre, juega y resuelve;
     comparte el enlace del resultado; A lo abre y ve quién ha ganado.
     El desplegable con el JSON se comprueba aparte, al final. */
  const linkOf = async (page) => {
    await page.evaluate(() => {
      window.__enlace = null;
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (t) => { window.__enlace = t; return Promise.resolve(); } } });
      delete navigator.share;   // en el navegador de escritorio no existe; el juego cae al portapapeles
    });
    await page.locator('.share-bar .share-cta').first().evaluate((b) => b.click());
    await page.waitForTimeout(200);
    return page.evaluate(() => window.__enlace);
  };
  // El enlace apunta al juego publicado; al probar en local se abre el mismo payload sobre el fichero.
  const local = (enlace) => url + '#match=' + enlace.split('#match=')[1];

  // Se espera por estado, no por reloj: con esperas fijas el último ticket se colaba
  // antes de que la pantalla cambiase y la comprobación fallaba de forma intermitente.
  const jugarSprint = async (page, pasarCarta) => {
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('.deck-stage', { timeout: 15000 });
      if (pasarCarta && await page.locator('.deck-nav.next').count()) {
        await page.locator('.deck-nav.next').evaluate((b) => b.click());
        await page.waitForTimeout(200);
      }
      // Deslizar puede dejarte sobre un malandrín quemado, y entonces el botón de
      // enviar se bloquea con razón: hay que moverse hasta uno disponible.
      for (let k = 0; k < 6 && await page.locator('.actions button.primary').evaluate((b) => b.disabled); k++) {
        const haySiguiente = await page.locator('.deck-nav.next:not([disabled])').count();
        await page.locator(haySiguiente ? '.deck-nav.next' : '.deck-nav.prev').evaluate((b) => b.click());
        await page.waitForTimeout(180);
      }
      await page.locator('.actions button.primary').evaluate((b) => b.click());
      await page.waitForSelector('.result, .endgame, .res-table', { timeout: 15000 });
      await page.waitForTimeout(200);
      if (await page.locator('.endgame, .res-table').count()) break;
      await page.locator('.actions button.primary').evaluate((b) => b.click());
      await page.waitForTimeout(200);
    }
    await page.waitForSelector('.endgame, .res-table, .deck-stage', { timeout: 15000 });
    await page.waitForTimeout(300);
  };

  const A = await newPage(false);
  await go(A, 'game');
  await signup(A, 'Ana');
  await A.click('text=Crear partida y jugar primero');
  await jugarSprint(A, false);
  await A.screenshot({ path: path.join(out, 'p2p-export.png'), fullPage: true });

  const enlaceA = await linkOf(A);
  check(!!enlaceA && enlaceA.includes('#match='), 'A obtiene un enlace para compartir');
  const base = await A.evaluate(() => MI.data.config.shareBaseUrl);
  check(enlaceA.startsWith(base), 'el enlace apunta al juego publicado (' + base + ')');
  check(enlaceA.length < 6000, 'el enlace cabe en un mensaje: ' + enlaceA.length + ' caracteres');

  // B ya tiene nombre: el enlace le mete directamente en su turno, sin pasos intermedios.
  const B = await newPage(false);
  await go(B, 'menu');
  await signup(B, 'Bea');
  await B.goto(local(enlaceA)); await B.waitForTimeout(500);
  check(await B.locator('.deck-stage').count() > 0, 'B abre el enlace y entra directamente a jugar su turno');
  check(await B.locator('.hud').count() > 0, 'B ve el marcador de la partida recibida');
  await B.screenshot({ path: path.join(out, 'p2p-link-recibido.png'), fullPage: true });

  // Quien abre el enlace sin cuenta: primero el alta, y la partida queda esperando.
  const N = await newPage(false);
  await N.goto(local(enlaceA)); await N.waitForTimeout(500);
  check(await N.locator('.modal.onboarding').count() > 0, 'a quien no tiene cuenta se le pide el nombre antes de nada');
  check(await N.locator('.shared-match').count() > 0, 'y la partida recibida queda esperando detrás del alta');
  await N.screenshot({ path: path.join(out, 'p2p-link-sin-cuenta.png'), fullPage: true });
  await signup(N, 'Nuevo');
  await N.waitForTimeout(200);
  await N.locator('text=Abrir partida recibida').evaluate((b) => b.click());
  await N.waitForTimeout(400);
  check(await N.locator('.deck-stage').count() > 0, 'tras darse de alta entra a jugar la partida del enlace');
  await N.close();
  await jugarSprint(B, true);
  check(await B.locator('.res-table').count() > 0, 'B ve la partida resuelta con los dos marcadores');
  await B.screenshot({ path: path.join(out, 'p2p-resolved.png'), fullPage: true });

  const enlaceB = await linkOf(B);
  check(!!enlaceB && enlaceB.includes('#match='), 'B obtiene el enlace del resultado');

  check(enlaceB.length < 2000, 'el enlace del resultado cabe en un mensaje: ' + enlaceB.length + ' caracteres');
  await A.goto(local(enlaceB)); await A.waitForTimeout(500);
  const title = await A.locator('.endgame h1').innerText();
  check(!!title, 'A abre el enlace del resultado y ve el desenlace: "' + title + '"');
  const profile = await A.evaluate(() => MI.match.profile.load());
  check(profile.games > 0, 'la partida queda registrada en el perfil de A');
  console.log('Resultado visto por A:', title, '| perfil A:', JSON.stringify({ games: profile.games, wins: profile.wins, losses: profile.losses }));
  await A.screenshot({ path: path.join(out, 'p2p-result-A.png'), fullPage: true });

  // Un enlace manipulado no debe colar: la firma tiene que fallar.
  const C = await newPage(false);
  await go(C, 'menu');
  await signup(C, 'Ceci');
  // Abrir tu propio enlace mientras esperas al rival no es un error: debe explicarse
  // y ofrecer volver a compartirlo, no soltar un aviso y dejarte en la pantalla vacía.
  const antesPropio = dialogs.length;
  await A.goto(local(enlaceA)); await A.waitForTimeout(500);
  check(await A.locator('.shared-match.own').count() > 0, 'quien abre su propio enlace ve que espera al rival, no un error');
  check(dialogs.length === antesPropio, 'y no salta ningún aviso de enlace inválido');
  check(await A.locator('.shared-match.own button', { hasText: 'Volver a compartir el enlace' }).count() > 0, 'con la opción de volver a compartirlo');
  await A.screenshot({ path: path.join(out, 'p2p-enlace-propio.png'), fullPage: true });

  // Dos averías distintas deben dar dos avisos distintos: el enlace cortado por el chat
  // y el enlace retocado a mano. Confundirlos manda a la gente a buscar donde no es.
  const antes = dialogs.length;
  await C.goto(local(enlaceA).slice(0, Math.floor(local(enlaceA).length * 0.75)));
  await C.waitForTimeout(400);
  const avisoCorte = dialogs.slice(antes).join(' / ');
  check(/incompleto/.test(avisoCorte), 'un enlace cortado avisa de que ha llegado incompleto: ' + (avisoCorte || 'sin aviso'));

  const antes2 = dialogs.length;
  const trucado = await C.evaluate((p) => {
    // Se cambia un byte del medio sin tocar la longitud: la firma tiene que cantarlo.
    const b64 = p.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const medio = Math.floor(bytes.length / 2);
    bytes[medio] = bytes[medio] ^ 0x5a;
    let out = '';
    bytes.forEach((x) => { out += String.fromCharCode(x); });
    return btoa(out).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }, enlaceA.split('#match=')[1]);
  await C.goto(url + '#match=' + trucado); await C.waitForTimeout(400);
  const avisoFirma = dialogs.slice(antes2).join(' / ');
  check(/firma/.test(avisoFirma), 'un enlace retocado se rechaza por firma: ' + (avisoFirma || 'sin aviso'));

  // El desplegable de JSON sigue siendo la alternativa cuando el enlace no se puede pegar.
  const [descarga] = await Promise.all([
    B.waitForEvent('download'),
    B.locator('text=Descargar copia JSON').count().then(async (n) => {
      if (n) return B.locator('text=Descargar copia JSON').evaluate((b) => b.click());
      return B.evaluate(() => { const m = MI.game.state().match; const blob = new Blob([MI.match.exportText(m)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'm.json'; document.body.appendChild(a); a.click(); });
    })
  ]);
  const jsonB = require('fs').readFileSync(await descarga.path(), 'utf8');
  const D = await newPage(false);
  await go(D, 'game');
  await signup(D, 'Dani');
  await D.locator('.json-import').evaluate((d) => { d.open = true; });
  await D.waitForTimeout(150);
  await D.locator('#paste-match').evaluate((t, v) => { t.value = v; }, jsonB);
  await D.locator('text=Cargar lo pegado').evaluate((b) => b.click());
  await D.waitForTimeout(400);
  check(await D.locator('.endgame').count() > 0, 'la carga por JSON pegado sigue funcionando');

  // Vía de rescate: pegar el enlace entero cuando el chat solo hace pulsable un trozo.
  const E = await newPage(false);
  await go(E, 'game');
  await signup(E, 'Eva');
  await E.locator('.json-import').evaluate((d) => { d.open = true; });
  await E.waitForTimeout(150);
  await E.locator('#paste-match').evaluate((t, v) => { t.value = v; }, enlaceB);
  await E.locator('text=Cargar lo pegado').evaluate((b) => b.click());
  await E.waitForTimeout(400);
  check(await E.locator('.endgame').count() > 0, 'pegar el enlace entero en el desplegable también carga la partida');

  await browser.close();
  if (errors.length) { console.error('Errores en página:\n' + errors.join('\n')); process.exit(1); }
  if (failures) { console.error('\n' + failures + ' comprobación(es) del flujo por enlace han fallado.'); process.exit(1); }
  console.log('Capturas en docs/img');
})();
