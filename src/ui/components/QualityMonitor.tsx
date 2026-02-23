/**
 * Kair0s Quality Monitor Dashboard
 * 
 * Real-time dashboard for monitoring application health, performance metrics,
 * and system status with alerts and health checks visualization.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  BarChart3,
  Bell,
  BellOff,
  RefreshCw,
  Settings,
  Eye,
  Zap,
  Shield,
  Users,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../utils/cn.js';

// ============================================================================
// TYPES
// ============================================================================

interface QualityMetric {
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

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  duration: number;
  details?: string;
  dependencies?: string[];
}

interface Alert {
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

interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastRestart: number;
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
}

interface QualityMonitorProps {
  className?: string;
  onMetricClick?: (metric: QualityMetric) => void;
  onAlertAction?: (alert: Alert, action: 'acknowledge' | 'resolve') => void;
  showDetails?: boolean;
  autoRefresh?: boolean;
}

// ============================================================================
// MOCK DATA (connected to quality-monitor.ts)
// ============================================================================

const MOCK_METRICS: QualityMetric[] = [
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
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (19 - i) * 60000,
      value: 800 + Math.random() * 200
    })),
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
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (19 - i) * 60000,
      value: 0.01 + Math.random() * 0.02
    })),
    thresholds: { excellent: 0.01, good: 0.05, warning: 0.1, critical: 0.2 }
  },
  {
    id: 'memory_usage',
    name: 'Memory Usage',
    value: 384,
    target: 512,
    unit: 'MB',
    category: 'performance',
    status: 'good',
    trend: 'stable',
    lastUpdated: Date.now(),
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (19 - i) * 60000,
      value: 350 + Math.random() * 100
    })),
    thresholds: { excellent: 256, good: 512, warning: 1024, critical: 2048 }
  },
  {
    id: 'user_satisfaction',
    name: 'User Satisfaction',
    value: 4.3,
    target: 4.5,
    unit: '/5',
    category: 'usability',
    status: 'good',
    trend: 'up',
    lastUpdated: Date.now(),
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (19 - i) * 60000,
      value: 4.2 + Math.random() * 0.4
    })),
    thresholds: { excellent: 4.5, good: 4.0, warning: 3.5, critical: 3.0 }
  }
];

const MOCK_HEALTH_CHECKS: HealthCheck[] = [
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
  },
  {
    id: 'memory_usage_check',
    name: 'Memory Usage Check',
    status: 'healthy',
    lastCheck: Date.now() - 20000,
    duration: 12,
    details: 'Memory usage within limits'
  },
  {
    id: 'external_services',
    name: 'External Services',
    status: 'healthy',
    lastCheck: Date.now() - 15000,
    duration: 95,
    details: 'All external services accessible'
  }
];

const MOCK_ALERTS: Alert[] = [
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
  },
  {
    id: 'alert_2',
    type: 'health',
    severity: 'low',
    title: 'API Endpoints Degraded',
    message: 'Some API endpoints are responding slowly',
    timestamp: Date.now() - 600000,
    healthCheckId: 'api_endpoints',
    acknowledged: true,
    resolved: false
  }
];

const MOCK_SYSTEM_STATUS: SystemStatus = {
  overall: 'degraded',
  uptime: Date.now() - 86400000, // 24 hours ago
  lastRestart: Date.now() - 86400000,
  version: '1.0.0',
  buildNumber: '2024.02.21',
  environment: 'development'
};

// ============================================================================
// QUALITY MONITOR COMPONENT
// ============================================================================

export const QualityMonitor: React.FC<QualityMonitorProps> = ({
  className = '',
  onMetricClick,
  onAlertAction,
  showDetails = true,
  autoRefresh = true
}) => {
  const [metrics, setMetrics] = useState<QualityMetric[]>(MOCK_METRICS);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>(MOCK_HEALTH_CHECKS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(MOCK_SYSTEM_STATUS);
  const [selectedMetric, setSelectedMetric] = useState<QualityMetric | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * metric.value * 0.1,
          lastUpdated: Date.now(),
          history: [
            ...metric.history.slice(1),
            { timestamp: Date.now(), value: metric.value }
          ]
        }))
      );

      setHealthChecks(prevChecks =>
        prevChecks.map(check => ({
          ...check,
          lastCheck: Date.now(),
          duration: 50 + Math.random() * 200
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const handleAlertAction = useCallback((alert: Alert, action: 'acknowledge' | 'resolve') => {
    setAlerts(prevAlerts =>
      prevAlerts.map(a =>
        a.id === alert.id
          ? { ...a, [action === 'acknowledge' ? 'acknowledged' : 'resolved']: true }
          : a
      )
    );
    onAlertAction?.(alert, action);
  }, [onAlertAction]);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getHealthCheckIcon = (name: string) => {
    if (name.includes('Database')) return <Database className="w-4 h-4" />;
    if (name.includes('API')) return <Server className="w-4 h-4" />;
    if (name.includes('Memory')) return <MemoryStick className="w-4 h-4" />;
    if (name.includes('External')) return <Wifi className="w-4 h-4" />;
    if (name.includes('Disk')) return <HardDrive className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <div className={cn("bg-white rounded-lg shadow-lg border border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quality Monitor</h2>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            getStatusColor(systemStatus.overall)
          )}>
            {systemStatus.overall}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showAlerts ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-600"
            )}
            title={showAlerts ? "Hide Alerts" : "Show Alerts"}
          >
            {showAlerts ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>
          
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {showAlerts && activeAlerts.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Active Alerts ({activeAlerts.length})
            </h3>
            {criticalAlerts.length > 0 && (
              <span className="text-xs text-red-600 font-medium">
                {criticalAlerts.length} critical
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className={cn(
                "p-3 rounded-lg border",
                getSeverityColor(alert.severity)
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">{alert.title}</span>
                      {alert.acknowledged && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-3">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAlertAction(alert, 'acknowledge')}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Acknowledge"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    {!alert.resolved && (
                      <button
                        onClick={() => handleAlertAction(alert, 'resolve')}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Resolve"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900 mb-3">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">Uptime</span>
            </div>
            <div className="font-medium text-sm">{formatUptime(systemStatus.uptime)}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">Version</span>
            </div>
            <div className="font-medium text-sm">{systemStatus.version}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">Environment</span>
            </div>
            <div className="font-medium text-sm capitalize">{systemStatus.environment}</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">Build</span>
            </div>
            <div className="font-medium text-sm">{systemStatus.buildNumber}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-3">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map(metric => (
            <div
              key={metric.id}
              onClick={() => {
                setSelectedMetric(metric);
                onMetricClick?.(metric);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.category === 'performance' && <Cpu className="w-4 h-4 text-blue-600" />}
                  {metric.category === 'usability' && <Users className="w-4 h-4 text-green-600" />}
                  {metric.category === 'reliability' && <Shield className="w-4 h-4 text-purple-600" />}
                  {metric.category === 'business' && <BarChart3 className="w-4 h-4 text-orange-600" />}
                  <span className="font-medium text-sm">{metric.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getStatusColor(metric.status)
                  )}>
                    {metric.status}
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                    <span className="text-sm text-gray-600 ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Target: {metric.target}{metric.unit}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="w-24 h-12 bg-gray-100 rounded flex items-end p-1">
                    {metric.history.slice(-10).map((point, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500 rounded-sm"
                        style={{
                          height: `${(point.value / (metric.target * 2)) * 100}%`,
                          opacity: 0.3 + (i / 10) * 0.7
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(metric.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Checks */}
      {showDetails && (
        <div className="p-4 border-t border-gray-100">
          <h3 className="font-medium text-gray-900 mb-3">Health Checks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthChecks.map(check => (
              <div key={check.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getHealthCheckIcon(check.name)}
                  <div>
                    <div className="font-medium text-sm">{check.name}</div>
                    <div className="text-xs text-gray-500">{check.details}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{check.duration}ms</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    check.status === 'healthy' ? 'bg-green-500' :
                    check.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityMonitor;
