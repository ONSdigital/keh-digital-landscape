# Related Technologies Utility

This utility ranks related Tech Radar entries using tag overlap, with small bonuses for entries in the same quadrant and entries in the adopt ring.

## Core Functionality

The utility exports a single function:

### `getRelatedTechnologiesByTags`

```javascript
export const getRelatedTechnologiesByTags = ({
  selectedEntry,
  candidates,
  limit = 6,
  getRing,
  quadrantBonus = 0.25, // bonus is set if in the same quadrant
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
- Only includes candidates with at least one overlapping tag
- Scores candidates using:
  - the number of overlapping tags
  - an optional bonus when the candidate is in the same quadrant
  - an optional bonus when the candidate is in the adopt ring
- Sorts matches by score, then by raw overlap count, then by title

### Scoring Formula

Each candidate starts with its overlap count, then optional bonuses are added:

```text
score = overlap count + quadrant bonus + ring bonus
```

Where:

- `overlap count` is the number of tags shared between the selected entry and the candidate
- `quadrant bonus` is `0.25` when both entries are in the same quadrant, otherwise `0`
- `ring bonus` is `0.25` when the candidate is currently in the `adopt` ring, otherwise `0`

Example:

- shares `2` tags with the selected entry
- is in the same quadrant
- is in the `adopt` ring

Its score is:

```text
2 + 0.25 + 0.25 = 2.5
```

Another candidate that shares the same `2` tags but gets no bonuses would score:

```text
2 + 0 + 0 = 2
```

The first candidate therefore ranks above the second.

If two candidates have the same final score, the utility prefers the one with the higher raw overlap count. If they are still tied, it falls back to alphabetical order by title.

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
