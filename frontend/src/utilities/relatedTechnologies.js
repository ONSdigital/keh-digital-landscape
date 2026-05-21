/**
 * Count overlapping tags between the selected entry and a candidate entry.
 */
const getOverlapCount = (selectedTagSet, candidateTags) => {
  let overlap = 0;

  for (const tag of candidateTags) {
    if (selectedTagSet.has(tag)) {
      overlap += 1;
    }
  }

  return overlap;
};

/**
 * Determine whether two radar entries belong to the same quadrant.
 */
const isSameQuadrant = (a, b) => {
  return (
    a?.quadrant && b?.quadrant && String(a.quadrant) === String(b.quadrant)
  );
};

/**
 * Get the current ring for an entry from its latest timeline item.
 */
const defaultGetRing = entry => {
  const timeline = entry?.filteredTimeline || entry?.timeline || [];

  const last = timeline[timeline.length - 1];

  return last?.ringId ? String(last.ringId).toLowerCase() : undefined;
};

/**
 * Get related technologies ranked by tag overlap with optional scoring bonuses.
 * @returns {Object[]} - The ranked list of related technologies.
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

  const selectedTags = selectedEntry.tags || [];

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

    const candidateTags = candidate.tags || [];

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
