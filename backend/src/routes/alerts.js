const express = require('express');
const router = express.Router();
const postToWebhook = require('../services/alertService');
const logger = require('../config/logger');

/**
 * Endpoint for fetching token and posting alert.
 * @route POST /api/alert
 * @returns {String} Status code after sending alert to webhook
 * @throws {Error} 500 - If token fails or webhook posting fails
 */
router.post('/alert', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).send('Invalid payload: expected JSON object');
    }

    const result = await postToWebhook(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send(err?.message ?? 'Token/Webhook error');
  }
});

router.post('/log', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).send('Invalid payload: expected JSON object');
    }

    const logType = req.body.type;

    if (!['error', 'warning', 'info'].includes(logType)) {
      // Clean up the logType to prevent XSS attacks
      const sanitizedLogType = String(logType).replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return res
        .status(400)
        .send(
          `Invalid log type: ${sanitizedLogType}. Must be one of 'error', 'warning', or 'info'.`
        );
    }

    const statusInfo = req.body.status;
    const eventInfo = req.body.event;
    const description = req.body.description;

    switch (logType) {
      case 'error':
        logger.error({ status: statusInfo, event: eventInfo, description });
        break;
      case 'warning':
        logger.warn({ status: statusInfo, event: eventInfo, description });
        break;
      case 'info':
        logger.info({ status: statusInfo, event: eventInfo, description });
        break;
    }

    res.send('Log recorded successfully');
  } catch (err) {
    res.status(500).send(err?.message ?? 'Logging error');
  }
});

module.exports = router;
