import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const techRadarService = require('./techRadarService');
const s3Service = require('./s3Service');
const logger = require('../config/logger');

const MOCK_RADAR_DATA = {
  quadrants: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
  rings: [{ id: 'adopt' }, { id: 'trial' }, { id: 'assess' }, { id: 'hold' }],
  entries: [
    {
      id: 'existing-1',
      title: 'Existing Tech',
      quadrant: '1',
      timeline: [
        {
          moved: 0,
          ringId: 'adopt',
          date: '2024-01-01',
          description: 'Initial',
        },
      ],
    },
  ],
};

const VALID_ENTRY = {
  id: 'new-entry',
  title: 'New Tech',
  quadrant: '1',
  timeline: [
    {
      moved: 1,
      ringId: 'trial',
      date: '2024-06-01',
      description: 'Added to radar',
    },
  ],
};

describe('TechRadarService', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTechRadarData', () => {
    it('returns radar data from S3', async () => {
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(MOCK_RADAR_DATA);

      const result = await techRadarService.getTechRadarData();

      expect(result).toEqual(MOCK_RADAR_DATA);
      expect(s3Service.getObject).toHaveBeenCalledWith(
        'main',
        'onsRadarSkeleton.json'
      );
    });

    it('logs and rethrows when S3 fails', async () => {
      vi.spyOn(s3Service, 'getObject').mockRejectedValue(new Error('S3 error'));

      await expect(techRadarService.getTechRadarData()).rejects.toThrow(
        'S3 error'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching tech radar data:',
        { error: 'S3 error' }
      );
    });
  });

  describe('updateTechRadarEntries', () => {
    it('throws when entries is null', async () => {
      await expect(
        techRadarService.updateTechRadarEntries(null)
      ).rejects.toThrow('Invalid or empty entries data');
    });

    it('throws when entries is an empty array', async () => {
      await expect(techRadarService.updateTechRadarEntries([])).rejects.toThrow(
        'Invalid or empty entries data'
      );
    });

    it('throws when entries is not an array', async () => {
      await expect(
        techRadarService.updateTechRadarEntries('bad')
      ).rejects.toThrow('Invalid or empty entries data');
    });

    it('throws when an entry has an invalid quadrant', async () => {
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(MOCK_RADAR_DATA);

      await expect(
        techRadarService.updateTechRadarEntries([
          { ...VALID_ENTRY, quadrant: '99' },
        ])
      ).rejects.toThrow('Invalid entry structure');
    });

    it('throws when an entry is missing a required field', async () => {
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(MOCK_RADAR_DATA);

      await expect(
        techRadarService.updateTechRadarEntries([
          { ...VALID_ENTRY, id: undefined },
        ])
      ).rejects.toThrow('Invalid entry structure');
    });

    it('throws when a timeline item has an invalid ringId', async () => {
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(MOCK_RADAR_DATA);

      await expect(
        techRadarService.updateTechRadarEntries([
          {
            ...VALID_ENTRY,
            timeline: [
              {
                moved: 0,
                ringId: 'unknown-ring',
                date: '2024-01-01',
                description: 'test',
              },
            ],
          },
        ])
      ).rejects.toThrow('Invalid entry structure');
    });

    it('accepts "ignore" and "review" as valid ringIds', async () => {
      const radarData = structuredClone(MOCK_RADAR_DATA);
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(radarData);
      vi.spyOn(s3Service, 'putObject').mockResolvedValue(undefined);

      await expect(
        techRadarService.updateTechRadarEntries([
          {
            ...VALID_ENTRY,
            timeline: [
              {
                moved: -1,
                ringId: 'ignore',
                date: '2024-01-01',
                description: 'Ignored',
              },
            ],
          },
        ])
      ).resolves.not.toThrow();
    });

    it('merges a new entry into existing data and saves to S3', async () => {
      const radarData = structuredClone(MOCK_RADAR_DATA);
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(radarData);
      const putSpy = vi
        .spyOn(s3Service, 'putObject')
        .mockResolvedValue(undefined);

      await techRadarService.updateTechRadarEntries([VALID_ENTRY], 'admin');

      const savedData = putSpy.mock.calls[0][2];
      const ids = savedData.entries.map(e => e.id);
      expect(ids).toContain('existing-1');
      expect(ids).toContain('new-entry');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Tech radar updated successfully'),
        expect.any(Object)
      );
    });

    it('updates an existing entry in place', async () => {
      const radarData = structuredClone(MOCK_RADAR_DATA);
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(radarData);
      const putSpy = vi
        .spyOn(s3Service, 'putObject')
        .mockResolvedValue(undefined);

      const updated = { ...MOCK_RADAR_DATA.entries[0], title: 'Updated Tech' };
      await techRadarService.updateTechRadarEntries([updated]);

      const savedData = putSpy.mock.calls[0][2];
      const entry = savedData.entries.find(e => e.id === 'existing-1');
      expect(entry.title).toBe('Updated Tech');
    });

    it('logs and rethrows when S3 put fails', async () => {
      const radarData = structuredClone(MOCK_RADAR_DATA);
      vi.spyOn(s3Service, 'getObject').mockResolvedValue(radarData);
      vi.spyOn(s3Service, 'putObject').mockRejectedValue(
        new Error('Write failed')
      );

      await expect(
        techRadarService.updateTechRadarEntries([VALID_ENTRY])
      ).rejects.toThrow('Write failed');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error updating tech radar'),
        { error: 'Write failed' }
      );
    });
  });
});
