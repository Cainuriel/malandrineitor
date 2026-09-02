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
7. **Responsive obligatorio, con el móvil por delante.** Cada pantalla nueva se comprueba a 390px y a 1400px (`tests/screenshots.js`, y `tests/layout.js` en cinco formatos). El espacio vertical del móvil es el recurso escaso: nada de huecos reservados para contenido que todavía no existe. El botón principal queda fijo abajo.
8. **Tono de los textos**: humor blanco tipo tebeo clásico (Mortadelo y Filemón), jerga técnica real, nunca ofensivo ni dirigido a personas reales. La empresa rival de la máquina está **solo** en `config.rival` (hoy **Caballerosos S.A.**, "Software fino como seda medieval"): ningún texto de interfaz ni de `data/phrases.js` puede llevar su nombre escrito a mano. Las frases usan el marcador `{rival}`, que `MI.fx.splash` sustituye por el rival de esa partida —la empresa en el modo máquina, el nombre de la otra persona en las partidas a dos—. Escribirlo a mano provocó que, al recibir el fichero resuelto, el jugador viese ganar a la empresa en vez de a su rival humano; hay una prueba en `tests/run.js` que lo vigila. La clave interna de las rarezas de su mano es `rivalRarity`.
9. **Vocabulario fijo**: "ticket" (nunca "reto" ni "marrón" en la interfaz; la palabra "marrón" está prohibida en textos de juego y documentación), "mandar un malandriner", "se lleva la paga" (no "contrato"), "reputación", "burnout", "giro", "campeón", "criptonita".
10. **La interfaz nunca menciona ficheros ni rutas del proyecto.** Nada de "edita data/cards.js" o "ver README" en pantalla: eso va en esta documentación, no en el juego.
11. **El álbum solo muestra lo descubierto.** Una carta se descubre al conseguirla en el modo historia (basta haberla tenido una vez: `story.seen`). El arcade reparte al azar de toda la plantilla y es el único sitio donde se ve un malandrín sin descubrir. `config.developer.enabled` añade en el álbum el botón "Descubrir toda la colección" (bandera `localStorage['mi.revealAll']`): **es solo para enseñar el juego; hay que ponerlo a `false` antes de compartirlo con la comunidad.**

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
data/phrases.js     Onomatopeyas de tebeo y frases de victoria, derrota y empate
js/util.js          Hash determinista, RNG con semilla, utilidades DOM
js/avatar.js        Generador de avatares SVG
js/card.js          renderCard(card, opts) y renderCardBack()
js/engine.js        Cálculo de puntuación y resolución de un ticket (puro, sin DOM)
js/ai.js            Elección de carta por parte de la máquina
js/match.js         Partidas a dos jugadores por URL/JSON (reparto, ofuscación, firma, resolución) y perfil en localStorage
js/scoring.js       Puntos malandrín (elementos que puntúan además de la reputación), puro
js/story.js         Modo historia: economía, sobres y su arte SVG, apertura cinematográfica, colección, descubrimiento y capítulos
js/fx.js            Efectos de tebeo: sello de resultado por ticket y pantallazo de fin de sprint
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

