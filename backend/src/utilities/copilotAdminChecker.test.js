import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { checkCopilotAdminStatus } = require('./copilotAdminChecker');
const s3Service = require('../services/s3Service');
const githubService = require('../services/githubService');
const logger = require('../config/logger');

const USER_TEAMS = [
  { slug: 'frontend-team', name: 'Frontend Team' },
  { slug: 'backend-team', name: 'Backend Team' },
];

describe('checkCopilotAdminStatus', () => {
  beforeEach(() => {
    process.env.COPILOT_BUCKET_NAME = 'test-copilot-bucket';
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.COPILOT_BUCKET_NAME;
  });

  it('returns isAdmin: false when the user is not in any admin team', async () => {
    vi.spyOn(githubService, 'getUserTeams').mockResolvedValue(USER_TEAMS);
    vi.spyOn(s3Service, 'getObject').mockResolvedValue(['copilot-admin-team']);

    const result = await checkCopilotAdminStatus('token-123');

    expect(result.isAdmin).toBe(false);
    expect(result.teams).toEqual(USER_TEAMS);
    expect(result.userTeamSlugs).toEqual(['frontend-team', 'backend-team']);
  });

  it('returns isAdmin: true when the user belongs to an admin team', async () => {
    const adminTeams = ['frontend-team'];
    vi.spyOn(githubService, 'getUserTeams').mockResolvedValue(USER_TEAMS);
    vi.spyOn(s3Service, 'getObject').mockResolvedValue(adminTeams);

    const result = await checkCopilotAdminStatus('token-123');

    expect(result.isAdmin).toBe(true);
    expect(result.userTeamSlugs).toEqual(['frontend-team', 'backend-team']);
  });

  it('returns isAdmin: false when admin_teams.json cannot be fetched', async () => {
    vi.spyOn(githubService, 'getUserTeams').mockResolvedValue(USER_TEAMS);
    vi.spyOn(s3Service, 'getObject').mockRejectedValue(
      new Error('S3 unavailable')
    );

    const result = await checkCopilotAdminStatus('token-123');

    expect(result.isAdmin).toBe(false);
    expect(result.teams).toEqual(USER_TEAMS);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Could not fetch admin_teams.json'),
      expect.objectContaining({ error: 'S3 unavailable' })
    );
  });

  it('returns copilot teams when user is admin and teams are available', async () => {
    vi.spyOn(githubService, 'getUserTeams').mockResolvedValue(USER_TEAMS);
    vi.spyOn(s3Service, 'getObject').mockResolvedValue(['frontend-team']); // admin_teams.json

    const result = await checkCopilotAdminStatus('token-123');

    expect(result.isAdmin).toBe(true);
    expect(result.userTeamSlugs).toEqual(['frontend-team', 'backend-team']);
    // getCopilotTeamsWithCache returns cached teams (empty object in this case)
    expect(result.teams).toBeDefined();
  });

  it('uses the default copilot bucket name when env var is absent', async () => {
    delete process.env.COPILOT_BUCKET_NAME;
    vi.spyOn(githubService, 'getUserTeams').mockResolvedValue(USER_TEAMS);
    const getObjectSpy = vi
      .spyOn(s3Service, 'getObject')
      .mockResolvedValue([]);

    await checkCopilotAdminStatus('token-123');

    expect(getObjectSpy).toHaveBeenCalledWith(
      'sdp-dev-copilot-usage-dashboard',
      'admin_teams.json'
    );
  });
});
