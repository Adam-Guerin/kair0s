/**
 * Kair0s Business Artifacts - Standardized Formats
 * 
 * Unified schemas for tasks, sessions, history, KPI events,
 * and business outputs (actions, summaries, drafts).
 */

// ============================================================================
// TASK SESSION FORMAT
// ============================================================================

export interface TaskSession {
  id: string;
  presetId: string;
  presetName: string;
  inputMode: 'chat' | 'audio' | 'screenshot' | 'automation';
  
  // Timestamps
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  duration?: number; // in milliseconds
  
  // Context
  sessionType: 'meeting' | 'interview' | 'support' | 'general';
  title?: string;
  description?: string;
  participants?: number;
  context?: Record<string, any>;
  
  // Configuration
  provider: {
    selected: string;
    used: string[];
    fallbacks: string[];
  };
  model: {
    requested: string;
    used: string;
    temperature: number;
    maxTokens: number;
  };
  
  // Status
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  
  // Metrics
  metrics: {
    inputTokens?: number;
    outputTokens?: number;
    cost?: number;
    latency?: number;
    providerReliability?: number;
  };
  
  // Artifacts
  artifacts: Artifact[];
}

// ============================================================================
// ARTIFACTS FORMAT
// ============================================================================

export interface Artifact {
  id: string;
  sessionId: string;
  type: 'transcription' | 'summary' | 'actions' | 'draft' | 'response' | 'metadata';
  
  // Content
  content: any;
  format: 'text' | 'markdown' | 'json' | 'structured';
  
  // Metadata
  timestamp: number;
  provider: string;
  model: string;
  confidence?: number; // 0-1 for AI-generated content
  
  // Processing info
  processingTime?: number; // ms to generate this artifact
  tokensUsed?: number;
  cost?: number;
  
  // Validation
  validated: boolean;
  validationErrors?: string[];
  
  // Business context
  businessContext?: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    tags: string[];
    assignedTo?: string;
    dueDate?: number;
  };
}

// ============================================================================
// STANDARDIZED OUTPUT FORMATS
// ============================================================================

// Actions Format
export interface ActionItem {
  id: string;
  description: string;
  type: 'task' | 'decision' | 'followup' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Assignment
  assignedTo?: string;
  assigneeType?: 'user' | 'team' | 'ai' | 'automatic';
  
  // Timing
  dueDate?: number;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  completedAt?: number;
  
  // Dependencies
  dependsOn?: string[]; // other action IDs
  blocks?: string[]; // other action IDs this blocks
  
  // Context
  context: {
    source: 'meeting' | 'transcription' | 'manual' | 'automation';
    reference?: string; // meeting ID, transcript section, etc.
    rationale?: string;
  };
  
  // Metadata
  tags: string[];
  attachments?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ActionsArtifact extends Artifact {
  type: 'actions';
  content: ActionItem[];
  summary: {
    total: number;
    byPriority: Record<string, number>;
    byAssignee: Record<string, number>;
    byType: Record<string, number>;
  };
}

// Summary Format
export interface SummarySection {
  title: string;
  content: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[]; // references to action IDs
  participants?: string[];
  duration?: number; // for this section
}

export interface SummaryArtifact extends Artifact {
  type: 'summary';
  content: {
    overall: string;
    sections: SummarySection[];
    wordCount: number;
    readingTime: number; // minutes
  };
  structure: {
    format: 'executive' | 'detailed' | 'bulleted' | 'timeline';
    language: string;
    tone: 'formal' | 'casual' | 'technical';
  };
}

// Draft Format
export interface DraftContent {
  subject?: string;
  body: string;
  format: 'email' | 'document' | 'message' | 'report';
  
  // Metadata
  recipient?: string;
  recipients?: string[];
  cc?: string[];
  bcc?: string[];
  
  // Content analysis
  wordCount: number;
  estimatedReadingTime: number; // minutes
  tone: 'formal' | 'casual' | 'persuasive' | 'informative';
  
  // Generation info
  template?: string;
  variables?: Record<string, any>;
  iterations?: number; // how many refinement cycles
}

export interface DraftArtifact extends Artifact {
  type: 'draft';
  content: DraftContent;
  review: {
    status: 'draft' | 'reviewed' | 'approved' | 'rejected';
    feedback?: string[];
    approvedBy?: string;
    approvedAt?: number;
  };
}

// ============================================================================
// KPI EVENTS SCHEMA
// ============================================================================

export interface KPIEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  
  // Event classification
  category: 'performance' | 'usage' | 'business' | 'technical' | 'quality';
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  // Core metrics
  metrics: {
    latency?: number; // ms
    throughput?: number; // requests/minute
    errorRate?: number; // percentage
    availability?: number; // percentage
    cost?: number; // currency units
    satisfaction?: number; // 0-1 or NPS
  };
  
  // Business metrics
  businessMetrics?: {
    tasksCompleted?: number;
    tasksGenerated?: number;
    meetingDuration?: number; // minutes
    participantsCount?: number;
    actionItemsGenerated?: number;
    followUpsScheduled?: number;
    supportTicketsResolved?: number;
    prospectsContacted?: number;
  };
  
  // Quality metrics
  qualityMetrics?: {
    accuracyScore?: number; // 0-1
    relevanceScore?: number; // 0-1
    completenessScore?: number; // 0-1
    userFeedback?: number; // 1-5 or NPS
    providerReliability?: number; // 0-1
  };
  
