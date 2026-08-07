import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import toast from 'react-hot-toast';
import customFetch from './customFetch';

vi.mock('react-hot-toast', () => ({
  default: {
    custom: vi.fn(),
  },
}));

vi.mock('../components/Toast/ErrorToast', () => ({
  default: () => null,
}));

describe('customFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('throws the backend JSON error message when one is returned', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ error: 'sourceDataset is required' }),
      text: vi.fn(),
    });

    await expect(
      customFetch('/policy-reports/api/generateReport')
    ).rejects.toThrow('sourceDataset is required');
    expect(toast.custom).toHaveBeenCalledTimes(1);
  });

  it('falls back to the response status when no error body can be read', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers(),
      text: vi.fn().mockResolvedValue(''),
    });

    await expect(
      customFetch('/policy-reports/api/generateReport')
    ).rejects.toThrow('Request failed with status 503');
  });
});
