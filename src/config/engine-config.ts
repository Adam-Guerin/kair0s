/**
 * Kair0s Engine Configuration - Single Source of Truth
 * 
 * Central configuration object for all AI provider settings,
 * routing logic, and engine behavior.
 */

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'cloud' | 'local' | 'hybrid';
  endpoint?: string;
  apiKey?: string;
  model: string;
  timeout: number;
  temperature: number;
  maxTokens?: number;
  streaming?: boolean;
  priority: number; // 1 = highest priority
  fallback?: string[]; // provider IDs to fallback to
  capabilities: {
    text: boolean;
    images: boolean;
    streaming: boolean;
    functionCalling: boolean;
  };
  cost?: {
    inputTokenPrice: number;
    outputTokenPrice: number;
    currency: string;
  };
  performance?: {
    avgLatency: number; // ms
    reliability: number; // 0-1
  };
}

export interface EngineProfile {
  id: string;
  name: string;
  description: string;
  providers: ProviderConfig[];
  routingStrategy: 'cost' | 'speed' | 'quality' | 'balanced';
  fallbackEnabled: boolean;
  monitoringEnabled: boolean;
}

export interface Kair0sEngineConfig {
  // Core engine settings
  version: string;
  defaultProfile: string;
  profiles: Record<string, EngineProfile>;
  
  // Global routing settings
  routing: {
    strategy: 'cost' | 'speed' | 'quality' | 'balanced';
    fallbackEnabled: boolean;
    retryAttempts: number;
    retryDelay: number;
    healthCheckInterval: number;
  };
  
  // Monitoring and analytics
  monitoring: {
    enabled: boolean;
    metricsRetention: number; // days
    performanceTracking: boolean;
    costTracking: boolean;
    errorTracking: boolean;
  };
  
  // Provider management
  providers: {
    autoDiscovery: boolean;
    updateInterval: number; // hours
    healthCheckTimeout: number; // seconds
  };
}

// Default provider configurations
export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: 'kair0s-local',
    name: 'Kair0s Local',
    type: 'local',
    endpoint: 'http://127.0.0.1:18789',
    model: 'kair0s:main',
    timeout: 30000,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    priority: 1,
    capabilities: {
      text: true,
      images: true,
      streaming: true,
      functionCalling: true,
    },
    performance: {
      avgLatency: 800,
      reliability: 0.95,
    },
  },
  {
    id: 'ollama',
    name: 'Ollama Local',
    type: 'local',
    endpoint: 'http://localhost:11434',
    model: 'llama3.2:3b',
    timeout: 60000,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    priority: 2,
    fallback: ['kair0s-local'],
    capabilities: {
      text: true,
      images: false,
      streaming: true,
      functionCalling: false,
    },
    performance: {
      avgLatency: 1200,
      reliability: 0.90,
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'cloud',
    endpoint: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    timeout: 30000,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    priority: 3,
    fallback: ['ollama', 'kair0s-local'],
    capabilities: {
      text: true,
      images: true,
      streaming: true,
      functionCalling: true,
    },
    cost: {
      inputTokenPrice: 0.00015,
      outputTokenPrice: 0.0006,
      currency: 'USD',
    },
    performance: {
      avgLatency: 1500,
      reliability: 0.99,
    },
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    type: 'cloud',
    endpoint: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-latest',
    timeout: 30000,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    priority: 4,
    fallback: ['openai', 'ollama', 'kair0s-local'],
    capabilities: {
      text: true,
      images: true,
      streaming: true,
      functionCalling: true,
    },
    cost: {
      inputTokenPrice: 0.003,
      outputTokenPrice: 0.015,
      currency: 'USD',
    },
    performance: {
      avgLatency: 2000,
      reliability: 0.98,
    },
  },
];

// Default engine profiles
export const DEFAULT_PROFILES: Record<string, EngineProfile> = {
  'development': {
    id: 'development',
    name: 'Development',
    description: 'Fast local development with fallback to cloud',
    providers: DEFAULT_PROVIDERS.filter(p => p.type === 'local'),
    routingStrategy: 'speed',
    fallbackEnabled: true,
    monitoringEnabled: false,
  },
  'production': {
    id: 'production',
    name: 'Production',
    description: 'Balanced production setup with cost optimization',
    providers: DEFAULT_PROVIDERS,
    routingStrategy: 'balanced',
    fallbackEnabled: true,
    monitoringEnabled: true,
  },
  'cost-optimized': {
    id: 'cost-optimized',
    name: 'Cost Optimized',
    description: 'Prioritize local and free providers',
    providers: DEFAULT_PROVIDERS.filter(p => p.type === 'local' || p.id === 'openai'),
    routingStrategy: 'cost',
    fallbackEnabled: true,
    monitoringEnabled: true,
  },
  'quality-first': {
    id: 'quality-first',
    name: 'Quality First',
    description: 'Prioritize best quality regardless of cost',
    providers: DEFAULT_PROVIDERS.filter(p => p.id === 'anthropic' || p.id === 'openai'),
    routingStrategy: 'quality',
    fallbackEnabled: true,
    monitoringEnabled: true,
  },
};

// Default engine configuration
export const DEFAULT_ENGINE_CONFIG: Kair0sEngineConfig = {
  version: '1.0.0',
  defaultProfile: 'production',
  profiles: DEFAULT_PROFILES,
  
  routing: {
    strategy: 'balanced',
    fallbackEnabled: true,
    retryAttempts: 3,
    retryDelay: 1000,
    healthCheckInterval: 30000, // 30 seconds
  },
  
  monitoring: {
    enabled: true,
    metricsRetention: 30, // 30 days
    performanceTracking: true,
    costTracking: true,
    errorTracking: true,
  },
  
  providers: {
    autoDiscovery: true,
    updateInterval: 24, // 24 hours
    healthCheckTimeout: 10, // 10 seconds
  },
};

// Configuration validation
export function validateProviderConfig(config: ProviderConfig): string[] {
  const errors: string[] = [];
  
  if (!config.id || config.id.trim() === '') {
    errors.push('Provider ID is required');
  }
  
  if (!config.name || config.name.trim() === '') {
    errors.push('Provider name is required');
  }
  
  if (!config.model || config.model.trim() === '') {
    errors.push('Model is required');
  }
  
  if (config.timeout <= 0) {
    errors.push('Timeout must be greater than 0');
  }
  
  if (config.temperature < 0 || config.temperature > 2) {
    errors.push('Temperature must be between 0 and 2');
  }
  
  if (config.priority < 1) {
    errors.push('Priority must be at least 1');
  }
  
  return errors;
}

export function validateEngineConfig(config: Kair0sEngineConfig): string[] {
  const errors: string[] = [];
  
  if (!config.defaultProfile || !config.profiles[config.defaultProfile]) {
    errors.push('Default profile must exist in profiles');
  }
  
  if (config.routing.retryAttempts < 1) {
    errors.push('Retry attempts must be at least 1');
  }
  
  if (config.routing.healthCheckInterval < 1000) {
    errors.push('Health check interval must be at least 1000ms');
  }
  
  if (config.monitoring.metricsRetention < 1) {
    errors.push('Metrics retention must be at least 1 day');
  }
  
  return errors;
}
