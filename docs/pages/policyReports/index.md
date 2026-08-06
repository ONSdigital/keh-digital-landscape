# GitHub Policy Reports

## Overview

The GitHub Policy Reports page allows users to generate downloadable HTML reports that summarise compliance with ONS GitHub usage policy controls.

The feature supports three report types:

- **Organisation report**: High-level KPI and trend view for an organisation, including source-vs-comparison deltas.
- **Repository report**: Detailed compliance results for one or more selected repositories that the current user can access.
- **Team report**: Detailed compliance results for one or more selected teams that the current user belongs to.

Policy report data is sourced from the KEH GitHub Policy Audit datasets stored in S3. See the [GitHub Policy Audit](https://github.com/ONS-Innovation/keh-github-policy-audit) repository for more information on data collection.

## Page Location

- Frontend route: `/github-policy-reports`
- Backend API base path: `/policy-reports/api`

## User Journey

The page is split into two explicit stages:

### Stage 1: Report configuration

Users select:

- **Organisation**
- **Source dataset**

The source dataset is used as the primary input for all report types.

The values for these inputs are derived directly from the S3 audit dataset paths, and are not user-editable.
New datasets are automatically discovered from S3 and made available for selection, likewise new organisations are automatically discovered from the dataset paths.

### Stage 2: Report generation

Once Stage 1 is complete, users choose a report tab:

- Organisation report tab
- Repository report tab
- Team report tab

Organisation reports can be generated without GitHub authentication.

Repository and team reports require GitHub authentication because the selectable entities are filtered to what the signed-in user can access.

More information on GitHub authentication is available in the [GitHub OAuth documentation](../../backend/githubAuth.md).

## Report Type Inputs

### Organisation report

Required inputs:

- `organisation`
- `sourceDataset`
- `comparisonDataset`

Behavior notes:

- The comparison dataset options are constrained to datasets older than the selected source dataset.
- If no older datasets exist, the source dataset is reused as comparison.

### Repository report

Required inputs:

- `organisation`
- `sourceDataset`
- `selectedRepositories` (at least one)

Behavior notes:

- Repository options are the intersection of:
  - repositories present in the selected dataset
  - repositories accessible to the signed-in GitHub user in that organisation

### Team report

Required inputs:

- `organisation`
- `sourceDataset`
- `selectedTeams` (at least one)

Behavior notes:

- Team options are the intersection of:
  - teams present in the selected dataset
  - teams the signed-in GitHub user belongs to in that organisation

## API Endpoints

All policy reports endpoints are rate-limited to 240 requests per minute. Requests exceeding this limit receive `429 Too Many Requests`.

### `GET /policy-reports/api/organisations`

Returns organisation options discovered from S3 audit dataset paths.

### `GET /policy-reports/api/datasets?organisation=<org>`

Returns all datasets for an organisation, sorted newest-first.

Each dataset includes:

- `name`
- `displayName` (ISO timestamp string derived from object last-modified)

### `GET /policy-reports/api/repositories?organisation=<org>&dataset=<dataset>&githubPage=<n>&githubPerPage=<n>&refreshCache=true|false`

Returns dataset repositories that are also accessible to the signed-in user.

Response includes:

- `repositories`
- `cacheUsed`
- `cachedAt`
- `githubCurrentPage`
- `githubTotalPages`

> **Pagination notes:**
>
> - `githubPage` (required in page mode): 1-indexed page number. Must be a positive integer.
> - `githubPerPage` (optional): Results per page. Defaults to 100 if not specified. Must be a positive integer.
> - Page-by-page collection was chosen to show progress clearly in the UI and to avoid long-running requests that may time out.
> - The API maintains a per-user, per-organisation page cache (15-minute TTL) to avoid re-fetching the same GitHub results.
> - Setting `refreshCache=true` clears the cached pages for this user/organisation and forces a fresh fetch from GitHub. There is a button to facilitate this in the UI.

### `GET /policy-reports/api/teams?organisation=<org>&dataset=<dataset>&githubPage=<n>&githubPerPage=<n>&refreshCache=true|false`

Returns dataset teams that the signed-in user belongs to.

Response includes:

- `teams`
- `cacheUsed`
- `cachedAt`
- `githubCurrentPage`
- `githubTotalPages`

### `POST /policy-reports/api/generateReport`

Request body:

```json
{
  "reportType": "Organisation | Repository | Team",
  "inputs": {
    "organisation": "ONS-Innovation",
    "sourceDataset": "2026-07-30T12-00-00",
    "comparisonDataset": "2026-07-23T12-00-00",
    "selectedRepositories": ["repo-a"],
    "selectedTeams": ["team-a"]
  }
}
```

Response:

- `200 OK` with downloadable `text/html` attachment.
- File naming convention: `organisation-report.html`, `repository-report.html`, `team-report.html`.

## Data Source and Dataset Contract

Backend report generation hydrates input with dataset JSON content fetched from S3.

- `sourceDatasetData` is loaded for all report types.
- `comparisonDatasetData` is loaded for organisation reports when a comparison dataset is supplied.

The entity templates (repository/team) and organisation template interpret check outcomes from `checks.<checkName>.result` values:

- `pass`
- `fail`
- `error`

Unknown or missing values are defensively treated as unknown in rendering.

## Authentication and Access Control

Repository and team endpoints require a GitHub user token cookie.

- Unauthenticated requests receive `401`.
- Authenticated requests are filtered to the user-allowed subset.

The UI supports login and logout from the Policy Reports page and restores form state after OAuth callback.

**Form state restoration:** After a user logs in via GitHub OAuth and is redirected back to `/github-policy-reports`, the page automatically restores their previously selected organisation, source dataset, and active report tab. This provides a seamless experience if authentication was required mid-workflow.

More information on GitHub authentication is available in the [GitHub OAuth documentation](../../backend/githubAuth.md).

## Caching and Performance

Two cache layers are used server-side:

- GitHub page cache (per token hash + organisation)
- Dataset entities cache (per organisation + dataset)

Both use a 15-minute TTL.

Cache is used here to avoid repeated GitHub API calls for the same user and to avoid repeated S3 dataset reads for the same organisation/dataset.

The frontend supports:

- Page-by-page loading from GitHub API-backed endpoints
- Progress feedback while repositories/teams are being collected
- Manual cache refresh via "Refresh GitHub cache" button, which clears the per-user page cache and forces fresh GitHub API calls

## Validation and Error Handling

Inputs are validated in the API route layer:

- Allowed value pattern for organisation and dataset fields: `^[a-zA-Z0-9_-]+$`
- `githubPage` and `githubPerPage` must be positive integers
- `reportType` must be one of organisation, repository, team

The API returns human-readable error messages for common failures, including:

- missing required inputs
- invalid report type or names
- missing GitHub authentication for restricted report types
- dataset loading failures
- report generation failures

## HTTP Response Codes

### Success

- `200 OK`: Request succeeded. Response body contains the requested data or attachment.

### Client Errors

- `400 Bad Request`: Validation failed. Response body includes an `error` field with a human-readable message.
  - Missing required parameters
  - Invalid parameter format (e.g., organisation name contains invalid characters)
  - Pagination parameters out of valid range

- `401 Unauthorized`: GitHub authentication required.
  - Returned by `/repositories` and `/teams` endpoints when user is not authenticated.
  - Response body includes an `error` field.

- `429 Too Many Requests`: Rate limit exceeded (240 requests per minute).
  - Returned when request rate exceeds the policy reports API limiter threshold.

### Server Errors

- `500 Internal Server Error`: Server-side operation failed.
  - Dataset loading from S3 failed
  - Report generation failed
  - Unexpected error during processing
  - Response body includes an `error` field with a human-readable message.

## Implementation Map

Frontend:

- `frontend/src/pages/PolicyReportsPage.js`
- `frontend/src/utilities/policyReports/getOrganisations.js`
- `frontend/src/utilities/policyReports/getDatasets.js`
- `frontend/src/utilities/policyReports/getRepositories.js`
- `frontend/src/utilities/policyReports/getTeams.js`
- `frontend/src/utilities/policyReports/generatePolicyReport.js`

Backend:

- `backend/src/routes/policyReports.js`
- `backend/src/services/policyReportsService.js`
- `backend/src/utilities/policyReportGenerator/index.js`
- `backend/src/utilities/policyReportGenerator/functions/generateReportHtmlByType.js`

## Testing Coverage

Primary tests for this functionality are located in:

- `backend/src/routes/policyReports.test.js`
- `backend/src/services/policyReportsService.test.js`
- `backend/src/utilities/policyReportGenerator/index.test.js`
- `backend/src/utilities/policyReportGenerator/functions/generateReportHtmlByType.test.js`
- `frontend/src/pages/PolicyReportsPage.test.js`

These tests cover endpoint validation, dataset/entity loading, cache behavior, report generation wiring, and key frontend interactions.

The unit tests are kept alongside the implementation code to ensure that changes are tested and provide visibility of the code coverage. The tests are run as part of the CI/CD pipeline and are required to pass before merging changes.

Additional UI / end-to-end tests are implemented within `testing/ui/tests/policy-reports.test.js` using Playwright. These tests cover the main page journey, including stage progression, report tab interactions, and authentication-dependent UI behaviour.
