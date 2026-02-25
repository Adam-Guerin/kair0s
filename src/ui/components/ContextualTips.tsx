/**
 * Kair0s Contextual Tips
 * 
 * Intelligent contextual tips that reduce friction and make "fused" features
 * visible from first use through contextual discovery.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Lightbulb, 
  X, 
  ChevronRight, 
  Zap, 
  Target, 
  Settings, 
  Command,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import { colors, spacing, borderRadius, shadows, animations } from '../theme/index.js';

// ============================================================================
// TYPES
// ============================================================================

interface Tip {
  id: string;
  title: string;
  description: string;
  type: 'feature_discovery' | 'shortcut' | 'workflow' | 'advanced' | 'contextual';
  category: 'command_bar' | 'presets' | 'orchestrator' | 'plugins' | 'proactive';
  priority: 'low' | 'medium' | 'high';
  trigger?: {
    event: string;
    selector?: string;
    condition?: string;
  };
  action?: {
    type: 'navigate' | 'execute' | 'show' | 'highlight';
    target: string;
    params?: Record<string, any>;
  };
  dismissible: boolean;
  autoShow?: boolean;
  cooldown?: number; // minutes
}

interface ContextualTipsProps {
  className?: string;
  onTipAction?: (tip: Tip, action: Tip['action']) => void;
  onTipDismiss?: (tip: Tip) => void;
  maxVisible?: number;
  showProgress?: boolean;
}

// ============================================================================
// CONTEXTUAL TIPS DATABASE
// ============================================================================

const CONTEXTUAL_TIPS: Tip[] = [
  // Command Bar Tips
  {
    id: 'command_bar_discovery',
    title: 'Commande Intelligente',
    description: 'Accédez à toutes les actions avec ⌘K. Essayez "nouvelle session" ou "réunion rapide".',
    type: 'feature_discovery',
    category: 'command_bar',
    priority: 'high',
    trigger: {
      event: 'page_load',
      condition: 'first_visit'
    },
    action: {
      type: 'show',
      target: 'command_bar_demo'
    },
    dismissible: true,
    autoShow: true,
    cooldown: 1440 // 24 hours
  },
  {
    id: 'command_bar_shortcuts',
    title: 'Raccourcis Rapides',
    description: 'Utilisez ⌘⇧M pour réunion, ⌘⇧P pour prospection, ⌘⇧S pour support.',
    type: 'shortcut',
    category: 'command_bar',
    priority: 'medium',
    trigger: {
      event: 'command_bar_open',
      condition: 'usage_count < 5'
    },
    action: {
      type: 'highlight',
      target: '.shortcuts-panel'
    },
    dismissible: true,
    cooldown: 480 // 8 hours
  },
  
  // Presets Tips
  {
    id: 'presets_discovery',
    title: 'Presets Métier',
    description: 'Les presets adaptent automatiquement l\'assistant à votre contexte professionnel.',
    type: 'feature_discovery',
    category: 'presets',
    priority: 'high',
    trigger: {
      event: 'session_start',
      condition: 'no_preset_selected'
    },
    action: {
      type: 'show',
      target: 'presets_selector'
    },
    dismissible: true,
    autoShow: true,
    cooldown: 720 // 12 hours
  },
  {
    id: 'presets_context_switch',
    title: 'Changement de Contexte',
    description: 'Basculez entre les presets selon votre activité. Le système apprend vos préférences.',
    type: 'workflow',
    category: 'presets',
    priority: 'medium',
    trigger: {
      event: 'context_change_detected',
      condition: 'manual_preset_switch < 3'
    },
    dismissible: true,
    cooldown: 240 // 4 hours
  },
  
  // Orchestrator Tips
  {
    id: 'orchestrator_transparent',
    title: 'Orchestrateur Transparent',
    description: 'Kair0s choisit automatiquement le meilleur modèle AI et expose les raisons de ce choix.',
    type: 'feature_discovery',
    category: 'orchestrator',
    priority: 'high',
    trigger: {
      event: 'provider_selection_attempt',
      condition: 'first_time'
    },
    action: {
      type: 'show',
      target: 'orchestrator_status'
    },
    dismissible: true,
    autoShow: true,
    cooldown: 1440
  },
  {
    id: 'orchestrator_optimization',
    title: 'Optimisation Automatique',
    description: 'L\'orchestrateur s\'améliore avec votre utilisation pour des performances optimales.',
    type: 'advanced',
    category: 'orchestrator',
    priority: 'low',
    trigger: {
      event: 'session_complete',
      condition: 'performance_score < 0.8'
    },
    dismissible: true,
    cooldown: 1440
  },
  
  // Plugins Tips
  {
    id: 'plugins_marketplace',
    title: 'Marketplace de Plugins',
    description: 'Étendez Kair0s avec des plugins pour CRM, calendrier, analytics et plus.',
    type: 'feature_discovery',
    category: 'plugins',
    priority: 'medium',
    trigger: {
      event: 'feature_explore',
      condition: 'plugins_tab_never_visited'
    },
    action: {
      type: 'navigate',
      target: '/plugins'
    },
    dismissible: true,
    cooldown: 720
  },
  {
    id: 'plugins_installation',
    title: 'Installation Simplifiée',
    description: 'Cliquez sur "Installer" dans la marketplace pour ajouter de nouvelles fonctionnalités.',
    type: 'workflow',
    category: 'plugins',
    priority: 'low',
    trigger: {
      event: 'plugins_page_visit',
      condition: 'no_plugins_installed'
    },
    dismissible: true,
    cooldown: 480
  },
  
  // Proactive Context Tips
  {
    id: 'proactive_screenshot',
    title: 'Détection Automatique',
    description: 'Kair0s analyse votre écran et suggère des actions pertinentes automatiquement.',
    type: 'feature_discovery',
    category: 'proactive',
    priority: 'high',
    trigger: {
      event: 'screenshot_detected',
      condition: 'first_proactive_suggestion'
    },
    action: {
      type: 'show',
      target: 'proactive_suggestions'
    },
    dismissible: true,
    autoShow: true,
    cooldown: 1440
  },
  {
    id: 'proactive_code_analysis',
    title: 'Analyse de Code Intelligente',
    description: 'Détectez les erreurs et obtenez des suggestions d\'optimisation en temps réel.',
    type: 'contextual',
    category: 'proactive',
    priority: 'medium',
    trigger: {
      event: 'code_editor_detected',
      selector: '.code-editor',
      condition: 'error_detected OR optimization_available'
    },
    action: {
      type: 'highlight',
      target: '.code-analysis-panel'
    },
    dismissible: true,
    cooldown: 60 // 1 hour
  },
  
  // Advanced Workflow Tips
  {
    id: 'workflow_automation',
    title: 'Automatisation de Workflows',
    description: 'Créez des workflows personnalisés pour vos tâches répétitives.',
    type: 'advanced',
    category: 'workflow',
    priority: 'low',
    trigger: {
      event: 'repetitive_task_detected',
      condition: 'no_workflows_created'
    },
    action: {
      type: 'navigate',
      target: '/workflows'
    },
    dismissible: true,
    cooldown: 720
  },
  {
    id: 'integration_tips',
    title: 'Intégrations Externes',
    description: 'Connectez Kair0s à vos outils existants pour une productivité maximale.',
    type: 'advanced',
    category: 'workflow',
    priority: 'low',
    trigger: {
      event: 'productivity_peak',
      condition: 'no_integrations_setup'
    },
    action: {
      type: 'show',
      target: 'integration_wizard'
    },
    dismissible: true,
    cooldown: 1440
  }
];

// ============================================================================
// CONTEXTUAL TIPS COMPONENT
// ============================================================================

export const ContextualTips: React.FC<ContextualTipsProps> = ({
  className = '',
  onTipAction,
  onTipDismiss,
  maxVisible = 3,
  showProgress = true,
}) => {
  const [activeTips, setActiveTips] = useState<Tip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  const [visibleTips, setVisibleTips] = useState<Tip[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  // Load dismissed tips from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kair0s_dismissed_tips');
    if (saved) {
      setDismissedTips(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save dismissed tips to localStorage
  const saveDismissedTips = useCallback((tips: Set<string>) => {
    localStorage.setItem('kair0s_dismissed_tips', JSON.stringify([...tips]));
  }, []);

  // Check if tip should be shown
  const shouldShowTip = useCallback((tip: Tip): boolean => {
    // Check if already dismissed
    if (dismissedTips.has(tip.id)) return false;
    
    // Check cooldown
    const lastShown = localStorage.getItem(`kair0s_tip_${tip.id}_last_shown`);
    if (lastShown && tip.cooldown) {
      const lastShownTime = parseInt(lastShown);
      const cooldownMs = tip.cooldown * 60 * 1000; // Convert minutes to ms
      if (Date.now() - lastShownTime < cooldownMs) {
        return false;
      }
    }
    
    // Check trigger conditions
    if (tip.trigger) {
      switch (tip.trigger.event) {
        case 'page_load':
          return tip.trigger.condition === 'first_visit' && 
                 !localStorage.getItem('kair0s_visited_before');
        
        case 'command_bar_open':
          return localStorage.getItem('kair0s_command_bar_usage_count') === 
                 tip.trigger.condition?.match(/\d+/)?.[0];
        
        case 'session_start':
          return !localStorage.getItem('kair0s_preset_ever_selected');
        
        case 'provider_selection_attempt':
          return !localStorage.getItem('kair0s_provider_manual_selection');
        
        case 'screenshot_detected':
          return localStorage.getItem('kair0s_proactive_enabled') === 'true';
        
        default:
          return true;
      }
    }
    
    return tip.autoShow || false;
  }, [dismissedTips]);

  // Filter and prioritize tips
  useEffect(() => {
    const availableTips = CONTEXTUAL_TIPS.filter(shouldShowTip);
    
    // Sort by priority and relevance
    const sortedTips = availableTips.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Prefer contextual tips
      if (a.type === 'contextual' && b.type !== 'contextual') return -1;
      if (b.type === 'contextual' && a.type !== 'contextual') return 1;
      
      return 0;
    });
    
    setActiveTips(sortedTips);
    setVisibleTips(sortedTips.slice(0, maxVisible));
  }, [shouldShowTip, maxVisible]);

  // Set up mutation observer for contextual triggers
  useEffect(() => {
    if (!window.MutationObserver) return;

    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check for new elements that might trigger tips
          const addedNodes = Array.from(mutation.addedNodes);
          
          // Check for code editor
          const hasCodeEditor = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node as Element).classList?.contains('code-editor')
          );
          
          if (hasCodeEditor) {
            // Trigger code analysis tips
            const codeTips = CONTEXTUAL_TIPS.filter(tip => 
              tip.trigger?.event === 'code_editor_detected'
            );
            
            codeTips.forEach(tip => {
              if (shouldShowTip(tip) && !visibleTips.find(vt => vt.id === tip.id)) {
                setVisibleTips(prev => [...prev.slice(0, maxVisible - 1), tip]);
              }
            });
          }
        }
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [shouldShowTip, visibleTips, maxVisible]);

  // Handle tip action
  const handleTipAction = useCallback((tip: Tip) => {
    if (tip.action) {
      onTipAction?.(tip, tip.action);
      
      // Execute the action
      switch (tip.action.type) {
        case 'navigate':
          if (tip.action.target.startsWith('/')) {
            window.location.href = tip.action.target;
          } else {
            // Handle internal navigation
            const element = document.querySelector(tip.action.target);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
          break;
          
        case 'show':
          // Show/hide UI elements
          const element = document.querySelector(tip.action.target);
          if (element) {
            element.classList.remove('hidden');
            element.classList.add('highlighted');
          }
          break;
          
        case 'highlight':
          // Highlight elements
          const elements = document.querySelectorAll(tip.action.target);
          elements.forEach(el => {
            el.classList.add('tip-highlighted');
          });
          break;
          
        case 'execute':
          // Execute commands or functions
          if (tip.action.target === 'command_bar_demo') {
            // Trigger command bar
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: true,
              bubbles: true
            });
            document.dispatchEvent(event);
          }
          break;
      }
    }
  }, [onTipAction]);

  // Handle tip dismissal
  const handleTipDismiss = useCallback((tip: Tip) => {
    const newDismissed = new Set([...dismissedTips, tip.id]);
    setDismissedTips(newDismissed);
    saveDismissedTips(newDismissed);
    
    // Remove from visible tips
    setVisibleTips(prev => prev.filter(t => t.id !== tip.id));
    
    // Mark as shown for cooldown
    localStorage.setItem(`kair0s_tip_${tip.id}_last_shown`, Date.now().toString());
    
    onTipDismiss?.(tip);
  }, [dismissedTips, saveDismissedTips, onTipDismiss]);

  // Get category icon
  const getCategoryIcon = (category: Tip['category']) => {
    switch (category) {
      case 'command_bar':
        return <Command className="w-4 h-4" />;
      case 'presets':
        return <Target className="w-4 h-4" />;
      case 'orchestrator':
        return <Settings className="w-4 h-4" />;
      case 'plugins':
        return <Zap className="w-4 h-4" />;
      case 'proactive':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Tip['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Get type icon
  const getTypeIcon = (type: Tip['type']) => {
    switch (type) {
      case 'feature_discovery':
        return <Lightbulb className="w-4 h-4" />;
      case 'shortcut':
        return <Command className="w-4 h-4" />;
      case 'workflow':
        return <ArrowRight className="w-4 h-4" />;
      case 'advanced':
        return <Settings className="w-4 h-4" />;
      case 'contextual':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  if (visibleTips.length === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-40 max-w-sm",
      className
    )}>
      {/* Tips Container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-gray-900">
              Conseils Intelligents
            </span>
            {showProgress && (
              <span className="text-sm text-gray-500">
                ({visibleTips.length} actifs)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {visibleTips.length > 1 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title={isExpanded ? "Réduire" : "Développer"}
              >
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    isExpanded && "rotate-90"
                  )} 
                />
              </button>
            )}
            
            <button
              onClick={() => {
                visibleTips.forEach(tip => handleTipDismiss(tip));
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Tout ignorer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tips List */}
        <div className={cn(
          "transition-all duration-300",
          isExpanded ? "max-h-96 overflow-y-auto" : "max-h-64 overflow-hidden"
        )}>
          {visibleTips.map((tip, index) => (
            <div
              key={tip.id}
              className={cn(
                "p-4 border-b border-gray-100 last:border-b-0",
                "hover:bg-gray-50 transition-colors"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Category Icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  {getCategoryIcon(tip.category)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {tip.title}
                    </h4>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getPriorityColor(tip.priority)
                    )}>
                      {tip.priority}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      {getTypeIcon(tip.type)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {tip.description}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {tip.action && (
                      <button
                        onClick={() => handleTipAction(tip)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        <span>Essayer</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    
                    {tip.dismissible && (
                      <button
                        onClick={() => handleTipDismiss(tip)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Ignorer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      {showProgress && activeTips.length > visibleTips.length && (
        <div className="mt-2 text-center">
          <button
            onClick={() => {
              const nextTips = activeTips.slice(visibleTips.length, visibleTips.length + 1);
              setVisibleTips(prev => [...prev, ...nextTips]);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Voir {Math.min(activeTips.length - visibleTips.length, 1)} autre conseil
          </button>
        </div>
      )}
    </div>
  );
};

export default ContextualTips;
