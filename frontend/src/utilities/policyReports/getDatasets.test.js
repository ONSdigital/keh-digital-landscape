import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDatasetsByOrganisation } from './getDatasets';

vi.mock('../customFetch', () => ({
  default: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn() },
  default: { error: vi.fn() },
}));

import customFetch from '../customFetch';
import { toast } from 'react-hot-toast';

describe('fetchDatasetsByOrganisation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns datasets for a given organisation', async () => {
    const mockDatasets = [
      { name: '2024-01-15T10:00:00Z', displayName: '2024-01-15T10:00:00Z' },
      { name: '2024-01-01T10:00:00Z', displayName: '2024-01-01T10:00:00Z' },
    ];
    customFetch.mockResolvedValue({
      json: async () => ({ datasets: mockDatasets }),
    });

    const result = await fetchDatasetsByOrganisation('ONS-Innovation');

    expect(customFetch).toHaveBeenCalledWith(
      '/policy-reports/api/datasets?organisation=ONS-Innovation'
    );
    expect(result).toEqual(mockDatasets);
  });

  it('URL-encodes the organisation name', async () => {
    customFetch.mockResolvedValue({ json: async () => ({ datasets: [] }) });

    await fetchDatasetsByOrganisation('My Org / Special');

    expect(customFetch).toHaveBeenCalledWith(
      '/policy-reports/api/datasets?organisation=My%20Org%20%2F%20Special'
    );
  });

  it('returns an empty array when datasets key is missing from response', async () => {
    customFetch.mockResolvedValue({ json: async () => ({}) });

    const result = await fetchDatasetsByOrganisation('ONS-Innovation');

    expect(result).toEqual([]);
  });

  it('returns an empty array and shows a toast error when the fetch throws', async () => {
    customFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchDatasetsByOrganisation('ONS-Innovation');

    expect(result).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith(
      'Error loading datasets for the selected organisation.'
    );
  });
});
