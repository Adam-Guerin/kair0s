/**
 * Kair0s Configuration Module
 * 
 * Central export point for all configuration-related functionality.
 * This serves as the single source of truth for engine configuration.
 */

export * from './engine-config.js';
export * from './engine-manager.js';

// Re-export commonly used types and functions for convenience
export type {
  ProviderConfig,
  EngineProfile,
  Kair0sEngineConfig,
} from './engine-config.js';

export type {
  EngineMetrics,
  RoutingDecision,
} from './engine-manager.js';

export {
  Kair0sEngineManager,
  getEngineManager,
  setEngineManager,
  type EngineMetrics as Metrics,
} from './engine-manager.js';

export {
  DEFAULT_PROVIDERS,
  DEFAULT_PROFILES,
  DEFAULT_ENGINE_CONFIG,
  validateProviderConfig,
  validateEngineConfig,
} from './engine-config.js';
