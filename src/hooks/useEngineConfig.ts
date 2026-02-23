/**
 * React Hook for Kair0s Engine Configuration
 * 
 * Provides access to the centralized engine configuration
 * and provider management functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getEngineManager,
  type Kair0sEngineConfig,
  type ProviderConfig,
  type EngineProfile,
  type RoutingDecision,
  type EngineMetrics,
} from '../config/index.js';

export interface UseEngineConfigReturn {
  // Configuration
  config: Kair0sEngineConfig;
  currentProfile: EngineProfile;
  providers: ProviderConfig[];
  
  // Actions
  updateConfig: (updates: Partial<Kair0sEngineConfig>) => void;
  setProfile: (profileId: string) => void;
  addProvider: (provider: ProviderConfig) => void;
  updateProvider: (id: string, updates: Partial<ProviderConfig>) => void;
  removeProvider: (id: string) => void;
  
  // Provider Selection
  selectProvider: (context?: {
    complexity?: 'low' | 'medium' | 'high';
    requiresImages?: boolean;
    requiresFunctionCalling?: boolean;
    maxLatency?: number;
    maxCost?: number;
  }) => Promise<RoutingDecision>;
  
  // Metrics and Health
  getMetrics: (providerId?: string) => Map<string, EngineMetrics[]>;
  getProviderHealth: () => Map<string, boolean>;
}

export function useEngineConfig(): UseEngineConfigReturn {
  const engineManager = getEngineManager();
  const [config, setConfig] = useState<Kair0sEngineConfig>(engineManager.getConfig());
  const [currentProfile, setCurrentProfile] = useState<EngineProfile>(engineManager.getCurrentProfile());

  // Subscribe to configuration changes
  useEffect(() => {
    const handleConfigUpdate = (newConfig: Kair0sEngineConfig) => {
      setConfig(newConfig);
    };

    const handleProfileChange = (newProfile: EngineProfile) => {
      setCurrentProfile(newProfile);
    };

    engineManager.on('config-updated', handleConfigUpdate);
    engineManager.on('profile-changed', handleProfileChange);

    return () => {
      engineManager.off('config-updated', handleConfigUpdate);
      engineManager.off('profile-changed', handleProfileChange);
    };
  }, [engineManager]);

  const updateConfig = useCallback((updates: Partial<Kair0sEngineConfig>) => {
    engineManager.updateConfig(updates);
  }, [engineManager]);

  const setProfile = useCallback((profileId: string) => {
    engineManager.setProfile(profileId);
  }, [engineManager]);

  const addProvider = useCallback((provider: ProviderConfig) => {
    engineManager.addProvider(provider);
  }, [engineManager]);

  const updateProvider = useCallback((id: string, updates: Partial<ProviderConfig>) => {
    engineManager.updateProvider(id, updates);
  }, [engineManager]);

  const removeProvider = useCallback((id: string) => {
    engineManager.removeProvider(id);
  }, [engineManager]);

  const selectProvider = useCallback(async (context?: any) => {
    return await engineManager.selectProvider(context);
  }, [engineManager]);

  const getMetrics = useCallback((providerId?: string) => {
    return engineManager.getMetrics(providerId);
  }, [engineManager]);

  const getProviderHealth = useCallback(() => {
    return engineManager.getProviderHealth();
  }, [engineManager]);

  return {
    config,
    currentProfile,
    providers: currentProfile.providers,
    updateConfig,
    setProfile,
    addProvider,
    updateProvider,
    removeProvider,
    selectProvider,
    getMetrics,
    getProviderHealth,
  };
}
