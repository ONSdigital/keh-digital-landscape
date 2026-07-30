import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildEntityReportHtml } = require('./entityReportTemplate');

describe('entityReportTemplate', () => {
  it('renders selected entities with anchors and detail blocks', () => {
    const html = buildEntityReportHtml({
      inputs: {
        organisation: 'my-org',
        sourceDataset: 'dataset/20260723T121307Z.json',
        sourceDatasetDisplay: '23 Jul 2026, 12:13',
        selectedRepositories: ['alpha-data-pipeline', 'beta-insights-service'],
        sourceDatasetData: {
          repositories: {
            'alpha-data-pipeline': {
              codeowners: { result: 'pass', message: 'CODEOWNERS present.' },
              external_pull_request: {
                result: 'error',
                message: '403 error while fetching pull requests.',
              },
              license: { result: 'fail', message: 'License file missing.' },
              is_compliant: false,
            },
            'beta-insights-service': {
              codeowners: { result: 'pass', message: 'CODEOWNERS present.' },
              license: { result: 'pass', message: 'License file present.' },
              is_compliant: true,
            },
          },
          organisation_checks: {
            dependabot_slo: {
              details: {
                repositories: {
                  'my-org/alpha-data-pipeline': {
                    critical: 1,
                    high: 2,
                    medium: 0,
                    low: 0,
                  },
                },
              },
            },
            secret_scanning_slo: {
              details: {
                repositories: {
                  'my-org/alpha-data-pipeline': 4,
                },
              },
            },
          },
        },
      },
      reportLabel: 'Repository',
      entityNounSingular: 'repository',
      entityNounPlural: 'repositories',
      selectedInputKey: 'selectedRepositories',
      detailAnchorPrefix: 'repo',
    });

    expect(html).toContain('Repository GitHub Usage Policy Report');
    expect(html).toContain('id="repo-alpha-data-pipeline"');
    expect(html).toContain('id="repo-beta-insights-service"');
    expect(html).toContain('alpha-data-pipeline details');
    expect(html).toContain('23 Jul 2026, 12:13');
    expect(html).toContain('1 / 3 (1 errors)');
    expect(html).toContain('Codeowners');
    expect(html).toContain('External Pull Request');
    expect(html).toContain('<span class="pill error">error</span>');
    expect(html).toContain('<span class="pill error">error</span>');
    expect(html).toContain('License file missing.');
    expect(html).toContain('<span class="pill pass">compliant</span>');
    expect(html).toContain('<span class="pill error">error</span>');
    expect(html).toContain('SLO alert breaches');
    expect(html).toContain('Dependabot SLO');
    expect(html).toContain('Secret Scanning SLO');
    expect(html).toContain('>3<');
    expect(html).toContain('>4<');
    expect(html).toContain('Critical');
    expect(html.split('Dependabot SLO').length - 1).toBe(1);
    expect(html.split('Secret Scanning SLO').length - 1).toBe(1);
    expect(html).toContain('No SLO alert breaches for this repository.');
    expect(html).toContain(
      'Source dataset file: dataset/20260723T121307Z.json'
    );
  });

  it('renders a helpful fallback row when no entities are selected', () => {
    const html = buildEntityReportHtml({
      inputs: {
        organisation: 'my-org',
        sourceDataset: '2026-07-23T12:13:07Z',
        selectedTeams: [],
      },
      reportLabel: 'Team',
      entityNounSingular: 'team',
      entityNounPlural: 'teams',
      selectedInputKey: 'selectedTeams',
      detailAnchorPrefix: 'team',
    });

    expect(html).toContain('No teams selected');
    expect(html).toContain('0 / 0');
  });
});
