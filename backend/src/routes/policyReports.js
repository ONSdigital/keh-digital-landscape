const logger = require('../config/logger');
const express = require('express');
const policyReportsService = require('../services/policyReportsService');
const githubQueries = require('../utilities/githubQueries');
const policyReportGenerator = require('../utilities/policyReportGenerator');

const router = express.Router();

const REPORT_TYPES = ['organisation', 'repository', 'team'];
const SAFE_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

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
  const { organisation, dataset } = req.query;
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
    const datasetEntities = await policyReportsService.getDatasetEntities(
      organisation,
      dataset
    );
    const datasetRepositories = new Set(datasetEntities.repositories);

    // Get repositories the user has access to
    const userRepositories =
      await githubQueries.fetchUserRepositoriesInOrganisation(
        userToken,
        organisation
      );
    const userRepositoriesSet = new Set(userRepositories);

    // Find intersection: repos in dataset AND user has access to
    const accessibleDatasetRepositories = Array.from(
      userRepositoriesSet
    ).filter(repo => datasetRepositories.has(repo));

    return res.status(200).json({
      repositories: accessibleDatasetRepositories.sort(),
    });
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
  const { organisation, dataset } = req.query;
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
    const datasetEntities = await policyReportsService.getDatasetEntities(
      organisation,
      dataset
    );
    const datasetTeams = new Set(datasetEntities.teams);

    // Get teams the user is a member of
    const userTeams = await githubQueries.fetchUserTeamsInOrganisation(
      userToken,
      organisation
    );
    const userTeamsSet = new Set(userTeams);

    // Find intersection: teams in dataset AND user is member of
    const accessibleDatasetTeams = Array.from(userTeamsSet).filter(team =>
      datasetTeams.has(team)
    );

    return res.status(200).json({
      teams: accessibleDatasetTeams.sort(),
    });
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
