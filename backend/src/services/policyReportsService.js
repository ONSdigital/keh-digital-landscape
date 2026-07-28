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

    const datasets = await Promise.all(
      objects
        .filter(obj => {
          const relativePath = obj.Key.replace(orgPrefix, '');
          // Only direct JSON files (no subdirectories)
          return relativePath.endsWith('.json') && !relativePath.includes('/');
        })
        .map(async obj => {
          const relativePath = obj.Key.replace(orgPrefix, '');
          const filename = relativePath.replace('.json', ''); // Remove .json extension
          const lastModified = obj.LastModified;

          try {
            // Read the file to extract the timestamp (already parsed JSON from s3Service)
            const data = await s3Service.getObject(BUCKET, obj.Key);
            const timestamp = data.timestamp || lastModified.toISOString();

            return {
              name: filename,
              displayName: timestamp, // Human-readable timestamp
              lastModified: lastModified.getTime(),
            };
          } catch (error) {
            logger.warn(
              `Could not extract timestamp from ${filename}, using file modification time`,
              error
            );
            return {
              name: filename,
              displayName: lastModified.toISOString(),
              lastModified: lastModified.getTime(),
            };
          }
        })
    );

    datasets.sort((a, b) => b.lastModified - a.lastModified);

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

/**
 * Fetches repository and team names from a specific dataset audit file.
 * @param {string} organisation - The organisation folder name in S3
 * @param {string} datasetName - The dataset filename (UUID) without .json extension
 * @returns {Promise<{repositories: string[], teams: string[]}>}
 */
const getDatasetEntities = async (organisation, datasetName) => {
  try {
    if (!organisation || !datasetName) {
      throw new Error('Organisation and dataset name are required');
    }

    const key = `${AUDIT_PREFIX}${organisation}/${datasetName}.json`;
    const data = await s3Service.getObject(BUCKET, key);

    const repositories = Object.keys(data.repositories || {});
    const teams = Object.keys(data.teams || {});

    logger.info(
      `Fetched ${repositories.length} repositories and ${teams.length} teams from dataset ${datasetName}`,
      { organisation }
    );

    return {
      repositories: repositories.sort(),
      teams: teams.sort(),
    };
  } catch (error) {
    logger.error(
      `Error fetching dataset entities for ${organisation}/${datasetName}:`,
      error
    );
    throw error;
  }
};

module.exports = {
  getPolicyReportsConfig,
  getDatasetsByOrganisation,
  getDatasetEntities,
};
