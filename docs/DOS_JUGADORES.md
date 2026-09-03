# Partidas a dos jugadores por enlace

Protocolo asíncrono sin servidor. La partida firmada se codifica en el fragmento `#match=…` de la URL, que el navegador no envía al servidor. El fichero JSON sigue disponible como copia de respaldo. Implementado en `js/match.js`; la pantalla está en `js/game.js`.

## Flujo

1. **A crea la partida.** Se genera `seed`. De `seed` salen, de forma determinista, las dos manos (A: primeras N cartas del mazo barajado; B: las N siguientes) y la lista de tickets. Se guarda en `localStorage['mi.match.<id>'] = 'A'`.
2. **A juega a ciegas** sus tickets. En cada uno ve su propio resultado (giro incluido) pero no el del rival. Al terminar, sus jugadas `[{cardId, die}]` se ofuscan y se escriben en `players.A.blob`. `status = 'A-done'`. A comparte el enlace generado.
3. **B abre el enlace.** Se comprueba la firma y, si todavía no tiene cuenta, completa el alta antes de abrir la partida. B juega a ciegas con la mano B. Al terminar, se ofuscan sus jugadas, se revelan las de A y `MI.match.resolve` recalcula los cinco tickets, la paga de cada uno y la reputación final. `status = 'resolved'`. B ve la tabla y comparte el enlace resuelto; el resultado no viaja dentro del enlace, se reconstruye al abrirlo.
4. **A abre el enlace resuelto** y ve la misma tabla. Su navegador sabe que es A por `localStorage`.

Como alternativa, ambos estados se pueden descargar y cargar como JSON. Los dos transportes representan la misma partida y producen el mismo resultado, pero no llevan los mismos datos: el JSON es autosuficiente y legible; el enlace elimina todo lo que puede deducirse de la semilla.

## JSON de respaldo (`v1`)

El fichero descargable conserva el reparto, los tickets y, cuando existe, el resultado. Las jugadas de cada jugador están en `blob`, ofuscadas y codificadas en base64.

```json
{
  "v": 1, "id": "m-…", "seed": "…", "created": "ISO",
  "hands": { "A": ["id", …], "B": ["id", …] },
  "tickets": ["id", …],
  "players": { "A": { "name": "Ana", "done": true, "blob": "base64" }, "B": { "name": null, "done": false, "blob": null } },
  "status": "A-done", "result": null,
  "sig": "16 hex"
}
```

La firma `sig` son 16 caracteres hexadecimales calculados con dos hashes FNV encadenados sobre el JSON canónico más `config.secret`. Cualquier cambio en manos, tickets, nombres, blobs o resultado invalida la firma.

## Enlace compacto (`v2`)

El fragmento `#match=…` contiene base64 URL-safe de un formato binario. En una partida normal lleva, por este orden:

- versión, estado y longitud total declarada;
- identificador, semilla y fecha de creación;
- huella del catálogo y de los parámetros del reparto;
- estado y nombre de cada jugador;
- seis bytes cifrados por cada jugador que haya terminado: cinco jugadas y un posible rescate;
- ocho bytes de firma.

Cada jugada ocupa un byte: tres bits identifican la posición de la carta en la mano y otros tres guardan el dado. Las manos y los tickets se regeneran con `MI.match.deal`; si el estado es `resolved`, `MI.match.rebuildResult` vuelve a calcular el resultado.

Si una partida no puede reproducirse desde su semilla, `MI.match.toUrlPayload` usa como respaldo el formato largo anterior, un JSON firmado en base64 URL-safe. Los enlaces antiguos se siguen aceptando.

## Ofuscación y firma

- En el JSON, `blob = base64(bytes(JSON({playerSeed, plays})) XOR flujo(rng(hash(secret + '|' + id + '|' + rol))))`.
- En el enlace `v2`, los seis bytes de jugadas se cifran con el mismo flujo XOR, sin envolverlos primero en JSON ni base64.
- El JSON usa la firma hexadecimal descrita arriba; el enlace firma directamente su cuerpo binario y añade ocho bytes al final.
- Limitaciones conocidas y aceptadas: el secreto está en el código; quien lo lea puede fabricar ficheros. Es un juego para una comunidad pequeña.

## Reglas de resolución

- El dado de cada jugada se toma del fichero (se lanzó en su navegador con su propio generador). Las habilidades de las cartas se reaplican al resolver, por lo que el resultado no depende del navegador.
- Una jugada con una carta que no está en la mano, o que estaba en burnout en ese ticket, cuenta como "nadie disponible" (penalización de la dificultad).
- No hay eliminación por llegar a cero en este modo: se comparan reputaciones al final.

## Tamaño del enlace

El enlace ocupa **130-155 caracteres**. No lleva JSON, sino un formato binario de unos 70 bytes: el resultado se reconstruye al abrirlo, las manos y los tickets se deducen de la semilla, y cada jugada cabe en un byte (la carta es su posición en la mano, el dado son tres bits). Las jugadas siguen cifradas.

El enlace incluye una huella de las cartas activas, los tickets, el tamaño de las manos y la longitud del sprint. Si alguno cambia, el reparto podría ser otro, así que en vez de jugar una partida distinta el juego avisa y pide que se cree de nuevo. La longitud declarada permite distinguir un enlace cortado de otro cuya firma no coincide.

## Cuando algo falla

- *"Ha llegado incompleto"*: el enlace se cortó por el camino. Que te lo reenvíen, o cópialo entero manteniéndolo pulsado y pégalo en "Pegar un enlace o cargar el JSON".
- *"La firma no coincide"*: el contenido se ha modificado, o es de otra versión del juego.
- *"Se creó con otra versión del juego"*: el catálogo de cartas o de tickets ha cambiado desde que se creó la partida. Hay que crearla de nuevo.
- *"Esta partida la creaste tú"*: no es un error. Ya jugaste tu turno y falta que lo juegue el rival. Desde ahí puedes volver a compartir el enlace.
