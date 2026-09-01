# CLAUDE.md — Guía de continuidad para ¡MALANDRINEITOR!

Este fichero existe para que cualquier modelo o persona que retome el proyecto sepa qué es, qué decisiones están tomadas y cómo continuar sin romper nada. Léelo entero antes de tocar código. El plan de fases está en `PLAN.md`; el estado de cada fase se actualiza allí, no aquí.

## Qué es

Juego de cartas en HTML/CSS/JavaScript, homenaje a la comunidad premium de Web Reactiva ("los malandrines"). Cada carta es un malandrín real (nombre público del directorio https://www.webreactiva.com/comunidad) con habilidades técnicas, una tecnología en la que es campeón (`expertise`) y un punto débil (`kryptonite`). Los jugadores representan a la empresa ficticia **Malandriner S.A. — "Especialistas en todo tipo de software"** y resuelven *tickets* (retos de desarrollo redactados en jerga profesional real) enviando a un malandrín. Se juega contra una IA heurística o contra otra persona por turnos.

Idioma del producto y de la documentación: **español**. Idioma de identificadores en código: **inglés**.

## Decisiones cerradas (no reabrir sin hablar con Fernando)

1. **Sin framework y sin build.** HTML + CSS + JS vanilla. Debe funcionar abriendo `index.html` con doble clic (protocolo `file://`) y servido desde GitHub Pages. Por eso los datos NO son JSON cargados con `fetch()` ni módulos ES (`import`), que el navegador bloquea en `file://`: son ficheros `.js` clásicos que asignan a `window.MI` y se cargan con `<script>` en orden.
2. **Cartas renderizadas como DOM (HTML/CSS/SVG), nunca como imágenes.** Los retratos son avatares SVG procedurales y deterministas generados a partir del nombre (`js/avatar.js`). **No se usan fotos de la web de la comunidad** ni ningún dato que no sea el nombre público y la descripción pública. Quien no quiera aparecer se retira añadiendo su `id` a `data/optout.js`.
3. **Oponente heurístico por defecto** (`js/ai.js`). Un LLM es opcional y futuro (Fase 4), solo para "personalidad" y comentarios, nunca imprescindible para jugar.
4. **Sin NFTs ni blockchain en el núcleo.** Si algún día hay cartas exclusivas, será con códigos firmados en cliente. Fuera del alcance actual.
5. **Todo configurable desde `data/`.** Añadir una habilidad, una tecnología, una carta o un reto es añadir una entrada a un fichero de datos. El motor no debe contener nombres de habilidades ni de tecnologías codificados.
6. **Sin iconos emoji en la interfaz ni en la documentación.** Iconografía solo SVG inline.
7. **Responsive obligatorio.** Cada pantalla nueva se comprueba a 390px y a 1400px (`tests/screenshots.js`). En móvil la mano es una fila con scroll horizontal y el botón principal queda fijo abajo.
8. **Tono de los textos**: humor blanco tipo tebeo clásico (Mortadelo y Filemón), jerga técnica real, nunca ofensivo ni dirigido a personas reales. La empresa rival de la máquina es **Boluda S.A.** (`config.rival`).
9. **Vocabulario fijo**: "ticket" (nunca "reto" ni "marrón" en la interfaz; la palabra "marrón" está prohibida en textos de juego y documentación), "mandar un malandriner", "se lleva la paga" (no "contrato"), "reputación", "burnout", "giro", "campeón", "criptonita".
10. **La interfaz nunca menciona ficheros ni rutas del proyecto.** Nada de "edita data/cards.js" o "ver README" en pantalla: eso va en esta documentación, no en el juego.
11. **El álbum solo muestra lo descubierto.** Una carta se descubre al conseguirla en el modo historia (basta haberla tenido una vez: `story.seen`). El arcade reparte al azar de toda la plantilla y es el único sitio donde se ve un malandrín sin descubrir. `config.demo.revealAllButton` añade en el álbum el botón "Descubrir toda la colección" (bandera `localStorage['mi.revealAll']`): **es solo para enseñar el juego; hay que ponerlo a `false` antes de compartirlo con la comunidad.**

## Estructura

```
index.html          Menú, álbum y partida (una sola página, vistas conmutadas por JS)
CLAUDE.md           Este fichero
PLAN.md             Fases, estado y criterios de aceptación
README.md           Para jugadores y contribuidores
css/theme.css       Variables de diseño (colores, tipografías, rarezas) y layout general
css/cards.css       Anatomía de la carta, rarezas, efecto holográfico, dorso
css/game.css        Pantalla de partida, HUD, log, animaciones
data/config.js      Parámetros del motor (fórmula, umbrales, puntos, burnout, IA)
data/skills.js      Catálogo de habilidades (id, nombre, grupo, descripción)
data/techs.js       Catálogo de tecnologías (id, nombre, grupo, alias)
data/cards.js       Cartas de malandrines
data/challenges.js  Tickets/retos
data/optout.js      Ids de cartas retiradas a petición de su titular
js/util.js          Hash determinista, RNG con semilla, utilidades DOM
js/avatar.js        Generador de avatares SVG
js/card.js          renderCard(card, opts) y renderCardBack()
js/engine.js        Cálculo de puntuación y resolución de un ticket (puro, sin DOM)
js/ai.js            Elección de carta por parte de la máquina
js/match.js         Partidas a dos jugadores por JSON (reparto, ofuscación, firma, resolución) y perfil en localStorage
js/scoring.js       Puntos malandrín (elementos que puntúan además de la reputación), puro
js/story.js         Modo historia: economía, sobres y su arte SVG, apertura cinematográfica, colección, descubrimiento y capítulos
js/rules.js         Vista de normas (lee los números de config)
js/album.js         Vista álbum
js/game.js          Estado de partida y pantallas del modo arcade (contra la máquina y a dos jugadores)
js/app.js           Router, alta de cuenta (nombre#0000), vista de perfil e histórico
docs/               Documentación de diseño (reglas, fórmula, guía de cartas)
```

## Modelo de datos (resumen; detalle en `docs/REGLAS.md`)

**Habilidad** (`data/skills.js`): `{ id, name, short, group, desc }`. Valores de carta de 1 a 10. Si una carta no declara una habilidad, vale `config.skills.defaultValue`. La habilidad `spec_driven` (IA: desarrollo dirigido por especificación) la tienen todos los malandrines porque la comunidad desarrolla agénticamente; el valor lo fija cada carta.

**Tecnología** (`data/techs.js`): `{ id, name, group, aliases[] }`. Es lo que una carta puede tener como `expertise` o como `kryptonite`, y lo que un reto declara como `tech` principal.

**Carta** (`data/cards.js`):
```js
{
  id: 'fernando-lopez',            // slug estable; es la semilla del avatar
  name: 'Fernando López',          // nombre público tal cual aparece en el directorio
  title: 'Ingeniero Blockchain · Identidad Digital · Criptografía ZK',
  rarity: 'rara',                  // comun | rara | epica | legendaria
  expertise: 'evm',                // id de data/techs.js  (bonus de campeón)
  kryptonite: { tech: 'react' },   // { tech: id } o { skill: id } o null
  skills: { blockchain: 10, seguridad: 8, ... },
  ability: { id: 'zk_shield', name: '...', text: '...' } | null,  // solo épicas/legendarias
  quote: 'Frase de carta',         // opcional
  notes: ''                        // bio libre, pendiente de rellenar
}
```

**Reto** (`data/challenges.js`):
```js
{
  id: 'pod-crashloop',
  title: 'CrashLoopBackOff en producción',
  situation: 'Texto en jerga profesional...',
  tech: 'kubernetes',              // tecnología principal (o null)
  difficulty: 3,                   // 1..5
  skills: { devops: 3, back: 1, observabilidad: 2 },  // pesos, no valores
  twist: { text: '...', skills: { seguridad: 2 }, tech: null } | null,
  tags: ['ops', 'incidente']
}
```

## Fórmula de resolución (implementada en `js/engine.js`, parámetros en `data/config.js`)

1. `base` = media ponderada de las habilidades de la carta según los pesos del reto (y del giro, si se revela). Escala 0–10.
2. **Campeón**: si `card.expertise === challenge.tech`, `score = config.champion.floor + base * config.champion.factor`. Con los valores por defecto (`floor 10`, `factor 0.4`) el rango es 10–14, por encima del máximo de 10 de cualquier carta sin expertise. **Regla de negocio: el campeón de la tecnología del reto siempre es la mejor opción.** Cualquier cambio de configuración debe respetar `floor >= 10`.
3. **Criptonita**: si la tecnología del reto coincide con `kryptonite.tech`, o la habilidad de mayor peso del reto coincide con `kryptonite.skill`, `score *= config.kryptonite.factor` (0.5 por defecto). Se aplica después del bonus de campeón (no puede darse a la vez: una carta no puede tener la misma tecnología como expertise y criptonita; `engine.validate()` lo comprueba).
4. **Suerte**: se suma un dado `d6` escalado (`config.luck.dieFaces`, `config.luck.scale`) — "el factor viernes".
5. **Umbral** por dificultad (`config.thresholds[difficulty]`). Resultado: `resolved` si `total >= umbral`, `improved` si `total >= umbral - config.improvedMargin`, `complicated` en caso contrario.
6. **Puntos de reputación** por resultado y dificultad en `config.points`. `complicated` manda la carta a *burnout* durante `config.burnoutTurns` turnos.
7. En cada ticket los dos jugadores mandan un malandriner al mismo ticket; quien obtiene mayor `total` se lleva la paga (`config.points.payBonus`).
8. El giro puede cambiar la tecnología principal (`twist.tech`): entonces el campeón se evalúa con la nueva tecnología y la criptonita también. Es el mecanismo del ticket "es un framework JavaScript… ¡es Vue!".

## Partidas a dos jugadores y perfil (`js/match.js`; detalle en `docs/DOS_JUGADORES.md`)

- Fichero JSON con `hands`, `tickets`, `players.A/B` y `status` (`A-playing` → `A-done` → `resolved`). Manos y tickets se derivan de `seed` con `MI.match.deal`, así cualquier navegador reconstruye la partida.
- Las jugadas de cada jugador (`{cardId, die}` por ticket) se guardan ofuscadas con un flujo XOR derivado de `config.secret + id de partida + rol`, en base64 (`blob`). El fichero completo lleva `sig` (doble FNV sobre el JSON canónico + secret). No es criptografía seria; evita trampas triviales y detecta manipulaciones accidentales.
- `MI.match.resolve` reproduce ambas jugadas de forma determinista (el dado se toma del fichero, las habilidades se reaplican) y comprueba legalidad (carta en mano y no quemada).
- Perfil en `localStorage['mi.profile']` firmado con la misma función; si la firma no cuadra, se reinicia y se avisa. `localStorage['mi.match.<id>']` recuerda si este navegador es A o B en cada partida.
- Partidas contra la máquina, de historia y a dos jugadores se registran en el perfil (una vez por `matchId`), con los puntos malandrín ganados. El perfil se puede exportar/importar como JSON firmado.

## Cuenta, puntos malandrín y modo historia

- **Cuenta**: al primer arranque se pide el nombre y se crea `profile.tag = nombre#NNNN` (cuatro dígitos aleatorios). Es el identificador que aparece en partidas y ficheros. No se vuelve a pedir el nombre en ningún modo.
- **Puntos malandrín** (`js/scoring.js`, valores en `config.scoring`): se calculan por ticket (resuelto, campeón, giro superado, criptonita desafiada, viernes perfecto, ticket gordo, paga, racha, rescate) y por sprint (sin burnout, pleno de pagas, victoria/empate), con multiplicador por nivel de la máquina. Se acumulan en `profile.points`. En dos jugadores los calcula `match.resolve` para ambos roles.
- **Rescate del calabozo** (habilidad activa de Daniel Primo): `engine.canRescue(hand, burnout, used)`. En pantalla aparece "Rescatar del calabozo" sobre las cartas quemadas cuando procede; se registra en `plays[i].rescue` y `match.resolve` lo reproduce con las mismas condiciones. Boluda lo usa automáticamente sobre su carta quemada de mayor rareza.
- **Modo historia** (`js/story.js`): estado `{ coins, owned:{id:n}, seen:{id:true}, chapter, wins:{}, opened, sprints, log, lastSquad }`. Sobres en `config.story.packs` (rango de cartas y pesos por rareza; `hidden: true` para los que no se venden en la tienda). Las repetidas **se conservan** y se venden a mano desde la colección por `config.story.sellPrice` (nunca la última copia). Los sobres gratuitos (bienvenida, emergencia) evitan repetidas. Diez capítulos en `config.story.chapters`: nivel de Boluda, rango de dificultad de los tickets (`minDifficulty`/`maxDifficulty`) y rarezas de su mano. Ganar el capítulo en curso desbloquea el siguiente; **perder devuelve al capítulo 1** (`config.story.onLoss: 'restart'`) conservando colección y malandricoins. La partida se juega con `MI.game.newStoryGame({hand, oppHand, tickets, level, onFinish})`; `onFinish(summary)` aplica `reward` y vuelve a la oficina.
- **Apertura de sobres**: `MI.story.cinematic(pack, onDone)` monta una capa a pantalla completa (`.opening-overlay`, fondo oscuro, sin scroll de fondo) con tres actos: el sobre (arte SVG generado por `MI.story.packSvg(packId)`, con temblor y rasgado), las cartas de una en una (destello radial por rareza, giro 3D de entrada, botón "Ver ficha" y "Siguiente carta") y el resumen final. Avanza con clic, Enter o espacio; Escape salta al resumen. **Toda apertura de sobre debe pasar por aquí**, incluida la de bienvenida y la de emergencia.
- Otras habilidades implementadas en el motor: `reactionary` (+2 al dado si la tecnología es React), `autoscaling` (+1 al dado en dificultad 4-5), `agent_swarm` (sin burnout), `no_weakness` (ignora giros), `mentor` (campeón si el ticket pide Docencia), `craftsman` (mejorado cuenta como resuelto en dificultad 1-2), `researcher` (ignora el giro si el ticket pide I+D), `dungeon_master` (inmune a criptonita y burnout, rescate).

## Convenciones de código

- Un único espacio de nombres global: `window.MI`. Cada fichero `js/` añade su módulo: `MI.engine`, `MI.ai`, `MI.card`, etc. Los datos van en `MI.data.*`.
- `js/engine.js` y `js/ai.js` son puros: no tocan el DOM, reciben estado y devuelven resultados. Así se pueden probar en Node con `node tests/run.js`.
- Determinismo: toda aleatoriedad pasa por `MI.util.rng(seed)`. Una partida con la misma semilla debe reproducirse.
- Sin dependencias externas. Sin CDN (debe funcionar sin red). Fuentes del sistema con una pila de respaldo.
- CSS con custom properties en `:root`; las rarezas se definen como clases `.rarity-comun`, `.rarity-rara`, `.rarity-epica`, `.rarity-legendaria`.
- Textos de interfaz en español, con tildes y signos de apertura. Jerga técnica tal como se usa en el sector (no traducir "deploy", "pod", "merge").

## Cómo probar

- Abrir `index.html` en el navegador (doble clic o `npx serve .`).
- Motor: `node tests/run.js` (comprueba validación de datos, regla de campeón, criptonita y reproducibilidad).
- Capturas y flujo completo a dos jugadores: `CHROME_PATH=/ruta/a/chrome node tests/screenshots.js` (Playwright, opcional). Genera `docs/img/*.png` en escritorio y móvil y falla si hay errores de consola.

## Cómo añadir contenido

- **Carta nueva**: añadir un objeto a `data/cards.js`. Solo son obligatorios `id`, `name`, `rarity`, `expertise`, `skills` (con `spec_driven`). Todo lo demás es opcional. Ejecutar `node tests/run.js` para validar.
- **Habilidad nueva**: añadir a `data/skills.js`. Ninguna carta necesita cambios (toman el valor por defecto).
- **Tecnología nueva**: añadir a `data/techs.js`. Comprobar que ningún `expertise`/`kryptonite`/`tech` queda huérfano (`tests/run.js` lo detecta).
- **Reto nuevo**: añadir a `data/challenges.js`. Los pesos de habilidades son relativos; usar de 1 a 3 y no más de cuatro habilidades por reto para que la elección tenga sentido.
- **Retirar a un malandrín**: añadir su `id` a `data/optout.js`. No borrar la carta: el historial de partidas guardadas puede referenciarla.

## Pendiente conocido / no hacer todavía

Ver `PLAN.md`. En particular: el LLM opcional y los retratos NO están implementados y no deben empezarse sin cerrar la fase en curso. Los avatares procedurales son provisionales: al final del proyecto se sustituirán por retratos inspirados en cada persona (con su permiso), usando `card.portrait`.

## Git y despliegue

El proyecto es un repositorio git normal. No hay build: lo que está en el árbol de trabajo es lo que se juega.

- `.gitignore` excluye `node_modules/`, `package-lock.json` y `docs/img/` (las capturas se regeneran con `tests/screenshots.js` y pesan más que el resto del proyecto junto).
- Para publicar en GitHub Pages: repositorio público `malandrineitor` y Pages sobre la rama principal. Queda en `https://<usuario>.github.io/malandrineitor` como *project site*, que **no** interfiere con la *user site* (`<usuario>.github.io`): una cuenta tiene una sola user site pero tantas project sites como repositorios. Antes de publicar, poner `config.demo.revealAllButton` a `false`.
