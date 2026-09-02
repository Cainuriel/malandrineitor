# ¡MALANDRINEITOR!

Juego de cartas en HTML, homenaje a la comunidad premium de Web Reactiva. Cada carta es un malandrín; los jugadores dirigen **Malandriner S.A., "Especialistas en todo tipo de software"**, y resuelven tickets enviando a la persona adecuada.

Estado: **Fase 4** (50 cartas, 115 tickets, modo historia de 10 capítulos con sobres y álbum por descubrir). Ver `PLAN.md`.

## Jugar

Abre `index.html` en el navegador. No necesita servidor, red ni instalación. Si prefieres servirlo: `npx serve .`

## Reglas en un minuto

- Cada carta tiene habilidades (1–10), una tecnología en la que es **campeón** y una **criptonita** (tecnología o habilidad que se le da fatal).
- Cada ticket pide unas habilidades con pesos y, a veces, declara una tecnología principal. Puede esconder un **giro** que se revela después de elegir.
- Puntuación = media ponderada de habilidades + factor viernes (dado). Si eres campeón de la tecnología del ticket, tu puntuación sube por encima de cualquiera que no lo sea. Si el ticket toca tu criptonita, se reduce a la mitad.
- Resultado frente al umbral de dificultad: resuelto, mejorado o complicado. Complicado manda al malandrín a burnout dos tickets.
- Los dos jugadores mandan un malandriner al mismo ticket; el mejor total se lleva la paga. Gana quien acaba el sprint con más reputación (contra la máquina, quien llega a cero queda eliminado).

## Dos jugadores por enlace

Uno crea la partida y juega sus cinco tickets a ciegas; comparte el enlace generado con su rival. El rival lo abre, juega los mismos tickets con su propia mano y devuelve otro enlace con la partida resuelta. Las jugadas van ofuscadas y la partida firmada; no es seguridad, es para que no sea trivial hacer trampas. El enlace ronda los 140 caracteres: lleva la partida entera comprimida en formato binario, sin servidor de por medio. El JSON se puede descargar como respaldo. Detalle en `docs/DOS_JUGADORES.md`.

## Cuenta, puntos y modo historia

Al abrir el juego por primera vez se te pide un nombre de malandrín; se le añade un número (nombre#1234) para que no coincida con nadie. Todo lo demás (puntos malandrín acumulados, histórico de partidas, progreso de la historia) se guarda en ese navegador, firmado, y se puede exportar e importar desde "Perfil".

En el modo historia fichas por Malandriner S.A. con un sobre de bienvenida y unos pocos malandricoins, juegas capítulos contra la empresa rival con una plantilla de cinco cartas de tu colección, cobras por ticket y por sprint, compras sobres (básico, pro y calabozo) y completas el álbum. Las normas completas están en la pestaña "Normas".

## Añadir o editar contenido

Todo está en `data/`: `cards.js` (cartas), `skills.js` (habilidades), `techs.js` (tecnologías), `challenges.js` (tickets), `config.js` (números del motor). Tras editar, `node tests/run.js` valida los catálogos.

## Verificación

- `node tests/run.js` valida catálogos y motor.
- `CHROME_PATH=/ruta/a/chrome node tests/layout.js` revisa la maquetación en móvil, móvil apaisado, tablet, portátil y pantalla grande.
- `CHROME_PATH=/ruta/a/chrome node tests/screenshots.js` genera capturas y recorre el flujo a dos jugadores.

## Opciones de desarrollador

El interruptor `developer.enabled`, en `data/config.js`. Con `true` aparecen el botón "Descubrir toda la colección" del álbum y el campo "Semilla (opcional)" del arcade, útiles para enseñar el juego sin jugarlo entero y para repetir un reparto concreto. La versión pública lo lleva a `false`.

## Añadir o retirar una carta

Los nombres proceden del directorio público de la comunidad; los retratos son avatares generados, no fotos. Si no quieres aparecer, añade tu `id` a `data/optout.js` (o pídeselo a Fernando): la carta deja de mostrarse, de entrar en los repartos y de poder jugarse, aunque alguien ya la tuviera. Para añadir una, basta con una entrada nueva en `data/cards.js` con un `id` único.

Dos cosas a tener en cuenta:

- El reparto de cada partida se deduce de su semilla recorriendo la lista de cartas activas, así que **al cambiar el catálogo dejan de abrirse los enlaces de partidas en curso**. El juego lo avisa y pide crearlas de nuevo; nada se corrompe y las partidas terminadas no se tocan. Conviene hacer los cambios cuando no haya sprints a medias.
- **Nunca se cambia el `id` de una carta ya publicada**: es la clave con la que se guardan las colecciones, las estadísticas y las jugadas. Si cambia el nombre de la persona, se cambia `name`.

Después de tocar `data/`, `node tests/run.js` valida el catálogo.

## Para continuar el desarrollo

Lee `CLAUDE.md` (decisiones, estructura, fórmula) y `PLAN.md` (fases y estado).
