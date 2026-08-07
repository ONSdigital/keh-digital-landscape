import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const policyReportsService = require('./policyReportsService');
const s3Service = require('./s3Service');
const logger = require('../config/logger');

describe('policyReportsService', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDatasetsByOrganisation', () => {
    it('returns direct JSON datasets sorted newest-first using LastModified', async () => {
      vi.spyOn(s3Service, 'listObjects').mockResolvedValue([
        {
          Key: 'audit-results/my-org/2024-01-01.json',
          LastModified: new Date('2024-01-01T10:00:00.000Z'),
        },
        {
          Key: 'audit-results/my-org/nested/ignore-me.json',
          LastModified: new Date('2024-01-03T10:00:00.000Z'),
        },
        {
          Key: 'audit-results/my-org/2024-01-02.json',
          LastModified: new Date('2024-01-02T10:00:00.000Z'),
        },
        {
          Key: 'audit-results/my-org/readme.txt',
          LastModified: new Date('2024-01-04T10:00:00.000Z'),
        },
      ]);
      const getObjectSpy = vi.spyOn(s3Service, 'getObject');

      const result =
        await policyReportsService.getDatasetsByOrganisation('my-org');

      expect(result).toEqual([
        {
          name: '2024-01-02',
          displayName: '2024-01-02T10:00:00.000Z',
        },
        {
          name: '2024-01-01',
          displayName: '2024-01-01T10:00:00.000Z',
        },
      ]);
      expect(s3Service.listObjects).toHaveBeenCalledWith(
        'policyAudit',
        'audit-results/my-org/'
      );
      expect(getObjectSpy).not.toHaveBeenCalled();
    });

    it('logs and rethrows when listing datasets fails', async () => {
      vi.spyOn(s3Service, 'listObjects').mockRejectedValue(
        new Error('S3 unavailable')
      );

      await expect(
        policyReportsService.getDatasetsByOrganisation('my-org')
      ).rejects.toThrow('S3 unavailable');
      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching datasets for organisation my-org:',
        expect.any(Error)
      );
    });
  });
});
