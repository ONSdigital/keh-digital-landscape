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
