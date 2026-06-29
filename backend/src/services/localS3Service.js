const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');

const DATA_DIR = path.join(__dirname, '../../data');

// Maps bucket keys and full AWS bucket names to local subdirectories
const BUCKET_DIR_MAP = {
  // Logical keys (used throughout the codebase)
  main: 'main',
  tat: 'tat',
  copilot: 'copilot',
  // Full AWS bucket names (used when env vars are absent)
  'digital-landscape-synthetic-data': 'main',
  'sdp-dev-tech-audit-tool-api': 'tat',
  'sdp-dev-copilot-usage-dashboard': 'copilot',
};

/**
 * LocalS3Service replaces S3Service in local development (NODE_ENV=development).
 * Reads and writes JSON files under backend/data/ instead of connecting to AWS S3.
 * This ensures no local code can read from or write to the AWS Dev environment.
 */
class LocalS3Service {
  /**
   * Resolve a bucket name or key to a local subdirectory name.
   * Falls back to using the raw bucket value if no mapping exists.
   * @param {string} bucket - Bucket key ('main', 'tat', 'copilot') or full AWS bucket name
   * @returns {string} Local directory name
   */
  _resolveDir(bucket) {
    // First check env-var-resolved bucket names
    const resolvedBuckets = {
      main: process.env.BUCKET_NAME || 'digital-landscape-synthetic-data',
      tat: process.env.TAT_BUCKET_NAME || 'sdp-dev-tech-audit-tool-api',
      copilot:
        process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard',
    };

    // If the caller passes a known logical key, use it directly
    if (BUCKET_DIR_MAP[bucket]) {
      return BUCKET_DIR_MAP[bucket];
    }

    // If the caller passes a full bucket name that matches an env-resolved name, map it back
    for (const [key, name] of Object.entries(resolvedBuckets)) {
      if (bucket === name) {
        return key;
      }
    }

    // Fall back to using the bucket value as the directory name
    return bucket;
  }

  /**
   * Read a JSON file from the local data directory, mirroring S3Service.getObject.
   * @param {string} bucket - Bucket key or full bucket name
   * @param {string} key - Object key (file path relative to bucket dir)
   * @returns {Promise<Object>} Parsed JSON object
   */
  async getObject(bucket, key) {
    const dir = this._resolveDir(bucket);
    const filePath = path.join(DATA_DIR, dir, key);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      logger.info(`[LOCAL] Read ${dir}/${key}`);
      return JSON.parse(raw);
    } catch (error) {
      logger.error(`[LOCAL] Error reading ${dir}/${key}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Write a JSON file to the local data directory, mirroring S3Service.putObject.
   * @param {string} bucket - Bucket key or full bucket name
   * @param {string} key - Object key (file path relative to bucket dir)
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async putObject(bucket, key, data) {
    const dir = this._resolveDir(bucket);
    const filePath = path.join(DATA_DIR, dir, key);
    const dirPath = path.dirname(filePath);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info(`[LOCAL] Wrote ${dir}/${key}`);
    } catch (error) {
      logger.error(`[LOCAL] Error writing ${dir}/${key}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Return the local directory name for a given bucket key.
   * @param {string} bucketKey - Key from BUCKET_DIR_MAP
   * @returns {string} Local directory name
   */
  getBucketName(bucketKey) {
    return this._resolveDir(bucketKey);
  }
}

module.exports = new LocalS3Service();
