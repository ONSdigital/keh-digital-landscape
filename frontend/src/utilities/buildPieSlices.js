const MAX_SLICES = 6;
const EXCLUDED_KEYS = new Set([
  'others',
  'unknown',
  'Other',
  'OTHERS',
  'UNKNOWN',
]);

/**
 * Converts raw count totals into a pie-chart-ready array: [{ name, value }]
 * where value is a percentage. Caps at MAX_SLICES entries and buckets the
 * rest into "Other". Filters out unknown/zero entries.
 *
 * @param {Object} totals - { displayName: rawCount }
 * @param {number} [maxSlices] - Maximum number of slices before bucketing
 * @returns {Array<{ name: string, value: number }>}
 */
export function buildPieSlices(totals, maxSlices = MAX_SLICES) {
  // Calculate the grand total of all counts, defaulting to 1 to avoid division by zero
  const grandTotal =
    Object.values(totals).reduce((sum, val) => sum + val, 0) || 1;

  // Filter out entries that are either in EXCLUDED_KEYS or have a count of zero or less
  // Sort the remaining entries in descending order based on their counts
  const entries = Object.entries(totals)
    .filter(([key, val]) => val > 0 && !EXCLUDED_KEYS.has(key))
    .sort((a, b) => b[1] - a[1]);

  // Takes the top `maxSlices` entries and buckets the rest into "Other"
  const top = entries.slice(0, maxSlices);
  const rest = entries.slice(maxSlices);

  // Map the top entries to the desired format, calculating their percentage values
  // e.g. { name: 'JavaScript', value: 25.5 }
  const result = top.map(([name, count]) => ({
    name,
    value: parseFloat(((count / grandTotal) * 100).toFixed(2)),
  }));

  // If there are leftover entries, adds a single "Other" slice with their combined percentage.
  const otherSum = rest.reduce((sum, [, count]) => sum + count, 0);
  if (otherSum > 0) {
    result.push({
      name: 'Other',
      value: parseFloat(((otherSum / grandTotal) * 100).toFixed(2)),
    });
  }

  return result;
}
