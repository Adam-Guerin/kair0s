/**
 * Kair0s Onboarding Guide
 * 
 * Interactive onboarding that reduces friction and makes advanced features
 * "fused" and visible from first use through contextual discovery.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Zap, 
  Lightbulb, 
  Target, 
  Settings, 
  Play,
  Star,
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import { colors, spacing, borderRadius, shadows, animations } from '../theme/index.js';

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'welcome' | 'feature_discovery' | 'interactive_tutorial' | 'setup_completion';
  icon: React.ReactNode;
  content?: React.ReactNode;
  action?: () => void;
  completed?: boolean;
  optional?: boolean;
  tips?: string[];
  shortcuts?: Array<{
    key: string;
    description: string;
    action: string;
  }>;
}

interface OnboardingGuideProps {
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  initialStep?: string;
  showProgress?: boolean;
  autoStart?: boolean;
}

// ============================================================================
// ONBOARDING STEPS
// ============================================================================

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans Kair0s',
    description: 'Votre assistant IA intelligent est prêt. Découvrez comment transformer votre productivité.',
    type: 'welcome',
    icon: <Sparkles className="w-8 h-8 text-blue-600" />,
    tips: [
      'Utilisez ⌘K pour accéder rapidement à toutes les fonctionnalités',
      'Les presets métier adaptent automatiquement l\'assistant à vos besoins',
      'L\'orchestrateur invisible sélectionne le meilleur modèle AI automatiquement'
    ]
  },
  {
    id: 'command_bar_discovery',
    title: 'Commande Intelligente',
    description: 'Accédez à toutes les actions, favoris et historique depuis un seul point d\'entrée.',
    type: 'feature_discovery',
    icon: <Zap className="w-8 h-8 text-purple-600" />,
    content: (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xs">⌘K</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">Commande Rapide</div>
            <div className="text-sm text-gray-600">Pressez ⌘K et tapez votre action</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Essayez: <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">nouvelle session</kbd>, 
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">réunion rapide</kbd>, 
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">résumé intelligent</kbd>
        </div>
      </div>
    ),
    tips: [
      'Les commandes sont organisées par catégories: Actions, Favoris, Historique',
      'Utilisez les flèches pour naviguer rapidement',
      'Les raccourcis personnalisés apparaissent automatiquement'
    ]
  },
  {
    id: 'presets_discovery',
    title: 'Presets Métier',
    description: 'Des configurations intelligentes adaptées à chaque contexte professionnel.',
    type: 'feature_discovery',
    icon: <Target className="w-8 h-8 text-green-600" />,
    content: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Réunion', icon: '🤝', desc: 'Optimisé pour les sessions collaboratives', color: 'blue' },
          { name: 'Prospection', icon: '🎯', desc: 'Qualification de leads automatique', color: 'purple' },
          { name: 'Support', icon: '💬', desc: 'Assistance client intelligente', color: 'green' },
          { name: 'Général', icon: '⚡', desc: 'Assistant polyvalent', color: 'gray' }
        ].map((preset) => (
          <div key={preset.name} className={cn(
            "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
            `border-${preset.color}-200 hover:border-${preset.color}-300 bg-white`
          )}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{preset.icon}</div>
              <div>
                <div className="font-medium text-gray-900">{preset.name}</div>
                <div className="text-sm text-gray-600">{preset.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    tips: [
      'Le preset s\'adapte automatiquement au contexte détecté',
      'Chaque preset optimise l\'orchestrateur pour votre usage spécifique',
      'Basculez facilement entre les presets avec ⌘⇧M, ⌘⇧P, ⌘⇧S'
    ]
  },
  {
    id: 'orchestrator_discovery',
    title: 'Orchestrateur Invisible',
    description: 'L\'IA choisit automatiquement le meilleur modèle et provider selon vos objectifs.',
    type: 'feature_discovery',
    icon: <Settings className="w-8 h-8 text-orange-600" />,
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-blue-900">Objectif: Réunion</div>
            <div className="text-sm text-blue-600">Optimisé pour la collaboration</div>
          </div>
          <div className="text-sm text-gray-700">
            <div className="mb-2">🎯 Provider: <span className="font-medium">Kair0s Local</span></div>
            <div className="mb-2">⚡ Modèle: <span className="font-medium">kair0s:main</span></div>
            <div>📊 Latence: <span className="font-medium">800ms</span></div>
            <div>💰 Coût: <span className="font-medium">€0.001</span></div>
            <div>⭐ Qualité: <span className="font-medium">92%</span></div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-green-900">Objectif: Prospection</div>
            <div className="text-sm text-green-600">Optimisé pour la conversion</div>
          </div>
          <div className="text-sm text-gray-700">
            <div className="mb-2">🎯 Provider: <span className="font-medium">OpenAI GPT-4</span></div>
            <div className="mb-2">⚡ Modèle: <span className="font-medium">gpt-4-turbo</span></div>
            <div>📊 Latence: <span className="font-medium">1.2s</span></div>
            <div>💰 Coût: <span className="font-medium">€0.015</span></div>
            <div>⭐ Qualité: <span className="font-medium">88%</span></div>
          </div>
        </div>
      </div>
    ),
    tips: [
      'Vous définissez seulement l\'objectif, Kair0s gère le reste',
      'Le système apprend et s\'améliore avec votre utilisation',
      'Les fallbacks automatiques garantissent une disponibilité continue'
    ]
  },
  {
    id: 'interactive_tutorial',
    title: 'Votre Première Session',
    description: 'Lancez votre première session guidée pour découvrir toutes les fonctionnalités.',
    type: 'interactive_tutorial',
    icon: <Play className="w-8 h-8 text-indigo-600" />,
    action: () => console.log('Start interactive tutorial'),
    tips: [
      'Suivez les étapes guidées pour découvrir les fonctionnalités avancées',
      'Les suggestions contextuelles apparaissent automatiquement',
      'Votre historique est sauvegardé et accessible à tout moment'
    ]
  },
  {
    id: 'setup_completion',
    title: 'Configuration Terminée',
    description: 'Kair0s est configuré et prêt à transformer votre productivité.',
    type: 'setup_completion',
    icon: <Check className="w-8 h-8 text-green-600" />,
    tips: [
      'Consultez les tips contextuels pour découvrir des fonctionnalités cachées',
      'Utilisez la commande rapide ⌘K pour accéder à toutes les actions',
      'L\'aide est accessible via le point d\'interrogation intelligent'
    ]
  }
];

// ============================================================================
// ONBOARDING GUIDE COMPONENT
// ============================================================================

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  className = '',
  onComplete,
  onSkip,
  initialStep = 'welcome',
  showProgress = true,
  autoStart = true,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(autoStart);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  // Auto-start onboarding for new users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('kair0s_onboarding_seen');
    if (!hasSeenOnboarding && autoStart) {
      setIsVisible(true);
    }
  }, [autoStart]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStepIndex, currentStep.id]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleComplete = useCallback(() => {
    localStorage.setItem('kair0s_onboarding_seen', 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('kair0s_onboarding_seen', 'true');
    setIsVisible(false);
    onSkip?.();
  }, [onSkip]);

  const handleStepAction = useCallback(() => {
    if (currentStep.action) {
      currentStep.action();
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));
    }
  }, [currentStep.action, currentStep.id]);

  const handleJumpToStep = useCallback((stepId: string) => {
    const stepIndex = ONBOARDING_STEPS.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
      className
    )}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K0</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStep.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentStep.description}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Passer l'onboarding"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress */}
        {showProgress && (
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm text-gray-500">{currentStepIndex + 1} / {ONBOARDING_STEPS.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {ONBOARDING_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleJumpToStep(step.id)}
                    className={cn(
                      "w-8 h-2 rounded-full transition-all duration-200",
                      index === currentStepIndex 
                        ? "bg-blue-600" 
                        : completedSteps.has(step.id)
                        ? "bg-green-500"
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                    title={step.title}
                  >
                    <span className="sr-only">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Step Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                {currentStep.icon}
              </div>
            </div>

            {/* Step Content */}
            <div className="text-center mb-8">
              {currentStep.content}
            </div>

            {/* Tips */}
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-medium text-yellow-800">Conseils Pro</h3>
                </div>
                <ul className="space-y-2">
                  {currentStep.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shortcuts */}
            {currentStep.shortcuts && currentStep.shortcuts.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-800">Raccourcis Clés</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {currentStep.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">{shortcut.key}</div>
                        <div className="text-sm text-gray-600">{shortcut.description}</div>
                      </div>
                      <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {shortcut.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            {currentStep.action && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleStepAction}
                  className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {currentStep.type === 'interactive_tutorial' ? (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Commencer le tutoriel</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      <span>Continuer</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              currentStepIndex === 0 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-gray-100"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={() => handleJumpToStep(ONBOARDING_STEPS[currentStepIndex - 1].id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={ONBOARDING_STEPS[currentStepIndex - 1].title}
              >
                <Star className="w-4 h-4 text-gray-400" />
              </button>
            )}
            {currentStepIndex < ONBOARDING_STEPS.length - 1 && (
              <button
                onClick={() => handleJumpToStep(ONBOARDING_STEPS[currentStepIndex + 1].id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={ONBOARDING_STEPS[currentStepIndex + 1].title}
              >
                <Star className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep.type === 'setup_completion'}
            className={cn(
              "flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors font-medium",
              currentStep.type === 'setup_completion' 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-blue-700"
            )}
          >
            <span>
              {currentStep.type === 'setup_completion' ? 'Terminer' : 'Suivant'}
            </span>
            {currentStep.type !== 'setup_completion' && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
