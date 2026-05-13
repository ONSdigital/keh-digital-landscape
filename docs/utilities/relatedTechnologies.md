# Related Technologies Utility

The Related Technologies utility provides a helper for computing "related" Tech Radar entries based on tag overlap.

## Core Functionality

The utility exports a single function:

### `getRelatedTechnologiesByTags`

```javascript
export const getRelatedTechnologiesByTags = ({
  selectedEntry,
  candidates,
  limit = 6,
  getRing,
  quadrantBonus = 0.25,
  ringBonus = 0.25, // bonus is set if in adopt ring
} = {}) => {
  // Implementation details
};
```

## Behaviour

- Returns `[]` if:
  - `selectedEntry` is missing
  - `candidates` is missing/empty
  - `selectedEntry.tags` is missing/empty
- Excludes the selected entry from results (by matching `id` when present)
- Scores candidates based on:
  - number of overlapping tag values
  - optional bonus if the candidate is in the same quadrant
  - optional bonus if the candidate is in the same ring (determined by `getRing`, defaulting to the most recent `ringId`)

## Data Expectations

- This utility expects tags to be persisted on entries as `string[]`.
- In the frontend, tag values are intended to come from the controlled vocabulary in `frontend/src/constants/technologyTagConstants.js`.

## Usage

This is used by the Radar and Review pages to provide "Related technologies" in the InfoBox:

- `frontend/src/pages/RadarPage.js`
- `frontend/src/pages/ReviewPage.js`

## Tests

Unit tests for the ranking and filtering behaviour live alongside the utility:

- `frontend/src/utilities/relatedTechnologies.test.js`
