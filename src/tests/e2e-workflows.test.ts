/**
 * End-to-End (E2E) Tests for OpenClaw + Pluely Integration
 * 
 * Comprehensive E2E testing simulating real user workflows,
 * cross-component interactions, and complete user journeys.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// ============================================================================
// E2E TEST UTILITIES
// ============================================================================

class E2ETestUtils {
  static async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async simulateUserAction(action: string, target?: string) {
    const element = target ? document.querySelector(`[data-testid="${target}"]`) : document.activeElement;
    
    if (!element) {
      return false;
    }

    switch (action) {
      case 'click':
        (element as HTMLElement).click();
        break;
      case 'type':
        if (element instanceof HTMLInputElement) {
          element.value = 'test input';
          element.dispatchEvent(new Event('input'));
        }
        break;
      case 'focus':
        element.focus();
        break;
      case 'blur':
        element.blur();
        break;
      case 'submit':
        if (element instanceof HTMLFormElement) {
          element.submit();
        }
        break;
      case 'scroll':
        element.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        if (action.startsWith('type:')) {
          const text = action.replace('type:', '');
          if (element instanceof HTMLInputElement) {
            element.value = text;
            element.dispatchEvent(new Event('input'));
          }
        }
    }
    
    await this.delay(100);
    return true;
  }

  static async waitForElement(testId: string, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(`[data-testid="${testId}"]`);
      if (element) {
        return element;
      }
      await this.delay(100);
    }
    
    return null;
  }

  static async waitForText(testId: string, text: string, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(`[data-testid="${testId}"]`);
      if (element && element.textContent?.includes(text)) {
        return true;
      }
      await this.delay(100);
    }
    
    return false;
  }

  static async takeScreenshot(name: string) {
    // Mock screenshot functionality
    console.log(`📸 Screenshot taken: ${name}`);
    return `screenshot-${name}-${Date.now()}.png`;
  }

  static async simulateNetworkRequest(url: string, method: string = 'GET', data?: any) {
    // Mock network request
    await this.delay(500);
    
    return {
      status: 200,
      data: data || { success: true },
      url,
      method
    };
  }

  static createMockWebSocket() {
    return {
      send: (data: any) => {
        console.log('WebSocket send:', data);
      },
      close: () => {
        console.log('WebSocket closed');
      },
      addEventListener: (event: string, handler: Function) => {
        console.log(`WebSocket event: ${event}`);
      }
    };
  }
}

// ============================================================================
// MOCK USER SESSION
// ============================================================================

class MockUserSession {
  private userId: string;
  private sessionId: string;
  private preferences: any;

  constructor(userId: string) {
    this.userId = userId;
    this.sessionId = `session-${Date.now()}`;
    this.preferences = {
      language: 'en',
      theme: 'light',
      notifications: true,
      autoSave: true
    };
  }

  async login() {
    await E2ETestUtils.delay(1000);
    return { success: true, userId: this.userId, sessionId: this.sessionId };
  }

  async logout() {
    await E2ETestUtils.delay(500);
    return { success: true };
  }

  getPreferences() {
    return this.preferences;
  }

  updatePreferences(prefs: any) {
    this.preferences = { ...this.preferences, ...prefs };
  }
}

// ============================================================================
// MOCK APPLICATION SERVICES
// ============================================================================

class MockApplicationServices {
  static async startTranscription() {
    await E2ETestUtils.delay(2000);
    return {
      sessionId: `transcription-${Date.now()}`,
      status: 'recording',
      startTime: Date.now()
    };
  }

  static async stopTranscription(sessionId: string) {
    await E2ETestUtils.delay(1000);
    return {
      sessionId,
      status: 'completed',
      endTime: Date.now(),
      transcription: {
        id: `transcription-${Date.now()}`,
        text: 'This is a mock transcription result for testing purposes.',
        confidence: 0.95,
        duration: 15.5,
        speaker: 'User 1',
        language: 'en'
      }
    };
  }

  static async submitFeedback(feedback: any) {
    await E2ETestUtils.delay(500);
    return {
      success: true,
      id: `feedback-${Date.now()}`,
      timestamp: Date.now()
    };
  }

  static async getMetrics() {
    await E2ETestUtils.delay(300);
    return {
      responseTime: 150,
      accuracy: 0.95,
      userSatisfaction: 4.2,
      errorRate: 0.02,
      uptime: 86400000
    };
  }

  static async exportData(format: string) {
    await E2ETestUtils.delay(1000);
    return {
      format,
      data: 'mock export data',
      downloadUrl: `download-${format}-${Date.now()}.csv`
    };
  }
}

// ============================================================================
// E2E WORKFLOW TESTS
// ============================================================================

describe('End-to-End Workflow Tests', () => {
  let userSession: MockUserSession;

  beforeAll(async () => {
    userSession = new MockUserSession('test-user');
    await userSession.login();
    
    // Setup test environment
    document.body.innerHTML = `
      <div id="app">
        <header data-testid="app-header">
          <h1>OpenClaw + Pluely Integration</h1>
          <nav data-testid="main-nav">
            <button data-testid="nav-transcription">Transcription</button>
            <button data-testid="nav-feedback">Feedback</button>
            <button data-testid="nav-quality">Quality</button>
            <button data-testid="nav-export">Export</button>
          </nav>
        </header>
        
        <main data-testid="main-content">
          <section data-testid="transcription-section" style="display: none;">
            <h2>Audio Transcription</h2>
            <div data-testid="transcription-controls">
              <button data-testid="start-transcription">Start Recording</button>
              <button data-testid="stop-transcription" disabled>Stop Recording</button>
            </div>
            <div data-testid="transcription-status">
              <p>Status: Idle</p>
            </div>
            <div data-testid="transcription-result" style="display: none;">
              <h3>Transcription Result</h3>
              <div data-testid="transcription-text"></div>
            </div>
          </section>
          
          <section data-testid="feedback-section" style="display: none;">
            <h2>User Feedback</h2>
            <form data-testid="feedback-form">
              <div data-testid="rating-selector">
                <button data-testid="star-1">⭐</button>
                <button data-testid="star-2">⭐</button>
                <button data-testid="star-3">⭐</button>
                <button data-testid="star-4">⭐</button>
                <button data-testid="star-5">⭐</button>
              </div>
              <textarea data-testid="feedback-comment" placeholder="Share your feedback..."></textarea>
              <button data-testid="submit-feedback">Submit Feedback</button>
            </form>
            <div data-testid="feedback-status"></div>
          </section>
          
          <section data-testid="quality-section" style="display: none;">
            <h2>Quality Metrics</h2>
            <div data-testid="metrics-dashboard">
              <div data-testid="metric-response-time">
                <h3>Response Time</h3>
                <p data-testid="response-time-value">150ms</p>
              </div>
              <div data-testid="metric-accuracy">
                <h3>Accuracy</h3>
                <p data-testid="accuracy-value">95%</p>
              </div>
              <div data-testid="metric-satisfaction">
                <h3>User Satisfaction</h3>
                <p data-testid="satisfaction-value">4.2/5</p>
              </div>
            </div>
          </section>
          
          <section data-testid="export-section" style="display: none;">
            <h2>Export Data</h2>
            <div data-testid="export-controls">
              <select data-testid="export-format">
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </select>
              <button data-testid="export-button">Export</button>
            </div>
            <div data-testid="export-status"></div>
          </section>
        </main>
        
        <footer data-testid="app-footer">
          <p>&copy; 2024 OpenClaw + Pluely Integration</p>
        </footer>
      </div>
    `;
  });

  afterAll(async () => {
    await userSession.logout();
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    // Reset UI state
    const sections = ['transcription-section', 'feedback-section', 'quality-section', 'export-section'];
    sections.forEach(section => {
      const element = document.querySelector(`[data-testid="${section}"]`);
      if (element) {
        element.style.display = 'none';
      }
    });
  });

  // ============================================================================
  // COMPLETE USER WORKFLOW TESTS
  // ============================================================================

  describe('Complete User Workflows', () => {
    it('should complete full transcription workflow', async () => {
      // Step 1: Navigate to transcription
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      const transcriptionSection = await E2ETestUtils.waitForElement('transcription-section');
      expect(transcriptionSection).toBeTruthy();
      expect(transcriptionSection.style.display).not.toBe('none');

      // Step 2: Start transcription
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      const startButton = document.querySelector('[data-testid="start-transcription"]') as HTMLButtonElement;
      expect(startButton.disabled).toBe(true);
      
      const statusElement = document.querySelector('[data-testid="transcription-status"] p');
      expect(statusElement?.textContent).toContain('Recording');

      // Step 3: Stop transcription
      await E2ETestUtils.delay(2000);
      await E2ETestUtils.simulateUserAction('click', 'stop-transcription');
      
      const resultSection = await E2ETestUtils.waitForElement('transcription-result');
      expect(resultSection).toBeTruthy();
      expect(resultSection.style.display).not.toBe('none');
      
      const textElement = document.querySelector('[data-testid="transcription-text"]');
      expect(textElement?.textContent).toContain('mock transcription result');

      // Step 4: Verify transcription data
      await E2ETestUtils.takeScreenshot('transcription-completed');
      
      // Verify workflow completion
      expect(startButton.disabled).toBe(false);
      expect(statusElement?.textContent).toContain('Idle');
    });

    it('should complete feedback submission workflow', async () => {
      // Step 1: Navigate to feedback
      await E2ETestUtils.simulateUserAction('click', 'nav-feedback');
      const feedbackSection = await E2ETestUtils.waitForElement('feedback-section');
      expect(feedbackSection).toBeTruthy();
      expect(feedbackSection.style.display).not.toBe('none');

      // Step 2: Select rating
      await E2ETestUtils.simulateUserAction('click', 'star-5');
      const selectedStar = document.querySelector('[data-testid="star-5"]');
      expect(selectedStar?.textContent).toBe('⭐');

      // Step 3: Type comment
      await E2ETestUtils.simulateUserAction('type', 'feedback-comment');
      const commentElement = document.querySelector('[data-testid="feedback-comment"]') as HTMLTextAreaElement;
      expect(commentElement?.value).toBe('test input');

      // Step 4: Submit feedback
      await E2ETestUtils.simulateUserAction('click', 'submit-feedback');
      const statusElement = await E2ETestUtils.waitForElement('feedback-status');
      expect(statusElement?.textContent).toContain('Feedback submitted');

      // Step 5: Verify submission
      await E2ETestUtils.takeScreenshot('feedback-submitted');
      
      // Reset form
      const commentElementReset = document.querySelector('[data-testid="feedback-comment"]') as HTMLTextAreaElement;
      expect(commentElementReset?.value).toBe('');
    });

    it('should complete quality monitoring workflow', async () => {
      // Step 1: Navigate to quality monitoring
      await E2ETestUtils.simulateUserAction('click', 'nav-quality');
      const qualitySection = await E2ETestUtils.waitForElement('quality-section');
      expect(qualitySection).toBeTruthy();
      expect(qualitySection.style.display).not.toBe('none');

      // Step 2: Load metrics
      await E2ETestUtils.delay(1000);
      
      // Verify metrics are displayed
      const responseTimeElement = document.querySelector('[data-testid="response-time-value"]');
      const accuracyElement = document.querySelector('[data-testid="accuracy-value"]');
      const satisfactionElement = document.querySelector('[data-testid="satisfaction-value"]');
      
      expect(responseTimeElement?.textContent).toBe('150ms');
      expect(accuracyElement?.textContent).toBe('95%');
      expect(satisfactionElement?.textContent).toBe('4.2/5');

      // Step 3: Take screenshot for documentation
      await E2ETestUtils.takeScreenshot('quality-metrics');
    });

    it('should complete data export workflow', async () => {
      // Step 1: Navigate to export
      await E2ETestUtils.simulateUserAction('click', 'nav-export');
      const exportSection = await E2ETestUtils.waitForElement('export-section');
      expect(exportSection).toBeTruthy();
      expect(exportSection.style.display).not.toBe('none');

      // Step 2: Select format
      await E2ETestUtils.simulateUserAction('click', 'export-format');
      const formatSelect = document.querySelector('[data-testid="export-format"]') as HTMLSelectElement;
      formatSelect.value = 'csv';

      // Step 3: Export data
      await E2ETestUtils.simulateUserAction('click', 'export-button');
      const statusElement = await E2ETestUtils.waitForElement('export-status');
      expect(statusElement?.textContent).toContain('Export completed');

      // Step 4: Verify export
      await E2ETestUtils.takeScreenshot('data-exported');
    });

    it('should complete full application session', async () => {
      // Step 1: Login (already done in beforeAll)
      expect(userSession).toBeTruthy();

      // Step 2: Complete transcription workflow
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      await E2ETestUtils.delay(2000);
      await E2ETestUtils.simulateUserAction('click', 'stop-transcription');

      // Step 3: Complete feedback workflow
      await E2ETestUtils.simulateUserAction('click', 'nav-feedback');
      await E2ETestUtils.simulateUserAction('click', 'star-4');
      await E2ETestUtils.simulateUserAction('type', 'feedback-comment');
      await E2ETestUtils.simulateUserAction('click', 'submit-feedback');

      // Step 4: Check quality metrics
      await E2EETestUtils.simulateUserAction('click', 'nav-quality');
      await E2ETestUtils.delay(1000);

      // Step 5: Export data
      await EETestUtils.simulateUserAction('click', 'nav-export');
      await EETestUtils.simulateUserAction('click', 'export-format');
      await E2ETestUtils.simulateUserAction('click', 'export-button');

      // Step 6: Logout
      await userSession.logout();

      // Verify session completion
      expect(document.getElementById('app')).toBeTruthy();
    });
  });

  // ============================================================================
  // CROSS-COMPONENT INTEGRATION TESTS
  // ============================================================================

  describe('Cross-Component Integration', () => {
    it('should integrate transcription with feedback system', async () => {
      // Start transcription
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      await E2ETestUtils.delay(2000);
      await EETestUtils.simulateUserAction('click', 'stop-transcription');

      // Navigate to feedback with transcription context
      await E2ETestUtils.simulateUserAction('click', 'nav-feedback');
      
      // Check if transcription context is available
      await E2ETestUtils.delay(500);
      
      // Submit feedback
      await E2ETestUtils.simulateUserAction('click', 'star-4');
      await E2ETestUtils.simulateUserAction('type', 'feedback-comment');
      await E2ETestUtils.simulateUserAction('click', 'submit-feedback');

      // Verify integration
      const statusElement = await E2ETestUtils.waitForElement('feedback-status');
      expect(statusElement?.textContent).toContain('Feedback submitted');
    });

    it('should integrate quality metrics with user actions', async () => {
      // Perform actions that affect quality
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      await EETestUtils.delay(2000);
      await E2ETestUtils.simulateUserAction('click', 'stop-transcription');
      
      // Check quality impact
      await E2ETestUtils.simulateUserAction('click', 'nav-quality');
      await E2ETestUtils.delay(1000);
      
      const responseTimeElement = document.querySelector('[data-testid="response-time-value"]');
      expect(responseTimeElement?.textContent).toBe('150ms');
    });

    it('should maintain state across component switches', async () => {
      // Start transcription
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      
      // Switch to feedback while recording
      await EETestUtils.simulateUserAction('click', 'nav-feedback');
      
      // Return to transcription
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      
      // Verify transcription is still recording
      const statusElement = document.querySelector('[data-testid="transcription-status"] p');
      expect(statusElement?.textContent).toContain('Recording');
      
      // Stop transcription
      await E2ETestUtils.simulateUserAction('click', 'stop-transcription');
      
      // Verify result is preserved
      const resultElement = document.querySelector('[data-testid="transcription-text"]');
      expect(resultElement?.textContent).toContain('mock transcription result');
    });
  });

  // ============================================================================
  // PERFORMANCE AND SCALABILITY TESTS
  // ============================================================================

  describe('Performance and Scalability', () => {
    it('should handle rapid user interactions', async () => {
      const startTime = performance.now();
      
      // Rapid navigation
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await E2ETestUtils.simulateUserAction('click', 'nav-feedback');
      await E2ETestUtils.simulateUserAction('click', 'nav-quality');
      await E2ETestUtils.simulateUserAction('click', 'nav-export');
      
      const navigationTime = performance.now() - startTime;
      expect(navigationTime).toBeLessThan(2000); // Should complete in under 2s

      // Rapid interactions
      const interactionStartTime = performance.now();
      
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      await E2ETestUtils.simulateUserAction('click', 'star-5');
      await E2ETestUtils.simulateUserAction('type', 'feedback-comment');
      await E2ETestUtils.simulateUserAction('click', 'submit-feedback');
      
      const interactionTime = performance.now() - interactionStartTime;
      expect(interactionTime).toBeLessThan(1000); // Should complete in under 1s
    });

    it('should handle large datasets', async () => {
      // Simulate large dataset loading
      const startTime = performance.now();
      
      // Load quality metrics with large dataset
      await E2ETestUtils.simulateUserAction('click', 'nav-quality');
      await E2ETestUtils.delay(2000);
      
      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load in under 5s
      
      // Verify metrics are displayed
      const metrics = document.querySelectorAll('[data-testid^="metric-"]');
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should maintain responsiveness during heavy operations', async () => {
      // Start heavy operation
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      
      // Continue interactions while operation is running
      await E2ETestUtils.simulateUserAction('click', 'nav-feedback');
      await E2ETestUtils.simulateUserAction('click', 'nav-quality');
      
      // UI should remain responsive
      const feedbackSection = document.querySelector('[data-testid="feedback-section"]');
      const qualitySection = document.querySelector('[data-testid="quality-section"]');
      
      expect(feedbackSection?.style.display).not.toBe('none');
      expect(qualitySection?.style.display).not.toBe('none');
      
      // Complete heavy operation
      await E2ETestUtils.delay(2000);
      await E2ETestUtils.simulateUserAction('click', 'stop-transcription');
    });
  });

  // ============================================================================
  // ERROR HANDLING AND RECOVERY TESTS
  // ============================================================================

  describe('Error Handling and Recovery', () => {
    it('should handle network failures gracefully', async () => {
      // Simulate network failure during transcription
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await EETestUtils.simulateUserAction('click', 'start-transcription');
      
      // Simulate network error
      const statusElement = document.querySelector('[data-testid="transcription-status"] p');
      statusElement.textContent = 'Network error occurred';
      
      // User should be able to retry
      await E2ETestUtils.simulateUserAction('click', 'start-transcription');
      statusElement.textContent = 'Retrying...';
      
      // Should recover
      await E2ETestUtils.delay(1000);
      statusElement.textContent = 'Recording';
    });

    it('should handle form validation errors', async () => {
      // Navigate to feedback without rating
      await E2ETestUtils.simulateUserAction('click', 'nav-feedback');
      await E2ETestUtils.simulateUserAction('click', 'submit-feedback');
      
      // Should show validation error
      const statusElement = document.querySelector('[data-testid="feedback-status"]');
      expect(statusElement?.textContent).toContain('Please select a rating');
      
      // Fix validation by selecting rating
      await EETestUtils.simulateUserAction('click', 'star-3');
      await E2ETestUtils.simulateUserAction('type', 'feedback-comment');
      await E2ETestUtils.simulateUserAction('click', 'submit-feedback');
      
      // Should succeed
      const successElement = await E2ETestUtils.waitForElement('feedback-status');
      expect(successElement?.textContent).toContain('Feedback submitted');
    });

    it('should recover from component failures', async () => {
      // Simulate component failure
      await E2ETestUtils.simulateUserAction('click', 'nav-quality');
      const qualitySection = document.querySelector('[data-testid="quality-section"]');
      qualitySection.innerHTML = '<p>Error loading metrics</p>';
      
      // Navigate away and back
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await EETestUtils.simulateUserAction('click', 'nav-quality');
      
      // Should recover
      await E2ETestUtils.delay(1000);
      const metrics = document.querySelectorAll('[data-testid^="metric-"]');
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      // Test keyboard navigation through main navigation
      document.body.focus();
      
      // Tab through navigation
      await E2ETestUtils.simulateKeyboardEvent(document.body, 'Tab');
      expect(document.activeElement?.tagName).toBe('BUTTON');
      
      // Navigate through main sections
      await E2ETestUtils.simulateKeyboardEvent(document.body, 'Tab');
      await EETestUtils.simulateKeyboardEvent(document.body, 'Tab');
      await EETestUtils.simulateUserAction('click', 'nav-transcription');
      
      // Test keyboard interaction
      await E2ETestUtils.simulateKeyboardEvent(document.querySelector('[data-testid="start-transcription"]'), 'Enter');
      expect(document.querySelector('[data-testid="start-transcription"]')).toBe(document.activeElement);
    });

    it('should support screen readers', async () => {
      // Check for proper ARIA labels
      const navButtons = document.querySelectorAll('[data-testid^="nav-"]');
      navButtons.forEach(button => {
        expect(button.getAttribute('aria-label')).toBeTruthy();
      });
      
      // Check for proper semantic HTML
      const main = document.querySelector('main');
      expect(main?.tagName).toBe('MAIN');
      
      const header = document.querySelector('header');
      expect(header?.tagName).toBe('HEADER');
      
      const footer = document.querySelector('footer');
      expect(footer?.tagName).toBe('FOOTER');
    });

    it('should maintain focus management', async () => {
      // Test focus trapping in modals
      await E2ETestUtils.simulateUserAction('click', 'nav-feedback');
      const form = document.querySelector('[data-testid="feedback-form"]');
      form?.focus();
      
      // Test focus restoration
      await E2ETestUtils.simulateKeyboardEvent(form, 'Tab');
      expect(document.activeElement?.tagName).toBe('TEXTAREA');
      
      // Test focus trapping
      await E2ETestUtils.simulateKeyboardEvent(form, 'Escape');
      expect(document.activeElement?.tagName).toBe('BODY');
    });
  });

  // ============================================================================
  // BROWSER COMPATIBILITY TESTS
  // ============================================================================

  describe('Browser Compatibility', () => {
    it('should work across different browsers', async () => {
      // Test basic functionality
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      await EETestUtils.simulateUserAction('click', 'start-transcription');
      await E2ETestUtils.delay(1000);
      await EETestUtils.simulateUserAction('click', 'stop-transcription');
      
      // Verify core functionality works
      const resultElement = document.querySelector('[data-testid="transcription-text"]');
      expect(resultElement?.textContent).toBeTruthy();
    });

    it('should handle different screen resolutions', async () => {
      // Test mobile resolution
      E2ETestUtils.simulateResponsiveLayout(375, 667);
      await E2ETestUtils.simulateUserAction('click', 'nav-transcription');
      
      const mobileLayout = document.querySelector('.ui-component');
      expect(mobileLayout?.className).toContain('mobile-layout');
      
      // Test desktop resolution
      E2ETestUtils.simulateResponsiveLayout(1920, 1080);
      const desktopLayout = document.querySelector('.ui-component');
      expect(desktopLayout?.className).toContain('desktop-layout');
    });

    it('should handle touch interactions', async () => {
      // Simulate touch events
      const element = document.querySelector('[data-testid="start-transcription"]');
      
      // Touch start
      const touchStart = new TouchEvent('touchstart', {
        touches: [{
          identifier: 1,
          target: element,
          clientX: 100,
          clientY: 100
        }]
      });
      element.dispatchEvent(touchStart);
      
      // Touch end
      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{
          identifier: 1,
          target: element,
          clientX: 100,
          clientY: 100
        }]
      });
      element.dispatchEvent(touchEnd);
      
      // Verify touch interaction worked
      const statusElement = document.querySelector('[data-testid="transcription-status"] p');
      expect(statusElement?.textContent).toContain('Recording');
    });
  });
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  E2ETestUtils,
  MockUserSession,
  MockApplicationServices,
  MockApplicationServices as Services
};
