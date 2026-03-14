import { describe, expect, it } from 'vitest';
import { normalizeCards } from './normalizeCards';

describe('normalizeCards', () => {
  it('accepts valid cards and maps optional fields', () => {
    const result = normalizeCards([
      {
        id: 'a',
        title: 'Alpha',
        year: 1900,
        details: 'desc',
        image: 'img',
        category: 'science',
      },
    ]);

    expect(result).toEqual([
      {
        id: 'a',
        title: 'Alpha',
        year: 1900,
        description: 'desc',
        imageUrl: 'img',
        category: 'science',
      },
    ]);
  });

  it('drops malformed entries safely', () => {
    const result = normalizeCards([
      { id: 'a', title: 'Alpha', year: 1900 },
      { id: '', title: 'Nope', year: 1910 },
      { id: 'b', title: '', year: 1910 },
      { id: 'c', title: 'BadYear', year: '1910' },
      null,
      'bad',
      { id: 'a', title: 'Duplicate', year: 2000 },
    ] as unknown[]);

    expect(result).toEqual([{ id: 'a', title: 'Alpha', year: 1900, description: undefined, imageUrl: undefined, category: undefined }]);
  });
});
