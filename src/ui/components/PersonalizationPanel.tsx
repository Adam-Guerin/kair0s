/**
 * Kair0s Personalization Panel
 * 
 * Advanced personalization system including themes, layouts, shortcuts,
 * workflows, and user preferences management.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Palette, 
  Layout, 
  Zap, 
  Keyboard, 
  Settings, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw,
  Plus,
  Minus,
  Move,
  Lock,
  Unlock,
  Monitor,
  Smartphone,
  Tablet,
  Moon,
  Sun,
  Globe,
  Brush,
  Layers,
  Command,
  Sliders,
  User,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import { colors, spacing, borderRadius, shadows, animations } from '../theme/index.js';

// ============================================================================
// TYPES
// ============================================================================

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export interface Layout {
  id: string;
  name: string;
  type: 'sidebar' | 'topbar' | 'minimal' | 'compact';
  sidebar: {
    position: 'left' | 'right';
    width: string;
    collapsible: boolean;
    defaultCollapsed: boolean;
  };
  header: {
    height: string;
    showBreadcrumb: boolean;
    showUserMenu: boolean;
    showNotifications: boolean;
  };
  content: {
    padding: string;
    maxWidth: string;
    centerContent: boolean;
  };
}

export interface Shortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: string;
  category: 'navigation' | 'action' | 'settings' | 'custom';
  enabled: boolean;
  global: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Array<{
    id: string;
    name: string;
    type: 'action' | 'condition' | 'delay';
    config: Record<string, any>;
  }>;
  trigger: {
    type: 'manual' | 'shortcut' | 'event';
    config: Record<string, any>;
  };
  enabled: boolean;
  icon?: string;
}

export interface UserPreferences {
  theme: string;
  layout: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    types: Record<string, boolean>;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
    usageData: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReader: boolean;
  };
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#a78bfa',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155',
      error: '#f87171',
      warning: '#fbbf24',
      success: '#34d399'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0891b2',
      secondary: '#0e7490',
      accent: '#06b6d4',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#075985',
      border: '#bae6fd',
      error: '#dc2626',
      warning: '#d97706',
      success: '#059669'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: {
      sm: '6px',
      md: '10px',
      lg: '16px',
      full: '9999px'
    }
  }
];

const DEFAULT_LAYOUTS: Layout[] = [
  {
    id: 'default',
    name: 'Default',
    type: 'sidebar',
    sidebar: {
      position: 'left',
      width: '280px',
      collapsible: true,
      defaultCollapsed: false
    },
    header: {
      height: '64px',
      showBreadcrumb: true,
      showUserMenu: true,
      showNotifications: true
    },
    content: {
      padding: '24px',
      maxWidth: '1200px',
      centerContent: false
    }
  },
  {
    id: 'compact',
    name: 'Compact',
    type: 'compact',
    sidebar: {
      position: 'left',
      width: '200px',
      collapsible: true,
      defaultCollapsed: false
    },
    header: {
      height: '56px',
      showBreadcrumb: true,
      showUserMenu: true,
      showNotifications: true
    },
    content: {
      padding: '16px',
      maxWidth: '1400px',
      centerContent: false
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    type: 'minimal',
    sidebar: {
      position: 'left',
      width: '240px',
      collapsible: true,
      defaultCollapsed: true
    },
    header: {
      height: '48px',
      showBreadcrumb: false,
      showUserMenu: true,
      showNotifications: false
    },
    content: {
      padding: '32px',
      maxWidth: '1000px',
      centerContent: true
    }
  }
];

const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: 'command_bar',
    name: 'Command Bar',
    description: 'Open the command bar',
    keys: ['cmd', 'k'],
    action: 'open_command_bar',
    category: 'navigation',
    enabled: true,
    global: true
  },
  {
    id: 'new_session',
    name: 'New Session',
    description: 'Create a new session',
    keys: ['cmd', 'n'],
    action: 'create_session',
    category: 'action',
    enabled: true,
    global: true
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Open settings',
    keys: ['cmd', ','],
    action: 'open_settings',
    category: 'navigation',
    enabled: true,
    global: true
  },
  {
    id: 'theme_toggle',
    name: 'Toggle Theme',
    description: 'Toggle between light and dark theme',
    keys: ['cmd', 'shift', 'l'],
    action: 'toggle_theme',
    category: 'settings',
    enabled: true,
    global: true
  }
];

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 'quick_meeting',
    name: 'Quick Meeting',
    description: 'Start a meeting session with transcription',
    category: 'Productivity',
    steps: [
      {
        id: '1',
        name: 'Create Session',
        type: 'action',
        config: { action: 'create_session', preset: 'meeting' }
      },
      {
        id: '2',
        name: 'Enable Audio',
        type: 'action',
        config: { action: 'enable_audio' }
      }
    ],
    trigger: {
      type: 'shortcut',
      config: { keys: ['cmd', 'shift', 'm'] }
    },
    enabled: true,
    icon: '👥'
  },
  {
    id: 'research_prospect',
    name: 'Research Prospect',
    description: 'Research a prospect and generate outreach',
    category: 'Sales',
    steps: [
      {
        id: '1',
        name: 'Create Session',
        type: 'action',
        config: { action: 'create_session', preset: 'prospecting' }
      },
      {
        id: '2',
        name: 'Search Company',
        type: 'action',
        config: { action: 'search_company' }
      },
      {
        id: '3',
        name: 'Generate Outreach',
        type: 'action',
        config: { action: 'generate_outreach' }
      }
    ],
    trigger: {
      type: 'shortcut',
      config: { keys: ['cmd', 'shift', 'r'] }
    },
    enabled: true,
    icon: '🎯'
  }
];

// ============================================================================
// PERSONALIZATION PANEL COMPONENT
// ============================================================================

interface PersonalizationPanelProps {
  className?: string;
  onThemeChange?: (theme: Theme) => void;
  onLayoutChange?: (layout: Layout) => void;
  onPreferencesChange?: (preferences: UserPreferences) => void;
}

export const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  className = '',
  onThemeChange,
  onLayoutChange,
  onPreferencesChange
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'layout' | 'shortcuts' | 'workflows' | 'preferences'>('themes');
  const [selectedTheme, setSelectedTheme] = useState<Theme>(DEFAULT_THEMES[0]);
  const [selectedLayout, setSelectedLayout] = useState<Layout>(DEFAULT_LAYOUTS[0]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    layout: 'default',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      types: {
        session: true,
        alert: true,
        update: false
      }
    },
    privacy: {
      analytics: true,
      crashReporting: true,
      usageData: false
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false
    }
  });
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(DEFAULT_SHORTCUTS);
  const [workflows, setWorkflows] = useState<Workflow[]>(DEFAULT_WORKFLOWS);
  const [customTheme, setCustomTheme] = useState<Partial<Theme>>({});
  const [isEditingTheme, setIsEditingTheme] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('kair0s_preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        
        // Apply theme and layout
        const theme = DEFAULT_THEMES.find(t => t.id === parsed.theme) || DEFAULT_THEMES[0];
        const layout = DEFAULT_LAYOUTS.find(l => l.id === parsed.layout) || DEFAULT_LAYOUTS[0];
        setSelectedTheme(theme);
        setSelectedLayout(layout);
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('kair0s_preferences', JSON.stringify(preferences));
    onPreferencesChange?.(preferences);
  }, [preferences, onPreferencesChange]);

  const handleThemeSelect = useCallback((theme: Theme) => {
    setSelectedTheme(theme);
    setPreferences(prev => ({ ...prev, theme: theme.id }));
    onThemeChange?.(theme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme.id);
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [onThemeChange]);

  const handleLayoutSelect = useCallback((layout: Layout) => {
    setSelectedLayout(layout);
    setPreferences(prev => ({ ...prev, layout: layout.id }));
    onLayoutChange?.(layout);
  }, [onLayoutChange]);

  const handleShortcutToggle = useCallback((shortcutId: string) => {
    setShortcuts(prev => prev.map(shortcut => 
      shortcut.id === shortcutId 
        ? { ...shortcut, enabled: !shortcut.enabled }
        : shortcut
    ));
  }, []);

  const handleWorkflowToggle = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, enabled: !workflow.enabled }
        : workflow
    ));
  }, []);

  const exportPreferences = useCallback(() => {
    const exportData = {
      preferences,
      shortcuts,
      workflows,
      customTheme,
      timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kair0s-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [preferences, shortcuts, workflows, customTheme]);

  const importPreferences = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        if (imported.preferences) {
          setPreferences(imported.preferences);
        }
        if (imported.shortcuts) {
          setShortcuts(imported.shortcuts);
        }
        if (imported.workflows) {
          setWorkflows(imported.workflows);
        }
        if (imported.customTheme) {
          setCustomTheme(imported.customTheme);
        }
      } catch (error) {
        console.error('Failed to import preferences:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  const resetPreferences = useCallback(() => {
    const defaultPrefs = {
      theme: 'light',
      layout: 'default',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        types: {
          session: true,
          alert: true,
          update: false
        }
      },
      privacy: {
        analytics: true,
        crashReporting: true,
        usageData: false
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        screenReader: false
      }
    };
    
    setPreferences(defaultPrefs);
    setShortcuts(DEFAULT_SHORTCUTS);
    setWorkflows(DEFAULT_WORKFLOWS);
    setCustomTheme({});
    setSelectedTheme(DEFAULT_THEMES[0]);
    setSelectedLayout(DEFAULT_LAYOUTS[0]);
  }, []);

  return (
    <div className={cn("bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-4xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          Personalization
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportPreferences}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export preferences"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          
          <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Import preferences">
            <Upload className="w-4 h-4 text-gray-600" />
            <input
              type="file"
              accept=".json"
              onChange={importPreferences}
              className="hidden"
            />
          </label>
          
          <button
            onClick={resetPreferences}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'themes', name: 'Themes', icon: Palette },
          { id: 'layout', name: 'Layout', icon: Layout },
          { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard },
          { id: 'workflows', name: 'Workflows', icon: Zap },
          { id: 'preferences', name: 'Preferences', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFAULT_THEMES.map(theme => (
                  <div
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all",
                      selectedTheme.id === theme.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{theme.name}</span>
                      {selectedTheme.id === theme.id && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(theme.colors).slice(0, 6).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: value }}
                          />
                          <span className="text-xs text-gray-600 capitalize">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Theme</h3>
              <button
                onClick={() => setIsEditingTheme(!isEditingTheme)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Brush className="w-4 h-4" />
                {isEditingTheme ? 'Stop Editing' : 'Create Custom Theme'}
              </button>
              
              {isEditingTheme && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedTheme.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {key}
                        </label>
                        <input
                          type="color"
                          value={customTheme.colors?.[key as keyof Theme['colors']] || value}
                          onChange={(e) => setCustomTheme(prev => ({
                            ...prev,
                            colors: {
                              ...prev.colors,
                              [key]: e.target.value
                            }
                          }))}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_LAYOUTS.map(layout => (
                <div
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout)}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all",
                    selectedLayout.id === layout.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{layout.name}</span>
                    {selectedLayout.id === layout.id && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Type: {layout.type}</div>
                    <div>Sidebar: {layout.sidebar.width} ({layout.sidebar.position})</div>
                    <div>Header: {layout.header.height}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts Tab */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Keyboard Shortcuts</h3>
              <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Plus className="w-3 h-3" />
                Add Shortcut
              </button>
            </div>
            
            <div className="space-y-2">
              {shortcuts.map(shortcut => (
                <div key={shortcut.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{shortcut.name}</div>
                    <div className="text-sm text-gray-600">{shortcut.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {shortcut.keys.join(' + ')}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {shortcut.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShortcutToggle(shortcut.id)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        shortcut.enabled
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {shortcut.enabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Workflows</h3>
              <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Plus className="w-3 h-3" />
                Create Workflow
              </button>
            </div>
            
            <div className="space-y-3">
              {workflows.map(workflow => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{workflow.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{workflow.name}</div>
                        <div className="text-sm text-gray-600">{workflow.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {workflow.category}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {workflow.steps.length} steps
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleWorkflowToggle(workflow.id)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        workflow.enabled
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                  <select
                    value={preferences.timeFormat}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value as '12h' | '24h' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.enabled}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enabled: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable notifications</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.sound}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sound: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Sound effects</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.desktop}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, desktop: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Desktop notifications</span>
                </label>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.privacy.analytics}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Share usage analytics</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.privacy.crashReporting}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, crashReporting: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Crash reporting</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.privacy.usageData}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, usageData: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Usage data collection</span>
                </label>
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.highContrast}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, highContrast: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">High contrast</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.reducedMotion}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, reducedMotion: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Reduced motion</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.largeText}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, largeText: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Large text</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizationPanel;
