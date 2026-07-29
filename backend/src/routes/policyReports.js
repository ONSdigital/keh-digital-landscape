const logger = require('../config/logger');
const express = require('express');
const {
  getPolicyReportOrganisationOptions,
  getDatasetsByOrganisation,
  getDatasetEntities,
} = require('../services/policyReportsService');
const {
  fetchUserRepositoriesInOrganisation,
  fetchUserTeamsInOrganisation,
} = require('../utilities/githubQueries');

const router = express.Router();

const REPORT_TYPES = ['organisation', 'repository', 'team'];

// GET /config
router.get('/config', async (req, res) => {
  try {
    const config = await getPolicyReportOrganisationOptions();
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
  if (!/^[a-zA-Z0-9_-]+$/.test(organisation)) {
    return res.status(400).json({ error: 'Invalid organisation name format' });
  }

  try {
    const datasets = await getDatasetsByOrganisation(organisation);
    return res.status(200).json({ datasets });
  } catch (error) {
    logger.error('Error fetching datasets for organisation', {
      organisation,
      error: error.message,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /generateReport
router.get('/generateReport', async (req, res) => {
  const reportType = req.query.type;

  if (!reportType) {
    logger.warn('Report type not specified');
    return res.status(400).json({ error: 'Report type is required' });
  }

  if (!REPORT_TYPES.includes(reportType)) {
    logger.warn('Invalid report type specified');
    return res.status(400).json({ error: 'Invalid report type' });
  }

  try {
    // Placeholder for report generation logic
    const reportData = {
      message: `${reportType} report generated successfully`,
    };
    return res.json(reportData);
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
  if (!/^[a-zA-Z0-9_-]+$/.test(organisation)) {
    return res.status(400).json({ error: 'Invalid organisation name format' });
  }

  try {
    // Get repositories from the dataset
    const datasetEntities = await getDatasetEntities(organisation, dataset);
    const datasetRepositories = new Set(datasetEntities.repositories);

    // Get repositories the user has access to
    const userRepositories = await fetchUserRepositoriesInOrganisation(
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
  if (!/^[a-zA-Z0-9_-]+$/.test(organisation)) {
    return res.status(400).json({ error: 'Invalid organisation name format' });
  }

  try {
    // Get teams from the dataset
    const datasetEntities = await getDatasetEntities(organisation, dataset);
    const datasetTeams = new Set(datasetEntities.teams);

    // Get teams the user is a member of
    const userTeams = await fetchUserTeamsInOrganisation(
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
