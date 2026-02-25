/**
 * Kair0s Plugin List Component
 * 
 * Unified plugin management interface that displays all available plugins,
 * their status, and provides installation/management capabilities.
 */

import React, { useState, useCallback } from 'react';
import { 
  Package, 
  Download, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Search,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '../utils/cn.js';

// ============================================================================
// TYPES
// ============================================================================

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  status: 'installed' | 'available' | 'update-available' | 'error' | 'disabled';
  icon?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords: string[];
  installedAt?: number;
  lastUsed?: number;
  usageCount?: number;
  rating?: number;
  size?: number;
  permissions: string[];
  capabilities: string[];
  dependencies?: string[];
  metadata?: Record<string, any>;
}

interface PluginListProps {
  className?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  onPluginInstall?: (plugin: Plugin) => void;
  onPluginUninstall?: (plugin: Plugin) => void;
  onPluginEnable?: (plugin: Plugin) => void;
  onPluginDisable?: (plugin: Plugin) => void;
  onPluginConfigure?: (plugin: Plugin) => void;
}

interface PluginCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

// ============================================================================
// DEFAULT PLUGINS
// ============================================================================

const DEFAULT_PLUGINS: Plugin[] = [
  {
    id: 'kair0s-core-integration',
    name: 'Kair0s Core Integration',
    version: '1.0.0',
    description: 'Core integration plugin that provides seamless OpenClaw engine connectivity and basic AI assistant capabilities',
    author: 'Kair0s Team',
    category: 'core',
    status: 'installed',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxuZGF0YQoAAAABJRU5ErkJggg==',
    homepage: 'https://kair0s.com/plugins/core-integration',
    repository: 'https://github.com/kair0s/core-integration',
    license: 'MIT',
    keywords: ['core', 'integration', 'openclaw', 'ai'],
    installedAt: Date.now() - 86400000,
    lastUsed: Date.now() - 3600000,
    usageCount: 156,
    rating: 4.8,
    size: 2048,
    permissions: ['engine:execute', 'engine:configure', 'storage:read', 'storage:write'],
    capabilities: ['plugin-api', 'engine-api', 'ui-components'],
    dependencies: ['openclaw>=1.0.0'],
    metadata: {
      engineVersion: '1.2.0',
      apiVersion: '1.0.0',
      integrationType: 'core',
      features: ['chat', 'transcription', 'summarization', 'action-extraction'],
    },
  },
  {
    id: 'kair0s-calendar-sync',
    name: 'Calendar Sync',
    version: '1.0.0',
    description: 'Two-way synchronization with Google Calendar, Outlook, and other calendar services',
    author: 'Kair0s Team',
    category: 'productivity',
    status: 'installed',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxuZGF0YQoAAAABJRU5ErkJggg==',
    homepage: 'https://kair0s.com/plugins/calendar-sync',
    repository: 'https://github.com/kair0s/calendar-sync',
    license: 'MIT',
    keywords: ['calendar', 'sync', 'google', 'outlook', 'productivity'],
    installedAt: Date.now() - 172800000,
    lastUsed: Date.now() - 86400000,
    usageCount: 45,
    rating: 4.2,
    size: 1024,
    permissions: ['network:request', 'storage:read', 'storage:write'],
    capabilities: ['network-access', 'file-system', 'custom-hooks'],
    dependencies: [],
    metadata: {
      supportedServices: ['google-calendar', 'outlook', 'apple-calendar'],
      syncType: 'two-way',
      features: ['event-creation', 'reminder-sync', 'availability-check'],
    },
  },
  {
    id: 'kair0s-crm-connector',
    name: 'CRM Connector',
    version: '1.0.0',
    description: 'Connect with Salesforce, HubSpot, and other CRM systems',
    author: 'Kair0s Team',
    category: 'business',
    status: 'available',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxuZGF0YQoAAAABJRU5ErkJggg==',
    homepage: 'https://kair0s.com/plugins/crm-connector',
    repository: 'https://github.com/kair0s/crm-connector',
    license: 'MIT',
    keywords: ['crm', 'salesforce', 'hubspot', 'business', 'sales'],
    size: 1536,
    permissions: ['network:request', 'storage:read', 'storage:write'],
    capabilities: ['network-access', 'file-system', 'custom-hooks'],
    dependencies: [],
    metadata: {
      supportedCRMs: ['salesforce', 'hubspot', 'zoho', 'pipedrive'],
      features: ['lead-creation', 'contact-sync', 'opportunity-tracking'],
    },
  },
  {
    id: 'kair0s-analytics-dashboard',
    name: 'Analytics Dashboard',
    version: '1.0.0',
    description: 'Advanced analytics and reporting dashboard for Kair0s usage and performance metrics',
    author: 'Kair0s Team',
    category: 'analytics',
    status: 'installed',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxuZGF0YQoAAAABJRU5ErkJggg==',
    homepage: 'https://kair0s.com/plugins/analytics-dashboard',
    repository: 'https://github.com/kair0s/analytics-dashboard',
    license: 'MIT',
    keywords: ['analytics', 'dashboard', 'metrics', 'reporting'],
    installedAt: Date.now() - 604800000,
    lastUsed: Date.now() - 7200000,
    usageCount: 89,
    rating: 4.6,
    size: 3072,
    permissions: ['system:metrics', 'storage:read'],
    capabilities: ['custom-hooks', 'system-integration'],
    dependencies: [],
    metadata: {
      metrics: ['usage', 'performance', 'errors', 'security'],
      reports: ['usage-summary', 'performance-report', 'error-analysis'],
      charts: ['line-chart', 'bar-chart', 'pie-chart'],
    },
  },
];

