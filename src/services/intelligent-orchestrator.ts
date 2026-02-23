/**
 * Kair0s Intelligent Orchestrator
 * 
 * Invisible orchestration layer that automatically selects optimal provider/model
 * based on quality, cost, and latency rules.
 * User only chooses objectives, system handles the rest.
 */

import { EventEmitter } from 'events';
import {
  TaskSession,
  Artifact,
  KPIEvent,
  getArtifactManager,
  type ArtifactManager,
} from './artifact-manager.js';
import {
  getEngineManager,
  type ProviderConfig,
  type RoutingDecision,
} from '../config/engine-manager.js';

export interface UserObjective {
  id: string;
  name: string;
  description: string;
  
  // Priority and constraints
  priority: 'speed' | 'cost' | 'quality' | 'balanced';
  maxLatency?: number; // ms
  maxCost?: number; // per request
  minQuality?: number; // 0-1 score
  
  // Requirements
  requirements: {
    multimodal?: boolean;
    streaming?: boolean;
    functionCalling?: boolean;
    longContext?: boolean;
    highAccuracy?: boolean;
  };
  
  // Context
  context: {
    domain?: string; // 'meeting' | 'support' | 'creative' | 'technical'
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    stakeholders?: string[];
    compliance?: string[];
  };
}

export interface OrchestrationConfig {
  // Decision engine
  strategy: 'automatic' | 'assisted' | 'manual';
  learningEnabled: boolean;
  adaptationRate: number; // 0-1, how fast to adapt
  
  // Performance thresholds
  thresholds: {
    latency: {
      fast: 500,      // ms
      acceptable: 2000,
      slow: 5000
    },
    cost: {
      cheap: 0.001,    // per request
      reasonable: 0.01,
      expensive: 0.1
    },
    quality: {
      excellent: 0.95,
      good: 0.85,
      acceptable: 0.7,
      poor: 0.5
    },
    reliability: {
      excellent: 0.99,
      good: 0.95,
      acceptable: 0.9,
      poor: 0.8
    }
  };
  
  // Fallback behavior
  fallback: {
    enabled: boolean;
    maxAttempts: number;
    retryDelay: number; // ms
    escalationRules: {
      latencyThreshold: number;
      errorRateThreshold: number;
      qualityThreshold: number;
    };
  };
  
  // Monitoring
  monitoring: {
    realTimeMetrics: boolean;
    performanceTracking: boolean;
    autoOptimization: boolean;
    alertThresholds: {
      errorRate: number;      // percentage
      latency: number;        // ms
      costBurst: number;      // per minute
    };
  };
}

export interface OrchestrationDecision {
  objectiveId: string;
  selectedProvider: ProviderConfig;
  selectedModel: string;
  fallbackChain: ProviderConfig[];
  reasoning: string;
  confidence: number; // 0-1
  estimatedMetrics: {
    latency: number;
    cost: number;
    quality: number;
    reliability: number;
  };
  riskFactors: string[];
  alternatives: Array<{
    provider: ProviderConfig;
    model: string;
    score: number;
    reasoning: string;
  }>;
}

export class IntelligentOrchestrator extends EventEmitter {
  private config: OrchestrationConfig;
  private engineManager: ReturnType<typeof getEngineManager>;
  private artifactManager: ArtifactManager;
  
  // Performance tracking
  private performanceHistory: Map<string, {
    successCount: number;
    failureCount: number;
    totalLatency: number;
    totalCost: number;
    averageQuality: number;
    lastUsed: number;
  }> = new Map();
  
  // Learning data
  private performancePatterns: Map<string, {
    bestProvider: string;
    bestModel: string;
    averageLatency: number;
    averageCost: number;
    averageQuality: number;
    contextFactors: string[];
  }> = new Map();

  constructor(config: Partial<OrchestrationConfig> = {}) {
    super();
    
    this.config = {
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
      ...config,
    };
    
    this.engineManager = getEngineManager();
    this.artifactManager = getArtifactManager();
    
    this.initializePerformanceTracking();
  }

  // ============================================================================
  // MAIN ORCHESTRATION METHODS
  // ============================================================================

