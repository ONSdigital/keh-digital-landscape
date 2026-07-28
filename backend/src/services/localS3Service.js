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
  policyAudit: 'policyAudit',
  // Full AWS bucket names (used when env vars are absent)
  'sdp-dev-digital-landscape': 'main',
  'sdp-dev-tech-audit-tool-api': 'tat',
  'sdp-dev-copilot-usage-dashboard': 'copilot',
  'sdp-dev-github-policy-audit': 'policyAudit',
};

/**
 * LocalS3Service replaces S3Service in local development (NODE_ENV=development).
 * Reads and writes JSON files under backend/data/ instead of connecting to AWS S3.
 * This ensures no local code can read from or write to the AWS Dev environment.
 */
class LocalS3Service {
  /**
   * Resolve a path under DATA_DIR and block traversal outside that root.
   * @param {...string} segments - Path segments to resolve under DATA_DIR
   * @returns {string} Safe absolute path
   */
  _resolveSafePath(...segments) {
    const rootPath = path.resolve(DATA_DIR);
    const targetPath = path.resolve(rootPath, ...segments);
    const relativePath = path.relative(rootPath, targetPath);

    if (
      relativePath === '' ||
      (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
    ) {
      return targetPath;
    }

    const error = new Error('Invalid path: resolved path escapes data directory');
    error.code = 'INVALID_PATH';
    throw error;
  }

  /**
   * Resolve a bucket name or key to a local subdirectory name.
   * Falls back to using the raw bucket value if no mapping exists.
   * @param {string} bucket - Bucket key ('main', 'tat', 'copilot', 'policyAudit') or full AWS bucket name
   * @returns {string} Local directory name
   */
  _resolveDir(bucket) {
    // First check env-var-resolved bucket names
    const resolvedBuckets = {
      main: process.env.BUCKET_NAME || 'sdp-dev-digital-landscape',
      tat: process.env.TAT_BUCKET_NAME || 'sdp-dev-tech-audit-tool-api',
      copilot:
        process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard',
      policyAudit:
        process.env.POLICY_AUDIT_BUCKET_NAME || 'sdp-dev-github-policy-audit',
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
    const filePath = this._resolveSafePath(dir, key);
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
    const filePath = this._resolveSafePath(dir, key);
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

  /**
   * List objects in a local directory, mirroring S3Service.listObjects.
   * Recursively walks the directory structure and returns file information.
   * @param {string} bucket - Bucket key or full bucket name
   * @param {string} prefix - Optional prefix to filter objects (directory path)
   * @returns {Promise<Array>} Array of objects with Key and LastModified properties
   */
  async listObjects(bucket, prefix = '') {
    const dir = this._resolveDir(bucket);
    const basePath = this._resolveSafePath(dir, prefix);

    try {
      const results = [];

      /**
       * Recursively walk directory and collect files
       */
      const walk = async (currentPath, relativePath) => {
        const entries = await fs.readdir(currentPath, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            // Recursively walk subdirectories
            await walk(fullPath, relPath);
          } else if (entry.isFile()) {
            // Validate fullPath stays within basePath to prevent traversal via symlinks
            const normalizedFull = path.resolve(fullPath);
            const normalizedBase = path.resolve(basePath);
            if (!normalizedFull.startsWith(normalizedBase + path.sep) && normalizedFull !== normalizedBase) {
              logger.warn(`[LOCAL] Path traversal attempt detected: ${normalizedFull}`);
              continue;
            }
            // Get file stats for LastModified
            const stats = await fs.stat(fullPath);
            results.push({
              Key: relPath,
              LastModified: stats.mtime,
              Size: stats.size,
            });
          }
        }
      };

      // Start walking from the base path
      try {
        await walk(basePath, prefix);
      } catch (error) {
        // If the directory doesn't exist, return empty array
        if (error.code === 'ENOENT') {
          logger.info(`[LOCAL] Directory not found: ${dir}/${prefix}`);
          return [];
        }
        throw error;
      }

      logger.info(`[LOCAL] Listed objects from ${dir}/${prefix}`);
      return results;
    } catch (error) {
      logger.error(`[LOCAL] Error listing objects in ${dir}/${prefix}`, {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new LocalS3Service();
