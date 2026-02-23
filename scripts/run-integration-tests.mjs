/**
 * OpenClaw + Pluely Integration Test Runner
 * 
 * Simple test runner for integration tests
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const TEST_CONFIG = {
  openclawUrl: process.env.OPENCLAW_TEST_URL || 'http://localhost:8080',
  pluelyUrl: process.env.PLUELY_TEST_URL || 'http://localhost:3000',
  verbose: process.env.VERBOSE_TESTS === 'true',
  retries: 2,
  timeout: 30000
};

console.log('🧪 OpenClaw + Pluely Integration Test Runner');
console.log('==========================================');
console.log(`OpenClaw URL: ${TEST_CONFIG.openclawUrl}`);
console.log(`Pluely URL: ${TEST_CONFIG.pluelyUrl}`);
console.log(`Verbose: ${TEST_CONFIG.verbose}`);
console.log('');

// Check if services are running
async function checkServices() {
  console.log('🔍 Checking service availability...');
  
  try {
    const openclawResponse = await fetch(`${TEST_CONFIG.openclawUrl}/api/v1/status`);
    if (openclawResponse.ok) {
      console.log('✅ OpenClaw service is running');
    } else {
      console.log('❌ OpenClaw service is not responding correctly');
      return false;
    }
  } catch (error) {
    console.log('❌ OpenClaw service is not available');
    console.log(`   Please start OpenClaw on ${TEST_CONFIG.openclawUrl}`);
    return false;
  }

  try {
    const pluelyResponse = await fetch(`${TEST_CONFIG.pluelyUrl}/api/health`);
    if (pluelyResponse.ok) {
      console.log('✅ Pluely service is running');
    } else {
      console.log('⚠️  Pluely service might not be fully ready (this is OK for mock tests)');
    }
  } catch (error) {
    console.log('⚠️  Pluely service is not available (this is OK for mock tests)');
    console.log(`   For full integration tests, start Pluely on ${TEST_CONFIG.pluelyUrl}`);
  }

  return true;
}

// Run integration tests
async function runTests() {
  console.log('🚀 Running integration tests...');
  console.log('');

  const testCommand = `pnpm vitest run --config vitest.integration.config.ts ${
    TEST_CONFIG.verbose ? '--verbose' : ''
  } --reporter=verbose --reporter=json --outputFile=test-results/integration-results.json`;

  try {
    execSync(testCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        OPENCLAW_TEST_URL: TEST_CONFIG.openclawUrl,
        PLUELY_TEST_URL: TEST_CONFIG.pluelyUrl,
        VERBOSE_TESTS: TEST_CONFIG.verbose ? 'true' : 'false'
      }
    });

    console.log('');
    console.log('✅ Integration tests completed successfully');
  } catch (error) {
    console.log('');
    console.log('❌ Integration tests failed');
    process.exit(1);
  }
}

// Main execution
async function main() {
  const servicesOk = await checkServices();
  
  if (!servicesOk) {
    console.log('');
    console.log('💡 To run tests with mock services, set USE_MOCK_SERVICES=true');
    console.log('💡 To skip service checks, set SKIP_SERVICE_CHECKS=true');
    
    if (process.env.SKIP_SERVICE_CHECKS !== 'true') {
      process.exit(1);
    }
  }

  await runTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
