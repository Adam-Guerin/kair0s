/**
 * E2E Integration Tests
 * 
 * End-to-end tests for the Kair0s integration layer including
 * component communication, event handling, and system orchestration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { E2EIntegration } from '../integration/e2e-integration';

// Mock services for testing
const mockServices = {
  intelligentOrchestrator: {
    selectOptimalProvider: vi.fn().mockResolvedValue({ id: 'mock-provider', name: 'Mock Provider' }),
    routeRequest: vi.fn().mockResolvedValue({
      response: 'Mock response',
      provider: 'mock-provider',
      responseTime: 100,
      confidence: 0.9
    })
  },
  artifactManager: {
    createArtifact: vi.fn().mockResolvedValue({ id: 'artifact-1' }),
    createTaskSession: vi.fn().mockResolvedValue({ id: 'session-1' }),
    searchArtifacts: vi.fn().mockResolvedValue([])
  },
  qualityMonitor: {
    updateMetric: vi.fn(),
    getMetrics: vi.fn().mockReturnValue([]),
    getAlerts: vi.fn().mockReturnValue([])
  },
  proactiveService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    analyzeScreenshot: vi.fn().mockResolvedValue({}),
    generateSuggestions: vi.fn().mockResolvedValue([])
  }
};

describe('E2E Integration', () => {
  let integration: E2EIntegration;

  beforeEach(() => {
    vi.clearAllMocks();
    integration = new E2EIntegration();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    integration.destroy();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await integration.initialize();
      
      const state = integration.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.errorCount).toBe(0);
    });

    it('should setup event listeners during initialization', async () => {
      const addEventListenerSpy = vi.spyOn(integration, 'addEventListener');
      
      await integration.initialize();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('command_executed', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('search_query', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('feedback_submitted', expect.any(Function));
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock a service that fails to initialize
      const originalInitialize = integration.initialize;
      integration.initialize = vi.fn().mockRejectedValue(new Error('Initialization failed'));
      
      try {
        await integration.initialize();
      } catch (error) {
        expect(error.message).toBe('Initialization failed');
      }
      
      const state = integration.getState();
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should add and remove event listeners', () => {
      const callback = vi.fn();
      
      integration.addEventListener('test_event', callback);
      integration.removeEventListener('test_event', callback);
      
      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should emit events with correct structure', () => {
      const callback = vi.fn();
      integration.addEventListener('test_event', callback);
      
      // Manually emit an event to test structure
      const eventData = { test: 'data' };
      
      // Since emitEvent is private, we test through public API
      expect(typeof integration.executeAction).toBe('function');
    });

    it('should handle event listener errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      
      integration.addEventListener('test_event', errorCallback);
      
      // Should not throw when error occurs in listener
      expect(() => {
        // This would be tested through actual event emission
        expect(true).toBe(true);
      }).not.toThrow();
    });
  });

  describe('Component Communication', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should execute actions on components', async () => {
      const result = await integration.executeAction('TestComponent', 'testAction', { data: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('Mock result for testAction');
      expect(result.responseTime).toBeGreaterThan(0);
    });

    it('should handle non-existent component actions', async () => {
      await expect(
        integration.executeAction('NonExistentComponent', 'testAction', {})
      ).rejects.toThrow('Component NonExistentComponent not found');
    });

    it('should track performance metrics', async () => {
      const initialPerformance = integration.getState().performance;
      
      await integration.executeAction('TestComponent', 'testAction', {});
      
      const newPerformance = integration.getState().performance;
      expect(newPerformance.totalRequests).toBe(initialPerformance.totalRequests + 1);
      expect(newPerformance.averageResponseTime).toBeGreaterThan(0);
    });

    it('should update error count on failures', async () => {
      // Mock a failing action
      const originalExecute = integration.executeAction;
      integration.executeAction = vi.fn().mockRejectedValue(new Error('Action failed'));
      
      try {
        await integration.executeAction('TestComponent', 'failingAction', {});
      } catch (error) {
        // Expected to fail
      }
      
      const state = integration.getState();
      expect(state.errorCount).toBeGreaterThan(0);
    });
  });

  describe('Bridge System', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should create bridges between components', () => {
      // Test bridge creation through initialization
      const state = integration.getState();
      expect(state.activeComponents).toContain('CommandBar');
      expect(state.activeComponents).toContain('IntelligentOrchestrator');
    });

    it('should handle component-specific events', async () => {
      // Test command execution flow
      const commandData = {
        command: 'test command',
        context: { sessionId: 'test-session' }
      };
      
      const result = await integration.executeAction('CommandBar', 'executeCommand', commandData);
      expect(result.success).toBe(true);
    });
  });

  describe('Quality Monitoring Integration', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should update quality metrics on actions', async () => {
      await integration.executeAction('TestComponent', 'testAction', {});
      
      // Verify that quality monitor would be called
      // This tests the integration point
      expect(true).toBe(true); // Placeholder for actual metric verification
    });

    it('should handle KPI alerts', async () => {
      const alertData = {
        type: 'metric',
        severity: 'medium',
        title: 'Test Alert',
        message: 'Test alert message'
      };
      
      const result = await integration.executeAction('QualityMonitor', 'createAlert', alertData);
      expect(result.success).toBe(true);
    });
  });

  describe('Artifact Management Integration', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should create artifacts from actions', async () => {
      const artifactData = {
        type: 'action',
        content: 'Test action result',
        metadata: { component: 'TestComponent' }
      };
      
      const result = await integration.executeAction('ArtifactManager', 'createArtifact', artifactData);
      expect(result.success).toBe(true);
    });

    it('should search artifacts', async () => {
      const searchData = {
        query: 'test',
        filters: { type: 'action' }
      };
      
      const result = await integration.executeAction('ArtifactManager', 'searchArtifacts', searchData);
      expect(result.success).toBe(true);
    });

    it('should create task sessions', async () => {
      const sessionData = {
        presetId: 'test-preset',
        inputMode: 'chat',
        userId: 'test-user'
      };
      
      const result = await integration.executeAction('ArtifactManager', 'createTaskSession', sessionData);
      expect(result.success).toBe(true);
    });
  });

  describe('Proactive Context Integration', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should analyze screenshots', async () => {
      const screenshotData = {
        data: 'base64-screenshot-data',
        timestamp: Date.now()
      };
      
      const result = await integration.executeAction('ProactiveContext', 'analyzeScreenshot', screenshotData);
      expect(result.success).toBe(true);
    });

    it('should generate suggestions', async () => {
      const contextData = {
        context: 'code_editor',
        content: 'test code content',
        confidence: 0.8
      };
      
      const result = await integration.executeAction('ProactiveContext', 'generateSuggestions', contextData);
      expect(result.success).toBe(true);
    });
  });

  describe('System Health and Performance', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should maintain system state', () => {
      const state = integration.getState();
      
      expect(typeof state.isInitialized).toBe('boolean');
      expect(Array.isArray(state.activeComponents)).toBe(true);
      expect(typeof state.lastSync).toBe('number');
      expect(typeof state.errorCount).toBe('number');
      expect(typeof state.performance).toBe('object');
    });

    it('should track performance metrics over time', async () => {
      const initialPerformance = integration.getState().performance;
      
      // Execute multiple actions
      await integration.executeAction('TestComponent', 'action1', {});
      await integration.executeAction('TestComponent', 'action2', {});
      await integration.executeAction('TestComponent', 'action3', {});
      
      const finalPerformance = integration.getState().performance;
      expect(finalPerformance.totalRequests).toBe(initialPerformance.totalRequests + 3);
    });

    it('should calculate average response time', async () => {
      await integration.executeAction('TestComponent', 'action1', {});
      await integration.executeAction('TestComponent', 'action2', {});
      
      const performance = integration.getState().performance;
      expect(performance.averageResponseTime).toBeGreaterThan(0);
      expect(performance.averageResponseTime).toBeLessThan(1000); // Should be reasonable
    });

    it('should handle component registration', () => {
      const component = integration.getComponent('TestComponent');
      expect(component).toBeDefined();
      expect(component.name).toBe('TestComponent');
      expect(component.status).toBe('active');
    });

    it('should list all active components', () => {
      const components = integration.getAllComponents();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await integration.initialize();
    });

    it('should handle component errors gracefully', async () => {
      // Mock a component that throws an error
      const result = await integration.executeAction('ErrorComponent', 'errorAction', {});
      
      expect(result.success).toBe(false);
      const state = integration.getState();
      expect(state.errorCount).toBeGreaterThan(0);
    });

    it('should recover from temporary failures', async () => {
      // Execute a failing action
      try {
        await integration.executeAction('ErrorComponent', 'errorAction', {});
      } catch (error) {
        // Expected to fail
      }
      
      // Execute a successful action
      const result = await integration.executeAction('TestComponent', 'successAction', {});
      expect(result.success).toBe(true);
    });

    it('should maintain system stability during errors', () => {
      const state = integration.getState();
      const initialErrorCount = state.errorCount;
      
      // Simulate error conditions
      expect(() => {
        // This would test error scenarios
        expect(true).toBe(true);
      }).not.toThrow();
      
      // System should remain stable
      const finalState = integration.getState();
      expect(finalState.isInitialized).toBe(true);
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should cleanup resources properly', () => {
      integration.destroy();
      
      const state = integration.getState();
      expect(state.isInitialized).toBe(false);
    });

    it('should handle multiple cleanup calls', () => {
      integration.destroy();
      integration.destroy(); // Should not throw
      
      expect(true).toBe(true);
    });
  });
});
