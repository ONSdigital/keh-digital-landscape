import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPolicyReportOrganisationOptions } from './getOrganisations';

vi.mock('../customFetch', () => ({
  default: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {},
  default: {},
}));

import customFetch from '../customFetch';

describe('fetchPolicyReportOrganisationOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns organisation options from the API response', async () => {
    const mockData = { organisationOptions: ['ONS-Innovation', 'ONS-Dev'] };
    customFetch.mockResolvedValue({ json: async () => mockData });

    const result = await fetchPolicyReportOrganisationOptions();

    expect(customFetch).toHaveBeenCalledWith(
      '/policy-reports/api/organisations'
    );
    expect(result).toEqual(mockData);
  });

  it('returns null when the fetch throws', async () => {
    customFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchPolicyReportOrganisationOptions();

    expect(result).toBeNull();
  });
});