- La partida firmada se comparte normalmente en el fragmento `#match=…` de una URL; el JSON descargable es el respaldo. Ambos contienen `hands`, `tickets`, `players.A/B` y `status` (`A-playing` → `A-done` → `resolved`). Manos y tickets se derivan de `seed` con `MI.match.deal`, así cualquier navegador reconstruye la partida.
- Las jugadas de cada jugador (`{cardId, die}` por ticket) se guardan ofuscadas con un flujo XOR derivado de `config.secret + id de partida + rol`, en base64 (`blob`). El fichero completo lleva `sig` (doble FNV sobre el JSON canónico + secret). No es criptografía seria; evita trampas triviales y detecta manipulaciones accidentales.
- `MI.match.resolve` reproduce ambas jugadas de forma determinista (el dado se toma del fichero, las habilidades se reaplican) y comprueba legalidad (carta en mano y no quemada).
- Perfil en `localStorage['mi.profile']` firmado con la misma función; si la firma no cuadra, se reinicia y se avisa. `localStorage['mi.match.<id>']` recuerda si este navegador es A o B en cada partida.
- **Las tres modalidades cuentan en el perfil**: arcade contra la máquina (`mode: 'ai'`), historia (`'story'`) y arcade a dos jugadores (`'p2p'`), una sola vez por `matchId`. Además de los totales, `profile.byMode` lleva el recuento exacto por modalidad, que es lo que muestra el panel "Por modo de juego": no se puede derivar del historial porque este se recorta a 50 entradas. El perfil se puede exportar/importar como JSON firmado.
- `profile.cardStats[id] = { sent, resolved, burnouts }` acumula el uso de cada carta. Se junta durante la partida en `S.stats.cards` y se vuelca una sola vez en `finish()` con `MI.match.profile.recordCards`, para no escribir en `localStorage` en cada ticket. Es lo que alimenta el panel "Tu plantilla" del perfil.
- **Dónde se compran y se venden las cartas**: la tienda vive en el modo historia, y se llega a ella desde ahí, desde el álbum y desde el perfil con `MI.story.openView('shop')` (si aún no hay partida empezada lleva a la pantalla de alta). El botón de venta aparece **solo a partir de la segunda copia**, en la vista Colección del modo historia y en el panel "Tu plantilla" del perfil; la última copia nunca se vende.
- El perfil vive en `localStorage`, que es **por origen**: el progreso de abrir `index.html` con doble clic (`file://`) y el de la versión publicada en GitHub Pages son independientes. Para llevarlo de uno a otro está exportar/importar.

## Cuenta, puntos malandrín y modo historia

- **Cuenta**: al primer arranque se pide el nombre y se crea `profile.tag = nombre#NNNN` (cuatro dígitos aleatorios). Es el identificador que aparece en partidas y ficheros. No se vuelve a pedir el nombre en ningún modo.
- **Puntos malandrín** (`js/scoring.js`, valores en `config.scoring`): se calculan por ticket (resuelto, campeón, giro superado, criptonita desafiada, viernes perfecto, ticket gordo, paga, racha, rescate) y por sprint (sin burnout, pleno de pagas, victoria/empate), con multiplicador por nivel de la máquina. Se acumulan en `profile.points`. En dos jugadores los calcula `match.resolve` para ambos roles.
- **Rescate del calabozo** (habilidad activa de Daniel Primo): `engine.canRescue(hand, burnout, used)`. En pantalla aparece "Rescatar del calabozo" sobre las cartas quemadas cuando procede; se registra en `plays[i].rescue` y `match.resolve` lo reproduce con las mismas condiciones. La máquina lo usa automáticamente sobre su carta quemada de mayor rareza.
- **Modo historia** (`js/story.js`): estado `{ coins, owned:{id:n}, seen:{id:true}, chapter, wins:{}, opened, sprints, log, lastSquad }`. Sobres en `config.story.packs` (rango de cartas y pesos por rareza; `hidden: true` para los que no se venden en la tienda). Las repetidas **se conservan** y se venden a mano desde la colección por `config.story.sellPrice` (nunca la última copia). Los sobres gratuitos (bienvenida, emergencia) evitan repetidas. Diez capítulos en `config.story.chapters`: nivel de la rival, rango de dificultad de los tickets (`minDifficulty`/`maxDifficulty`) y rarezas de su mano. Ganar el capítulo en curso desbloquea el siguiente; **perder devuelve al último punto de control** (`config.story.onLoss: 'checkpoint'`, puntos en `config.story.checkpoints`), conservando siempre colección y malandricoins. La partida se juega con `MI.game.newStoryGame({hand, oppHand, tickets, level, onFinish})`. **`onFinish(summary)` se llama en `finish()`, al terminar el sprint, no al pulsar el botón de la pantalla final**: aplica `reward` y guarda. Si esperase al clic, cerrar la pestaña en la pantalla de resultado haría perder las monedas y el avance de capítulo aunque la partida ya constase en el perfil. El botón solo navega.
- **Apertura de sobres**: `MI.story.cinematic(pack, onDone)` monta una capa a pantalla completa (`.opening-overlay`) con tres actos: el sobre (arte SVG generado por `MI.story.packSvg(packId)`, con temblor y rasgado), las cartas de una en una (destello radial por rareza y giro 3D de entrada) y el resumen final. Avanza con clic, Enter o espacio; Escape salta al resumen. **Toda apertura de sobre debe pasar por aquí**, incluida la de bienvenida y la de emergencia.
  Durante la cinemática **no se ofrece la ficha de la carta**: decisión de producto de Fernando, porque interrumpe el ritmo (y además la ficha abría por debajo de la capa). Las fichas se consultan después, en la colección o en el álbum.
