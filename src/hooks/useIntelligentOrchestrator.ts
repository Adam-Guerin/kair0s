/**
 * React Hook for Intelligent Orchestrator
 * 
 * Provides invisible orchestration where users only set objectives
 * and the system automatically handles provider/model selection.
 */

import { useState, useEffect, useCallback } from 'react';
import { getIntelligentOrchestrator } from '../services/intelligent-orchestrator.js';
import {
  UserObjective,
  OrchestrationConfig,
  OrchestrationDecision,
} from '../services/intelligent-orchestrator.js';

export interface UseIntelligentOrchestratorReturn {
  // Current state
  isOrchestrating: boolean;
  currentDecision: OrchestrationDecision | null;
  
  // Objectives management
  objectives: UserObjective[];
  createObjective: (objective: Partial<UserObjective>) => Promise<UserObjective>;
  updateObjective: (id: string, updates: Partial<UserObjective>) => Promise<UserObjective>;
  deleteObjective: (id: string) => Promise<void>;
  
  // Orchestration
  orchestrate: (objectiveId: string) => Promise<OrchestrationDecision>;
  
  // Configuration
  config: OrchestrationConfig;
  updateConfig: (config: Partial<OrchestrationConfig>) => void;
  
  // Analytics
  getPerformanceHistory: () => Map<string, any>;
  getOptimizationSuggestions: () => string[];
}

export function useIntelligentOrchestrator(
  initialConfig?: Partial<OrchestrationConfig>
): UseIntelligentOrchestratorReturn {
  
  const orchestrator = getIntelligentOrchestrator();
  
  const [objectives, setObjectives] = useState<UserObjective[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<OrchestrationDecision | null>(null);
  const [config, setConfig] = useState<OrchestrationConfig>({
    strategy: 'automatic',
    learningEnabled: true,
    adaptationRate: 0.1,
    thresholds: {
      latency: { fast: 500, acceptable: 2000, slow: 5000 },
      cost: { cheap: 0.001, reasonable: 0.01, expensive: 0.1 },
      quality: { excellent: 0.95, good: 0.85, acceptable: 0.7, poor: 0.5 },
      reliability: { excellent: 0.99, good: 0.95, acceptable: 0.9, poor: 0.8 },
    },
    fallback: {
      enabled: true,
      maxAttempts: 3,
      retryDelay: 1000,
      escalationRules: {
        latencyThreshold: 3000,
        errorRateThreshold: 10,
        qualityThreshold: 0.7,
      },
    },
    monitoring: {
      realTimeMetrics: true,
      performanceTracking: true,
      autoOptimization: true,
      alertThresholds: {
        errorRate: 15,
        latency: 4000,
        costBurst: 1.0,
      },
    },
    ...initialConfig,
  });

  // Load initial objectives
  useEffect(() => {
    const loadObjectives = async () => {
      try {
        // TODO: Load objectives from storage
        console.log('Loading objectives from storage...');
      } catch (error) {
        console.error('Failed to load objectives:', error);
      }
    };
    
    loadObjectives();
  }, []);

  // Listen to orchestration events
  useEffect(() => {
    const handleOrchestration = (event: any) => {
      console.log('Orchestration event:', event);
      
      if (event.type === 'orchestration') {
        setCurrentDecision(event.result);
        setIsOrchestrating(false);
      } else if (event.type === 'optimization_needed') {
        console.log('Optimization needed:', event);
      }
    };
    
    orchestrator.on('orchestration', handleOrchestration);
    orchestrator.on('optimization_needed', handleOptimization);
    
    return () => {
      orchestrator.off('orchestration', handleOrchestration);
      orchestrator.off('optimization_needed', handleOptimization);
    };
  }, [orchestrator]);

  const createObjective = useCallback(async (objective: Partial<UserObjective>): Promise<UserObjective> => {
    const newObjective: UserObjective = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: objective.name || 'New Objective',
      description: objective.description || '',
      priority: objective.priority || 'balanced',
      maxLatency: objective.maxLatency,
      maxCost: objective.maxCost,
      minQuality: objective.minQuality,
      requirements: {
        multimodal: objective.requirements?.multimodal || false,
        streaming: objective.requirements?.streaming || true,
        functionCalling: objective.requirements?.functionCalling || false,
        longContext: objective.requirements?.longContext || false,
        highAccuracy: objective.requirements?.highAccuracy || false,
      },
      context: {
        domain: objective.context?.domain || 'general',
        urgency: objective.context?.urgency || 'medium',
        stakeholders: objective.context?.stakeholders || [],
        compliance: objective.context?.compliance || [],
      },
      ...objective,
    };
    
    setObjectives(prev => [...prev, newObjective]);
    
    // TODO: Save to storage
    console.log('Created objective:', newObjective);
    
    return newObjective;
  }, []);

  const updateObjective = useCallback(async (id: string, updates: Partial<UserObjective>): Promise<UserObjective> => {
    setObjectives(prev => 
      prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
    );
    
    // TODO: Update in storage
    console.log('Updated objective:', id, updates);
    
    const updated = objectives.find(obj => obj.id === id);
    if (!updated) {
      throw new Error(`Objective ${id} not found`);
    }
    
    return updated;
  }, [objectives]);

  const deleteObjective = useCallback(async (id: string): Promise<void> => {
    setObjectives(prev => prev.filter(obj => obj.id !== id));
    
    // TODO: Remove from storage
    console.log('Deleted objective:', id);
  }, [objectives]);

  const orchestrate = useCallback(async (objectiveId: string): Promise<OrchestrationDecision> => {
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      throw new Error(`Objective ${objectiveId} not found`);
    }
    
    setIsOrchestrating(true);
    setCurrentDecision(null);
    
    try {
      const decision = await orchestrator.orchestrate(objective);
      return decision;
    } catch (error) {
      setIsOrchestrating(false);
      console.error('Orchestration failed:', error);
      throw error;
    }
  }, [objectives, orchestrator]);

  const updateConfig = useCallback((newConfig: Partial<OrchestrationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    console.log('Updated orchestrator config:', newConfig);
  }, [config]);

  const getPerformanceHistory = useCallback(() => {
    // TODO: Return performance history from orchestrator
    return new Map();
  }, [orchestrator]);

  const getOptimizationSuggestions = useCallback((): string[] => {
    // TODO: Return optimization suggestions from orchestrator
    return [
      'Consider enabling lower latency providers for speed-priority objectives',
      'Review cost thresholds for budget-constrained objectives',
      'Monitor provider reliability trends',
    ];
  }, [orchestrator]);

  return {
    isOrchestrating,
    currentDecision,
    objectives,
    createObjective,
    updateObjective,
    deleteObjective,
    orchestrate,
    config,
    updateConfig,
    getPerformanceHistory,
    getOptimizationSuggestions,
  };
}
