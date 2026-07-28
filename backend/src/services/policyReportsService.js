const s3Service = require('./s3Service');
const logger = require('../config/logger');

const BUCKET = 'policyAudit';
const AUDIT_PREFIX = 'audit-results/';

/**
 * Fetches the initial policy reports configuration.
 * Returns organisation options (from S3) and static config.
 * Dataset options are fetched separately per-organisation via getDatasetsByOrganisation.
 * @returns {Promise<Object>}
 */
const getPolicyReportsConfig = async () => {
  try {
    const allObjects = await s3Service.listObjects(BUCKET, AUDIT_PREFIX);

    // Extract unique organisation names (first-level directories under audit-results/)
    const organisationSet = new Set();
    allObjects.forEach(obj => {
      const relativePath = obj.Key.replace(AUDIT_PREFIX, '');
      const parts = relativePath.split('/');
      if (parts.length > 1 && parts[0]) {
        organisationSet.add(parts[0]);
      }
    });
    const organisationOptions = Array.from(organisationSet).sort();
    logger.info(`Fetched ${organisationOptions.length} organisations from S3`);

    return {
      organisationOptions,
    };
  } catch (error) {
    logger.error('Error fetching policy reports configuration:', error);
    throw error;
  }
};

/**
 * Fetches datasets for a given organisation, sorted newest-first.
 * Source dataset options = all datasets.
 * Comparison dataset options = all datasets older than the selected source (filtered client-side).
 * @param {string} organisation - The organisation folder name in S3
 * @returns {Promise<Array<{name: string, lastModified: number}>>}
 */
const getDatasetsByOrganisation = async organisation => {
  try {
    const orgPrefix = `${AUDIT_PREFIX}${organisation}/`;
    const objects = await s3Service.listObjects(BUCKET, orgPrefix);

    const datasets = objects
      .filter(obj => {
        const relativePath = obj.Key.replace(orgPrefix, '');
        // Only direct JSON files (no subdirectories)
        return relativePath.endsWith('.json') && !relativePath.includes('/');
      })
      .map(obj => {
        const lastModified = obj.LastModified;
        return {
          name: lastModified.toISOString(),
          lastModified: lastModified.getTime(),
        };
      })
      .sort((a, b) => b.lastModified - a.lastModified);

    logger.info(
      `Fetched ${datasets.length} datasets for organisation ${organisation}`
    );
    return datasets;
  } catch (error) {
    logger.error(
      `Error fetching datasets for organisation ${organisation}:`,
      error
    );
    throw error;
  }
};

module.exports = {
  getPolicyReportsConfig,
  getDatasetsByOrganisation,
};
