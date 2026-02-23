/**
 * Integration Test Setup
 * 
 * Setup file for OpenClaw + Pluely integration tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(async () => {
  console.log('🚀 Starting OpenClaw + Pluely Integration Tests');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.OPENCLAW_TEST_URL = process.env.OPENCLAW_TEST_URL || 'http://localhost:8080';
  process.env.PLUELY_TEST_URL = process.env.PLUELY_TEST_URL || 'http://localhost:3000';
  
  // Mock console methods to reduce noise during tests
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    log: (...args: any[]) => {
      if (process.env.VERBOSE_TESTS === 'true') {
        originalConsole.log(...args);
      }
    },
    info: (...args: any[]) => {
      if (process.env.VERBOSE_TESTS === 'true') {
        originalConsole.info(...args);
      }
    },
    warn: originalConsole.warn,
    error: originalConsole.error
  };
});

afterAll(async () => {
  console.log('✅ OpenClaw + Pluely Integration Tests Completed');
  
  // Restore console methods
  const originalConsole = global.console as any;
  if (originalConsole._original) {
    global.console = originalConsole._original;
  }
});

beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Cleanup after each test
});

// Mock global APIs that might not be available in test environment
if (!global.fetch) {
  global.fetch = async (url: string, options?: any) => {
    return {
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
      headers: new Map()
    } as Response;
  };
}

// Mock Web Audio API if needed
if (!global.AudioContext) {
  global.AudioContext = class MockAudioContext {
    createMediaStreamSource() {
      return {
        connect: () => {},
        disconnect: () => {}
      };
    }
    createScriptProcessor() {
      return {
        connect: () => {},
        disconnect: () => {},
        onaudioprocess: null
      };
    }
  } as any;
}

// Mock crypto API for Node.js environment
if (!global.crypto) {
  global.crypto = {
    randomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      digest: async () => new ArrayBuffer(32),
      importKey: async () => ({}) as any,
      sign: async () => new ArrayBuffer(32),
      encrypt: async () => new ArrayBuffer(32),
      decrypt: async () => new ArrayBuffer(32)
    }
  } as any;
}

// Mock performance API
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => []
  } as any;
}

// Export test utilities
export const testUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  generateMockData: (size: number) => {
    const buffer = new ArrayBuffer(size);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < size; i++) {
      view[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
  },
  createMockEvent: (type: string, detail?: any) => {
    return new CustomEvent(type, { detail });
  }
};
