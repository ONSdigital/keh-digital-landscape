import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  buildScorecardCriteriaRows,
  formatRatingLabel,
  getScorecardCriteriaEntries,
} = require('./scorecard');

describe('policyReportGenerator/functions/scorecard', () => {
  it('formats rating labels consistently', () => {
    expect(formatRatingLabel('platinum')).toBe('Platinum');
    expect(formatRatingLabel('very_high-tier')).toBe('Very High Tier');
    expect(formatRatingLabel('')).toBe('');
  });

  it('returns sorted scorecard criteria entries by min compliance desc', () => {
    const entries = getScorecardCriteriaEntries({
      bronze: { min_compliance: 50, required_checks: ['codeowners'] },
      platinum: { min_compliance: 100, required_checks: [] },
      gold: { min_compliance: 90, required_checks: ['dependabot'] },
      invalid: { required_checks: [] },
    });

    expect(entries.map(entry => entry.rating)).toEqual([
      'platinum',
      'gold',
      'bronze',
    ]);
    expect(entries[0].requiredChecks).toEqual([]);
  });

  it('returns empty criteria entries for invalid input', () => {
    expect(getScorecardCriteriaEntries(null)).toEqual([]);
    expect(getScorecardCriteriaEntries('not-an-object')).toEqual([]);
  });

  it('builds scorecard criteria rows with escaped required checks and fallback text', () => {
    const html = buildScorecardCriteriaRows([
      {
        rating: 'gold',
        minCompliance: 90,
        requiredChecks: ['codeowners', '<script>alert(1)</script>'],
      },
      {
        rating: 'platinum',
        minCompliance: 100,
        requiredChecks: [],
      },
    ]);

    expect(html).toContain('rating-gold');
    expect(html).toContain('90.0%');
    expect(html).toContain('Codeowners');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('No mandatory checks');
  });
});
