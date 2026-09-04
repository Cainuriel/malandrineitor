/* Tickets (retos). Ver CLAUDE.md para el esquema.
   skills: pesos relativos (1..3), máximo cuatro habilidades. tech: tecnología principal o null.
   twist: giro que se revela después de elegir carta; sus pesos se suman a los del reto y su tech,
   si la hay, SUSTITUYE a la tecnología principal (lo que puede convertir a un campeón en víctima de su criptonita).
   Tono: humor blanco, tipo tebeo. Jerga técnica real. Nada ofensivo. */
window.MI = window.MI || {};
MI.data = MI.data || {};

MI.data.challenges = [
  {
    id: 'front-framework-mystery',
    title: 'Hay que arreglar el front. "Es un framework JavaScript"',
    situation: 'El cliente dice que su web "va con un framework de esos de JavaScript" y que los botones han dejado de hacer cosas. Todo el mundo en la oficina asume que es React. Todo el mundo.',
    tech: 'react', difficulty: 3,
    skills: { front: 3, testing: 1 },
    twist: { text: 'Abres el repositorio y ahí está: ¡es Vue! Con Options API y un mixin llamado "utilidadesVarias". El reactionario de turno palidece.', skills: { legacy: 1 }, tech: 'vue' },
    tags: ['incidente', 'front']
  },
  {
    id: 'react-white-screen',
    title: 'Pantalla en blanco en producción',
    situation: 'La SPA en React ha dejado de renderizar tras el último deploy. La consola escupe "Minified React error #418" y marketing tiene una campaña en marcha. Marketing ya está en tu mesa. Marketing no se va.',
    tech: 'react', difficulty: 2,
    skills: { front: 3, testing: 1, performance: 1 },
    twist: { text: 'Solo falla en Safari. Es un problema de hidratación con fechas en la zona horaria del usuario. El usuario está en Canarias.', skills: { front: 1 }, tech: null },
    tags: ['incidente', 'front']
  },
  {
    id: 'api-500',
    title: 'La API REST devuelve 500 de forma intermitente',
    situation: 'Uno de cada veinte POST a /orders responde 500. No hay trazas útiles y el cliente amenaza con "auditoría de SLA", que suena a algo que nadie quiere saber qué es.',
    tech: 'apis', difficulty: 3,
    skills: { apis: 3, back: 2, observability: 2 },
    twist: { text: 'Era una condición de carrera en el pool de conexiones. Alguien puso el tamaño del pool a 1 "para probar". Hace dos años.', skills: { databases: 2 }, tech: null },
    tags: ['incidente', 'back']
  },
  {
    id: 'pod-crashloop',
    title: 'CrashLoopBackOff un viernes a las 18:00',
    situation: 'El pod de pagos entra en CrashLoopBackOff tras un rollout. Los logs dicen OOMKilled. Tu compañero de guardia ya está en el coche y "no tiene cobertura".',
    tech: 'kubernetes', difficulty: 3,
    skills: { devops: 3, observability: 2, back: 1 },
    twist: null,
    tags: ['incidente', 'ops']
  },
  {
    id: 'cloud-migration',
    title: 'Desacoplar los servicios y llevarlos a la cloud',
    situation: 'Un monolito PHP en un servidor físico que "está debajo de la mesa de Encarna" debe pasar a servicios en AWS con CI/CD y sin ventana de parada mayor de una hora. Encarna no quiere que le toquen la mesa.',
    tech: 'aws', difficulty: 4,
    skills: { cloud: 3, architecture: 2, devops: 2, legacy: 1 },
    twist: { text: 'Dirección exige que los datos personales no salgan de la UE y que el proveedor sea sustituible "por si acaso".', skills: { sovereignty: 2, gdpr: 1 }, tech: null },
    tags: ['migracion', 'cloud']
  },
  {
    id: 'symfony-upgrade',
    title: 'Migrar un proyecto antiguo en Symfony',
    situation: 'Symfony 2.8 con PHP 5.6, 1.200 tests de los que pasan 300 y un cliente que sigue vendiendo con él. Objetivo: Symfony 7 y PHP 8.3. Presupuesto: "lo que sea razonable".',
    tech: 'symfony', difficulty: 4,
    skills: { legacy: 3, back: 2, testing: 2 },
    twist: { text: 'Hay lógica de negocio en plantillas Twig. Mucha. Hay un IVA calculado en un filtro llamado "arreglin".', skills: { architecture: 1 }, tech: null },
    tags: ['migracion', 'back']
  },
  {
    id: 'ddos',
    title: 'Ataque DDoS en el checkout',
    situation: 'Picos de 40.000 peticiones por segundo desde miles de IPs contra /checkout. El WAF no lo absorbe y el CPD empieza a oler a tostada.',
    tech: null, difficulty: 3,
    skills: { security: 3, sysadmin: 2, cloud: 2 },
    twist: { text: 'El tráfico viene mezclado con clientes reales en Black Friday: no se puede cortar a lo bruto sin cargarse la caja.', skills: { observability: 1 }, tech: null },
    tags: ['incidente', 'seguridad']
  },
  {
    id: 'db-breach',
    title: 'Han exfiltrado la base de datos de usuarios',
    situation: 'Un volcado con 200.000 registros aparece en un foro. Las contraseñas están en MD5 sin sal, como en los tiempos de los CD de AOL. Hay que contener, notificar y remediar en 72 horas.',
    tech: null, difficulty: 5,
    skills: { security: 3, gdpr: 2, crypto: 1, databases: 1 },
    twist: { text: 'La AEPD pide la evaluación de impacto que nadie hizo. Alguien propone "hacerla ahora con fecha de antes". Se le mira mal.', skills: { gdpr: 2, privacy: 1 }, tech: null },
    tags: ['incidente', 'seguridad', 'legal']
  },
  {
    id: 'blockchain-from-scratch',
    title: 'Crear una red blockchain permisionada desde cero',
    situation: 'Un consorcio quiere una red EVM con consenso QBFT, identidades verificables y tokens de utilidad, con validadores en tres organizaciones que no se fían entre sí. De ahí lo de blockchain.',
    tech: 'evm', difficulty: 5,
    skills: { blockchain: 3, crypto: 2, architecture: 2, security: 1 },
    twist: { text: 'Uno de los socios exige que las transacciones sean privadas entre pares. Toca ZK. Toca café.', skills: { crypto: 2, privacy: 1 }, tech: null },
    tags: ['desarrollo', 'chain']
  },
  {
    id: 'ecommerce-catalog',
    title: 'Mantener una tienda online con 40.000 productos',
    situation: 'El catálogo tarda nueve segundos en cargar, el buscador no encuentra "cápsula" pero sí "capsula", y el cliente quiere sincronizar stock con su ERP cada cinco minutos. El ERP es de 2009 y tiene opiniones.',
    tech: 'erp', difficulty: 3,
    skills: { erp: 2, performance: 2, databases: 2, back: 1 },
    twist: null,
    tags: ['mantenimiento', 'negocio']
  },
  {
    id: 'rag-private',
    title: 'RAG sobre documentación interna sin sacar datos',
    situation: 'Un despacho quiere preguntar a sus 12.000 expedientes en lenguaje natural. Nada puede salir de sus servidores y las respuestas deben citar la fuente, "como los abogados de las películas".',
    tech: 'llm', difficulty: 4,
    skills: { ai_tools: 3, privacy: 2, sovereignty: 1, data_eng: 1 },
    twist: { text: 'Los expedientes son PDFs escaneados de los años noventa. Torcidos. Con post-its.', skills: { data_eng: 2 }, tech: null },
    tags: ['desarrollo', 'ia']
  },
  {
    id: 'rd-proposal',
    title: 'Propuesta de I+D para una convocatoria pública',
    situation: 'Quedan diez días para presentar un proyecto de investigación aplicada con prototipo, memoria técnica y presupuesto. El comité evaluador es técnico y no se ríe con los chistes.',
    tech: null, difficulty: 3,
    skills: { rd: 3, management: 2, teaching: 1 },
    twist: { text: 'Piden un demostrador funcional el día de la defensa. "Funcional" subrayado dos veces.', skills: { spec_driven: 2 }, tech: null },
    tags: ['negocio', 'i+d']
  },
  {
    id: 'java-legacy-bug',
    title: 'NullPointerException en el cierre contable',
    situation: 'El batch nocturno en Java 8 revienta en el último paso del cierre de mes. Sin tests, sin documentación, y el autor se jubiló y vive en un pueblo sin cobertura por decisión propia.',
    tech: 'java', difficulty: 2,
    skills: { back: 3, legacy: 2, testing: 1 },
    twist: null,
    tags: ['incidente', 'back', 'legacy']
  },
  {
    id: 'mvp-agentic',
    title: 'MVP en una semana con agentes de código',
    situation: 'Un cliente quiere validar una idea de producto SaaS en siete días. Sin equipo. Solo tú, una spec y agentes de código. La spec es una servilleta. Con manchas.',
    tech: 'claude_code', difficulty: 2,
    skills: { spec_driven: 3, saas: 1, front: 1, back: 1 },
    twist: { text: 'El cliente cambia el alcance el jueves. Otra vez. Ahora quiere "algo con IA", sin más detalles.', skills: { management: 1 }, tech: null },
    tags: ['desarrollo', 'ia']
  },
  {
    id: 'ml-model-drift',
    title: 'El modelo de predicción de demanda se ha degradado',
    situation: 'La precisión del modelo en producción ha caído del 91 % al 64 % en tres semanas. Nadie sabe con qué datos se entrenó ni dónde está el pipeline. Hay un notebook llamado "final_v3_DEFINITIVO_ok.ipynb".',
    tech: 'pytorch', difficulty: 4,
    skills: { mlops: 3, ml_training: 2, data_eng: 2 },
    twist: { text: 'Los datos de entrada cambiaron de formato porque el ERP se actualizó sin avisar. El ERP nunca avisa.', skills: { erp: 1 }, tech: null },
    tags: ['incidente', 'ia', 'datos']
  },
  {
    id: 'wordpress-hacked',
    title: 'El WordPress del cliente vende viagra en japonés',
    situation: 'La web corporativa aparece en Google anunciando productos que no están en el catálogo, en un idioma que nadie en la empresa habla. Hay 47 plugins instalados. Activos, 46.',
    tech: 'wordpress', difficulty: 2,
    skills: { cms: 3, security: 2, sysadmin: 1, back: 1 },
    twist: { text: 'El acceso se hizo con la contraseña "admin2019", que también es la de la wifi, la del FTP y la del cajón de las llaves.', skills: { security: 1 }, tech: null },
    tags: ['incidente', 'seguridad']
  },
  {
    id: 'cert-expired',
    title: 'Ha caducado el certificado TLS. En todos los dominios. A la vez.',
    situation: 'A las 00:01 todos los navegadores del mundo muestran una pantalla roja con un candado tachado. El cron de renovación estaba en una máquina que se apagó "para ahorrar luz".',
    tech: 'linux', difficulty: 2,
    skills: { sysadmin: 3, devops: 1 },
    twist: null,
    tags: ['incidente', 'ops']
  },
  {
    id: 'terraform-destroy',
    title: 'Alguien ha hecho terraform destroy en producción',
    situation: 'Un becario con permisos de administrador (nadie sabe por qué) ha ejecutado "terraform destroy" pensando que era "terraform plan". Lo confirmó con "yes" porque "lo pedía en mayúsculas".',
    tech: 'terraform', difficulty: 4,
    skills: { devops: 3, cloud: 2, databases: 1 },
    twist: { text: 'Los backups existen. Están en el mismo bucket que acaba de desaparecer.', skills: { sysadmin: 1, management: 1 }, tech: null },
    tags: ['incidente', 'ops', 'cloud']
  },
  {
    id: 'mobile-store-reject',
    title: 'Apple ha rechazado la app por cuarta vez',
    situation: 'La app en Flutter no pasa la revisión de la App Store. El motivo esta vez: "Guideline 4.2, Minimum Functionality". La app calcula el IVA. Solo eso.',
    tech: 'flutter', difficulty: 2,
    skills: { mobile: 3, ux: 2 },
    twist: { text: 'La versión Android lleva publicada tres meses. Con anuncios. Nadie lo sabía.', skills: { management: 1 }, tech: null },
    tags: ['desarrollo', 'mobile']
  },
  {
    id: 'a11y-audit',
    title: 'La web de la administración no pasa la auditoría de accesibilidad',
    situation: 'Un organismo público debe cumplir WCAG 2.1 AA antes de fin de mes. Los botones son divs, las imágenes se llaman "imagen1.jpg" y el contraste del texto es "gris sobre gris, que queda elegante".',
    tech: null, difficulty: 3,
    skills: { accessibility: 3, front: 2, ux: 1 },
    twist: { text: 'El carrusel de la portada es obligatorio "porque lo pidió el director general". Tiene autoplay.', skills: { management: 1 }, tech: null },
    tags: ['desarrollo', 'front', 'legal']
  },
  {
    id: 'sql-slow-query',
    title: 'El informe de ventas tarda 40 minutos',
    situation: 'Un SELECT con once JOIN, tres subconsultas correlacionadas y un LIKE "%cosa%" al principio. La tabla de pedidos no tiene índices "porque ralentizan los INSERT".',
    tech: 'postgres', difficulty: 3,
    skills: { databases: 3, performance: 2, back: 1 },
    twist: { text: 'El informe lo abre la directora financiera cada mañana a las 8:00 y lo deja cargando mientras desayuna. Ahora desayuna más deprisa.', skills: { data_mining: 1 }, tech: null },
    tags: ['incidente', 'datos']
  },
  {
    id: 'sovereign-cloud',
    title: 'Salir de la nube americana antes de que cambie la ley',
    situation: 'Una cooperativa quiere sacar todos sus servicios de un hiperescalador y montar su propia infraestructura en Europa, con Proxmox, Kubernetes y software libre. Y que "no se note".',
    tech: 'onprem', difficulty: 4,
    skills: { sovereignty: 3, sysadmin: 2, devops: 2, cloud: 1 },
    twist: { text: 'El correo corporativo también. Con los calendarios. Con las invitaciones recurrentes de 2016.', skills: { legacy: 1 }, tech: null },
    tags: ['migracion', 'soberania']
  },
  {
    id: 'gdpr-cookies',
    title: 'El banner de cookies acepta todo aunque pulses "Rechazar"',
    situation: 'Un usuario ha descubierto que el botón "Rechazar todo" del banner activa 34 rastreadores. Lo ha contado en un hilo. El hilo tiene 12.000 compartidos.',
    tech: null, difficulty: 2,
    skills: { gdpr: 3, privacy: 2, front: 1 },
    twist: null,
    tags: ['legal', 'front']
  },
  {
    id: 'onboarding-redesign',
    title: 'El 80 % de los usuarios abandona en el registro',
    situation: 'El formulario de alta pide DNI, segundo apellido, fax y "motivo del registro" en un campo obligatorio de 500 caracteres. El equipo de producto quiere "algo más moderno". Tiene un Figma con 214 pantallas.',
    tech: 'figma', difficulty: 3,
    skills: { ux: 3, design: 2, front: 1 },
    twist: { text: 'Legal insiste en que el campo de fax es obligatorio por una norma de 1998 que nadie encuentra.', skills: { gdpr: 1 }, tech: null },
    tags: ['producto', 'front']
  },
  {
    id: 'node-memory-leak',
    title: 'El servicio de Node se reinicia cada 40 minutos',
    situation: 'Un microservicio en Node.js crece en memoria hasta que el orquestador lo mata. Alguien ha puesto un cron que lo reinicia cada 39 minutos "y así no falla".',
    tech: 'node', difficulty: 3,
    skills: { back: 3, performance: 2, observability: 1 },
    twist: { text: 'La fuga está en una librería de logs que guarda todos los mensajes "por si hacen falta luego".', skills: { legacy: 1 }, tech: null },
    tags: ['incidente', 'back']
  },
  {
    id: 'spring-boot-upgrade',
    title: 'Subir de Spring Boot 2 a 3 sin que nadie se entere',
    situation: 'Jakarta EE ha cambiado el nombre de los paquetes y hay 3.400 imports de javax.* en el proyecto. El equipo quiere hacerlo "en un sprint, tranquilamente".',
    tech: 'java', difficulty: 3,
    skills: { back: 3, legacy: 2, testing: 1 },
    twist: { text: 'Hay un módulo que depende de una librería cuyo último commit es de 2013 y cuyo autor "ya no hace Java".', skills: { opensource: 1 }, tech: null },
    tags: ['migracion', 'back']
  },
  {
    id: 'prometheus-alert-storm',
    title: 'Mil alertas por minuto y ninguna importante',
    situation: 'El canal de alertas recibe una notificación cada vez que la CPU pasa del 20 %. La gente ha silenciado el canal. Producción lleva caída dos horas y la alerta está ahí, entre las otras 118.000.',
    tech: 'observability', difficulty: 3,
    skills: { observability: 3, devops: 1, sysadmin: 1 },
    twist: null,
    tags: ['incidente', 'ops']
  },
  {
    id: 'ai-chatbot-hallucination',
    title: 'El chatbot de atención al cliente ha prometido un descuento del 90 %',
    situation: 'El asistente con IA de la web ha inventado una promoción, la ha confirmado por escrito y ha firmado como "Dirección General". Hay 300 capturas circulando.',
    tech: 'llm', difficulty: 3,
    skills: { ai_tools: 3, testing: 1, ux: 1 },
    twist: { text: 'Además tutea al cliente y le ha llamado "crack". Legal quiere saber qué es un "system prompt".', skills: { gdpr: 1, teaching: 1 }, tech: null },
    tags: ['incidente', 'ia']
  },
  {
    id: 'nocode-saturated',
    title: 'La automatización de no-code ha hecho 40.000 pedidos de prueba',
    situation: 'Un flujo en una herramienta de automatización se ha quedado en bucle y ha creado 40.000 pedidos, 40.000 facturas y 40.000 correos de agradecimiento. El cliente está muy agradecido. 40.000 veces.',
    tech: 'nocode', difficulty: 2,
    skills: { nocode: 3, erp: 1, databases: 1 },
    twist: null,
    tags: ['incidente', 'negocio']
  },
  {
    id: 'teach-junior-team',
    title: 'Formar a un equipo que nunca ha hecho tests',
    situation: 'Un equipo de seis personas debe empezar a hacer testing automatizado. Su experiencia previa con tests: "probarlo en producción y mirar si alguien se queja".',
    tech: null, difficulty: 2,
    skills: { teaching: 3, testing: 2 },
    twist: { text: 'El jefe del equipo considera que los tests "son para gente que no sabe programar". Está en la formación. En primera fila.', skills: { management: 1 }, tech: null },
    tags: ['formacion']
  },
  /* ---- Catálogo ampliado (Fase 2b) ---- */
  // Incidentes
  { id: 'redis-full', title: 'Redis se ha llenado y ahora todo es lento', situation: 'La caché ha alcanzado el límite de memoria y ha empezado a expulsar claves al azar. Entre ellas, las sesiones de todos los usuarios. Y la del director.', tech: 'linux', difficulty: 2, skills: { back: 2, performance: 2, sysadmin: 1 }, twist: null, tags: ['incidente', 'back'] },
  { id: 'cron-timezone', title: 'El cron de facturación se ejecuta a la hora equivocada', situation: 'Desde el cambio de hora, las facturas salen con fecha del día anterior. Contabilidad dice que "eso no puede ser". El servidor está en UTC, el cron en local y nadie en paz.', tech: 'linux', difficulty: 1, skills: { sysadmin: 2, back: 2 }, twist: null, tags: ['incidente', 'ops'] },
  { id: 'disk-full-logs', title: 'El disco está al 100 % y son todo logs', situation: 'Un servicio escribe 40 GB diarios de "DEBUG: entrando en función". Alguien activó el modo verboso en 2021 para "mirar una cosa".', tech: 'linux', difficulty: 1, skills: { sysadmin: 3, observability: 1 }, twist: { text: 'Al borrar los logs, el proceso sigue teniendo el fichero abierto y el espacio no se libera. Clásico.', skills: { sysadmin: 1 }, tech: null }, tags: ['incidente', 'ops'] },
  { id: 'deploy-friday-rollback', title: 'Hay que hacer rollback y el anterior tampoco funciona', situation: 'El deploy de las 17:55 ha roto el login. El rollback a la versión anterior falla porque la migración de base de datos no es reversible. Son las 18:10.', tech: 'docker', difficulty: 3, skills: { devops: 3, databases: 2, back: 1 }, twist: { text: 'La versión anterior a la anterior tenía otro bug que se arregló con el deploy que acabas de deshacer.', skills: { legacy: 1 }, tech: null }, tags: ['incidente', 'ops'] },
  { id: 'mongodb-no-index', title: 'MongoDB devuelve la colección entera en cada búsqueda', situation: 'Una consulta sin índice recorre 30 millones de documentos por cada tecla que pulsa el usuario en el buscador. El buscador tiene autocompletado.', tech: 'mongodb', difficulty: 2, skills: { databases: 3, performance: 2 }, twist: null, tags: ['incidente', 'datos'] },
  { id: 'queue-poison-message', title: 'Un mensaje envenenado bloquea la cola', situation: 'Un pedido con un emoji en el nombre del cliente hace explotar al consumidor, que reintenta infinitamente. Detrás esperan 200.000 mensajes. Y un emoji.', tech: 'node', difficulty: 3, skills: { back: 3, architecture: 1, observability: 1 }, twist: null, tags: ['incidente', 'back'] },
  { id: 'aws-bill-spike', title: 'La factura de AWS ha subido un 900 %', situation: 'Alguien dejó una instancia GPU "para probar un modelo" en abril. Es octubre. También hay un bucket público sirviendo vídeos a medio internet.', tech: 'aws', difficulty: 3, skills: { cloud: 3, security: 1, management: 1 }, twist: { text: 'La instancia la dejó el director técnico. Hay que decírselo.', skills: { management: 1 }, tech: null }, tags: ['incidente', 'cloud'] },
  { id: 'kubernetes-dns', title: 'Siempre es el DNS', situation: 'Los servicios dentro del clúster se ven a ratos. CoreDNS responde tarde, mal o nunca. Alguien propone "reiniciarlo todo". Tiene un 40 % de probabilidades de acertar.', tech: 'kubernetes', difficulty: 3, skills: { devops: 3, sysadmin: 2 }, twist: null, tags: ['incidente', 'ops'] },
  { id: 'android-crash-update', title: 'La app se cierra al abrirla tras la última actualización', situation: 'El 30 % de los usuarios de Android tiene un crash en el arranque. Solo los que tienen un móvil de una marca concreta con un navegador de sistema concreto. Ese 30 % escribe reseñas.', tech: 'android', difficulty: 3, skills: { mobile: 3, testing: 1, observability: 1 }, twist: null, tags: ['incidente', 'mobile'] },
  { id: 'php-memory-exhausted', title: 'Allowed memory size exhausted', situation: 'El informe anual en PHP intenta cargar dos millones de filas en un array "para ordenarlas". Cada año alguien sube el memory_limit. Este año se ha acabado la RAM.', tech: 'php', difficulty: 2, skills: { back: 2, performance: 2, databases: 1 }, twist: null, tags: ['incidente', 'back'] },
  { id: 'email-blacklisted', title: 'Nuestro dominio está en una lista negra de correo', situation: 'Los correos de la empresa van al spam. El formulario de contacto lleva tres semanas enviando 4.000 mensajes al día porque no tenía captcha. Ahora sí.', tech: 'linux', difficulty: 2, skills: { sysadmin: 3, security: 1 }, twist: null, tags: ['incidente', 'ops'] },
  { id: 'graphql-n-plus-1', title: 'La API GraphQL hace 3.000 consultas por petición', situation: 'Un cliente pide "usuarios con sus pedidos con sus productos con sus categorías". El resolver lo resuelve. De uno en uno. Con cariño.', tech: 'apis', difficulty: 3, skills: { apis: 3, performance: 2, databases: 1 }, twist: null, tags: ['incidente', 'back'] },
  { id: 'sso-broken-monday', title: 'Nadie puede entrar el lunes a las 9:00', situation: 'El proveedor de identidad ha rotado un certificado el domingo. Todas las aplicaciones rechazan los tokens. Recepción ha empezado a apuntar a la gente en papel.', tech: null, difficulty: 3, skills: { security: 3, sysadmin: 1, apis: 1 }, twist: null, tags: ['incidente', 'seguridad'] },
  { id: 'race-double-charge', title: 'A un cliente se le ha cobrado tres veces', situation: 'Tres clics rápidos en "Pagar", tres transacciones. El botón no se desactivaba "porque quedaba feo en gris". El cliente ya no quiere el producto; quiere hablar.', tech: 'node', difficulty: 2, skills: { back: 3, front: 1, testing: 1 }, twist: null, tags: ['incidente', 'back'] },
  { id: 'ssl-mixed-content', title: 'La web tiene el candado con una advertencia', situation: 'Después de pasar a HTTPS, la mitad de las imágenes se cargan por HTTP y el navegador lo cuenta a todo el mundo. Las imágenes están en un servidor que "no soporta HTTPS", según alguien que no lo ha mirado.', tech: 'sass', difficulty: 1, skills: { front: 2, sysadmin: 2 }, twist: null, tags: ['incidente', 'front'] },
  { id: 'excel-import-dates', title: 'Los importes de Excel llegan como fechas', situation: 'El importador de clientes convierte "1.234" en el 1 de febrero de 1934. Hay 80.000 clientes nacidos en 1934. El comercial está encantado con el nuevo segmento sénior.', tech: 'python', difficulty: 2, skills: { data_eng: 3, back: 1 }, twist: null, tags: ['incidente', 'datos'] },
  { id: 'unicode-names', title: 'La app no acepta el apellido "Ñíguez"', situation: 'La validación de nombres solo admite letras "de la A a la Z". La mitad de los clientes tienen tildes, la otra mitad eñes y un señor se llama Xoán. Todos llaman.', tech: 'typescript', difficulty: 1, skills: { front: 2, back: 1, accessibility: 1 }, twist: null, tags: ['incidente', 'front'] },
  { id: 'jwt-never-expires', title: 'Los tokens de sesión no caducan nunca', situation: 'Un empleado despedido en 2022 sigue entrando en la intranet con un token guardado en un post-it digital. Lo ha contado en LinkedIn. Con captura.', tech: 'apis', difficulty: 3, skills: { security: 3, apis: 1, back: 1 }, twist: null, tags: ['incidente', 'seguridad'] },
  { id: 'ransomware-nas', title: 'El NAS de la oficina está cifrado y piden bitcoins', situation: 'Alguien abrió "factura_urgente.pdf.exe". Los backups estaban en el mismo NAS, en una carpeta llamada "BACKUPS (no tocar)". Ya la han tocado.', tech: null, difficulty: 4, skills: { security: 3, sysadmin: 2, management: 1 }, twist: { text: 'La empresa no tiene seguro y el director pregunta cuánto es un bitcoin "más o menos".', skills: { management: 1, teaching: 1 }, tech: null }, tags: ['incidente', 'seguridad'] },
  { id: 'smart-contract-bug', title: 'El smart contract tiene una función pública que no debería serlo', situation: 'Cualquiera puede llamar a "withdrawAll()". Todavía no lo ha hecho nadie. Todavía. El contrato no es actualizable "por diseño".', tech: 'evm', difficulty: 4, skills: { blockchain: 3, security: 2, crypto: 1 }, twist: { text: 'Alguien acaba de llamarla. Con 0,3 ETH de prueba. Es tu propio test.', skills: { testing: 1 }, tech: null }, tags: ['incidente', 'chain'] },
  { id: 'llm-api-costs', title: 'El asistente con IA ha gastado el presupuesto del trimestre en una tarde', situation: 'Un bucle de agentes se llama a sí mismo para "verificar su respuesta". Cada verificación genera una nueva verificación. La factura del proveedor de modelos tiene seis cifras.', tech: 'llm', difficulty: 3, skills: { ai_tools: 3, observability: 1, management: 1 }, twist: null, tags: ['incidente', 'ia'] },
  { id: 'gpu-oom-training', title: 'El entrenamiento revienta a las 19 horas de 20', situation: 'CUDA out of memory en la última época. No hay checkpoints porque "ocupaban mucho". La entrega es mañana.', tech: 'pytorch', difficulty: 3, skills: { ml_training: 3, mlops: 2 }, twist: null, tags: ['incidente', 'ia'] },
  { id: 'kotlin-null-safety', title: 'Un !! en Kotlin ha tirado producción', situation: 'Alguien silenció al compilador con un doble signo de exclamación. El compilador tenía razón. El cliente de la app también tiene razón, y un tono más alto.', tech: 'kotlin', difficulty: 2, skills: { mobile: 2, back: 2, testing: 1 }, twist: null, tags: ['incidente', 'mobile'] },
  { id: 'dotnet-culture', title: 'Los decimales bailan según el idioma del servidor', situation: 'La aplicación en .NET calcula 12,50 en una máquina y 1250 en otra. Depende de si el servidor se instaló "en español" o "en inglés". Hay servidores de los dos tipos.', tech: 'dotnet', difficulty: 2, skills: { back: 3, testing: 1 }, twist: null, tags: ['incidente', 'back'] },
  { id: 'go-goroutine-leak', title: 'El servicio en Go tiene 400.000 goroutines', situation: 'Cada petición abre una goroutine que espera un canal que nadie cierra. El servicio "va bien" hasta que deja de ir. Suele ser a las 4:00.', tech: 'go', difficulty: 3, skills: { back: 3, performance: 1, observability: 1 }, twist: null, tags: ['incidente', 'back'] },

  // Desarrollo
  { id: 'dashboard-realtime', title: 'Un cuadro de mando en tiempo real para dirección', situation: 'Dirección quiere ver las ventas "al segundo" en una pantalla gigante de la entrada. Los datos llegan del ERP una vez al día, por FTP, en un fichero con nombre en mayúsculas.', tech: 'react', difficulty: 3, skills: { front: 2, data_eng: 2, ux: 1 }, twist: { text: 'La pantalla gigante es una tele de 2011 con un navegador que no conoce las flechas de función.', skills: { legacy: 1 }, tech: null }, tags: ['desarrollo', 'front', 'datos'] },
  { id: 'design-system', title: 'Un sistema de diseño para once aplicaciones que no se parecen en nada', situation: 'Cada aplicación tiene su botón azul. Ninguno es el mismo azul. Diseño ha hecho un Figma precioso que no contempla ninguno de los once casos.', tech: 'figma', difficulty: 3, skills: { design: 3, front: 2, accessibility: 1 }, twist: null, tags: ['desarrollo', 'producto'] },
  { id: 'pwa-offline', title: 'La app tiene que funcionar sin conexión en el almacén', situation: 'Los operarios escanean palés en un sótano con cobertura de 1998. La app web debe guardar todo y sincronizar cuando suban a por café.', tech: 'typescript', difficulty: 3, skills: { front: 3, architecture: 1, mobile: 1 }, twist: { text: 'Dos operarios modifican el mismo palé sin conexión. Toca resolver conflictos. Y explicárselo.', skills: { architecture: 1, teaching: 1 }, tech: null }, tags: ['desarrollo', 'front'] },
  { id: 'api-versioning', title: 'Versionar la API sin romper a los 40 integradores', situation: 'Hay que cambiar el formato de fechas de la API pública. Cuarenta empresas la consumen. Tres respondieron al correo. Una de ellas para preguntar qué es una API.', tech: 'apis', difficulty: 3, skills: { apis: 3, architecture: 1, management: 1 }, twist: null, tags: ['desarrollo', 'back'] },
  { id: 'flutter-both-stores', title: 'Publicar la misma app en las dos tiendas sin dos equipos', situation: 'Un cliente quiere iOS y Android "iguales pero cada una con su estilo". Tiene presupuesto para una. Flutter promete milagros; el revisor de Apple no.', tech: 'flutter', difficulty: 3, skills: { mobile: 3, ux: 1, testing: 1 }, twist: null, tags: ['desarrollo', 'mobile'] },
  { id: 'svelte-rewrite', title: 'Reescribir el panel de administración con algo más ligero', situation: 'El panel tarda 12 segundos en cargar por un bundle de 9 MB. El equipo quiere probar Svelte. El jefe quiere "lo que sea, pero que no tarde".', tech: 'svelte', difficulty: 2, skills: { front: 3, performance: 2 }, twist: null, tags: ['desarrollo', 'front'] },
  { id: 'angular-upgrade', title: 'Subir de AngularJS a Angular. Sí, ese salto.', situation: 'Una aplicación de gestión de 2014 en AngularJS 1.4 con 600 controladores y una directiva que se llama "cosas". Hay que llevarla a Angular moderno sin parar la empresa.', tech: 'angular', difficulty: 4, skills: { front: 3, legacy: 3, architecture: 1 }, twist: null, tags: ['migracion', 'front'] },
  { id: 'multitenant-saas', title: 'Convertir el producto en SaaS multi-cliente', situation: 'Hasta ahora se instalaba una copia por cliente. Hay 60 copias, todas distintas. Ahora quieren una sola instalación con los 60 clientes aislados, facturación por uso y "que nadie vea nada de nadie".', tech: 'postgres', difficulty: 4, skills: { saas: 3, architecture: 2, databases: 2, security: 1 }, twist: { text: 'Un cliente tiene una columna personalizada llamada "campo_pepe" de la que depende su negocio.', skills: { legacy: 1 }, tech: null }, tags: ['desarrollo', 'arquitectura'] },
  { id: 'event-sourcing', title: 'Auditoría completa de cada cambio en los pedidos', situation: 'Legal exige saber quién cambió qué y cuándo en cada pedido de los últimos cinco años. El sistema guarda solo el estado actual. Alguien dice "event sourcing" y se hace el silencio.', tech: 'java', difficulty: 4, skills: { architecture: 3, back: 2, databases: 1 }, twist: null, tags: ['desarrollo', 'arquitectura'] },
  { id: 'i18n-rtl', title: 'Traducir la app a árabe y hebreo', situation: 'La interfaz debe leerse de derecha a izquierda. Los iconos de "siguiente" apuntan al lado equivocado, las fechas se rompen y hay 1.200 textos incrustados en el código.', tech: 'react', difficulty: 3, skills: { front: 3, ux: 1, accessibility: 1 }, twist: null, tags: ['desarrollo', 'front'] },
  { id: 'wordpress-headless', title: 'WordPress como CMS y el front en lo que sea', situation: 'Marketing quiere seguir editando en WordPress; desarrollo quiere un front moderno. Solución: headless. Problema: los 47 plugins que "hacen cosas" en el tema actual.', tech: 'wordpress', difficulty: 3, skills: { cms: 3, front: 2, apis: 1, legacy: 1 }, twist: null, tags: ['desarrollo', 'front'] },
  { id: 'laravel-invoice-queue', title: 'Laravel duplica facturas cuando la cola reintenta', situation: 'Un job de Laravel genera la factura, pierde la conexión antes de confirmar y vuelve a intentarlo con entusiasmo. Algunos pedidos tienen tres facturas y contabilidad empieza a hablar de exorcismos administrativos.', tech: 'php', difficulty: 3, skills: { back: 3, databases: 2, testing: 1, architecture: 1 }, twist: { text: 'El proveedor de pagos también reintenta sus webhooks y nadie guardó una clave de idempotencia. Hay duplicados de los duplicados.', skills: { apis: 2 }, tech: null }, tags: ['incidente', 'back'] },
  { id: 'laravel-monolith-upgrade', title: 'Subir el monolito de Laravel sin cerrar la tienda', situation: 'La tienda vive en Laravel 6, PHP 7.4 y un paquete abandonado que modifica pedidos desde un service provider. Hay que llegar a una versión actual sin detener las ventas ni perder las personalizaciones.', tech: 'php', difficulty: 4, skills: { back: 3, legacy: 2, architecture: 2, testing: 1 }, twist: { text: 'Las migraciones de base de datos tardan cuarenta minutos y bloquean la tabla que usa el checkout. El mantenimiento tendrá que ocurrir mientras todo sigue funcionando.', skills: { databases: 2, devops: 1 }, tech: null }, tags: ['migracion', 'back'] },
  { id: 'rust-hot-path', title: 'Reescribir el módulo crítico en Rust', situation: 'El cálculo de rutas tarda 4 segundos en Python. Hay que bajarlo a 40 milisegundos. Alguien dice "Rust" con la voz de quien nunca ha peleado con el borrow checker.', tech: 'rust', difficulty: 4, skills: { performance: 3, back: 2, testing: 1 }, twist: null, tags: ['desarrollo', 'back'] },
  { id: 'payment-integration', title: 'Integrar un nuevo proveedor de pagos antes del Black Friday', situation: 'El proveedor actual sube comisiones. El nuevo tiene documentación en tres idiomas y ninguno coincide con la API real. Quedan doce días.', tech: 'apis', difficulty: 3, skills: { apis: 2, back: 2, security: 1, testing: 1 }, twist: { text: 'El entorno de pruebas del proveedor está caído "por mantenimiento" hasta el jueves.', skills: { management: 1 }, tech: null }, tags: ['desarrollo', 'back'] },
  { id: 'wallet-login', title: 'Iniciar sesión con la wallet en vez de contraseña', situation: 'Un cliente quiere que sus usuarios entren firmando un mensaje con su wallet. Los usuarios tienen entre 55 y 70 años y todavía apuntan las contraseñas en una libreta.', tech: 'evm', difficulty: 3, skills: { blockchain: 2, ux: 2, security: 1, teaching: 1 }, twist: null, tags: ['desarrollo', 'chain'] },
  { id: 'zk-age-proof', title: 'Demostrar que eres mayor de edad sin enseñar el DNI', situation: 'Un servicio necesita verificar la edad sin guardar ni ver el documento. Prueba de conocimiento cero. El cliente lo llama "la cosa esa de la privacidad" y quiere una demo el lunes.', tech: 'zk', difficulty: 5, skills: { crypto: 3, privacy: 2, blockchain: 1, rd: 1 }, twist: null, tags: ['desarrollo', 'chain', 'i+d'] },
  { id: 'moodle-plugin', title: 'Un plugin de Moodle que ponga notas automáticas', situation: 'Una universidad quiere corregir prácticas de programación automáticamente. Los alumnos ya han descubierto tres formas de engañar al corrector. Van por la cuarta.', tech: 'php', difficulty: 3, skills: { back: 2, teaching: 2, security: 1, testing: 1 }, twist: null, tags: ['desarrollo', 'formacion'] },
  { id: 'chatbot-support', title: 'Un asistente que responda sin inventarse la política de devoluciones', situation: 'Después del incidente del descuento del 90 %, quieren un chatbot "que solo diga lo que pone en la web". La web se contradice en cuatro páginas distintas.', tech: 'llm', difficulty: 3, skills: { ai_tools: 3, ux: 1, gdpr: 1 }, twist: null, tags: ['desarrollo', 'ia'] },
  { id: 'agentic-refactor', title: 'Refactorizar 2.000 tests con agentes sin que se enteren', situation: 'La suite tarda 90 minutos y la mitad de los tests están comentados con "TODO arreglar". Hay que dejarla en 10 minutos usando agentes de código, y que la spec quede escrita.', tech: 'claude_code', difficulty: 3, skills: { spec_driven: 3, testing: 2, legacy: 1 }, twist: { text: 'El agente ha "arreglado" doce tests borrando las aserciones. Todos en verde. Sospechoso.', skills: { testing: 1 }, tech: null }, tags: ['desarrollo', 'ia'] },
  { id: 'iot-fleet', title: 'Actualizar 5.000 sensores en el campo sin volver a visitarlos', situation: 'Los sensores de riego tienen un firmware con un bug de fecha que caduca en marzo. Están repartidos por tres provincias. En marzo empieza a llover.', tech: 'python', difficulty: 4, skills: { sysadmin: 2, back: 2, security: 1, architecture: 1 }, twist: null, tags: ['desarrollo', 'ops'] },
  { id: 'sports-analytics', title: 'Predecir lesiones con los datos del GPS de los jugadores', situation: 'Un club tiene tres temporadas de datos de GPS, pulsómetros y "sensaciones" apuntadas a mano por el fisio. Quieren saber quién se va a lesionar antes de que se lesione.', tech: 'spark', difficulty: 4, skills: { data_mining: 3, ml_training: 2, data_eng: 1 }, twist: { text: 'Las "sensaciones" del fisio son el mejor predictor. Con diferencia. Hay que explicárselo al director deportivo.', skills: { teaching: 1 }, tech: null }, tags: ['desarrollo', 'datos', 'ia'] },
  { id: 'accessibility-forms', title: 'Que el formulario de ayudas lo pueda rellenar todo el mundo', situation: 'El formulario de solicitud de ayudas públicas tiene 14 pasos, un captcha imposible y una fecha en formato americano. Lo usan personas mayores y personas con lector de pantalla. Ahora mismo no lo usa nadie.', tech: null, difficulty: 3, skills: { accessibility: 3, ux: 2, front: 1 }, twist: null, tags: ['desarrollo', 'front', 'producto'] },
  { id: 'nocode-to-code', title: 'Sacar el negocio de la herramienta no-code antes de que suba el precio', situation: 'Toda la empresa funciona sobre una automatización no-code de 300 pasos que hizo el fundador. La herramienta multiplica el precio por diez. Nadie sabe qué hace el paso 214.', tech: 'nocode', difficulty: 3, skills: { nocode: 3, back: 2, architecture: 1 }, twist: null, tags: ['migracion', 'negocio'] },

  // Migraciones y legacy
  { id: 'cobol-bank-batch', title: 'Tocar el COBOL del banco sin que se entere el banco', situation: 'Un proceso nocturno en COBOL calcula intereses desde 1987. Hay que cambiar un redondeo. El último que lo tocó dejó una nota: "no tocar".', tech: 'cobol', difficulty: 5, skills: { legacy: 3, back: 2, testing: 2 }, twist: { text: 'El redondeo "incorrecto" es en realidad una norma del Banco de España de 1991 que sigue vigente.', skills: { gdpr: 1, management: 1 }, tech: null }, tags: ['migracion', 'legacy'] },
  { id: 'mysql-to-postgres', title: 'Migrar de MySQL a PostgreSQL con la tienda abierta', situation: 'Ochocientas tablas, cuarenta procedimientos almacenados y un trigger que envía correos. Migración sin parada: replicar, sincronizar, cambiar el DNS y rezar.', tech: 'postgres', difficulty: 4, skills: { databases: 3, devops: 2, back: 1 }, twist: null, tags: ['migracion', 'datos'] },
  { id: 'jquery-spaghetti', title: 'Un front de jQuery con 40.000 líneas en un solo fichero', situation: 'main.js tiene 40.000 líneas, tres versiones de jQuery cargadas a la vez y una función llamada "arreglarTodo()". Hay que modularizarlo sin que deje de funcionar ni un día.', tech: 'typescript', difficulty: 3, skills: { legacy: 3, front: 2, testing: 1 }, twist: null, tags: ['migracion', 'front'] },
  { id: 'monolith-strangler', title: 'Ir vaciando el monolito sin la gran reescritura', situation: 'El monolito de 15 años no se puede reescribir de golpe. Hay que ir extrayendo módulos con el patrón estrangulador. El primero: el de facturación, que nadie entiende y todos temen.', tech: 'java', difficulty: 4, skills: { architecture: 3, legacy: 2, back: 1, apis: 1 }, twist: null, tags: ['migracion', 'arquitectura'] },
  { id: 'php5-to-8', title: 'De PHP 5.3 a PHP 8 en una tienda que factura', situation: 'El hosting deja de soportar PHP 5.3 el mes que viene. El código usa mysql_query, register_globals y una librería descargada de un foro en 2009.', tech: 'php', difficulty: 3, skills: { legacy: 3, back: 2, security: 1 }, twist: null, tags: ['migracion', 'back'] },
  { id: 'azure-to-onprem', title: 'Volver de la nube al servidor propio', situation: 'Después de tres años en Azure, la factura no cuadra con el negocio. Vuelven a servidores propios con Kubernetes. El cliente quiere "lo mismo que ahora, pero en el armario".', tech: 'onprem', difficulty: 4, skills: { sysadmin: 3, devops: 2, sovereignty: 2 }, twist: null, tags: ['migracion', 'soberania'] },
  { id: 'excel-erp', title: 'El ERP de la empresa es un Excel con macros', situation: 'La empresa gestiona pedidos, stock y nóminas con un Excel de 300 MB que abre solo un ordenador. Ese ordenador hace ruidos. Hay que pasar a un ERP de verdad.', tech: 'erp', difficulty: 3, skills: { erp: 3, data_eng: 2, management: 1 }, twist: { text: 'Hay una macro que calcula comisiones de una forma que nadie recuerda y que los comerciales defienden con uñas y dientes.', skills: { legacy: 1 }, tech: null }, tags: ['migracion', 'negocio'] },
  { id: 'terraform-import', title: 'Poner bajo control 400 recursos creados a mano', situation: 'La infraestructura se creó a golpe de clic durante cinco años. Ahora quieren Terraform. Cada recurso hay que importarlo, describirlo y no romperlo al aplicar.', tech: 'terraform', difficulty: 3, skills: { devops: 3, cloud: 2 }, twist: null, tags: ['migracion', 'ops'] },
  { id: 'gcp-multiregion', title: 'Alta disponibilidad en dos regiones para no volver a salir en las noticias', situation: 'La última caída del proveedor dejó la app fuera 14 horas y salió en la prensa. Ahora quieren multi-región activa-activa. Con el mismo presupuesto.', tech: 'gcp', difficulty: 4, skills: { cloud: 3, architecture: 2, databases: 1 }, twist: null, tags: ['desarrollo', 'cloud'] },
  { id: 'ios-swiftui-migration', title: 'Migrar la app de iOS a SwiftUI sin perder la valoración', situation: 'La app tiene 4,8 estrellas y una base de código en Objective-C que nadie quiere tocar. Hay que pasarla a SwiftUI pantalla a pantalla sin que baje de 4,7.', tech: 'ios', difficulty: 3, skills: { mobile: 3, legacy: 2, ux: 1 }, twist: null, tags: ['migracion', 'mobile'] },

  // Seguridad y cumplimiento
  { id: 'pentest-report', title: 'El pentest ha encontrado 214 vulnerabilidades', situation: 'La auditoría externa devuelve 214 hallazgos, 12 críticos. El informe tiene 300 páginas. Dirección quiere saber "si estamos bien". Hay que priorizar y arreglar antes de la revisión en 30 días.', tech: null, difficulty: 4, skills: { security: 3, management: 1, back: 1 }, twist: null, tags: ['seguridad'] },
  { id: 'secrets-in-git', title: 'Las contraseñas de producción están en el repositorio', situation: 'Un fichero .env con todas las claves lleva cuatro años en el historial de git. El repositorio era privado. Hoy alguien lo ha hecho público "para enseñar una cosa".', tech: 'linux', difficulty: 3, skills: { security: 3, devops: 2 }, twist: { text: 'Entre las claves está la de la pasarela de pagos. Y la del correo del director.', skills: { management: 1 }, tech: null }, tags: ['incidente', 'seguridad'] },
  { id: 'gdpr-data-request', title: 'Un usuario pide todos sus datos. Todos.', situation: 'Derecho de acceso del RGPD: un usuario quiere todo lo que tenéis sobre él. Sus datos están en siete sistemas, tres Excel y una carpeta de "clientes antiguos". Hay 30 días.', tech: null, difficulty: 2, skills: { gdpr: 3, data_eng: 2 }, twist: null, tags: ['legal'] },
  { id: 'sql-injection-legacy', title: 'Inyección SQL en el buscador de la intranet', situation: 'El buscador concatena lo que escribe el usuario directamente en la consulta. Lleva así doce años. Un becario acaba de escribir una comilla por accidente y ha visto la tabla de nóminas.', tech: 'php', difficulty: 2, skills: { security: 3, back: 2 }, twist: null, tags: ['incidente', 'seguridad'] },
  { id: 'supply-chain-npm', title: 'Un paquete de npm que usamos se ha vuelto malicioso', situation: 'Una dependencia de una dependencia ha publicado una versión que roba variables de entorno. Está en 40 proyectos. El lockfile no estaba en el repositorio "porque daba conflictos".', tech: 'node', difficulty: 3, skills: { security: 3, devops: 1, opensource: 1 }, twist: null, tags: ['incidente', 'seguridad'] },
  { id: 'privacy-by-design-app', title: 'Una app de salud que no sepa nada de nadie', situation: 'Una startup quiere una app de seguimiento de hábitos de salud que funcione sin que el servidor pueda leer los datos. Cifrado en cliente, sincronización a ciegas y una evaluación de impacto que alguien tiene que firmar.', tech: null, difficulty: 4, skills: { privacy: 3, crypto: 2, gdpr: 1, mobile: 1 }, twist: null, tags: ['desarrollo', 'seguridad', 'legal'] },
  { id: 'audit-logs-tampering', title: 'Alguien ha borrado los logs de auditoría', situation: 'Los registros de acceso de la semana pasada han desaparecido. El único que tenía permisos para borrarlos es el administrador. El administrador dice que no ha sido. Los logs de quién borra los logs no existen.', tech: 'observability', difficulty: 3, skills: { security: 2, observability: 2, sysadmin: 1 }, twist: null, tags: ['incidente', 'seguridad'] },
  { id: 'ddos-mitigation-plan', title: 'Preparar la defensa antes del sorteo de entradas', situation: 'El viernes se ponen a la venta 20.000 entradas y se esperan 400.000 personas y varios bots. La última vez la web cayó a los 30 segundos y el trending topic no fue amable.', tech: 'aws', difficulty: 4, skills: { cloud: 2, security: 2, performance: 2 }, twist: null, tags: ['seguridad', 'cloud'] },

  // Datos e IA
  { id: 'data-warehouse', title: 'Un almacén de datos para dejar de discutir cifras en las reuniones', situation: 'Ventas dice una cifra, finanzas otra, marketing una tercera. Todas salen de la misma base de datos. Hay que construir una única fuente de verdad y que las reuniones duren menos.', tech: 'postgres', difficulty: 3, skills: { data_eng: 3, databases: 1, management: 1 }, twist: null, tags: ['desarrollo', 'datos'] },
  { id: 'recommendation-engine', title: 'Un recomendador que no recomiende lo que ya has comprado', situation: 'El recomendador actual sugiere lavadoras a quien acaba de comprar una lavadora. El cliente quiere "algo como lo de las plataformas de series". Tiene 300 productos.', tech: 'python', difficulty: 3, skills: { ml_training: 2, data_mining: 2, back: 1 }, twist: null, tags: ['desarrollo', 'ia'] },
  { id: 'ocr-invoices', title: 'Leer 200.000 facturas escaneadas del revés', situation: 'Un cliente tiene dos décadas de facturas escaneadas, muchas torcidas, algunas del revés y unas cuantas con café. Hay que extraer importe, fecha y proveedor con un margen de error menor que el de la persona que las tecleaba.', tech: 'python', difficulty: 3, skills: { ai_tools: 2, data_eng: 2, ml_training: 1 }, twist: null, tags: ['desarrollo', 'ia', 'datos'] },
  { id: 'fine-tune-domain', title: 'Ajustar un modelo con la jerga del sector', situation: 'El modelo genérico no entiende que "cerrar el mes" no es una fecha. Hay que hacer fine-tuning con 5.000 conversaciones reales, anonimizadas primero, evaluadas después.', tech: 'pytorch', difficulty: 4, skills: { ml_training: 3, privacy: 1, mlops: 1 }, twist: { text: 'Las conversaciones incluyen nombres, DNI y una receta de croquetas. Hay que anonimizar bien.', skills: { gdpr: 1 }, tech: null }, tags: ['desarrollo', 'ia'] },
  { id: 'mlops-pipeline', title: 'Que el modelo se reentrene solo sin romper nada', situation: 'Hoy el modelo se reentrena cuando alguien se acuerda, en su portátil, y se sube a mano. Quieren un pipeline con versionado, evaluación automática y despliegue solo si mejora.', tech: 'kubernetes', difficulty: 4, skills: { mlops: 3, devops: 2, testing: 1 }, twist: null, tags: ['desarrollo', 'ia', 'ops'] },
  { id: 'local-llm-sovereign', title: 'Un modelo de lenguaje que corra en el servidor del ayuntamiento', situation: 'Un ayuntamiento quiere un asistente para tramitar licencias que no envíe nada fuera. Tienen un servidor con una GPU modesta y un funcionario que sabe de Linux "lo justo".', tech: 'llm', difficulty: 4, skills: { ai_tools: 2, sovereignty: 2, sysadmin: 2 }, twist: null, tags: ['desarrollo', 'ia', 'soberania'] },
  { id: 'ab-test-stats', title: 'El test A/B dice que el botón rojo vende más. Con 12 usuarios.', situation: 'Marketing quiere cambiar toda la web porque el botón rojo convirtió un 50 % más. La muestra son 12 personas y una era la madre del diseñador. Hay que montar experimentación con rigor.', tech: null, difficulty: 2, skills: { data_mining: 3, ux: 1, teaching: 1 }, twist: null, tags: ['datos', 'producto'] },
  { id: 'energy-grid-sim', title: 'Simular la red eléctrica de una comarca con energía renovable', situation: 'Una cooperativa energética quiere saber cuántas placas solares puede conectar antes de que la red se queje. Hay que simular la red, el viento, el sol y a los vecinos.', tech: 'python', difficulty: 4, skills: { rd: 3, data_mining: 2, ml_training: 1 }, twist: null, tags: ['i+d', 'datos'] },

  // Negocio, gestión y formación
  { id: 'estimate-impossible', title: 'Estimar un proyecto con una servilleta como especificación', situation: 'El cliente quiere "una app como Uber pero para fontaneros" y un presupuesto cerrado para el viernes. La especificación es una servilleta. La servilleta tiene una mancha donde iban los pagos.', tech: null, difficulty: 2, skills: { management: 3, architecture: 1, ux: 1 }, twist: null, tags: ['negocio'] },
  { id: 'onboarding-devs', title: 'Que un desarrollador nuevo sea productivo en una semana', situation: 'Ahora mismo, un recién llegado tarda tres semanas en poder ejecutar el proyecto. La documentación es un canal de chat con 40.000 mensajes. Y un vídeo de 2019.', tech: 'docker', difficulty: 2, skills: { teaching: 2, devops: 2, management: 1 }, twist: null, tags: ['formacion', 'ops'] },
  { id: 'open-source-release', title: 'Liberar la librería interna como open source', situation: 'La empresa quiere publicar su librería de validación como código abierto. Hay que limpiar credenciales, elegir licencia, escribir documentación y prepararse para el primer issue con mayúsculas.', tech: 'typescript', difficulty: 2, skills: { opensource: 3, security: 1, teaching: 1 }, twist: null, tags: ['negocio', 'oss'] },
  { id: 'tech-talk-company', title: 'Explicar a dirección qué es la deuda técnica sin usar la palabra "deuda"', situation: 'Dirección no entiende por qué "todo tarda tanto". Hay que dar una charla de 20 minutos que consiga presupuesto para refactorizar. Sin diagramas de arquitectura. Con alguna metáfora de cocina, quizá.', tech: null, difficulty: 2, skills: { teaching: 3, management: 2 }, twist: null, tags: ['formacion', 'negocio'] },
  { id: 'freelance-scope-creep', title: 'El cliente quiere "solo un cambio pequeño" por decimoquinta vez', situation: 'Un proyecto cerrado en 20 horas lleva 140. Cada cambio "es pequeño". Hay que renegociar el alcance y seguir cobrando, sin perder al cliente ni la dignidad.', tech: null, difficulty: 2, skills: { management: 3, ux: 1 }, twist: null, tags: ['negocio'] },
  { id: 'hackathon-weekend', title: 'Ganar el hackathon del sector con un fin de semana y tres cafés', situation: 'Cuarenta y ocho horas, un tema ("tecnología para el campo"), un jurado que valora la demo por encima de todo y un equipo que se conoció el viernes.', tech: 'claude_code', difficulty: 2, skills: { spec_driven: 2, rd: 1, ux: 1, front: 1 }, twist: null, tags: ['i+d', 'desarrollo'] },
  { id: 'eu-grant-report', title: 'Justificar el proyecto europeo con las facturas que hay', situation: 'El proyecto de I+D financiado termina y hay que entregar la memoria técnica y económica. Los entregables existen. Las horas imputadas, más o menos. La auditoría es en dos semanas.', tech: null, difficulty: 3, skills: { rd: 3, management: 2 }, twist: null, tags: ['i+d', 'negocio'] },
  { id: 'erp-year-end', title: 'Cierre de año en el ERP con el contable de vacaciones', situation: 'El 31 de diciembre el ERP debe cerrar el ejercicio. El contable está en Laponia sin cobertura. Hay un manual de 2011 y una nota que dice "preguntar a Paco".', tech: 'erp', difficulty: 3, skills: { erp: 3, management: 1, databases: 1 }, twist: null, tags: ['negocio'] },
  { id: 'startup-mvp-pivot', title: 'La startup pivota por tercera vez este trimestre', situation: 'De marketplace de mascotas a SaaS de logística a "algo con IA". El código tiene tres capas de cada pivote. Hay que decidir qué se salva y qué se entierra con honores.', tech: null, difficulty: 3, skills: { architecture: 2, management: 2, spec_driven: 1 }, twist: null, tags: ['negocio', 'arquitectura'] },
  { id: 'cooperative-platform', title: 'Una plataforma para una cooperativa que no quiere depender de nadie', situation: 'Una cooperativa de consumo quiere su tienda, su correo y sus datos en software libre y servidores propios, y que lo pueda mantener una persona a media jornada.', tech: 'onprem', difficulty: 3, skills: { sovereignty: 3, sysadmin: 2, opensource: 1 }, twist: null, tags: ['desarrollo', 'soberania'] },
  { id: 'seo-collapse', title: 'La web ha desaparecido de Google', situation: 'Tras el rediseño, el tráfico orgánico ha caído un 95 %. Alguien dejó un "noindex" en la plantilla base "para que no lo viera nadie durante las pruebas".', tech: 'seo', difficulty: 2, skills: { seo: 3, front: 1, management: 1 }, twist: null, tags: ['incidente', 'negocio'] },
  { id: 'drupal-security-update', title: 'Actualizar un Drupal 7 abandonado antes de que lo actualicen otros', situation: 'Drupal 7 está fuera de soporte y hay un exploit público. La web tiene 14 módulos personalizados sin documentación y un tema que rompe si respiras.', tech: 'drupal', difficulty: 3, skills: { cms: 3, legacy: 2, security: 2, back: 1 }, twist: null, tags: ['migracion', 'seguridad'] },
  { id: 'crm-missing-customers', title: 'El CRM ha perdido a la mitad de los clientes', situation: 'El equipo comercial abre el CRM y solo encuentra contactos cuyo apellido empieza entre la A y la M. Ventas necesita llamar hoy a los demás y nadie sabe quién tocó el filtro.', tech: 'erp', difficulty: 3, skills: { erp: 3, databases: 2, back: 1 }, twist: { text: 'El supuesto CRM es una distribución de Drupal con doce módulos personalizados y el filtro vive dentro de uno sin documentación.', skills: { cms: 2, legacy: 2, back: 1 }, tech: 'drupal' }, tags: ['incidente', 'negocio'] },
  { id: 'seo-javascript-indexing', title: 'Google solo ve una pantalla vacía', situation: 'La nueva web carga todo el contenido con JavaScript después de aceptar las cookies. Los usuarios la ven; el robot de Google contempla un div vacío y se marcha discretamente.', tech: 'seo', difficulty: 3, skills: { seo: 3, front: 2, performance: 1 }, twist: null, tags: ['desarrollo', 'negocio'] },
  { id: 'seo-migration-redirects', title: 'La migración ha roto diez años de enlaces', situation: 'Marketing estrenó en WordPress una estructura de URLs nueva sin mapa de redirecciones. Google conserva miles de direcciones antiguas, todas responden 404 y el tráfico cae por horas.', tech: 'seo', difficulty: 3, skills: { seo: 3, legacy: 2, management: 1 }, twist: null, tags: ['migracion', 'negocio'] },
  { id: 'bank-statement-legacy', title: 'El extracto bancario descuadra un céntimo', situation: 'El cierre diario deja un céntimo huérfano en miles de cuentas. El proceso lleva décadas funcionando y nadie quiere ser quien explique mañana por qué no abre la oficina.', tech: null, difficulty: 2, skills: { legacy: 3, back: 2, testing: 1 }, twist: { text: 'El cálculo está en COBOL y usa una tabla de redondeos aprobada cuando las pesetas todavía tenían conversación propia.', skills: { erp: 1 }, tech: 'cobol' }, tags: ['incidente', 'legacy', 'banca'] },
  { id: 'branch-terminal-forms', title: 'Los formularios de la sucursal imprimen clientes equivocados', situation: 'La aplicación de ventanilla mezcla el titular de una operación con la dirección de la siguiente. Solo ocurre al imprimir dos formularios seguidos y la impresora matricial no ayuda a investigar.', tech: null, difficulty: 3, skills: { legacy: 3, databases: 1, testing: 2 }, twist: { text: 'La aplicación está escrita en Delphi, pero el módulo de impresión conserva una biblioteca en Pascal que nadie compila desde 2004.', skills: { back: 1 }, tech: 'delphi' }, tags: ['incidente', 'legacy', 'banca'] },
  { id: 'zk-private-audit', title: 'Demostrar solvencia sin enseñar las cuentas', situation: 'Una plataforma debe probar ante sus clientes que conserva fondos suficientes sin publicar saldos, identidades ni movimientos. La auditoría tradicional llega tarde y el regulador quiere una prueba verificable.', tech: 'zk', difficulty: 5, skills: { crypto: 3, blockchain: 2, privacy: 2, rd: 1 }, twist: { text: 'Los compromisos se generaron con dos formatos incompatibles y hay que demostrar también que ambos representan el mismo saldo.', skills: { crypto: 1, data_eng: 1 }, tech: null }, tags: ['desarrollo', 'chain', 'seguridad', 'i+d'] },
  { id: 'post-quantum-credentials', title: 'Migrar las credenciales antes de que llegue la criptografía poscuántica', situation: 'Una infraestructura de identidad tiene millones de credenciales firmadas con algoritmos clásicos y dispositivos que vivirán diez años. Hay que diseñar una transición híbrida sin invalidarlas todas ni dejar dos sistemas de confianza peleándose.', tech: null, difficulty: 5, skills: { crypto: 3, security: 2, privacy: 1, architecture: 2 }, twist: { text: 'La mitad de los verificadores funciona sin conexión y no se podrá actualizar durante meses. La migración necesita agilidad criptográfica y compatibilidad hacia atrás.', skills: { crypto: 1, legacy: 2 }, tech: null }, tags: ['migracion', 'seguridad', 'i+d'] },
  { id: 'blockchain-r1-k1-mobile', title: 'Elegir entre R1 y K1 para firmar en una blockchain', situation: 'Una red blockchain debe aceptar credenciales corporativas con curva P-256 (R1), pero sus cuentas actuales firman con secp256k1 (K1). Hay que verificar ambas curvas sin confundir formatos, dominios ni firmas.', tech: 'evm', difficulty: 4, skills: { blockchain: 3, crypto: 3, security: 1 }, twist: { text: 'La clave R1 debe quedarse dentro del chip seguro del móvil: la firma sale del dispositivo, la clave privada no. Ahora también hay que integrar la autenticación móvil.', skills: { mobile: 3, crypto: 1 }, tech: null }, tags: ['desarrollo', 'chain', 'seguridad', 'mobile'] },

  /* --- Tanda de septiembre de 2026: ideas de Fernando y relleno de huecos de cobertura --- */
  { id: 'data-clean-room-sueldos', title: 'La sala limpia que no estaba tan limpia', situation: 'Dos empresas cruzan datos de clientes en un Data Clean Room para medir una campaña conjunta. Alguien ha notado que, afinando los filtros, las consultas agregadas dejan adivinar el sueldo de los jefes de la otra parte. El contrato dice "sin datos personales" y el comité se reúne el jueves.', tech: null, difficulty: 4, skills: { privacy: 3, gdpr: 2, data_eng: 2, security: 1 }, twist: { text: 'No basta con quitar columnas: hay que poner umbrales de agregación y ruido diferencial sin cargarse la utilidad de la medición.', skills: { rd: 2, data_mining: 1 }, tech: null }, tags: ['datos', 'seguridad', 'negocio'] },
  { id: 'nft-cromos-tebeo', title: 'Marketplace de cromos con humo digital', situation: 'Un cliente quiere un mercado de NFTs coleccionables de sus personajes de tebeo favoritos. Contrato inteligente, subastas, regalías al autor y una tienda que no dé vergüenza. El presupuesto llegó antes que el diseñador.', tech: 'evm', difficulty: 3, skills: { blockchain: 3, web3: 2, front: 2, design: 1 }, twist: { text: 'Nadie ha pensado en el arte. Los cromos son dibujitos de preescolar y el cliente se va antes de firmar.', skills: { design: 3, ux: 1 }, tech: null }, tags: ['desarrollo', 'chain', 'negocio'] },
  { id: 'unreal-sierra-madrid', title: 'Salvar al soldado Pérez', situation: 'Superproducción de consola con presupuesto de los que se cuentan en ruedas de prensa. Piden la sierra madrileña en Unreal Engine con vegetación, nieve y luz de tarde, a sesenta fotogramas y sin que la consola despegue. Nadie en la oficina ha tocado un motor gráfico en su vida.', tech: 'unreal', difficulty: 5, skills: { gamedev: 3, rd: 2, performance: 3, design: 1 }, twist: { text: 'El productor ha visto un vídeo de captura fotogramétrica y ahora quiere las rocas escaneadas de verdad. Toca pelearse con nubes de puntos de cuarenta gigas.', skills: { data_eng: 2, ml_training: 1 }, tech: null }, tags: ['desarrollo', 'i+d'] },
  { id: 'ochocientos-juegos-movil', title: 'Ochocientos juegos para el viernes', situation: 'Una editora quiere ochocientos juegos de móvil en tres meses. Textual: "la calidad me da igual, quiero que la gente no pueda soltar el teléfono". Hay plantillas, hay generadores y hay una hoja de cálculo con ochocientas filas vacías.', tech: null, difficulty: 4, skills: { nocode: 3, gamedev: 2, mobile: 2, ux: 2 }, twist: { text: 'La tienda de aplicaciones detecta el patrón y empieza a rechazar publicaciones por contenido repetido. Ahora hay que diferenciar de verdad, y sigue habiendo tres meses.', skills: { ai_tools: 2, spec_driven: 1 }, tech: null }, tags: ['desarrollo', 'negocio'] },
  { id: 'aleatoriedad-apuestas', title: 'Aleatoriedad de garrafa', situation: 'Una plataforma de apuestas en cadena necesita números aleatorios que nadie pueda predecir ni manipular, y menos el propio operador. La solución actual usa la marca de tiempo del bloque, que es tanto como dejar el bombo abierto.', tech: 'evm', difficulty: 4, skills: { blockchain: 3, crypto: 3, security: 2 }, twist: { text: 'Se han inspirado en las lámparas de lava de los de siempre, pero no encontraron ninguna y han montado la fuente de entropía con velas en un sótano. Hay que rehacerlo con compromiso y revelación verificables.', skills: { rd: 2, architecture: 1 }, tech: null }, tags: ['desarrollo', 'chain', 'seguridad'] },
  { id: 'ecommerce-zurdos-global', title: 'Tijeras para zurdos en cinco continentes', situation: 'Una tienda de productos para zurdos quiere vender en todo el mundo y aceptar absolutamente todas las formas de pago que existan, incluidas tres que solo funcionan en un país. Impuestos, monedas, aduanas y devoluciones incluidas.', tech: 'apis', difficulty: 4, skills: { apis: 3, i18n: 3, erp: 2, gdpr: 1 }, twist: { text: 'Cada pasarela tiene su propio idioma para "el pago ha fallado". Sin una capa de conciliación, contabilidad no cuadra ni un céntimo.', skills: { data_eng: 2, testing: 1 }, tech: null }, tags: ['desarrollo', 'negocio'] },
  { id: 'inmobiliaria-inyeccion', title: 'Auditoría en el portal inmobiliario', situation: 'Un portal de venta de pisos pide una revisión de seguridad antes de una ronda de inversión. El buscador de inmuebles monta las consultas concatenando cadenas, y el formulario de contacto guarda el DNI del interesado en claro.', tech: 'mysql', difficulty: 3, skills: { security: 3, databases: 2, back: 2, gdpr: 1 }, twist: { text: 'La inyección funciona: se puede leer la tabla de operaciones y cambiar el número de cuenta al que llegan las señales. Si nadie sabe de seguridad, la ronda se convierte en un comunicado.', skills: { security: 3, privacy: 1 }, tech: null }, tags: ['seguridad', 'incidente'] },
  { id: 'censura-automatica-video', title: 'Difuminado obligatorio por ley', situation: 'Una plataforma japonesa de vídeo para adultos debe cumplir la ley local, que obliga a difuminar determinadas partes del cuerpo en todo el catálogo. Son cuarenta mil horas y el equipo legal quiere el proceso auditado y reproducible, no a ojo.', tech: 'pytorch', difficulty: 4, skills: { ml_training: 3, performance: 2, mlops: 2, ai_tools: 1 }, twist: { text: 'El modelo confunde codos con otras cosas y difumina de más. Hay que ajustar el umbral, montar revisión humana por muestreo y dejar registro de cada decisión.', skills: { mlops: 2, testing: 1 }, tech: null }, tags: ['datos', 'negocio'] },

  { id: 'migrar-a-cadena-sin-evm', title: 'La cadena que no habla EVM', situation: 'Un proyecto quiere llevar su protocolo a una cadena sin máquina virtual de Ethereum: otro modelo de cuentas, otro lenguaje y otro concepto de transacción. El equipo lleva cuatro años pensando en Solidity y las costumbres pesan.', tech: 'rust', difficulty: 5, skills: { blockchain_non_evm: 3, blockchain: 2, architecture: 2, crypto: 1 }, twist: { text: 'Las dos cadenas tienen que convivir seis meses con un puente en medio. Un puente es exactamente donde se pierden los fondos.', skills: { security: 3, blockchain: 1 }, tech: null }, tags: ['migracion', 'chain', 'i+d'] },
  { id: 'saas-multi-tenant-factura', title: 'Un SaaS que no sabe a quién factura', situation: 'Producto en la nube con doscientos clientes, todos en la misma base de datos y ninguno bien separado. Los planes cambiaron tres veces, la facturación sale de un script de un becario y dos clientes grandes piden aislamiento por contrato.', tech: 'azure', difficulty: 4, skills: { saas: 3, architecture: 2, databases: 2, cloud: 2 }, twist: { text: 'Alguien descubre que las métricas de consumo se calculan sobre datos de todos los inquilinos a la vez. Facturación y aislamiento hay que arreglarlos de una pieza.', skills: { data_eng: 2, security: 1 }, tech: null }, tags: ['desarrollo', 'negocio'] },
  { id: 'wordpress-de-la-abuela', title: 'La web de la asociación', situation: 'Una asociación vecinal tiene un WordPress de doce años con veintiocho complementos, cuatro de ellos sin actualizar desde que existía Flash. Quieren publicar la programación de fiestas y que se vea bien en el móvil de la tesorera.', tech: 'wordpress', difficulty: 1, skills: { cms: 3, front: 1, seo: 1 }, twist: null, tags: ['desarrollo', 'negocio'] },
  { id: 'seo-canibalizado', title: 'Ocho páginas peleándose por la misma búsqueda', situation: 'Una tienda ha publicado ocho artículos casi idénticos sobre el mismo producto y ahora ninguno posiciona. El de marketing dice que hay que escribir más. La analítica dice otra cosa.', tech: 'seo', difficulty: 2, skills: { seo: 3, cms: 1, data_mining: 2 }, twist: { text: 'La mitad del catálogo se genera con plantillas y comparte texto palabra por palabra. La solución pasa por tocar el generador, no los artículos.', skills: { front: 1, spec_driven: 2 }, tech: null }, tags: ['negocio', 'datos'] },
  { id: 'copilot-en-el-legacy', title: 'El asistente que no conoce la casa', situation: 'La empresa compra licencias de asistente de código para todo el equipo esperando el doble de velocidad. En el monolito de quince años el asistente propone funciones que no existen y patrones que la casa prohibió en 2019. Piden medir si sirve de algo.', tech: 'copilot', difficulty: 2, skills: { ai_tools: 3, legacy: 2, teaching: 2, spec_driven: 2 }, twist: { text: 'Alguien ha aceptado sin leer una sugerencia que llamaba a una API de pago por cada petición. La factura del mes ha llegado con sorpresa.', skills: { testing: 2, management: 1 }, tech: null }, tags: ['formacion', 'negocio'] },
  { id: 'pascal-de-la-fabrica', title: 'El programa de la báscula', situation: 'Una fábrica pesa camiones con un programa en Pascal que escribió el hijo del dueño en los noventa. Funciona. El problema es que solo funciona en un ordenador concreto, que hace ruidos raros desde el jueves.', tech: 'pascal', difficulty: 3, skills: { legacy: 3, sysadmin: 2, architecture: 1, spec_driven: 2 }, twist: { text: 'No hay código fuente, solo el ejecutable y un disquete con algo que se le parece. Hay que reconstruir el comportamiento a partir de lo que hace.', skills: { legacy: 3, rd: 1 }, tech: null }, tags: ['migracion', 'incidente'] },
  { id: 'diseno-sin-sistema', title: 'Catorce azules corporativos', situation: 'La aplicación ha crecido a base de pantallas sueltas y hoy conviven catorce azules, seis tamaños de botón y tres formas de decir lo mismo. Nadie quiere rediseñar; quieren que deje de parecer que lo hicieron cuatro empresas distintas.', tech: 'figma', difficulty: 2, skills: { design: 3, ux: 2, front: 2, accessibility: 1 }, twist: { text: 'Al medir el contraste, la mitad de esos azules no pasa el mínimo de accesibilidad. El sistema de diseño nace ya con deuda.', skills: { accessibility: 3 }, tech: null }, tags: ['desarrollo', 'formacion'] },
  { id: 'token-clean-sin-integrar', title: 'El token se presenta el jueves y no hay nada conectado', situation: 'Sercampo presenta su token Clean dentro de una semana. El contrato está desplegado y las APIs responden una por una desde Postman, pero la aplicación no llama a ninguna: en el equipo de front nadie ha integrado una cartera antes. No falta protocolo, falta pegamento.', tech: 'evm', difficulty: 4, skills: { web3: 4, front: 2, apis: 2, blockchain: 1 }, twist: { text: 'Para que el usuario no pague gas se montó un paymaster que subvenciona las transacciones. Nadie lo ha fondeado, así que todas revierten con un error que no dice eso. Hay que dar con ello, dejarlo vigilado y que la aplicación avise en vez de quedarse en blanco.', skills: { blockchain: 2, observability: 2 }, tech: null }, tags: ['desarrollo', 'chain', 'incidente', 'negocio'] },
  { id: 'wallet-sin-frases', title: 'La cartera que nadie sabe usar', situation: 'Un producto web3 pierde a nueve de cada diez usuarios en el momento de apuntar las doce palabras. Quieren que entrar sea como entrar en cualquier sitio, sin renunciar a que las claves sean del usuario.', tech: 'evm', difficulty: 4, skills: { web3: 3, ux: 3, crypto: 2, front: 1 }, twist: { text: 'Marketing ha prometido recuperación de cuenta por correo. Hay que explicar qué se puede y qué no, y montar lo que sí sin mentir a nadie.', skills: { crypto: 2, teaching: 2 }, tech: null }, tags: ['desarrollo', 'chain', 'negocio'] }
];
