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

  /* Pulla del rival tras cada ticket. `win` es cuando la paga se la lleva quien juega,
     `loss` cuando se la lleva el rival y `draw` cuando empatan. Humor de oficina, sin
     pullas personales: el gracioso es siempre el proceso, nunca nadie de la comunidad. */
  rivalTaunt: {
    win: [
      'En {rival} dicen que su solución era más elegante. No la han enseñado.',
      '{rival} abre una retrospectiva para entender qué ha pasado. Durará dos horas.',
      'Han felicitado al equipo por correo, con copia oculta a tres jefes.',
      'En {rival} lo llaman "aprendizaje". Aquí lo llamamos ticket cerrado.',
      '{rival} pide el código para "inspirarse". Está en abierto desde 2019.',
      'Dicen que su versión tenía más tests. Rojos, pero más.',
      'En {rival} ya han puesto el ticket en la columna "casi".',
      'Han pedido una reunión para alinear criterios. La reunión es el jueves.'
    ],
    loss: [
      '{rival} lo ha resuelto y ha mandado un diagrama con degradados.',
      'En {rival} ya lo tenían hecho. En una rama. Sin fusionar. Pero lo tenían.',
      '{rival} lo ha cerrado sin despeinarse y ha hecho una demo de doce minutos.',
      'Han resuelto el ticket y encima lo han documentado. Eso último duele más.',
      '{rival} ha llegado antes. Con guantes blancos, como siempre.',
      'Lo suyo pasa la revisión a la primera. Sospechoso, pero pasa.',
      'En {rival} lo han hecho con un patrón que tiene nombre de señor victoriano.'
    ],
    draw: [
      'Empate. Los dos equipos reclaman la victoria en su canal interno.',
      'Mismo resultado por caminos opuestos. Los dos juran que el suyo es mejor.',
      'Empate técnico. El cliente no nota la diferencia, que es lo grave.',
      'Ni para uno ni para otro. El ticket se queda mirando.'
    ]
  },

  /* Cuando no queda nadie disponible y hay que asumir el golpe. No cambia ninguna
     regla: es el mismo resultado de siempre, contado con más gracia. */
  intern: [
    'Ha ido el becario. Ha preguntado si hay que hacer commit del node_modules.',
    'Ha ido el becario. Ha resuelto el conflicto de fusión quedándose con las dos versiones.',
    'Ha ido el becario. Ha probado en producción porque "en local funcionaba".',
    'Ha ido el becario. Ha puesto un console.log y lo ha desplegado.',
    'Ha ido el becario. Ha cerrado el ticket y ha abierto tres.',
    'Ha ido el becario. Preguntó en el canal general y aún espera respuesta.',
    'Ha ido el becario. Ha copiado la primera respuesta que ha encontrado, la de 2011.',
    'Ha ido el becario. Ha arreglado el estilo del código y nada más.',
    'Ha ido el becario. Ha renombrado la rama y ahora nadie la encuentra.',
    'Ha ido el becario. Dice que la culpa es de la caché.'
  ],

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