// ============================================================================
// PLUGIN LIST COMPONENT
// ============================================================================

export const PluginList: React.FC<PluginListProps> = ({
  className = '',
  showSearch = true,
  showCategories = true,
  onPluginInstall,
  onPluginUninstall,
  onPluginEnable,
  onPluginDisable,
  onPluginConfigure,
}) => {
  const [plugins, setPlugins] = useState<Plugin[]>(DEFAULT_PLUGINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Filter plugins based on search and category
  const filteredPlugins = React.useMemo(() => {
    let filtered = plugins;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
        plugin.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [plugins, selectedCategory, searchQuery]);

  // Get categories with counts
  const categories = React.useMemo(() => {
    const categoryMap = new Map<string, PluginCategory>();
    
    plugins.forEach(plugin => {
      const existing = categoryMap.get(plugin.category);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(plugin.category, {
          id: plugin.category,
          name: plugin.category.charAt(0).toUpperCase() + plugin.category.slice(1),
          description: `${plugin.category} plugins`,
          count: 1,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [plugins]);

  // Handle plugin installation
  const handleInstallPlugin = useCallback(async (plugin: Plugin) => {
    setIsInstalling(plugin.id);
    
    try {
      // Simulate plugin installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPlugins(prev => prev.map(p => 
        p.id === plugin.id 
          ? { ...p, status: 'installed', installedAt: Date.now() }
          : p
      ));
      
      onPluginInstall?.(plugin);
      setIsInstalling(null);
    } catch (error) {
      console.error('Failed to install plugin:', plugin.id, error);
      setIsInstalling(null);
    }
  }, [onPluginInstall]);

  // Handle plugin uninstallation
  const handleUninstallPlugin = useCallback(async (plugin: Plugin) => {
    try {
      // Simulate plugin uninstallation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPlugins(prev => prev.filter(p => p.id !== plugin.id));
      onPluginUninstall?.(plugin);
    } catch (error) {
      console.error('Failed to uninstall plugin:', plugin.id, error);
    }
  }, [onPluginUninstall]);

  // Handle plugin enable/disable
  const handleTogglePlugin = useCallback(async (plugin: Plugin) => {
    const newStatus = plugin.status === 'installed' ? 'disabled' : 'installed';
    
    try {
      // Simulate plugin toggle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlugins(prev => prev.map(p => 
        p.id === plugin.id ? { ...p, status: newStatus }
          : p
      ));
      
      if (newStatus === 'installed') {
        onPluginEnable?.(plugin);
      } else {
        onPluginDisable?.(plugin);
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', plugin.id, error);
    }
  }, [onPluginEnable, onPluginDisable]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Get status icon
  const getStatusIcon = (status: Plugin['status']) => {
    switch (status) {
      case 'installed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'available':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'update-available':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'disabled':
        return <Square className="w-4 h-4 text-gray-400" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: Plugin['status']) => {
    switch (status) {
      case 'installed':
        return 'text-green-600';
      case 'available':
        return 'text-blue-600';
      case 'update-available':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      case 'disabled':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
    <div className={cn("bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-6xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Plugin Marketplace
          </h2>
          <div className="text-sm text-gray-500">
            {plugins.filter(p => p.status === 'installed').length} plugins installés
          </div>
        </div>
        
        <button
          onClick={() => setShowConfigModal(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des plugins..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Categories */}
      {showCategories && (
        <div className="flex gap-2 p-4 border-b border-gray-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              selectedCategory === 'all' 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Tous ({plugins.length})
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                selectedCategory === category.id 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {category.icon}
              <span className="ml-2">{category.name}</span>
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Plugin Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedPlugin(plugin)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {plugin.icon ? (
                      <img 
                        src={plugin.icon} 
                        alt={plugin.name}
                        className="w-8 h-8"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-lg">
                      {plugin.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      v{plugin.version}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(plugin.status)}
                  <span className={cn("text-xs font-medium px-2 py-1 rounded", getStatusColor(plugin.status))}>
                    {plugin.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {plugin.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>by {plugin.author}</span>
                {plugin.size && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(plugin.size)}</span>
                  </>
                )}
                {plugin.rating && (
                  <>
                    <span>•</span>
                    <span>⭐ {plugin.rating}</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {plugin.status === 'available' && (
                  <button
                    onClick={() => handleInstallPlugin(plugin)}
                    disabled={isInstalling === plugin.id}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isInstalling === plugin.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                        <span>Installation...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Installer</span>
                      </>
                    )}
                  </button>
                )}
                
                {plugin.status === 'installed' && (
                  <>
                    <button
                      onClick={() => handleTogglePlugin(plugin)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title={plugin.status === 'disabled' ? 'Activer' : 'Désactiver'}
                    >
                      {plugin.status === 'disabled' ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => onPluginConfigure?.(plugin)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Configurer"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleUninstallPlugin(plugin)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Désinstaller"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Plugin Details Modal */}
    {selectedPlugin && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedPlugin.name}
            </h3>
            <button
              onClick={() => setSelectedPlugin(null)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {selectedPlugin.icon ? (
                  <img 
                    src={selectedPlugin.icon} 
                    alt={selectedPlugin.name}
                    className="w-12 h-12"
                  />
                ) : (
                  <Package className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-xl mb-2">
                  {selectedPlugin.name}
                </div>
                <div className="text-sm text-gray-500">
                  Version {selectedPlugin.version}
                </div>
                <div className="text-sm text-gray-500">
                  by {selectedPlugin.author}
                </div>
              </div>
            </div>
          </div>

          <div className="text-gray-600 mb-6">
            {selectedPlugin.description}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Statut:</strong> <span className={cn("ml-2", getStatusColor(selectedPlugin.status))}>{selectedPlugin.status}</span></div>
                <div><strong>Installé le:</strong> {new Date(selectedPlugin.installedAt).toLocaleDateString('fr-FR')}</div>
                <div><strong>Dernière utilisation:</strong> {selectedPlugin.lastUsed ? new Date(selectedPlugin.lastUsed).toLocaleDateString('fr-FR') : 'Jamais'}</div>
                <div><strong>Nombre d'utilisations:</strong> {selectedPlugin.usageCount}</div>
                <div><strong>Note:</strong> {selectedPlugin.rating ? `⭐ ${selectedPlugin.rating}/5` : 'Non noté'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Technique</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Taille:</strong> {formatFileSize(selectedPlugin.size || 0)}</div>
                <div><strong>Permissions:</strong> {selectedPlugin.permissions.join(', ')}</div>
                <div><strong>Capacités:</strong> {selectedPlugin.capabilities.join(', ')}</div>
                <div><strong>Dépendances:</strong> {selectedPlugin.dependencies?.join(', ') || 'Aucune'}</div>
              </div>
            </div>

            {selectedPlugin.metadata && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Métadonnées</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(selectedPlugin.metadata).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            <button
              onClick={() => setSelectedPlugin(null)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Settings Modal */}
    {showConfigModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configuration des Plugins
            </h3>
            <button
              onClick={() => setShowConfigModal(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Sécurité</div>
                <div className="text-sm text-gray-500">Activer uniquement les plugins vérifiés</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Performance</div>
                <div className="text-sm text-gray-500">Optimiser le chargement et l'exécution</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Cache</div>
                <div className="text-sm text-gray-500">Activer le cache local pour les plugins</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Mises à jour</div>
                <div className="text-sm text-gray-500">Vérifier automatiquement les mises à jour</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default PluginList;
