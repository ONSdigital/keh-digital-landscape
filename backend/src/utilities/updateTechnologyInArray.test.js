import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { updateTechnologyInArray } = require('./updateTechnologyInArray');

describe('updateTechnologyInArray', () => {
  it('returns unchanged result when array is undefined', () => {
    const result = updateTechnologyInArray(undefined, 'React', 'Vue');

    expect(result).toEqual({ array: undefined, updated: false });
  });

  it('updates matching technology name', () => {
    const input = ['React', 'Node.js'];

    const result = updateTechnologyInArray(input, 'React', 'Vue');

    expect(result).toEqual({ array: ['Vue', 'Node.js'], updated: true });
    expect(input).toEqual(['React', 'Node.js']);
  });

  it('returns unchanged array when item does not exist', () => {
    const input = ['React', 'Node.js'];

    const result = updateTechnologyInArray(input, 'Angular', 'Vue');

    expect(result).toEqual({ array: input, updated: false });
  });
});
