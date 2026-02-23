/**
 * Kair0s Engine Manager - Central Configuration Management
 * 
 * Single source of truth for all engine configuration,
 * provider selection, routing logic, and state management.
 */

import { EventEmitter } from 'events';
import {
  type ProviderConfig,
  type EngineProfile,
  type Kair0sEngineConfig,
  DEFAULT_ENGINE_CONFIG,
  DEFAULT_PROVIDERS,
  DEFAULT_PROFILES,
  validateProviderConfig,
  validateEngineConfig,
} from './engine-config.js';

export interface EngineMetrics {
  providerId: string;
  timestamp: number;
  latency: number;
  success: boolean;
  error?: string;
  tokensUsed?: number;
  cost?: number;
}

export interface RoutingDecision {
  selectedProvider: ProviderConfig;
  reasoning: string;
  alternatives: ProviderConfig[];
}

export class Kair0sEngineManager extends EventEmitter {
  private config: Kair0sEngineConfig;
  private currentProfile: EngineProfile;
  private metrics: Map<string, EngineMetrics[]> = new Map();
  private providerHealth: Map<string, boolean> = new Map();

  constructor(config?: Partial<Kair0sEngineConfig>) {
    super();
    
    // Initialize with default config and merge any overrides
    this.config = {
      ...DEFAULT_ENGINE_CONFIG,
      ...config,
    };
    
    // Set current profile
    this.currentProfile = this.config.profiles[this.config.defaultProfile];
    
    // Initialize provider health
    DEFAULT_PROVIDERS.forEach(provider => {
      this.providerHealth.set(provider.id, true);
    });
    
    this.startHealthChecks();
  }

