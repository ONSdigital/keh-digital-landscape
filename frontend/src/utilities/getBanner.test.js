import { fetchBanners } from './getBanner';
import customFetch from './customFetch';

vi.mock('./customFetch', () => ({
  default: vi.fn(),
}));
const mockCustomFetch = customFetch;

describe('fetchBanners', () => {
  const originalLocalStorage = global.localStorage;

  let localStorageMock;
  beforeEach(() => {
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn(key => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    global.localStorage = localStorageMock;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  it('returns filtered banners for a specific page', async () => {
    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: [
          {
            show: true,
            page: 'radar',
            title: 'Radar Banner',
            description: 'Radar Desc',
            type: 'warning',
          },
          {
            show: true,
            page: 'statistics',
            title: 'Stats Banner',
            description: 'Stats Desc',
            type: 'info',
          },
        ],
      }),
    });

    const banners = await fetchBanners('radar');
    expect(banners).toEqual([
      {
        title: 'Radar Banner',
        description: 'Radar Desc',
        type: 'warning',
      },
    ]);
  });

  it('returns only banners with show=true', async () => {
    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: [
          {
            show: false,
            page: 'radar',
            title: 'Hidden Banner',
            description: 'Should not show',
          },
          {
            show: true,
            page: 'radar',
            title: 'Visible Banner',
            description: 'Should show',
          },
        ],
      }),
    });

    const banners = await fetchBanners('radar');
    expect(banners[0].title).toBe('Visible Banner');
    expect(banners.length).toBe(1);
  });

  it('handles messages with pages array', async () => {
    mockCustomFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        messages: [
          {
            show: true,
            pages: ['radar', 'statistics'],
            title: 'Multi Banner',
            description: 'Multi Desc',
          },
        ],
      }),
    });

    const banners = await fetchBanners('statistics');
    expect(banners[0].title).toBe('Multi Banner');

    const banners2 = await fetchBanners('radar');
    expect(banners2.length).toBeGreaterThan(0);
    expect(banners2[0].title).toBe('Multi Banner');
  });

  it('returns empty array if response is not ok', async () => {
    mockCustomFetch.mockResolvedValueOnce({ ok: false });
    const banners = await fetchBanners('radar');
    expect(banners).toEqual([]);
  });

  it('returns empty array if messages is missing or not an array', async () => {
    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    const banners = await fetchBanners('radar');
    expect(banners).toEqual([]);

    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: 'not-an-array' }),
    });
    const banners2 = await fetchBanners('radar');
    expect(banners2).toEqual([]);
  });

  it('returns only the last banner if multiple banners match', async () => {
    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: [
          {
            show: true,
            page: 'radar',
            title: 'First',
            description: 'First Desc',
          },
          {
            show: true,
            page: 'radar',
            title: 'Second',
            description: 'Second Desc',
          },
        ],
      }),
    });

    const banners = await fetchBanners('radar');
    expect(banners.length).toBe(1);
    expect(banners[0].title).toBe('Second');
  });

  it('does not show dismissed banners', async () => {
    const banner = {
      show: true,
      page: 'radar',
      title: 'Dismissed',
      description: 'Dismissed Desc',
    };
    const bannerId = `dismissed_banner_Dismissed_Dismissed_Desc`.replace(
      /\s+/g,
      '_'
    );
    localStorageMock.getItem.mockImplementation(key => {
      if (key === bannerId) {
        return JSON.stringify({ dismissedAt: Date.now() });
      }
      return null;
    });

    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [banner] }),
    });

    const banners = await fetchBanners('radar');
    expect(banners).toEqual([]);
  });

  it('shows banners that have not been dismissed', async () => {
    const banner = {
      show: true,
      page: 'radar',
      title: 'Not Dismissed',
      description: 'Not Dismissed Desc',
    };
    const bannerId =
      `dismissed_banner_Not_Dismissed_Not_Dismissed_Desc`.replace(/\s+/g, '_');
    localStorageMock.getItem.mockImplementation(key => {
      if (key === bannerId) {
        return null; // Not dismissed
      }
      return null;
    });

    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [banner] }),
    });

    const banners = await fetchBanners('radar');
    expect(banners[0].title).toBe('Not Dismissed');
  });

  it('shows banners again if dismissed more than 7 days ago', async () => {
    const now = Date.now();
    const dismissedAt = now - 8 * 24 * 60 * 60 * 1000; // 8 days ago
    const banner = {
      show: true,
      page: 'radar',
      title: 'Old Dismissed',
      description: 'Old Desc',
    };
    const bannerId = `dismissed_banner_Old_Dismissed_Old_Desc`.replace(
      /\s+/g,
      '_'
    );
    localStorageMock.getItem.mockImplementation(key => {
      if (key === bannerId) {
        return JSON.stringify({ dismissedAt });
      }
      return null;
    });

    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [banner] }),
    });

    const banners = await fetchBanners('radar');
    expect(banners[0].title).toBe('Old Dismissed');
  });

  it('returns empty array and logs error on fetch exception', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCustomFetch.mockRejectedValueOnce(new Error('Network error'));
    const banners = await fetchBanners('radar');
    expect(banners).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('handles missing title/description/type gracefully', async () => {
    mockCustomFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: [
          { show: true, page: 'radar', message: 'Fallback Message' },
          { show: true, page: 'radar' },
        ],
      }),
    });

    const banners = await fetchBanners('radar');
    expect(banners[0]).toMatchObject({
      title: '',
      description: '',
      type: 'info',
    });
  });
});
