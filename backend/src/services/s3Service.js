const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const logger = require('../config/logger');

/**
 * S3Service class for managing S3 operations
 */
class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: 'eu-west-2',
    });

    // Bucket configurations
    this.buckets = {
      main: process.env.BUCKET_NAME || 'sdp-dev-digital-landscape',
      tat: process.env.TAT_BUCKET_NAME || 'sdp-dev-tech-audit-tool-api',
      copilot:
        process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard',
    };
  }

  /**
   * Get an object from S3 bucket
   * @param {string} bucket - Bucket name or bucket key from this.buckets
   * @param {string} key - Object key
   * @returns {Promise<Object>} Parsed JSON object
   */
  async getObject(bucket, key) {
    try {
      const bucketName = this.buckets[bucket] || bucket;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const { Body } = await this.s3Client.send(command);
      logger.info(`Successfully fetched ${bucket}/${key} object`);
      const data = await Body.transformToString();
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error getting object from S3: ${bucket}/${key}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Put an object to S3 bucket
   * @param {string} bucket - Bucket name or bucket key from this.buckets
   * @param {string} key - Object key
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async putObject(bucket, key, data) {
    try {
      const bucketName = this.buckets[bucket] || bucket;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });

      await this.s3Client.send(command);
      logger.info(`Successfully put object to S3: ${bucket}/${key}`);
    } catch (error) {
      logger.error(`Error putting object to S3: ${bucket}/${key}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get bucket name by key
   * @param {string} bucketKey - Key from this.buckets
   * @returns {string} Bucket name
   */
  getBucketName(bucketKey) {
    return this.buckets[bucketKey] || bucketKey;
  }
}

// In local development, use the filesystem-based service so that no code
// can accidentally read from or write to the AWS Dev environment.
if (process.env.NODE_ENV === 'development') {
  module.exports = require('./localS3Service');
} else {
  module.exports = new S3Service();
}
