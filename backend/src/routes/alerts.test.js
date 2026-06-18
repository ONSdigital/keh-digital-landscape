// Tests for the /api/alert and /api/log routes in alerts.js
// Covers: valid payloads, invalid payloads, error handling, and log types

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

vi.mock('../services/alertService');

const require = createRequire(import.meta.url);
const express = require('express');
const alertsRouter = require('./alerts');
const postToWebhook = require('../services/alertService');
const logger = require('../config/logger');

describe('Alert routes', () => {
  let server;
  let baseUrl;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';

    const app = express();
    app.use(express.json());
    app.use('/api', alertsRouter);

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

  describe('POST /api/alert', () => {
    it('returns 200 when webhook posts successfully', async () => {
      vi.mocked(postToWebhook).mockResolvedValue('Alert sent');

      const res = await fetch(`${baseUrl}/api/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Test alert' }),
      });

      expect(res.status).toBe(200);
    });

    it('returns 400 when body is missing', async () => {
      const res = await fetch(`${baseUrl}/api/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      });

      expect(res.status).toBe(400);
    });

    it('returns 500 when alertService throws', async () => {
      vi.mocked(postToWebhook).mockRejectedValue(
        new Error('Webhook failed')
      );

      const res = await fetch(`${baseUrl}/api/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Test alert' }),
      });

      expect(res.status).toBe(500);
      const text = await res.text();
      expect(text).toBe('Webhook failed');
    });

    it('returns generic error message when alertService throws without message', async () => {
      vi.mocked(postToWebhook).mockRejectedValue({});

      const res = await fetch(`${baseUrl}/api/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Test alert' }),
      });

      expect(res.status).toBe(500);
      const text = await res.text();
      expect(text).toBe('Token/Webhook error');
    });
  });

  describe('POST /api/log', () => {
    it('returns 200 and logs an error type', async () => {
      const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

      const res = await fetch(`${baseUrl}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          status: 500,
          event: 'test_event',
          description: 'Something went wrong',
        }),
      });

      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toBe('Log recorded successfully');
      expect(errorSpy).toHaveBeenCalledWith({
        status: 500,
        event: 'test_event',
        description: 'Something went wrong',
      });
    });

    it('returns 200 and logs a warning type', async () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      const res = await fetch(`${baseUrl}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'warning',
          status: 200,
          event: 'test_warning',
          description: 'A warning occurred',
        }),
      });

      expect(res.status).toBe(200);
      expect(warnSpy).toHaveBeenCalledWith({
        status: 200,
        event: 'test_warning',
        description: 'A warning occurred',
      });
    });

    it('returns 200 and logs an info type', async () => {
      const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});

      const res = await fetch(`${baseUrl}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'info',
          status: 200,
          event: 'test_info',
          description: 'An info message',
        }),
      });

      expect(res.status).toBe(200);
      expect(infoSpy).toHaveBeenCalledWith({
        status: 200,
        event: 'test_info',
        description: 'An info message',
      });
    });

    it('returns 400 for an invalid log type', async () => {
      const res = await fetch(`${baseUrl}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'debug', status: 200, event: 'x', description: 'y' }),
      });

      expect(res.status).toBe(400);
      const text = await res.text();
      expect(text).toContain('Invalid log type');
      expect(text).toContain('debug');
    });

    it('sanitizes XSS in invalid log type response', async () => {
      const res = await fetch(`${baseUrl}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: '<script>alert(1)</script>', status: 200, event: 'x', description: 'y' }),
      });

      expect(res.status).toBe(400);
      const text = await res.text();
      expect(text).not.toContain('<script>');
      expect(text).toContain('&lt;script&gt;');
    });

    it('returns 400 when body is not a valid JSON object', async () => {
      const res = await fetch(`${baseUrl}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      });

      expect(res.status).toBe(400);
    });
  });
});
