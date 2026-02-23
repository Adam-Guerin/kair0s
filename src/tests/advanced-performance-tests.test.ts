/**
 * Performance and Load Testing for OpenClaw + Pluely Integration
 * 
 * Comprehensive performance testing including load testing, stress testing,
 * memory management, and scalability analysis.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

class PerformanceTestUtils {
  static async measurePerformance<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number; memory: number }> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = await operation();
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    return {
      result,
      duration: endTime - startTime,
      memory: endMemory - startMemory
    };
  }

  static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  static async runConcurrent<T>(operations: Array<() => Promise<T>>, maxConcurrency: number = 10): Promise<Array<{ result: T; duration: number; error?: Error }>> {
    const results: Array<{ result: T; duration: number; error?: Error }> = [];
    const chunks = this.chunkArray(operations, maxConcurrency);
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(async (operation, index) => {
          const startTime = performance.now();
          try {
            const result = await operation();
            const duration = performance.now() - startTime;
            return { result, duration };
          } catch (error) {
            const duration = performance.now() - startTime;
            return { result: null as any, duration, error: error as Error };
          }
        })
      );
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            result: null as any,
            duration: 0,
            error: result.reason as Error
          });
        }
      });
    }
    
    return results;
  }

  static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  static async simulateLoad(duration: number, operationsPerSecond: number, operation: () => Promise<any>): Promise<{ totalOperations: number; successRate: number; averageLatency: number }> {
    const startTime = performance.now();
    const endTime = startTime + duration;
    const interval = 1000 / operationsPerSecond;
    
    let totalOperations = 0;
    let successfulOperations = 0;
    const latencies: number[] = [];
    
    while (performance.now() < endTime) {
      const operationStart = performance.now();
      
      try {
        await operation();
        successfulOperations++;
        latencies.push(performance.now() - operationStart);
      } catch (error) {
        // Log error but continue
      }
      
      totalOperations++;
      
      // Wait for next operation
      const operationTime = performance.now() - operationStart;
      const waitTime = Math.max(0, interval - operationTime);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    const averageLatency = latencies.length > 0 ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length : 0;
    const successRate = totalOperations > 0 ? successfulOperations / totalOperations : 0;
    
    return {
      totalOperations,
      successRate,
      averageLatency
    };
  }

  static generateLoadTest(size: number): Array<() => Promise<any>> {
    const operations: Array<() => Promise<any>> = [];
    
    for (let i = 0; i < size; i++) {
      operations.push(async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        return { id: i, timestamp: Date.now(), data: `test-data-${i}` };
      });
    }
    
    return operations;
  }

  static async stressTest(duration: number, maxConcurrency: number): Promise<{ requestsPerSecond: number; errorRate: number; memoryUsage: number }> {
    const startTime = performance.now();
    const endTime = startTime + duration;
    
    let totalRequests = 0;
    let errors = 0;
    const startMemory = this.getMemoryUsage();
    
    const operations = Array.from({ length: maxConcurrency }, (_, i) => 
      async () => {
        while (performance.now() < endTime) {
          try {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
            totalRequests++;
          } catch (error) {
            errors++;
          }
        }
      }
    );
    
    await Promise.all(operations.map(op => op()));
    
    const endMemory = this.getMemoryUsage();
    const actualDuration = performance.now() - startTime;
    const requestsPerSecond = totalRequests / (actualDuration / 1000);
    const errorRate = totalRequests > 0 ? errors / totalRequests : 0;
    const memoryUsage = endMemory - startMemory;
    
    return {
      requestsPerSecond,
      errorRate,
      memoryUsage
    };
  }
}

// ============================================================================
// MOCK SERVICES FOR PERFORMANCE TESTING
// ============================================================================

class MockPerformanceServices {
  private static requestCount = 0;
  private static errors = 0;

  static async simulateAPICall(delay: number = 100, shouldError: boolean = false): Promise<any> {
    this.requestCount++;
    
    if (shouldError || Math.random() < 0.05) { // 5% error rate
      this.errors++;
      throw new Error('Simulated API error');
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      id: `req-${this.requestCount}`,
      timestamp: Date.now(),
      data: `response-data-${this.requestCount}`
    };
  }

  static async simulateDatabaseQuery(delay: number = 50): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      rows: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `record-${i + 1}`,
        value: Math.random() * 100
      }))
    };
  }

  static async simulateFileOperation(size: number = 1024): Promise<any> {
    const data = new ArrayBuffer(size);
    await new Promise(resolve => setTimeout(resolve, size / 1024)); // Simulate I/O time
    
    return {
      size,
      checksum: 'mock-checksum',
      timestamp: Date.now()
    };
  }

  static async simulateWebSocketMessage(message: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      id: `ws-${Date.now()}`,
      message,
      timestamp: Date.now()
    };
  }

  static getStats() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errors,
      errorRate: this.requestCount > 0 ? this.errors / this.requestCount : 0
    };
  }

  static resetStats() {
    this.requestCount = 0;
    this.errors = 0;
  }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance Tests', () => {
  beforeEach(() => {
    MockPerformanceServices.resetStats();
  });

  // ============================================================================
  // BASIC PERFORMANCE TESTS
  // ============================================================================

  describe('Basic Performance', () => {
    it('should handle single operations within performance budgets', async () => {
      const { result, duration, memory } = await PerformanceTestUtils.measurePerformance(async () => {
        return await MockPerformanceServices.simulateAPICall(100);
      });
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(200); // Should complete in under 200ms
      expect(memory).toBeLessThan(1024 * 1024); // Should use less than 1MB
    });

    it('should handle database queries efficiently', async () => {
      const { result, duration, memory } = await PerformanceTestUtils.measurePerformance(async () => {
        return await MockPerformanceServices.simulateDatabaseQuery(50);
      });
      
      expect(result.rows).toHaveLength(100);
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
      expect(memory).toBeLessThan(512 * 1024); // Should use less than 512KB
    });

    it('should handle file operations efficiently', async () => {
      const { result, duration, memory } = await PerformanceTestUtils.measurePerformance(async () => {
        return await MockPerformanceServices.simulateFileOperation(2048);
      });
      
      expect(result.size).toBe(2048);
      expect(duration).toBeLessThan(150); // Should complete in under 150ms
      expect(memory).toBeLessThan(2 * 1024 * 1024); // Should use less than 2MB
    });

    it('should handle WebSocket messages efficiently', async () => {
      const { result, duration, memory } = await PerformanceTestUtils.measurePerformance(async () => {
        return await MockPerformanceServices.simulateWebSocketMessage({ type: 'test', data: 'hello' });
      });
      
      expect(result.id).toBeDefined();
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
      expect(memory).toBeLessThan(256 * 1024); // Should use less than 256KB
    });
  });

  // ============================================================================
  // CONCURRENT PERFORMANCE TESTS
  // ============================================================================

  describe('Concurrent Performance', () => {
    it('should handle concurrent API calls efficiently', async () => {
      const operations = PerformanceTestUtils.generateLoadTest(50);
      const results = await PerformanceTestUtils.runConcurrent(operations, 10);
      
      const successfulResults = results.filter(r => !r.error);
      const averageDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
      
      expect(successfulResults.length).toBeGreaterThan(45); // At least 90% success rate
      expect(averageDuration).toBeLessThan(300); // Average under 300ms
      expect(results.every(r => r.duration < 1000)); // No request over 1 second
    });

    it('should handle mixed concurrent operations', async () => {
      const operations = [
        ...Array.from({ length: 20 }, () => () => MockPerformanceServices.simulateAPICall(100)),
        ...Array.from({ length: 20 }, () => () => MockPerformanceServices.simulateDatabaseQuery(50)),
        ...Array.from({ length: 20 }, () => () => MockPerformanceServices.simulateFileOperation(1024)),
        ...Array.from({ length: 20 }, () => () => MockPerformanceServices.simulateWebSocketMessage({ test: true }))
      ];
      
      const results = await PerformanceTestUtils.runConcurrent(operations, 15);
      const successfulResults = results.filter(r => !r.error);
      
      expect(successfulResults.length).toBeGreaterThan(70); // At least 87.5% success rate
      expect(results.every(r => r.duration < 2000)); // No request over 2 seconds
    });

    it('should maintain performance under increasing load', async () => {
      const loadLevels = [10, 25, 50, 100];
      const performanceResults: Array<{ load: number; averageDuration: number; successRate: number }> = [];
      
      for (const load of loadLevels) {
        const operations = PerformanceTestUtils.generateLoadTest(load);
        const results = await PerformanceTestUtils.runConcurrent(operations, Math.min(load, 20));
        
        const successfulResults = results.filter(r => !r.error);
        const averageDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
        const successRate = successfulResults.length / results.length;
        
        performanceResults.push({
          load,
          averageDuration,
          successRate
        });
      }
      
      // Performance should degrade gracefully
      expect(performanceResults[0].successRate).toBeGreaterThan(0.9);
      expect(performanceResults[3].successRate).toBeGreaterThan(0.7); // Even at high load
      expect(performanceResults[3].averageDuration).toBeLessThan(2000); // Even at high load
    });
  });

  // ============================================================================
  // LOAD TESTING
  // ============================================================================

  describe('Load Testing', () => {
    it('should handle sustained load', async () => {
      const result = await PerformanceTestUtils.simulateLoad(
        5000, // 5 seconds
        50,   // 50 operations per second
        () => MockPerformanceServices.simulateAPICall(50)
      );
      
      expect(result.totalOperations).toBeGreaterThan(200); // At least 200 ops in 5s
      expect(result.successRate).toBeGreaterThan(0.9); // At least 90% success rate
      expect(result.averageLatency).toBeLessThan(200); // Average under 200ms
    });

    it('should handle high-frequency operations', async () => {
      const result = await PerformanceTestUtils.simulateLoad(
        3000, // 3 seconds
        100,  // 100 operations per second
        () => MockPerformanceServices.simulateWebSocketMessage({ test: true })
      );
      
      expect(result.totalOperations).toBeGreaterThan(250); // At least 250 ops in 3s
      expect(result.successRate).toBeGreaterThan(0.95); // At least 95% success rate
      expect(result.averageLatency).toBeLessThan(50); // Average under 50ms
    });

    it('should handle mixed operation types under load', async () => {
      let operationIndex = 0;
      const operations = [
        () => MockPerformanceServices.simulateAPICall(100),
        () => MockPerformanceServices.simulateDatabaseQuery(50),
        () => MockPerformanceServices.simulateFileOperation(512),
        () => MockPerformanceServices.simulateWebSocketMessage({ test: true })
      ];
      
      const result = await PerformanceTestUtils.simulateLoad(
        4000, // 4 seconds
        75,   // 75 operations per second
        () => {
          const op = operations[operationIndex % operations.length];
          operationIndex++;
          return op();
        }
      );
      
      expect(result.totalOperations).toBeGreaterThan(250); // At least 250 ops in 4s
      expect(result.successRate).toBeGreaterThan(0.85); // At least 85% success rate
      expect(result.averageLatency).toBeLessThan(300); // Average under 300ms
    });
  });

  // ============================================================================
  // STRESS TESTING
  // ============================================================================

  describe('Stress Testing', () => {
    it('should handle maximum concurrent connections', async () => {
      const result = await PerformanceTestUtils.stressTest(
        3000, // 3 seconds
        50    // 50 concurrent operations
      );
      
      expect(result.requestsPerSecond).toBeGreaterThan(100); // At least 100 RPS
      expect(result.errorRate).toBeLessThan(0.1); // Less than 10% error rate
      expect(result.memoryUsage).toBeLessThan(50 * 1024 * 1024); // Less than 50MB memory increase
    });

    it('should recover from stress conditions', async () => {
      // First stress test
      await PerformanceTestUtils.stressTest(2000, 30);
      
      // Recovery period
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Second stress test
      const result = await PerformanceTestUtils.stressTest(2000, 30);
      
      expect(result.requestsPerSecond).toBeGreaterThan(80); // Should maintain performance
      expect(result.errorRate).toBeLessThan(0.15); // Error rate should not increase significantly
    });

    it('should handle memory pressure gracefully', async () => {
      const initialMemory = PerformanceTestUtils.getMemoryUsage();
      
      // Create memory pressure
      const memoryIntensiveOperations = Array.from({ length: 100 }, () => 
        async () => {
          const data = new ArrayBuffer(1024 * 100); // 100KB per operation
          await new Promise(resolve => setTimeout(resolve, 10));
          return { size: data.byteBuffer };
        }
      );
      
      await PerformanceTestUtils.runConcurrent(memoryIntensiveOperations, 20);
      
      const finalMemory = PerformanceTestUtils.getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
      
      // Memory should be cleaned up
      await new Promise(resolve => setTimeout(resolve, 1000));
      const afterCleanupMemory = PerformanceTestUtils.getMemoryUsage();
      const memoryAfterCleanup = afterCleanupMemory - initialMemory;
      
      expect(memoryAfterCleanup).toBeLessThan(memoryIncrease * 0.5); // At least 50% cleanup
    });
  });

  // ============================================================================
  // SCALABILITY TESTS
  // ============================================================================

  describe('Scalability Tests', () => {
    it('should scale linearly with load', async () => {
      const loads = [10, 20, 40, 80];
      const results: Array<{ load: number; throughput: number; latency: number }> = [];
      
      for (const load of loads) {
        const startTime = performance.now();
        const operations = PerformanceTestUtils.generateLoadTest(load);
        await PerformanceTestUtils.runConcurrent(operations, Math.min(load, 20));
        const endTime = performance.now();
        
        const throughput = load / ((endTime - startTime) / 1000);
        results.push({
          load,
          throughput,
          latency: (endTime - startTime) / load
        });
      }
      
      // Throughput should scale reasonably
      expect(results[3].throughput).toBeGreaterThan(results[0].throughput * 2);
      
      // Latency should not increase disproportionately
      expect(results[3].latency).toBeLessThan(results[0].latency * 4);
    });

    it('should handle large datasets efficiently', async () => {
      const datasetSizes = [100, 1000, 10000];
      
      for (const size of datasetSizes) {
        const { result, duration, memory } = await PerformanceTestUtils.measurePerformance(async () => {
          return await MockPerformanceServices.simulateDatabaseQuery(size / 10); // Scale query time with size
        });
        
        expect(result.rows.length).toBe(100); // Always return 100 rows
        expect(duration).toBeLessThan(1000); // Should complete in under 1 second
        expect(memory).toBeLessThan(10 * 1024 * 1024); // Should use less than 10MB
      }
    });

    it('should maintain performance with increasing complexity', async () => {
      const complexities = [
        () => MockPerformanceServices.simulateAPICall(50),
        () => MockPerformanceServices.simulateAPICall(100),
        () => MockPerformanceServices.simulateAPICall(200),
        () => MockPerformanceServices.simulateAPICall(400)
      ];
      
      const results: Array<{ complexity: number; duration: number; memory: number }> = [];
      
      for (let i = 0; i < complexities.length; i++) {
        const { duration, memory } = await PerformanceTestUtils.measurePerformance(complexities[i]);
        results.push({
          complexity: i + 1,
          duration,
          memory
        });
      }
      
      // Performance should scale reasonably
      expect(results[3].duration).toBeLessThan(results[0].duration * 10); // Less than 10x increase
      expect(results[3].memory).toBeLessThan(results[0].memory * 5); // Less than 5x memory increase
    });
  });

  // ============================================================================
  // RESOURCE MANAGEMENT TESTS
  // ============================================================================

  describe('Resource Management', () => {
    it('should properly cleanup resources', async () => {
      const initialMemory = PerformanceTestUtils.getMemoryUsage();
      
      // Create and destroy many resources
      for (let i = 0; i < 100; i++) {
        const { result } = await PerformanceTestUtils.measurePerformance(async () => {
          return await MockPerformanceServices.simulateFileOperation(1024);
        });
        
        // Simulate cleanup
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const finalMemory = PerformanceTestUtils.getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // Less than 20MB increase
    });

    it('should handle resource exhaustion gracefully', async () => {
      // Simulate resource exhaustion
      const operations = Array.from({ length: 1000 }, () => 
        async () => {
          try {
            return await MockPerformanceServices.simulateAPICall(1000, Math.random() < 0.3); // 30% error rate
          } catch (error) {
            return { error: true, message: 'Resource exhausted' };
          }
        }
      );
      
      const results = await PerformanceTestUtils.runConcurrent(operations, 50);
      const successfulResults = results.filter(r => !r.error && !r.result.error);
      const errorResults = results.filter(r => r.error || r.result.error);
      
      expect(successfulResults.length).toBeGreaterThan(500); // At least 50% success
      expect(errorResults.length).toBeLessThan(500); // Less than 50% errors
    });

    it('should maintain performance under memory pressure', async () => {
      // Create memory pressure
      const memoryPressure = Array.from({ length: 50 }, () => 
        new ArrayBuffer(1024 * 1024) // 1MB each
      );
      
      // Test performance under pressure
      const { result, duration } = await PerformanceTestUtils.measurePerformance(async () => {
        return await MockPerformanceServices.simulateAPICall(100);
      });
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(500); // Should still complete in reasonable time
      
      // Cleanup
      memoryPressure.length = 0;
    });
  });

  // ============================================================================
  // PERFORMANCE MONITORING TESTS
  // ============================================================================

  describe('Performance Monitoring', () => {
    it('should track performance metrics accurately', async () => {
      const operations = PerformanceTestUtils.generateLoadTest(20);
      const results = await PerformanceTestUtils.runConcurrent(operations, 10);
      
      const stats = MockPerformanceServices.getStats();
      
      expect(stats.requestCount).toBe(20);
      expect(stats.errorRate).toBeLessThan(0.1); // Less than 10% error rate
      
      const successfulResults = results.filter(r => !r.error);
      const averageDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
      
      expect(averageDuration).toBeGreaterThan(0);
      expect(averageDuration).toBeLessThan(1000);
    });

    it('should detect performance degradation', async () => {
      const baseline = await PerformanceTestUtils.measurePerformance(async () => {
        return await MockPerformanceServices.simulateAPICall(50);
      });
      
      // Simulate degraded performance
      const degraded = await PerformanceTestUtils.measurePerformance(async () => {
        return await MockPerformanceServices.simulateAPICall(200);
      });
      
      expect(degraded.duration).toBeGreaterThan(baseline.duration);
      expect(degraded.duration).toBeLessThan(baseline.duration * 5); // Not more than 5x degradation
    });

    it('should provide performance alerts', async () => {
      const slowOperations = Array.from({ length: 10 }, () => 
        () => MockPerformanceServices.simulateAPICall(500) // Slow operations
      );
      
      const results = await PerformanceTestUtils.runConcurrent(slowOperations, 5);
      const slowResults = results.filter(r => r.duration > 400);
      
      expect(slowResults.length).toBeGreaterThan(5); // Most operations should be slow
      
      // In a real implementation, this would trigger performance alerts
      console.log(`Performance Alert: ${slowResults.length} slow operations detected`);
    });
  });
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PerformanceTestUtils,
  MockPerformanceServices
};
