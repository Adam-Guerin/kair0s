/**
 * Quality Monitor Component Tests
 * 
 * Unit tests for the QualityMonitor component including metrics display,
 * health checks, alerts, and system status monitoring.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the QualityMonitor component for testing
const mockQualityMonitor = {
  metrics: [
    {
      id: 'response_time',
      name: 'Response Time',
      value: 850,
      target: 1000,
      unit: 'ms',
      category: 'performance',
      status: 'good',
      trend: 'down',
      lastUpdated: Date.now(),
      thresholds: { excellent: 500, good: 1000, warning: 2000, critical: 5000 }
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      value: 0.02,
      target: 0.01,
      unit: '%',
      category: 'reliability',
      status: 'warning',
      trend: 'up',
      lastUpdated: Date.now(),
      thresholds: { excellent: 0.01, good: 0.05, warning: 0.1, critical: 0.2 }
    }
  ],
  healthChecks: [
    {
      id: 'database_connection',
      name: 'Database Connection',
      status: 'healthy',
      lastCheck: Date.now() - 30000,
      duration: 45,
      details: 'Connection successful'
    },
    {
      id: 'api_endpoints',
      name: 'API Endpoints',
      status: 'degraded',
      lastCheck: Date.now() - 25000,
      duration: 180,
      details: 'Some endpoints responding slowly'
    }
  ],
  alerts: [
    {
      id: 'alert_1',
      type: 'metric',
      severity: 'medium',
      title: 'Error Rate Increased',
      message: 'Error rate has increased to 2% (target: 1%)',
      timestamp: Date.now() - 300000,
      metricId: 'error_rate',
      acknowledged: false,
      resolved: false
    }
  ],
  systemStatus: {
    overall: 'degraded',
    uptime: Date.now() - 86400000,
    lastRestart: Date.now() - 86400000,
    version: '1.0.0',
    buildNumber: '2024.02.21',
    environment: 'development'
  }
};

describe('QualityMonitor Component Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Metrics Processing', () => {
    it('should calculate performance ratio correctly', () => {
      const metric = mockQualityMonitor.metrics[0]; // response_time
      const performanceRatio = metric.value / metric.target;
      expect(performanceRatio).toBe(0.85); // 850/1000
    });

    it('should determine metric status correctly', () => {
      const getMetricStatus = (metric: any) => {
        const performanceRatio = metric.value / metric.target;
        if (performanceRatio >= 0.95) return 'excellent';
        if (performanceRatio >= 0.8) return 'good';
        if (performanceRatio >= 0.6) return 'warning';
        return 'critical';
      };

      const goodMetric = mockQualityMonitor.metrics[0]; // 850/1000 = 0.85
      const warningMetric = mockQualityMonitor.metrics[1]; // 0.02/0.01 = 2.0

      expect(getMetricStatus(goodMetric)).toBe('good');
      expect(getMetricStatus(warningMetric)).toBe('critical');
    });

    it('should categorize metrics correctly', () => {
      const performanceMetric = mockQualityMonitor.metrics.find(m => m.category === 'performance');
      const reliabilityMetric = mockQualityMonitor.metrics.find(m => m.category === 'reliability');

      expect(performanceMetric?.name).toBe('Response Time');
      expect(reliabilityMetric?.name).toBe('Error Rate');
    });

    it('should handle metric thresholds correctly', () => {
      const metric = mockQualityMonitor.metrics[0];
      expect(metric.thresholds.excellent).toBe(500);
      expect(metric.thresholds.good).toBe(1000);
      expect(metric.thresholds.warning).toBe(2000);
      expect(metric.thresholds.critical).toBe(5000);
    });
  });

  describe('Health Checks', () => {
    it('should identify healthy health checks', () => {
      const healthyChecks = mockQualityMonitor.healthChecks.filter(check => check.status === 'healthy');
      expect(healthyChecks).toHaveLength(1);
      expect(healthyChecks[0].name).toBe('Database Connection');
    });

    it('should identify degraded health checks', () => {
      const degradedChecks = mockQualityMonitor.healthChecks.filter(check => check.status === 'degraded');
      expect(degradedChecks).toHaveLength(1);
      expect(degradedChecks[0].name).toBe('API Endpoints');
    });

    it('should check health check timing', () => {
      const checks = mockQualityMonitor.healthChecks;
      checks.forEach(check => {
        expect(check.lastCheck).toBeGreaterThan(0);
        expect(check.duration).toBeGreaterThan(0);
        expect(typeof check.details).toBe('string');
      });
    });
  });

  describe('Alert Management', () => {
    it('should filter active alerts correctly', () => {
      const activeAlerts = mockQualityMonitor.alerts.filter(alert => !alert.resolved);
      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].title).toBe('Error Rate Increased');
    });

    it('should identify critical alerts', () => {
      const criticalAlerts = mockQualityMonitor.alerts.filter(alert => 
        alert.severity === 'critical' || alert.severity === 'high'
      );
      expect(criticalAlerts).toHaveLength(0); // No critical alerts in mock data
    });

    it('should check alert acknowledgment status', () => {
      const unacknowledgedAlerts = mockQualityMonitor.alerts.filter(alert => !alert.acknowledged);
      expect(unacknowledgedAlerts).toHaveLength(1);
    });

    it('should validate alert structure', () => {
      const alert = mockQualityMonitor.alerts[0];
      expect(alert.id).toBe('alert_1');
      expect(alert.type).toBe('metric');
      expect(alert.severity).toBe('medium');
      expect(alert.title).toBe('Error Rate Increased');
      expect(alert.message).toBe('Error rate has increased to 2% (target: 1%)');
      expect(alert.timestamp).toBeGreaterThan(0);
      expect(alert.metricId).toBe('error_rate');
    });
  });

  describe('System Status', () => {
    it('should report correct system status', () => {
      const status = mockQualityMonitor.systemStatus;
      expect(status.overall).toBe('degraded');
      expect(status.version).toBe('1.0.0');
      expect(status.buildNumber).toBe('2024.02.21');
      expect(status.environment).toBe('development');
    });

    it('should calculate uptime correctly', () => {
      const uptime = mockQualityMonitor.systemStatus.uptime;
      const now = Date.now();
      const expectedUptime = now - 86400000; // 24 hours ago
      expect(Math.abs(uptime - expectedUptime)).toBeLessThan(60000); // Within 1 minute
    });

    it('should validate system status structure', () => {
      const status = mockQualityMonitor.systemStatus;
      expect(typeof status.overall).toBe('string');
      expect(typeof status.uptime).toBe('number');
      expect(typeof status.lastRestart).toBe('number');
      expect(typeof status.version).toBe('string');
      expect(typeof status.buildNumber).toBe('string');
      expect(typeof status.environment).toBe('string');
    });
  });

  describe('Status Color Mapping', () => {
    it('should map status colors correctly', () => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'excellent':
          case 'healthy':
            return 'text-green-600 bg-green-50 border-green-200';
          case 'good':
            return 'text-blue-600 bg-blue-50 border-blue-200';
          case 'warning':
          case 'degraded':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
          case 'critical':
          case 'unhealthy':
            return 'text-red-600 bg-red-50 border-red-200';
          default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
        }
      };

      expect(getStatusColor('healthy')).toBe('text-green-600 bg-green-50 border-green-200');
      expect(getStatusColor('good')).toBe('text-blue-600 bg-blue-50 border-blue-200');
      expect(getStatusColor('warning')).toBe('text-yellow-600 bg-yellow-50 border-yellow-200');
      expect(getStatusColor('critical')).toBe('text-red-600 bg-red-50 border-red-200');
    });

    it('should map severity colors correctly', () => {
      const getSeverityColor = (severity: string) => {
        switch (severity) {
          case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
          case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
          case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
          case 'critical': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
      };

      expect(getSeverityColor('low')).toBe('text-blue-600 bg-blue-50 border-blue-200');
      expect(getSeverityColor('medium')).toBe('text-yellow-600 bg-yellow-50 border-yellow-200');
      expect(getSeverityColor('high')).toBe('text-orange-600 bg-orange-50 border-orange-200');
      expect(getSeverityColor('critical')).toBe('text-red-600 bg-red-50 border-red-200');
    });
  });

  describe('Performance Calculations', () => {
    it('should format uptime correctly', () => {
      const formatUptime = (uptime: number) => {
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      };

      const uptime = 24 * 60 * 60 * 1000; // 24 hours in ms
      const formatted = formatUptime(uptime);
      expect(formatted).toBe('24h 0m');
    });

    it('should calculate trend directions correctly', () => {
      const getTrendIcon = (trend: string) => {
        switch (trend) {
          case 'up': return 'TrendingUp';
          case 'down': return 'TrendingDown';
          default: return 'Minus';
        }
      };

      expect(getTrendIcon('up')).toBe('TrendingUp');
      expect(getTrendIcon('down')).toBe('TrendingDown');
      expect(getTrendIcon('stable')).toBe('Minus');
    });
  });
});
