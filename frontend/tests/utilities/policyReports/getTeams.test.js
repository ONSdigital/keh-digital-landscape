import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDatasetTeamsForUser } from '../../../src/utilities/policyReports/getTeams';

vi.mock('../../../src/utilities/customFetch', () => ({
  default: vi.fn(),
}));

import customFetch from '../../../src/utilities/customFetch';

describe('fetchDatasetTeamsForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns teams for a given organisation and dataset', async () => {
    const mockTeams = ['team-alpha', 'team-beta'];
    customFetch.mockResolvedValue({ json: async () => ({ teams: mockTeams }) });

    const result = await fetchDatasetTeamsForUser(
      'ONS-Innovation',
      '2024-01-15T10:00:00Z'
    );

    expect(customFetch).toHaveBeenCalledWith(
      expect.stringContaining('/policy-reports/api/teams'),
      { credentials: 'include' }
    );
    expect(result).toEqual(mockTeams);
  });

  it('URL-encodes the organisation and dataset parameters', async () => {
    customFetch.mockResolvedValue({ json: async () => ({ teams: [] }) });

    await fetchDatasetTeamsForUser('ONS-Innovation', '2024-01-15T10:00:00Z');

    const calledUrl = customFetch.mock.calls[0][0];
    expect(calledUrl).toContain('organisation=ONS-Innovation');
    expect(calledUrl).toContain(
      `dataset=${encodeURIComponent('2024-01-15T10:00:00Z')}`
    );
  });

  it('returns an empty array when teams key is missing from response', async () => {
    customFetch.mockResolvedValue({ json: async () => ({}) });

    const result = await fetchDatasetTeamsForUser(
      'ONS-Innovation',
      '2024-01-15T10:00:00Z'
    );

    expect(result).toEqual([]);
  });

  it('returns an empty array when organisation is falsy', async () => {
    const result = await fetchDatasetTeamsForUser('', '2024-01-15T10:00:00Z');

    expect(customFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('returns an empty array when dataset is falsy', async () => {
    const result = await fetchDatasetTeamsForUser('ONS-Innovation', '');

    expect(customFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('returns an empty array when the fetch throws', async () => {
    customFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchDatasetTeamsForUser(
      'ONS-Innovation',
      '2024-01-15T10:00:00Z'
    );

    expect(result).toEqual([]);
  });
});
