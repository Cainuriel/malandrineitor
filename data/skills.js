/* Catálogo de habilidades. Añadir una habilidad = añadir una entrada.
   Las cartas que no la declaren toman config.skills.defaultValue.
   group: dev | ops | ia | data | seguridad | producto | negocio | transversal */
window.MI = window.MI || {};
MI.data = MI.data || {};

MI.data.skills = [
  // Desarrollo
  { id: 'front',        name: 'Front-end',                     short: 'FRONT', group: 'dev',        desc: 'Interfaces web, componentes, estado en cliente, rendimiento de render.' },
  { id: 'back',         name: 'Back-end',                      short: 'BACK',  group: 'dev',        desc: 'Lógica de servidor, APIs, integración, concurrencia.' },
  { id: 'apis',         name: 'Diseño de APIs',                short: 'API',   group: 'dev',        desc: 'REST, GraphQL, gRPC, versionado, contratos y documentación OpenAPI.' },
  { id: 'mobile',       name: 'Mobile',                        short: 'MOBIL', group: 'dev',        desc: 'Apps nativas e híbridas, publicación en tiendas.' },
  { id: 'databases',    name: 'Bases de datos',                short: 'DB',    group: 'dev',        desc: 'Modelado, SQL y NoSQL, índices, migraciones, consultas lentas.' },
  { id: 'architecture', name: 'Arquitectura de software',      short: 'ARQ',   group: 'dev',        desc: 'Diseño de sistemas, patrones, límites de contexto, deuda técnica.' },
  { id: 'legacy',       name: 'Legacy y migraciones',          short: 'LEGCY', group: 'dev',        desc: 'Código heredado, refactor a gran escala, migraciones de versión y de plataforma.' },
  { id: 'testing',      name: 'Testing y QA',                  short: 'TEST',  group: 'dev',        desc: 'Estrategia de pruebas, automatización, cobertura útil, TDD.' },
  { id: 'performance',  name: 'Rendimiento',                   short: 'PERF',  group: 'dev',        desc: 'Profiling, caché, Web Vitals, optimización de consultas y latencia.' },
  { id: 'blockchain',   name: 'Blockchain EVM',                short: 'EVM',   group: 'dev',        desc: 'Smart contracts y redes compatibles con Ethereum Virtual Machine.' },
  { id: 'blockchain_non_evm', name: 'Blockchain no EVM',       short: 'NOEVM', group: 'dev',        desc: 'Bitcoin y redes blockchain construidas con Rust u otras arquitecturas no EVM.' },
  { id: 'web3',         name: 'Web3',                          short: 'WEB3',  group: 'dev',        desc: 'Integración web con wallets, firmas, identidad y aplicaciones blockchain.' },
  { id: 'opensource',   name: 'Open source',                   short: 'OSS',   group: 'dev',        desc: 'Contribución, mantenimiento y gobernanza de proyectos abiertos.' },

  // Operaciones
  { id: 'devops',       name: 'DevOps y CI/CD',                short: 'DEVOP', group: 'ops',        desc: 'Pipelines, contenedores, orquestación, infraestructura como código.' },
  { id: 'cloud',        name: 'Cloud',                         short: 'CLOUD', group: 'ops',        desc: 'Servicios gestionados, redes virtuales, costes, alta disponibilidad.' },
  { id: 'sysadmin',     name: 'Sistemas y redes',              short: 'SYS',   group: 'ops',        desc: 'Linux, virtualización, DNS, redes, hardening de servidores.' },
  { id: 'observability',name: 'Observabilidad y SRE',          short: 'SRE',   group: 'ops',        desc: 'Métricas, logs, trazas, alertas, gestión de incidentes, postmortems.' },
  { id: 'saas',         name: 'SaaS y multi-tenant',           short: 'SAAS',  group: 'ops',        desc: 'Productos como servicio, aislamiento de clientes, facturación, escalado.' },

  // Inteligencia artificial
  { id: 'spec_driven',  name: 'IA: desarrollo dirigido por especificación', short: 'SPEC', group: 'ia', desc: 'Desarrollo agéntico: especificar, delegar a agentes de código y verificar. Todos los malandrines la tienen.' },
  { id: 'ai_tools',     name: 'IA: creación de herramientas',  short: 'AITOOL', group: 'ia',        desc: 'Agentes, RAG, integración de modelos en producto, prompts como código.' },
  { id: 'ml_training',  name: 'IA: entrenamiento y fine-tuning', short: 'MLTR', group: 'ia',        desc: 'Machine Learning Engineer: datasets, entrenamiento, ajuste fino, evaluación.' },
  { id: 'mlops',        name: 'MLOps',                         short: 'MLOPS', group: 'ia',        desc: 'Despliegue, versionado y monitorización de modelos en producción.' },

  // Datos
  { id: 'data_eng',     name: 'Ingeniería de datos',           short: 'DATA',  group: 'data',       desc: 'Pipelines, ETL/ELT, almacenes de datos, calidad del dato.' },
  { id: 'data_mining',  name: 'Data mining y analítica',       short: 'MINE',  group: 'data',       desc: 'Exploración, estadística, extracción de patrones, cuadros de mando.' },

  // Seguridad y cumplimiento
  { id: 'security',     name: 'Seguridad',                     short: 'SEC',   group: 'seguridad',  desc: 'Pentesting, respuesta a incidentes, OWASP, hardening, gestión de secretos.' },
  { id: 'crypto',       name: 'Criptografía',                  short: 'CRYPT', group: 'seguridad',  desc: 'Primitivas, protocolos, firmas, pruebas de conocimiento cero.' },
  { id: 'privacy',      name: 'Privacidad por diseño',         short: 'PRIV',  group: 'seguridad',  desc: 'Minimización de datos, anonimización, identidad digital.' },
  { id: 'gdpr',         name: 'RGPD y cumplimiento',           short: 'RGPD',  group: 'seguridad',  desc: 'Normativa, evaluaciones de impacto, contratos de encargo, auditorías.' },
  { id: 'sovereignty',  name: 'Soberanía digital',             short: 'SOBER', group: 'seguridad',  desc: 'Infraestructura propia, independencia de proveedores, software libre en la administración.' },

  // Producto
  { id: 'ux',           name: 'Producto y UX',                 short: 'UX',    group: 'producto',   desc: 'Investigación con usuarios, flujos, priorización, métricas de producto.' },
  { id: 'design',       name: 'Diseño gráfico',                short: 'DISEÑ', group: 'producto',   desc: 'Identidad visual, tipografía, sistemas de diseño, ilustración.' },
  { id: 'accessibility',name: 'Accesibilidad',                 short: 'A11Y',  group: 'producto',   desc: 'WCAG, lectores de pantalla, navegación por teclado.' },
  { id: 'seo',          name: 'SEO y posicionamiento',         short: 'SEO',   group: 'producto',   desc: 'SEO técnico, indexación, arquitectura de contenidos y rendimiento orgánico.' },

  // Negocio y transversales
  { id: 'erp',          name: 'ERP y CRM',                     short: 'ERP',   group: 'negocio',    desc: 'Sistemas de gestión empresarial, integraciones, procesos de negocio.' },
  { id: 'management',   name: 'Gestión de proyectos',          short: 'GEST',  group: 'negocio',    desc: 'Planificación, riesgos, clientes, equipos, presupuestos.' },
  { id: 'rd',           name: 'I+D',                           short: 'I+D',   group: 'negocio',    desc: 'Investigación aplicada, prototipado, propuestas y proyectos financiados.' },
  { id: 'teaching',     name: 'Docencia y comunicación',       short: 'DOCEN', group: 'transversal',desc: 'Formar, documentar, explicar, mentorizar. Muy malandrín.' },
  { id: 'nocode',       name: 'No-code y vibe coding',         short: 'NOCOD', group: 'transversal',desc: 'Herramientas visuales, automatizaciones y prototipos rápidos.' }
];

MI.data.skillGroups = {
  dev:        { name: 'Desarrollo',        color: '#4cc9f0' },
  ops:        { name: 'Operaciones',       color: '#80ed99' },
  ia:         { name: 'Inteligencia artificial', color: '#f72585' },
  data:       { name: 'Datos',             color: '#ffd166' },
  seguridad:  { name: 'Seguridad',         color: '#ff6b35' },
  producto:   { name: 'Producto',          color: '#c77dff' },
  negocio:    { name: 'Negocio',           color: '#f4a261' },
  transversal:{ name: 'Transversal',       color: '#e0e1dd' }
};
