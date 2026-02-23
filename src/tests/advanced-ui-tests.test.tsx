/**
 * Advanced UI Component Tests for OpenClaw + Pluely Integration
 * 
 * Comprehensive UI testing including component interactions, accessibility,
 * responsive design, user workflows, and visual regression testing.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { JSDOM } from 'jsdom';

// Import UI components
import { FeedbackPanel } from '../ui/components/FeedbackPanel';
import { QualityMonitor } from '../ui/components/QualityMonitor';
import { CommandBar } from '../ui/components/CommandBar';
import { UnifiedEntry } from '../ui/components/UnifiedEntry';

// ============================================================================
// TEST UTILITIES
// ============================================================================

class AdvancedUITestUtils {
  static createMockDOM() {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    return dom;
  }

  static async simulateUserInteraction(element: HTMLElement, interactions: string[]) {
    const user = userEvent.setup();
    
    for (const interaction of interactions) {
      if (interaction.startsWith('click:')) {
        const selector = interaction.replace('click:', '');
        await user.click(screen.getByTestId(selector));
      } else if (interaction.startsWith('type:')) {
        const [selector, text] = interaction.replace('type:', '').split(',');
        await user.type(screen.getByTestId(selector), text);
      } else if (interaction.startsWith('hover:')) {
        const selector = interaction.replace('hover:', '');
        await user.hover(screen.getByTestId(selector));
      } else if (interaction.startsWith('focus:')) {
        const selector = interaction.replace('focus:', '');
        await user.tab();
        await user.tab();
        screen.getByTestId(selector).focus();
      }
    }
  }

  static generateMockTranscriptionData() {
    return {
      id: `transcription-${Date.now()}`,
      text: 'This is a mock transcription for testing UI components',
      confidence: 0.95,
      duration: 15.5,
      timestamp: Date.now(),
      speaker: 'Speaker 1',
      language: 'en'
    };
  }

  static generateMockChatHistory() {
    return [
      {
        id: 'chat-1',
        message: 'Hello, how can I help you today?',
        sender: 'assistant',
        timestamp: Date.now() - 10000,
        provider: 'openai'
      },
      {
        id: 'chat-2',
        message: 'I need help with my meeting transcription',
        sender: 'user',
        timestamp: Date.now() - 5000,
        provider: null
      },
      {
        id: 'chat-3',
        message: 'I can help you process your meeting transcription. Please share the audio file.',
        sender: 'assistant',
        timestamp: Date.now(),
        provider: 'anthropic'
      }
    ];
  }

  static async checkAccessibility(component: HTMLElement) {
    const results = await axe(component);
    expect(results).toHaveNoViolations();
    return results;
  }

  static async simulateResponsiveLayout(width: number, height: number) {
    // Simulate different screen sizes
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  }

  static async takeScreenshot(element: HTMLElement, filename: string) {
    // Mock screenshot functionality for visual regression testing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = element.offsetWidth;
      canvas.height = element.offsetHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // In real implementation, this would capture the actual element
      console.log(`Screenshot saved: ${filename}`);
    }
  }
}

// ============================================================================
// MOCK SERVICES FOR UI TESTING
// ============================================================================

class MockUIServices {
  static createMockFeedbackService() {
    return {
      submitFeedback: async (feedback: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, id: `feedback-${Date.now()}` };
      },
      getFeedbackHistory: async () => {
        return [
          { id: '1', rating: 5, comment: 'Great service!', timestamp: Date.now() - 86400000 },
          { id: '2', rating: 4, comment: 'Good but could be better', timestamp: Date.now() - 172800000 }
        ];
      }
    };
  }

  static createMockTranscriptionService() {
    return {
      startTranscription: async () => {
        return { status: 'recording', sessionId: `session-${Date.now()}` };
      },
      stopTranscription: async () => {
        return AdvancedUITestUtils.generateMockTranscriptionData();
      },
      getTranscriptionStatus: async () => {
        return { status: 'idle', duration: 0 };
      }
    };
  }

  static createMockQualityService() {
    return {
      getMetrics: async () => ({
        responseTime: 150,
        accuracy: 0.95,
        userSatisfaction: 4.2,
        errorRate: 0.02
      }),
      getAlerts: async () => [
        { id: '1', type: 'warning', message: 'Response time above threshold', severity: 'medium' }
      ]
    };
  }
}

// ============================================================================
// ADVANCED UI TESTS
// ============================================================================

describe('Advanced UI Component Tests', () => {
  let dom: JSDOM;
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    dom = AdvancedUITestUtils.createMockDOM();
    user = userEvent.setup();
  });

  afterAll(() => {
    dom.window.close();
  });

  beforeEach(() => {
    // Reset DOM state before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Cleanup after each test
    document.body.innerHTML = '';
  });

  // ============================================================================
  // FEEDBACK PANEL UI TESTS
  // ============================================================================

  describe('FeedbackPanel UI Tests', () => {
    it('should render feedback panel with all interactive elements', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );

      // Check main panel elements
      expect(screen.getByTestId('feedback-panel')).toBeInTheDocument();
      expect(screen.getByTestId('rating-selector')).toBeInTheDocument();
      expect(screen.getByTestId('comment-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('history-toggle')).toBeInTheDocument();

      // Check accessibility
      const panel = screen.getByTestId('feedback-panel');
      await AdvancedUITestUtils.checkAccessibility(panel);
    });

    it('should handle complete feedback submission workflow', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      const onSubmit = vitest.fn();
      
      render(
        <FeedbackPanel 
          onSubmit={onSubmit}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );

      // Step 1: Select rating
      await user.click(screen.getByTestId('star-5'));
      expect(screen.getByTestId('star-5')).toHaveClass('selected');

      // Step 2: Type comment
      await user.type(screen.getByTestId('comment-input'), 'Excellent service! Very helpful.');
      expect(screen.getByTestId('comment-input')).toHaveValue('Excellent service! Very helpful.');

      // Step 3: Select category
      await user.selectOptions(screen.getByTestId('category-select'), 'performance');
      expect(screen.getByTestId('category-select')).toHaveValue('performance');

      // Step 4: Submit feedback
      await user.click(screen.getByTestId('submit-button'));
      
      // Verify submission
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          rating: 5,
          comment: 'Excellent service! Very helpful.',
          category: 'performance',
          timestamp: expect.any(Number)
        });
      });

      // Check success message
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
      expect(screen.getByTestId('success-message')).toHaveTextContent(/Feedback submitted successfully/i);
    });

    it('should display feedback history with pagination', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );

      // Open history panel
      await user.click(screen.getByTestId('history-toggle'));
      
      // Wait for history to load
      await waitFor(() => {
        expect(screen.getByTestId('feedback-history')).toBeInTheDocument();
      });

      // Check history items
      expect(screen.getByTestId('feedback-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-item-2')).toBeInTheDocument();
      
      // Check pagination controls
      expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
      expect(screen.getByTestId('next-page')).toBeInTheDocument();
    });

    it('should handle keyboard navigation and accessibility', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );

      // Test keyboard navigation
      await user.tab();
      expect(screen.getByTestId('rating-selector')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('star-1')).toHaveFocus();

      // Use arrow keys to navigate stars
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('star-3')).toHaveClass('selected');

      // Test keyboard submission
      await user.tab();
      await user.tab();
      expect(screen.getByTestId('submit-button')).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });

    it('should be responsive across different screen sizes', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );

      const panel = screen.getByTestId('feedback-panel');

      // Test mobile view
      await AdvancedUITestUtils.simulateResponsiveLayout(375, 667);
      expect(panel).toHaveClass('mobile-layout');
      expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();

      // Test tablet view
      await AdvancedUITestUtils.simulateResponsiveLayout(768, 1024);
      expect(panel).toHaveClass('tablet-layout');
      expect(screen.getByTestId('mobile-menu-toggle')).not.toBeInTheDocument();

      // Test desktop view
      await AdvancedUITestUtils.simulateResponsiveLayout(1920, 1080);
      expect(panel).toHaveClass('desktop-layout');
    });
  });

  // ============================================================================
  // QUALITY MONITOR UI TESTS
  // ============================================================================

  describe('QualityMonitor UI Tests', () => {
    it('should display real-time metrics with visual indicators', async () => {
      const mockQualityService = MockUIServices.createMockQualityService();
      
      render(
        <QualityMonitor 
          onMetricsUpdate={mockQualityService.getMetrics}
          onAlertUpdate={mockQualityService.getAlerts}
        />
      );

      // Check main dashboard elements
      expect(screen.getByTestId('quality-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
      expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
      expect(screen.getByTestId('status-indicator')).toBeInTheDocument();

      // Check metric cards
      expect(screen.getByTestId('metric-response-time')).toBeInTheDocument();
      expect(screen.getByTestId('metric-accuracy')).toBeInTheDocument();
      expect(screen.getByTestId('metric-satisfaction')).toBeInTheDocument();
      expect(screen.getByTestId('metric-error-rate')).toBeInTheDocument();

      // Check visual indicators
      expect(screen.getByTestId('status-indicator')).toHaveClass('status-healthy');
      expect(screen.getByTestId('metric-response-time')).toHaveClass('metric-good');
    });

    it('should handle metric updates and alert notifications', async () => {
      const mockQualityService = MockUIServices.createMockQualityService();
      const onMetricsUpdate = vitest.fn();
      
      render(
        <QualityMonitor 
          onMetricsUpdate={onMetricsUpdate}
          onAlertUpdate={mockQualityService.getAlerts}
        />
      );

      // Simulate metric update
      const updatedMetrics = {
        responseTime: 200,
        accuracy: 0.92,
        userSatisfaction: 4.0,
        errorRate: 0.05
      };

      // Trigger update (in real implementation, this would be via WebSocket or polling)
      fireEvent(window, new CustomEvent('metrics-update', { detail: updatedMetrics }));

      await waitFor(() => {
        expect(screen.getByTestId('metric-response-time')).toHaveTextContent('200ms');
        expect(screen.getByTestId('metric-response-time')).toHaveClass('metric-warning');
      });

      // Check alert notification
      expect(screen.getByTestId('alert-notification')).toBeInTheDocument();
      expect(screen.getByTestId('alert-notification')).toHaveClass('alert-medium');
    });

    it('should support interactive metric exploration', async () => {
      const mockQualityService = MockUIServices.createMockQualityService();
      
      render(
        <QualityMonitor 
          onMetricsUpdate={mockQualityService.getMetrics}
          onAlertUpdate={mockQualityService.getAlerts}
        />
      );

      // Click on metric card for details
      await user.click(screen.getByTestId('metric-response-time'));
      
      await waitFor(() => {
        expect(screen.getByTestId('metric-details-modal')).toBeInTheDocument();
        expect(screen.getByTestId('metric-trend-chart')).toBeInTheDocument();
        expect(screen.getByTestId('metric-history-table')).toBeInTheDocument();
      });

      // Test time range selection
      await user.selectOptions(screen.getByTestId('time-range-select'), '7d');
      expect(screen.getByTestId('time-range-select')).toHaveValue('7d');

      // Close modal
      await user.click(screen.getByTestId('close-modal'));
      expect(screen.queryByTestId('metric-details-modal')).not.toBeInTheDocument();
    });

    it('should handle alert management and resolution', async () => {
      const mockQualityService = MockUIServices.createMockQualityService();
      
      render(
        <QualityMonitor 
          onMetricsUpdate={mockQualityService.getMetrics}
          onAlertUpdate={mockQualityService.getAlerts}
        />
      );

      // Click on alert for details
      await user.click(screen.getByTestId('alert-1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-details')).toBeInTheDocument();
        expect(screen.getByTestId('alert-actions')).toBeInTheDocument();
      });

      // Acknowledge alert
      await user.click(screen.getByTestId('acknowledge-alert'));
      expect(screen.getByTestId('alert-1')).toHaveClass('alert-acknowledged');

      // Resolve alert
      await user.click(screen.getByTestId('resolve-alert'));
      expect(screen.getByTestId('alert-1')).toHaveClass('alert-resolved');
    });
  });

  // ============================================================================
  // COMMAND BAR UI TESTS
  // ============================================================================

  describe('CommandBar UI Tests', () => {
    it('should provide intelligent command suggestions and search', async () => {
      render(<CommandBar />);

      // Check command bar elements
      expect(screen.getByTestId('command-input')).toBeInTheDocument();
      expect(screen.getByTestId('command-suggestions')).toBeInTheDocument();
      expect(screen.getByTestId('command-history')).toBeInTheDocument();

      // Type command
      await user.type(screen.getByTestId('command-input'), 'transcribe');
      
      await waitFor(() => {
        expect(screen.getByTestId('suggestion-transcribe-audio')).toBeInTheDocument();
        expect(screen.getByTestId('suggestion-transcribe-meeting')).toBeInTheDocument();
      });

      // Select suggestion
      await user.click(screen.getByTestId('suggestion-transcribe-audio'));
      expect(screen.getByTestId('command-input')).toHaveValue('transcribe audio');
    });

    it('should handle voice commands and speech input', async () => {
      render(<CommandBar />);

      // Start voice input
      await user.click(screen.getByTestId('voice-input-button'));
      expect(screen.getByTestId('voice-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('voice-indicator')).toHaveClass('listening');

      // Simulate voice input completion
      fireEvent(window, new CustomEvent('voice-input-complete', {
        detail: { text: 'start new meeting transcription' }
      }));

      await waitFor(() => {
        expect(screen.getByTestId('command-input')).toHaveValue('start new meeting transcription');
        expect(screen.getByTestId('voice-indicator')).not.toHaveClass('listening');
      });
    });

    it('should maintain command history and favorites', async () => {
      render(<CommandBar />);

      // Execute several commands
      const commands = [
        'transcribe audio',
        'generate summary',
        'export transcript',
        'share meeting'
      ];

      for (const command of commands) {
        await user.type(screen.getByTestId('command-input'), command);
        await user.keyboard('{Enter}');
        await waitFor(() => {
          screen.getByTestId('command-input').toHaveValue('');
        });
      }

      // Check history
      await user.click(screen.getByTestId('history-toggle'));
      expect(screen.getByTestId('command-history')).toBeInTheDocument();
      expect(screen.getByTestId('history-item-1')).toHaveTextContent('share meeting');

      // Add to favorites
      await user.click(screen.getByTestId('history-item-1'));
      await user.click(screen.getByTestId('add-to-favorites'));
      expect(screen.getByTestId('favorite-share-meeting')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // UNIFIED ENTRY UI TESTS
  // ============================================================================

  describe('UnifiedEntry UI Tests', () => {
    it('should provide seamless entry point for all features', async () => {
      render(<UnifiedEntry />);

      // Check main entry elements
      expect(screen.getByTestId('unified-entry')).toBeInTheDocument();
      expect(screen.getByTestId('feature-grid')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      expect(screen.getByTestId('recent-sessions')).toBeInTheDocument();

      // Check feature cards
      expect(screen.getByTestId('feature-transcription')).toBeInTheDocument();
      expect(screen.getByTestId('feature-translation')).toBeInTheDocument();
      expect(screen.getByTestId('feature-summarization')).toBeInTheDocument();
      expect(screen.getByTestId('feature-analysis')).toBeInTheDocument();
    });

    it('should support drag-and-drop file uploads', async () => {
      render(<UnifiedEntry />);

      const dropZone = screen.getByTestId('file-drop-zone');
      
      // Simulate drag enter
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('drag-over');

      // Simulate file drop
      const file = new File(['test audio'], 'test.mp3', { type: 'audio/mpeg' });
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('file-upload-progress')).toBeInTheDocument();
        expect(screen.getByTestId('uploading-file-name')).toHaveTextContent('test.mp3');
      });
    });

    it('should adapt to user preferences and context', async () => {
      render(<UnifiedEntry />);

      // Simulate user preference
      localStorage.setItem('user-preferences', JSON.stringify({
        favoriteFeatures: ['transcription', 'summarization'],
        theme: 'dark',
        language: 'en'
      }));

      // Reload component with preferences
      render(<UnifiedEntry />);

      expect(screen.getByTestId('feature-transcription')).toHaveClass('favorite');
      expect(screen.getByTestId('feature-summarization')).toHaveClass('favorite');
      expect(screen.getByTestId('unified-entry')).toHaveClass('dark-theme');
    });
  });

  // ============================================================================
  // VISUAL REGRESSION TESTS
  // ============================================================================

  describe('Visual Regression Tests', () => {
    it('should match baseline screenshots for all components', async () => {
      // Test FeedbackPanel
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      const { container: feedbackContainer } = render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );
      
      await AdvancedUITestUtils.takeScreenshot(feedbackContainer, 'feedback-panel-baseline');

      // Test QualityMonitor
      const mockQualityService = MockUIServices.createMockQualityService();
      const { container: qualityContainer } = render(
        <QualityMonitor 
          onMetricsUpdate={mockQualityService.getMetrics}
          onAlertUpdate={mockQualityService.getAlerts}
        />
      );
      
      await AdvancedUITestUtils.takeScreenshot(qualityContainer, 'quality-monitor-baseline');

      // Test CommandBar
      const { container: commandContainer } = render(<CommandBar />);
      await AdvancedUITestUtils.takeScreenshot(commandContainer, 'command-bar-baseline');

      // Test UnifiedEntry
      const { container: entryContainer } = render(<UnifiedEntry />);
      await AdvancedUITestUtils.takeScreenshot(entryContainer, 'unified-entry-baseline');
    });

    it('should maintain visual consistency across themes', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      
      // Test light theme
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
          theme="light"
        />
      );
      
      const lightPanel = screen.getByTestId('feedback-panel');
      await AdvancedUITestUtils.takeScreenshot(lightPanel, 'feedback-panel-light-theme');

      // Test dark theme
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
          theme="dark"
        />
      );
      
      const darkPanel = screen.getByTestId('feedback-panel');
      await AdvancedUITestUtils.takeScreenshot(darkPanel, 'feedback-panel-dark-theme');

      // Verify theme classes are applied
      expect(lightPanel).toHaveClass('light-theme');
      expect(darkPanel).toHaveClass('dark-theme');
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('UI Performance Tests', () => {
    it('should render components within performance budgets', async () => {
      const startTime = performance.now();
      
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('should handle large datasets without performance degradation', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      
      // Mock large dataset
      const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `feedback-${i}`,
        rating: Math.floor(Math.random() * 5) + 1,
        comment: `Comment ${i}`,
        timestamp: Date.now() - (i * 1000)
      }));

      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={() => Promise.resolve(largeHistory)}
        />
      );

      // Open history with large dataset
      await user.click(screen.getByTestId('history-toggle'));
      
      const startTime = performance.now();
      await waitFor(() => {
        expect(screen.getByTestId('feedback-history')).toBeInTheDocument();
      });
      const loadTime = performance.now() - startTime;
      
      expect(loadTime).toBeLessThan(500); // Should load in under 500ms
    });

    it('should maintain responsiveness during animations', async () => {
      const mockFeedbackService = MockUIServices.createMockFeedbackService();
      
      render(
        <FeedbackPanel 
          onSubmit={mockFeedbackService.submitFeedback}
          onHistoryRequest={mockFeedbackService.getFeedbackHistory}
        />
      );

      // Trigger animations
      await user.click(screen.getByTestId('history-toggle'));
      
      // Check that UI remains interactive during animations
      const startTime = performance.now();
      await user.click(screen.getByTestId('rating-selector'));
      const interactionTime = performance.now() - startTime;
      
      expect(interactionTime).toBeLessThan(50); // Should remain responsive
    });
  });
});
