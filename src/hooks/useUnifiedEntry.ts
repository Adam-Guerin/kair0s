/**
 * React Hook for Unified Entry System
 * 
 * Manages the unified entry state with business presets
 * and provides consistent interface across all input modes.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BUSINESS_PRESETS,
  UnifiedEntryState,
  BusinessPreset,
  UnifiedEntryConfig,
  DEFAULT_UNIFIED_ENTRY_CONFIG,
  detectContextFromInput,
  adaptPresetForInput,
} from '../config/unified-entry.js';
import { useEngineConfig } from './useEngineConfig.js';

export interface UseUnifiedEntryReturn {
  // State
  state: UnifiedEntryState;
  
  // Actions
  selectPreset: (presetId: string) => void;
  setInputMode: (mode: 'chat' | 'audio' | 'screenshot' | 'automation') => void;
  startSession: () => Promise<void>;
  stopSession: () => void;
  addOutput: (output: any) => void;
  clearOutputs: () => void;
  
  // Configuration
  updateConfig: (config: Partial<UnifiedEntryConfig>) => void;
  config: UnifiedEntryConfig;
}

export function useUnifiedEntry(
  initialConfig?: Partial<UnifiedEntryConfig>
): UseUnifiedEntryReturn {
  const { selectProvider } = useEngineConfig();
  
  const [config, setConfig] = useState<UnifiedEntryConfig>({
    ...DEFAULT_UNIFIED_ENTRY_CONFIG,
    ...initialConfig,
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

  const clearOutputs = useCallback(() => {
    setState(prev => ({ ...prev, outputs: [] }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<UnifiedEntryConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return {
    state,
    selectPreset,
    setInputMode,
    startSession,
    stopSession,
    addOutput,
    clearOutputs,
    updateConfig,
    config,
  };
}
