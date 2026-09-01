# Partidas a dos jugadores por fichero

Protocolo asíncrono sin servidor. Implementado en `js/match.js`; la pantalla está en `js/game.js`.

## Flujo

1. **A crea la partida.** Se genera `seed`. De `seed` salen, de forma determinista, las dos manos (A: primeras N cartas del mazo barajado; B: las N siguientes) y la lista de tickets. Se guarda en `localStorage['mi.match.<id>'] = 'A'`.
2. **A juega a ciegas** sus tickets. En cada uno ve su propio resultado (giro incluido) pero no el del rival. Al terminar, sus jugadas `[{cardId, die}]` se ofuscan y se escriben en `players.A.blob`. `status = 'A-done'`. A descarga o copia el fichero.
3. **B carga el fichero** (subiéndolo o pegándolo). Se comprueba la firma. B juega a ciegas con la mano B. Al terminar, se ofuscan sus jugadas, se revelan las de A y `MI.match.resolve` recalcula los cinco tickets, la paga de cada uno y la reputación final. `status = 'resolved'`, `result` queda en el fichero. B ve la tabla y descarga el fichero resuelto.
4. **A carga el fichero resuelto** y ve la misma tabla. Su navegador sabe que es A por `localStorage`.

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
