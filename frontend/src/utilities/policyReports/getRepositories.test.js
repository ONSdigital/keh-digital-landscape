import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDatasetRepositoriesForUser } from './getRepositories';

vi.mock('../customFetch', () => ({
  default: vi.fn(),
}));

import customFetch from '../customFetch';

describe('fetchDatasetRepositoriesForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns repositories for a given organisation and dataset', async () => {
    const mockRepos = ['repo-a', 'repo-b', 'repo-c'];
    customFetch.mockResolvedValue({
      json: async () => ({ repositories: mockRepos }),
    });

    const result = await fetchDatasetRepositoriesForUser(
      'ONS-Innovation',
      '2024-01-15T10:00:00Z'
    );

    expect(customFetch).toHaveBeenCalledWith(
      expect.stringContaining('/policy-reports/api/repositories'),
      { credentials: 'include' }
    );
    expect(result).toEqual(mockRepos);
  });

  it('URL-encodes the organisation and dataset parameters', async () => {
    customFetch.mockResolvedValue({ json: async () => ({ repositories: [] }) });

    await fetchDatasetRepositoriesForUser(
      'ONS-Innovation',
      '2024-01-15T10:00:00Z'
    );

    const calledUrl = customFetch.mock.calls[0][0];
    expect(calledUrl).toContain('organisation=ONS-Innovation');
    expect(calledUrl).toContain(
      `dataset=${encodeURIComponent('2024-01-15T10:00:00Z')}`
    );
  });

  it('returns an empty array when repositories key is missing from response', async () => {
    customFetch.mockResolvedValue({ json: async () => ({}) });

    const result = await fetchDatasetRepositoriesForUser(
      'ONS-Innovation',
      '2024-01-15T10:00:00Z'
    );

    expect(result).toEqual([]);
  });

  it('returns an empty array when organisation is falsy', async () => {
    const result = await fetchDatasetRepositoriesForUser(
      '',
      '2024-01-15T10:00:00Z'
    );

    expect(customFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('returns an empty array when dataset is falsy', async () => {
    const result = await fetchDatasetRepositoriesForUser('ONS-Innovation', '');

    expect(customFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('returns an empty array when the fetch throws', async () => {
    customFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchDatasetRepositoriesForUser(
      'ONS-Innovation',
      '2024-01-15T10:00:00Z'
    );

    expect(result).toEqual([]);
  });
});
