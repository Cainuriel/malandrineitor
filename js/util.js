/* Utilidades puras: hash determinista, RNG con semilla, helpers. Sin DOM salvo MI.util.el. */
window.MI = window.MI || {};

MI.util = (function () {
  // FNV-1a 32 bits: hash estable de una cadena (semilla de avatares y partidas).
  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  // Mulberry32: generador pseudoaleatorio pequeño y reproducible.
  function rng(seed) {
    let a = typeof seed === 'number' ? seed >>> 0 : hash(String(seed));
    const next = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.int = (min, max) => min + Math.floor(next() * (max - min + 1));
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    next.shuffle = (arr) => {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    };
    return next;
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function round1(v) { return Math.round(v * 10) / 10; }

  // Creación de elementos: el('div', { class: 'x', onclick: fn }, [children])
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        // Object.assign no sirve para propiedades personalizadas (--algo): hay que
        // pasar por setProperty. Sin esto, --sk y --q se descartaban en silencio.
        else if (k === 'style' && typeof v === 'object') {
          for (const p in v) { if (p.startsWith('--')) node.style.setProperty(p, v[p]); else node.style[p] = v[p]; }
        }
        else node.setAttribute(k, v);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function byId(list) {
    const m = {};
    list.forEach((x) => { m[x.id] = x; });
    return m;
  }

  /* Bloqueo de scroll del fondo mientras hay una capa a pantalla completa.
     Cuenta las capas abiertas y conserva la posición: fijar el body sin guardar
     el desplazamiento hace que la página salte al principio al cerrarla. */
  /* Bloqueo del scroll de fondo mientras hay una capa abierta.

     Antes se usaba `position: fixed` sobre el body con `top: -scrollY`, y al cerrar
     se restauraba con scrollTo. En el móvil eso mueve la página dos veces (al abrir y
     al cerrar) y, si la barra del navegador se ha plegado por el camino, la posición
     restaurada no es exactamente la de antes: el contenido queda desplazado bajo el
     dedo y el primer toque después de cerrar cae donde ya no está el botón. De ahí la
     sensación de tener que pulsar dos veces.

     Ahora se bloquea con `overflow: hidden` en la raíz, que no reposiciona nada. La
     capa ya es `position: fixed` a pantalla completa con `overscroll-behavior: contain`,
     así que el fondo no se ve moverse aunque algún navegador lo permita. */
  let lockCount = 0;
  let prevHtmlOverflow = '';
  let prevBodyOverflow = '';
  function lockScroll() {
    if (typeof document === 'undefined') return;
    if (lockCount === 0) {
      prevHtmlOverflow = document.documentElement.style.overflow;
      prevBodyOverflow = document.body.style.overflow;
      const bar = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (bar > 0) document.body.style.paddingRight = bar + 'px';   // evita el salto al ocultar la barra
    }
    lockCount++;
  }
  function unlockScroll() {
    if (typeof document === 'undefined') return;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0) return;
    document.documentElement.style.overflow = prevHtmlOverflow;
    document.body.style.overflow = prevBodyOverflow;
    document.body.style.paddingRight = '';
  }

  // Modo desarrollador: interruptor único de config.developer.enabled.
  // Gobierna el botón "Descubrir toda la colección" y el campo "Semilla (opcional)".
  function devMode() {
    const cfg = (MI.data && MI.data.config) || {};
    return !!(cfg.developer && cfg.developer.enabled);
  }

  return { hash, rng, clamp, round1, el, byId, lockScroll, unlockScroll, devMode };
})();
