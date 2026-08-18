const MAX_SLICES = 6;

// Keys that GitHub's API uses for unclassified data bucketed into "Other" rather than shown as named slices
const UNNAMED_KEYS = new Set(['others', 'unknown']);

/**
 * Converts raw count totals into a pie-chart-ready array: [{ name, value }]
 * where value is a percentage. Caps at MAX_SLICES entries and buckets the
 * rest (including unnamed keys like 'unknown' and 'others') into "Other".
 *
 * @param {Object} totals - { displayName: rawCount }
 * @param {number} [maxSlices] - Maximum number of slices before bucketing
 * @returns {Array<{ name: string, value: number }>}
 */
export function buildPieSlices(totals, maxSlices = MAX_SLICES) {
  // Grand total across all entries, used as the denominator for percentage calculation
  const grandTotal =
    Object.values(totals).reduce((sum, val) => sum + val, 0) || 1;

  // Remove zero-count entries
  const entries = Object.entries(totals).filter(([, val]) => val > 0);

  // Separate unnamed keys (e.g. 'unknown', 'others') from named entries
  // Unnamed keys are added to otherSum rather than appearing as their own slice
  const named = [];
  let otherSum = 0;

  for (const [key, val] of entries) {
    if (UNNAMED_KEYS.has(key.toLowerCase())) {
      otherSum += val;
    } else {
      named.push([key, val]);
    }
  }

  // Sort named entries by count descending, then take the top slices
  named.sort((a, b) => b[1] - a[1]);

  const top = named.slice(0, maxSlices);

  // Any named entries beyond the slice cap also go into "Other"
  otherSum += named.slice(maxSlices).reduce((sum, [, count]) => sum + count, 0);

  // Convert counts to percentages
  const result = top.map(([name, count]) => ({
    name,
    value: parseFloat(((count / grandTotal) * 100).toFixed(2)),
  }));

  // Add a single "Other" slice combining unnamed keys + overflow entries
  if (otherSum > 0) {
    result.push({
      name: 'Other',
      value: parseFloat(((otherSum / grandTotal) * 100).toFixed(2)),
    });
  }

  return result;
}
