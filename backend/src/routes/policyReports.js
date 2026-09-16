const logger = require('../config/logger');
const express = require('express');
const crypto = require('crypto');
const policyReportsService = require('../services/policyReportsService');
const githubQueries = require('../utilities/githubQueries');
const policyReportGenerator = require('../utilities/policyReportGenerator');

const router = express.Router();

const REPORT_TYPES = ['organisation', 'repository', 'team'];
const SAFE_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const REPOSITORY_VISIBILITIES = ['public', 'private', 'internal'];
const GITHUB_ENTITY_CACHE_TTL_MS = 15 * 60 * 1000;
const DATASET_ENTITY_CACHE_TTL_MS = 15 * 60 * 1000;
const HUMAN_READABLE_ERRORS = {
  configurationLoadFailed:
    'Unable to load report configuration. Please try again later.',
  datasetLoadFailed: 'Unable to load datasets. Please try again later.',
  reportGenerationFailed:
    'Unable to generate the report. Please try again later.',
  reportTypeRequired: 'Choose a report type before generating a report.',
  reportTypeInvalid:
    'Choose a valid report type: organisation, repository or team.',
  organisationRequired: 'Choose an organisation before generating a report.',
  organisationInvalid: 'Enter a valid organisation name.',
  organisationAndDatasetRequired:
    'Choose both an organisation and a dataset before continuing.',
  sourceDatasetRequired: 'Choose a source dataset before generating a report.',
  sourceDatasetInvalid: 'Enter a valid source dataset name.',
  comparisonDatasetInvalid: 'Enter a valid comparison dataset name.',
  githubAuthenticationRequired:
    'Sign in with GitHub to view the repositories or teams in this dataset.',
  datasetInvalid: 'Enter a valid dataset name.',
  githubPageRequired: 'Choose which GitHub results page to load.',
  githubPageInvalid: 'GitHub page must be a whole number greater than 0.',
  githubPerPageInvalid:
    'Results per page must be a whole number greater than 0.',
  repositoriesLoadFailed:
    'Unable to load repositories. Please try again later.',
  teamsLoadFailed: 'Unable to load teams. Please try again later.',
};

// Per-page caches for the page-mode loading flow.
// Key: tokenHash:organisation  Value: { pages: { [n]: string[] }, totalPages: number, cachedAt: number }
const githubRepositoryPageCache = new Map();
const githubTeamPageCache = new Map();

// Dataset entities cache to prevent repeated S3 fetches during page-by-page requests.
// Key: organisation:dataset  Value: { entities: { repositories: Array<{name: string, visibility: string}>, teams: string[] }, cachedAt: number }
const datasetEntitiesCache = new Map();

const createUserScopedCacheKey = (userToken, organisation) => {
  const tokenHash = crypto
    .createHash('sha256')
    .update(String(userToken))
    .digest('hex');

  return `${tokenHash}:${organisation}`;
};

const parseRefreshCacheQuery = refreshCache => {
  if (typeof refreshCache !== 'string') {
    return false;
  }

  return ['1', 'true', 'yes'].includes(refreshCache.toLowerCase());
};

