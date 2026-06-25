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
const { getTeamsHistoricDataWithCache } = require('./teamsHistoricCache');
const logger = require('../config/logger');

describe('getTeamsHistoricDataWithCache', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('fetches and caches data on the first call', async () => {
    const result = await getTeamsHistoricDataWithCache();

    expect(result).toEqual({});
    expect(logger.info).toHaveBeenCalledWith(
      'No cache found, fetching teams historic data from S3'
    );
  });

  it('returns cached data on subsequent calls within the TTL', async () => {
    // prime the cache
    await getTeamsHistoricDataWithCache();
    vi.clearAllMocks();
    vi.spyOn(logger, 'info').mockImplementation(() => {});

    const result = await getTeamsHistoricDataWithCache();

    expect(result).toEqual({});
    expect(logger.info).toHaveBeenCalledWith(
      'Returning teams historic data from cache'
    );
  });

  it('refetches when the cache TTL has expired', async () => {
    vi.useFakeTimers();

    // prime the cache
    await getTeamsHistoricDataWithCache();
    vi.clearAllMocks();
    vi.spyOn(logger, 'info').mockImplementation(() => {});

    // advance past the 1-hour TTL
    vi.advanceTimersByTime(61 * 60 * 1000);

    const result = await getTeamsHistoricDataWithCache();

    expect(result).toEqual({});
    expect(logger.info).toHaveBeenCalledWith(
      'Cache expired, fetching teams historic data from S3'
    );
  });
});
