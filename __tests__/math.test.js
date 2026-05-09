/**
 * Sample test file to trigger CodeRabbit automation
 */

const { add, multiply } = require('../app');

describe('Math Operations', () => {
  describe('add', () => {
    test('should add two numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('should handle negative numbers', () => {
      expect(add(-1, 1)).toBe(0);
    });
  });

  describe('multiply', () => {
    test('should multiply two numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    test('should handle zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });
});