const parsePositiveIntegerQuery = value => {
  if (typeof value !== 'string') {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const isValidRepositoryVisibilityFilter = visibility =>
  Array.isArray(visibility) &&
  visibility.length > 0 &&
  visibility.every(
    value =>
      typeof value === 'string' && REPOSITORY_VISIBILITIES.includes(value)
  );

const createDatasetCacheKey = (organisation, dataset) =>
  `${organisation}:${dataset}`;

const getCachedDatasetEntities = async ({ organisation, dataset }) => {
  const now = Date.now();
  const cacheKey = createDatasetCacheKey(organisation, dataset);
  const existingEntry = datasetEntitiesCache.get(cacheKey);

  if (
    existingEntry &&
    now - existingEntry.cachedAt <= DATASET_ENTITY_CACHE_TTL_MS
  ) {
    return existingEntry.entities;
  }

  const entities = await policyReportsService.getDatasetEntities(
    organisation,
    dataset
  );

  datasetEntitiesCache.set(cacheKey, {
    entities,
    cachedAt: now,
  });

  return entities;
};

const getHumanReadableReportGenerationError = error => {
  const rawMessage =
    typeof error?.message === 'string' ? error.message.trim() : '';

  if (!rawMessage) {
    return HUMAN_READABLE_ERRORS.reportGenerationFailed;
  }

  if (/^Source dataset summary is missing/i.test(rawMessage)) {
    return 'The selected source dataset is missing some of the data needed to build this report';
  }

  if (/^Comparison dataset summary is missing/i.test(rawMessage)) {
    return 'The selected comparison dataset is missing some of the data needed to build this report';
  }

  return HUMAN_READABLE_ERRORS.reportGenerationFailed;
};

// GET /organisations
router.get('/organisations', async (req, res) => {
  try {
    const config =
      await policyReportsService.getPolicyReportOrganisationOptions();
    return res.status(200).json(config);
  } catch (error) {
    logger.error('Error fetching policy report configuration', {
      error: error.message,
    });
    return res
      .status(500)
      .json({ error: HUMAN_READABLE_ERRORS.configurationLoadFailed });
  }
});

// GET /datasets?organisation=<org>
// Returns all datasets for an organisation sorted newest-first.
// The frontend derives comparison options by filtering to datasets older than the selected source.
router.get('/datasets', async (req, res) => {
  const { organisation } = req.query;

  if (!organisation) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationRequired });
  }

  // Validate organisation name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(organisation)) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationInvalid });
  }

  try {
    const datasets =
      await policyReportsService.getDatasetsByOrganisation(organisation);
    return res.status(200).json({ datasets });
  } catch (error) {
    logger.error('Error fetching datasets for organisation', {
      organisation,
      error: error.message,
    });
    return res
      .status(500)
      .json({ error: HUMAN_READABLE_ERRORS.datasetLoadFailed });
  }
});

// POST /generateReport
router.post('/generateReport', async (req, res) => {
  const { reportType, inputs } = req.body;
  const safeInputs = inputs || {};
  const normalizedReportType = String(reportType).toLowerCase();

  if (!reportType) {
    logger.warn('Report type not specified');
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.reportTypeRequired });
  }

  if (!REPORT_TYPES.includes(normalizedReportType)) {
    logger.warn('Invalid report type specified');
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.reportTypeInvalid });
  }

  if (
    safeInputs.sourceDataset &&
    !SAFE_NAME_REGEX.test(safeInputs.sourceDataset)
  ) {
    logger.warn('Invalid source dataset value specified');
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.sourceDatasetInvalid });
  }

  if (
    safeInputs.comparisonDataset &&
    !SAFE_NAME_REGEX.test(safeInputs.comparisonDataset)
  ) {
    logger.warn('Invalid comparison dataset value specified');
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.comparisonDatasetInvalid });
  }

  if (
    safeInputs.organisation &&
    !SAFE_NAME_REGEX.test(safeInputs.organisation)
  ) {
    logger.warn('Invalid organisation value specified');
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationInvalid });
  }

  if (!safeInputs.organisation) {
    logger.warn('Organisation not specified for report generation');
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationRequired });
  }

  if (!safeInputs.sourceDataset) {
    logger.warn('Source dataset not specified for report generation');
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.sourceDatasetRequired });
  }

  if (
    ['organisation', 'repository'].includes(normalizedReportType) &&
    !isValidRepositoryVisibilityFilter(safeInputs.repositoryVisibility)
  ) {
    logger.warn('Invalid repository visibility filter specified');
    return res.status(400).json({
      error:
        'Choose at least one valid repository visibility: public, private or internal.',
    });
  }

  try {
    const reportInputs = { ...safeInputs };

    if (safeInputs.organisation && safeInputs.sourceDataset) {
      reportInputs.sourceDatasetData =
        await policyReportsService.getDatasetAuditData(
          safeInputs.organisation,
          safeInputs.sourceDataset
        );
    }

    if (
      normalizedReportType === 'organisation' &&
      safeInputs.organisation &&
      safeInputs.comparisonDataset
    ) {
      reportInputs.comparisonDatasetData =
        await policyReportsService.getDatasetAuditData(
          safeInputs.organisation,
          safeInputs.comparisonDataset
        );
    }

    const { html, fileName } = policyReportGenerator.generateReport({
      reportType,
      inputs: reportInputs,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(html);
  } catch (error) {
    logger.error('Error generating policy report', { error: error.message });
    const errorMessage = getHumanReadableReportGenerationError(error);

    return res.status(500).json({ error: errorMessage });
  }
});

