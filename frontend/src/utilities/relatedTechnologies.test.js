import { describe, expect, it } from 'vitest';
import { getRelatedTechnologiesByTags } from './relatedTechnologies';

describe('getRelatedTechnologiesByTags', () => {
  it('returns [] when selected entry has no tags', () => {
    const result = getRelatedTechnologiesByTags({
      selectedEntry: { id: 'a', tags: [] },
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

  it('ranks candidates by tag overlap, then title', () => {
    const selectedEntry = { id: 'a', title: 'A', tags: ['data', 'api'] };

    const candidates = [
      { id: 'b', title: 'Bravo', tags: ['data'] }, // overlap 1
      { id: 'c', title: 'Charlie', tags: ['data', 'api'] }, // overlap 2
      { id: 'd', title: 'Delta', tags: ['security'] }, // overlap 0
      { id: 'e', title: 'Alpha', tags: ['api'] }, // overlap 1, title tie-break
    ];

    const result = getRelatedTechnologiesByTags({
      selectedEntry,
      candidates,
      limit: 10,
      quadrantBonus: 0,
      ringBonus: 0,
      getRing: () => undefined,
    });

    expect(result.map(x => x.id)).toEqual(['c', 'e', 'b']);
  });

  it('applies quadrant and ring bonuses without changing overlap ordering', () => {
    const selectedEntry = {
      id: 'a',
      title: 'A',
      quadrant: '1',
      tags: ['data'],
      timeline: [{ ringId: 'adopt' }],
    };

    const candidates = [
      {
        id: 'b',
        title: 'B',
        quadrant: '1',
        tags: ['data'],
        timeline: [{ ringId: 'adopt' }],
      }, // overlap 1 + bonuses
      {
        id: 'c',
        title: 'C',
        quadrant: '2',
        tags: ['data'],
        timeline: [{ ringId: 'adopt' }],
      }, // overlap 1 + ring bonus only
    ];

    const result = getRelatedTechnologiesByTags({
      selectedEntry,
      candidates,
      limit: 10,
    });

    expect(result.map(x => x.id)).toEqual(['b', 'c']);
  });
});
