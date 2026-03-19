import { describe, it, expect, jest } from '@jest/globals';
import { escapeRegex, sanitizeInput } from '../../src/utils/sanitize.js';

describe('sanitize utilities', () => {
  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      const input = 'hello.*+?^${}()|[]\\world';
      const result = escapeRegex(input);
      expect(result).toBe('hello\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\world');
    });

    it('should return empty string for null/undefined', () => {
      expect(escapeRegex(null)).toBe('');
      expect(escapeRegex(undefined)).toBe('');
      expect(escapeRegex('')).toBe('');
    });

    it('should return the same string if no special characters', () => {
      expect(escapeRegex('hello world')).toBe('hello world');
    });

    it('should handle non-string input', () => {
      expect(escapeRegex(123)).toBe('');
      expect(escapeRegex({})).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove keys starting with $', () => {
      const input = { name: 'test', $gt: 100 };
      const result = sanitizeInput(input);
      expect(result).toEqual({ name: 'test' });
      expect(result.$gt).toBeUndefined();
    });

    it('should remove keys containing dots', () => {
      const input = { name: 'test', 'some.nested': 'value' };
      const result = sanitizeInput(input);
      expect(result['some.nested']).toBeUndefined();
    });

    it('should sanitize nested objects', () => {
      const input = { query: { $where: 'malicious', name: 'ok' } };
      const result = sanitizeInput(input);
      expect(result.query.$where).toBeUndefined();
      expect(result.query.name).toBe('ok');
    });

    it('should return primitives unchanged', () => {
      expect(sanitizeInput('hello')).toBe('hello');
      expect(sanitizeInput(42)).toBe(42);
      expect(sanitizeInput(null)).toBe(null);
    });
  });
});
