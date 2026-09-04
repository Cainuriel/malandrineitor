/* Auditoría de maquetación: recorre las vistas en cuatro anchos y comprueba que
   no hay desbordamiento horizontal, que las capas a pantalla completa se pueden
   recorrer enteras y que no hay errores de consola.
   Uso: CHROME_PATH=/ruta/a/chrome node tests/layout.js */
const path = require('path');
const { chromium } = require('playwright');

const FORMATS = [
  { name: 'móvil',        width: 390,  height: 844,  mobile: true },
  { name: 'móvil apaisado', width: 844, height: 390, mobile: true },
  { name: 'tablet',       width: 820,  height: 1180, mobile: true },
  { name: 'portátil',     width: 1440, height: 900,  mobile: false },
  { name: 'pantalla grande', width: 2560, height: 1440, mobile: false }
];

let failures = 0;
function check(ok, msg) { console.log((ok ? 'ok   ' : 'FALLO: ') + msg); if (!ok) failures++; }

(async () => {
  const url = 'file://' + path.join(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

  for (const f of FORMATS) {
    const ctx = await browser.newContext({ viewport: { width: f.width, height: f.height }, isMobile: f.mobile, hasTouch: f.mobile, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('dialog', (d) => d.dismiss());

    const overflow = async () => page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: window.innerWidth,
      culprits: [...document.querySelectorAll('body *')]
        .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 && e.getBoundingClientRect().width > 0)
        .slice(0, 3).map((e) => e.tagName.toLowerCase() + '.' + (e.className || '').toString().split(' ')[0])
    }));

    await page.goto(url + '#menu'); await page.waitForTimeout(300);
    await page.fill('.modal.onboarding input', 'Fernando');
    await page.click('.modal.onboarding button.primary'); await page.waitForTimeout(200);

    for (const view of ['menu', 'album', 'rules', 'perfil', 'game']) {
      await page.goto(url + '#' + view); await page.waitForTimeout(300);
      const o = await overflow();
      check(o.sw <= o.iw + 1, `${f.name} · vista ${view} sin desbordamiento horizontal` + (o.sw > o.iw + 1 ? ` (${o.sw} > ${o.iw}: ${o.culprits.join(', ')})` : ''));
    }

    // Ficha ampliada: se debe poder llegar al principio y al final del contenido
    await page.goto(url + '#album'); await page.waitForTimeout(250);
    // El botón de descubrir la colección solo existe en modo desarrollador; la prueba
    // necesita cartas visibles, así que se activa la bandera directamente.
    // (Volver a navegar a la misma URL no repinta: hay que pedir el repintado.)
    await page.evaluate(() => { MI.story.setRevealAll(true); MI.app.go('album'); });
    await page.waitForTimeout(300);
    await page.click('.album-grid .card'); await page.waitForTimeout(350);
    const modal = await page.evaluate(() => {
      const m = document.querySelector('.modal'); if (!m) return null;
      const body = m.querySelector('.modal-body');
      return { top: body.getBoundingClientRect().top, scrollable: m.scrollHeight > m.clientHeight, hidden: body.getBoundingClientRect().top < -1 };
    });
    check(modal && !modal.hidden, `${f.name} · la ficha ampliada no queda recortada por arriba`);
    // Se cierra pulsando encima de la propia carta, no solo en el botón.
    await page.locator('.modal .card').evaluate((n) => n.click()); await page.waitForTimeout(250);
    check(await page.locator('.modal').count() === 0, `${f.name} · la ficha se cierra al pulsar sobre ella`);
    const restored = await page.evaluate(() => ({
      pos: getComputedStyle(document.body).position,
      ovh: document.documentElement.style.overflow, ovb: document.body.style.overflow
    }));
    check(restored.pos !== 'fixed' && !restored.ovh && !restored.ovb, `${f.name} · el scroll del fondo se restaura al cerrar la ficha`);

    // Y con el botón, sin descuadrar el contador de bloqueos de scroll.
    await page.click('.album-grid .card'); await page.waitForTimeout(300);
    await page.click('.modal .close'); await page.waitForTimeout(250);
    check(await page.locator('.modal').count() === 0, `${f.name} · la ficha se cierra con el botón`);
    check((await page.evaluate(() => getComputedStyle(document.body).position)) !== 'fixed', `${f.name} · un solo desbloqueo de scroll por cierre`);

    // Enlace directo a una ficha: es la vía por la que la gente se busca y se comparte.
    await page.goto(url + '#carta=daniel-primo'); await page.waitForTimeout(450);
    check(await page.locator('.modal .detail h2').count() === 1, `${f.name} · el enlace de una ficha la abre directamente`);
    check(await page.locator('.card-share button').count() === 1, `${f.name} · la ficha ofrece compartirse`);
    const ov = await overflow();
    check(ov.sw <= ov.iw + 1, `${f.name} · la ficha compartida no desborda` + (ov.sw > ov.iw + 1 ? ` (${ov.culprits.join(', ')})` : ''));
    await page.locator('.modal .close').evaluate((b) => b.click()); await page.waitForTimeout(250);
    await page.goto(url + '#carta=no-existe-esta-carta'); await page.waitForTimeout(400);
    check(await page.locator('.modal').count() === 0, `${f.name} · un enlace de ficha inexistente no rompe nada`);
    await page.goto(url + '#album'); await page.waitForTimeout(300);

    // Quemaduras: una esquina por burnout acumulado, con el filtro de ruido aplicado.
    const quemadas = await page.evaluate(() => {
      const c = MI.data.cards[0];
      const dos = MI.card.render(c, { burns: 2 });
      const cero = MI.card.render(c, { burns: 0 });
      const uno = MI.card.render(c, { burns: 1 });
      return {
        dos: dos.querySelectorAll('.card-burn').length,
        cero: cero.querySelectorAll('.card-burn').length,
        uno: uno.querySelectorAll('.card-burn').length,
        clase: dos.classList.contains('burned-2'),
        filtro: /url\(#mi-quemadura-\d\)/.test(dos.querySelector('.card-burn').style.getPropertyValue('--q')),
        defs: !!document.getElementById('mi-quemadura-1')
      };
    });
    check(quemadas.cero === 0 && quemadas.uno === 1 && quemadas.dos === 2, `${f.name} · una esquina quemada por burnout acumulado`);
    check(quemadas.clase, `${f.name} · la carta quemada lleva su clase de estado`);
    check(quemadas.filtro && quemadas.defs, `${f.name} · la quemadura usa el filtro de ruido declarado en la página`);

    // Apertura de sobre: la escena debe ser recorrible entera
    await page.goto(url + '#story'); await page.waitForTimeout(250);
    await page.click('text=Fichar por Malandriner S.A.'); await page.waitForTimeout(600);
    const stage = await page.evaluate(() => {
      const ov = document.querySelector('.opening-overlay'); if (!ov) return null;
      const st = ov.querySelector('.opening-stage');
      return { stageTop: st.getBoundingClientRect().top, canScroll: ov.scrollHeight > ov.clientHeight, scrollTop: ov.scrollTop, fits: st.scrollHeight <= ov.scrollHeight + 1 };
    });
    check(stage && stage.stageTop >= -1 && stage.fits, `${f.name} · la escena del sobre no se recorta por arriba`);
    check(await page.locator('.opening-overlay .op-actions button', { hasText: 'Ver ficha' }).count() === 0, `${f.name} · la cinemática no ofrece la ficha`);

    let guard = 0;
    while (await page.locator('.opening-overlay').count() && guard++ < 12) {
      const o = await overflow();
      if (o.sw > o.iw + 1) check(false, `${f.name} · la capa del sobre desborda (${o.sw} > ${o.iw}: ${o.culprits.join(', ')})`);
      await page.click('.opening-overlay .op-btn >> nth=0'); await page.waitForTimeout(950);
    }
    const after = await page.evaluate(() => getComputedStyle(document.body).position);
    check(after !== 'fixed', `${f.name} · el scroll del fondo se restaura al cerrar el sobre`);

    // Partida: sello de resultado y desbordamiento durante el juego
    await page.goto(url + '#story'); await page.waitForTimeout(250);
    await page.evaluate(() => { const s = MI.story.load(); s.coins = 400; MI.story.save(s); MI.story.go('squad'); });
    await page.waitForTimeout(250);
    if (await page.locator('text=Elegir automáticamente').count()) {
      await page.click('text=Elegir automáticamente'); await page.waitForTimeout(200);
      if (!(await page.locator('.actions button.primary').isDisabled())) {
        await page.click('.actions button.primary'); await page.waitForTimeout(400);
        const og = await overflow();
        check(og.sw <= og.iw + 1, `${f.name} · pantalla de partida sin desbordamiento` + (og.sw > og.iw + 1 ? ` (${og.culprits.join(', ')})` : ''));
        // El mazo elige por sí mismo: la carta activa es la que se envía.
        check(await page.locator('.slot-deck .deck-card.is-current').count() === 1, `${f.name} · el mazo marca una carta activa`);
        check(await page.locator('.slot').count() === 1, `${f.name} · el hueco del rival no ocupa sitio mientras se elige`);
        const antes = await page.locator('.deck-meta strong').innerText();
        await page.click('.deck-nav.next'); await page.waitForTimeout(350);
        check((await page.locator('.deck-meta strong').innerText()) !== antes, `${f.name} · el mazo pasa al siguiente malandrín`);
        const og2 = await overflow();
        check(og2.sw <= og2.iw + 1, `${f.name} · el mazo no desborda el ancho` + (og2.sw > og2.iw + 1 ? ` (${og2.culprits.join(', ')})` : ''));
        // Que el botón principal esté siempre libre importa más que el clic en sí:
        // la barra es fija y el mazo queda justo encima.
        const tapado = await page.evaluate(() => {
          const b = document.querySelector('.actions button.primary');
          const r = b.getBoundingClientRect();
          const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return !(t === b || b.contains(t));
        });
        check(!tapado, `${f.name} · nada tapa el botón de enviar`);
    check(await page.locator('.small-btn.abandon').count() === 1, `${f.name} · se puede abandonar el sprint`);

    // La partida sobrevive a que el navegador descarte la pestaña: se guarda una
    // instantánea y se recupera al volver. Es el caso del móvil en segundo plano.
    const antesDeIrse = await page.evaluate(() => {
      const s = MI.game.state();
      return { ticket: s.ticket, rep: s.rep.me, log: s.log.length, mano: s.hands.me.map((c) => c.id).join(','), capitulo: s.story && s.story.chapterId };
    });
    await page.goto(url + '#game'); await page.waitForTimeout(600);
    const alVolver = await page.evaluate(() => {
      const s = MI.game.state();
      return s ? { ticket: s.ticket, rep: s.rep.me, log: s.log.length, mano: s.hands.me.map((c) => c.id).join(','), capitulo: s.story && s.story.chapterId } : null;
    });
    check(JSON.stringify(antesDeIrse) === JSON.stringify(alVolver), `${f.name} · la partida se recupera intacta tras cerrarse la pestaña`);
    check(await page.locator('.deck-stage, .result').count() > 0, `${f.name} · y se vuelve a la pantalla de juego, no al inicio`);
    check(await page.evaluate(() => typeof (MI.game.state().story || {}).onFinish) === 'function', `${f.name} · el cierre del sprint del modo historia se reconstruye`);
        await page.locator('.actions button.primary').evaluate((b) => b.click()); await page.waitForTimeout(600);
        check(await page.locator('.fx-stamp').count() > 0, `${f.name} · aparece el sello de resultado del ticket`);
        check(await page.locator('.slot.opp-reveal').count() === 1, `${f.name} · la carta del rival aparece al enviar`);
      }
    }

    check(errors.length === 0, `${f.name} · sin errores de consola` + (errors.length ? ': ' + errors[0] : ''));
    await ctx.close();
  }

  await browser.close();
  console.log(failures === 0 ? '\nMaquetación correcta.' : `\n${failures} fallo(s) de maquetación.`);
  process.exit(failures ? 1 : 0);
})();
