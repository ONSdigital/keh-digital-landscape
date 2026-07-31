const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
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
      policyAudit:
        process.env.POLICY_AUDIT_BUCKET_NAME || 'sdp-dev-github-policy-audit',
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

  /**
   * List objects in an S3 bucket with optional prefix
   * @param {string} bucket - Bucket name or bucket key from this.buckets
   * @param {string} prefix - Optional prefix to filter objects
   * @returns {Promise<Array>} Array of objects with Key and LastModified properties
   */
  async listObjects(bucket, prefix = '') {
    try {
      const bucketName = this.buckets[bucket] || bucket;

      // This will only return up to 1000 objects. For more, you would need to implement pagination.
      // Due to the nature of the application, we are unlikely to have more than 1000 objects in a single prefix, so this is acceptable for now.
      // AWS Docs: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);
      logger.info(
        `Successfully listed objects from ${bucket} with prefix ${prefix}`
      );
      return response.Contents || [];
    } catch (error) {
      logger.error(
        `Error listing objects in S3: ${bucket} with prefix ${prefix}`,
        {
          error: error.message,
        }
      );
      throw error;
    }
  }
}

// In local development, use the filesystem-based service by default so that
// no code can accidentally read from or write to the AWS Dev environment.
// Set USE_LOCAL_S3=false to connect to real S3 in a development environment.
const useLocalS3 =
  process.env.NODE_ENV === 'development' &&
  process.env.USE_LOCAL_S3 !== 'false';

if (useLocalS3) {
  module.exports = require('./localS3Service');
} else {
  module.exports = new S3Service();
}
