// This file only tests the banner part of the admin routes.
// This includes:
// - POST /banners/update
// - GET /banners
// - POST /banners/toggle
// - POST /banners/delete

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import fetch from 'node-fetch';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const express = require('express');
const adminRouter = require('./admin');
const s3Service = require('../services/s3Service');
const logger = require('../config/logger');

describe('Admin banner routes', () => {
  let server;
  let baseUrl;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';

    const app = express();
    app.use(express.json());
    app.use('/admin/api', adminRouter);

    server = app.listen(0);
    baseUrl = `http://localhost:${server.address().port}`;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mock logger to prevent actual logging during tests
  // This can cause confusion since sad paths are expected to log warnings/errors
  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /admin/api/banners/update', () => {
    it('returns 400 for invalid banner data', async () => {
      const res = await fetch(`${baseUrl}/admin/api/banners/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banner: { description: '', pages: [] } }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid banner data',
      });
    });

    it('creates a new messages structure when bannerMessages.json does not exist', async () => {
      vi.spyOn(s3Service, 'getObject').mockRejectedValue(
        new Error('Not found')
      );
      const putObjectSpy = vi.spyOn(s3Service, 'putObject').mockResolvedValue();

      const payload = {
        banner: {
          title: 'Planned downtime',
          description: 'Service unavailable tonight',
          type: 'warning',
          pages: ['/projects'],
        },
      };

      const res = await fetch(`${baseUrl}/admin/api/banners/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        message: 'Banner added successfully',
      });

      expect(putObjectSpy).toHaveBeenCalledWith(
        'main',
        'bannerMessages.json',
        {
          messages: [
            {
              title: 'Planned downtime',
              description: 'Service unavailable tonight',
              type: 'warning',
              pages: ['/projects'],
              show: true,
            },
          ],
        }
      );
    });
  });

  describe('GET /admin/api/banners', () => {
    it('returns all messages when bannerMessages.json exists', async () => {
      vi.spyOn(s3Service, 'getObject').mockResolvedValue({
        messages: [{ description: 'Banner one', pages: ['/'] }],
      });

      const res = await fetch(`${baseUrl}/admin/api/banners`);

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        messages: [{ description: 'Banner one', pages: ['/'] }],
      });
    });

    it('returns empty messages array when bannerMessages.json does not exist', async () => {
      vi.spyOn(s3Service, 'getObject').mockRejectedValue(
        new Error('Not found')
      );

      const res = await fetch(`${baseUrl}/admin/api/banners`);

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ messages: [] });
    });
  });

  describe('POST /admin/api/banners/toggle', () => {
    it('returns 400 for invalid banner index', async () => {
      const res = await fetch(`${baseUrl}/admin/api/banners/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show: false }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid banner index',
      });
    });

    it('returns 400 when messages file is missing', async () => {
      vi.spyOn(s3Service, 'getObject').mockRejectedValue(
        new Error('Not found')
      );

      const res = await fetch(`${baseUrl}/admin/api/banners/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: 0, show: false }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Messages file not found',
      });
    });

    it('returns 400 for out-of-range banner index', async () => {
      vi.spyOn(s3Service, 'getObject').mockResolvedValue({ messages: [] });

      const res = await fetch(`${baseUrl}/admin/api/banners/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: 1, show: false }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Banner index out of range',
      });
    });

    it('updates banner visibility and persists messages', async () => {
      const messages = {
        messages: [{ description: 'Notice', show: true, pages: ['/'] }],
      };
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(messages);
      const putObjectSpy = vi.spyOn(s3Service, 'putObject').mockResolvedValue();

      const res = await fetch(`${baseUrl}/admin/api/banners/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: 0, show: false }),
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        message: 'Banner visibility updated successfully',
      });
      expect(putObjectSpy).toHaveBeenCalledWith(
        'main',
        'bannerMessages.json',
        {
          messages: [{ description: 'Notice', show: false, pages: ['/'] }],
        }
      );
    });
  });

  describe('POST /admin/api/banners/delete', () => {
    it('returns 400 for invalid banner index', async () => {
      const res = await fetch(`${baseUrl}/admin/api/banners/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid banner index',
      });
    });

    it('returns 400 for out-of-range banner index', async () => {
      vi.spyOn(s3Service, 'getObject').mockResolvedValue({ messages: [] });

      const res = await fetch(`${baseUrl}/admin/api/banners/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: 0 }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Banner index out of range',
      });
    });

    it('deletes a banner and persists messages', async () => {
      const messages = {
        messages: [
          { description: 'Keep me', show: true, pages: ['/'] },
          { description: 'Delete me', show: true, pages: ['/projects'] },
        ],
      };
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(messages);
      const putObjectSpy = vi.spyOn(s3Service, 'putObject').mockResolvedValue();

      const res = await fetch(`${baseUrl}/admin/api/banners/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: 1 }),
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        message: 'Banner deleted successfully',
      });
      expect(putObjectSpy).toHaveBeenCalledWith(
        'main',
        'bannerMessages.json',
        {
          messages: [{ description: 'Keep me', show: true, pages: ['/'] }],
        }
      );
    });
  });
});
