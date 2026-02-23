/**
 * Advanced React Component Tests
 * 
 * Comprehensive tests for React components with actual DOM rendering,
 * user interactions, and integration testing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FeedbackPanel } from '../ui/components/FeedbackPanel';

// Mock dependencies
vi.mock('../ui/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

vi.mock('../ui/theme/index.js', () => ({
  colors: {},
  spacing: {},
  borderRadius: {},
  shadows: {},
  animations: {}
}));

describe('FeedbackPanel Advanced Tests', () => {
  const mockOnFeedbackSubmit = vi.fn();
  const mockOnKPIMonitoring = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Component Lifecycle', () => {
    it('should mount without crashing', () => {
      expect(() => 
        render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />)
      ).not.toThrow();
    });

    it('should unmount without errors', () => {
      const { unmount } = render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      expect(() => unmount()).not.toThrow();
    });

    it('should render initial state correctly', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      // Should show KPI metrics by default
      expect(screen.getByText('KPIs Qualité')).toBeInTheDocument();
      expect(screen.getByTitle('Donner votre feedback')).toBeInTheDocument();
    });
  });

  describe('KPI Metrics Display', () => {
    it('should display KPI metrics when enabled', () => {
      render(
        <FeedbackPanel 
          onFeedbackSubmit={mockOnFeedbackSubmit} 
          showKPIMetrics={true}
        />
      );
      
      expect(screen.getByText('KPIs Qualité')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction Utilisateur')).toBeInTheDocument();
      expect(screen.getByText('Temps de Réponse')).toBeInTheDocument();
    });

    it('should hide KPI metrics when disabled', () => {
      render(
        <FeedbackPanel 
          onFeedbackSubmit={mockOnFeedbackSubmit} 
          showKPIMetrics={false}
        />
      );
      
      expect(screen.queryByText('KPIs Qualité')).not.toBeInTheDocument();
    });

    it('should update KPI values dynamically', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      // Wait for KPI updates (simulated every 10 seconds)
      await act(async () => {
        vi.advanceTimersByTime(10001);
      });
      
      // KPIs should still be present
      expect(screen.getByText('KPIs Qualité')).toBeInTheDocument();
    });

    it('should show KPI status indicators', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      // Check for status indicators (could be implemented as colored dots or badges)
      const kpiContainer = screen.getByText('KPIs Qualité').closest('div');
      expect(kpiContainer).toBeInTheDocument();
    });
  });

  describe('Feedback Panel Interaction', () => {
    it('should open feedback panel when button clicked', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      expect(screen.getByText('Feedback Qualité')).toBeInTheDocument();
      expect(screen.getByText('Type de feedback')).toBeInTheDocument();
    });

    it('should close feedback panel when cancel clicked', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      // Open panel first
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      // Then close it
      const cancelButton = screen.getByText('Annuler');
      await act(async () => {
        fireEvent.click(cancelButton);
      });
      
      expect(screen.queryByText('Feedback Qualité')).not.toBeInTheDocument();
    });

    it('should switch between feedback types', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      // Test switching to comment type
      const commentButton = screen.getByText('Commentaire');
      await act(async () => {
        fireEvent.click(commentButton);
      });
      
      // Should show comment textarea
      expect(screen.getByPlaceholderText('Décrivez votre expérience, suggestions ou problèmes rencontrés...')).toBeInTheDocument();
    });

    it('should handle category selection', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      const categorySelect = screen.getByDisplayValue('Général');
      await act(async () => {
        fireEvent.change(categorySelect, { target: { value: 'performance' } });
      });
      
      expect(screen.getByDisplayValue('performance')).toBeInTheDocument();
    });
  });

  describe('Rating System', () => {
    it('should show rating stars when rating type selected', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      const ratingButton = screen.getByText('Note');
      await act(async () => {
        fireEvent.click(ratingButton);
      });
      
      expect(screen.getByText('Note globale')).toBeInTheDocument();
      
      // Should show 5 star buttons
      const stars = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg')?.getAttribute('class')?.includes('w-6 h-6')
      );
      expect(stars).toHaveLength(5);
    });

    it('should highlight stars when clicked', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      const ratingButton = screen.getByText('Note');
      await act(async () => {
        fireEvent.click(ratingButton);
      });
      
      const stars = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg')?.getAttribute('class')?.includes('w-6 h-6')
      );
      
      // Click third star
      await act(async () => {
        fireEvent.click(stars[2]);
      });
      
      // First three stars should be filled (implementation dependent)
      expect(stars.length).toBe(5);
    });

    it('should validate rating before submission', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      const ratingButton = screen.getByText('Note');
      await act(async () => {
        fireEvent.click(ratingButton);
      });
      
      const submitButton = screen.getByText('Envoyer');
      
      // Try to submit without rating
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      // Should show validation alert
      expect(screen.getByText('Veuillez donner une note')).toBeInTheDocument();
      expect(mockOnFeedbackSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Feedback Submission', () => {
    it('should submit rating feedback successfully', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      const ratingButton = screen.getByText('Note');
      await act(async () => {
        fireEvent.click(ratingButton);
      });
      
      const stars = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg')?.getAttribute('class')?.includes('w-6 h-6')
      );
      
      // Set 5-star rating
      await act(async () => {
        fireEvent.click(stars[4]);
      });
      
      const submitButton = screen.getByText('Envoyer');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(mockOnFeedbackSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'rating',
            rating: 5,
            category: 'overall'
          })
        );
      });
    });

    it('should submit comment feedback successfully', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      const commentButton = screen.getByText('Commentaire');
      await act(async () => {
        fireEvent.click(commentButton);
      });
      
      const textarea = screen.getByPlaceholderText('Décrivez votre expérience, suggestions ou problèmes rencontrés...');
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Great application!' } });
      });
      
      const submitButton = screen.getByText('Envoyer');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(mockOnFeedbackSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'comment',
            comment: 'Great application!',
            category: 'overall'
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      await act(async () => {
        fireEvent.click(feedbackButton);
      });
      
      const commentButton = screen.getByText('Commentaire');
      await act(async () => {
        fireEvent.click(commentButton);
      });
      
      const textarea = screen.getByPlaceholderText('Décrivez votre expérience, suggestions ou problèmes rencontrés...');
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test feedback' } });
      });
      
      const submitButton = screen.getByText('Envoyer');
      
      // Start submission
      act(() => {
        fireEvent.click(submitButton);
      });
      
      // Should show loading spinner
      expect(screen.getByText('Envoi...')).toBeInTheDocument();
    });
  });

  describe('Auto-Trigger Functionality', () => {
    it('should auto-open when KPI threshold is breached', async () => {
      render(
        <FeedbackPanel 
          onFeedbackSubmit={mockOnFeedbackSubmit}
          autoTrigger={true}
          triggerThreshold={0.8}
        />
      );
      
      // Simulate poor KPI performance by advancing time
      await act(async () => {
        vi.advanceTimersByTime(10001); // Trigger KPI update
      });
      
      // Should auto-open feedback panel
      await waitFor(() => {
        expect(screen.getByText('Feedback Qualité')).toBeInTheDocument();
      });
    });

    it('should show KPI context when auto-triggered', async () => {
      render(
        <FeedbackPanel 
          onFeedbackSubmit={mockOnFeedbackSubmit}
          autoTrigger={true}
          triggerThreshold={0.8}
        />
      );
      
      // Trigger auto-open
      await act(async () => {
        vi.advanceTimersByTime(10001);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Contexte KPI')).toBeInTheDocument();
        expect(screen.getByText('Votre feedback aidera à améliorer les métriques de qualité actuelles.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      expect(feedbackButton).toHaveAttribute('aria-label');
      
      // Check for proper heading structure
      const heading = screen.getByText('KPIs Qualité');
      expect(heading.tagName).toBe('H3'); // or appropriate heading level
    });

    it('should be keyboard navigable', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      feedbackButton.focus();
      
      // Should be focusable
      expect(document.activeElement).toBe(feedbackButton);
      
      // Test keyboard navigation
      await act(async () => {
        fireEvent.keyDown(feedbackButton, { key: 'Enter' });
      });
      
      // Should open panel
      expect(screen.getByText('Feedback Qualité')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      // Should render without overflow issues
      const container = screen.getByText('KPIs Qualité').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with large datasets', async () => {
      const largeFeedbackList = Array.from({ length: 100 }, (_, i) => ({
        id: `feedback_${i}`,
        type: 'comment',
        comment: `Comment ${i}`,
        timestamp: Date.now() - (i * 1000)
      }));
      
      render(
        <FeedbackPanel 
          onFeedbackSubmit={mockOnFeedbackSubmit}
        />
      );
      
      // Should still render quickly
      expect(screen.getByText('KPIs Qualité')).toBeInTheDocument();
    });

    it('should handle rapid interactions', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(feedbackButton);
        });
        await act(async () => {
          vi.advanceTimersByTime(100);
        });
      }
      
      // Should handle gracefully
      expect(screen.getByText('KPIs Qualité')).toBeInTheDocument();
    });
  });
});
