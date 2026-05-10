/**
 * New utility functions for demonstration
 * This file will trigger automatic test case generation
 */

/**
 * Calculate the factorial of a number
 * @param {number} n - The number to calculate factorial for
 * @returns {number} The factorial result
 */
function factorial(n) {
  if (n < 0) throw new Error('Factorial is not defined for negative numbers');
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

/**
 * Check if a string is a palindrome
 * @param {string} str - The string to check
 * @returns {boolean} True if palindrome, false otherwise
 */
function isPalindrome(str) {
  if (typeof str !== 'string') throw new Error('Input must be a string');
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanStr === cleanStr.split('').reverse().join('');
}

/**
 * Find the maximum number in an array
 * @param {number[]} arr - Array of numbers
 * @returns {number} The maximum value
 */
function findMax(arr) {
  if (!Array.isArray(arr)) throw new Error('Input must be an array');
  if (arr.length === 0) throw new Error('Array cannot be empty');
  return Math.max(...arr);
}

module.exports = {
  factorial,
  isPalindrome,
  findMax
};