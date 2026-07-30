import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPolicyReportOrganisationOptions } from '../../../src/utilities/policyReports/getOrganisations';

vi.mock('../../../src/utilities/customFetch', () => ({
  default: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn() },
  default: { error: vi.fn() },
}));

import customFetch from '../../../src/utilities/customFetch';
import { toast } from 'react-hot-toast';

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

  it('returns null and shows a toast error when the fetch throws', async () => {
    customFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchPolicyReportOrganisationOptions();

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'Error loading policy report organisations.'
    );
  });
});
