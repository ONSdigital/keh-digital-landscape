const logger = require('../config/logger');
const express = require('express');
const { getPolicyReportsConfig } = require('../services/policyReportsService');

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
