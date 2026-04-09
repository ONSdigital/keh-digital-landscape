// This file tests the /health endpoint in default.js. This is a simple endpoint that returns the health status of the API.
// Other parts of default.js should be tested in other files.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fetch from 'node-fetch';
import app from '../index.js';

let server;
let baseUrl;

beforeAll(async () => {
  server = app.listen(0); // 0 = random available port
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

afterAll(() => {
  server.close();
});

describe('API Health Check', () => {
  it('should return status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toEqual('healthy');
  });

  it('should return correct response structure', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('memory');
    expect(data).toHaveProperty('pid');
  });
});
