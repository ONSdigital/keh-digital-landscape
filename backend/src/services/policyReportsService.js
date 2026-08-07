const s3Service = require('./s3Service');
const logger = require('../config/logger');

const BUCKET = 'policyAudit';
const AUDIT_PREFIX = 'audit-results/';

const getLastModifiedTime = lastModified => {
  if (lastModified instanceof Date) {
    return lastModified.getTime();
  }

  if (lastModified) {
    const parsedDate = new Date(lastModified);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.getTime();
    }
  }

  return 0;
};

const getLastModifiedDisplayName = lastModified => {
  const timestamp = getLastModifiedTime(lastModified);
  return timestamp ? new Date(timestamp).toISOString() : '';
};

const getDatasetAuditData = async (organisation, datasetName) => {
  if (!organisation || !datasetName) {
    throw new Error('Organisation and dataset name are required');
  }

  const key = `${AUDIT_PREFIX}${organisation}/${datasetName}.json`;
  return s3Service.getObject(BUCKET, key);
};

/**
 * Fetches the list of organisations available for policy reporting.
 * Derives organisation names from top-level directories under the S3 audit prefix.
 * @returns {Promise<{organisationOptions: string[]}>}
 */
const getPolicyReportOrganisationOptions = async () => {
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
 * @returns {Promise<Array<{name: string, displayName: string}>>}
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
        const relativePath = obj.Key.replace(orgPrefix, '');
        const filename = relativePath.replace('.json', '');

        return {
          name: filename,
          displayName: getLastModifiedDisplayName(obj.LastModified),
          lastModifiedTime: getLastModifiedTime(obj.LastModified),
        };
      })
      .sort((a, b) => b.lastModifiedTime - a.lastModifiedTime)
      .map(({ lastModifiedTime: _lastModifiedTime, ...dataset }) => dataset);

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
    const data = await getDatasetAuditData(organisation, datasetName);

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
  getDatasetAuditData,
  getPolicyReportOrganisationOptions,
  getDatasetsByOrganisation,
  getDatasetEntities,
};