// GET /repositories?organisation=<org>&dataset=<dataset>
// Returns repositories from the dataset that the user has access to
// This filters the dataset repositories to only those the user can access
router.get('/repositories', async (req, res) => {
  const { organisation, dataset, refreshCache, githubPage, githubPerPage } =
    req.query;
  const userToken = req.cookies?.githubUserToken;

  if (!userToken) {
    return res
      .status(401)
      .json({ error: HUMAN_READABLE_ERRORS.githubAuthenticationRequired });
  }

  if (!organisation || !dataset) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationAndDatasetRequired });
  }

  // Validate organisation name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(organisation)) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationInvalid });
  }

  // Validate dataset name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(dataset)) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.datasetInvalid });
  }

  try {
    // Get repositories from the dataset
    const datasetEntities = await getCachedDatasetEntities({
      organisation,
      dataset,
    });
    const datasetRepositoriesByName = new Map(
      datasetEntities.repositories.map(repository => [
        repository.name,
        repository,
      ])
    );

    const shouldRefreshCache = parseRefreshCacheQuery(refreshCache);
    const requestedGitHubPage = parsePositiveIntegerQuery(githubPage);
    const requestedGitHubPerPage = parsePositiveIntegerQuery(githubPerPage);

    if (githubPage && !requestedGitHubPage) {
      return res
        .status(400)
        .json({ error: HUMAN_READABLE_ERRORS.githubPageInvalid });
    }

    if (githubPerPage && !requestedGitHubPerPage) {
      return res
        .status(400)
        .json({ error: HUMAN_READABLE_ERRORS.githubPerPageInvalid });
    }

    const isPageMode = Boolean(requestedGitHubPage);

    if (isPageMode) {
      const perPage = requestedGitHubPerPage || 100;
      const cacheKey = createUserScopedCacheKey(userToken, organisation);
      const now = Date.now();
      const existingEntry = githubRepositoryPageCache.get(cacheKey);

      const entryIsValid =
        existingEntry &&
        now - existingEntry.cachedAt <= GITHUB_ENTITY_CACHE_TTL_MS;

      // Cache hit: entry valid, not a forced refresh, and this page already fetched.
      if (
        !shouldRefreshCache &&
        entryIsValid &&
        existingEntry.pages[requestedGitHubPage]
      ) {
        const cachedPage = existingEntry.pages[requestedGitHubPage];
        const filteredFromCache = cachedPage
          .map(repositoryName => datasetRepositoriesByName.get(repositoryName))
          .filter(Boolean);
        return res.status(200).json({
          repositories: filteredFromCache.sort((left, right) =>
            left.name.localeCompare(right.name)
          ),
          cacheUsed: true,
          cachedAt: existingEntry.cachedAt,
          githubCurrentPage: requestedGitHubPage,
          githubTotalPages: existingEntry.totalPages,
        });
      }

      // Cache miss or forced refresh: fetch just this page from GitHub.
      const pageResponse =
        await githubQueries.fetchUserRepositoriesInOrganisationPage(
          userToken,
          organisation,
          requestedGitHubPage,
          perPage
        );

      if (!entryIsValid || shouldRefreshCache) {
        // Start a fresh entry (clears any stale pages from a previous window or refresh).
        githubRepositoryPageCache.set(cacheKey, {
          pages: { [requestedGitHubPage]: pageResponse.repositories },
          totalPages: pageResponse.totalPages,
          cachedAt: now,
        });
      } else {
        // Valid entry exists — add this page to it.
        existingEntry.pages[requestedGitHubPage] = pageResponse.repositories;
        existingEntry.totalPages = pageResponse.totalPages;
      }

      const accessibleDatasetRepositories = pageResponse.repositories
        .map(repositoryName => datasetRepositoriesByName.get(repositoryName))
        .filter(Boolean);

      return res.status(200).json({
        repositories: accessibleDatasetRepositories.sort((left, right) =>
          left.name.localeCompare(right.name)
        ),
        cacheUsed: false,
        cachedAt: now,
        githubCurrentPage: pageResponse.currentPage,
        githubTotalPages: pageResponse.totalPages,
      });
    }

    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.githubPageRequired });
  } catch (error) {
    logger.error('Error fetching dataset repositories for user', {
      organisation,
      dataset,
      error: error.message,
    });
    return res
      .status(500)
      .json({ error: HUMAN_READABLE_ERRORS.repositoriesLoadFailed });
  }
});

