/**
 * Kair0s Unified Entry System
 * 
 * Single entry point for all interactions with business presets.
 * Provides consistent experience across chat, audio, screenshot, and automation.
 */

export interface BusinessPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  
  // Provider configuration
  preferredProvider: string;
  fallbackProviders: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  
  // Interaction settings
  inputMode: 'chat' | 'audio' | 'screenshot' | 'automation';
  autoStart: boolean;
  continuousMode: boolean;
  
  // Processing configuration
  systemPrompt: string;
  outputFormat: 'text' | 'markdown' | 'json' | 'actions';
  language: string;
  
  // Features
  features: {
    transcription: boolean;
    summarization: boolean;
    actionExtraction: boolean;
    followUpGeneration: boolean;
    multiModal: boolean;
  };
  
  // Quality settings
  quality: {
    priority: 'speed' | 'cost' | 'quality' | 'balanced';
    monitoring: boolean;
    fallbackEnabled: boolean;
  };
}

export interface UnifiedEntryState {
  // Current session
  activePreset: BusinessPreset | null;
  inputMode: 'chat' | 'audio' | 'screenshot' | 'automation';
  isActive: boolean;
  
  // Session context
  sessionType: 'meeting' | 'interview' | 'support' | 'general';
  participants?: number;
  duration?: number;
  context?: string;
  
  // Input handling
  inputStream: MediaStream | null;
  screenshotData: string | null;
  automationConfig: any | null;
  
  // Output handling
  outputs: Array<{
    id: string;
    timestamp: number;
    type: 'transcription' | 'summary' | 'actions' | 'response';
    content: any;
    provider: string;
    metrics?: any;
  }>;
}

