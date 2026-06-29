import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  transformProjectToCSVFormat,
  transformProjectsToCSVFormat,
  buildReverseDependencyMap,
} = require('./projectDataTransformer');

const baseProject = {
  details: [
    {
      name: 'Project Alpha',
      short_name: 'alpha',
      programme_name: 'Programme One',
      programme_short_name: 'P1',
      project_description: 'Alpha description',
      project_dependencies: [
        { name: 'Project Beta', description: 'Uses beta API' },
      ],
      documentation_link: ['https://docs.example/alpha'],
    },
  ],
  stage: 'live',
  developed: ['In-house', 'Supplier A'],
  source_control: [
    {
      type: 'GitHub',
      links: [{ url: 'https://github.com/org/alpha' }],
    },
  ],
  user: [
    {
      email: 'tech@ons.gov.uk',
      grade: 'SEO',
      roles: ['Technical Contact'],
    },
    {
      email: 'dm@ext.ons.gov.uk',
      grade: 'G7',
      roles: ['Delivery Manager'],
    },
  ],
  architecture: {
    languages: {
      main: ['JavaScript'],
      others: ['SQL'],
    },
    frameworks: {
      others: ['Express'],
    },
    hosting: {
      type: ['AWS'],
      details: ['ECS'],
    },
    environments: {
      dev: true,
      int: false,
      uat: true,
      preprod: true,
      prod: true,
      postprod: false,
    },
    cicd: {
      others: ['Concourse'],
    },
    database: {
      main: ['PostgreSQL'],
      others: ['Redis'],
    },
    infrastructure: {
      others: ['Terraform'],
    },
    publishing: {
      main: ['Web'],
      others: ['API'],
    },
  },
  supporting_tools: {
    project_tracking: 'Jira',
    code_editors: { others: ['VS Code'] },
    communication: { others: ['Slack'] },
    collaboration: { others: ['Confluence'] },
    incident_management: 'PagerDuty',
    documentation: { others: ['MkDocs'] },
    user_interface: { others: ['Figma'] },
    diagrams: { others: ['Draw.io'] },
    miscellaneous: [{ name: 'ToolX', description: 'Used for X' }],
  },
};

describe('projectDataTransformer utilities', () => {
  it('buildReverseDependencyMap maps dependents correctly', () => {
    const projects = [
      {
        details: [
          {
            name: 'Project Alpha',
            project_dependencies: [
              { name: 'Project Beta', description: 'API' },
            ],
          },
        ],
      },
      {
        details: [
          {
            name: 'Project Gamma',
            project_dependencies: [
              { name: 'Project Beta', description: 'Data' },
            ],
          },
        ],
      },
    ];

    const result = buildReverseDependencyMap(projects);

    expect(result).toEqual({
      'Project Beta': [
        { name: 'Project Alpha', description: 'API' },
        { name: 'Project Gamma', description: 'Data' },
      ],
    });
  });

  it('transformProjectToCSVFormat returns expected transformed shape', () => {
    const reverseDependencyMap = {
      'Project Alpha': [
        { name: 'Project Delta', description: 'Depends on alpha' },
      ],
    };

    const result = transformProjectToCSVFormat(
      baseProject,
      reverseDependencyMap
    );

    expect(result.Project).toBe('Project Alpha');
    expect(result.Project_Short).toBe('alpha');
    expect(result.Programme).toBe('Programme One');
    expect(result.Project_Dependencies).toEqual([
      { name: 'Project Beta', description: 'Uses beta API' },
    ]);
    expect(result.Listed_As_Project_Dependency).toEqual([
      { name: 'Project Delta', description: 'Depends on alpha' },
    ]);
    expect(result.Developed).toBe('In-house with Supplier A');
    expect(result.Technical_Contact).toBe('tech@ons.gov.uk (SEO)');
    expect(result.Delivery_Manager).toBe('dm@ext.ons.gov.uk (G7)');
    expect(result.Language_Main).toBe('JavaScript');
    expect(result.Language_Others).toBe('SQL');
    expect(result.Language_Frameworks).toBe('Express');
    expect(result.Hosted).toBe('AWS');
    expect(result.Architectures).toBe('ECS');
    expect(result.Environments).toBe('DEV; UAT; PRE-PROD (STAGING); PROD');
    expect(result.Source_Control).toBe('GitHub');
    expect(result.Repo).toBe('https://github.com/org/alpha');
    expect(result.CICD).toBe('Concourse');
    expect(result.Datastores).toBe('Redis');
    expect(result.Database_Technologies).toBe('PostgreSQL');
    expect(result.Project_Tools).toBe('Jira');
    expect(result.Documentation).toBe('https://docs.example/alpha');
    expect(result.Infrastructure).toBe('Terraform');
    expect(result.Code_Editors).toBe('VS Code');
    expect(result.Communication).toBe('Slack');
    expect(result.Collaboration).toBe('Confluence');
    expect(result.Incident_Management).toBe('PagerDuty');
    expect(result.Documentation_Tools).toBe('MkDocs');
    expect(result.UI_Tools).toBe('Figma');
    expect(result.Diagram_Tools).toBe('Draw.io');
    expect(result.Miscellaneous).toBe('ToolX: Used for X');
    expect(result.Publishing_Target).toBe('Web; API');
  });

  it('transformProjectsToCSVFormat includes reverse dependency info', () => {
    const projectBeta = {
      ...baseProject,
      details: [
        {
          ...baseProject.details[0],
          name: 'Project Beta',
          short_name: 'beta',
          project_dependencies: [],
        },
      ],
    };

    const transformed = transformProjectsToCSVFormat([
      baseProject,
      projectBeta,
    ]);
    const beta = transformed.find(
      project => project.Project === 'Project Beta'
    );

    expect(beta.Listed_As_Project_Dependency).toEqual([
      { name: 'Project Alpha', description: 'Uses beta API' },
    ]);
  });
});
