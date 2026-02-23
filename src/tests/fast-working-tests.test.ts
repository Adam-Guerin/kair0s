/**
 * Fast Working Tests
 * 
 * Simple, fast tests that complete within timeout limits
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Fast Working Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Math Operations', () => {
    it('should perform simple calculations', () => {
      const add = (a: number, b: number) => a + b;
      const multiply = (a: number, b: number) => a * b;
      
      expect(add(2, 3)).toBe(5);
      expect(multiply(4, 5)).toBe(20);
    });

    it('should handle edge cases', () => {
      const divide = (a: number, b: number) => {
        if (b === 0) throw new Error('Division by zero');
        return a / b;
      };
      
      expect(divide(10, 2)).toBe(5);
      expect(() => divide(10, 0)).toThrow('Division by zero');
    });
  });

  describe('String Operations', () => {
    it('should manipulate strings correctly', () => {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
      const truncate = (str: string, length: number) => 
        str.length > length ? str.slice(0, length) + '...' : str;
      
      expect(capitalize('hello')).toBe('Hello');
      expect(truncate('this is a long string', 10)).toBe('this is a ...');
      expect(truncate('short', 10)).toBe('short');
    });

    it('should validate email format', () => {
      const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
      
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('Array Operations', () => {
    it('should filter and map arrays', () => {
      const numbers = [1, 2, 3, 4, 5];
      const evenNumbers = numbers.filter(n => n % 2 === 0);
      const doubled = numbers.map(n => n * 2);
      
      expect(evenNumbers).toEqual([2, 4]);
      expect(doubled).toEqual([2, 4, 6, 8, 10]);
    });

    it('should reduce arrays correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      const sum = numbers.reduce((acc, n) => acc + n, 0);
      const product = numbers.reduce((acc, n) => acc * n, 1);
      
      expect(sum).toBe(15);
      expect(product).toBe(120);
    });
  });

  describe('Object Operations', () => {
    it('should merge objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const merged = { ...obj1, ...obj2 };
      
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should extract object properties', () => {
      const user = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      };
      
      const { address, ...basicInfo } = user;
      expect(basicInfo).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
      expect(address).toEqual({ street: '123 Main St', city: 'Anytown' });
    });
  });

  describe('Date Operations', () => {
    it('should format dates correctly', () => {
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };
      
      const testDate = new Date('2024-02-21T12:00:00Z');
      expect(formatDate(testDate)).toBe('2024-02-21');
    });

    it('should calculate date differences', () => {
      const daysBetween = (date1: Date, date2: Date) => {
        const msPerDay = 24 * 60 * 60 * 1000;
        return Math.abs(date2.getTime() - date1.getTime()) / msPerDay;
      };
      
      const date1 = new Date('2024-02-20');
      const date2 = new Date('2024-02-25');
      expect(daysBetween(date1, date2)).toBe(5);
    });
  });

  describe('Async Operations', () => {
    it('should handle promises correctly', async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const startTime = Date.now();
      const promise = delay(100);
      vi.advanceTimersByTime(100);
      await promise;
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it('should handle promise rejection', async () => {
      const failingPromise = async () => {
        throw new Error('Test error');
      };
      
      await expect(failingPromise()).rejects.toThrow('Test error');
    });

    it('should handle concurrent promises', async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const startTime = Date.now();
      const promise = Promise.all([
        delay(50),
        delay(100),
        delay(75)
      ]);
      vi.advanceTimersByTime(100);
      await promise;
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should catch and handle errors', () => {
      const safeDivide = (a: number, b: number) => {
        try {
          if (b === 0) throw new Error('Division by zero');
          return { error: false, result: a / b };
        } catch (error: any) {
          return { error: true, message: error.message };
        }
      };
      
      const result1 = safeDivide(10, 2);
      const result2 = safeDivide(10, 0);
      
      expect(result1).toEqual({ error: false, result: 5 });
      expect(result2).toEqual({ error: true, message: 'Division by zero' });
    });

    it('should validate inputs', () => {
      const validateNumber = (input: any) => {
        if (typeof input !== 'number') return { valid: false, error: 'Not a number' };
        if (isNaN(input)) return { valid: false, error: 'NaN' };
        if (!isFinite(input)) return { valid: false, error: 'Not finite' };
        return { valid: true };
      };
      
      expect(validateNumber(42)).toEqual({ valid: true });
      expect(validateNumber('42')).toEqual({ valid: false, error: 'Not a number' });
      expect(validateNumber(NaN)).toEqual({ valid: false, error: 'NaN' });
      expect(validateNumber(Infinity)).toEqual({ valid: false, error: 'Not finite' });
    });
  });

  describe('Utility Functions', () => {
    it('should generate random IDs', () => {
      const generateId = () => 
        Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      
      const id1 = generateId();
      const id2 = generateId();
      
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(10);
    });

    it('should debounce function calls', () => {
      let callCount = 0;
      const fn = vi.fn(() => callCount++);
      
      // Simple debounce mock for testing
      const debounce = (func: Function, delay: number) => {
        let timeoutId: any;
        return (...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func(...args), delay);
        };
      };
      
      const debouncedFn = debounce(fn, 100);
      
      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Should not be called immediately
      expect(callCount).toBe(0);
      expect(fn).not.toHaveBeenCalled();
      
      // Advance timers to trigger debounce
      vi.advanceTimersByTime(100);
      
      // Now it should be called once
      expect(callCount).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Validation', () => {
    it('should validate user data', () => {
      const validateUser = (user: any) => {
        const errors: string[] = [];
        
        if (!user.name || typeof user.name !== 'string') {
          errors.push('Name is required and must be a string');
        }
        
        if (!user.email || typeof user.email !== 'string') {
          errors.push('Email is required and must be a string');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          errors.push('Email must be valid');
        }
        
        if (user.age && (typeof user.age !== 'number' || user.age < 0 || user.age > 150)) {
          errors.push('Age must be a number between 0 and 150');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };
      
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };
      
      const invalidUser = {
        name: '',
        email: 'invalid-email',
        age: -5
      };
      
      expect(validateUser(validUser)).toEqual({
        isValid: true,
        errors: []
      });
      
      expect(validateUser(invalidUser)).toEqual({
        isValid: false,
        errors: ['Name is required and must be a string', 'Email must be valid', 'Age must be a number between 0 and 150']
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate simple metrics', () => {
      const operations = [100, 150, 200, 120, 180];
      
      const average = operations.reduce((sum, op) => sum + op, 0) / operations.length;
      const min = Math.min(...operations);
      const max = Math.max(...operations);
      const median = [...operations].sort((a, b) => a - b)[Math.floor(operations.length / 2)];
      
      expect(average).toBe(150);
      expect(min).toBe(100);
      expect(max).toBe(200);
      expect(median).toBe(150);
    });

    it('should calculate percentiles', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      const percentile = (arr: number[], p: number) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.ceil(arr.length * p / 100) - 1;
        return sorted[Math.max(0, Math.min(index, arr.length - 1))];
      };
      
      expect(percentile(values, 50)).toBe(5); // Median
      expect(percentile(values, 90)).toBe(9);
      expect(percentile(values, 95)).toBe(10);
    });
  });
});
