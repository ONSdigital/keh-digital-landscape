import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fetch from 'node-fetch';
import express from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  generalApiLimiter,
  adminApiLimiter,
  userApiLimiter,
  healthCheckLimiter,
  externalApiLimiter,
} = require('./rateLimiter');

describe('rateLimiter config', () => {
  let server;
  let baseUrl;

  beforeAll(() => {
    const app = express();

    app.get('/general', generalApiLimiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    app.get('/admin', adminApiLimiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    app.get('/user', userApiLimiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    app.get('/health', healthCheckLimiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    app.get('/external', externalApiLimiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    server = app.listen(0);
    baseUrl = `http://localhost:${server.address().port}`;
  });

  afterAll(() => {
    server.close();
  });

  async function hitUntilLimited(path) {
    let response;

    for (let i = 0; i < 61; i += 1) {
      response = await fetch(`${baseUrl}${path}`);
    }

    return response;
  }

  it('limits general API after 60 requests', async () => {
    const response = await hitUntilLimited('/general');

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '1 minute',
    });
  });

  it('limits admin API after 60 requests', async () => {
    const response = await hitUntilLimited('/admin');

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: 'Too many admin requests from this IP, please try again later.',
      retryAfter: '1 minute',
    });
  });

  it('limits user API after 60 requests', async () => {
    const response = await hitUntilLimited('/user');

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '1 minute',
    });
  });

  it('limits health checks after 60 requests', async () => {
    const response = await hitUntilLimited('/health');

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: 'Too many health check requests.',
      retryAfter: '1 minute',
    });
  });

  it('limits external API requests after 60 requests', async () => {
    const response = await hitUntilLimited('/external');

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: 'Too many requests to external APIs, please try again later.',
      retryAfter: '1 minute',
    });
  });
});
