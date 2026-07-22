# Copilot Constants

The `copilotConstants` file centralises display name mappings and the chart colour palette used across the Copilot Dashboard. Keeping these in one place ensures consistency in labelling and visual styling, and makes it straightforward to accommodate new models, IDEs, languages, or colour updates.

## Available Constants

### MODEL_NAMES

```js
export const MODEL_NAMES = {
  'gpt-4o': 'GPT-4o',
  'claude-sonnet-4.6': 'Claude Sonnet 4.6',
  auto: 'Auto',
  // ...
};
```

Maps raw GitHub Copilot API model identifiers to human-readable display names. Used by `processGeneralUsageCopilotData.js` when formatting model usage data for the pie chart.

If the GitHub API introduces a new model identifier that is not in this map, the raw key is displayed as-is. Add new entries here to control how they appear in the dashboard.

---

### IDE_NAMES

```js
export const IDE_NAMES = {
  vscode: 'VSCode',
  intellij: 'IntelliJ',
  visualstudio: 'Visual Studio',
  // ...
};
```

Maps raw IDE identifiers from the GitHub Copilot API to display names. Used when building the IDE usage pie chart. If an identifier is not present, the raw value is displayed as-is.

---

### LANGUAGE_NAMES

```js
export const LANGUAGE_NAMES = {
  javascript: 'JavaScript',
  python: 'Python',
  typescript: 'TypeScript',
  // ...
};
```

Maps raw language identifiers to display names for the Code Impact by Language chart. Where a language is missing from this map, the raw key is uppercased as a fallback.

Note that several keys map to the same display name (e.g. `js`, `jsx`, and `javascript` all map to `'JavaScript'`). This is intentional, as the GitHub API reports the same language under multiple identifiers depending on file extension.

---

### COPILOT_CHART_PALETTE

```js
export const COPILOT_CHART_PALETTE = {
  light: [
    '#206095', // Ocean blue
    '#a8bd3a', // Spring green
    '#871a5b', // Beetroot purple
    '#f66068', // Coral pink
    '#27a0cc', // Sky blue
    '#003c57', // Night blue
    '#746cb1', // Lavender purple
  ],
  dark: [
    '#27a0cc', // Sky blue
    '#a8bd3a', // Spring green
    '#f66068', // Coral pink
    '#fbc900', // Sun yellow
    '#22d0b6', // Mint green
    '#0f8243', // Leaf green
    '#902082', // Plum purple
  ],
};
```

The ONS-compliant colour palette used across all charts on the Copilot Dashboard. Both light and dark variants follow the [ONS standard category colour palette](https://service-manual.ons.gov.uk/data-visualisation/colours/using-colours-in-charts) and [ONS brand guidelines](https://service-manual.ons.gov.uk/brand-guidelines/colours).

#### Why two palettes?

The ONS publishes colours designed for light backgrounds only. The dark palette uses lighter, more visible ONS colours to maintain legibility on dark backgrounds while staying within the ONS brand.

#### How it is used

Charts do not reference colours directly. Instead, they call `getChartPalette(count, isDark)` from `utilities/copilotChartColours.js`, which returns a consecutive slice of the appropriate palette:

```js
// Returns ['#206095', '#a8bd3a', '#871a5b'] in light mode
const colours = getChartPalette(3, false);
```

Progress bars in `PercentageCard` use a `paletteIndex` prop to pick a specific colour from the palette, ensuring they match their corresponding line in the Engaged Users graph on the General Usage Page:

```jsx
// Chat Mode Adoption bar matches line at index 1
<PercentageCard paletteIndex={1} ... />
```

#### Extending the palette

The palette holds 7 colours. If a chart ever needs more than 7 segments, `getChartPalette` cycles back to index 0. ONS guidance recommends a maximum of 5 colours per chart; exceeding 7 should be avoided.

To add or change colours, update both `light` and `dark` arrays, keeping the hue order as distinct as possible across adjacent entries.
