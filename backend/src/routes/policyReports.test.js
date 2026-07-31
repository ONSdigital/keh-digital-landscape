// Tests for the policy-reports routes in policyReports.js
// Covers: input validation (400), unauthenticated access (401), and success paths (200)

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
import express from 'express';
import cookieParser from 'cookie-parser';

const require = createRequire(import.meta.url);
const policyReportsRouter = require('./policyReports');
const policyReportsService = require('../services/policyReportsService');
const githubQueries = require('../utilities/githubQueries');
const policyReportGenerator = require('../utilities/policyReportGenerator');
const logger = require('../config/logger');

describe('Policy Reports routes', () => {
  let server;
  let baseUrl;

  beforeAll(() => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/policy-reports/api', policyReportsRouter);

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

  // ---------------------------------------------------------------------------
  // GET /organisations
  // ---------------------------------------------------------------------------

  describe('GET /policy-reports/api/organisations', () => {
    it('returns 200 with organisation options', async () => {
      vi.spyOn(
        policyReportsService,
        'getPolicyReportOrganisationOptions'
      ).mockResolvedValue({ organisationOptions: ['org-a', 'org-b'] });

      const res = await fetch(`${baseUrl}/policy-reports/api/organisations`);

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        organisationOptions: ['org-a', 'org-b'],
      });
    });

    it('returns 500 when the service throws', async () => {
      vi.spyOn(
        policyReportsService,
        'getPolicyReportOrganisationOptions'
      ).mockRejectedValue(new Error('S3 failure'));

      const res = await fetch(`${baseUrl}/policy-reports/api/organisations`);

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Internal Server Error',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // GET /datasets
  // ---------------------------------------------------------------------------

  describe('GET /policy-reports/api/datasets', () => {
    it('returns 400 when organisation query param is missing', async () => {
      const res = await fetch(`${baseUrl}/policy-reports/api/datasets`);

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'organisation query parameter is required',
      });
    });

    it('returns 400 when organisation name contains invalid characters', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/datasets?organisation=bad/name`
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid organisation name format',
      });
    });

    it('returns 200 with datasets for a valid organisation', async () => {
      const mockDatasets = [
        { name: '2024-01-01', displayName: '1 Jan 2024' },
        { name: '2024-02-01', displayName: '1 Feb 2024' },
      ];
      vi.spyOn(
        policyReportsService,
        'getDatasetsByOrganisation'
      ).mockResolvedValue(mockDatasets);

      const res = await fetch(
        `${baseUrl}/policy-reports/api/datasets?organisation=my-org`
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ datasets: mockDatasets });
      expect(
        policyReportsService.getDatasetsByOrganisation
      ).toHaveBeenCalledWith('my-org');
    });

    it('returns 500 when the service throws', async () => {
      vi.spyOn(
        policyReportsService,
        'getDatasetsByOrganisation'
      ).mockRejectedValue(new Error('S3 error'));

      const res = await fetch(
        `${baseUrl}/policy-reports/api/datasets?organisation=my-org`
      );

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Internal Server Error',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // POST /generateReport
  // ---------------------------------------------------------------------------

  describe('POST /policy-reports/api/generateReport', () => {
    it('returns 400 when reportType is missing', async () => {
      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: {} }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Report type is required',
      });
    });

    it('returns 400 when reportType is not a recognised value', async () => {
      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'unknown' }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid report type',
      });
    });

    it('returns 400 when reportType is null', async () => {
      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: null }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Report type is required',
      });
    });

    it('returns 400 when reportType is a non-string value', async () => {
      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 123 }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid report type',
      });
    });

    it('returns 400 when organisation contains invalid characters', async () => {
      const getDatasetAuditDataSpy = vi.spyOn(
        policyReportsService,
        'getDatasetAuditData'
      );

      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'organisation',
          inputs: {
            organisation: 'my-org/../../other',
            sourceDataset: '20260723T121307Z',
          },
        }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid organisation value',
      });
      expect(getDatasetAuditDataSpy).not.toHaveBeenCalled();
    });

    it('returns HTML with content-disposition for a valid organisation report', async () => {
      vi.spyOn(policyReportsService, 'getDatasetAuditData').mockResolvedValue({
        summary: { total_repositories: 2 },
      });

      vi.spyOn(policyReportGenerator, 'generateReport').mockReturnValue({
        html: '<html><body>Report</body></html>',
        fileName: 'organisation-report.html',
      });

      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'organisation',
          inputs: {
            organisation: 'my-org',
            sourceDataset: '20260723T121307Z',
            comparisonDataset: '20260716T121307Z',
          },
        }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('content-disposition')).toContain('attachment');
      expect(policyReportsService.getDatasetAuditData).toHaveBeenCalledTimes(2);
      expect(policyReportGenerator.generateReport).toHaveBeenCalledWith(
        expect.objectContaining({
          inputs: expect.objectContaining({
            sourceDatasetData: { summary: { total_repositories: 2 } },
            comparisonDatasetData: { summary: { total_repositories: 2 } },
          }),
        })
      );
    });

    it('handles reportType case-insensitively', async () => {
      vi.spyOn(policyReportGenerator, 'generateReport').mockReturnValue({
        html: '<html></html>',
        fileName: 'team-report.html',
      });

      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'TEAM' }),
      });

      expect(res.status).toBe(200);
    });

    it('returns 500 when the generator throws', async () => {
      vi.spyOn(policyReportGenerator, 'generateReport').mockImplementation(
        () => {
          throw new Error('Generator failure');
        }
      );

      const res = await fetch(`${baseUrl}/policy-reports/api/generateReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'repository' }),
      });

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Internal Server Error',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // GET /repositories
  // ---------------------------------------------------------------------------

  describe('GET /policy-reports/api/repositories', () => {
    it('returns 401 when no GitHub token cookie is present', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?organisation=my-org&dataset=2024-01-01`
      );

      expect(res.status).toBe(401);
      await expect(res.json()).resolves.toEqual({
        error: 'Not authenticated with GitHub',
      });
    });

    it('returns 400 when organisation query param is missing', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'organisation and dataset query parameters are required',
      });
    });

    it('returns 400 when dataset query param is missing', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?organisation=my-org`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'organisation and dataset query parameters are required',
      });
    });

    it('returns 400 when organisation name contains invalid characters', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?organisation=bad/name&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid organisation name format',
      });
    });

    it('returns 400 when dataset name contains invalid characters', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?organisation=my-org&dataset=../traversal`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid dataset name format',
      });
    });

    it('returns 200 with the intersection of dataset and user repositories', async () => {
      vi.spyOn(policyReportsService, 'getDatasetEntities').mockResolvedValue({
        repositories: ['repo-a', 'repo-b', 'repo-c'],
        teams: [],
      });
      vi.spyOn(
        githubQueries,
        'fetchUserRepositoriesInOrganisation'
      ).mockResolvedValue(['repo-a', 'repo-c', 'repo-d']);

      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?organisation=my-org&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        repositories: ['repo-a', 'repo-c'],
      });
    });

    it('returns 200 with an empty array when the user has access to none of the dataset repos', async () => {
      vi.spyOn(policyReportsService, 'getDatasetEntities').mockResolvedValue({
        repositories: ['repo-x'],
        teams: [],
      });
      vi.spyOn(
        githubQueries,
        'fetchUserRepositoriesInOrganisation'
      ).mockResolvedValue(['repo-y']);

      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?organisation=my-org&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ repositories: [] });
    });

    it('returns 500 when the service throws', async () => {
      vi.spyOn(policyReportsService, 'getDatasetEntities').mockRejectedValue(
        new Error('S3 error')
      );

      const res = await fetch(
        `${baseUrl}/policy-reports/api/repositories?organisation=my-org&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Failed to fetch repositories',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // GET /teams
  // ---------------------------------------------------------------------------

  describe('GET /policy-reports/api/teams', () => {
    it('returns 401 when no GitHub token cookie is present', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?organisation=my-org&dataset=2024-01-01`
      );

      expect(res.status).toBe(401);
      await expect(res.json()).resolves.toEqual({
        error: 'Not authenticated with GitHub',
      });
    });

    it('returns 400 when organisation query param is missing', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'organisation and dataset query parameters are required',
      });
    });

    it('returns 400 when dataset query param is missing', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?organisation=my-org`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'organisation and dataset query parameters are required',
      });
    });

    it('returns 400 when organisation name contains invalid characters', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?organisation=bad/name&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid organisation name format',
      });
    });

    it('returns 400 when dataset name contains invalid characters', async () => {
      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?organisation=my-org&dataset=../traversal`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        error: 'Invalid dataset name format',
      });
    });

    it('returns 200 with the intersection of dataset and user teams', async () => {
      vi.spyOn(policyReportsService, 'getDatasetEntities').mockResolvedValue({
        repositories: [],
        teams: ['team-alpha', 'team-beta', 'team-gamma'],
      });
      vi.spyOn(githubQueries, 'fetchUserTeamsInOrganisation').mockResolvedValue(
        ['team-alpha', 'team-gamma', 'team-delta']
      );

      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?organisation=my-org&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        teams: ['team-alpha', 'team-gamma'],
      });
    });

    it('returns 200 with an empty array when the user is a member of none of the dataset teams', async () => {
      vi.spyOn(policyReportsService, 'getDatasetEntities').mockResolvedValue({
        repositories: [],
        teams: ['team-x'],
      });
      vi.spyOn(githubQueries, 'fetchUserTeamsInOrganisation').mockResolvedValue(
        ['team-y']
      );

      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?organisation=my-org&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ teams: [] });
    });

    it('returns 500 when the service throws', async () => {
      vi.spyOn(policyReportsService, 'getDatasetEntities').mockRejectedValue(
        new Error('S3 error')
      );

      const res = await fetch(
        `${baseUrl}/policy-reports/api/teams?organisation=my-org&dataset=2024-01-01`,
        { headers: { Cookie: 'githubUserToken=test-token' } }
      );

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        error: 'Failed to fetch teams',
      });
    });
  });
});
