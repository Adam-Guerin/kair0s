/**
 * Kair0s History & Favorites Panel
 * 
 * Unified panel that combines history tracking, favorites management,
 * and quick access to frequently used actions and contexts.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Star, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Settings,
  Zap
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import { colors, spacing, borderRadius, shadows, animations } from '../theme/index.js';

// ============================================================================
// TYPES
// ============================================================================

interface HistoryItem {
  id: string;
  title: string;
  description?: string;
  type: 'session' | 'action' | 'preset' | 'command';
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
  tags?: string[];
}

interface FavoriteItem {
  id: string;
  title: string;
  description?: string;
  type: 'action' | 'preset' | 'command' | 'context';
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  metadata?: Record<string, any>;
  category?: string;
}

interface HistoryFavoritesPanelProps {
  className?: string;
  maxItems?: number;
  showSearch?: boolean;
  onItemSelected?: (item: HistoryItem | FavoriteItem) => void;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: 'session-1',
    title: 'Réunion Client - Q4 Planning',
    description: 'Session de réunion avec le client pour planning Q4',
    type: 'session',
    timestamp: Date.now() - 86400000, // 1 day ago
    duration: 45,
    tags: ['réunion', 'client', 'planning'],
    metadata: {
      preset: 'meeting',
      participants: 5,
      actionsGenerated: 8,
    },
  },
  {
    id: 'session-2',
    title: 'Prospection Tech - Lead Qualification',
    description: 'Session de prospection avec qualification de leads tech',
    type: 'session',
    timestamp: Date.now() - 172800000, // 2 days ago
    duration: 30,
    tags: ['prospection', 'tech', 'leads'],
    metadata: {
      preset: 'prospection',
      leadsProcessed: 15,
      conversionRate: 0.73,
    },
  },
  {
    id: 'action-1',
    title: 'Export Actions vers CRM',
    description: 'Export des actions vers Salesforce',
    type: 'action',
    timestamp: Date.now() - 3600000, // 1 hour ago
    tags: ['export', 'crm', 'salesforce'],
    metadata: {
      actionType: 'export',
      target: 'salesforce',
      itemsCount: 12,
    },
  },
];

const DEFAULT_FAVORITES: FavoriteItem[] = [
  {
    id: 'quick-meeting',
    title: 'Réunion Rapide',
    description: 'Démarrer une session réunion avec template par défaut',
    type: 'preset',
    icon: <Calendar className="w-4 h-4" />,
    shortcut: '⌘⇧M',
    action: () => console.log('Quick meeting action'),
    category: 'meeting',
  },
  {
    id: 'quick-summary',
    title: 'Résumé Intelligent',
    description: 'Générer un résumé de la session en cours',
    type: 'action',
    icon: <Star className="w-4 h-4" />,
    shortcut: '⌘⇧S',
    action: () => console.log('Quick summary action'),
    category: 'analysis',
  },
  {
    id: 'quick-prospection',
    title: 'Prospection Automatisée',
    description: 'Lancer le workflow de prospection complet',
    type: 'preset',
    icon: <Zap className="w-4 h-4" />,
    shortcut: '⌘⇧P',
    action: () => console.log('Quick prospection action'),
    category: 'prospection',
  },
  {
    id: 'quick-support',
    title: 'Support Client',
    description: 'Activer le mode support client',
    type: 'preset',
    icon: <Users className="w-4 h-4" />,
    shortcut: '⌘⇧S',
    action: () => console.log('Quick support action'),
    category: 'support',
  },
];

// ============================================================================
// HISTORY FAVORITES PANEL COMPONENT
// ============================================================================

export const HistoryFavoritesPanel: React.FC<HistoryFavoritesPanelProps> = ({
  className = '',
  maxItems = 50,
  showSearch = true,
  onItemSelected,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(DEFAULT_HISTORY);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(DEFAULT_FAVORITES);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteItem[]>([]);

  // Filter items based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHistory(history);
      setFilteredFavorites(favorites);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    const filteredHist = history.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    ).slice(0, maxItems);

    const filteredFavs = favorites.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    ).slice(0, maxItems);

    setFilteredHistory(filteredHist);
    setFilteredFavorites(filteredFavs);
  }, [searchQuery, history, favorites, maxItems]);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  // Format duration
  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  // Handle item selection
  const handleItemClick = useCallback((item: HistoryItem | FavoriteItem) => {
    if ('action' in item && item.action) {
      item.action();
    }
    onItemSelected?.(item);
  }, [onItemSelected]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setFilteredHistory([]);
  }, []);

  // Add to favorites
  const addToFavorites = useCallback((item: HistoryItem) => {
    const favorite: FavoriteItem = {
      id: `fav-${item.id}`,
      title: item.title,
      description: item.description,
      type: item.type === 'session' ? 'preset' : item.type,
      icon: item.type === 'session' ? <Calendar className="w-4 h-4" /> : <Star className="w-4 h-4" />,
      action: () => {
        // Re-execute the item
        console.log('Re-executing favorite:', item.title);
      },
      metadata: item.metadata,
      category: item.tags?.[0],
    };
    
    setFavorites(prev => [favorite, ...prev]);
  }, []);

  // Remove from favorites
  const removeFromFavorites = useCallback((id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Historique & Favoris
          </h2>
        </div>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium transition-colors",
            activeTab === 'history' 
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
              : "text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <Clock className="w-4 h-4 mr-2 inline" />
          Historique
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium transition-colors",
            activeTab === 'favorites' 
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
              : "text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <Star className="w-4 h-4 mr-2 inline" />
          Favoris
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'history' ? (
          <div className="p-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <div className="text-gray-600 font-medium">
                  Aucun historique
                </div>
                <div className="text-sm text-gray-500">
                  Vos actions et sessions apparaîtront ici
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {item.title}
                          </div>
                          {item.shortcut && (
                            <div className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-1 rounded">
                              {item.shortcut}
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-600 truncate">
                            {item.description}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          {item.duration && (
                            <>
                              <span>•</span>
                              <span>{formatDuration(item.duration)}</span>
                            </>
                          )}
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToFavorites(item);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Ajouter aux favoris"
                        >
                          <Star className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete action
                            console.log('Delete history item:', item.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearHistory}
                  className="w-full py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  Vider l'historique
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <div className="text-gray-600 font-medium">
                  Aucun favori
                </div>
                <div className="text-sm text-gray-500">
                  Ajoutez vos actions et presets favoris ici
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFavorites.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-600 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.shortcut && (
                          <div className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-1 rounded">
                            {item.shortcut}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromFavorites(item.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Supprimer des favoris"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryFavoritesPanel;
