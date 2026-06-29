import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const localS3Service = require('./localS3Service');
const fs = require('fs').promises;
const logger = require('../config/logger');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

describe('localS3Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    delete process.env.BUCKET_NAME;
    delete process.env.TAT_BUCKET_NAME;
    delete process.env.COPILOT_BUCKET_NAME;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBucketName', () => {
    it('resolves logical and AWS bucket names', () => {
      expect(localS3Service.getBucketName('main')).toBe('main');
      expect(localS3Service.getBucketName('sdp-dev-tech-audit-tool-api')).toBe(
        'tat'
      );
      expect(
        localS3Service.getBucketName('sdp-dev-copilot-usage-dashboard')
      ).toBe('copilot');
    });

    it('uses env-configured bucket names when provided', () => {
      process.env.BUCKET_NAME = 'custom-main-bucket';

      expect(localS3Service.getBucketName('custom-main-bucket')).toBe('main');
    });

    it('falls back to raw bucket name when unknown', () => {
      expect(localS3Service.getBucketName('some-random-bucket')).toBe(
        'some-random-bucket'
      );
    });
  });

  describe('getObject', () => {
    it('reads and parses JSON from the mapped local directory', async () => {
      const payload = { ok: true, count: 2 };
      const readFileSpy = vi
        .spyOn(fs, 'readFile')
        .mockResolvedValue(JSON.stringify(payload));

      const result = await localS3Service.getObject('main', 'sample.json');

      expect(result).toEqual(payload);
      expect(readFileSpy).toHaveBeenCalledWith(
        path.join(DATA_DIR, 'main', 'sample.json'),
        'utf-8'
      );
      expect(logger.info).toHaveBeenCalledWith('[LOCAL] Read main/sample.json');
    });

    it('logs and rethrows when file read fails', async () => {
      const error = new Error('ENOENT: missing file');
      vi.spyOn(fs, 'readFile').mockRejectedValue(error);

      await expect(
        localS3Service.getObject('tat', 'missing.json')
      ).rejects.toThrow('ENOENT: missing file');

      expect(logger.error).toHaveBeenCalledWith(
        '[LOCAL] Error reading tat/missing.json',
        { error: 'ENOENT: missing file' }
      );
    });
  });

  describe('putObject', () => {
    it('creates directories and writes pretty JSON to mapped path', async () => {
      const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = vi
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);

      const body = { name: 'test', nested: { enabled: true } };
      await localS3Service.putObject('copilot', 'nested/file.json', body);

      expect(mkdirSpy).toHaveBeenCalledWith(
        path.join(DATA_DIR, 'copilot', 'nested'),
        { recursive: true }
      );
      expect(writeFileSpy).toHaveBeenCalledWith(
        path.join(DATA_DIR, 'copilot', 'nested/file.json'),
        JSON.stringify(body, null, 2),
        'utf-8'
      );
      expect(logger.info).toHaveBeenCalledWith(
        '[LOCAL] Wrote copilot/nested/file.json'
      );
    });

    it('logs and rethrows when writing fails', async () => {
      vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      vi.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Disk full'));

      await expect(
        localS3Service.putObject('main', 'out.json', { ok: false })
      ).rejects.toThrow('Disk full');

      expect(logger.error).toHaveBeenCalledWith(
        '[LOCAL] Error writing main/out.json',
        { error: 'Disk full' }
      );
    });
  });
});
