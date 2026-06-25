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
const addressBookRouter = require('./addressBook');
const addressBookService = require('../services/addressBookService');
const logger = require('../config/logger');

describe('GET /addressbook/api/request', () => {
  let server;
  let baseUrl;

  beforeAll(() => {
    const app = express();
    app.use(express.json());
    app.use('/addressbook/api', addressBookRouter);

    server = app.listen(0);
    baseUrl = `http://localhost:${server.address().port}`;
  });

  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  const mockUser = {
    username: 'jsmith',
    email: 'john.smith@ons.gov.uk',
    accountID: 'u123',
    url: 'https://github.com/jsmith',
    avatarUrl: 'https://avatars.githubusercontent.com/u/u123',
    fullname: 'john smith',
  };

  it('returns 400 when no query parameter is provided', async () => {
    const res = await fetch(`${baseUrl}/addressbook/api/request`);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Missing input' });
  });

  it('returns 400 when query is an empty string', async () => {
    const res = await fetch(`${baseUrl}/addressbook/api/request?q=`);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Missing input' });
  });

  it('returns formatted user data for a single username', async () => {
    vi.spyOn(addressBookService, 'formatAddressBookData').mockResolvedValue([
      mockUser,
    ]);

    const res = await fetch(`${baseUrl}/addressbook/api/request?q=jsmith`);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([mockUser]);
    expect(addressBookService.formatAddressBookData).toHaveBeenCalledWith([
      'jsmith',
    ]);
  });

  it('splits a comma-separated query into multiple inputs', async () => {
    vi.spyOn(addressBookService, 'formatAddressBookData').mockResolvedValue([
      mockUser,
    ]);

    const res = await fetch(`${baseUrl}/addressbook/api/request?q=jsmith,jdoe`);
    expect(res.status).toBe(200);
    expect(addressBookService.formatAddressBookData).toHaveBeenCalledWith([
      'jsmith',
      'jdoe',
    ]);
  });

  it('accepts multiple q parameters as an array', async () => {
    vi.spyOn(addressBookService, 'formatAddressBookData').mockResolvedValue([
      mockUser,
    ]);

    const res = await fetch(
      `${baseUrl}/addressbook/api/request?q=jsmith&q=jdoe`
    );
    expect(res.status).toBe(200);
    expect(addressBookService.formatAddressBookData).toHaveBeenCalledWith([
      'jsmith',
      'jdoe',
    ]);
  });

  it('returns 500 when the service throws', async () => {
    vi.spyOn(addressBookService, 'formatAddressBookData').mockRejectedValue(
      new Error('S3 unavailable')
    );

    const res = await fetch(`${baseUrl}/addressbook/api/request?q=jsmith`);
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: 'Internal Server Error',
    });
  });
});
