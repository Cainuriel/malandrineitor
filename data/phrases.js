/* Textos de las animaciones: onomatopeyas de tebeo y frases de final de sprint.
   Humor blanco, nada ofensivo. Añadir frases es añadir cadenas a estas listas.

   {rival} se sustituye por el nombre del rival de esa partida: la empresa de la máquina
   (config.rival.name) o el nombre del otro jugador en las partidas a dos. Por eso ninguna
   frase debe llevar el nombre de la empresa escrito a mano. */
window.MI = window.MI || {};
MI.data = MI.data || {};

MI.data.phrases = {
  // Palabrota de tebeo que acompaña al sello de cada ticket
  bang: {
    resolved: ['¡ZAS!', '¡CLONC!', '¡PLIN!', '¡TACHÁN!', '¡CHAS!', '¡RIIING!', '¡PUM!'],
    improved: ['¡EJEM!', '¡GLUPS!', '¡UFF!', '¡PSSS!', '¡MMM!'],
    complicated: ['¡CATACROC!', '¡PLOF!', '¡CRASH!', '¡BOING!', '¡AAAY!', '¡CHOF!']
  },

  // Coletilla pequeña bajo el sello
  kicker: {
    resolved: ['Ticket cerrado sin despeinarse', 'Se cierra y se factura', 'Producción respira', 'Y sin tocar el viernes', 'El cliente ni se ha enterado'],
    improved: ['Deuda técnica apuntada', 'Aguanta hasta el lunes', 'Funciona, no preguntes', 'Se ha ganado tiempo', 'Mejor que estaba'],
    complicated: ['A la pila de "ya lo miro"', 'El ticket vuelve, y con amigos', 'Esto ya no es un ticket, es un proyecto', 'Alguien ha abierto un incidente sobre el incidente', 'Café. Mucho café.']
  },

  // Final de sprint
  win: {
    title: ['¡SPRINT GANADO!', '¡CONTRATO NUESTRO!', '¡A FACTURAR!'],
    phrase: [
      '{rival} dice que "no estaban jugando en serio". Claro que sí.',
      'El cliente ha escrito "gracias" sin faltas de ortografía. Histórico.',
      'Nadie ha tenido que entrar en producción un domingo. Eso también es ganar.',
      'La retrospectiva va a ser cortísima y eso, en esta profesión, es una medalla.',
      'Han preguntado si podéis hacer lo mismo pero para otro departamento. Ahí empieza todo otra vez.',
      'Se cierra el sprint, se apaga el portátil y no pasa nada. Increíble pero cierto.',
      '{rival} os felicita con una reverencia. Se nota que escuece.'
    ]
  },
  loss: {
    title: ['{rival} SE LLEVA EL SPRINT', 'SPRINT PERDIDO', 'SE HA COMPLICADO'],
    phrase: [
      '{rival} lo celebra con una nota de prensa. Vosotros, con una retrospectiva.',
      'No es una derrota, es una lección cara. Muy cara.',
      'El cliente ha dicho "no pasa nada" con ese tono. Ese tono.',
      'Toca volver al calabozo, abrir sobres y regresar con mejores cartas.',
      'Todo equipo tiene un sprint así. El truco está en que no sean dos seguidos.',
      'Alguien ha propuesto reescribirlo todo desde cero. Se le ha mirado mal, pero con cariño.',
      '{rival} ha mandado una carta de agradecimiento. En papel bueno. Con lacre.'
    ]
  },
  draw: {
    title: ['EMPATE TÉCNICO', 'TABLAS'],
    phrase: [
      'Los dos equipos reclaman la victoria. Los dos han dormido igual de mal.',
      'Ni contigo ni sin ti. Como el ERP.',
      'Empate. En la próxima reunión cada uno contará su versión.',
      '{rival} propone repetirlo "cuando a ustedes les venga bien". Muy fino todo.'
    ]
  }
};
