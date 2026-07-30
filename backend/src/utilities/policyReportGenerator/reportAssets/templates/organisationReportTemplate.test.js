import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildOrganisationReportHtml } = require('./organisationReportTemplate');

describe('organisationReportTemplate', () => {
  it('renders organisation metadata and organisation-specific sections', () => {
    const html = buildOrganisationReportHtml({
      organisation: 'ONS-Innovation',
      sourceDataset: '20260723T121307Z.json',
      sourceDatasetDisplay: '23 Jul 2026, 12:13',
      comparisonDataset: 's3/policy-audit/20260716T121307Z.json',
      comparisonDatasetDisplay: '16 Jul 2026, 12:13',
    });

    expect(html).toContain('Organisational GitHub Usage Policy Report');
    expect(html).toContain('ONS-Innovation');
    expect(html).toContain('23 Jul 2026, 12:13');
    expect(html).toContain('16 Jul 2026, 12:13');
    expect(html).toContain('Source dataset file: 20260723T121307Z.json');
    expect(html).toContain(
      'Comparison dataset file: s3/policy-audit/20260716T121307Z.json'
    );
    expect(html).toContain('Repository check performance');
    expect(html).toContain('Team check performance');
  });
});
