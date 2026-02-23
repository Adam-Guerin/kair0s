/**
 * Kair0s Unified Entry Component
 * 
 * Single entry point for all interactions (chat, audio, screenshot, automation)
 * with business presets applied consistently.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '@/components';
import { 
  BUSINESS_PRESETS, 
  UnifiedEntryState, 
  BusinessPreset,
  UnifiedEntryConfig,
  DEFAULT_UNIFIED_ENTRY_CONFIG,
  detectContextFromInput,
  adaptPresetForInput,
} from '../config/unified-entry.js';
import { useEngineConfig } from '../hooks/useEngineConfig.js';
import { Mic, Camera, MessageSquare, Zap, Settings, Play, Pause, Square } from 'lucide-react';

interface UnifiedEntryProps {
  onStateChange?: (state: UnifiedEntryState) => void;
  config?: Partial<UnifiedEntryConfig>;
  className?: string;
}

export const UnifiedEntry: React.FC<UnifiedEntryProps> = ({
  onStateChange,
  config: userConfig = {},
  className = '',
}) => {
  const { selectProvider } = useEngineConfig();
  const [config, setConfig] = useState<UnifiedEntryConfig>({
    ...DEFAULT_UNIFIED_ENTRY_CONFIG,
    ...userConfig,
  });
  
  const [state, setState] = useState<UnifiedEntryState>({
    activePreset: null,
    inputMode: 'chat',
    isActive: false,
    sessionType: 'general',
    outputs: [],
  });

  // Initialize with default preset
  useEffect(() => {
    const defaultPreset = BUSINESS_PRESETS[config.defaultPreset];
    setState(prev => ({ 
      ...prev, 
      activePreset: defaultPreset 
    }));
  }, [config.defaultPreset]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const selectPreset = useCallback((presetId: string) => {
    const preset = BUSINESS_PRESETS[presetId];
    if (!preset) return;

    const adaptedPreset = adaptPresetForInput(preset, state.inputMode);
    
    setState(prev => ({
      ...prev,
      activePreset: adaptedPreset,
      sessionType: presetId as any,
    }));

    // Update engine configuration with preset preferences
    selectProvider({
      complexity: 'medium',
      requiresImages: preset.features.multiModal,
      maxLatency: preset.quality.priority === 'speed' ? 2000 : undefined,
    });
  }, [state.inputMode, selectProvider]);

  const setInputMode = useCallback((mode: 'chat' | 'audio' | 'screenshot' | 'automation') => {
    setState(prev => ({
      ...prev,
      inputMode: mode,
    }));

    // Auto-detect context if enabled
    if (config.autoDetectContext) {
      const detectedPreset = detectContextFromInput(mode, state);
      if (detectedPreset !== state.sessionType) {
        selectPreset(detectedPreset);
      }
    }
  }, [config.autoDetectContext, state, selectPreset]);

  const startSession = useCallback(async () => {
    if (!state.activePreset) return;

    setState(prev => ({ ...prev, isActive: true }));

    // Configure provider based on preset
    try {
      await selectProvider({
        complexity: 'medium',
        requiresImages: state.activePreset.features.multiModal,
        maxLatency: state.activePreset.quality.priority === 'speed' ? 2000 : undefined,
      });
    } catch (error) {
      console.error('Failed to configure provider:', error);
    }
  }, [state.activePreset, selectProvider]);

  const stopSession = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  const addOutput = useCallback((output: any) => {
    setState(prev => ({
      ...prev,
      outputs: [...prev.outputs, {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'response',
        content: output,
        provider: state.activePreset?.preferredProvider || 'unknown',
      }],
    }));
  }, [state.activePreset]);

  const renderPresetSelector = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {Object.values(BUSINESS_PRESETS).map((preset) => (
        <Card
          key={preset.id}
          className={`cursor-pointer transition-all hover:scale-105 ${
            state.activePreset?.id === preset.id 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => selectPreset(preset.id)}
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: preset.color + '20' }}
              >
                <Settings className="w-5 h-5" style={{ color: preset.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{preset.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={preset.features.transcription ? 'default' : 'secondary'}>
                Transcription
              </Badge>
              <Badge variant={preset.features.summarization ? 'default' : 'secondary'}>
                Summarization
              </Badge>
              <Badge variant={preset.features.actionExtraction ? 'default' : 'secondary'}>
                Actions
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderInputModeSelector = () => (
    <div className="flex gap-2 mb-6">
      {[
        { mode: 'chat', icon: MessageSquare, label: 'Chat' },
        { mode: 'audio', icon: Mic, label: 'Audio' },
        { mode: 'screenshot', icon: Camera, label: 'Screenshot' },
        { mode: 'automation', icon: Zap, label: 'Automation' },
      ].map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          variant={state.inputMode === mode ? 'default' : 'outline'}
          onClick={() => setInputMode(mode as any)}
          className="flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      ))}
    </div>
  );

  const renderActiveSession = () => {
    if (!state.activePreset || !state.isActive) return null;

    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: state.activePreset.color }}
              >
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{state.activePreset.name}</h3>
                <p className="text-sm text-gray-600">
                  {state.inputMode.charAt(0).toUpperCase() + state.inputMode.slice(1)} • 
                  {state.activePreset.quality.priority} priority
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={stopSession}
                className="flex items-center gap-1"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Provider:</span>
              <div className="text-gray-600">{state.activePreset.preferredProvider}</div>
            </div>
            <div>
              <span className="font-medium">Model:</span>
              <div className="text-gray-600">{state.activePreset.model}</div>
            </div>
            <div>
              <span className="font-medium">Output:</span>
              <div className="text-gray-600">{state.activePreset.outputFormat}</div>
            </div>
          </div>

          {state.outputs.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recent Outputs</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.outputs.slice(-5).map((output) => (
                  <div key={output.id} className="text-xs p-2 bg-white rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{output.type}</span>
                      <span className="text-gray-500">
                        {new Date(output.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-700 truncate">
                      {typeof output.content === 'string' 
                        ? output.content 
                        : JSON.stringify(output.content).substring(0, 100) + '...'
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderStartButton = () => {
    if (state.isActive) return null;

    return (
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={startSession}
          disabled={!state.activePreset}
          className="flex items-center gap-2 px-8"
        >
          <Play className="w-5 h-5" />
          Start {state.activePreset?.name || 'Session'}
        </Button>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Kair0s Assistant
        </h1>
        <p className="text-gray-600">
          Choose your workflow preset and input method to get started
        </p>
      </div>

      {/* Preset Selection */}
      {renderPresetSelector()}

      {/* Input Mode Selection */}
      {renderInputModeSelector()}

      {/* Active Session */}
      {renderActiveSession()}

      {/* Start Button */}
      {renderStartButton()}

      {/* Advanced Options */}
      {config.showAdvancedOptions && (
        <Card className="mt-6">
          <div className="p-4">
            <h3 className="font-medium mb-3">Advanced Options</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Auto-detect context</span>
                <input
                  type="checkbox"
                  checked={config.autoDetectContext}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    autoDetectContext: e.target.checked 
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Remember last preset</span>
                <input
                  type="checkbox"
                  checked={config.rememberLastPreset}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    rememberLastPreset: e.target.checked 
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Enable notifications</span>
                <input
                  type="checkbox"
                  checked={config.enableNotifications}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    enableNotifications: e.target.checked 
                  }))}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UnifiedEntry;
