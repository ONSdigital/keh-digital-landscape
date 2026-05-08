// Controlled vocabulary for tagging technologies.
// Values are stored on entries as `tags: string[]`.

export const TECHNOLOGY_TAG_OPTIONS = [
  // General domains
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'FullStack', value: 'fullstack' },
  { label: 'Data', value: 'data' },
  { label: 'DevOps', value: 'devops' },
  { label: 'Security', value: 'security' },

  // Programming languages
  { label: 'Programming Language', value: 'programming-language' },
  { label: 'Scripting Language', value: 'scripting-language' },
  { label: 'Systems Language', value: 'systems-language' },
  { label: 'Query Language', value: 'query-language' },

  // Delivery & quality
  { label: 'CI/CD', value: 'ci-cd' },
  { label: 'Testing', value: 'testing' },

  // Infrastructure
  { label: 'Cloud', value: 'cloud' },
  { label: 'Containers', value: 'containers' },
  { label: 'Kubernetes', value: 'kubernetes' },
  { label: 'Infrastructure as Code', value: 'iac' },

  // Data and storage
  { label: 'Datastore', value: 'datastore' },
  { label: 'SQL', value: 'sql' },
  { label: 'NoSQL', value: 'nosql' },
  { label: 'Caching', value: 'caching' },

  // Integration
  { label: 'API', value: 'api' },
  { label: 'Microservices', value: 'microservices' },
  { label: 'Batch', value: 'batch' },
  { label: 'Streaming', value: 'streaming' },
  { label: 'Messaging', value: 'messaging' },
  { label: 'Webhooks', value: 'webhooks' },

  // Tools
  { label: 'Observability Tools', value: 'observability-tools' },
  { label: 'Monitoring Tools', value: 'monitoring-tools' },
  { label: 'Logging Tools', value: 'logging-tools' },
  { label: 'Security Tools', value: 'security-tools' },
  { label: 'Developer Tools', value: 'developer-tools' },
  { label: 'Linting Tools', value: 'linting-tools' },
  { label: 'Supporting Tools', value: 'supporting-tools' },
];
