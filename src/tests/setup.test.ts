/**
 * Kair0s Test Setup
 * 
 * Global test configuration and utilities for automated testing
 * including unit tests, integration tests, and E2E tests.
 */

import { vi, beforeEach, afterEach, expect } from 'vitest';

// ============================================================================
// MOCK CONFIGURATION
// ============================================================================

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  },
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: Function) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id: any) => clearTimeout(id));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

// ============================================================================
// TEST UTILITIES
// ============================================================================

export interface MockResponse {
  status: number;
  data: any;
  headers?: Record<string, string>;
}

export interface MockRequest {
  method: string;
  url: string;
  body?: any;
  headers?: Record<string, string>;
}

export class TestHelper {
  static createMockResponse(data: any, status = 200): MockResponse {
    return {
      status,
      data,
      headers: { 'content-type': 'application/json' }
    };
  }

  static createMockRequest(method: string, url: string, body?: any): MockRequest {
    return {
      method,
      url,
      body,
      headers: { 'content-type': 'application/json' }
    };
  }

  static async waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async waitForCondition(
    condition: () => boolean,
    timeout = 5000,
    interval = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return;
      }
      await this.waitFor(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  static generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static generateRandomString(length = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateMockMetric(overrides: Partial<any> = {}) {
    return {
      id: this.generateRandomId(),
      name: 'Test Metric',
      value: 100,
      target: 100,
      unit: 'ms',
      category: 'performance',
      status: 'good',
      trend: 'stable',
      lastUpdated: Date.now(),
      history: [],
      thresholds: {
        excellent: 50,
        good: 100,
        warning: 200,
        critical: 500
      },
      ...overrides
    };
  }

  static generateMockAlert(overrides: Partial<any> = {}) {
    return {
      id: this.generateRandomId(),
      type: 'metric',
      severity: 'medium',
      title: 'Test Alert',
      message: 'This is a test alert',
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      ...overrides
    };
  }

  static generateMockHealthCheck(overrides: Partial<any> = {}) {
    return {
      id: this.generateRandomId(),
      name: 'Test Health Check',
      status: 'healthy',
      lastCheck: Date.now(),
      duration: 100,
      details: 'Test health check passed',
      ...overrides
    };
  }
}

// ============================================================================
// MOCK SERVICES
// ============================================================================

export class MockQualityMonitor {
  private metrics: any[] = [];
  private alerts: any[] = [];
  private healthChecks: any[] = [];

  getMetrics(): any[] {
    return this.metrics;
  }

  getAlerts(): any[] {
    return this.alerts;
  }

  getHealthChecks(): any[] {
    return this.healthChecks;
  }

  updateMetric(id: string, value: number): void {
    const metric = this.metrics.find(m => m.id === id);
    if (metric) {
      metric.value = value;
      metric.lastUpdated = Date.now();
    }
  }

  createAlert(alert: any): void {
    this.alerts.push(alert);
  }

  addMetric(metric: any): void {
    this.metrics.push(metric);
  }

  addHealthCheck(healthCheck: any): void {
    this.healthChecks.push(healthCheck);
  }

  reset(): void {
    this.metrics = [];
    this.alerts = [];
    this.healthChecks = [];
  }
}

export class MockIntelligentOrchestrator {
  private providers: any[] = [];
  private routingHistory: any[] = [];

  async selectOptimalProvider(query: string): Promise<any> {
    return this.providers[0] || { id: 'mock-provider', name: 'Mock Provider' };
  }

  async routeRequest(request: any): Promise<any> {
    this.routingHistory.push(request);
    return {
      response: `Mock response for: ${request.query}`,
      provider: 'mock-provider',
      responseTime: 100,
      confidence: 0.9
    };
  }

  addProvider(provider: any): void {
    this.providers.push(provider);
  }

  getRoutingHistory(): any[] {
    return this.routingHistory;
  }

  reset(): void {
    this.routingHistory = [];
  }
}

export class MockArtifactManager {
  private artifacts: any[] = [];
  private sessions: any[] = [];

  async createArtifact(artifact: any): Promise<any> {
    const newArtifact = {
      id: TestHelper.generateRandomId(),
      timestamp: Date.now(),
      ...artifact
    };
    this.artifacts.push(newArtifact);
    return newArtifact;
  }

  async createTaskSession(session: any): Promise<any> {
    const newSession = {
      id: TestHelper.generateRandomId(),
      timestamp: Date.now(),
      status: 'active',
      ...session
    };
    this.sessions.push(newSession);
    return newSession;
  }

  async searchArtifacts(query: any): Promise<any[]> {
    return this.artifacts.filter(artifact => 
      artifact.content?.includes(query.query) || 
      artifact.metadata?.type === query.type
    );
  }

  getArtifacts(): any[] {
    return this.artifacts;
  }

  getSessions(): any[] {
    return this.sessions;
  }

  reset(): void {
    this.artifacts = [];
    this.sessions = [];
  }
}

export class MockProactiveContextService {
  private suggestions: any[] = [];
  private contextHistory: any[] = [];

  async analyzeScreenshot(screenshot: any): Promise<any> {
    const context = {
      type: 'code_editor',
      content: 'Mock code content',
      confidence: 0.8,
      timestamp: Date.now()
    };
    this.contextHistory.push(context);
    return context;
  }

  async generateSuggestions(context: any): Promise<any[]> {
    const suggestions = [
      {
        id: TestHelper.generateRandomId(),
        type: 'refactor',
        title: 'Refactor this code',
        description: 'Consider extracting this logic into a separate function',
        confidence: 0.7
      }
    ];
    this.suggestions.push(...suggestions);
    return suggestions;
  }

  getSuggestions(): any[] {
    return this.suggestions;
  }

  getContextHistory(): any[] {
    return this.contextHistory;
  }

  reset(): void {
    this.suggestions = [];
    this.contextHistory = [];
  }
}

// ============================================================================
// TEST FIXTURES
// ============================================================================

export const TEST_FIXTURES = {
  metrics: [
    TestHelper.generateMockMetric({
      id: 'response_time',
      name: 'Response Time',
      value: 850,
      target: 1000,
      unit: 'ms',
      category: 'performance'
    }),
    TestHelper.generateMockMetric({
      id: 'error_rate',
      name: 'Error Rate',
      value: 0.02,
      target: 0.01,
      unit: '%',
      category: 'reliability'
    }),
    TestHelper.generateMockMetric({
      id: 'user_satisfaction',
      name: 'User Satisfaction',
      value: 4.3,
      target: 4.5,
      unit: '/5',
      category: 'usability'
    })
  ],

  alerts: [
    TestHelper.generateMockAlert({
      type: 'metric',
      severity: 'medium',
      title: 'Response Time Increased',
      message: 'Response time has increased above target'
    }),
    TestHelper.generateMockAlert({
      type: 'health',
      severity: 'low',
      title: 'API Endpoints Degraded',
      message: 'Some API endpoints are responding slowly'
    })
  ],

  healthChecks: [
    TestHelper.generateMockHealthCheck({
      id: 'database_connection',
      name: 'Database Connection',
      status: 'healthy',
      duration: 45
    }),
    TestHelper.generateMockHealthCheck({
      id: 'api_endpoints',
      name: 'API Endpoints',
      status: 'degraded',
      duration: 180
    })
  ],

  commands: [
    {
      id: 'cmd_1',
      command: 'help',
      description: 'Show help information',
      category: 'general',
      shortcut: 'Ctrl+H'
    },
    {
      id: 'cmd_2',
      command: 'new session',
      description: 'Create a new session',
      category: 'session',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'cmd_3',
      command: 'settings',
      description: 'Open settings',
      category: 'config',
      shortcut: 'Ctrl+,'
    }
  ],

  presets: [
    {
      id: 'meeting',
      name: 'Meeting',
      description: 'AI assistant for meetings',
      category: 'business',
      icon: '👥',
      inputModes: ['audio', 'chat'],
      constraints: {
        maxDuration: 120,
        enableTranscription: true,
        enableSummary: true
      }
    },
    {
      id: 'prospecting',
      name: 'Prospecting',
      description: 'AI assistant for prospecting',
      category: 'business',
      icon: '🎯',
      inputModes: ['chat', 'automation'],
      constraints: {
        enableResearch: true,
        enableTemplates: true,
        maxContacts: 50
      }
    }
  ]
};

// ============================================================================
// GLOBAL TEST SETUP
// ============================================================================

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});

// ============================================================================
// CUSTOM MATCHERS
// ============================================================================

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeValidTimestamp(received: number) {
    const pass = typeof received === 'number' && received > 0 && received <= Date.now();
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid timestamp`,
        pass: false,
      };
    }
  },

  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  TestHelper,
  MockQualityMonitor,
  MockIntelligentOrchestrator,
  MockArtifactManager,
  MockProactiveContextService,
  TEST_FIXTURES
};
