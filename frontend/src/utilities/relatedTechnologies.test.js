import { getRelatedTechnologiesByTags } from './relatedTechnologies';

describe('getRelatedTechnologiesByTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns [] when inputs are missing/invalid', () => {
    expect(getRelatedTechnologiesByTags()).toEqual([]);
    expect(
      getRelatedTechnologiesByTags({ selectedEntry: { id: 'a' } })
    ).toEqual([]);
    expect(
      getRelatedTechnologiesByTags({
        selectedEntry: { id: 'a', tags: ['data'] },
        candidates: [],
      })
    ).toEqual([]);
  });

  it('returns [] when selected entry has no valid tags', () => {
    const result = getRelatedTechnologiesByTags({
      selectedEntry: { id: 'a', tags: ['', 123, null] },
      candidates: [{ id: 'b', tags: ['data'] }],
    });

    expect(result).toEqual([]);
  });

  it('excludes the selected entry from results', () => {
    const selected = { id: 'a', tags: ['data'] };
    const result = getRelatedTechnologiesByTags({
      selectedEntry: selected,
      candidates: [selected, { id: 'b', tags: ['data'] }],
    });
    expect(result.map(x => x.id)).toEqual(['b']);
  });

  it('filters out candidates with no overlap (or invalid candidate tags)', () => {
    const selectedEntry = { id: 'a', title: 'A', tags: ['data', 'api'] };

    const candidates = [
      null,
      { id: 'b', title: 'B', tags: ['security'] }, // overlap 0
      { id: 'c', title: 'C', tags: [] }, // no tags
      { id: 'd', title: 'D', tags: ['data'] }, // overlap 1
    ];

    const result = getRelatedTechnologiesByTags({ selectedEntry, candidates });
    expect(result.map(x => x.id)).toEqual(['d']);
  });

  it('ranks candidates by score (overlap + bonuses), then overlap, then title', () => {
    const selectedEntry = {
      id: 'a',
      title: 'A',
      quadrant: '1',
      tags: ['data', 'api'],
      timeline: [{ ringId: 'hold' }],
    };

    const candidates = [
      {
        id: 'b',
        title: 'Bravo',
        quadrant: '1',
        tags: ['data'], // overlap 1
        timeline: [{ ringId: 'adopt' }], // + ring bonus
      }, // score = 1 + quadrantBonus + ringBonus
      {
        id: 'c',
        title: 'Charlie',
        quadrant: '2',
        tags: ['data', 'api'], // overlap 2
        timeline: [{ ringId: 'hold' }],
      }, // score = 2
      {
        id: 'd',
        title: 'Delta',
        quadrant: '2',
        tags: ['data', 'api'], // overlap 2
        timeline: [{ ringId: 'adopt' }], // + ring bonus
      }, // score = 2 + ringBonus
    ];

    const result = getRelatedTechnologiesByTags({
      selectedEntry,
      candidates,
      limit: 10,
    });

    expect(result.map(x => x.id)).toEqual(['d', 'c', 'b']);
  });

  it('uses title as a stable tie-break when scores match', () => {
    const selectedEntry = { id: 'a', title: 'A', tags: ['data'] };

    const candidates = [
      { id: 'b', title: 'Bravo', tags: ['data'] },
      { id: 'c', title: 'Alpha', tags: ['data'] },
    ];

    const result = getRelatedTechnologiesByTags({
      selectedEntry,
      candidates,
      limit: 10,
      quadrantBonus: 0,
      ringBonus: 0,
      getRing: () => undefined,
    });

    expect(result.map(x => x.id)).toEqual(['c', 'b']);
  });

  it('respects the limit parameter', () => {
    const selectedEntry = { id: 'a', title: 'A', tags: ['data', 'api'] };

    const candidates = [
      { id: 'b', title: 'B', tags: ['data'] },
      { id: 'c', title: 'C', tags: ['api'] },
    ];

    const result = getRelatedTechnologiesByTags({
      selectedEntry,
      candidates,
      limit: 1,
      quadrantBonus: 0,
      ringBonus: 0,
      getRing: () => undefined,
    });

    expect(result.length).toBe(1);
  });
});
