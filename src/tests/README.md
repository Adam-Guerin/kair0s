# OpenClaw + Pluely Integration Tests

This directory contains comprehensive integration tests for verifying the compatibility and functionality between OpenClaw and Pluely applications.

## 🎯 Test Coverage

### API Integration Tests
- ✅ Service health checks
- ✅ Transcription and chat workflow
- ✅ Provider switching
- ✅ Error handling and recovery
- ✅ Concurrent request handling

### E2E Integration Tests
- ✅ Component communication
- ✅ Command execution
- ✅ Metrics tracking
- ✅ Feedback integration

### Workflow Tests
- ✅ Full meeting workflow
- ✅ Multi-language support
- ✅ Real-time processing simulation

### Performance Tests
- ✅ High-volume request handling
- ✅ Load testing
- ✅ Memory management
- ✅ Resource cleanup

### Error Handling Tests
- ✅ Service unavailability
- ✅ Network timeouts
- ✅ Malformed data handling
- ✅ Concurrent errors

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm package manager
- OpenClaw service (optional for mock tests)
- Pluely service (optional for mock tests)

### Running Tests

#### 1. With Mock Services (Recommended for CI/CD)
```bash
# Run tests with mock implementations
pnpm test:integration:mock

# Or with verbose output
VERBOSE_TESTS=true pnpm test:integration:mock
```

#### 2. With Live Services
```bash
# Start OpenClaw service
cd openclaw
pnpm start

# Start Pluely service (in another terminal)
cd Pluely/pluely
pnpm dev

# Run integration tests
pnpm test:integration:live
```

#### 3. Using Test Runner Script
```bash
# Run with automatic service checks
node scripts/run-integration-tests.mjs

# Skip service checks
SKIP_SERVICE_CHECKS=true node scripts/run-integration-tests.mjs

# Verbose mode
VERBOSE_TESTS=true node scripts/run-integration-tests.mjs
```

## 📁 File Structure

```
kair0s/
├── src/tests/
│   ├── openclaw-pluely-integration.test.ts    # Main integration test file
│   └── setup.integration.test.ts             # Test setup and utilities
├── scripts/
│   └── run-integration-tests.mjs              # Test runner script
├── vitest.integration.config.ts               # Vitest configuration
└── test-results/                             # Test output directory
    └── integration-results.json              # Test results
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_TEST_URL` | `http://localhost:8080` | OpenClaw service URL |
| `PLUELY_TEST_URL` | `http://localhost:3000` | Pluely service URL |
| `VERBOSE_TESTS` | `false` | Enable verbose logging |
| `SKIP_SERVICE_CHECKS` | `false` | Skip service availability checks |
| `USE_MOCK_SERVICES` | `false` | Use mock service implementations |

### Test Configuration

The tests are configured in `vitest.integration.config.ts` with the following settings:

- **Timeout**: 30 seconds per test
- **Retries**: 2 attempts per test
- **Workers**: Up to 4 parallel workers
- **Isolation**: Each test runs in isolated VM fork
- **Coverage**: Disabled by default (can be enabled)

## 🧪 Test Scenarios

### 1. Basic Integration
```typescript
// Tests basic connectivity between services
it('should establish connection between OpenClaw and Pluely', async () => {
  const openclawStatus = await openclawGateway.getStatus();
  const pluelyStatus = await pluelyAPI.getStatus();
  
  expect(openclawStatus.status).toBe('healthy');
  expect(pluelyStatus.status).toBe('healthy');
});
```

### 2. Transcription Workflow
```typescript
// Tests the complete transcription → analysis workflow
it('should handle transcription and chat workflow', async () => {
  // Create transcription in Pluely
  const transcription = await pluelyAPI.createTranscription(audioData);
  
  // Send to OpenClaw for processing
  const response = await openclawGateway.sendChat({
    message: transcription.text,
    context: { source: 'pluely-transcription' }
  });
  
  expect(response.id).toBeDefined();
  expect(response.response).toContain('Response to:');
});
```

### 3. Error Handling
```typescript
// Tests graceful error handling
it('should handle service unavailability', async () => {
  openclawGateway.setStatus('unhealthy');
  
  expect(await openclawGateway.healthCheck()).toBe(false);
  
  // Pluely should still work
  const transcription = await pluelyAPI.createTranscription(audioData);
  expect(transcription.id).toBeDefined();
});
```

## 📊 Test Results

### Sample Output
```
🧪 OpenClaw + Pluely Integration Test Runner
==========================================
OpenClaw URL: http://localhost:8080
Pluely URL: http://localhost:3000
Verbose: false

🔍 Checking service availability...
✅ OpenClaw service is running
⚠️  Pluely service is not available (this is OK for mock tests)

🚀 Running integration tests...

 ✓ src/tests/openclaw-pluely-integration.test.ts (29 tests)
   ✓ API Integration (5 tests)
   ✓ E2E Integration (4 tests)
   ✓ Workflow Tests (3 tests)
   ✓ Performance Tests (3 tests)
   ✓ Error Handling (4 tests)
   ✓ Integration Metrics (1 test)

✅ Integration tests completed successfully
```

### Results Format
Test results are saved in `test-results/integration-results.json` with the following structure:

```json
{
  "numTotalTests": 29,
  "numPassedTests": 29,
  "numFailedTests": 0,
  "numPendingTests": 0,
  "testResults": [
    {
      "title": "API Integration",
      "tests": [...],
      "status": "passed"
    }
  ]
}
```

## 🔍 Debugging

### Common Issues

1. **Service Not Available**
   ```
   ❌ OpenClaw service is not available
   ```
   **Solution**: Start OpenClaw service or use mock tests

2. **Port Conflicts**
   ```
   Error: listen EADDRINUSE :::8080
   ```
   **Solution**: Change port in environment variables or stop conflicting service

3. **Timeout Errors**
   ```
   Test timeout of 30000ms exceeded
   ```
   **Solution**: Increase timeout in config or check service performance

### Debug Mode
```bash
# Enable verbose logging
VERBOSE_TESTS=true pnpm test:integration

# Run single test file
pnpm vitest run src/tests/openclaw-pluely-integration.test.ts --verbose

# Run specific test
pnpm vitest run -t "should establish connection"
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run integration tests
        run: |
          USE_MOCK_SERVICES=true \
          pnpm test:integration:mock
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: integration-results
          path: test-results/
```

## 📈 Performance Benchmarks

The performance tests establish baseline metrics:

| Metric | Target | Actual |
|--------|--------|--------|
| Single request latency | < 250ms | ~100ms |
| Concurrent requests (20) | < 5s | ~2s |
| Memory usage increase | < 20MB | ~5MB |
| Error recovery time | < 1s | ~200ms |

## 🤝 Contributing

### Adding New Tests

1. Create test file in `src/tests/`
2. Follow naming convention: `*.integration.test.ts`
3. Use mock implementations for external dependencies
4. Add proper error handling and cleanup
5. Update this README with new test coverage

### Test Guidelines

- ✅ Use descriptive test names
- ✅ Test both success and failure scenarios
- ✅ Clean up resources in `afterEach`
- ✅ Use appropriate timeouts
- ✅ Mock external services when possible
- ✅ Include performance benchmarks

## 📞 Support

For questions or issues with integration tests:

1. Check the [debugging section](#debugging)
2. Review test logs in `test-results/`
3. Open an issue with test output and environment details
4. Include service versions and configuration

---

**Note**: These tests are designed to work with both mock and live services. For development and CI/CD, use mock services. For production validation, use live services.
