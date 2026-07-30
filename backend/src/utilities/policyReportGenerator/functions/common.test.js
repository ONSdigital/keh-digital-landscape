import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  escapeHtml,
  getInputList,
  getInputString,
  normaliseForFileName,
  normaliseSectionAnchor,
  percentage,
} = require('./common');

describe('policyReportGenerator/functions/common', () => {
  it('escapes unsafe html characters', () => {
    expect(escapeHtml('<a href="x">it\'s ok & safe</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;it&#039;s ok &amp; safe&lt;/a&gt;'
    );
  });

  it('normalises file names to lowercase hyphenated slugs', () => {
    expect(normaliseForFileName('  Repo Health Report 2026!  ')).toBe(
      'repo-health-report-2026'
    );
  });

  it('returns escaped strings and lists from input maps', () => {
    const inputs = {
      organisation: '<org>',
      zeroCount: 0,
      selectedRepositories: ['repo-1', 'repo-2'],
    };

    expect(getInputString(inputs, 'organisation')).toBe('<org>');
    expect(getInputString(inputs, 'zeroCount')).toBe('0');
    expect(getInputString(inputs, 'missing')).toBe('Not provided');
    expect(getInputList(inputs, 'selectedRepositories')).toEqual([
      'repo-1',
      'repo-2',
    ]);
    expect(getInputList(inputs, 'missing')).toEqual([]);
  });

  it('calculates percentages and handles zero denominator', () => {
    expect(percentage(3, 4)).toBe('75.0');
    expect(percentage(0, 0)).toBe('0.0');
  });

  it('builds stable section anchors', () => {
    expect(normaliseSectionAnchor('repo', 'My Repo')).toBe('repo-my-repo');
    expect(normaliseSectionAnchor('repo')).toBe('repo-unknown-item');
  });
});
