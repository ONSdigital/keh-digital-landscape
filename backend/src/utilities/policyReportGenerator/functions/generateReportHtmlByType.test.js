import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { generateReportHtmlByType } = require('./generateReportHtmlByType');

describe('policyReportGenerator/functions/generateReportHtmlByType', () => {
  const baseInputs = {
    organisation: 'ons-innovation',
    sourceDataset: '2026-07-23T12:13:07Z',
    comparisonDataset: '2026-07-16T12:13:07Z',
    selectedRepositories: ['repo-a'],
    selectedTeams: ['team-a'],
  };

  it('routes organisation report type', () => {
    const html = generateReportHtmlByType({
      reportType: 'Organisation',
      inputs: baseInputs,
    });

    expect(html).toContain('Organisational GitHub Usage Policy Report');
    expect(html).toContain('Compared against');
  });

  it('routes repository report type', () => {
    const html = generateReportHtmlByType({
      reportType: 'repository',
      inputs: baseInputs,
    });

    expect(html).toContain('Repository GitHub Usage Policy Report');
    expect(html).toContain('id="repo-repo-a"');
  });

  it('routes team report type', () => {
    const html = generateReportHtmlByType({
      reportType: 'team',
      inputs: baseInputs,
    });

    expect(html).toContain('Team GitHub Usage Policy Report');
    expect(html).toContain('id="team-team-a"');
  });

  it('throws for unsupported report types', () => {
    expect(() =>
      generateReportHtmlByType({
        reportType: 'custom',
        inputs: baseInputs,
      })
    ).toThrow('Unsupported report type: custom');
  });
});