- Otras habilidades implementadas en el motor: `reactionary` (+2 al dado si la tecnología es React), `autoscaling` (+1 al dado en dificultad 4-5), `agent_swarm` (sin burnout), `no_weakness` (ignora giros), `mentor` (campeón si el ticket pide Docencia), `craftsman` (mejorado cuenta como resuelto en dificultad 1-2), `researcher` (ignora el giro si el ticket pide I+D), `cartographer` (ignora el giro si el ticket pide análisis de datos), `root_access` (+1 al dado en Linux), `symfony_guard` (+1 al dado en Symfony), `dungeon_master` (inmune a criptonita y burnout, rescate).

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
- Maquetación en cinco formatos: `CHROME_PATH=/ruta/a/chrome node tests/layout.js`.

## Cómo añadir contenido

- **Carta nueva**: añadir un objeto a `data/cards.js`. Solo son obligatorios `id`, `name`, `rarity`, `expertise`, `skills` (con `spec_driven`). Todo lo demás es opcional. Ejecutar `node tests/run.js` para validar.
- **Habilidad nueva**: añadir a `data/skills.js`. Ninguna carta necesita cambios (toman el valor por defecto).
- **Tecnología nueva**: añadir a `data/techs.js`. Comprobar que ningún `expertise`/`kryptonite`/`tech` queda huérfano (`tests/run.js` lo detecta).
- **Reto nuevo**: añadir a `data/challenges.js`. Los pesos de habilidades son relativos; usar de 1 a 3 y no más de cuatro habilidades por reto para que la elección tenga sentido.
- **Retirar a un malandrín**: añadir su `id` a `data/optout.js`. No borrar la carta: el historial de partidas guardadas puede referenciarla.

## Pendiente conocido / no hacer todavía

Ver `PLAN.md`. En particular: el LLM opcional y los retratos NO están implementados y no deben empezarse sin cerrar la fase en curso. Los avatares procedurales son provisionales: al final del proyecto se sustituirán por retratos inspirados en cada persona (con su permiso), usando `card.portrait`.

## Capas a pantalla completa y scroll

Hay tres capas que ocupan la ventana entera: la apertura de sobres (`.opening-overlay`), la ficha ampliada (`.modal`) y el pantallazo de fin de sprint (`.fx-splash`). Todas siguen el mismo patrón, y conviene respetarlo al añadir otra:

- La capa es un bloque con `overflow-y: auto` y `overscroll-behavior: contain`; **el contenido se centra en un hijo** con `min-height: 100%` y `justify-content: center`. Centrar con `place-items: center` directamente en un contenedor con scroll recorta por arriba todo lo que sea más alto que la ventana, y esa parte ya no se puede alcanzar.
- El scroll del fondo se bloquea con `MI.util.lockScroll()` / `unlockScroll()`, que llevan un contador de capas abiertas, fijan el body guardando la posición y la restauran al cerrar. No usar `body { overflow: hidden }` a pelo: pierde la posición de lectura y no funciona bien en iOS.
## Cambiar el catálogo: añadir o retirar una carta

