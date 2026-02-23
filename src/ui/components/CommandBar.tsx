/**
 * Kair0s Intelligent Command Bar
 * 
 * Unified command bar that combines actions, favorites, history,
 * plugins and context in a single intelligent entry point.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Command, Clock, Star, History, Zap, Settings, X } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { colors, spacing, borderRadius, shadows, animations } from '../theme/index.js';

// ============================================================================
// TYPES
// ============================================================================

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  category: 'action' | 'favorite' | 'history' | 'plugin' | 'context';
  action?: () => void;
  shortcut?: string;
  keywords?: string[];
  priority?: number;
  metadata?: Record<string, any>;
}

interface CommandCategory {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items: CommandItem[];
}

interface CommandBarProps {
  placeholder?: string;
  maxResults?: number;
  showShortcuts?: boolean;
  onCommandExecute?: (command: CommandItem) => void;
  className?: string;
}

// ============================================================================
// DEFAULT COMMANDS
// ============================================================================

const DEFAULT_ACTIONS: CommandItem[] = [
  {
    id: 'new-session',
    title: 'Nouvelle Session',
    description: 'Démarrer une nouvelle session Kair0s',
    icon: <Zap className="w-4 h-4" />,
    category: 'action',
    shortcut: '⌘N',
    keywords: ['session', 'nouveau', 'démarrer'],
    priority: 1,
  },
  {
    id: 'meeting-preset',
    title: 'Mode Réunion',
    description: 'Activer le preset réunion intelligent',
    icon: <Settings className="w-4 h-4" />,
    category: 'action',
    shortcut: '⌘M',
    keywords: ['réunion', 'meeting', 'présentiel'],
    priority: 2,
  },
  {
    id: 'prospection-preset',
    title: 'Mode Prospection',
    description: 'Activer le preset prospection automatique',
    icon: <Zap className="w-4 h-4" />,
    category: 'action',
    shortcut: '⌘P',
    keywords: ['prospection', 'vente', 'client'],
    priority: 2,
  },
  {
    id: 'support-preset',
    title: 'Mode Support',
    description: 'Activer le preset support client',
    icon: <Settings className="w-4 h-4" />,
    category: 'action',
    shortcut: '⌘S',
    keywords: ['support', 'aide', 'assistance'],
    priority: 2,
  },
];

const DEFAULT_FAVORITES: CommandItem[] = [
  {
    id: 'quick-summary',
    title: 'Résumé Rapide',
    description: 'Générer un résumé de la session en cours',
    icon: <Star className="w-4 h-4" />,
    category: 'favorite',
    keywords: ['résumé', 'summary', 'rapide'],
    priority: 1,
  },
  {
    id: 'export-actions',
    title: 'Exporter Actions',
    description: 'Exporter les actions de la session',
    icon: <Star className="w-4 h-4" />,
    category: 'favorite',
    keywords: ['exporter', 'actions', 'tâches'],
    priority: 2,
  },
];

const DEFAULT_HISTORY: CommandItem[] = [
  {
    id: 'last-meeting',
    title: 'Dernière Réunion',
    description: 'Revenir à la dernière session de réunion',
    icon: <History className="w-4 h-4" />,
    category: 'history',
    keywords: ['réunion', 'dernier', 'précédent'],
    priority: 1,
  },
  {
    id: 'last-prospection',
    title: 'Dernière Prospection',
    description: 'Revenir à la dernière session de prospection',
    icon: <History className="w-4 h-4" />,
    category: 'history',
    keywords: ['prospection', 'dernier', 'précédent'],
    priority: 2,
  },
];

const DEFAULT_PLUGINS: CommandItem[] = [
  {
    id: 'calendar-integration',
    title: 'Intégration Calendrier',
    description: 'Connecter avec Google Calendar ou Outlook',
    icon: <Zap className="w-4 h-4" />,
    category: 'plugin',
    keywords: ['calendrier', 'calendar', 'google', 'outlook'],
    priority: 1,
  },
  {
    id: 'crm-integration',
    title: 'Intégration CRM',
    description: 'Connecter avec Salesforce ou HubSpot',
    icon: <Zap className="w-4 h-4" />,
    category: 'plugin',
    keywords: ['crm', 'salesforce', 'hubspot', 'client'],
    priority: 2,
  },
];

// ============================================================================
// COMMAND BAR COMPONENT
// ============================================================================

export const CommandBar: React.FC<CommandBarProps> = ({
  placeholder = "Rechercher une commande...",
  maxResults = 8,
  showShortcuts = true,
  onCommandExecute,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categories, setCategories] = useState<CommandCategory[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine all command items
  const allCommands: CommandItem[] = [
    ...DEFAULT_ACTIONS,
    ...DEFAULT_FAVORITES,
    ...DEFAULT_HISTORY,
    ...DEFAULT_PLUGINS,
  ];

  // Filter commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return allCommands
      .filter(command => {
        const searchText = `${command.title} ${command.description || ''} ${command.keywords?.join(' ') || ''}`.toLowerCase();
        
        return searchTerms.every(term => searchText.includes(term));
      })
      .sort((a, b) => {
        // Prioritize by priority first, then by relevance
        const priorityDiff = (b.priority || 0) - (a.priority || 0);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by title match
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const queryLower = query.toLowerCase();
        
        if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1;
        if (!aTitle.startsWith(queryLower) && bTitle.startsWith(queryLower)) return 1;
        
        return 0;
      })
      .slice(0, maxResults);
  }, [query, allCommands, maxResults]);

  // Group filtered commands by category
  const groupedCommands = React.useMemo(() => {
    if (filteredCommands.length === 0) return [];

    const groups: Record<string, CommandItem[]> = {};
    
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });

    return Object.entries(groups).map(([category, items]) => ({
      id: category,
      title: {
        action: 'Actions',
        favorite: 'Favoris',
        history: 'Historique',
        plugin: 'Plugins',
        context: 'Contexte',
      }[category] as string,
      items,
    }));
  }, [filteredCommands]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex]);

  // Execute command
  const executeCommand = useCallback((command: CommandItem) => {
    if (command.action) {
      command.action();
    }
    
    onCommandExecute?.(command);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, [onCommandExecute]);

  // Toggle command bar
  const toggleCommandBar = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command bar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandBar();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleCommandBar]);

  // Update selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Category icons
  const categoryIcons: Record<string, React.ReactNode> = {
    action: <Zap className="w-4 h-4" />,
    favorite: <Star className="w-4 h-4" />,
    history: <History className="w-4 h-4" />,
    plugin: <Zap className="w-4 h-4" />,
    context: <Settings className="w-4 h-4" />,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Command Bar */}
      <div className={cn(
        "relative w-full max-w-2xl mx-auto mt-20 bg-white rounded-lg shadow-lg border border-gray-200",
        "transform transition-all duration-200 ease-out",
        className
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query && groupedCommands.length > 0 ? (
            <div className="p-2">
              {groupedCommands.map((category) => (
                <div key={category.id} className="mb-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {categoryIcons[category.id]}
                    <span>{category.title}</span>
                  </div>
                  
                  {/* Category Items */}
                  <div className="space-y-1">
                    {category.items.map((item, index) => {
                      const globalIndex = filteredCommands.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => executeCommand(item)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                            "hover:bg-gray-50 focus:bg-gray-50",
                            isSelected && "bg-blue-50 text-blue-600"
                          )}
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {item.icon}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-500 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          
                          {/* Shortcut */}
                          {showShortcuts && item.shortcut && (
                            <div className="flex-shrink-0 text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                              {item.shortcut}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <div className="text-gray-600 font-medium">
                Aucune commande trouvée pour "{query}"
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Essayez d'autres mots-clés
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-4">
                Commandes rapides (⌘K pour ouvrir)
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_ACTIONS.slice(0, 4).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeCommand(action)}
                    className="flex items-center gap-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {action.icon}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {action.title}
                      </div>
                      {action.shortcut && (
                        <div className="text-xs text-gray-500">
                          {action.shortcut}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandBar;
