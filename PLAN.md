# PLAN.md — Fases de ¡MALANDRINEITOR!

Estado: se actualiza al cerrar cada fase. Convención: `[ ]` pendiente, `[~]` en curso, `[x]` hecho.

Principio rector: cada fase termina con algo usable y publicable. Si el trabajo se interrumpe, lo entregado hasta la última fase cerrada sigue funcionando.

---

## Fase 0 — Concepto y decisiones `[x]`

Decisiones tomadas con Fernando (ver `CLAUDE.md`, sección "Decisiones cerradas"): sin Piecepack, sin framework, cartas en DOM con avatares procedurales, sin fotos, oponente heurístico, sin NFTs, multijugador por JSON, bonus de campeón por tecnología, criptonita por carta, catálogo amplio de habilidades con `spec_driven` universal.

---

## Fase 1 — PoC visual y dinámica `[x]`

Objetivo: que Fernando vea el estilo de las cartas y juegue un ticket completo contra la máquina.

Alcance:
- [x] Estructura del proyecto, `CLAUDE.md`, `PLAN.md`, `README.md`.
- [x] Catálogo de habilidades (`data/skills.js`) con grupos y descripciones.
- [x] Catálogo de tecnologías (`data/techs.js`).
- [x] 11 cartas iniciales (`data/cards.js`): Daniel Primo (legendaria), José Manuel Gómez, Camilo Nevot, Andrés Cabrera, Yuri (épicas), Fernando López, Daniel M, Paco Caja (raras), Vicent Pérez, HolTrix, Xabat Karrera (comunes).
- [x] 12 retos iniciales (`data/challenges.js`) con giros.
- [x] Generador de avatares SVG determinista.
- [x] Renderizador de carta con cuatro rarezas, efecto holográfico e inclinación 3D.
- [x] Vista álbum con filtros por rareza y búsqueda.
- [x] Motor de resolución puro con tests en Node.
- [x] IA heurística con tres niveles.
- [x] Pantalla de partida (modo arcade PoC): 5 tickets, mano de 5, HUD, log, fin de partida.

Criterios de aceptación:
- `index.html` funciona con doble clic sin red.
- `node tests/run.js` pasa.
- El campeón de la tecnología del reto obtiene siempre la mejor puntuación base.
- Fernando valida el estilo visual. Validado el 1 de septiembre de 2026 ("me ha gustado").

Fuera de alcance en esta fase: persistencia, sonido, modo historia, responsive fino para móvil.

---

## Fase 2a — Feedback de la PoC, dos jugadores y perfil `[x]`

- [x] Responsive (390px comprobado): mano con scroll horizontal, HUD compacto, botón principal fijo, modal de ficha apilado.
- [x] Botón "Ver ficha" en la mano, con las habilidades del ticket resaltadas y el ticket en curso indicado.
- [x] Resaltado fuerte de habilidades pedidas (fila naranja, barra dorada, resto atenuado).
- [x] Empresa rival de la máquina, configurable en `config.rival`.
- [x] Textos: "mandáis un malandriner para el mismo ticket", "se lleva la paga".
- [x] Tono de humor tipo tebeo en los 30 tickets; ticket "¡es Vue!" con giro de tecnología; criptonita de José Manuel = Vue; habilidad "Reactionario".
- [x] Arcade a dos jugadores por fichero JSON (A juega a ciegas → B juega y resuelve → A ve el resultado), con ofuscación y firma.
- [x] Perfil de jugador en localStorage firmado (partidas, victorias, mejor reputación, historial).
- [x] Tests del protocolo y capturas automatizadas del flujo completo.

## Fase 3 — Cuenta, puntos, modo historia y más cartas `[x]`

Decisión de Fernando: el arcade se queda como está (5 tickets, mano de 5); más largo es pesado.