El reparto de una partida se deduce de su semilla recorriendo la lista de cartas activas, así que **cualquier cambio en el catálogo cambia la huella** (`M.catalogFingerprint`, que cubre los identificadores de cartas activas, los de tickets y `arcade.handSize` y `arcade.tickets`). Consecuencia única e importante:

> Los enlaces de partidas **en curso** creados antes del cambio dejan de abrirse. El juego lo dice con todas las letras ("se creó con otra versión del juego") y no reparte una partida distinta. Las partidas ya terminadas no se tocan: viven en el perfil como historial.

Así que sí, basta con hacer los cambios cuando no haya partidas a medias, o avisar a quienes las tengan de que hay que crearlas de nuevo. No hay corrupción posible; como mucho, hay que repetir un sprint.

### Añadir una carta

1. Añadir la entrada en `data/cards.js` con un `id` nuevo y único.
2. `node tests/run.js` valida el catálogo: esquema, habilidades y tecnologías existentes, rarezas.
3. Publicar. El álbum pasa a tener un malandrín más ("has descubierto X de N") y nadie pierde nada de lo que tuviera.

### Retirar una carta porque la persona lo pide

1. **Vía recomendada: añadir su `id` a `data/optout.js`.** La carta sigue en `cards.js` pero desaparece del álbum, de los repartos, de los sobres y de la plantilla, y deja de poder jugarse aunque alguien ya la tuviera.
2. Solo borrarla de `cards.js` si la persona pide que no quede ni el dato. Es menos seguro: una partida guardada o un JSON antiguo que la mencione tratará esas jugadas como "nadie disponible", porque la carta ya no existe para el motor. Con `optout` eso no pasa, porque el motor la sigue encontrando por su identificador.
3. Quien la tuviera conserva la entrada en su partida guardada, pero no puede alinearla. El total del álbum baja.

### Lo que no se debe hacer nunca

**Cambiar el `id` de una carta que ya está publicada.** Los identificadores son las claves de `owned`, `seen`, `strikes` y `cardStats`, y las jugadas de los enlaces guardan posiciones dentro de una mano deducida de esos identificadores. Renombrar uno huérfana todo eso en silencio: la colección de la gente pierde la carta y las estadísticas se quedan colgando de un identificador que ya no existe. Si cambia el nombre de la persona, se cambia `name`, nunca `id`.

Lo mismo vale para `arcade.handSize` y `arcade.tickets`: cambiarlos altera la huella y el tamaño del reparto.

## El enlace de la partida

El enlace lleva la partida en el fragmento `#match=`, en base64 URL-safe. **No es JSON: es un formato binario** (`v2`) de unos 70 bytes, que da un enlace de **130-155 caracteres**. Antes eran 1.100 de ida y **6.260 de vuelta**, y algunas aplicaciones de mensajería solo hacen pulsable el principio de un enlace largo, así que al tocarlo llegaba cortado.

De dónde salía el exceso, por orden de importancia:

1. **`result` viajaba dentro** y son tres cuartas partes del payload. No hace falta: se reconstruye con `M.rebuildResult`, que es determinista porque los dados van dentro de las jugadas.
2. **Doble base64.** Las jugadas ofuscadas ya eran base64 y luego se codificaba el JSON entero: 1,78× de inflado sobre los mismos datos.
3. **Se mandaban nombres de carta y de ticket** que se deducen de `seed` con `M.deal`.
4. **Las jugadas iban como JSON.** Cinco jugadas caben en cinco bytes: la carta es su posición en la mano (0-4, o 7 si no había nadie) y el dado son tres bits. Un sexto byte describe el rescate del calabozo, que ocurre como mucho una vez. Esos seis bytes siguen cifrados con el mismo flujo XOR, así que las jugadas no se ven.

Un hash **no** habría servido, ni con semilla fija: no es cifrado, es una reducción con pérdida de información y no se puede revertir. Para acortar solo hay dos caminos: quitar redundancia (esto) o un servidor que guarde la partida y devuelva un identificador corto, que aquí no existe a propósito.