// GET /teams?organisation=<org>&dataset=<dataset>
// Returns teams from the dataset that the user is a member of
// This filters the dataset teams to only those the user belongs to
router.get('/teams', async (req, res) => {
  const { organisation, dataset, refreshCache, githubPage, githubPerPage } =
    req.query;
  const userToken = req.cookies?.githubUserToken;

  if (!userToken) {
    return res
      .status(401)
      .json({ error: HUMAN_READABLE_ERRORS.githubAuthenticationRequired });
  }

  if (!organisation || !dataset) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationAndDatasetRequired });
  }

  // Validate organisation name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(organisation)) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.organisationInvalid });
  }

  // Validate dataset name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(dataset)) {
    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.datasetInvalid });
  }

  try {
    // Get teams from the dataset
    const datasetEntities = await getCachedDatasetEntities({
      organisation,
      dataset,
    });
    const datasetTeams = new Set(datasetEntities.teams);

    const shouldRefreshCache = parseRefreshCacheQuery(refreshCache);
    const requestedGitHubPage = parsePositiveIntegerQuery(githubPage);
    const requestedGitHubPerPage = parsePositiveIntegerQuery(githubPerPage);

    if (githubPage && !requestedGitHubPage) {
      return res
        .status(400)
        .json({ error: HUMAN_READABLE_ERRORS.githubPageInvalid });
    }

    if (githubPerPage && !requestedGitHubPerPage) {
      return res
        .status(400)
        .json({ error: HUMAN_READABLE_ERRORS.githubPerPageInvalid });
    }

    const isPageMode = Boolean(requestedGitHubPage);

    if (isPageMode) {
      const perPage = requestedGitHubPerPage || 100;
      const cacheKey = createUserScopedCacheKey(userToken, organisation);
      const now = Date.now();
      const existingEntry = githubTeamPageCache.get(cacheKey);

      const entryIsValid =
        existingEntry &&
        now - existingEntry.cachedAt <= GITHUB_ENTITY_CACHE_TTL_MS;

      // Cache hit: entry valid, not a forced refresh, and this page already fetched.
      if (
        !shouldRefreshCache &&
        entryIsValid &&
        existingEntry.pages[requestedGitHubPage]
      ) {
        const cachedPage = existingEntry.pages[requestedGitHubPage];
        const filteredFromCache = cachedPage.filter(team =>
          datasetTeams.has(team)
        );
        return res.status(200).json({
          teams: filteredFromCache.sort(),
          cacheUsed: true,
          cachedAt: existingEntry.cachedAt,
          githubCurrentPage: requestedGitHubPage,
          githubTotalPages: existingEntry.totalPages,
        });
      }

      // Cache miss or forced refresh: fetch just this page from GitHub.
      const pageResponse = await githubQueries.fetchUserTeamsInOrganisationPage(
        userToken,
        organisation,
        requestedGitHubPage,
        perPage
      );

      if (!entryIsValid || shouldRefreshCache) {
        // Start a fresh entry (clears any stale pages from a previous window or refresh).
        githubTeamPageCache.set(cacheKey, {
          pages: { [requestedGitHubPage]: pageResponse.teams },
          totalPages: pageResponse.totalPages,
          cachedAt: now,
        });
      } else {
        // Valid entry exists — add this page to it.
        existingEntry.pages[requestedGitHubPage] = pageResponse.teams;
        existingEntry.totalPages = pageResponse.totalPages;
      }

      const accessibleDatasetTeams = pageResponse.teams.filter(team =>
        datasetTeams.has(team)
      );

      return res.status(200).json({
        teams: accessibleDatasetTeams.sort(),
        cacheUsed: false,
        cachedAt: now,
        githubCurrentPage: pageResponse.currentPage,
        githubTotalPages: pageResponse.totalPages,
      });
    }

    return res
      .status(400)
      .json({ error: HUMAN_READABLE_ERRORS.githubPageRequired });
  } catch (error) {
    logger.error('Error fetching dataset teams for user', {
      organisation,
      dataset,
      error: error.message,
    });
    return res
      .status(500)
      .json({ error: HUMAN_READABLE_ERRORS.teamsLoadFailed });
  }
});

module.exports = router;
