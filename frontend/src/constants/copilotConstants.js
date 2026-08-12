/**
 * Display name mappings for Copilot usage data.
 * Used by processOrgHistory.js to format raw API values into human-readable labels.
 */

export const MODEL_NAMES = {
  'gpt-3.5': 'GPT-3.5',
  'gpt-4.0': 'GPT-4.0',
  'gpt-4.1': 'GPT-4.1',
  'gpt-4o': 'GPT-4o',
  'gpt-5.2': 'GPT-5.2',
  'gpt-5.2-codex': 'GPT-5.2 Codex',
  'gpt-5.3-codex': 'GPT-5.3 Codex',
  'gpt-5.4': 'GPT-5.4',
  'claude-4.5-sonnet': 'Claude 4.5 Sonnet',
  'claude-4.5-haiku': 'Claude 4.5 Haiku',
  'claude-4.6-sonnet': 'Claude 4.6 Sonnet',
  'claude-sonnet-4.6': 'Claude Sonnet 4.6',
  'claude-opus-4.5': 'Claude Opus 4.5',
  'claude-opus-4.6': 'Claude Opus 4.6',
  auto: 'Auto',
  unknown: 'Unknown',
};

export const IDE_NAMES = {
  vscode: 'VSCode',
  intellij: 'IntelliJ',
  visualstudio: 'Visual Studio',
  goland: 'GoLand',
  pycharm: 'PyCharm',
  rstudio: 'RStudio',
};

export const LANGUAGE_NAMES = {
  bash: 'Bash',
  bat: 'Batch',
  c: 'C',
  cmd: 'CMD',
  cpp: 'C++',
  csharp: 'C#',
  css: 'CSS',
  csv: 'CSV',
  diff: 'Diff',
  dockercompose: 'Docker Compose',
  dockerfile: 'Dockerfile',
  dotenv: '.env',
  env: '.env',
  'github-actions-workflow': 'GitHub Actions',
  go: 'Go',
  haskell: 'Haskell',
  hcl: 'HCL',
  html: 'HTML',
  ignore: '.gitignore',
  ini: 'INI',
  instructions: 'Instructions',
  java: 'Java',
  javascript: 'JavaScript',
  jinja: 'Jinja',
  js: 'JavaScript',
  json: 'JSON',
  jsonc: 'JSONC',
  jsx: 'JavaScript',
  lookml: 'LookML',
  lua: 'Lua',
  make: 'Make',
  makefile: 'Makefile',
  markdown: 'Markdown',
  'mermaid.erdiagram': 'Mermaid',
  njk: 'Nunjucks',
  nunjucks: 'Nunjucks',
  php: 'PHP',
  plaintext: 'Plain Text',
  powershell: 'PowerShell',
  promql: 'PromQL',
  properties: 'Properties',
  python: 'Python',
  qml: 'QML',
  quarto: 'Quarto',
  r: 'R',
  restructuredtext: 'reStructuredText',
  rmd: 'R Markdown',
  rust: 'Rust',
  sas: 'SAS',
  sh: 'Shell',
  shell: 'Shell',
  shellscript: 'Shell',
  sql: 'SQL',
  svelte: 'Svelte',
  terraform: 'Terraform',
  text: 'Text',
  toml: 'TOML',
  ts: 'TypeScript',
  tsv: 'TSV',
  tsx: 'TypeScript',
  txt: 'Text',
  typescript: 'TypeScript',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
  zsh: 'Zsh',
};

/**
 * ONS-compliant colour palette for the Copilot Dashboard.
 * See:
 * - https://service-manual.ons.gov.uk/brand-guidelines/colours
 * - https://service-manual.ons.gov.uk/data-visualisation/colours/using-colours-in-charts
 */
export const OTHER_SLICE_COLOR = {
  light: '#708090', // Slate grey
  dark: '#d9d9d9',  // Light grey
};

export const COPILOT_CHART_PALETTE = {
  light: [
    '#206095', // Ocean blue
    '#a8bd3a', // Spring green
    '#871a5b', // Beetroot purple
    '#f66068', // Coral pink
    '#27a0cc', // Sky blue
    '#003c57', // Night blue
    '#746cb1', // Lavender purple
  ],
  dark: [
    '#27a0cc', // Sky blue
    '#a8bd3a', // Spring green
    '#f66068', // Coral pink
    '#fbc900', // Sun yellow
    '#22d0b6', // Mint green
    '#0f8243', // Leaf green
    '#902082', // Plum purple
  ],
};