// Business presets for different use cases
export const BUSINESS_PRESETS: Record<string, BusinessPreset> = {
  'meeting': {
    id: 'meeting',
    name: 'Réunion Intelligente',
    description: 'Capture, transcribe and extract actions from meetings',
    icon: 'users',
    color: '#3B82F6',
    
    preferredProvider: 'kair0s-local',
    fallbackProviders: ['ollama', 'openai'],
    model: 'kair0s:main',
    temperature: 0.3,
    maxTokens: 4096,
    
    inputMode: 'audio',
    autoStart: true,
    continuousMode: true,
    
    systemPrompt: `Tu es un assistant spécialisé dans les réunions professionnelles. 
Ta mission est de:
1. Transcrire précisément les discussions
2. Identifier les points clés et décisions
3. Extraire les actions concrètes avec responsables
4. Générer un résumé structuré

Format de sortie:
- Transcription complète
- Points clés décisions
- Plan d'actions (qui, quoi, quand)
- Résumé exécutif`,
    
    outputFormat: 'actions',
    language: 'fr',
    
    features: {
      transcription: true,
      summarization: true,
      actionExtraction: true,
      followUpGeneration: true,
      multiModal: false,
    },
    
    quality: {
      priority: 'balanced',
      monitoring: true,
      fallbackEnabled: true,
    },
  },
  
  'prospection': {
    id: 'prospection',
    name: 'Prospection Automatisée',
    description: 'Generate personalized outreach and track responses',
    icon: 'target',
    color: '#10B981',
    
    preferredProvider: 'openai',
    fallbackProviders: ['anthropic', 'kair0s-local'],
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2048,
    
    inputMode: 'chat',
    autoStart: false,
    continuousMode: false,
    
    systemPrompt: `Tu es un expert en prospection commerciale B2B.
Ta mission est de générer des messages de prospection personnalisés et efficaces.

Analyse le contexte fourni et génère:
1. Sujet d'email percutant
2. Corps du message personnalisé
3. Points de différenciation
4. Call-to-action clair

Ton ton: professionnel, direct, orienté résultat.`,
    
    outputFormat: 'markdown',
    language: 'fr',
    
    features: {
      transcription: false,
      summarization: true,
      actionExtraction: false,
      followUpGeneration: true,
      multiModal: false,
    },
    
    quality: {
      priority: 'cost',
      monitoring: true,
      fallbackEnabled: true,
    },
  },
  
  'support': {
    id: 'support',
    name: 'Support Client',
    description: 'Intelligent customer support with automated responses',
    icon: 'headphones',
    color: '#F59E0B',
    
    preferredProvider: 'anthropic',
    fallbackProviders: ['openai', 'kair0s-local'],
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.5,
    maxTokens: 4096,
    
    inputMode: 'chat',
    autoStart: true,
    continuousMode: false,
    
    systemPrompt: `Tu es un assistant support client expert.
Ta mission est de fournir des solutions rapides et efficaces.

Pour chaque demande client:
1. Analyser le problème rapidement
2. Proposer des solutions immédiates
3. Donner des étapes claires si nécessaire
4. Identifier quand escalader vers un humain

Ton ton: empathique, professionnel, orienté solution.`,
    
    outputFormat: 'text',
    language: 'fr',
    
    features: {
      transcription: false,
      summarization: true,
      actionExtraction: true,
      followUpGeneration: false,
      multiModal: true,
    },
    
    quality: {
      priority: 'quality',
      monitoring: true,
      fallbackEnabled: true,
    },
  },
  
  'general': {
    id: 'general',
    name: 'Assistant Général',
    description: 'Versatile AI assistant for everyday tasks',
    icon: 'sparkles',
    color: '#8B5CF6',
    
    preferredProvider: 'kair0s-local',
    fallbackProviders: ['openai', 'anthropic', 'ollama'],
    model: 'kair0s:main',
    temperature: 0.7,
    maxTokens: 2048,
    
    inputMode: 'chat',
    autoStart: false,
    continuousMode: false,
    
    systemPrompt: `Tu es un assistant IA polyvalent et utile.
Aide l'utilisateur dans ses tâches quotidiennes avec précision et créativité.

Adapte ton style et ton au contexte de la conversation.
Sois concis quand c'est nécessaire, détaillé quand c'est utile.`,
    
    outputFormat: 'text',
    language: 'fr',
    
    features: {
      transcription: true,
      summarization: true,
      actionExtraction: false,
      followUpGeneration: false,
      multiModal: true,
    },
    
    quality: {
      priority: 'balanced',
      monitoring: true,
      fallbackEnabled: true,
    },
  },
};

export interface UnifiedEntryConfig {
  // Entry point configuration
  defaultPreset: string;
  autoDetectContext: boolean;
  rememberLastPreset: boolean;
  
  // UI preferences
  showAdvancedOptions: boolean;
  compactMode: boolean;
  shortcutsEnabled: boolean;
  
  // Integration settings
  enableCalendarSync: boolean;
  enableCrmIntegration: boolean;
  enableNotifications: boolean;
}

export const DEFAULT_UNIFIED_ENTRY_CONFIG: UnifiedEntryConfig = {
  defaultPreset: 'general',
  autoDetectContext: true,
  rememberLastPreset: true,
  
  showAdvancedOptions: false,
  compactMode: false,
  shortcutsEnabled: true,
  
  enableCalendarSync: false,
  enableCrmIntegration: false,
  enableNotifications: true,
};

// Context detection functions
export function detectContextFromInput(inputType: string, content?: any): string {
  // Auto-detect the most appropriate preset based on input
  if (inputType === 'audio' && content?.duration > 600000) { // > 10 minutes
    return 'meeting';
  }
  
  if (inputType === 'screenshot' && content?.includes('crm') || content?.includes('prospect')) {
    return 'prospection';
  }
  
  if (inputType === 'chat' && content?.includes('support') || content?.includes('help')) {
    return 'support';
  }
  
  return 'general';
}

export function adaptPresetForInput(preset: BusinessPreset, inputMode: string): BusinessPreset {
  return {
    ...preset,
    inputMode: inputMode as any,
    autoStart: inputMode === 'audio',
    continuousMode: inputMode === 'audio',
  };
}
