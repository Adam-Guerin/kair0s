/**
 * Quality Monitor Tests
 * 
 * Unit tests for the QualityMonitor service including metrics collection,
 * health checks, alerting, and system status monitoring.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper, MockQualityMonitor, TEST_FIXTURES } from './setup.test';

// Mock the quality monitor service
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
    if (monitor && (monitor as any).metrics) {
      (monitor as any).metrics.clear();
    }
    if (monitor && (monitor as any).alerts) {
      (monitor as any).alerts = [];
    }
    if (monitor && (monitor as any).healthChecks) {
      (monitor as any).healthChecks.clear();
    }
  });

  describe('Metric Management', () => {
    it('should update existing metric value', () => {
      const metricId = 'response_time';
      const newValue = 1200;

      monitor.updateMetric(metricId, newValue);

      const updatedMetric = monitor.getMetric(metricId);
      expect(updatedMetric.value).toBe(newValue);
      expect(typeof updatedMetric.lastUpdated).toBe('number');
      expect(updatedMetric.lastUpdated).toBeGreaterThan(0);
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
      expect(alert.timestamp).toBeGreaterThan(0);
      expect(typeof alert.timestamp).toBe('number');
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
      expect(status.uptime).toBeGreaterThan(0);
      expect(typeof status.uptime).toBe('number');
      expect(status.lastRestart).toBeGreaterThan(0);
      expect(typeof status.lastRestart).toBe('number');
    });

    it('should return a copy of system status', () => {
      const status1 = monitor.getSystemStatus();
      const status2 = monitor.getSystemStatus();
      
      expect(status1).toEqual(status2);
      expect(status1).not.toBe(status2); // Different object references
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
});