Estructura del payload: versión, estado, **longitud total declarada**, id, semilla, fecha en segundos, huella del catálogo, y por jugador su estado, su nombre y sus seis bytes de jugadas; al final, ocho bytes de firma.

Dos salvaguardas que no se deben quitar:

- **La huella del catálogo** (`M.catalogFingerprint`) cubre los identificadores de cartas activas, los de tickets y el tamaño de mano y de sprint. Como el reparto se deduce de la semilla, si el catálogo cambiase entre que uno crea la partida y el otro la abre, el reparto sería otro y las jugadas dejarían de ser legales **en silencio**. Con la huella se avisa y no se juega.
- **La longitud declarada** va en la cabecera porque la firma va al final: sin ella, un enlace cortado pierde la firma y se confundiría con uno manipulado, que manda a buscar donde no es.

Si una partida no es reproducible desde su semilla (manos puestas a mano, catálogo distinto), `toUrlPayload` cae al **formato largo** en JSON, que es autosuficiente. En una partida normal no ocurre nunca. Los enlaces del formato anterior se siguen abriendo: se detectan porque su primer byte es `{`.

Tres averías, tres mensajes. Confundirlos manda a la gente a buscar donde no es:

- **Enlace cortado** (la longitud no cuadra, o no descodifica): "ha llegado incompleto", con la sugerencia de reenviarlo o pegarlo entero.
- **Enlace retocado** (longitud correcta, firma que no cuadra): "la firma no coincide".
- **Enlace propio abierto por su autor** (`role.get(id) === 'A'` con estado `A-done`): no es un error. Se muestra el panel `.shared-match.own` explicando que falta que juegue el rival, con botones para volver a compartirlo o descargar el JSON. Antes era un `alert` que dejaba al jugador en la pantalla de arcade sin contexto, y se leía como "el enlace está roto".

El desplegable de carga acepta tanto el JSON como **un enlace pegado entero**: es la vía de rescate cuando el chat solo hace pulsable un trozo pero el texto completo se puede copiar. El fichero JSON conserva `result` y el reparto: es la copia legible y autosuficiente.

## Quemaduras de las cartas

Cada burnout acumulado de la campaña (`story.strikes[id]`) pinta una esquina chamuscada en la carta: `MI.card.render(card, { burns: n })`. Como al llegar a `config.story.burnoutLimit` (3) el malandrín deja la empresa, en pantalla nunca se ven más de dos.

- Las dos quemaduras van **abajo**, sobre el pie de la carta. Arriba está el nombre y no se puede tapar: la carta tiene que seguir identificando a una persona real.
- El centro de los círculos es el propio vértice, así que solo se ve un cuarto: la esquina se ha consumido, no hay un agujero en medio.
- El borde no es un arco perfecto porque un filtro SVG de `feTurbulence` + `feDisplacementMap` lo deforma (`#mi-quemadura-1..3`, declarados en `index.html`). La semilla se elige con `MI.util.hash(card.id + '|' + i)`: dos quemaduras nunca salen calcadas y la misma carta se ve siempre igual.
- La brasa late y suben dos volutas de humo; ambas cosas se desactivan con `prefers-reduced-motion`.
- Se pasan a: la colección y la elección de plantilla (modo historia), el mazo y la carta enviada durante el sprint, y la ficha ampliada. El arcade no las muestra: reparte manos sueltas y no tiene colección que desgastar.

## La ficha ampliada

Se cierra pulsando **en cualquier sitio**, no solo en el botón, que además es flotante (`position: fixed`). Dos cautelas: si el gesto ha sido un arrastre de más de 8px o hay texto seleccionado no cuenta como clic, y `close()` lleva una guarda contra el doble cierre, porque el clic del botón sigue subiendo hasta el modal y `unlockScroll()` se llamaría dos veces, descuadrando el contador de bloqueos.

