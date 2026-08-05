// Tests for the /copilot/api/org/legacy route
// Covers: valid types, missing/invalid type, and error handling

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import fetch from 'node-fetch';
import express from 'express';
import copilotRouter from './copilot';
const s3Service = require('../services/s3Service');
const logger = require('../config/logger');

describe('/copilot/api/org/legacy route', () => {
  let server;
  let baseUrl;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';

    const app = express();
    app.use(express.json());
    app.use('/copilot/api', copilotRouter);

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

  it('returns legacy data for pre-0326', async () => {
    const mockData = { foo: 'bar' };
    vi.spyOn(s3Service, 'getObject').mockResolvedValue(mockData);
    const res = await fetch(`${baseUrl}/copilot/api/org/legacy?type=pre-0326`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockData);
  });

  it('returns legacy data for pre-0225', async () => {
    const mockData = { baz: 'qux' };
    vi.spyOn(s3Service, 'getObject').mockResolvedValue(mockData);
    const res = await fetch(`${baseUrl}/copilot/api/org/legacy?type=pre-0225`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockData);
  });

  it('returns 400 if type is missing', async () => {
    const res = await fetch(`${baseUrl}/copilot/api/org/legacy`);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Missing legacy data type');
  });

  it('returns 400 if type is invalid', async () => {
    const res = await fetch(`${baseUrl}/copilot/api/org/legacy?type=invalid`);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Invalid legacy data type');
  });

  it('returns 500 if s3Service throws', async () => {
    vi.spyOn(s3Service, 'getObject').mockRejectedValue(new Error('S3 error'));
    const res = await fetch(`${baseUrl}/copilot/api/org/legacy?type=pre-0326`);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data).toHaveProperty(
      'error',
      'Unable to load legacy usage data. Please try again later.'
    );
  });
});
