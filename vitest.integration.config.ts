/**
 * OpenClaw + Pluely Integration Test Configuration
 * 
 * Configuration for running integration tests between OpenClaw and Pluely
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/tests/openclaw-pluely-integration.test.ts',
      'src/tests/**/*integration*.test.ts'
    ],
    exclude: [
      'node_modules',
      'dist',
      '**/*.d.ts'
    ],
    timeout: 60000,
    retry: 2,
    testTimeout: 30000,
    hookTimeout: 10000,
    maxWorkers: 4,
    minWorkers: 1,
    watch: false,
    bail: 5,
    isolate: true,
    pool: 'vmForks',
    poolOptions: {
      vmForks: {
        isolate: true,
        singleThread: false
      }
    },
    env: {
      OPENCLAW_TEST_URL: process.env.OPENCLAW_TEST_URL || 'http://localhost:8080',
      PLUELY_TEST_URL: process.env.PLUELY_TEST_URL || 'http://localhost:3000',
      NODE_ENV: 'test'
    },
    setupFiles: [
      'src/tests/setup.integration.test.ts'
    ],
    coverage: {
      enabled: false,
      provider: 'v8',
      reports: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: 'test-results/integration-test-results.json'
    }
  }
});
