const logger = require('../config/logger');
const express = require('express');
const crypto = require('crypto');
const policyReportsService = require('../services/policyReportsService');
const githubQueries = require('../utilities/githubQueries');
const policyReportGenerator = require('../utilities/policyReportGenerator');

const router = express.Router();

const REPORT_TYPES = ['organisation', 'repository', 'team'];
const SAFE_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const GITHUB_ENTITY_CACHE_TTL_MS = 15 * 60 * 1000;
const DATASET_ENTITY_CACHE_TTL_MS = 15 * 60 * 1000;

// Per-page caches for the page-mode loading flow.
// Key: tokenHash:organisation  Value: { pages: { [n]: string[] }, totalPages: number, cachedAt: number }
const githubRepositoryPageCache = new Map();
const githubTeamPageCache = new Map();

// Dataset entities cache to prevent repeated S3 fetches during page-by-page requests.
// Key: organisation:dataset  Value: { entities: { repositories: string[], teams: string[] }, cachedAt: number }
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
    return res.status(500).json({ error: 'Internal Server Error' });
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
      .json({ error: 'organisation query parameter is required' });
  }

  // Validate organisation name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(organisation)) {
    return res.status(400).json({ error: 'Invalid organisation name format' });
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /generateReport
router.post('/generateReport', async (req, res) => {
  const { reportType, inputs } = req.body;
  const safeInputs = inputs || {};
  const normalizedReportType = String(reportType).toLowerCase();

  if (!reportType) {
    logger.warn('Report type not specified');
    return res.status(400).json({ error: 'Report type is required' });
  }

  if (!REPORT_TYPES.includes(normalizedReportType)) {
    logger.warn('Invalid report type specified');
    return res.status(400).json({ error: 'Invalid report type' });
  }

  if (
    safeInputs.sourceDataset &&
    !SAFE_NAME_REGEX.test(safeInputs.sourceDataset)
  ) {
    logger.warn('Invalid source dataset value specified');
    return res.status(400).json({ error: 'Invalid source dataset value' });
  }

  if (
    safeInputs.comparisonDataset &&
    !SAFE_NAME_REGEX.test(safeInputs.comparisonDataset)
  ) {
    logger.warn('Invalid comparison dataset value specified');
    return res.status(400).json({ error: 'Invalid comparison dataset value' });
  }

  if (
    safeInputs.organisation &&
    !SAFE_NAME_REGEX.test(safeInputs.organisation)
  ) {
    logger.warn('Invalid organisation value specified');
    return res.status(400).json({ error: 'Invalid organisation value' });
  }

  if (!safeInputs.organisation) {
    logger.warn('Organisation not specified for report generation');
    return res.status(400).json({ error: 'organisation is required' });
  }

  if (!safeInputs.sourceDataset) {
    logger.warn('Source dataset not specified for report generation');
    return res.status(400).json({ error: 'sourceDataset is required' });
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
    return res.status(500).json({ error: 'Internal Server Error' });
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
    return res.status(401).json({ error: 'Not authenticated with GitHub' });
  }

  if (!organisation || !dataset) {
    return res.status(400).json({
      error: 'organisation and dataset query parameters are required',
    });
  }

  // Validate organisation name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(organisation)) {
    return res.status(400).json({ error: 'Invalid organisation name format' });
  }

  // Validate dataset name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(dataset)) {
    return res.status(400).json({ error: 'Invalid dataset name format' });
  }

  try {
    // Get repositories from the dataset
    const datasetEntities = await getCachedDatasetEntities({
      organisation,
      dataset,
    });
    const datasetRepositories = new Set(datasetEntities.repositories);

    const shouldRefreshCache = parseRefreshCacheQuery(refreshCache);
    const requestedGitHubPage = parsePositiveIntegerQuery(githubPage);
    const requestedGitHubPerPage = parsePositiveIntegerQuery(githubPerPage);

    if (githubPage && !requestedGitHubPage) {
      return res
        .status(400)
        .json({ error: 'githubPage must be a positive integer' });
    }

    if (githubPerPage && !requestedGitHubPerPage) {
      return res
        .status(400)
        .json({ error: 'githubPerPage must be a positive integer' });
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
        const filteredFromCache = cachedPage.filter(repo =>
          datasetRepositories.has(repo)
        );
        return res.status(200).json({
          repositories: filteredFromCache.sort(),
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

      const accessibleDatasetRepositories = pageResponse.repositories.filter(
        repo => datasetRepositories.has(repo)
      );

      return res.status(200).json({
        repositories: accessibleDatasetRepositories.sort(),
        cacheUsed: false,
        cachedAt: now,
        githubCurrentPage: pageResponse.currentPage,
        githubTotalPages: pageResponse.totalPages,
      });
    }

    return res.status(400).json({ error: 'githubPage is required' });
  } catch (error) {
    logger.error('Error fetching dataset repositories for user', {
      organisation,
      dataset,
      error: error.message,
    });
    return res.status(500).json({ error: 'Failed to fetch repositories' });
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
    return res.status(401).json({ error: 'Not authenticated with GitHub' });
  }

  if (!organisation || !dataset) {
    return res.status(400).json({
      error: 'organisation and dataset query parameters are required',
    });
  }

  // Validate organisation name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(organisation)) {
    return res.status(400).json({ error: 'Invalid organisation name format' });
  }

  // Validate dataset name: only alphanumeric, hyphens, underscores
  if (!SAFE_NAME_REGEX.test(dataset)) {
    return res.status(400).json({ error: 'Invalid dataset name format' });
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
        .json({ error: 'githubPage must be a positive integer' });
    }

    if (githubPerPage && !requestedGitHubPerPage) {
      return res
        .status(400)
        .json({ error: 'githubPerPage must be a positive integer' });
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

    return res.status(400).json({ error: 'githubPage is required' });
  } catch (error) {
    logger.error('Error fetching dataset teams for user', {
      organisation,
      dataset,
      error: error.message,
    });
    return res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

module.exports = router;
