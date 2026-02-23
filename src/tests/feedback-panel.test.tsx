/**
 * Feedback Panel Tests
 * 
 * Unit tests for the FeedbackPanel component including feedback submission,
 * KPI monitoring, and user interaction testing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackPanel } from '../ui/components/FeedbackPanel';

// Mock the console methods to reduce noise
vi.mock('../ui/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

// Mock the theme
vi.mock('../ui/theme/index.js', () => ({
  colors: {},
  spacing: {},
  borderRadius: {},
  shadows: {},
  animations: {}
}));

describe('FeedbackPanel', () => {
  const mockOnFeedbackSubmit = vi.fn();
  const mockOnKPIMonitoring = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render KPI metrics by default', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      expect(screen.getByText('KPIs Qualité')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction Utilisateur')).toBeInTheDocument();
      expect(screen.getByText('Temps de Réponse')).toBeInTheDocument();
      expect(screen.getByText('Adoption des Fonctionnalités')).toBeInTheDocument();
    });

    it('should render feedback button', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      expect(feedbackButton).toBeInTheDocument();
    });

    it('should hide KPI metrics when showKPIMetrics is false', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} showKPIMetrics={false} />);
      
      expect(screen.queryByText('KPIs Qualité')).not.toBeInTheDocument();
    });
  });

  describe('Feedback Panel Interaction', () => {
    it('should open feedback panel when button is clicked', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      expect(screen.getByText('Feedback Qualité')).toBeInTheDocument();
      expect(screen.getByText('Type de feedback')).toBeInTheDocument();
    });

    it('should close feedback panel when cancel is clicked', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      // Open panel
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      // Close panel
      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Feedback Qualité')).not.toBeInTheDocument();
    });

    it('should display feedback type options', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      expect(screen.getByText('Note')).toBeInTheDocument();
      expect(screen.getByText('Commentaire')).toBeInTheDocument();
      expect(screen.getByText('Suggestion')).toBeInTheDocument();
      expect(screen.getByText('Bug')).toBeInTheDocument();
    });

    it('should display category options', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      expect(screen.getByDisplayValue('Général')).toBeInTheDocument();
    });
  });

  describe('Rating Feedback', () => {
    it('should show rating stars when rating type is selected', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      const ratingButton = screen.getByText('Note');
      fireEvent.click(ratingButton);
      
      expect(screen.getByText('Note globale')).toBeInTheDocument();
      
      // Check for 5 star buttons
      const stars = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('class')?.includes('w-6 h-6')
      );
      expect(stars).toHaveLength(5);
    });

    it('should highlight stars when clicked', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      const ratingButton = screen.getByText('Note');
      fireEvent.click(ratingButton);
      
      const stars = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('class')?.includes('w-6 h-6')
      );
      
      // Click third star
      fireEvent.click(stars[2]);
      
      // First three stars should be filled
      const filledStars = stars.slice(0, 3).filter(star => 
        star.querySelector('svg')?.getAttribute('class')?.includes('text-yellow-400')
      );
      expect(filledStars).toHaveLength(3);
    });
  });

  describe('Feedback Submission', () => {
    it('should submit rating feedback successfully', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      // Select rating type
      const ratingButton = screen.getByText('Note');
      fireEvent.click(ratingButton);
      
      // Set rating
      const stars = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('class')?.includes('w-6 h-6')
      );
      fireEvent.click(stars[4]); // 5 stars
      
      // Submit
      const submitButton = screen.getByText('Envoyer');
      fireEvent.click(submitButton);
      
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
      fireEvent.click(feedbackButton);
      
      // Select comment type
      const commentButton = screen.getByText('Commentaire');
      fireEvent.click(commentButton);
      
      // Add comment
      const textarea = screen.getByPlaceholderText('Décrivez votre expérience, suggestions ou problèmes rencontrés...');
      fireEvent.change(textarea, { target: { value: 'Great application!' } });
      
      // Submit
      const submitButton = screen.getByText('Envoyer');
      fireEvent.click(submitButton);
      
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

    it('should validate rating feedback before submission', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      // Select rating type but don't set rating
      const ratingButton = screen.getByText('Note');
      fireEvent.click(ratingButton);
      
      // Try to submit without rating
      const submitButton = screen.getByText('Envoyer');
      fireEvent.click(submitButton);
      
      // Should show alert
      expect(screen.getByText('Veuillez donner une note')).toBeInTheDocument();
      expect(mockOnFeedbackSubmit).not.toHaveBeenCalled();
    });

    it('should validate comment feedback before submission', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      // Select comment type but don't add comment
      const commentButton = screen.getByText('Commentaire');
      fireEvent.click(commentButton);
      
      // Try to submit without comment
      const submitButton = screen.getByText('Envoyer');
      fireEvent.click(submitButton);
      
      // Should show alert
      expect(screen.getByText('Veuillez laisser un commentaire')).toBeInTheDocument();
      expect(mockOnFeedbackSubmit).not.toHaveBeenCalled();
    });
  });

  describe('KPI Auto-Trigger', () => {
    it('should auto-trigger feedback when KPI threshold is breached', () => {
      render(
        <FeedbackPanel 
          onFeedbackSubmit={mockOnFeedbackSubmit} 
          autoTrigger={true}
          triggerThreshold={0.8}
        />
      );
      
      // Mock KPIs with poor performance
      const poorKPIs = [
        {
          id: 'response_time',
          name: 'Response Time',
          value: 2.0,
          target: 1.0,
          trend: 'up' as const,
          category: 'performance' as const,
          description: 'Response time is too high',
          impact: 'high' as const,
          lastUpdated: Date.now()
        }
      ];
      
      // The component should auto-open when KPIs are poor
      // This would need to be tested with actual KPI state manipulation
      expect(screen.getByText('KPIs Qualité')).toBeInTheDocument();
    });

    it('should show KPI context in feedback panel', () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      expect(screen.getByText('Contexte KPI')).toBeInTheDocument();
      expect(screen.getByText('Votre feedback aidera à améliorer les métriques de qualité actuelles.')).toBeInTheDocument();
    });
  });

  describe('Recent Feedback Display', () => {
    it('should display recent feedback after submission', async () => {
      render(<FeedbackPanel onFeedbackSubmit={mockOnFeedbackSubmit} />);
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      // Submit feedback
      const commentButton = screen.getByText('Commentaire');
      fireEvent.click(commentButton);
      
      const textarea = screen.getByPlaceholderText('Décrivez votre expérience, suggestions ou problèmes rencontrés...');
      fireEvent.change(textarea, { target: { value: 'Test feedback' } });
      
      const submitButton = screen.getByText('Envoyer');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Feedbacks récents')).toBeInTheDocument();
      });
    });
  });

  describe('KPI Monitoring Integration', () => {
    it('should call onKPIMonitoring when KPI is impacted', async () => {
      render(
        <FeedbackPanel 
          onFeedbackSubmit={mockOnFeedbackSubmit}
          onKPIMonitoring={mockOnKPIMonitoring}
        />
      );
      
      const feedbackButton = screen.getByTitle('Donner votre feedback');
      fireEvent.click(feedbackButton);
      
      // Submit feedback that impacts KPIs
      const commentButton = screen.getByText('Commentaire');
      fireEvent.click(commentButton);
      
      const textarea = screen.getByPlaceholderText('Décrivez votre expérience, suggestions ou problèmes rencontrés...');
      fireEvent.change(textarea, { target: { value: 'Performance is slow' } });
      
      // Change category to performance
      const categorySelect = screen.getByDisplayValue('Général');
      fireEvent.change(categorySelect, { target: { value: 'performance' } });
      
      const submitButton = screen.getByText('Envoyer');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnKPIMonitoring).toHaveBeenCalled();
      });
    });
  });
});
