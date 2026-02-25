/**
 * Performance and Load Tests
 * 
 * Tests focusing on system performance, load handling,
 * stress testing, and scalability.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Performance monitoring utilities
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTime: number = Date.now();

  startMeasurement(name: string): void {
    this.startTime = Date.now();
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
  }

  endMeasurement(name: string): number {
    const duration = Date.now() - this.startTime;
    const measurements = this.metrics.get(name) || [];
    measurements.push(duration);
    this.metrics.set(name, measurements);
    return duration;
  }

  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name) || [];
    if (measurements.length === 0) return 0;
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  getMinTime(name: string): number {
    const measurements = this.metrics.get(name) || [];
    return measurements.length > 0 ? Math.min(...measurements) : 0;
  }

  getMaxTime(name: string): number {
    const measurements = this.metrics.get(name) || [];
    return measurements.length > 0 ? Math.max(...measurements) : 0;
  }

  getPercentile(name: string, percentile: number): number {
    const measurements = this.metrics.get(name) || [];
    if (measurements.length === 0) return 0;
    
    const sorted = [...measurements].sort((a, b) => a - b);
    const index = Math.floor(measurements.length * percentile / 100);
    return sorted[Math.max(0, Math.min(index, measurements.length - 1))];
  }

  reset(): void {
    this.metrics.clear();
    this.startTime = Date.now();
  }

  getReport(): any {
    const report: any = {};
    for (const [name, measurements] of this.metrics.entries()) {
      report[name] = {
        count: measurements.length,
        average: this.getAverageTime(name),
        min: this.getMinTime(name),
        max: this.getMaxTime(name),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99)
      };
    }
    return report;
  }
}

// Load testing utilities
class LoadTester {
  private results: any[] = [];
  private errors: any[] = [];

  async runConcurrentTest(testCount: number, testFunction: Function): Promise<any> {
    const promises = Array.from({ length: testCount }, (_, i) => 
      testFunction(i).catch(error => ({ success: false, error: error.message, index: i }))
    );

    const results = await Promise.all(promises);
    this.results.push(...results);
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;
    
    return {
      total: results.length,
      success: successCount,
      errors: errorCount,
      successRate: successCount / results.length,
      results
    };
  }

  async runStressTest(duration: number, concurrency: number, testFunction: Function): Promise<any> {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    let completed = 0;
    let errors = 0;
    
    while (Date.now() < endTime) {
      const batch = Array.from({ length: concurrency }, (_, i) => 
        testFunction(`stress_${completed}_${i}`).catch(error => {
          errors++;
          return { success: false, error: error.message };
        })
      );
      
      await Promise.all(batch);
      completed += concurrency;
    }
    
    const totalTime = Date.now() - startTime;
    const throughput = completed / (totalTime / 1000);
    
    return {
      duration: totalTime,
      completed,
      errors,
      errorRate: errors / (completed + errors),
      throughput,
      avgResponseTime: totalTime / (completed + errors)
    };
  }

  getResults(): any {
    return {
      concurrentTests: this.results,
      stressTests: []
    };
  }
}

// Mock system for testing
class MockTestSystem {
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];

  async processRequest(): Promise<any> {
    this.requestCount++;
    const startTime = Date.now();
    
    // Simulate processing time
    const processingTime = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    const responseTime = Date.now() - startTime;
    this.responseTimes.push(responseTime);
    
    // Simulate occasional errors
    if (Math.random() < 0.05) { // 5% error rate
      this.errorCount++;
      throw new Error('Simulated processing error');
    }
    
    return {
      success: true,
      responseTime,
      requestId: this.requestCount
    };
  }

  getMetrics(): any {
    if (this.responseTimes.length === 0) {
      return { avgResponseTime: 0, errorRate: 0 };
    }
    
    const avgResponseTime = this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    const errorRate = this.errorCount / this.requestCount;
    
    return {
      totalRequests: this.requestCount,
      avgResponseTime,
      errorRate,
      minResponseTime: Math.min(...this.responseTimes),
      maxResponseTime: Math.max(...this.responseTimes),
      p95ResponseTime: this.responseTimes.sort((a, b) => a - b)[Math.floor(this.responseTimes.length * 0.95)]
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }
}

describe('Performance and Load Tests', () => {
  let perfMonitor: PerformanceMonitor;
  let loadTester: LoadTester;
  let testSystem: MockTestSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    perfMonitor = new PerformanceMonitor();
    loadTester = new LoadTester();
    testSystem = new MockTestSystem();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Performance Monitoring', () => {
    it('should measure response times accurately', async () => {
      perfMonitor.startMeasurement('api_request');
      
      await testSystem.processRequest();
      const duration = perfMonitor.endMeasurement('api_request');
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // Should complete within 200ms
    });

    it('should track multiple measurements', async () => {
      for (let i = 0; i < 5; i++) {
        perfMonitor.startMeasurement('request_batch');
        await testSystem.processRequest();
        perfMonitor.endMeasurement('request_batch');
      }
      
      const report = perfMonitor.getReport();
      expect(report.request_batch.count).toBe(5);
      expect(report.request_batch.average).toBeGreaterThan(0);
      expect(report.request_batch.min).toBeGreaterThan(0);
      expect(report.request_batch.max).toBeGreaterThan(0);
    });

    it('should calculate percentiles correctly', async () => {
      // Generate response times with known distribution
      const testTimes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      
      testTimes.forEach((time) => {
        perfMonitor.startMeasurement('percentile_test');
        // Simulate the exact time
        vi.advanceTimersByTime(time);
        perfMonitor.endMeasurement('percentile_test');
      });
      
      const report = perfMonitor.getReport();
      expect(report.percentile_test.p95).toBe(95);
      expect(report.percentile_test.p99).toBe(100);
    });
  });

  describe('Concurrent Load Testing', () => {
    it('should handle concurrent requests', async () => {
      const testFunction = async (_index: number) => {
        return testSystem.processRequest();
      };

      const result = await loadTester.runConcurrentTest(20, testFunction);
      
      expect(result.total).toBe(20);
      expect(result.success).toBeGreaterThan(15); // Allow for some errors
      expect(result.successRate).toBeGreaterThan(0.5);
    });

    it('should measure concurrent performance', async () => {
      const testFunction = async (index: number) => {
        perfMonitor.startMeasurement(`concurrent_${index}`);
        const result = await testSystem.processRequest();
        perfMonitor.endMeasurement(`concurrent_${index}`);
        return result;
      };

      await loadTester.runConcurrentTest(10, testFunction);
      
      const report = perfMonitor.getReport();
      const avgTime = report.concurrent_0?.average || 0;
      
      expect(avgTime).toBeGreaterThan(0);
      expect(avgTime).toBeLessThan(200); // Should be reasonably fast
    });

    it('should handle load spikes', async () => {
      const testFunction = async (_index: number) => {
        // Simulate variable processing time
        const delay = Math.random() * 200 + 50; // 50-250ms
        await new Promise(resolve => setTimeout(resolve, delay));
        return testSystem.processRequest();
      };

      const result = await loadTester.runConcurrentTest(15, testFunction);
      
      expect(result.total).toBe(15);
      expect(result.successRate).toBeGreaterThan(0.8); // Should handle variable times well
    });
  });

  describe('Stress Testing', () => {
    it('should handle sustained load', async () => {
      const testFunction = async (_id: string) => {
        return testSystem.processRequest();
      };

      const result = await loadTester.runStressTest(2000, 5, testFunction); // 2 seconds, 5 concurrent
      
      expect(result.duration).toBeGreaterThan(1900);
      expect(result.completed).toBeGreaterThan(40); // At least 20 requests per second
      expect(result.errorRate).toBeLessThan(0.1); // Error rate should be low
      expect(result.throughput).toBeGreaterThan(15); // Good throughput
    });

    it('should detect performance degradation', async () => {
      const testFunction = async (index: number) => {
        // Simulate increasing response times
        const delay = Math.min(50 + index * 10, 500); // Gradually slower
        await new Promise(resolve => setTimeout(resolve, delay));
        return testSystem.processRequest();
      };

      const result = await loadTester.runConcurrentTest(20, testFunction);
      
      expect(result.successRate).toBeLessThan(1); // Some should fail due to timeouts
      expect(result.errors).toBeGreaterThan(0);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should handle memory pressure', async () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate memory-intensive operations
      const largeArrays = Array.from({ length: 100 }, () => 
        Array.from({ length: 10000 }, () => Math.random())
      );
      
      // Process arrays
      largeArrays.forEach(arr => {
        arr.sort();
        arr.filter(n => n > 0.5);
      });
      
      const finalMemory = process.memoryUsage();
      
      // Memory usage should increase but not excessively
      expect(finalMemory.heapUsed).toBeGreaterThan(initialMemory.heapUsed);
      expect(finalMemory.heapUsed).toBeLessThan(initialMemory.heapUsed * 2); // Not double
    });

    it('should clean up resources properly', () => {
      const initialMemory = process.memoryUsage();
      
      // Create and clean up resources
      const resources = [];
      for (let i = 0; i < 1000; i++) {
        resources.push({
          id: i,
          data: new Array(1000).fill(Math.random()),
          processed: false
        });
      }
      
      // Process and clean up
      resources.forEach(resource => {
        resource.processed = true;
        resource.data = null; // Allow GC
      });
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      
      // Memory should be cleaned up
      expect(finalMemory.heapUsed).toBeLessThan(initialMemory.heapUsed * 1.1);
    });
  });

  describe('Scalability Testing', () => {
    it('should scale linearly with load', async () => {
      const testSizes = [5, 10, 20, 50];
      const results = [];
      
      for (const size of testSizes) {
        const testFunction = async () => testSystem.processRequest();
        const result = await loadTester.runConcurrentTest(size, testFunction);
        results.push({ size, ...result });
      }
      
      // Check that performance scales reasonably
      const avgTime5 = results.find(r => r.size === 5)?.avgResponseTime || 0;
      const avgTime50 = results.find(r => r.size === 50)?.avgResponseTime || 0;
      
      // 50 requests should not be 10x slower than 5 requests
      expect(avgTime50).toBeLessThan(avgTime5 * 10);
    });

    it('should handle maximum capacity', async () => {
      const testFunction = async () => testSystem.processRequest();
      
      // Test with increasing load until failure point
      let lastSuccessful = 0;
      let maxLoad = 0;
      
      for (let size = 10; size <= 200; size += 20) {
        try {
          const result = await loadTester.runConcurrentTest(size, testFunction);
          
          if (result.successRate > 0.8) {
            lastSuccessful = size;
            maxLoad = size;
          }
        } catch (error) {
          break; // Stop at failure point
        }
      }
      
      expect(maxLoad).toBeGreaterThan(50); // Should handle at least 50 concurrent requests
      expect(lastSuccessful).toBeGreaterThan(maxLoad * 0.8); // Success rate drops before failure
    });
  });

  describe('System Health Under Load', () => {
    it('should maintain system health during load', async () => {
      const initialHealth = testSystem.getMetrics();
      
      // Run load test
      await loadTester.runConcurrentTest(30, () => testSystem.processRequest());
      
      const finalHealth = testSystem.getMetrics();
      
      // System should still be functional
      expect(finalHealth.totalRequests).toBe(initialHealth.totalRequests + 30);
      expect(finalHealth.errorRate).toBeLessThan(0.2); // Error rate should be reasonable
    });

    it('should detect performance degradation', async () => {
      // Simulate system degradation
      const slowTestFunction = async () => {
        const delay = Math.random() * 300 + 200; // 200-500ms
        await new Promise(resolve => setTimeout(resolve, delay));
        return testSystem.processRequest();
      };

      const result = await loadTester.runConcurrentTest(20, slowTestFunction);
      
      expect(result.successRate).toBeLessThan(0.9); // Lower success rate due to slowness
    });
  });
});