## La pantalla de partida

La mano **no** es una fila de cartas: es un **mazo** dentro del hueco "Tu malandrín" (`renderDeck` en `js/game.js`). La carta activa va delante y las demás asoman detrás, escaladas, giradas y oscurecidas. Se cambia de carta arrastrando (`pointerdown/move/up` con umbral de 40px), con las flechas del teclado, con los botones Anterior/Siguiente o pulsando una carta lateral.

Decisiones que conviene no deshacer sin motivo:

- **La carta activa es la que se envía.** No hay un paso de "seleccionar" separado: `layout()` fija `S.selected` y sincroniza el texto del botón (`sendLabel`, `syncSend`). En móvil ahorra un toque y elimina el estado "has elegido pero no se ve".
- **El mazo se repinta solo, sin `render()` completo.** `layout()` mueve transformaciones y opacidades sobre nodos ya creados; llamar a `render()` en cada deslizamiento perdería la animación y recrearía cincuenta SVG.
- **El hueco del rival no se dibuja mientras se elige.** En modo máquina aparece al enviar, con la carta ya visible (`.slot.opp-reveal`). En dos jugadores no aparece nunca: hasta resolver no hay nada que enseñar. En su lugar va `.opp-strip`, una franja de una línea. Antes eran dos huecos vacíos de 320px de alto: en móvil ocupaban una pantalla entera para no decir nada.
- **Los bordes del mazo se difuminan** con `mask-image` en `.deck` en lugar de recortar en seco: se ve que el mazo continúa.
- **Un malandrín quemado se puede tener delante** (para rescatarlo con Daniel Primo), pero el botón de enviar se bloquea y `play()` no lo acepta.

- `MI.util.el` acepta propiedades personalizadas en `style` (`--sk`, `--q`) porque las pasa por `setProperty`. `Object.assign(node.style, …)` **las descarta en silencio**: durante un tiempo las barras de habilidad se pintaron todas del color por defecto por este motivo.
- Los elementos de rejilla y flex que contengan texto largo necesitan `min-width: 0`; si no, no bajan del ancho de su contenido y desbordan (pasó con el marcador y con la mano de cartas).

`tests/layout.js` recorre las vistas y estas capas en cinco formatos (móvil vertical y apaisado, tablet, portátil y pantalla grande) comprobando que no hay desbordamiento horizontal, que nada queda recortado por arriba, que el scroll del fondo se restaura y que no hay errores de consola. **Ejecutarlo tras cualquier cambio de maquetación.**

## Efectos de tebeo (`js/fx.js`)

- `MI.fx.stamp(outcome, { pay })` devuelve el sello que se superpone a la carta enviada al revelar un ticket: rayos, palabra grande (RESUELTO / MEJORADO / COMPLICADO), onomatopeya y coletilla, ambas sacadas al azar de `data/phrases.js`. Se desvanece solo a los 1,5 s para no tapar el desglose de puntuación y lleva `pointer-events: none`.
- `MI.fx.splash(kind, { title, score, phrase, onDone })` es el pantallazo de fin de sprint (`win` / `loss` / `draw`), con título de tebeo, marcador, frase al azar y cierre por clic, Enter, Escape o a los 6 s. Se muestra una sola vez por partida (`S.splashDone`).
- Ambos respetan `prefers-reduced-motion`: la clase `fx-still` y una regla de medios desactivan las animaciones.
- La tipografía es una pila de sistema con Impact a la cabeza (`--fx-font`): no se descargan fuentes, el juego debe funcionar sin red.

## Desgaste de las cartas

En el modo historia, un malandrín que termina un ticket en "complicado" suma un burnout. Al llegar a `config.story.burnoutLimit` (3) **deja la empresa**: se pierde una copia de la carta. Implementado en `MI.story.wearAndTear(state, summary)`, que se llama desde `reward()` al terminar el sprint.

Decisiones y por qué:

