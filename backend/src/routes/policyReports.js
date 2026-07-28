const logger = require('../config/logger');
const express = require('express');
const {
  getPolicyReportsConfig,
  getDatasetsByOrganisation,
} = require('../services/policyReportsService');

const router = express.Router();

const REPORT_TYPES = ['organisation', 'repository', 'team'];

// GET /config
router.get('/config', async (req, res) => {
  try {
    const config = await getPolicyReportsConfig();
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

module.exports = router;