  // Configuration Management
  getConfig(): Kair0sEngineConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<Kair0sEngineConfig>): void {
    const newConfig = { ...this.config, ...updates };
    const errors = validateEngineConfig(newConfig);
    
    if (errors.length > 0) {
      throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }
    
    this.config = newConfig;
    
    // Update current profile if default changed
    if (updates.defaultProfile) {
      this.currentProfile = this.config.profiles[updates.defaultProfile];
    }
    
    this.emit('config-updated', this.config);
  }

  getCurrentProfile(): EngineProfile {
    return { ...this.currentProfile };
  }

  setProfile(profileId: string): void {
    if (!this.config.profiles[profileId]) {
      throw new Error(`Profile '${profileId}' not found`);
    }
    
    this.currentProfile = this.config.profiles[profileId];
    this.emit('profile-changed', this.currentProfile);
  }

  // Provider Management
  getProviders(): ProviderConfig[] {
    return [...this.currentProfile.providers];
  }

  getProvider(id: string): ProviderConfig | undefined {
    return this.currentProfile.providers.find(p => p.id === id);
  }

  addProvider(provider: ProviderConfig): void {
    const errors = validateProviderConfig(provider);
    if (errors.length > 0) {
      throw new Error(`Invalid provider: ${errors.join(', ')}`);
    }
    
    this.currentProfile.providers.push(provider);
    this.providerHealth.set(provider.id, true);
    this.emit('provider-added', provider);
  }

  removeProvider(id: string): void {
    const index = this.currentProfile.providers.findIndex(p => p.id === id);
    if (index !== -1) {
      this.currentProfile.providers.splice(index, 1);
      this.providerHealth.delete(id);
      this.metrics.delete(id);
      this.emit('provider-removed', id);
    }
  }

  updateProvider(id: string, updates: Partial<ProviderConfig>): void {
    const provider = this.getProvider(id);
    if (!provider) {
      throw new Error(`Provider '${id}' not found`);
    }
    
    const updatedProvider = { ...provider, ...updates };
    const errors = validateProviderConfig(updatedProvider);
    
    if (errors.length > 0) {
      throw new Error(`Invalid provider update: ${errors.join(', ')}`);
    }
    
    const index = this.currentProfile.providers.findIndex(p => p.id === id);
    this.currentProfile.providers[index] = updatedProvider;
    this.emit('provider-updated', updatedProvider);
  }

  // Intelligent Routing
  async selectProvider(requestContext?: {
    complexity?: 'low' | 'medium' | 'high';
    requiresImages?: boolean;
    requiresFunctionCalling?: boolean;
    maxLatency?: number;
    maxCost?: number;
  }): Promise<RoutingDecision> {
    const availableProviders = this.currentProfile.providers
      .filter(p => this.providerHealth.get(p.id) === true)
      .filter(p => {
        // Filter by capabilities
        if (requestContext?.requiresImages && !p.capabilities.images) {
          return false;
        }
        if (requestContext?.requiresFunctionCalling && !p.capabilities.functionCalling) {
          return false;
        }
        return true;
      });

    if (availableProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    const strategy = this.currentProfile.routingStrategy;
    let selectedProvider: ProviderConfig;
    let reasoning: string;

    switch (strategy) {
      case 'speed':
        selectedProvider = this.selectBySpeed(availableProviders, requestContext);
        reasoning = `Selected for speed: ${selectedProvider.name} (${selectedProvider.performance?.avgLatency}ms avg latency)`;
        break;
        
      case 'cost':
        selectedProvider = this.selectByCost(availableProviders, requestContext);
        reasoning = `Selected for cost: ${selectedProvider.name} (${selectedProvider.cost?.inputTokenPrice || 0} per input token)`;
        break;
        
      case 'quality':
        selectedProvider = this.selectByQuality(availableProviders, requestContext);
        reasoning = `Selected for quality: ${selectedProvider.name} (${selectedProvider.performance?.reliability || 0} reliability)`;
        break;
        
      case 'balanced':
      default:
        selectedProvider = this.selectBalanced(availableProviders, requestContext);
        reasoning = `Selected for balanced performance: ${selectedProvider.name}`;
        break;
    }

    const alternatives = availableProviders
      .filter(p => p.id !== selectedProvider.id)
      .slice(0, 3);

    const decision: RoutingDecision = {
      selectedProvider,
      reasoning,
      alternatives,
    };

    this.emit('routing-decision', decision);
    return decision;
  }

  private selectBySpeed(providers: ProviderConfig[], context?: any): ProviderConfig {
    return providers.reduce((best, current) => {
      const bestLatency = best.performance?.avgLatency || Infinity;
      const currentLatency = current.performance?.avgLatency || Infinity;
      return currentLatency < bestLatency ? current : best;
    });
  }

  private selectByCost(providers: ProviderConfig[], context?: any): ProviderConfig {
    return providers.reduce((best, current) => {
      const bestCost = best.cost?.inputTokenPrice || Infinity;
      const currentCost = current.cost?.inputTokenPrice || Infinity;
      return currentCost < bestCost ? current : best;
    });
  }

  private selectByQuality(providers: ProviderConfig[], context?: any): ProviderConfig {
    return providers.reduce((best, current) => {
      const bestReliability = best.performance?.reliability || 0;
      const currentReliability = current.performance?.reliability || 0;
      return currentReliability > bestReliability ? current : best;
    });
  }

  private selectBalanced(providers: ProviderConfig[], context?: any): ProviderConfig {
    // Score providers based on priority, latency, and reliability
    return providers.reduce((best, current) => {
      const bestScore = this.calculateScore(best, context);
      const currentScore = this.calculateScore(current, context);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateScore(provider: ProviderConfig, context?: any): number {
    const latency = provider.performance?.avgLatency || 1000;
    const reliability = provider.performance?.reliability || 0.5;
    const cost = provider.cost?.inputTokenPrice || 0.001;
    const priority = provider.priority || 10;

    // Lower latency is better (inverse)
    const latencyScore = 1000 / latency;
    // Higher reliability is better
    const reliabilityScore = reliability * 100;
    // Lower cost is better (inverse)
    const costScore = cost > 0 ? 0.01 / cost : 100;
    // Higher priority is better
    const priorityScore = (100 - priority) + 1;

    return latencyScore * 0.3 + reliabilityScore * 0.4 + costScore * 0.2 + priorityScore * 0.1;
  }

  // Health Monitoring
  private startHealthChecks(): void {
    if (!this.config.routing.healthCheckInterval) return;

    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.routing.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    for (const provider of this.currentProfile.providers) {
      try {
        const isHealthy = await this.checkProviderHealth(provider);
        const wasHealthy = this.providerHealth.get(provider.id);
        
        if (wasHealthy !== isHealthy) {
          this.providerHealth.set(provider.id, isHealthy);
          this.emit('provider-health-changed', {
            providerId: provider.id,
            healthy: isHealthy,
          });
        }
      } catch (error) {
        console.error(`Health check failed for ${provider.id}:`, error);
        this.providerHealth.set(provider.id, false);
      }
    }
  }

  private async checkProviderHealth(provider: ProviderConfig): Promise<boolean> {
    // Simple health check - in real implementation, this would make a lightweight request
    const recentMetrics = this.metrics.get(provider.id) || [];
    const recentFailures = recentMetrics
      .filter(m => Date.now() - m.timestamp < 300000) // Last 5 minutes
      .filter(m => !m.success)
      .length;

    return recentFailures < 3; // Allow up to 3 recent failures
  }

  // Metrics Collection
  recordMetrics(metrics: EngineMetrics): void {
    const providerMetrics = this.metrics.get(metrics.providerId) || [];
    providerMetrics.push(metrics);
    
    // Keep only recent metrics (based on retention period)
    const cutoffTime = Date.now() - (this.config.monitoring.metricsRetention * 24 * 60 * 60 * 1000);
    const filteredMetrics = providerMetrics.filter(m => m.timestamp > cutoffTime);
    
    this.metrics.set(metrics.providerId, filteredMetrics);
    
    // Update provider performance data
    this.updateProviderPerformance(metrics.providerId);
    this.emit('metrics-recorded', metrics);
  }

  private updateProviderPerformance(providerId: string): void {
    const providerMetrics = this.metrics.get(providerId) || [];
    if (providerMetrics.length === 0) return;

    const provider = this.getProvider(providerId);
    if (!provider) return;

    // Calculate average latency and reliability
    const recentMetrics = providerMetrics.slice(-100); // Last 100 requests
    const successfulMetrics = recentMetrics.filter(m => m.success);
    
    if (successfulMetrics.length > 0) {
      const avgLatency = successfulMetrics.reduce((sum, m) => sum + m.latency, 0) / successfulMetrics.length;
      const reliability = successfulMetrics.length / recentMetrics.length;
      
      provider.performance = {
        avgLatency: Math.round(avgLatency),
        reliability: Math.round(reliability * 100) / 100,
      };
      
      this.emit('provider-performance-updated', {
        providerId,
        performance: provider.performance,
      });
    }
  }

  getMetrics(providerId?: string): Map<string, EngineMetrics[]> {
    if (providerId) {
      const metrics = this.metrics.get(providerId) || [];
      return new Map([[providerId, metrics]]);
    }
    return new Map(this.metrics);
  }

  getProviderHealth(): Map<string, boolean> {
    return new Map(this.providerHealth);
  }

  // Fallback Management
  async executeWithFallback<T>(
    operation: (provider: ProviderConfig) => Promise<T>,
    context?: any
  ): Promise<{ result: T; provider: ProviderConfig; fallbacks?: string[] }> {
    const decision = await this.selectProvider(context);
    const fallbacks: string[] = [];
    
    for (const provider of [decision.selectedProvider, ...decision.alternatives]) {
      try {
        const result = await operation(provider);
        return { result, provider };
      } catch (error) {
        fallbacks.push(provider.id);
        console.warn(`Provider ${provider.id} failed, trying fallback:`, error);
        
        // Mark provider as unhealthy
        this.providerHealth.set(provider.id, false);
        this.emit('provider-health-changed', {
          providerId: provider.id,
          healthy: false,
        });
      }
    }
    
    throw new Error(`All providers failed. Attempted: ${[decision.selectedProvider.id, ...fallbacks].join(', ')}`);
  }
}

// Singleton instance
let engineManager: Kair0sEngineManager | null = null;

export function getEngineManager(): Kair0sEngineManager {
  if (!engineManager) {
    engineManager = new Kair0sEngineManager();
  }
  return engineManager;
}

export function setEngineManager(manager: Kair0sEngineManager): void {
  engineManager = manager;
}
