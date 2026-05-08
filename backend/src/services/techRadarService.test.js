import { beforeEach, describe, expect, it, vi } from 'vitest';

const getObject = vi.fn();
const putObject = vi.fn();

vi.mock('./s3Service', () => ({
  default: { getObject, putObject },
  getObject,
  putObject,
}));

vi.mock('../config/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
  info: vi.fn(),
  error: vi.fn(),
}));

describe('TechRadarService.updateTechRadarEntries', () => {
  beforeEach(() => {
    vi.resetModules();
    getObject.mockReset();
    putObject.mockReset();

    getObject.mockResolvedValue({
      quadrants: [{ id: '1' }, { id: '2' }],
      rings: [
        { id: 'adopt' },
        { id: 'trial' },
        { id: 'assess' },
        { id: 'hold' },
      ],
      entries: [],
    });

    putObject.mockResolvedValue({});
  });

  const makeEntry = overrides => ({
    id: 'tech-1',
    title: 'Python',
    quadrant: '1',
    timeline: [
      {
        moved: 0,
        ringId: 'adopt',
        date: '2026-05-08 12:00:00',
        description: 'Reviewed',
      },
    ],
    ...overrides,
  });

  it('accepts entries when tags key is omitted', async () => {
    const techRadarServiceModule = await import('./techRadarService');
    const techRadarService =
      techRadarServiceModule.default || techRadarServiceModule;

    const entry = makeEntry({});
    delete entry.tags;

    await techRadarService.updateTechRadarEntries([entry], 'test');

    expect(putObject).toHaveBeenCalledTimes(1);
  });

  it('rejects when tags key exists but is undefined', async () => {
    const techRadarServiceModule = await import('./techRadarService');
    const techRadarService =
      techRadarServiceModule.default || techRadarServiceModule;

    await expect(
      techRadarService.updateTechRadarEntries(
        [makeEntry({ tags: undefined })],
        'test'
      )
    ).rejects.toThrow(/Invalid entry structure/i);
  });

  it('rejects when tags exists but is not an array', async () => {
    const techRadarServiceModule = await import('./techRadarService');
    const techRadarService =
      techRadarServiceModule.default || techRadarServiceModule;

    await expect(
      techRadarService.updateTechRadarEntries([makeEntry({ tags: 'data' })])
    ).rejects.toThrow(/Invalid entry structure/i);
  });

  it('rejects when tags contains non-strings', async () => {
    const techRadarServiceModule = await import('./techRadarService');
    const techRadarService =
      techRadarServiceModule.default || techRadarServiceModule;

    await expect(
      techRadarService.updateTechRadarEntries([
        makeEntry({ tags: ['data', { value: 'api' }] }),
      ])
    ).rejects.toThrow(/Invalid entry structure/i);
  });

  it('accepts tags as string[]', async () => {
    const techRadarServiceModule = await import('./techRadarService');
    const techRadarService =
      techRadarServiceModule.default || techRadarServiceModule;

    const entry = makeEntry({ tags: ['data', 'api'] });

    await techRadarService.updateTechRadarEntries([entry], 'test');

    expect(putObject).toHaveBeenCalledTimes(1);
  });
});