  async orchestrate(objective: UserObjective): Promise<OrchestrationDecision> {
    const startTime = Date.now();
    
    try {
      // Get available providers
      const availableProviders = this.engineManager.getProviders();
      const decision = await this.makeIntelligentDecision(objective, availableProviders);
      
      // Execute the decision
      const result = await this.executeDecision(decision, objective);
      
      // Record the outcome
      await this.recordDecisionOutcome(decision, result, Date.now() - startTime);
      
      // Update performance tracking
      this.updatePerformanceHistory(decision, result);
      
      // Trigger auto-optimization if needed
      if (this.config.monitoring.autoOptimization) {
        await this.checkAndTriggerOptimization();
      }
      
      // Emit decision event
      this.emit('orchestration', { objective, decision, result });
      
      return result;
      
    } catch (error) {
      console.error('Orchestration failed:', error);
      
      // Record failure
      await this.recordKPIEvent({
        category: 'technical',
        type: 'orchestration_error',
        severity: 'error',
        data: { error: error.message, objectiveId: objective.id },
      });
      
      throw error;
    }
  }

  private async makeIntelligentDecision(
    objective: UserObjective, 
    providers: ProviderConfig[]
  ): Promise<OrchestrationDecision> {
    
    // Filter providers based on requirements
    const suitableProviders = this.filterProvidersByRequirements(providers, objective.requirements);
    
    // Score providers based on multiple factors
    const scoredProviders = await this.scoreProviders(suitableProviders, objective);
    
    // Select optimal provider
    const selected = this.selectOptimalProvider(scoredProviders, objective);
    
    // Build fallback chain
    const fallbackChain = this.buildFallbackChain(selected, scoredProviders, objective);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(selected, objective, scoredProviders);
    
    // Calculate confidence
    const confidence = this.calculateDecisionConfidence(selected, objective);
    
    // Estimate metrics
    const estimatedMetrics = this.estimateMetrics(selected, objective);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(selected, objective);
    
    return {
      objectiveId: objective.id,
      selectedProvider: selected.provider,
      selectedModel: selected.model,
      fallbackChain: fallbackChain.map(p => p.provider),
      reasoning,
      confidence,
      estimatedMetrics,
      riskFactors,
      alternatives: scoredProviders.slice(1, 5).map(p => ({
        provider: p.provider,
        model: p.model,
        score: p.score,
        reasoning: p.reasoning,
      })),
    };
  }

  private async executeDecision(
    decision: OrchestrationDecision, 
    objective: UserObjective
  ): Promise<{ success: boolean; latency: number; cost: number; quality: number }> {
    
    const startTime = Date.now();
    
    try {
      // Configure the engine manager with selected provider
      await this.engineManager.selectProvider({
        complexity: this.estimateComplexity(objective),
        requiresImages: objective.requirements.multimodal,
        maxLatency: objective.maxLatency,
      });
      
      // Simulate execution (in real implementation, this would be the actual request)
      const executionTime = this.estimateExecutionTime(decision, objective);
      const cost = this.estimateExecutionCost(decision, objective);
      const quality = this.estimateExecutionQuality(decision, objective);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      const actualLatency = Date.now() - startTime;
      
      return {
        success: true,
        latency: actualLatency,
        cost,
        quality,
      };
      
    } catch (error) {
      // Handle fallback if enabled
      if (this.config.fallback.enabled && decision.fallbackChain.length > 0) {
        return await this.executeFallback(decision, objective, 0);
      }
      
      throw error;
    }
  }

  private async executeFallback(
    decision: OrchestrationDecision, 
    objective: UserObjective, 
    attempt: number
  ): Promise<{ success: boolean; latency: number; cost: number; quality: number }> {
    
    if (attempt >= this.config.fallback.maxAttempts) {
      throw new Error('All fallback attempts exhausted');
    }
    
    try {
      // Try next provider in fallback chain
      const nextProviderId = decision.fallbackChain[attempt];
      const nextProvider = this.engineManager.getProvider(nextProviderId);
      
      if (!nextProvider) {
        throw new Error(`Fallback provider ${nextProviderId} not found`);
      }
      
      // Configure with fallback provider
      await this.engineManager.selectProvider({
        complexity: this.estimateComplexity(objective),
        requiresImages: objective.requirements.multimodal,
        maxLatency: objective.maxLatency,
      });
      
      const executionTime = this.estimateExecutionTime({ selectedProvider: nextProvider, selectedModel: nextProvider.model }, objective);
      const cost = this.estimateExecutionCost({ selectedProvider: nextProvider, selectedModel: nextProvider.model }, objective);
      const quality = this.estimateExecutionQuality({ selectedProvider: nextProvider, selectedModel: nextProvider.model }, objective);
      
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      return {
        success: true,
        latency: executionTime,
        cost,
        quality,
      };
      
    } catch (error) {
      // Try next fallback
      await new Promise(resolve => setTimeout(resolve, this.config.fallback.retryDelay));
      return await this.executeFallback(decision, objective, attempt + 1);
    }
  }

