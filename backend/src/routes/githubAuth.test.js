// Tests for the GitHub OAuth routes in githubAuth.js
// Covers: GET /login, POST /token, POST /logout, GET /status, GET /user

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
import cookieParser from 'cookie-parser';
import express from 'express';

const require = createRequire(import.meta.url);
const githubAuthRouter = require('./githubAuth');
const githubAuthUtils = require('../utilities/githubAuth');
const logger = require('../config/logger');

describe('GitHub Auth routes', () => {
  let server;
  let baseUrl;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';

    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/auth', githubAuthRouter);

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
    vi.unstubAllGlobals();
  });

  afterAll(() => {
    server.close();
  });

  // ---------------------------------------------------------------------------
  // GET /login
  // ---------------------------------------------------------------------------
  describe('GET /auth/login', () => {
    it('redirects to the GitHub authorise URL on success', async () => {
      process.env.GITHUB_APP_CLIENT_ID = 'test-client-id';

      const res = await fetch(
        `${baseUrl}/auth/login?state=abc&code_challenge=xyz&code_challenge_method=S256&redirectPath=/callback`,
        { redirect: 'manual' }
      );

      expect(res.status).toBe(302);
      const location = res.headers.get('location');
      expect(location).toContain('https://github.com/login/oauth/authorize');
      expect(location).toContain('client_id=test-client-id');
      expect(location).toContain('state=abc');

      delete process.env.GITHUB_APP_CLIENT_ID;
    });

    it('returns 500 when buildGitHubAuthoriseUrl throws (invalid redirectPath)', async () => {
      // redirectPath that does not start with '/' triggers buildAuthRedirectUri's guard
      const res = await fetch(
        `${baseUrl}/auth/login?redirectPath=not-a-valid-path`,
        { redirect: 'manual' }
      );

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Internal Server Error',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // POST /token
  // ---------------------------------------------------------------------------
  describe('POST /auth/token', () => {
    it('returns 400 when code is missing', async () => {
      const res = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeVerifier: 'verifier', redirectPath: '/cb' }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({ error: 'Missing code' });
    });

    it('sets httpOnly cookie and returns success on happy path', async () => {
      vi.spyOn(githubAuthUtils, 'buildTokenExchangeParams').mockReturnValue(
        new URLSearchParams({ code: 'mycode' })
      );

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: async () => ({ access_token: 'gh_token_abc' }),
        })
      );

      const res = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'mycode', redirectPath: '/callback' }),
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ success: true });

      const setCookie = res.headers.get('set-cookie') ?? '';
      expect(setCookie).toContain('githubUserToken=gh_token_abc');
      expect(setCookie).toContain('HttpOnly');
    });

    it('returns 400 when GitHub returns an error in the token response', async () => {
      vi.spyOn(githubAuthUtils, 'buildTokenExchangeParams').mockReturnValue(
        new URLSearchParams({ code: 'bad' })
      );

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: async () => ({
            error: 'bad_verification_code',
            error_description: 'The code passed is incorrect or expired.',
          }),
        })
      );

      const res = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'bad', redirectPath: '/callback' }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'The code passed is incorrect or expired.',
      });
    });

    it('falls back to error key when error_description is absent', async () => {
      vi.spyOn(githubAuthUtils, 'buildTokenExchangeParams').mockReturnValue(
        new URLSearchParams({ code: 'bad' })
      );

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: async () => ({ error: 'bad_verification_code' }),
        })
      );

      const res = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'bad', redirectPath: '/callback' }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'bad_verification_code',
      });
    });

    it('returns 500 when the fetch to GitHub throws', async () => {
      vi.spyOn(githubAuthUtils, 'buildTokenExchangeParams').mockReturnValue(
        new URLSearchParams({ code: 'mycode' })
      );

      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network failure'))
      );

      const res = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'mycode', redirectPath: '/callback' }),
      });

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Internal Server Error',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // POST /logout
  // ---------------------------------------------------------------------------
  describe('POST /auth/logout', () => {
    it('clears the githubUserToken cookie and returns success', async () => {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { Cookie: 'githubUserToken=gh_token_abc' },
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ success: true });

      // Cookie should be cleared (max-age=0 or Expires in the past)
      const setCookie = res.headers.get('set-cookie') ?? '';
      expect(setCookie).toMatch(/githubUserToken=;/);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /status
  // ---------------------------------------------------------------------------
  describe('GET /auth/status', () => {
    it('returns authenticated: true when cookie is present', async () => {
      const res = await fetch(`${baseUrl}/auth/status`, {
        headers: { Cookie: 'githubUserToken=gh_token_abc' },
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ authenticated: true });
    });

    it('returns authenticated: false when cookie is absent', async () => {
      const res = await fetch(`${baseUrl}/auth/status`);

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ authenticated: false });
    });
  });

  // ---------------------------------------------------------------------------
  // GET /user
  // ---------------------------------------------------------------------------
  describe('GET /auth/user', () => {
    it('returns 401 when the cookie is absent', async () => {
      const res = await fetch(`${baseUrl}/auth/user`);

      expect(res.status).toBe(401);
      await expect(res.json()).resolves.toEqual({ error: 'Not authenticated' });
    });

    it('returns the user profile on success', async () => {
      const mockProfile = {
        login: 'octocat',
        name: 'The Octocat',
        avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      };

      // fetchGitHubUserProfile is destructured inside the route module so
      // vi.spyOn on the exports object cannot intercept it. Instead, stub
      // global fetch so the real utility returns the expected profile.
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            login: 'octocat',
            name: 'The Octocat',
            avatar_url: 'https://github.com/images/error/octocat_happy.gif',
          }),
        })
      );

      const res = await fetch(`${baseUrl}/auth/user`, {
        headers: { Cookie: 'githubUserToken=gh_token_abc' },
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual(mockProfile);
    });

    it('returns 500 when fetchGitHubUserProfile throws', async () => {
      vi.spyOn(githubAuthUtils, 'fetchGitHubUserProfile').mockRejectedValue(
        new Error('GitHub API error: Unauthorized')
      );

      const res = await fetch(`${baseUrl}/auth/user`, {
        headers: { Cookie: 'githubUserToken=gh_token_abc' },
      });

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Internal Server Error',
      });
    });
  });
});
