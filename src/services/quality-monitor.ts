/**
 * Kair0s Quality Monitor Service
 * 
 * Real-time monitoring system for application health, performance, and quality metrics
 * with automatic alerting and health checks.
 */

// Simple browser-compatible event emitter
class SimpleEventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  category: 'performance' | 'usability' | 'reliability' | 'business';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
  history: Array<{ timestamp: number; value: number }>;
  thresholds: {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
  };
}

export interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  duration: number;
  details?: string;
  dependencies?: string[];
}

export interface Alert {
  id: string;
  type: 'metric' | 'health' | 'error' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  metricId?: string;
  healthCheckId?: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastRestart: number;
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
}

// ============================================================================
// QUALITY MONITOR CLASS
// ============================================================================

export class QualityMonitor extends SimpleEventEmitter {
  private metrics: Map<string, QualityMetric> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: Alert[] = [];
  private systemStatus: SystemStatus;
  private monitoringInterval: number | null = null;
  private healthCheckInterval: number | null = null;

  constructor() {
    super();
    this.systemStatus = {
      overall: 'healthy',
      uptime: Date.now(),
      lastRestart: Date.now(),
      version: '1.0.0',
      buildNumber: '2024.02.21',
      environment: 'development'
    };

    this.initializeDefaultMetrics();
    this.startMonitoring();
    this.startHealthChecks();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeDefaultMetrics(): void {
    const defaultMetrics: Omit<QualityMetric, 'id' | 'lastUpdated' | 'history'>[] = [
      {
        name: 'Response Time',
        value: 0,
        target: 1000,
        unit: 'ms',
        category: 'performance',
        status: 'excellent',
        trend: 'stable',
        thresholds: {
          excellent: 500,
          good: 1000,
          warning: 2000,
          critical: 5000
        }
      },
      {
        name: 'Error Rate',
        value: 0,
        target: 0.01,
        unit: '%',
        category: 'reliability',
        status: 'excellent',
        trend: 'stable',
        thresholds: {
          excellent: 0.01,
          good: 0.05,
          warning: 0.1,
          critical: 0.2
        }
      },
      {
        name: 'Memory Usage',
        value: 0,
        target: 512,
        unit: 'MB',
        category: 'performance',
        status: 'excellent',
        trend: 'stable',
        thresholds: {
          excellent: 256,
          good: 512,
          warning: 1024,
          critical: 2048
        }
      },
      {
        name: 'CPU Usage',
        value: 0,
        target: 50,
        unit: '%',
        category: 'performance',
        status: 'excellent',
        trend: 'stable',
        thresholds: {
          excellent: 25,
          good: 50,
          warning: 75,
          critical: 90
        }
      },
      {
        name: 'User Satisfaction',
        value: 4.5,
        target: 4.5,
        unit: '/5',
        category: 'usability',
        status: 'excellent',
        trend: 'stable',
        thresholds: {
          excellent: 4.5,
          good: 4.0,
          warning: 3.5,
          critical: 3.0
        }
      },
      {
        name: 'Task Completion Rate',
        value: 0.95,
        target: 0.95,
        unit: '%',
        category: 'business',
        status: 'excellent',
        trend: 'stable',
        thresholds: {
          excellent: 0.95,
          good: 0.85,
          warning: 0.75,
          critical: 0.6
        }
      }
    ];

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric.name.toLowerCase().replace(/\s+/g, '_'), {
        ...metric,
        id: metric.name.toLowerCase().replace(/\s+/g, '_'),
        lastUpdated: Date.now(),
        history: []
      });
    });
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzeMetrics();
      this.updateSystemStatus();
    }, 5000); // Update every 5 seconds
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Health checks every 30 seconds
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Performance metrics - simulated for browser environment
      const memUsage = { heapUsed: 50 * 1024 * 1024 }; // Simulate 50MB
      this.updateMetric('memory_usage', memUsage.heapUsed / 1024 / 1024);

      // Simulate CPU usage (in real implementation, use actual CPU monitoring)
      const cpuUsage = Math.random() * 30 + 10; // 10-40%
      this.updateMetric('cpu_usage', cpuUsage);

      // Simulate response time
      const responseTime = Math.random() * 500 + 200; // 200-700ms
      this.updateMetric('response_time', responseTime);

      // Simulate error rate
      const errorRate = Math.random() * 0.02; // 0-2%
      this.updateMetric('error_rate', errorRate);

      // Simulate user satisfaction (would come from feedback)
      const satisfaction = 4.2 + Math.random() * 0.4; // 4.2-4.6
      this.updateMetric('user_satisfaction', satisfaction);

      // Simulate task completion
      const completionRate = 0.9 + Math.random() * 0.08; // 90-98%
      this.updateMetric('task_completion_rate', completionRate);

    } catch (error) {
      this.createAlert('error', 'high', 'Metric Collection Error', 
        `Failed to collect metrics: ${error}`);
    }
  }

  private analyzeMetrics(): void {
    this.metrics.forEach(metric => {
      const previousStatus = metric.status;
      metric.status = this.calculateMetricStatus(metric.value, metric.thresholds);
      
      // Calculate trend
      if (metric.history.length >= 2) {
        const recent = metric.history.slice(-2);
        const change = recent[1].value - recent[0].value;
        const threshold = metric.target * 0.05; // 5% of target
        
        if (Math.abs(change) < threshold) {
          metric.trend = 'stable';
        } else {
          metric.trend = change > 0 ? 'up' : 'down';
        }
      }

      // Create alert if status degraded
      if (this.isStatusWorse(metric.status, previousStatus)) {
        this.createAlert('metric', this.getAlertSeverity(metric.status), 
          `${metric.name} Degraded`, 
          `${metric.name} is ${metric.status} (${metric.value}${metric.unit})`);
      }

      // Emit metric update
      this.emit('metricUpdated', metric);
    });
  }

  private calculateMetricStatus(value: number, thresholds: QualityMetric['thresholds']): QualityMetric['status'] {
    if (value <= thresholds.excellent) return 'excellent';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  }

  private isStatusWorse(current: QualityMetric['status'], previous: QualityMetric['status']): boolean {
    const statusOrder = { excellent: 0, good: 1, warning: 2, critical: 3 };
    return statusOrder[current] > statusOrder[previous];
  }

  private getAlertSeverity(status: QualityMetric['status']): Alert['severity'] {
    switch (status) {
      case 'critical': return 'critical';
      case 'warning': return 'medium';
      case 'good': return 'low';
      case 'excellent': return 'low';
      default: return 'medium';
    }
  }

  // ============================================================================
  // HEALTH CHECKS
  // ============================================================================

  private async performHealthChecks(): Promise<void> {
    const checks: Array<Promise<HealthCheck>> = [
      this.checkDatabaseConnection(),
      this.checkApiEndpoints(),
      this.checkMemoryUsage(),
      this.checkDiskSpace(),
      this.checkExternalServices()
    ];

    try {
      const results = await Promise.allSettled(checks);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.healthChecks.set(result.value.id, result.value);
          this.emit('healthCheckCompleted', result.value);
        } else {
          this.createAlert('health', 'high', 'Health Check Failed', 
            `Health check ${index} failed: ${result.reason}`);
        }
      });
    } catch (error) {
      this.createAlert('error', 'critical', 'Health Check System Error', 
        `Health check system failed: ${error}`);
    }
  }

  private async checkDatabaseConnection(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simulate database check
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return {
        id: 'database_connection',
        name: 'Database Connection',
        status: 'healthy',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: 'Connection successful'
      };
    } catch (error) {
      return {
        id: 'database_connection',
        name: 'Database Connection',
        status: 'unhealthy',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: `Connection failed: ${error}`
      };
    }
  }

  private async checkApiEndpoints(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simulate API check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        id: 'api_endpoints',
        name: 'API Endpoints',
        status: 'healthy',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: 'All endpoints responding'
      };
    } catch (error) {
      return {
        id: 'api_endpoints',
        name: 'API Endpoints',
        status: 'degraded',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: `Some endpoints slow: ${error}`
      };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    const startTime = Date.now();
    const memUsage = { heapUsed: 50 * 1024 * 1024 }; // Simulate 50MB
    const usageMB = memUsage.heapUsed / 1024 / 1024;
    
    return {
      id: 'memory_usage_check',
      name: 'Memory Usage Check',
      status: usageMB > 1024 ? 'degraded' : 'healthy',
      lastCheck: Date.now(),
      duration: Date.now() - startTime,
      details: `Memory usage: ${usageMB.toFixed(2)}MB`
    };
  }

  private async checkDiskSpace(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simulate disk space check
      await new Promise(resolve => setTimeout(resolve, 20));
      
      return {
        id: 'disk_space',
        name: 'Disk Space',
        status: 'healthy',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: 'Sufficient disk space available'
      };
    } catch (error) {
      return {
        id: 'disk_space',
        name: 'Disk Space',
        status: 'degraded',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: `Disk space check failed: ${error}`
      };
    }
  }

  private async checkExternalServices(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simulate external service check
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        id: 'external_services',
        name: 'External Services',
        status: 'healthy',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: 'All external services accessible'
      };
    } catch (error) {
      return {
        id: 'external_services',
        name: 'External Services',
        status: 'degraded',
        lastCheck: Date.now(),
        duration: Date.now() - startTime,
        details: `Some external services unavailable: ${error}`
      };
    }
  }

  // ============================================================================
  // SYSTEM STATUS
  // ============================================================================

  private updateSystemStatus(): void {
    const metrics = Array.from(this.metrics.values());
    const healthChecks = Array.from(this.healthChecks.values());
    
    // Calculate overall status
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
    const warningMetrics = metrics.filter(m => m.status === 'warning').length;
    const unhealthyChecks = healthChecks.filter(h => h.status === 'unhealthy').length;
    
    if (criticalMetrics > 0 || unhealthyChecks > 0) {
      this.systemStatus.overall = 'unhealthy';
    } else if (warningMetrics > 0) {
      this.systemStatus.overall = 'degraded';
    } else {
      this.systemStatus.overall = 'healthy';
    }

    this.systemStatus.uptime = Date.now() - this.systemStatus.lastRestart;
    
    this.emit('systemStatusUpdated', this.systemStatus);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public updateMetric(id: string, value: number): void {
    const metric = this.metrics.get(id);
    if (metric) {
      metric.value = value;
      metric.lastUpdated = Date.now();
      
      // Keep only last 100 data points
      metric.history.push({ timestamp: Date.now(), value });
      if (metric.history.length > 100) {
        metric.history.shift();
      }
      
      this.emit('metricUpdated', metric);
    }
  }

  public getMetrics(): QualityMetric[] {
    return Array.from(this.metrics.values());
  }

  public getMetric(id: string): QualityMetric | undefined {
    return this.metrics.get(id);
  }

  public getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  public getHealthCheck(id: string): HealthCheck | undefined {
    return this.healthChecks.get(id);
  }

  public getAlerts(options?: { acknowledged?: boolean; resolved?: boolean }): Alert[] {
    let alerts = this.alerts;
    
    if (options?.acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === options.acknowledged);
    }
    
    if (options?.resolved !== undefined) {
      alerts = alerts.filter(alert => alert.resolved === options.resolved);
    }
    
    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getSystemStatus(): SystemStatus {
    return { ...this.systemStatus };
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alertAcknowledged', alert);
    }
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alertResolved', alert);
    }
  }

  private createAlert(
    type: Alert['type'], 
    severity: Alert['severity'], 
    title: string, 
    message: string,
    metricId?: string,
    healthCheckId?: string
  ): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      timestamp: Date.now(),
      metricId,
      healthCheckId,
      acknowledged: false,
      resolved: false
    };

    this.alerts.push(alert);
    this.emit('alertCreated', alert);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.removeAllListeners();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const qualityMonitor = new QualityMonitor();

// ============================================================================
// EXPORTS
// ============================================================================

export default QualityMonitor;
