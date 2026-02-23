/**
 * Kair0s Feedback Panel
 * 
 * Integrated feedback loop connected to KPIs for continuous product improvement
 * and user experience optimization based on quality metrics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  BarChart3,
  Send,
  X,
  Lightbulb
} from 'lucide-react';
import { cn } from '../utils/cn.js';

// ============================================================================
// TYPES
// ============================================================================

interface FeedbackData {
  id: string;
  timestamp: number;
  type: 'rating' | 'comment' | 'suggestion' | 'bug' | 'feature_request';
  category: 'overall' | 'performance' | 'usability' | 'features' | 'bugs';
  rating?: number; // 1-5 stars
  comment?: string;
  context?: {
    sessionId?: string;
    feature?: string;
    action?: string;
    kpiImpact?: string;
    userSatisfaction?: number;
  };
  metadata?: {
    userAgent?: string;
    sessionId?: string;
    userId?: string;
    organizationId?: string;
    version?: string;
    buildNumber?: string;
  };
}

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  category: 'performance' | 'usability' | 'adoption' | 'quality';
  description: string;
  impact: 'high' | 'medium' | 'low';
  lastUpdated: number;
}

interface FeedbackPanelProps {
  className?: string;
  onFeedbackSubmit?: (feedback: FeedbackData) => void;
  onKPIMonitoring?: (kpi: KPIMetric) => void;
  showKPIMetrics?: boolean;
  autoTrigger?: boolean;
  triggerThreshold?: number; // KPI threshold to auto-trigger feedback
}

// ============================================================================
// MOCK KPI DATA (connected to quality-kpis.ts)
// ============================================================================

const MOCK_KPIS: KPIMetric[] = [
  {
    id: 'user_satisfaction',
    name: 'Satisfaction Utilisateur',
    value: 4.2,
    target: 4.5,
    trend: 'up',
    category: 'quality',
    description: 'Score de satisfaction moyen basé sur les feedbacks utilisateurs',
    impact: 'high',
    lastUpdated: Date.now()
  },
  {
    id: 'response_time',
    name: 'Temps de Réponse',
    value: 1.2,
    target: 1.0,
    trend: 'down',
    category: 'performance',
    description: 'Temps de réponse moyen en secondes',
    impact: 'high',
    lastUpdated: Date.now()
  },
  {
    id: 'feature_adoption',
    name: 'Adoption des Fonctionnalités',
    value: 0.78,
    target: 0.85,
    trend: 'up',
    category: 'adoption',
    description: 'Pourcentage d\'utilisateurs adoptant les nouvelles fonctionnalités',
    impact: 'medium',
    lastUpdated: Date.now()
  },
  {
    id: 'error_rate',
    name: 'Taux d\'Erreurs',
    value: 0.02,
    target: 0.01,
    trend: 'stable',
    category: 'quality',
    description: 'Taux d\'erreurs par session',
    impact: 'high',
    lastUpdated: Date.now()
  },
  {
    id: 'task_completion',
    name: 'Taux de Complétion',
    value: 0.92,
    target: 0.95,
    trend: 'up',
    category: 'usability',
    description: 'Pourcentage de tâches complétées avec succès',
    impact: 'medium',
    lastUpdated: Date.now()
  }
];

// ============================================================================
// FEEDBACK PANEL COMPONENT
// ============================================================================

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  className = '',
  onFeedbackSubmit,
  onKPIMonitoring,
  showKPIMetrics = true,
  autoTrigger = true,
  triggerThreshold = 0.8,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('rating');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<FeedbackData['category']>('overall');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<FeedbackData[]>([]);
  const [kpis, setKpis] = useState<KPIMetric[]>(MOCK_KPIS);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Check for auto-trigger based on KPI thresholds
  useEffect(() => {
    if (!autoTrigger || autoTriggered) return;

    const shouldTrigger = kpis.some(kpi => {
      const performanceRatio = kpi.value / kpi.target;
      return performanceRatio < triggerThreshold && kpi.impact === 'high';
    });

    if (shouldTrigger) {
      setAutoTriggered(true);
      setIsOpen(true);
      // Find the problematic KPI to suggest feedback
      const problematicKPI = kpis.find(kpi => {
        const performanceRatio = kpi.value / kpi.target;
        return performanceRatio < triggerThreshold && kpi.impact === 'high';
      });

      if (problematicKPI) {
        setCategory(getCategoryFromKPI(problematicKPI));
        setComment(`J'ai remarqué un problème avec ${problematicKPI.name}. `);
      }
    }
  }, [kpis, autoTrigger, triggerThreshold, autoTriggered]);

  // Simulate real-time KPI updates
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prevKpis => 
        prevKpis.map(kpi => ({
          ...kpi,
          value: kpi.value + (Math.random() - 0.5) * 0.1,
          lastUpdated: Date.now(),
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
        }))
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getCategoryFromKPI = (kpi: KPIMetric): FeedbackData['category'] => {
    switch (kpi.category) {
      case 'performance': return 'performance';
      case 'usability': return 'usability';
      case 'quality': return 'overall';
      case 'adoption': return 'features';
      default: return 'overall';
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!rating && feedbackType === 'rating') {
      alert('Veuillez donner une note');
      return;
    }

    if (!comment.trim() && feedbackType !== 'rating') {
      alert('Veuillez laisser un commentaire');
      return;
    }

    setIsSubmitting(true);

    const feedback: FeedbackData = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: feedbackType,
      category,
      rating: feedbackType === 'rating' ? rating : undefined,
      comment: comment.trim(),
      context: {
        sessionId: `session_${Date.now()}`,
        feature: getCurrentFeature(),
        action: getLastUserAction(),
        kpiImpact: getKPIImpact()
      },
      metadata: {
        userAgent: navigator.userAgent,
        sessionId: `session_${Date.now()}`,
        userId: 'user_demo',
        organizationId: 'org_demo',
        version: '1.0.0',
        buildNumber: '2024.02.21'
      }
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmittedFeedback(prev => [feedback, ...prev].slice(0, 10)); // Keep last 10
    onFeedbackSubmit?.(feedback);
    
    // Reset form
    setRating(0);
    setComment('');
    setIsSubmitting(false);
    setIsOpen(false);

    // Update KPIs based on feedback
    updateKPIsFromFeedback(feedback);
  }, [feedbackType, rating, comment, category, onFeedbackSubmit]);

  const getCurrentFeature = (): string => {
    // In real implementation, detect current feature from context
    return 'command_bar';
  };

  const getLastUserAction = (): string => {
    // In real implementation, track last user action
    return 'search_command';
  };

  const getKPIImpact = (): string => {
    // Analyze feedback to determine KPI impact
    if (rating && rating < 3) return 'negative';
    if (rating && rating >= 4) return 'positive';
    return 'neutral';
  };

  const updateKPIsFromFeedback = (feedback: FeedbackData) => {
    // Update KPIs based on feedback
    if (feedback.rating) {
      setKpis(prevKpis => 
        prevKpis.map(kpi => {
          if (kpi.id === 'user_satisfaction') {
            // Update satisfaction based on rating
            const newSatisfaction = (kpi.value * 0.9) + (feedback.rating! * 0.1);
            return {
              ...kpi,
              value: Math.min(5, Math.max(1, newSatisfaction)),
              trend: (feedback.rating && feedback.rating > kpi.value) ? 'up' : (feedback.rating && feedback.rating < kpi.value) ? 'down' : 'stable',
              lastUpdated: Date.now()
            };
          }
          return kpi;
        })
      );
    }

    // Notify KPI monitoring
    const impactedKPI = kpis.find(kpi => 
      kpi.category === getCategoryFromKPI({ id: '', name: '', category: feedback.category as any, value: 0, target: 0, trend: 'stable', description: '', impact: 'medium', lastUpdated: 0 })
    );
    
    if (impactedKPI) {
      onKPIMonitoring?.(impactedKPI);
    }
  };

  const getKPIStatus = (kpi: KPIMetric) => {
    const performanceRatio = kpi.value / kpi.target;
    if (performanceRatio >= 0.95) return 'excellent';
    if (performanceRatio >= 0.8) return 'good';
    if (performanceRatio >= 0.6) return 'warning';
    return 'critical';
  };

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: KPIMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className={cn("fixed bottom-4 left-4 z-40", className)}>
      {/* KPI Metrics Display */}
      {showKPIMetrics && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              KPIs Qualité
            </h3>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Donner votre feedback"
            >
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-2">
            {kpis.slice(0, 3).map(kpi => {
              const status = getKPIStatus(kpi);
              const performanceRatio = kpi.value / kpi.target;
              
              return (
                <div key={kpi.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{kpi.name}</span>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            status === 'excellent' ? "bg-green-500" :
                            status === 'good' ? "bg-blue-500" :
                            status === 'warning' ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.min(100, performanceRatio * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {kpi.value.toFixed(2)}/{kpi.target}
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getKPIStatusColor(status)
                  )}>
                    {status === 'excellent' ? '✓' :
                     status === 'good' ? '↑' :
                     status === 'warning' ? '!' : '↓'}
                  </div>
                </div>
              );
            })}
          </div>

          {autoTriggered && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Des KPIs nécessitent votre attention</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Feedback Qualité
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Feedback Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de feedback
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'rating', label: 'Note', icon: <Star className="w-4 h-4" /> },
                  { value: 'comment', label: 'Commentaire', icon: <MessageSquare className="w-4 h-4" /> },
                  { value: 'suggestion', label: 'Suggestion', icon: <Lightbulb className="w-4 h-4" /> },
                  { value: 'bug', label: 'Bug', icon: <AlertCircle className="w-4 h-4" /> }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFeedbackType(type.value as FeedbackData['type'])}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                      feedbackType === type.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {type.icon}
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackData['category'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="overall">Général</option>
                <option value="performance">Performance</option>
                <option value="usability">Utilisabilité</option>
                <option value="features">Fonctionnalités</option>
                <option value="bugs">Bugs</option>
              </select>
            </div>

            {/* Rating */}
            {feedbackType === 'rating' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note globale
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-colors"
                    >
                      <Star 
                        className={cn(
                          "w-6 h-6",
                          star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            {(feedbackType !== 'rating' || comment) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {feedbackType === 'rating' ? 'Commentaire (optionnel)' : 'Commentaire'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Décrivez votre expérience, suggestions ou problèmes rencontrés..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
            )}

            {/* KPI Context */}
            {showKPIMetrics && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Contexte KPI</span>
                </div>
                <div className="text-xs text-blue-800">
                  Votre feedback aidera à améliorer les métriques de qualité actuelles.
                  {kpis.some(k => getKPIStatus(k) === 'critical') && 
                    " Certains KPIs nécessitent une attention particulière."}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Feedback Summary */}
      {submittedFeedback.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <h4 className="font-medium text-gray-900 mb-2">Feedbacks récents</h4>
          <div className="space-y-2">
            {submittedFeedback.slice(0, 3).map(feedback => (
              <div key={feedback.id} className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  {feedback.rating && (
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  )}
                  <span className="text-gray-600">
                    {new Date(feedback.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-700">
                  {feedback.type === 'rating' ? `Note: ${feedback.rating}/5` : feedback.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
