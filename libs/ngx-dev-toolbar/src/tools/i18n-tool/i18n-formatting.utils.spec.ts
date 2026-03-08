import {
  formatNumber,
  formatDate,
  formatTime,
  formatCurrency,
  pseudoLocalize,
  expandText,
} from './i18n-formatting.utils';

describe('i18n formatting utilities', () => {
  describe('formatNumber', () => {
    it('should format a number for en-US locale', () => {
      const result = formatNumber('en-US', 1234.56);

      expect(result).toBeTruthy();
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format a number for de-DE locale', () => {
      const result = formatNumber('de-DE', 1234.56);

      expect(result).toBeTruthy();
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format a number for ja-JP locale', () => {
      const result = formatNumber('ja-JP', 1234567);

      expect(result).toBeTruthy();
      expect(result).toContain('1');
    });

    it('should format zero', () => {
      const result = formatNumber('en-US', 0);

      expect(result).toBe('0');
    });

    it('should format negative numbers', () => {
      const result = formatNumber('en-US', -42);

      expect(result).toBeTruthy();
      expect(result).toContain('42');
    });

    it('should fall back to String() for invalid locale', () => {
      const result = formatNumber('not-a-locale!!!', 123);

      expect(result).toBeTruthy();
      expect(result).toContain('123');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2025-06-15T12:00:00Z');

    it('should format a date for en-US locale', () => {
      const result = formatDate('en-US', 'UTC', testDate);

      expect(result).toBeTruthy();
      expect(result).toContain('2025');
      expect(result).toContain('06');
      expect(result).toContain('15');
    });

    it('should format a date for de-DE locale', () => {
      const result = formatDate('de-DE', 'UTC', testDate);

      expect(result).toBeTruthy();
      expect(result).toContain('2025');
      expect(result).toContain('15');
    });

    it('should format a date for ja-JP locale', () => {
      const result = formatDate('ja-JP', 'UTC', testDate);

      expect(result).toBeTruthy();
      expect(result).toContain('2025');
    });

    it('should respect timezone parameter', () => {
      const result = formatDate('en-US', 'America/New_York', testDate);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should fall back gracefully for invalid locale', () => {
      const result = formatDate('not-valid!!!', 'UTC', testDate);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2025-06-15T14:30:45Z');

    it('should format time for en-US locale in UTC', () => {
      const result = formatTime('en-US', 'UTC', testDate);

      expect(result).toBeTruthy();
      expect(result).toContain('30');
      expect(result).toContain('45');
    });

    it('should format time for de-DE locale', () => {
      const result = formatTime('de-DE', 'UTC', testDate);

      expect(result).toBeTruthy();
      expect(result).toContain('30');
    });

    it('should format time for ja-JP locale', () => {
      const result = formatTime('ja-JP', 'Asia/Tokyo', testDate);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include timezone name', () => {
      const result = formatTime('en-US', 'UTC', testDate);

      expect(result).toBeTruthy();
      // The timeZoneName: 'short' option should produce a timezone abbreviation
      expect(result).toMatch(/[A-Z]/);
    });

    it('should fall back gracefully for invalid locale', () => {
      const result = formatTime('not-valid!!!', 'UTC', testDate);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency for en-US locale', () => {
      const result = formatCurrency('en-US', 'USD', 1234.56);

      expect(result).toBeTruthy();
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format EUR currency for de-DE locale', () => {
      const result = formatCurrency('de-DE', 'EUR', 1234.56);

      expect(result).toBeTruthy();
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format JPY currency (no decimal places)', () => {
      const result = formatCurrency('ja-JP', 'JPY', 1234);

      expect(result).toBeTruthy();
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format zero amount', () => {
      const result = formatCurrency('en-US', 'USD', 0);

      expect(result).toBeTruthy();
      expect(result).toContain('0');
    });

    it('should fall back gracefully for invalid locale', () => {
      const result = formatCurrency('not-valid!!!', 'USD', 100);

      expect(result).toBeTruthy();
      expect(result).toContain('100');
    });
  });

  describe('pseudoLocalize', () => {
    it('should wrap text in brackets with zero-width spaces', () => {
      const result = pseudoLocalize('Hello');

      expect(result.startsWith('[')).toBe(true);
      expect(result.endsWith(']')).toBe(true);
    });

    it('should replace ASCII letters with accented characters', () => {
      const result = pseudoLocalize('Hello');

      // Should not contain the original ASCII letters
      expect(result).not.toContain('H');
      expect(result).not.toContain('e');
      expect(result).not.toContain('l');
      expect(result).not.toContain('o');
    });

    it('should preserve non-letter characters', () => {
      const result = pseudoLocalize('Hi 123!');

      expect(result).toContain(' ');
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
      expect(result).toContain('!');
    });

    it('should handle empty string', () => {
      const result = pseudoLocalize('');

      expect(result).toContain('[');
      expect(result).toContain(']');
    });

    it('should apply accents to both upper and lower case', () => {
      const lower = pseudoLocalize('a');
      const upper = pseudoLocalize('A');

      // Both should be transformed (not contain original)
      expect(lower).not.toMatch(/\ba\b/);
      expect(upper).not.toContain('A');
      // They should produce different accented characters
      expect(lower).not.toBe(upper);
    });

    it('should contain zero-width spaces inside brackets', () => {
      const result = pseudoLocalize('test');

      // Zero-width space (U+200B) should be present
      expect(result).toContain('\u200B');
    });
  });

  describe('expandText', () => {
    it('should expand text by approximately 35% by default', () => {
      const input = 'Hello World';
      const result = expandText(input);

      const expectedMinLength = Math.ceil(input.length * 1.35);
      expect(result.length).toBeGreaterThanOrEqual(expectedMinLength);
    });

    it('should start with the original characters', () => {
      const result = expandText('Hi');

      expect(result[0]).toBe('H');
      expect(result[1]).toBe('i');
    });

    it('should expand vowels by duplicating them', () => {
      const input = 'aeiou test';
      const result = expandText(input);

      // At least some vowels should be duplicated as lowercase
      expect(result).toContain('aa');
      // The result should be longer than the input
      expect(result.length).toBeGreaterThan(input.length);
    });

    it('should use tilde padding when vowel duplication is insufficient', () => {
      const input = 'xyz'; // no vowels
      const result = expandText(input);

      expect(result).toContain('~');
    });

    it('should accept a custom expansion factor', () => {
      const input = 'Hello';
      const result = expandText(input, 0.5);

      const expectedMinLength = Math.ceil(input.length * 1.5);
      expect(result.length).toBeGreaterThanOrEqual(expectedMinLength);
    });

    it('should handle empty string', () => {
      const result = expandText('');

      expect(result).toBe('');
    });

    it('should handle text with uppercase vowels', () => {
      const input = 'AEIOU TEST';
      const result = expandText(input);

      // Uppercase vowels should be duplicated as lowercase
      expect(result).toContain('Aa');
      // The result should be longer than the input
      expect(result.length).toBeGreaterThan(input.length);
    });
  });
});