  // ============================================================================
  // PROVIDER SELECTION AND SCORING
  // ============================================================================

  private filterProvidersByRequirements(
    providers: ProviderConfig[], 
    requirements: UserObjective['requirements']
  ): ProviderConfig[] {
    
    return providers.filter(provider => {
      // Check multimodal requirement
      if (requirements.multimodal && !provider.capabilities.images) {
        return false;
      }
      
      // Check streaming requirement
      if (requirements.streaming && !provider.capabilities.streaming) {
        return false;
      }
      
      // Check function calling requirement
      if (requirements.functionCalling && !provider.capabilities.functionCalling) {
        return false;
      }
      
      // Check long context requirement
      if (requirements.longContext && provider.maxTokens && provider.maxTokens < 8000) {
        return false;
      }
      
      return true;
    });
  }

  private async scoreProviders(
    providers: ProviderConfig[], 
    objective: UserObjective
  ): Promise<Array<ProviderConfig & { score: number; reasoning: string }>> {
    
    const scored = await Promise.all(providers.map(async (provider) => {
      let score = 0;
      let reasoning = '';
      
      // Priority score (lower is better)
      const priorityScore = (11 - provider.priority) * 10;
      score += priorityScore;
      reasoning += `Priority: ${priorityScore} (${provider.priority})`;
      
      // Latency score
      const latencyScore = this.calculateLatencyScore(provider, objective);
      score += latencyScore;
      reasoning += ` + Latency: ${latencyScore}`;
      
      // Cost score
      const costScore = this.calculateCostScore(provider, objective);
      score += costScore;
      reasoning += ` + Cost: ${costScore}`;
      
      // Quality score
      const qualityScore = this.calculateQualityScore(provider, objective);
      score += qualityScore;
      reasoning += ` + Quality: ${qualityScore}`;
      
      // Reliability score
      const reliabilityScore = this.calculateReliabilityScore(provider);
      score += reliabilityScore;
      reasoning += ` + Reliability: ${reliabilityScore}`;
      
      // Context match score
      const contextScore = this.calculateContextScore(provider, objective);
      score += contextScore;
      reasoning += ` + Context: ${contextScore}`;
      
      return {
        ...provider,
        score,
        reasoning: reasoning.trim(),
      };
    }));
    
    // Sort by score (descending)
    return scored.sort((a, b) => b.score - a.score);
  }

  private calculateLatencyScore(provider: ProviderConfig, objective: UserObjective): number {
    const latency = provider.performance?.avgLatency || 1000;
    const thresholds = this.config.thresholds.latency;
    
    if (objective.priority === 'speed' && latency <= thresholds.fast) return 50;
    if (latency <= thresholds.acceptable) return 30;
    if (latency <= thresholds.slow) return 10;
    return 0;
  }

  private calculateCostScore(provider: ProviderConfig, objective: UserObjective): number {
    const cost = provider.cost?.inputTokenPrice || 0.01;
    const thresholds = this.config.thresholds.cost;
    
    if (objective.priority === 'cost' && cost <= thresholds.cheap) return 40;
    if (cost <= thresholds.reasonable) return 25;
    if (cost <= thresholds.expensive) return 5;
    return Math.max(0, 20 - cost * 1000);
  }

  private calculateQualityScore(provider: ProviderConfig, objective: UserObjective): number {
    const quality = provider.performance?.reliability || 0.9;
    const thresholds = this.config.thresholds.quality;
    
    if (objective.priority === 'quality' && quality >= thresholds.excellent) return 45;
    if (quality >= thresholds.good) return 35;
    if (quality >= thresholds.acceptable) return 25;
    if (quality >= thresholds.poor) return 5;
    return quality * 30;
  }

