import { describe, expect, it } from 'vitest';
import { formatYear } from './formatYear';

describe('formatYear', () => {
  it('formats negative years as BC', () => {
    expect(formatYear(-500)).toBe('500 BC');
  });

  it('keeps non-negative years as-is', () => {
    expect(formatYear(0)).toBe('0');
    expect(formatYear(2024)).toBe('2024');
  });
});
