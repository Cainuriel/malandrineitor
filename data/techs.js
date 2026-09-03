/* Catálogo de tecnologías. Sirven como expertise (campeón), criptonita y tecnología principal de un reto.
   group: front | back | mobile | data | ops | cloud | ia | chain | lang | tools */
window.MI = window.MI || {};
MI.data = MI.data || {};

MI.data.techs = [
  { id: 'react',       name: 'React',            group: 'front', aliases: ['reactjs', 'next', 'nextjs'] },
  { id: 'angular',     name: 'Angular',          group: 'front', aliases: [] },
  { id: 'vue',         name: 'Vue',              group: 'front', aliases: ['nuxt'] },
  { id: 'svelte',      name: 'Svelte',           group: 'front', aliases: ['sveltekit'] },
  { id: 'sass',        name: 'Sass / CSS',       group: 'front', aliases: ['scss', 'css', 'tailwind'] },
  { id: 'wordpress',   name: 'WordPress',        group: 'front', aliases: ['wp'] },
  { id: 'drupal',      name: 'Drupal',           group: 'front', aliases: [] },
  { id: 'seo',         name: 'SEO',              group: 'front', aliases: ['posicionamiento', 'seo técnico'] },

  { id: 'java',        name: 'Java',             group: 'back',  aliases: ['spring', 'spring boot', 'jakarta'] },
  { id: 'kotlin',      name: 'Kotlin',           group: 'back',  aliases: [] },
  { id: 'dotnet',      name: '.NET',             group: 'back',  aliases: ['c#', 'csharp'] },
  { id: 'php',         name: 'PHP',              group: 'back',  aliases: ['laravel'] },
  { id: 'symfony',     name: 'Symfony',          group: 'back',  aliases: [] },
  { id: 'node',        name: 'Node.js',          group: 'back',  aliases: ['express', 'nest', 'nestjs', 'bun', 'deno'] },
  { id: 'python',      name: 'Python',           group: 'back',  aliases: ['django', 'fastapi', 'flask'] },
  { id: 'go',          name: 'Go',               group: 'back',  aliases: ['golang'] },
  { id: 'apis',        name: 'APIs (REST/GraphQL)', group: 'back', aliases: ['rest', 'graphql', 'openapi', 'grpc'] },

  { id: 'flutter',     name: 'Flutter',          group: 'mobile', aliases: ['dart'] },
  { id: 'android',     name: 'Android',          group: 'mobile', aliases: [] },
  { id: 'ios',         name: 'iOS',              group: 'mobile', aliases: ['swift'] },

  { id: 'postgres',    name: 'PostgreSQL',       group: 'data',  aliases: ['postgresql', 'sql'] },
  { id: 'mysql',       name: 'MySQL / MariaDB',  group: 'data',  aliases: ['mariadb'] },
  { id: 'mongodb',     name: 'MongoDB',          group: 'data',  aliases: ['mongo'] },
  { id: 'spark',       name: 'Spark / big data', group: 'data',  aliases: ['hadoop', 'databricks'] },

  { id: 'docker',      name: 'Docker',           group: 'ops',   aliases: ['compose'] },
  { id: 'kubernetes',  name: 'Kubernetes',       group: 'ops',   aliases: ['k8s', 'helm'] },
  { id: 'terraform',   name: 'Terraform / IaC',  group: 'ops',   aliases: ['ansible', 'pulumi'] },
  { id: 'linux',       name: 'Linux',            group: 'ops',   aliases: ['debian', 'ubuntu', 'bash'] },
  { id: 'observability', name: 'Prometheus / Grafana', group: 'ops', aliases: ['prometheus', 'grafana', 'opentelemetry'] },

  { id: 'aws',         name: 'AWS',              group: 'cloud', aliases: ['amazon web services'] },
  { id: 'azure',       name: 'Azure',            group: 'cloud', aliases: [] },
  { id: 'gcp',         name: 'Google Cloud',     group: 'cloud', aliases: ['gcp'] },
  { id: 'onprem',      name: 'On-premise / soberano', group: 'cloud', aliases: ['proxmox', 'bare metal'] },

  { id: 'claude_code', name: 'Claude Code',      group: 'ia',    aliases: ['claude', 'agentes de código'] },
  { id: 'copilot',     name: 'GitHub Copilot',   group: 'ia',    aliases: ['copilot', 'github copilot'] },
  { id: 'llm',         name: 'LLM y RAG',        group: 'ia',    aliases: ['rag', 'langchain', 'openai', 'ollama'] },
  { id: 'pytorch',     name: 'PyTorch / ML',     group: 'ia',    aliases: ['tensorflow', 'scikit-learn', 'sklearn'] },

  { id: 'evm',         name: 'Blockchain EVM',   group: 'chain', aliases: ['ethereum', 'solidity', 'besu', 'hyperledger'] },
  { id: 'zk',          name: 'Pruebas ZK',       group: 'chain', aliases: ['zero knowledge', 'circom', 'zkvm'] },

  { id: 'typescript',  name: 'TypeScript',       group: 'lang',  aliases: ['javascript', 'js', 'ts'] },
  { id: 'rust',        name: 'Rust',             group: 'lang',  aliases: [] },
  { id: 'cobol',       name: 'COBOL / mainframe', group: 'lang', aliases: ['mainframe', 'as400'] },
  { id: 'delphi',      name: 'Delphi',           group: 'lang',  aliases: ['object pascal'] },
  { id: 'pascal',      name: 'Pascal',           group: 'lang',  aliases: ['free pascal', 'lazarus'] },

  { id: 'nocode',      name: 'No-code / automatización', group: 'tools', aliases: ['n8n', 'make', 'zapier', 'bubble'] },
  { id: 'erp',         name: 'ERP / CRM',        group: 'tools', aliases: ['sap', 'odoo', 'dynamics', 'salesforce'] },
  { id: 'figma',       name: 'Figma / diseño',   group: 'tools', aliases: ['adobe', 'illustrator'] }
];