  private calculateReliabilityScore(provider: ProviderConfig): number {
    const reliability = provider.performance?.reliability || 0.9;
    const thresholds = this.config.thresholds.reliability;
    
    if (reliability >= thresholds.excellent) return 30;
    if (reliability >= thresholds.good) return 25;
    if (reliability >= thresholds.acceptable) return 15;
    return reliability * 20;
  }

  private calculateContextScore(provider: ProviderConfig, objective: UserObjective): number {
    let score = 0;
    
    // Domain matching
    if (objective.context?.domain) {
      const domainScores: Record<string, number> = {
        'meeting': provider.id === 'kair0s-local' ? 20 : 10,
        'support': provider.id === 'anthropic' ? 20 : 15,
        'creative': provider.id === 'openai' ? 20 : 10,
        'technical': provider.id === 'kair0s-local' ? 20 : 15,
      };
      score += domainScores[objective.context.domain] || 0;
    }
    
    // Urgency matching
    if (objective.context?.urgency === 'critical') {
      score += provider.id === 'kair0s-local' ? 15 : 10;
    } else if (objective.context?.urgency === 'high') {
      score += 10;
    }
    
    return score;
  }

  private selectOptimalProvider(
    scoredProviders: Array<ProviderConfig & { score: number; reasoning: string }>,
    objective: UserObjective
  ): { provider: ProviderConfig; model: string } {
    
    const selected = scoredProviders[0];
    
    // Apply learning if enabled
    if (this.config.learningEnabled) {
      const learned = this.getLearnedPreferences(objective);
      if (learned) {
        return {
          provider: learned.provider,
          model: learned.model,
        };
      }
    }
    
    return {
      provider: selected,
      model: selected.model,
    };
  }

  // ============================================================================
  // UTILITY AND ESTIMATION METHODS
  // ============================================================================

  private buildFallbackChain(
    selected: { provider: ProviderConfig; model: string },
    alternatives: Array<ProviderConfig & { score: number; reasoning: string }>,
    objective: UserObjective
  ): ProviderConfig[] {
    
    const fallbackProviders = alternatives
      .filter(p => p.provider.id !== selected.provider.id)
      .slice(0, this.config.fallback.maxAttempts - 1);
    
    return fallbackProviders.map(p => p.provider);
  }

  private generateReasoning(
    selected: { provider: ProviderConfig; model: string },
    objective: UserObjective,
    alternatives: Array<ProviderConfig & { score: number; reasoning: string }>
  ): string {
    
    const parts = [
      `Selected ${selected.provider.name} (${selected.model})`,
      `Priority: ${objective.priority}`,
      `Score: ${alternatives[0]?.score || 0}`,
    ];
    
    if (objective.maxLatency) {
      parts.push(`Max latency: ${objective.maxLatency}ms`);
    }
    
    if (objective.maxCost) {
      parts.push(`Max cost: $${objective.maxCost}`);
    }
    
    return parts.join(' | ');
  }

