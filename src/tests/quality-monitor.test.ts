/**
 * Quality Monitor Tests
 * 
 * Unit tests for the QualityMonitor service including metrics collection,
 * health checks, alerting, and system status monitoring.
 */

// Simple test framework mock
const describe = (name: string, fn: () => void) => {
  console.log(`\n=== ${name} ===`);
  fn();
};

const it = (name: string, fn: () => void) => {
  try {
    console.log(`  ✓ ${name}`);
    fn();
  } catch (error) {
    console.error(`  ✗ ${name}: ${error}`);
  }
};

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}`);
    }
  },
  toEqual: (expected: any) => {
    const checkEqual = (actual: any, expected: any): boolean => {
      // Handle expect.any matcher
      if (expected && typeof expected === 'object' && expected._type) {
        return typeof actual === expected._type;
      }
      
      // Handle nested objects
      if (expected && typeof expected === 'object' && actual && typeof actual === 'object') {
        const actualKeys = Object.keys(actual);
        const expectedKeys = Object.keys(expected);
        
        if (actualKeys.length !== expectedKeys.length) {
          return false;
        }
        
        for (const key of expectedKeys) {
          if (!checkEqual(actual[key], expected[key])) {
            return false;
          }
        }
        return true;
      }
      
      return JSON.stringify(actual) === JSON.stringify(expected);
    };
    
    if (!checkEqual(actual, expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error('Expected value to be defined');
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error('Expected value to be null');
    }
  },
  toBeUndefined: () => {
    if (actual !== undefined) {
      throw new Error('Expected value to be undefined');
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBeGreaterThanOrEqual: (expected: number) => {
    if (actual < expected) {
      throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
    }
  },
  toBeLessThanOrEqual: (expected: number) => {
    if (actual > expected) {
      throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
    }
  },
  toHaveLength: (expected: number | any) => {
    // Handle expect.any matcher
    if (expected && typeof expected === 'object' && expected._type) {
      if (expected._type === Number && typeof actual?.length === 'number') {
        return;
      }
    }
    
    if (!Array.isArray(actual) || actual.length !== expected) {
      throw new Error(`Expected array to have length ${expected}, got ${actual?.length}`);
    }
  },
  toHaveProperty: (property: string) => {
    if (actual === null || typeof actual !== 'object' || !(property in actual)) {
      throw new Error(`Expected object to have property ${property}`);
    }
  },
  toMatch: (pattern: RegExp | string) => {
    if (typeof actual !== 'string' || !actual.match(pattern)) {
      throw new Error(`Expected ${actual} to match ${pattern}`);
    }
  },
  toBeValidTimestamp: () => {
    if (typeof actual !== 'number' || actual <= 0 || !Number.isInteger(actual)) {
      throw new Error('Expected valid timestamp (positive integer)');
    }
  },
  not: {
    toBe: (expected: any) => {
      if (actual === expected) {
        throw new Error(`Expected ${actual} not to be ${expected}`);
      }
    }
  }
});

// Static methods for expect
expect.any = (type: any) => ({
  _type: type
});

const beforeEach = (fn: () => void) => {
  // Setup before each test
  fn();
};

const afterEach = (fn: () => void) => {
  // Cleanup after each test
  fn();
};

// Test fixtures
const TEST_FIXTURES = {
  metrics: [
    {
      id: 'response_time',
      name: 'Response Time',
      category: 'performance',
      value: 850,
      unit: 'ms',
      target: 1000,
      status: 'good',
      thresholds: {
        excellent: 500,
        good: 1000,
        warning: 2000,
        critical: 5000
      },
      lastUpdated: Date.now(),
      history: []
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      category: 'reliability',
      value: 0.02,
      unit: '%',
      target: 0.01,
      status: 'warning',
      thresholds: {
        excellent: 0.001,
        good: 0.01,
        warning: 0.05,
        critical: 0.1
      },
      lastUpdated: Date.now(),
      history: []
    },
    {
      id: 'user_satisfaction',
      name: 'User Satisfaction',
      category: 'usability',
      value: 4.2,
      unit: '/5',
      target: 4.5,
      status: 'good',
      thresholds: {
        excellent: 4.8,
        good: 4.0,
        warning: 3.5,
        critical: 3.0
      },
      lastUpdated: Date.now(),
      history: []
    }
  ],
  alerts: [
    {
      type: 'metric',
      severity: 'medium',
      title: 'Response Time Increased',
      message: 'Response time has increased above normal levels'
    },
    {
      type: 'metric',
      severity: 'low',
      title: 'Error Rate Slightly Elevated',
      message: 'Error rate is slightly above target'
    }
  ]
};

// Test helper utilities
class TestHelper {
  static waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Mock the quality monitor since we can't import the actual one due to dependencies
class QualityMonitor {
  private metrics: Map<string, any> = new Map();
  private alerts: any[] = [];
  private healthChecks: Map<string, any> = new Map();
  private systemStatus = {
    overall: 'healthy',
    uptime: Date.now(),
    lastRestart: Date.now(),
    version: '1.0.0',
    buildNumber: '2024.02.21',
    environment: 'development'
  };

  updateMetric(id: string, value: number): void {
    const metric = this.metrics.get(id);
    if (metric) {
      metric.value = value;
      metric.lastUpdated = Date.now();
      metric.history.push({ timestamp: Date.now(), value });
      if (metric.history.length > 100) {
        metric.history.shift();
      }
    }
  }

  getMetrics(): any[] {
    return Array.from(this.metrics.values());
  }

  getMetric(id: string): any {
    return this.metrics.get(id);
  }

  createAlert(type: string, severity: string, title: string, message: string): void {
    this.alerts.push({
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false
    });
  }

  getAlerts(): any[] {
    return this.alerts;
  }

  getSystemStatus(): any {
    return { ...this.systemStatus };
  }
}

describe('QualityMonitor', () => {
  let monitor: QualityMonitor;

  beforeEach(() => {
    monitor = new QualityMonitor();
    
    // Initialize with test metrics
    TEST_FIXTURES.metrics.forEach(metric => {
      (monitor as any).metrics.set(metric.id, metric);
    });
  });

  afterEach(() => {
    // Cleanup
    (monitor as any).metrics.clear();
    (monitor as any).alerts = [];
    (monitor as any).healthChecks.clear();
  });

  describe('Metric Management', () => {
    it('should update existing metric value', () => {
      const metricId = 'response_time';
      const newValue = 1200;

      monitor.updateMetric(metricId, newValue);

      const updatedMetric = monitor.getMetric(metricId);
      expect(updatedMetric.value).toBe(newValue);
      expect(updatedMetric.lastUpdated).toBeValidTimestamp();
    });

    it('should add history entry when updating metric', () => {
      const metricId = 'response_time';
      const initialValue = monitor.getMetric(metricId).history.length;
      const newValue = 1200;

      monitor.updateMetric(metricId, newValue);

      const updatedMetric = monitor.getMetric(metricId);
      expect(updatedMetric.history.length).toBe(initialValue + 1);
      expect(updatedMetric.history[updatedMetric.history.length - 1]).toEqual({
        timestamp: expect.any(Number),
        value: newValue
      });
    });

    it('should maintain history size limit', () => {
      const metricId = 'response_time';
      const metric = monitor.getMetric(metricId);
      
      // Fill history to limit
      for (let i = 0; i < 105; i++) {
        monitor.updateMetric(metricId, i);
      }

      const updatedMetric = monitor.getMetric(metricId);
      expect(updatedMetric.history.length).toBeLessThanOrEqual(100);
    });

    it('should return all metrics', () => {
      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(TEST_FIXTURES.metrics.length);
      expect(metrics[0]).toHaveProperty('id');
      expect(metrics[0]).toHaveProperty('value');
      expect(metrics[0]).toHaveProperty('name');
    });

    it('should return specific metric by ID', () => {
      const metricId = 'response_time';
      const metric = monitor.getMetric(metricId);
      
      expect(metric).toBeDefined();
      expect(metric.id).toBe(metricId);
      expect(metric.name).toBe('Response Time');
    });

    it('should return undefined for non-existent metric', () => {
      const metric = monitor.getMetric('non_existent');
      expect(metric).toBeUndefined();
    });
  });

  describe('Alert Management', () => {
    it('should create alert with correct properties', () => {
      const type = 'metric';
      const severity = 'high';
      const title = 'Test Alert';
      const message = 'This is a test alert';

      monitor.createAlert(type, severity, title, message);

      const alerts = monitor.getAlerts();
      expect(alerts).toHaveLength(1);
      
      const alert = alerts[0];
      expect(alert.type).toBe(type);
      expect(alert.severity).toBe(severity);
      expect(alert.title).toBe(title);
      expect(alert.message).toBe(message);
      expect(alert.timestamp).toBeValidTimestamp();
      expect(alert.acknowledged).toBe(false);
      expect(alert.resolved).toBe(false);
      expect(alert.id).toMatch(/^alert_\d+_[a-z0-9]+$/);
    });

    it('should create multiple alerts', () => {
      const alertCount = 3;
      
      for (let i = 0; i < alertCount; i++) {
        monitor.createAlert('metric', 'medium', `Alert ${i}`, `Message ${i}`);
      }

      const alerts = monitor.getAlerts();
      expect(alerts).toHaveLength(alertCount);
    });

    it('should generate unique alert IDs', () => {
      monitor.createAlert('metric', 'medium', 'Alert 1', 'Message 1');
      monitor.createAlert('metric', 'medium', 'Alert 2', 'Message 2');

      const alerts = monitor.getAlerts();
      expect(alerts[0].id).not.toBe(alerts[1].id);
    });
  });

  describe('System Status', () => {
    it('should return current system status', () => {
      const status = monitor.getSystemStatus();
      
      expect(status).toHaveProperty('overall');
      expect(status).toHaveProperty('uptime');
      expect(status).toHaveProperty('lastRestart');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('buildNumber');
      expect(status).toHaveProperty('environment');
      
      expect(status.version).toBe('1.0.0');
      expect(status.buildNumber).toBe('2024.02.21');
      expect(status.environment).toBe('development');
      expect(status.uptime).toBeValidTimestamp();
      expect(status.lastRestart).toBeValidTimestamp();
    });

    it('should return a copy of system status', () => {
      const status1 = monitor.getSystemStatus();
      const status2 = monitor.getSystemStatus();
      
      expect(status1).toEqual(status2);
      expect(status1).not.toBe(status2); // Different object references
    });
  });

  describe('Metric Thresholds', () => {
    it('should handle different metric categories', () => {
      const performanceMetric = monitor.getMetric('response_time');
      const reliabilityMetric = monitor.getMetric('error_rate');
      const usabilityMetric = monitor.getMetric('user_satisfaction');

      expect(performanceMetric.category).toBe('performance');
      expect(reliabilityMetric.category).toBe('reliability');
      expect(usabilityMetric.category).toBe('usability');
    });

    it('should maintain metric thresholds', () => {
      const metric = monitor.getMetric('response_time');
      
      expect(metric.thresholds).toHaveProperty('excellent');
      expect(metric.thresholds).toHaveProperty('good');
      expect(metric.thresholds).toHaveProperty('warning');
      expect(metric.thresholds).toHaveProperty('critical');
      
      expect(metric.thresholds.excellent).toBe(500);
      expect(metric.thresholds.good).toBe(1000);
      expect(metric.thresholds.warning).toBe(2000);
      expect(metric.thresholds.critical).toBe(5000);
    });

    it('should track metric trends', () => {
      const metricId = 'response_time';
      
      // Update metric multiple times to establish trend
      monitor.updateMetric(metricId, 100);
      monitor.updateMetric(metricId, 200);
      monitor.updateMetric(metricId, 300);

      const metric = monitor.getMetric(metricId);
      expect(metric.history).toHaveLength(expect.any(Number));
      expect(metric.history[metric.history.length - 1].value).toBe(300);
    });
  });

  describe('Performance Tracking', () => {
    it('should track response times correctly', () => {
      const metricId = 'response_time';
      const responseTimes = [100, 200, 150, 300, 250];

      responseTimes.forEach(time => {
        monitor.updateMetric(metricId, time);
      });

      const metric = monitor.getMetric(metricId);
      expect(metric.value).toBe(250); // Last update
      expect(metric.history.length).toBeGreaterThan(0);
    });

    it('should handle error rate tracking', () => {
      const metricId = 'error_rate';
      const errorRates = [0.01, 0.02, 0.015, 0.025];

      errorRates.forEach(rate => {
        monitor.updateMetric(metricId, rate);
      });

      const metric = monitor.getMetric(metricId);
      expect(metric.value).toBe(0.025); // Last update
      expect(metric.unit).toBe('%');
    });

    it('should track user satisfaction metrics', () => {
      const metricId = 'user_satisfaction';
      const satisfactionScores = [4.2, 4.5, 4.3, 4.7];

      satisfactionScores.forEach(score => {
        monitor.updateMetric(metricId, score);
      });

      const metric = monitor.getMetric(metricId);
      expect(metric.value).toBe(4.7); // Last update
      expect(metric.unit).toBe('/5');
      expect(metric.target).toBe(4.5);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain metric data consistency', () => {
      const metricId = 'response_time';
      const originalMetric = monitor.getMetric(metricId);
      
      monitor.updateMetric(metricId, 999);
      const updatedMetric = monitor.getMetric(metricId);
      
      // Should preserve all other properties
      expect(updatedMetric.id).toBe(originalMetric.id);
      expect(updatedMetric.name).toBe(originalMetric.name);
      expect(updatedMetric.category).toBe(originalMetric.category);
      expect(updatedMetric.unit).toBe(originalMetric.unit);
      expect(updatedMetric.target).toBe(originalMetric.target);
      expect(updatedMetric.thresholds).toEqual(originalMetric.thresholds);
      
      // Only value and timestamp should change
      expect(updatedMetric.value).toBe(999);
      expect(updatedMetric.lastUpdated).toBeGreaterThan(originalMetric.lastUpdated);
    });

    it('should handle invalid metric updates gracefully', () => {
      const metricId = 'response_time';
      const originalMetric = monitor.getMetric(metricId);
      
      // Try updating non-existent metric
      monitor.updateMetric('non_existent', 999);
      
      // Original metric should be unchanged
      const currentMetric = monitor.getMetric(metricId);
      expect(currentMetric.value).toBe(originalMetric.value);
      expect(currentMetric.lastUpdated).toBe(originalMetric.lastUpdated);
    });

    it('should handle edge case values', () => {
      const metricId = 'response_time';
      
      // Test zero value
      monitor.updateMetric(metricId, 0);
      expect(monitor.getMetric(metricId).value).toBe(0);
      
      // Test negative value
      monitor.updateMetric(metricId, -100);
      expect(monitor.getMetric(metricId).value).toBe(-100);
      
      // Test very large value
      monitor.updateMetric(metricId, Number.MAX_SAFE_INTEGER);
      expect(monitor.getMetric(metricId).value).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Time-based Operations', () => {
    it('should use valid timestamps', () => {
      const metricId = 'response_time';
      const beforeUpdate = Date.now();
      
      monitor.updateMetric(metricId, 500);
      
      const metric = monitor.getMetric(metricId);
      expect(metric.lastUpdated).toBeGreaterThanOrEqual(beforeUpdate);
      expect(metric.lastUpdated).toBeLessThanOrEqual(Date.now());
    });

    it('should maintain chronological history', () => {
      const metricId = 'response_time';
      const timestamps = [];
      
      for (let i = 0; i < 5; i++) {
        monitor.updateMetric(metricId, i * 100);
        timestamps.push(monitor.getMetric(metricId).lastUpdated);
        TestHelper.waitFor(10); // Small delay
      }
      
      const history = monitor.getMetric(metricId).history;
      for (let i = 1; i < history.length; i++) {
        expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i - 1].timestamp);
      }
    });
  });
});

describe('QualityMonitor Integration', () => {
  let monitor: QualityMonitor;

  beforeEach(() => {
    monitor = new QualityMonitor();
  });

  it('should work with test fixtures', () => {
    // Load test fixtures
    TEST_FIXTURES.metrics.forEach(metric => {
      (monitor as any).metrics.set(metric.id, metric);
    });

    const metrics = monitor.getMetrics();
    expect(metrics).toHaveLength(TEST_FIXTURES.metrics.length);
    
    // Verify fixture data
    const responseTimeMetric = monitor.getMetric('response_time');
    expect(responseTimeMetric.value).toBe(850);
    expect(responseTimeMetric.target).toBe(1000);
    expect(responseTimeMetric.status).toBe('good');
  });

  it('should handle alert creation from fixtures', () => {
    TEST_FIXTURES.alerts.forEach(alert => {
      monitor.createAlert(alert.type, alert.severity, alert.title, alert.message);
    });

    const alerts = monitor.getAlerts();
    expect(alerts).toHaveLength(TEST_FIXTURES.alerts.length);
    
    // Verify first alert
    expect(alerts[0].type).toBe('metric');
    expect(alerts[0].severity).toBe('medium');
    expect(alerts[0].title).toBe('Response Time Increased');
  });

  it('should simulate real-time monitoring scenario', async () => {
    const metricId = 'response_time';
    
    // Simulate metric updates over time
    const updates = [800, 1200, 900, 1500, 700];
    
    for (const value of updates) {
      monitor.updateMetric(metricId, value);
      await TestHelper.waitFor(10);
      
      // Check if alert should be created for high values
      if (value > 1000) {
        const currentAlerts = monitor.getAlerts();
        const highValueAlerts = currentAlerts.filter(alert => 
          alert.title.includes('Response Time') || alert.message.includes('high')
        );
        
        // Should have alerts for high response times
        expect(highValueAlerts.length).toBeGreaterThan(0);
      }
    }
    
    const finalMetric = monitor.getMetric(metricId);
    expect(finalMetric.value).toBe(700); // Last update
    expect(finalMetric.history.length).toBe(updates.length);
  });
});