- [x] Alta de cuenta al primer arranque: nombre#NNNN. No se vuelve a pedir el nombre.
- [x] Puntos malandrín acumulables (`js/scoring.js`) con desglose por ticket y por sprint; multiplicador por nivel.
- [x] Perfil con panel de puntuación, histórico de partidas (arcade, dos jugadores, historia), exportar/importar/borrar.
- [x] Rescate del calabozo (Daniel Primo) como habilidad activa, también en dos jugadores y para la máquina.
- [x] Siete habilidades especiales más en el motor.
- [x] 39 cartas nuevas del directorio público (50 en total), con tres épicas nuevas.
- [x] Vista de normas.
- [x] Modo historia: sobre de bienvenida (5 cartas), malandricoins, tienda con tres sobres (1-3 cartas, pesos por rareza), recortes por repetidas, sobre de emergencia, colección con cartas bloqueadas, plantilla de 5, capítulos con rival creciente, diario, reinicio.
- [x] Animación de apertura de sobres.
- [x] Corrección responsive: la barra superior con cinco pestañas desbordaba el ancho en móvil.

---

## Fase 4 — Catálogo, colección oculta y presentación `[x]`

- [x] 115 tickets (85 nuevos) por categorías: incidente, desarrollo, migración, seguridad, datos/IA, negocio, formación e I+D. Distribución por dificultad 4/28/54/25/4 y 38 con giro.
- [x] Vocabulario: eliminada la palabra "marrón" de todos los textos; la interfaz ya no menciona ficheros ni rutas del proyecto.
- [x] Campaña de 10 capítulos con puntos de control (1, 4 y 7); perder devuelve al último alcanzado, conservando colección y malandricoins. Regla elegida tras medir las tres alternativas por simulación (ver `CLAUDE.md`, "Equilibrio de la campaña").
- [x] Las repetidas se conservan y se venden desde la colección según rareza (4 / 10 / 25 / 80). Nunca la última copia.
- [x] Arte de sobres en SVG: tira de apertura, trama, brillo animado, sello con el número de cartas y destellos en el sobre calabozo.
- [x] Apertura cinematográfica a pantalla completa: sobre que tiembla y se rasga, cartas de una en una con destello radial por rareza y giro 3D, ficha consultable en cada carta, resumen final.
- [x] Álbum oculto: solo se ven las cartas conseguidas alguna vez en el modo historia. Las demás son siluetas con la rareza. La búsqueda no delata a las no descubiertas.
- [x] Botón de demostración "Descubrir toda la colección", para enseñar el juego a Daniel Primo. **Retirar antes de compartirlo con la comunidad** (ver `config.developer.enabled`, fase 6).
- [x] Repositorio git inicializado.

Pendiente de la fase, aplazado a propósito:
- [ ] Revisión de habilidades, expertise, criptonita y rareza de las cartas: la hará Fernando con Daniel Primo.
- [ ] Incorporar los ~25 perfiles del directorio sin bio técnica.
- [ ] Accesibilidad: navegación por teclado, `aria-*`, contraste.

---

## Fase 5 — Presentación y pulido `[x]`

- [x] Sellos de tebeo al resolver cada ticket: rayos, palabra grande, onomatopeya y coletilla al azar.
- [x] Pantallazo de fin de sprint con título, marcador y frase de victoria, derrota o empate.
- [x] Retirada de la ficha durante la cinemática de sobres (decisión de Fernando) y corrección del fallo por el que abría por detrás de la capa.
- [x] Revisión de maquetación y scroll en cinco formatos, con `tests/layout.js` como comprobación permanente.
- [x] Bloqueo de scroll con contador y conservación de la posición.
- [x] Abel Fernández: campeón de Vue, criptonita React.

---

## Fase 6 — Publicación y correcciones `[~]`

