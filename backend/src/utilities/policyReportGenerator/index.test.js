import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { generateReport } = require('./index');

describe('policyReportGenerator/index', () => {
  it('builds a self-contained organisation report with inline CSS and metadata', () => {
    const { html, fileName } = generateReport({
      reportType: 'organisation',
      inputs: {
        organisation: 'ONS-Innovation',
        sourceDataset: '2026-07-23T12:13:07Z',
        comparisonDataset: '2026-07-16T12:13:07Z',
        sourceDatasetData: {
          summary: {
            total_repositories: 2,
            compliant_repositories: 1,
            total_teams: 2,
            compliant_teams: 1,
            repository_checks: {
              codeowners: { total: 2, compliant: 1 },
            },
            team_checks: {
              team_maintainer: { total: 2, compliant: 1 },
            },
            repository_ratings: {
              platinum: 0,
              gold: 1,
              silver: 0,
              bronze: 1,
              unrated: 0,
            },
          },
        },
        comparisonDatasetData: {
          summary: {
            total_repositories: 1,
            compliant_repositories: 1,
            total_teams: 1,
            compliant_teams: 1,
            repository_checks: {
              codeowners: { total: 1, compliant: 1 },
            },
            team_checks: {
              team_maintainer: { total: 1, compliant: 1 },
            },
            repository_ratings: {
              platinum: 0,
              gold: 1,
              silver: 0,
              bronze: 0,
              unrated: 0,
            },
          },
        },
      },
    });

    expect(fileName).toMatch(/^policy-organisation-\d{8}T\d{6}\d{3}Z\.html$/);
    expect(html).toContain('<style>');
    expect(html).not.toContain('rel="stylesheet"');
    expect(html).toContain('Organisational GitHub Usage Policy Report');
    expect(html).toContain('ONS-Innovation');
    expect(html).toContain('2026-07-23T12:13:07Z');
    expect(html).toContain('2026-07-16T12:13:07Z');
  });

  it('renders repository report rows from selectedRepositories input', () => {
    const { html } = generateReport({
      reportType: 'repository',
      inputs: {
        organisation: 'my-org',
        sourceDataset: '2026-07-23T12:13:07Z',
        selectedRepositories: ['alpha-data-pipeline', 'beta-insights-service'],
      },
    });

    expect(html).toContain('Repository GitHub Usage Policy Report');
    expect(html).toContain('alpha-data-pipeline');
    expect(html).toContain('beta-insights-service');
    expect(html).toContain('id="repo-alpha-data-pipeline"');
    expect(html).toContain('id="repo-beta-insights-service"');
  });

  it('renders team report rows from selectedTeams input', () => {
    const { html } = generateReport({
      reportType: 'team',
      inputs: {
        organisation: 'my-org',
        sourceDataset: '2026-07-23T12:13:07Z',
        selectedTeams: ['atlas-delivery-hub', 'nova-insights-team'],
      },
    });

    expect(html).toContain('Team GitHub Usage Policy Report');
    expect(html).toContain('atlas-delivery-hub');
    expect(html).toContain('nova-insights-team');
    expect(html).toContain('id="team-atlas-delivery-hub"');
    expect(html).toContain('id="team-nova-insights-team"');
  });

  it('escapes user-controlled values in generated content', () => {
    const { html } = generateReport({
      reportType: 'repository',
      inputs: {
        organisation: '<script>alert(1)</script>',
        sourceDataset: 'dataset',
        selectedRepositories: ['repo-1'],
      },
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