  // Context
  context: {
    presetId: string;
    inputMode: string;
    provider: string;
    model: string;
    userId?: string;
    organizationId?: string;
    featureFlags?: Record<string, boolean>;
  };
  
  // Additional data
  data?: Record<string, any>;
  tags?: string[];
  correlationId?: string; // for event chaining
}

// ============================================================================
// HISTORY FORMAT
// ============================================================================

export interface SessionHistory {
  id: string;
  userId?: string;
  organizationId?: string;
  
  // Time range
  startDate: number;
  endDate: number;
  
  // Sessions summary
  sessions: TaskSession[];
  summary: {
    totalSessions: number;
    totalDuration: number; // minutes
    totalCost: number;
    totalTokens: number;
    averageSessionDuration: number;
    completionRate: number; // percentage
  };
  
  // Business insights
  insights: {
    mostUsedPreset: string;
    mostUsedProvider: string;
    peakUsageHours: number[];
    commonSessionTypes: Record<string, number>;
    productivityTrend: 'increasing' | 'stable' | 'decreasing';
    roiMetrics?: {
      timeSaved: number; // minutes
      costSavings: number; // currency units
      efficiencyGain: number; // percentage
    };
  };
  
  // KPI summary
  kpis: {
    averageLatency: number;
    errorRate: number;
    userSatisfaction: number;
    taskCompletionRate: number;
    costEfficiency: number; // cost per successful task
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export function validateTaskSession(session: any): string[] {
  const errors: string[] = [];
  
  if (!session.id) errors.push('Session ID is required');
  if (!session.presetId) errors.push('Preset ID is required');
  if (!session.inputMode) errors.push('Input mode is required');
  if (!session.sessionType) errors.push('Session type is required');
  
  if (session.createdAt && typeof session.createdAt !== 'number') {
    errors.push('Created at must be a timestamp');
  }
  
  if (session.artifacts && !Array.isArray(session.artifacts)) {
    errors.push('Artifacts must be an array');
  }
  
  return errors;
}

export function validateArtifact(artifact: any): string[] {
  const errors: string[] = [];
  
  if (!artifact.id) errors.push('Artifact ID is required');
  if (!artifact.sessionId) errors.push('Session ID is required');
  if (!artifact.type) errors.push('Artifact type is required');
  
  const validTypes = ['transcription', 'summary', 'actions', 'draft', 'response', 'metadata'];
  if (!validTypes.includes(artifact.type)) {
    errors.push(`Invalid artifact type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  if (artifact.confidence && (artifact.confidence < 0 || artifact.confidence > 1)) {
    errors.push('Confidence must be between 0 and 1');
  }
  
  return errors;
}

export function validateKPIEvent(event: any): string[] {
  const errors: string[] = [];
  
  if (!event.id) errors.push('Event ID is required');
  if (!event.timestamp) errors.push('Timestamp is required');
  if (!event.category) errors.push('Category is required');
  if (!event.type) errors.push('Type is required');
  
  const validCategories = ['performance', 'usage', 'business', 'technical', 'quality'];
  if (!validCategories.includes(event.category)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }
  
  const validSeverities = ['info', 'warning', 'error', 'critical'];
  if (!validSeverities.includes(event.severity)) {
    errors.push(`Invalid severity. Must be one of: ${validSeverities.join(', ')}`);
  }
  
  return errors;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createTaskSession(partial: Partial<TaskSession>): TaskSession {
  const now = Date.now();
  return {
    id: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
    presetId: '',
    presetName: '',
    inputMode: 'chat',
    createdAt: now,
    sessionType: 'general',
    status: 'pending',
    provider: {
      selected: '',
      used: [],
      fallbacks: [],
    },
    model: {
      requested: '',
      used: '',
      temperature: 0.7,
      maxTokens: 2048,
    },
    metrics: {},
    artifacts: [],
    ...partial,
  };
}

export function createActionItem(partial: Partial<ActionItem>): ActionItem {
  const now = Date.now();
  return {
    id: `action_${now}_${Math.random().toString(36).substr(2, 9)}`,
    description: '',
    type: 'task',
    priority: 'medium',
    status: 'pending',
    context: {
      source: 'manual',
    },
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createArtifact(partial: Partial<Artifact>): Artifact {
  const now = Date.now();
  return {
    id: `artifact_${now}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId: '',
    type: 'response',
    content: '',
    format: 'text',
    timestamp: now,
    provider: '',
    model: '',
    validated: false,
    validationErrors: [],
    ...partial,
  };
}

export function createKPIEvent(partial: Partial<KPIEvent>): KPIEvent {
  const now = Date.now();
  return {
    id: `kpi_${now}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId: '',
    timestamp: now,
    category: 'performance',
    type: 'generic',
    severity: 'info',
    metrics: {},
    context: {
      presetId: '',
      inputMode: '',
      provider: '',
      model: '',
    },
    tags: [],
    ...partial,
  };
}

// ============================================================================
// EXPORT CONSTANTS
// ============================================================================

export const ARTIFACT_TYPES = {
  TRANSCRIPTION: 'transcription',
  SUMMARY: 'summary',
  ACTIONS: 'actions',
  DRAFT: 'draft',
  RESPONSE: 'response',
  METADATA: 'metadata',
} as const;

export const SESSION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const ACTION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const KPI_CATEGORIES = {
  PERFORMANCE: 'performance',
  USAGE: 'usage',
  BUSINESS: 'business',
  TECHNICAL: 'technical',
  QUALITY: 'quality',
} as const;

export const KPI_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;