- [x] Publicado en GitHub Pages como *project site* (`.nojekyll` en la raíz).
- [x] Partidas arcade a dos jugadores compartibles por URL, con el JSON como respaldo.
- [x] Barra de acción flotante durante la partida en ordenador y móvil.
- [x] Panel "Por modo de juego" en el perfil, con recuento exacto en `profile.byMode`.
- [x] Corregido: la recompensa del modo historia se aplica al terminar el sprint, no al pulsar el botón de la pantalla final. Antes, cerrar la pestaña ahí hacía perder monedas y avance de capítulo.
- [x] La empresa rival pasa a llamarse Caballerosos S.A., "Software fino como seda medieval". El nombre vive solo en `config.rival` y las frases lo insertan con `{rival}`.
- [x] Corregido: en las partidas a dos, quien recibía el fichero resuelto veía ganar a la empresa de la máquina en lugar de a su rival humano, porque las frases de derrota llevaban el nombre escrito a mano.
- [x] Acceso a la tienda de sobres desde el álbum y desde el perfil.
- [x] Panel "Tu plantilla" en el perfil: cartas en propiedad, copias, envíos, resueltos, burnouts acumulados y venta de repetidas.
- [x] Desgaste de las cartas: tres burnouts y el malandrín deja la empresa, con contador que se reinicia al sobrevivir un sprint y avisos de "cuerda floja". Política elegida tras medir tres variantes (ver `CLAUDE.md`, "Desgaste de las cartas").
- [x] Modo desarrollador en un solo interruptor (`config.developer.enabled`): gobierna el botón "Descubrir toda la colección" del álbum y el campo "Semilla (opcional)" del arcade, incluida la semilla del marcador y de la pantalla final.
- [x] UX de la pantalla de partida, pensada para el móvil:
  - La mano pasa a ser un **mazo** dentro del hueco "Tu malandrín": la carta activa delante y el resto asomando por detrás. Se cambia de carta arrastrando, con las flechas del teclado, con los botones Anterior/Siguiente o pulsando una carta lateral. La carta activa es la que se envía, así que elegir y enviar dejan de ser dos pasos.
  - El hueco del rival no se dibuja mientras se elige: en modo máquina aparece con su carta al enviar; en dos jugadores no aparece nunca, porque no hay carta que enseñar hasta resolver. En su lugar, una franja de una línea.
  - Botón de cerrar la ficha flotante (`position: fixed`): antes se iba con el desplazamiento del propio modal.
  - En la fase de resultado ya no se pinta la mano entera, solo el recuento de disponibles.
  - Corregido: el aviso emergente tapaba los clics del botón principal y se solapaba con la barra de acción.
- [x] Comprobación del flujo a dos jugadores **por enlace**, que es la forma recomendada de compartir: A comparte, B lo abre y juega, comparte el resultado y A lo ve. Incluye el alta de quien abre el enlace sin cuenta y el rechazo de un enlace manipulado. El desplegable con el JSON se sigue comprobando como alternativa.
- [ ] Poner `config.developer.enabled` a `false` para la versión de la comunidad.

---

## Fase 7 — LLM opcional y revelado por días `[ ]`

- [ ] Oponente LLM opcional: endpoint compatible OpenAI (incluye Ollama local) y Anthropic; solo elige carta y comenta la jugada. La clave se guarda en `localStorage` y nunca sale del navegador salvo hacia el endpoint configurado.
- [ ] Sonido opcional (Web Audio, sin ficheros externos).
- [ ] Revelado progresivo de cartas: publicar el juego con parte de la plantilla desactivada e ir activándola por fechas (a hablar con Daniel Primo). Encaja con `data/optout.js` y con el álbum oculto ya implementado.
- [ ] Poner `config.developer.enabled` a `false` en la versión pública.
- [ ] Publicación en GitHub Pages como *project site* (`cainuriel.github.io/malandrineitor`, no interfiere con la user site) y `README.md` final con créditos a la comunidad. Alternativa: distribuir el zip.

---

## Ideas aparcadas (no planificadas)

- Cartas exclusivas con códigos firmados (ECDSA en cliente).
- Modo torneo.
- Retratos inspirados en las personas reales (con su permiso) en sustitución del avatar procedural: el renderizador ya admite `card.portrait` como URL de imagen local. Decidido dejarlo para el final del proyecto.
