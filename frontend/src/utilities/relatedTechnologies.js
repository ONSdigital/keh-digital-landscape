const defaultGetRing = entry => {
  const timeline = entry?.filteredTimeline || entry?.timeline || [];
  const last = timeline[timeline.length - 1];
  return last?.ringId ? String(last.ringId).toLowerCase() : undefined;
};

/**
 * Computes related technologies based on tag overlap.
 *
 * - Uses `entry.tags` (array of strings) by default.
 * - Returns [] if the selected entry has no tags.
 */
export const getRelatedTechnologiesByTags = ({
  selectedEntry,
  candidates,
  limit = 6,
  getRing = defaultGetRing,
  quadrantBonus = 0.25,
  ringBonus = 0.1,
} = {}) => {
  if (!selectedEntry || !Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  const selectedTags = Array.isArray(selectedEntry.tags)
    ? selectedEntry.tags.filter(t => typeof t === 'string' && t.length > 0)
    : [];
  if (selectedTags.length === 0) return [];

  const selectedTagSet = new Set(selectedTags);
  const selectedRing = getRing(selectedEntry);

  const scored = [];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.id && selectedEntry.id && candidate.id === selectedEntry.id) {
      continue;
    }

    const candidateTags = Array.isArray(candidate.tags)
      ? candidate.tags.filter(t => typeof t === 'string' && t.length > 0)
      : [];
    if (candidateTags.length === 0) continue;

    let overlap = 0;
    for (const tag of candidateTags) {
      if (selectedTagSet.has(tag)) overlap += 1;
    }

    if (overlap === 0) continue;

    let score = overlap;

    if (
      candidate.quadrant &&
      selectedEntry.quadrant &&
      String(candidate.quadrant) === String(selectedEntry.quadrant)
    ) {
      score += quadrantBonus;
    }

    const candidateRing = getRing(candidate);
    if (selectedRing && candidateRing && selectedRing === candidateRing) {
      score += ringBonus;
    }

    scored.push({ candidate, score, overlap });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    return String(a.candidate.title || '').localeCompare(
      String(b.candidate.title || '')
    );
  });

  return scored.slice(0, limit).map(x => x.candidate);
};