  private calculateDecisionConfidence(
    selected: { provider: ProviderConfig; model: string },
    objective: UserObjective
  ): number {
    
    let confidence = 0.8; // Base confidence
    
    // Increase confidence for known good providers
    if (selected.provider.id === 'kair0s-local') confidence += 0.1;
    if (selected.provider.id === 'anthropic') confidence += 0.05;
    if (selected.provider.id === 'openai') confidence += 0.05;
    
    // Adjust based on requirements match
    const requirements = objective.requirements;
    if (requirements.multimodal && selected.capabilities.images) confidence += 0.05;
    if (requirements.streaming && selected.capabilities.streaming) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  private estimateMetrics(
    selected: { provider: ProviderConfig; model: string },
    objective: UserObjective
  ): { latency: number; cost: number; quality: number; reliability: number } {
    
    return {
      latency: selected.performance?.avgLatency || 1000,
      cost: selected.cost?.inputTokenPrice || 0.01,
      quality: selected.performance?.reliability || 0.9,
      reliability: selected.performance?.reliability || 0.9,
    };
  }

  private estimateComplexity(objective: UserObjective): 'low' | 'medium' | 'high' {
    // Simple complexity estimation based on requirements
    const requirements = objective.requirements;
    let complexityScore = 1;
    
    if (requirements.multimodal) complexityScore += 1;
    if (requirements.functionCalling) complexityScore += 1;
    if (requirements.longContext) complexityScore += 1;
    if (requirements.highAccuracy) complexityScore += 1;
    
    if (complexityScore <= 1) return 'low';
    if (complexityScore <= 2) return 'medium';
    return 'high';
  }

  private estimateExecutionTime(
    decision: { selectedProvider: ProviderConfig; model: string },
    objective: UserObjective
  ): number {
    
    const baseTime = 1000; // 1 second base
    const complexity = this.estimateComplexity(objective);
    const latency = decision.selectedProvider.performance?.avgLatency || 1000;
    
    // Adjust based on complexity and provider latency
    const complexityMultiplier = complexity === 'low' ? 1 : complexity === 'medium' ? 1.5 : 2;
    const latencyMultiplier = Math.max(1, latency / 1000);
    
    return Math.round(baseTime * complexityMultiplier * latencyMultiplier);
  }

  private estimateExecutionCost(
    decision: { selectedProvider: ProviderConfig; model: string },
    objective: UserObjective
  ): number {
    
    const baseCost = decision.selectedProvider.cost?.inputTokenPrice || 0.01;
    const complexity = this.estimateComplexity(objective);
    
    // Adjust cost based on complexity
    const complexityMultiplier = complexity === 'low' ? 1 : complexity === 'medium' ? 2 : 4;
    
    return baseCost * complexityMultiplier;
  }

  private estimateExecutionQuality(
    decision: { selectedProvider: ProviderConfig; model: string },
    objective: UserObjective
  ): number {
    
    const baseQuality = decision.selectedProvider.performance?.reliability || 0.9;
    const complexity = this.estimateComplexity(objective);
    
    // Quality might decrease with complexity
    const complexityPenalty = complexity === 'low' ? 0 : complexity === 'medium' ? 0.1 : 0.2;
    
    return Math.max(0.5, baseQuality - complexityPenalty);
  }

  private identifyRiskFactors(
    selected: { provider: ProviderConfig; model: string },
    objective: UserObjective
  ): string[] {
    
    const risks: string[] = [];
    
    // Check latency risk
    if (objective.maxLatency && selected.performance?.avgLatency && selected.performance.avgLatency > objective.maxLatency) {
      risks.push(`High latency risk: ${selected.performance.avgLatency}ms > ${objective.maxLatency}ms`);
    }
    
    // Check cost risk
    if (objective.maxCost && selected.cost?.inputTokenPrice && selected.cost.inputTokenPrice > objective.maxCost) {
      risks.push(`High cost risk: $${selected.cost.inputTokenPrice} > $${objective.maxCost}`);
    }
    
    // Check reliability risk
    if (selected.performance?.reliability && selected.performance.reliability < 0.8) {
      risks.push(`Low reliability risk: ${selected.performance.reliability}`);
    }
    
    // Check context mismatch
    if (objective.requirements.multimodal && !selected.capabilities.images) {
      risks.push('Missing multimodal capability');
    }
    
    return risks;
  }

  // ============================================================================
  // LEARNING AND ADAPTATION
  // ============================================================================

  private initializePerformanceTracking(): void {
    // Load performance history from storage
    // TODO: Implement persistence loading
  }

  private updatePerformanceHistory(
    decision: OrchestrationDecision,
    result: { success: boolean; latency: number; cost: number; quality: number }
  ): void {
    
    const providerKey = decision.selectedProvider.id;
    const existing = this.performanceHistory.get(providerKey) || {
      successCount: 0,
      failureCount: 0,
      totalLatency: 0,
      totalCost: 0,
      averageQuality: 0,
      lastUsed: 0,
    };
    
    existing.lastUsed = Date.now();
    
    if (result.success) {
      existing.successCount++;
      existing.totalLatency = (existing.totalLatency + result.latency) / 2;
      existing.totalCost = (existing.totalCost + result.cost) / 2;
      existing.averageQuality = (existing.averageQuality + result.quality) / 2;
    } else {
      existing.failureCount++;
    }
    
    this.performanceHistory.set(providerKey, existing);
    
    // Update patterns
    this.updatePerformancePatterns(providerKey, result);
  }

  private updatePerformancePatterns(
    providerKey: string,
    result: { success: boolean; latency: number; cost: number; quality: number }
  ): void {
    
    const existing = this.performanceHistory.get(providerKey);
    if (!existing) return;
    
    const pattern = this.performancePatterns.get(providerKey) || {
      bestProvider: providerKey,
      bestModel: '',
      averageLatency: 0,
      averageCost: 0,
      averageQuality: 0,
      contextFactors: [],
    };
    
    // Update running averages
    pattern.averageLatency = existing.totalLatency;
    pattern.averageCost = existing.totalCost;
    pattern.averageQuality = existing.averageQuality;
    
    this.performancePatterns.set(providerKey, pattern);
  }

  private getLearnedPreferences(objective: UserObjective): { provider: ProviderConfig; model: string } | null {
    
    const pattern = this.performancePatterns.get('learned_' + objective.context?.domain);
    if (!pattern) return null;
    
    // Find best provider for this context
    const bestProviderKey = this.findBestProviderForContext(objective);
    if (bestProviderKey) {
      const bestProvider = this.engineManager.getProvider(bestProviderKey);
      return bestProvider ? { provider: bestProvider, model: bestProvider.model } : null;
    }
    
    return null;
  }

  private findBestProviderForContext(objective: UserObjective): string | null {
    
    let bestProvider = null;
    let bestScore = -1;
    
    for (const [providerKey, pattern] of this.performancePatterns.entries()) {
      if (pattern.contextFactors.includes(objective.context?.domain || '')) {
        const score = this.calculateProviderScore(pattern, objective);
        if (score > bestScore) {
          bestScore = score;
          bestProvider = providerKey;
        }
      }
    }
    
    return bestProvider;
  }

  private calculateProviderScore(
    pattern: { averageLatency: number; averageCost: number; averageQuality: number },
    objective: UserObjective
  ): number {
    
    let score = 0;
    
    // Latency score (lower is better)
    if (pattern.averageLatency <= 500) score += 30;
    else if (pattern.averageLatency <= 2000) score += 20;
    else if (pattern.averageLatency <= 5000) score += 10;
    
    // Cost score (lower is better)
    if (pattern.averageCost <= 0.001) score += 25;
    else if (pattern.averageCost <= 0.01) score += 15;
    else if (pattern.averageCost <= 0.1) score += 5;
    
    // Quality score (higher is better)
    score += pattern.averageQuality * 30;
    
    return score;
  }

  private async checkAndTriggerOptimization(): Promise<void> {
    // Check if any providers need optimization
    for (const [providerKey, history] of this.performanceHistory.entries()) {
      const errorRate = history.failureCount / (history.successCount + history.failureCount);
      
      if (errorRate > this.config.monitoring.alertThresholds.errorRate) {
        this.emit('optimization_needed', {
          provider: providerKey,
          reason: 'high_error_rate',
          errorRate,
        });
      }
    }
  }

  // ============================================================================
  // MONITORING AND KPI
  // ============================================================================

  private async recordDecisionOutcome(
    decision: OrchestrationDecision,
    result: { success: boolean; latency: number; cost: number; quality: number },
    duration: number
  ): Promise<void> {
    
    // Record orchestration KPI
    await this.recordKPIEvent({
      category: 'performance',
      type: 'orchestration_decision',
      severity: result.success ? 'info' : 'warning',
      metrics: {
        latency: result.latency,
        cost: result.cost,
        satisfaction: result.quality,
      },
      context: {
        presetId: decision.objectiveId,
        provider: decision.selectedProvider.id,
        model: decision.selectedModel,
      },
      data: {
        decisionReasoning: decision.reasoning,
        confidence: decision.confidence,
        fallbacksUsed: decision.fallbackChain.length,
        riskFactors: decision.riskFactors,
        duration,
      },
    });
  }

  private async recordKPIEvent(event: any): Promise<void> {
    // This would integrate with the artifact manager's KPI recording
    console.log('KPI Event:', event);
  }
}

// Singleton instance
let intelligentOrchestrator: IntelligentOrchestrator | null = null;

export function getIntelligentOrchestrator(): IntelligentOrchestrator {
  if (!intelligentOrchestrator) {
    intelligentOrchestrator = new IntelligentOrchestrator();
  }
  return intelligentOrchestrator;
}

export function setIntelligentOrchestrator(orchestrator: IntelligentOrchestrator): void {
  intelligentOrchestrator = orchestrator;
}