- **Se aplica al final del sprint, nunca durante.** Quitar una carta de la mano a media partida dejaría al jugador sin poder jugarla y sin explicación; además ya está en burnout el resto del sprint.
- **Se pierde una copia, no la carta entera.** Con dos copias te queda una, así que los repetidos valen como seguro además de como venta.
- **`config.story.burnoutReset: true`**: el contador vuelve a cero si el malandrín termina un sprint entero sin quemarse. Es lo que convierte la regla en estrategia en vez de en una cuenta atrás inevitable. Medido sobre 200 campañas completas:

  | política | cartas perdidas por campaña (mediana) | p90 | máximo | campañas con alguna baja |
  |---|---|---|---|---|
  | 3 burnouts, contador de por vida | 1 | 3 | **34** | 68 % |
  | 3 burnouts, contador a cero al sobrevivir | 0 | 2 | 8 | 38 % |
  | 2 burnouts, contador a cero al sobrevivir | 1 | 3 | 7 | 73 % |

  Con contador de por vida la atrición se dispara al final de la campaña (cada carta se queda clavada en 2 y muere al siguiente tropiezo). Con reinicio, la amenaza es constante pero acotada. El simulador juega de forma óptima, así que una persona perderá algo más.
- **El aviso es parte de la mecánica**: la colección y el panel "Tu plantilla" del perfil muestran a cuántos burnouts está cada uno ("2 de 3 · en la cuerda floja"), y el resumen del sprint avisa de quién se acerca al límite. Sin ese aviso la regla sería castigo aleatorio, no decisión.
- **Daniel Primo es inmune al burnout**, así que nunca se va.
- El texto dice **"deja Malandriner S.A."**, no "destruida": son personas reales de la comunidad y el tono importa.
- Solo aplica al modo historia. El arcade reparte manos aleatorias y no tiene colección que desgastar.

## Equilibrio de la campaña

Medido con simulaciones de la campaña completa (200 partidas, jugador que compra el mejor sobre que puede pagar y manda siempre a su mejor carta). Sprints necesarios para superar los diez capítulos según `config.story.onLoss`:

| onLoss | mediana | media | p90 | máximo |
|---|---|---|---|---|
| `retry` (repetir capítulo) | 12 | 13,0 | 17 | 25 |
| `checkpoint` (por defecto) | 16 | 18,4 | 28 | 52 |
| `restart` (volver al 1) | 42 | 59,2 | 129 | 337 |

`restart` se descartó: encadenar diez capítulos sin fallar tiene una probabilidad del orden del 0,2 % con una colección pequeña, así que la campaña se convertía en repetir los capítulos fáciles decenas de veces. `checkpoint` mantiene la tensión (perder cuesta) sin castigar de forma desproporcionada. Si se retoca la dificultad de los capítulos o la economía, **rehacer esta medición**: el guion de simulación no está en el repositorio, pero se reconstruye llamando a `MI.story.reward` y a `MI.engine.resolve` en bucle desde Node, como en `tests/run.js`.

## Git y despliegue

El proyecto es un repositorio git normal. No hay build: lo que está en el árbol de trabajo es lo que se juega.

- `.gitignore` excluye `node_modules/`, `package-lock.json` y `docs/img/` (las capturas se regeneran con `tests/screenshots.js` y pesan más que el resto del proyecto junto).
- Para publicar en GitHub Pages: repositorio público `malandrineitor` y, en Settings → Pages, *Deploy from a branch* con la rama `master` y la carpeta `/ (root)`. Queda en `https://<usuario>.github.io/malandrineitor` como *project site*, que **no** interfiere con la *user site* (`<usuario>.github.io`): una cuenta tiene una sola user site pero tantas project sites como repositorios.
- El fichero vacío `.nojekyll` en la raíz desactiva el paso de Jekyll: el despliegue es directo y ningún fichero o carpeta se ignora por convenciones ajenas al proyecto. No borrarlo.
- Antes de publicar para la comunidad, poner `config.developer.enabled` a `false`.
