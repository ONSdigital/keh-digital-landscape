import {
  COPILOT_CHART_PALETTE,
  OTHER_SLICE_COLOR,
} from '../constants/copilotConstants';

/**
 * Returns a consecutive array of colours for a chart.
 * Cycles through the ONS-compliant palette if count exceeds palette length.
 * @param {number} count - Number of data series or segments
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {string[]}
 */
export function getChartPalette(count, isDark) {
  const palette = isDark
    ? COPILOT_CHART_PALETTE.dark
    : COPILOT_CHART_PALETTE.light;

  // Generates an array of undefined values of length 'count'
  // Then maps each index in the array containing "undefined" to a colour from the palette
  // Cycling through if necessary.
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

/**
 * Returns the colour to use for an 'Other' catch-all slice.
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {string}
 */
export function getOtherSliceColor(isDark) {
  return isDark ? OTHER_SLICE_COLOR.dark : OTHER_SLICE_COLOR.light;
}
