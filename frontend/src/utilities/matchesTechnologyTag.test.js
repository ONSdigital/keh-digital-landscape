import { matchesTechnologyTag } from './matchesTechnologyTag';

describe('matchesTechnologyTag', () => {
  it('matches a tag by its display label', () => {
    expect(matchesTechnologyTag(['machine-learning'], 'machine learning')).toBe(
      true
    );
  });

  it('matches a tag by its stored value', () => {
    expect(matchesTechnologyTag(['machine-learning'], 'machine-learn')).toBe(
      true
    );
  });

  it('handles missing tags and nonmatching searches', () => {
    expect(matchesTechnologyTag(undefined, 'machine learning')).toBe(false);
    expect(matchesTechnologyTag(['machine-learning'], 'data processing')).toBe(
      false
    );
  });
});