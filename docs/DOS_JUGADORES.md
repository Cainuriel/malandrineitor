# Partidas a dos jugadores por enlace

Protocolo asíncrono sin servidor. La partida firmada se codifica en el fragmento `#match=…` de la URL, que el navegador no envía al servidor. El fichero JSON sigue disponible como copia de respaldo. Implementado en `js/match.js`; la pantalla está en `js/game.js`.

## Flujo

1. **A crea la partida.** Se genera `seed`. De `seed` salen, de forma determinista, las dos manos (A: primeras N cartas del mazo barajado; B: las N siguientes) y la lista de tickets. Se guarda en `localStorage['mi.match.<id>'] = 'A'`.
2. **A juega a ciegas** sus tickets. En cada uno ve su propio resultado (giro incluido) pero no el del rival. Al terminar, sus jugadas `[{cardId, die}]` se ofuscan y se escriben en `players.A.blob`. `status = 'A-done'`. A comparte el enlace generado.
3. **B abre el enlace.** Se comprueba la firma y, si todavía no tiene cuenta, completa el alta antes de abrir la partida. B juega a ciegas con la mano B. Al terminar, se ofuscan sus jugadas, se revelan las de A y `MI.match.resolve` recalcula los cinco tickets, la paga de cada uno y la reputación final. `status = 'resolved'`, `result` queda en la partida. B ve la tabla y comparte el enlace resuelto.
4. **A abre el enlace resuelto** y ve la misma tabla. Su navegador sabe que es A por `localStorage`.

Como alternativa, ambos estados se pueden descargar y cargar como JSON. El contenido y la validación son idénticos en los dos transportes.

## Formato

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

## Ofuscación y firma

- `blob = base64(bytes(JSON({playerSeed, plays})) XOR flujo(rng(hash(secret + '|' + id + '|' + rol))))`. Cualquier navegador con el mismo `config.secret` puede revelarlo; el objetivo es que B no lea las jugadas de A abriendo el fichero en un editor.
- `sig = FNV1a(canónico(fichero sin sig) + secret)` encadenado dos veces. Cualquier cambio en manos, tickets, nombres o blobs invalida la firma.
- Limitaciones conocidas y aceptadas: el secreto está en el código; quien lo lea puede fabricar ficheros. Es un juego para una comunidad pequeña.

## Reglas de resolución

- El dado de cada jugada se toma del fichero (se lanzó en su navegador con su propio generador). Las habilidades de las cartas se reaplican al resolver, por lo que el resultado no depende del navegador.
- Una jugada con una carta que no está en la mano, o que estaba en burnout en ese ticket, cuenta como "nadie disponible" (penalización de la dificultad).
- No hay eliminación por llegar a cero en este modo: se comparan reputaciones al final.

## Tamaño del enlace

El enlace ocupa **130-155 caracteres**. No lleva JSON, sino un formato binario de unos 70 bytes: el resultado se reconstruye al abrirlo, las manos y los tickets se deducen de la semilla, y cada jugada cabe en un byte (la carta es su posición en la mano, el dado son tres bits). Las jugadas siguen cifradas.

El enlace incluye una huella del catálogo de cartas y tickets. Si el catálogo cambia, el reparto sería otro, así que en vez de jugar una partida distinta el juego avisa y pide que se cree de nuevo.

## Cuando algo falla

- *"Ha llegado incompleto"*: el enlace se cortó por el camino. Que te lo reenvíen, o cópialo entero manteniéndolo pulsado y pégalo en "Pegar un enlace o cargar el JSON".
- *"La firma no coincide"*: el contenido se ha modificado, o es de otra versión del juego.
- *"Se creó con otra versión del juego"*: el catálogo de cartas o de tickets ha cambiado desde que se creó la partida. Hay que crearla de nuevo.
- *"Esta partida la creaste tú"*: no es un error. Ya jugaste tu turno y falta que lo juegue el rival. Desde ahí puedes volver a compartir el enlace.
