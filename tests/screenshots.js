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

  async function newPage(mobile) {
    const ctx = await browser.newContext(mobile
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
      : { viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1.5 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('dialog', (d) => { errors.push('dialog: ' + d.message()); d.dismiss(); });
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
    await page.click('text=Descubrir toda la colección');
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

    // Partida contra Boluda S.A.
    await go(page, 'game');
    await page.fill('.setup input[placeholder="Misma semilla, mismo reparto"]', 'poc-2');
    await page.click('.setup button.primary');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, `game-choose${sfx}.png`), fullPage: true });
    await page.locator('.hand-item .small-btn').first().scrollIntoViewIfNeeded();
    await page.click('.hand-item .small-btn >> nth=0');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `game-detail${sfx}.png`) });
    await page.click('.modal .close');
    await page.click('.hand .card.selectable >> nth=0');
    await page.waitForTimeout(200);
    await page.click('.actions button.primary');
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
      const rescue = page.locator('.small-btn.rescue');
      if (await rescue.count()) await rescue.first().click();
      await page.waitForTimeout(100);
      if (await page.locator('.hand .card.selectable').count()) await page.locator('.hand .card.selectable').first().click();
      await page.click('.actions button.primary');
      await page.waitForTimeout(150);
      if (await page.locator('.endgame').count()) break;
      await page.click('.actions button.primary');
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

  // Flujo a dos jugadores: A crea y juega, exporta; B (otro contexto) importa, juega, resuelve; A importa el resultado.
  const A = await newPage(false);
  await go(A, 'game');
  await signup(A, 'Ana');
  await A.click('text=Crear partida y jugar primero');
  for (let i = 0; i < 5; i++) {
    await A.waitForTimeout(150);
    await A.click('.hand .card.selectable >> nth=0');
    await A.click('.actions button.primary');
    await A.waitForTimeout(150);
    await A.click('.actions button.primary');
  }
  await A.waitForTimeout(300);
  await A.screenshot({ path: path.join(out, 'p2p-export.png'), fullPage: true });
  const fileA = await A.inputValue('.export-box');

  const B = await newPage(false);
  await go(B, 'game');
  await signup(B, 'Bea');
  await B.fill('#paste-match', fileA);
  await B.click('text=Cargar lo pegado');
  for (let i = 0; i < 5; i++) {
    await B.waitForTimeout(150);
    await B.click('.hand .card.selectable >> nth=1');
    await B.click('.actions button.primary');
    await B.waitForTimeout(150);
    await B.click('.actions button.primary');
  }
  await B.waitForTimeout(300);
  await B.screenshot({ path: path.join(out, 'p2p-resolved.png'), fullPage: true });
  const resolvedText = await B.evaluate(() => MI.match.exportText(MI.game.state().match));

  await A.click('text=Volver al inicio');
  await A.fill('#paste-match', resolvedText);
  await A.click('text=Cargar lo pegado');
  await A.waitForTimeout(300);
  const title = await A.locator('.endgame h1').innerText();
  const profile = await A.evaluate(() => MI.match.profile.load());
  console.log('Resultado visto por A:', title, '| perfil A:', JSON.stringify({ games: profile.games, wins: profile.wins, losses: profile.losses }));
  await A.screenshot({ path: path.join(out, 'p2p-result-A.png'), fullPage: true });

  await browser.close();
  if (errors.length) { console.error('Errores en página:\n' + errors.join('\n')); process.exit(1); }
  console.log('Capturas en docs/img');
})();
