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

const addressBookService = require('./addressBookService');
const s3Service = require('./s3Service');
const logger = require('../config/logger');

// S3 returns [emailKey, usernameKey, IDKey] in that order (Promise.all)
function setupS3Mocks(
  emailKey = { 'john.smith@ons.gov.uk': 'jsmith' },
  usernameKey = { jsmith: 'john.smith@ons.gov.uk' },
  idKey = { jsmith: 'u123' }
) {
  vi.spyOn(s3Service, 'getObject')
    .mockResolvedValueOnce(emailKey)
    .mockResolvedValueOnce(usernameKey)
    .mockResolvedValueOnce(idKey);
}

describe('AddressBookService', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normaliseMap', () => {
    it('lowercases all keys while preserving values', () => {
      const result = addressBookService.normaliseMap({
        'John.Smith@ons.gov.uk': 'jsmith',
        'JANE.DOE@ons.gov.uk': 'jdoe',
      });
      expect(result).toEqual({
        'john.smith@ons.gov.uk': 'jsmith',
        'jane.doe@ons.gov.uk': 'jdoe',
      });
    });

    it('returns empty object for null or undefined input', () => {
      expect(addressBookService.normaliseMap(null)).toEqual({});
      expect(addressBookService.normaliseMap(undefined)).toEqual({});
    });

    it('returns empty object for empty input', () => {
      expect(addressBookService.normaliseMap({})).toEqual({});
    });
  });

  describe('getAvatarLink', () => {
    it('returns GitHub avatar URL for a valid accountID', () => {
      expect(addressBookService.getAvatarLink('98765')).toBe(
        'https://avatars.githubusercontent.com/u/98765'
      );
    });

    it('returns null for falsy accountID', () => {
      expect(addressBookService.getAvatarLink(null)).toBeNull();
      expect(addressBookService.getAvatarLink('')).toBeNull();
    });
  });

  describe('getGitHubLink', () => {
    it('returns GitHub profile URL for a valid username', () => {
      expect(addressBookService.getGitHubLink('jsmith')).toBe(
        'https://github.com/jsmith'
      );
    });

    it('returns null for falsy username', () => {
      expect(addressBookService.getGitHubLink(null)).toBeNull();
      expect(addressBookService.getGitHubLink('')).toBeNull();
    });
  });

  describe('getNameByEmail', () => {
    it('derives display name from ONS email', () => {
      expect(addressBookService.getNameByEmail('john.smith@ons.gov.uk')).toBe(
        'john smith'
      );
    });

    it('uses only the first two parts of the local portion', () => {
      expect(
        addressBookService.getNameByEmail('john.william.smith@ons.gov.uk')
      ).toBe('john william');
    });

    it('returns null for falsy email', () => {
      expect(addressBookService.getNameByEmail(null)).toBeNull();
      expect(addressBookService.getNameByEmail('')).toBeNull();
    });
  });

  describe('getAddressBookData', () => {
    it('fetches all three maps from S3 and normalises their keys', async () => {
      setupS3Mocks();

      const result = await addressBookService.getAddressBookData();

      expect(result.emailToUsernameData).toEqual({
        'john.smith@ons.gov.uk': 'jsmith',
      });
      expect(result.usernameToEmailData).toEqual({
        jsmith: 'john.smith@ons.gov.uk',
      });
      expect(result.usernameToIDData).toEqual({ jsmith: 'u123' });
      expect(logger.info).toHaveBeenCalledWith(
        'Successfully fetched address book data'
      );
    });

    it('logs and rethrows when S3 fails', async () => {
      vi.spyOn(s3Service, 'getObject').mockRejectedValue(
        new Error('S3 unavailable')
      );

      await expect(addressBookService.getAddressBookData()).rejects.toThrow(
        'S3 unavailable'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching address book data',
        { error: 'S3 unavailable' }
      );
    });
  });

  describe('filterAddressBookData', () => {
    it('resolves a username to its email and account ID', async () => {
      setupS3Mocks();
      const result =
        await addressBookService.filterAddressBookData(['jsmith']);
      expect(result).toEqual([['jsmith', 'john.smith@ons.gov.uk', 'u123']]);
    });

    it('resolves an email to its username and account ID', async () => {
      setupS3Mocks();
      const result = await addressBookService.filterAddressBookData([
        'john.smith@ons.gov.uk',
      ]);
      expect(result).toEqual([
        ['jsmith', 'john.smith@ons.gov.uk', 'u123'],
      ]);
    });

    it('returns undefined counterparts for an unknown username', async () => {
      setupS3Mocks();
      const result =
        await addressBookService.filterAddressBookData(['ghost']);
      expect(result).toEqual([['ghost', undefined, undefined]]);
    });

    it('falls back to the raw email when no matching username exists', async () => {
      setupS3Mocks({}, {}, {});
      const result = await addressBookService.filterAddressBookData([
        'unknown@ons.gov.uk',
      ]);
      // emailToUsername has no entry → username undefined, canonicalEmail = raw.toLowerCase()
      expect(result).toEqual([[undefined, 'unknown@ons.gov.uk', undefined]]);
    });
  });

  describe('formatAddressBookData', () => {
    it('returns empty array and warns when no input provided', async () => {
      const result = await addressBookService.formatAddressBookData([]);
      expect(result).toEqual([]);
      expect(logger.warn).toHaveBeenCalledWith(
        'No inputs were given to Address Book Service'
      );
    });

    it('returns formatted user info for a known username', async () => {
      setupS3Mocks();
      const result =
        await addressBookService.formatAddressBookData(['jsmith']);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        username: 'jsmith',
        email: 'john.smith@ons.gov.uk',
        accountID: 'u123',
        url: 'https://github.com/jsmith',
        avatarUrl: 'https://avatars.githubusercontent.com/u/u123',
        fullname: 'john smith',
      });
    });

    it('deduplicates entries with the same username', async () => {
      setupS3Mocks();
      const result = await addressBookService.formatAddressBookData([
        'jsmith',
        'jsmith',
      ]);
      expect(result).toHaveLength(1);
    });

    it('excludes entries where required fields are missing', async () => {
      // Empty maps → all lookups return undefined
      setupS3Mocks({}, {}, {});
      const result =
        await addressBookService.formatAddressBookData(['ghost']);
      expect(result).toHaveLength(0);
    });
  });
});
