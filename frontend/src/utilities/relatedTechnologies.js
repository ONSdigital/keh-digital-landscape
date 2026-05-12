const getValidTags = tags => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter(tag => typeof tag === 'string' && tag.length > 0);
};

const getOverlapCount = (selectedTagSet, candidateTags) => {
  let overlap = 0;

  for (const tag of candidateTags) {
    if (selectedTagSet.has(tag)) {
      overlap += 1;
    }
  }

  return overlap;
};

const isSameQuadrant = (a, b) => {
  return (
    a?.quadrant && b?.quadrant && String(a.quadrant) === String(b.quadrant)
  );
};

const defaultGetRing = entry => {
  const timeline = entry?.filteredTimeline || entry?.timeline || [];

  const last = timeline[timeline.length - 1];

  return last?.ringId ? String(last.ringId).toLowerCase() : undefined;
};

/**
 * Computes related technologies based on tag overlap.
 */
export const getRelatedTechnologiesByTags = ({
  selectedEntry,
  candidates,
  limit = 6,
  getRing = defaultGetRing,
  quadrantBonus = 0.25,
  ringBonus = 0.25,
} = {}) => {
  if (!selectedEntry || !Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  const selectedTags = getValidTags(selectedEntry.tags);

  if (selectedTags.length === 0) {
    return [];
  }

  const selectedTagSet = new Set(selectedTags);
  const selectedRing = getRing(selectedEntry);

  const scoredCandidates = [];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const isSameEntry =
      candidate.id && selectedEntry.id && candidate.id === selectedEntry.id;

    if (isSameEntry) {
      continue;
    }

    const candidateTags = getValidTags(candidate.tags);

    if (candidateTags.length === 0) {
      continue;
    }

    const overlap = getOverlapCount(selectedTagSet, candidateTags);

    if (overlap === 0) {
      continue;
    }

    let score = overlap;

    if (isSameQuadrant(candidate, selectedEntry)) {
      score += quadrantBonus;
    }

    const candidateRing = getRing(candidate);

    if (candidateRing === 'adopt') {
      score += ringBonus;
    }

    scoredCandidates.push({
      candidate,
      score,
      overlap,
    });
  }

  scoredCandidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (b.overlap !== a.overlap) {
      return b.overlap - a.overlap;
    }

    return String(a.candidate.title || '').localeCompare(
      String(b.candidate.title || '')
    );
  });

  return scoredCandidates.slice(0, limit).map(item => item.candidate);
};
