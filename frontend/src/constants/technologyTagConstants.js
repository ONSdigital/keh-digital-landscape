// Controlled vocabulary for tagging technologies.

export const TECHNOLOGY_TAG_OPTIONS = [
  // 1. PROGRAMMING & LANGUAGE
  { label: 'Programming Language', value: 'programming-language' }, // Python, Java, Go, R,

  // 2. FRAMEWORKS & LIBRARIES
  { label: 'Frontend Framework', value: 'frontend-framework' }, // Angular, React, Vue
  { label: 'Application Framework', value: 'application-framework' }, // Django, Spring Boot, FastAPI, Express
  { label: 'UI Component Library', value: 'ui-component-library' }, // Material UI, ONS Design System

  // API styles
  { label: 'GraphQL API', value: 'graphql-api' }, // GraphQL, Apollo

  // 4. DATA & ANALYTICS & STORAGE
  { label: 'Data Processing', value: 'data-processing' }, // Pandas, Spark,
  { label: 'Machine Learning', value: 'machine-learning' }, // TensorFlow, PyTorch
  { label: 'Relational Database', value: 'relational-database' }, // PostgreSQL, MySQL
  { label: 'Document Database', value: 'document-database' }, // MongoDB
  { label: 'Caching', value: 'caching' }, // Redis, Memcached

  { label: 'Event Streaming', value: 'event-streaming' }, // Kafka
  { label: 'Queues & Messaging', value: 'queues-messaging' }, // RabbitMQ, SQS

  // 5. DEVOPS & SOFTWARE DELIVERY
  { label: 'CI/CD', value: 'ci-cd' }, // GitHub Actions, Jenkins, GitLab CI, Concourse
  { label: 'Source Control', value: 'source-control' }, // GitHub, GitLab, Bitbucket
  { label: 'Infrastructure as Code', value: 'iac' }, // Terraform, CloudFormation

  { label: 'Container Runtime', value: 'container-runtime' }, // Docker, Podman
  { label: 'Container Registry', value: 'container-registry' }, // Docker Hub, ECR, GCR

  // 6. TESTING & QUALITY ASSURANCE
  { label: 'Unit Testing', value: 'unit-testing' }, // Pytest, JUnit
  { label: 'Integration Testing', value: 'integration-testing' }, // Spring tests, API tests
  { label: 'E2E Testing', value: 'e2e-testing' }, // Cypress, Playwright, Selenium

  // 7. CLOUD & INFRASTRUCTURE
  { label: 'Cloud Provider', value: 'cloud-provider' }, // AWS, GCP, Azure

  { label: 'Compute Services', value: 'cloud-compute' }, // AWS EC2, Azure VM, GCP Compute Engine
  { label: 'Serverless / FaaS', value: 'serverless' }, // AWS Lambda, Azure Functions, Google Cloud Functions
  { label: 'Cloud Storage', value: 'cloud-storage' }, // S3, Azure Blob Storage, Google Cloud Storage
  { label: 'Cloud Database', value: 'cloud-database' }, // DynamoDB, RDS, Cloud SQL, Firestore, BigQuery
  { label: 'Cloud Networking', value: 'cloud-networking' }, // VPC, API Gateway, Load Balancers, CloudFront, CDN
  { label: 'Cloud Messaging', value: 'cloud-messaging' }, // SQS, SNS, Pub/Sub, EventBridge
  { label: 'Cloud Security', value: 'cloud-security' }, // IAM, Cognito, Key Vault
  { label: 'Cloud Observability', value: 'cloud-observability' }, // CloudWatch, Stackdriver, Azure Monitor

  // 8.  DEV TOOLING & PRODUCTIVITY
  { label: 'Linting Tools', value: 'linting-tools' }, // ESLint, Pylint, Ruff
  { label: 'Documentation Tools', value: 'documentation-tools' }, // Roxygen2, Mkdocs
  { label: 'Package Manager', value: 'package-manager' }, // npm, Poetry, renv

  { label: 'Monitoring Tools', value: 'monitoring-tools' }, // Prometheus, Datadog
  { label: 'Logging Tools', value: 'logging-tools' }, // Splunk, ELK
  { label: 'Tracing Tools', value: 'tracing-tools' }, // OpenTelemetry
  { label: 'Security Tools', value: 'security-tools' }, // SonarQube, static analysis tools,

  // 9. DEVELOPER EXPERIENCE & AI TOOLS
  { label: 'IDE / Editor Tools', value: 'ide-editor-tools' }, // VS Code, PyCharm, IntelliJ
  { label: 'AI Code Assistant', value: 'ai-code-assistant' }, // GitHub Copilot,
  { label: 'AI Agent Tool', value: 'ai-agent-tool' }, // Copilot CLI, agent-based dev tools
];
