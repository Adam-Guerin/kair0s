/**
 * Kair0s Artifact Manager
 * 
 * Centralized service for managing business artifacts with standardized formats.
 * Handles creation, storage, retrieval, and validation of all artifacts.
 */

import {
  TaskSession,
  Artifact,
  ActionItem,
  ActionItem as ActionsArtifact,
  SummaryArtifact,
  DraftArtifact,
  KPIEvent,
  SessionHistory,
  createTaskSession,
  createArtifact,
  createActionItem,
  createKPIEvent,
  validateTaskSession,
  validateArtifact,
  validateKPIEvent,
  ARTIFACT_TYPES,
  SESSION_STATUS,
  ACTION_PRIORITY,
  KPI_CATEGORIES,
  KPI_SEVERITY,
} from '../types/business-artifacts.js';
import {
  createSecureStorageAdapter,
  type SecureStorageAdapter,
} from './storage/secure-storage.js';

export interface ArtifactManagerConfig {
  storage: {
    provider: 'local' | 'sqlite' | 'cloud' | 'hybrid';
    retention: {
      sessions: number; // days
      artifacts: number; // days
      kpis: number; // days
    };
    compression: boolean;
    encryption: boolean;
    sqlite?: {
      dbPath: string;
      tablePrefix: string;
      keyAlias: string;
    };
  };
  validation: {
    strictMode: boolean;
    autoFix: boolean;
    requiredFields: string[];
  };
  indexing: {
    enabled: boolean;
    searchFields: string[];
    tags: boolean;
  };
}

export class ArtifactManager {
  private config: ArtifactManagerConfig;
  private storageAdapter: SecureStorageAdapter;
  private sessions: Map<string, TaskSession> = new Map();
  private artifacts: Map<string, Artifact> = new Map();
  private kpiEvents: Map<string, KPIEvent> = new Map();

  constructor(config: Partial<ArtifactManagerConfig> = {}) {
    this.config = {
      storage: {
        provider: 'sqlite',
        retention: {
          sessions: 90,
          artifacts: 30,
          kpis: 180,
        },
        compression: true,
        encryption: true,
        sqlite: {
          dbPath: 'kair0s_secure.db',
          tablePrefix: 'kair0s_',
          keyAlias: 'kair0s_artifacts_master_key',
        },
      },
      validation: {
        strictMode: true,
        autoFix: false,
        requiredFields: ['id', 'sessionId', 'type', 'timestamp'],
      },
      indexing: {
        enabled: true,
        searchFields: ['content', 'description', 'context'],
        tags: true,
      },
      ...config,
    };

    this.storageAdapter = createSecureStorageAdapter(this.config.storage);
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  async createSession(partial: Partial<TaskSession>): Promise<TaskSession> {
    const session = createTaskSession(partial);
    
    if (this.config.validation.strictMode) {
      const errors = validateTaskSession(session);
      if (errors.length > 0) {
        throw new Error(`Invalid session: ${errors.join(', ')}`);
      }
    }
    
    this.sessions.set(session.id, session);
    await this.persistSession(session);
    
    // Emit KPI event for session creation
    await this.recordKPIEvent({
      category: KPI_CATEGORIES.USAGE,
      type: 'session_created',
      severity: KPI_SEVERITY.INFO,
      businessMetrics: {
        tasksCompleted: 0,
      },
      context: {
        presetId: session.presetId,
        inputMode: session.inputMode,
      },
    });
    
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<TaskSession>): Promise<TaskSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const updatedSession = { ...session, ...updates };
    
    if (this.config.validation.strictMode) {
      const errors = validateTaskSession(updatedSession);
      if (errors.length > 0) {
        throw new Error(`Invalid session update: ${errors.join(', ')}`);
      }
    }
    
    this.sessions.set(sessionId, updatedSession);
    await this.persistSession(updatedSession);
    
    return updatedSession;
  }

  async getSession(sessionId: string): Promise<TaskSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getSessions(filter?: {
    presetId?: string;
    sessionType?: string;
    status?: string;
    dateRange?: { start: number; end: number };
    limit?: number;
  }): Promise<TaskSession[]> {
    let sessions = Array.from(this.sessions.values());
    
    if (filter) {
      if (filter.presetId) {
        sessions = sessions.filter(s => s.presetId === filter.presetId);
      }
      if (filter.sessionType) {
        sessions = sessions.filter(s => s.sessionType === filter.sessionType);
      }
      if (filter.status) {
        sessions = sessions.filter(s => s.status === filter.status);
      }
      if (filter.dateRange) {
        sessions = sessions.filter(s => 
          s.createdAt >= filter.dateRange.start && s.createdAt <= filter.dateRange.end
        );
      }
      if (filter.limit) {
        sessions = sessions.slice(0, filter.limit);
      }
    }
    
    return sessions.sort((a, b) => b.createdAt - a.createdAt);
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    
    // Delete associated artifacts
    const sessionArtifacts = await this.getArtifacts({ sessionId });
    for (const artifact of sessionArtifacts) {
      this.artifacts.delete(artifact.id);
    }
    
    await this.removePersistedSession(sessionId);
  }

  // ============================================================================
  // ARTIFACT MANAGEMENT
  // ============================================================================

  async createArtifact(artifact: Omit<Artifact, 'id' | 'timestamp' | 'sessionId'>): Promise<Artifact> {
    const newArtifact = createArtifact({
      ...artifact,
      timestamp: Date.now(),
    });
    
    if (this.config.validation.strictMode) {
      const errors = validateArtifact(newArtifact);
      if (errors.length > 0) {
        throw new Error(`Invalid artifact: ${errors.join(', ')}`);
      }
    }
    
    this.artifacts.set(newArtifact.id, newArtifact);
    await this.persistArtifact(newArtifact);
    
    // Emit KPI event for artifact creation
    await this.recordKPIEvent({
      category: KPI_CATEGORIES.USAGE,
      type: 'artifact_created',
      severity: KPI_SEVERITY.INFO,
      context: {
        presetId: newArtifact.sessionId ? 
          this.sessions.get(newArtifact.sessionId)?.presetId : undefined,
        inputMode: newArtifact.sessionId ? 
          this.sessions.get(newArtifact.sessionId)?.inputMode : undefined,
      },
    });
    
    return newArtifact;
  }

  async updateArtifact(artifactId: string, updates: Partial<Artifact>): Promise<Artifact> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error(`Artifact ${artifactId} not found`);
    }
    
    const updatedArtifact = { ...artifact, ...updates };
    
    if (this.config.validation.strictMode) {
      const errors = validateArtifact(updatedArtifact);
      if (errors.length > 0) {
        throw new Error(`Invalid artifact update: ${errors.join(', ')}`);
      }
    }
    
    this.artifacts.set(artifactId, updatedArtifact);
    await this.persistArtifact(updatedArtifact);
    
    return updatedArtifact;
  }

  async getArtifact(artifactId: string): Promise<Artifact | null> {
    return this.artifacts.get(artifactId) || null;
  }

  async getArtifacts(filter?: {
    sessionId?: string;
    type?: string;
    provider?: string;
    dateRange?: { start: number; end: number };
    limit?: number;
  }): Promise<Artifact[]> {
    let artifacts = Array.from(this.artifacts.values());
    
    if (filter) {
      if (filter.sessionId) {
        artifacts = artifacts.filter(a => a.sessionId === filter.sessionId);
      }
      if (filter.type) {
        artifacts = artifacts.filter(a => a.type === filter.type);
      }
      if (filter.provider) {
        artifacts = artifacts.filter(a => a.provider === filter.provider);
      }
      if (filter.dateRange) {
        artifacts = artifacts.filter(a => 
          a.timestamp >= filter.dateRange.start && a.timestamp <= filter.dateRange.end
        );
      }
      if (filter.limit) {
        artifacts = artifacts.slice(0, filter.limit);
      }
    }
    
    return artifacts.sort((a, b) => b.timestamp - a.timestamp);
  }

  async deleteArtifact(artifactId: string): Promise<void> {
    this.artifacts.delete(artifactId);
    await this.removePersistedArtifact(artifactId);
  }

  // ============================================================================
  // SPECIALIZED ARTIFACT METHODS
  // ============================================================================

  async createActions(sessionId: string, actions: ActionItem[]): Promise<ActionsArtifact> {
    const artifact = await this.createArtifact({
      sessionId,
      type: ARTIFACT_TYPES.ACTIONS,
      content: actions,
      format: 'structured',
    });
    
    // Calculate summary
    const summary = {
      total: actions.length,
      byPriority: actions.reduce((acc, action) => {
        acc[action.priority] = (acc[action.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byAssignee: actions.reduce((acc, action) => {
        const assignee = action.assignedTo || 'unassigned';
        acc[assignee] = (acc[assignee] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: actions.reduce((acc, action) => {
        acc[action.type] = (acc[action.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
    
    return await this.updateArtifact(artifact.id, {
      content: actions,
      summary,
    } as Partial<ActionsArtifact>);
  }

  async createSummary(sessionId: string, summary: any): Promise<SummaryArtifact> {
    return await this.createArtifact({
      sessionId,
      type: ARTIFACT_TYPES.SUMMARY,
      content: summary,
      format: 'structured',
    });
  }

  async createDraft(sessionId: string, draft: any): Promise<DraftArtifact> {
    return await this.createArtifact({
      sessionId,
      type: ARTIFACT_TYPES.DRAFT,
      content: draft,
      format: 'structured',
    });
  }

  // ============================================================================
  // KPI EVENT MANAGEMENT
  // ============================================================================

  async recordKPIEvent(event: Omit<KPIEvent, 'id' | 'timestamp'>): Promise<KPIEvent> {
    const kpiEvent = createKPIEvent(event);
    
    if (this.config.validation.strictMode) {
      const errors = validateKPIEvent(kpiEvent);
      if (errors.length > 0) {
        throw new Error(`Invalid KPI event: ${errors.join(', ')}`);
      }
    }
    
    this.kpiEvents.set(kpiEvent.id, kpiEvent);
    await this.persistKPIEvent(kpiEvent);
    
    return kpiEvent;
  }

  async getKPIEvents(filter?: {
    category?: string;
    severity?: string;
    sessionId?: string;
    dateRange?: { start: number; end: number };
    limit?: number;
  }): Promise<KPIEvent[]> {
    let events = Array.from(this.kpiEvents.values());
    
    if (filter) {
      if (filter.category) {
        events = events.filter(e => e.category === filter.category);
      }
      if (filter.severity) {
        events = events.filter(e => e.severity === filter.severity);
      }
      if (filter.sessionId) {
        events = events.filter(e => e.sessionId === filter.sessionId);
      }
      if (filter.dateRange) {
        events = events.filter(e => 
          e.timestamp >= filter.dateRange.start && e.timestamp <= filter.dateRange.end
        );
      }
      if (filter.limit) {
        events = events.slice(0, filter.limit);
      }
    }
    
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  // ============================================================================
  // HISTORY AND ANALYTICS
  // ============================================================================

  async generateHistory(filter?: {
    userId?: string;
    organizationId?: string;
    dateRange?: { start: number; end: number };
  }): Promise<SessionHistory> {
    const sessions = await this.getSessions(filter);
    
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalCost = sessions.reduce((sum, s) => sum + (s.metrics?.cost || 0), 0);
    const totalTokens = sessions.reduce((sum, s) => sum + (s.metrics?.inputTokens || 0) + (s.metrics?.outputTokens || 0), 0);
    const completedSessions = sessions.filter(s => s.status === SESSION_STATUS.COMPLETED).length;
    
    // Business insights
    const presetCounts = sessions.reduce((acc, s) => {
      acc[s.presetId] = (acc[s.presetId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedPreset = Object.entries(presetCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    const sessionTypeCounts = sessions.reduce((acc, s) => {
      acc[s.sessionType] = (acc[s.sessionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // KPI calculations
    const kpiEvents = await this.getKPIEvents({
      dateRange: filter?.dateRange,
    });
    
    const averageLatency = kpiEvents
      .filter(e => e.metrics.latency)
      .reduce((sum, e) => sum + e.metrics.latency!, 0) / kpiEvents.length;
    
    const errorEvents = kpiEvents.filter(e => e.category === KPI_CATEGORIES.TECHNICAL && e.severity === KPI_SEVERITY.ERROR);
    const errorRate = kpiEvents.length > 0 ? (errorEvents.length / kpiEvents.length) * 100 : 0;
    
    const satisfactionEvents = kpiEvents.filter(e => e.qualityMetrics?.userFeedback);
    const userSatisfaction = satisfactionEvents.length > 0 
      ? satisfactionEvents.reduce((sum, e) => sum + e.qualityMetrics!.userFeedback!, 0) / satisfactionEvents.length 
      : 0;
    
    return {
      id: `history_${Date.now()}`,
      userId: filter?.userId,
      organizationId: filter?.organizationId,
      startDate: filter?.dateRange?.start || sessions[0]?.createdAt || Date.now(),
      endDate: filter?.dateRange?.end || Date.now(),
      sessions,
      summary: {
        totalSessions,
        totalDuration,
        totalCost,
        totalTokens,
        averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      },
      insights: {
        mostUsedPreset,
        mostUsedProvider: '', // TODO: calculate from sessions
        peakUsageHours: [], // TODO: calculate from timestamps
        commonSessionTypes: sessionTypeCounts,
        productivityTrend: 'stable', // TODO: calculate trend
        roiMetrics: {
          timeSaved: 0, // TODO: calculate from action items
          costSavings: 0, // TODO: calculate from efficiency gains
          efficiencyGain: 0, // TODO: calculate from metrics
        },
      },
      kpis: {
        averageLatency,
        errorRate,
        userSatisfaction,
        taskCompletionRate: 0, // TODO: calculate from action items
        costEfficiency: totalCost > 0 && completedSessions > 0 ? totalCost / completedSessions : 0,
      },
    };
  }

  // ============================================================================
  // PERSISTENCE LAYER (ABSTRACTION)
  // ============================================================================

  private async persistSession(session: TaskSession): Promise<void> {
    await this.storageAdapter.upsert(session.id, 'session', session);
  }

  private async persistArtifact(artifact: Artifact): Promise<void> {
    await this.storageAdapter.upsert(artifact.id, 'artifact', artifact);
  }

  private async persistKPIEvent(event: KPIEvent): Promise<void> {
    await this.storageAdapter.upsert(event.id, 'kpi', event);
  }

  private async removePersistedSession(sessionId: string): Promise<void> {
    await this.storageAdapter.delete(sessionId, 'session');
  }

  private async removePersistedArtifact(artifactId: string): Promise<void> {
    await this.storageAdapter.delete(artifactId, 'artifact');
  }

  // ============================================================================
  // CLEANUP AND MAINTENANCE
  // ============================================================================

  async cleanup(): Promise<void> {
    const now = Date.now();
    const retentionMs = this.config.storage.retention;
    
    // Clean up old sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - session.createdAt;
      const maxAge = retentionMs.sessions * 24 * 60 * 60 * 1000;
      
      if (age > maxAge) {
        this.sessions.delete(sessionId);
        await this.removePersistedSession(sessionId);
      }
    }
    
    // Clean up old artifacts
    for (const [artifactId, artifact] of this.artifacts.entries()) {
      const age = now - artifact.timestamp;
      const maxAge = retentionMs.artifacts * 24 * 60 * 60 * 1000;
      
      if (age > maxAge) {
        this.artifacts.delete(artifactId);
        await this.removePersistedArtifact(artifactId);
      }
    }
    
    // Clean up old KPI events
    for (const [eventId, event] of this.kpiEvents.entries()) {
      const age = now - event.timestamp;
      const maxAge = retentionMs.kpis * 24 * 60 * 60 * 1000;
      
      if (age > maxAge) {
        this.kpiEvents.delete(eventId);
        // TODO: Remove from persistent storage
      }
    }
  }

  // ============================================================================
  // SEARCH AND INDEXING
  // ============================================================================

  async search(query: string, options?: {
    types?: string[];
    sessionIds?: string[];
    dateRange?: { start: number; end: number };
    limit?: number;
  }): Promise<Artifact[]> {
    if (!this.config.indexing.enabled) {
      return [];
    }
    
    let artifacts = Array.from(this.artifacts.values());
    
    // Apply filters
    if (options?.types) {
      artifacts = artifacts.filter(a => options.types!.includes(a.type));
    }
    
    if (options?.sessionIds) {
      artifacts = artifacts.filter(a => options.sessionIds!.includes(a.sessionId));
    }
    
    if (options?.dateRange) {
      artifacts = artifacts.filter(a => 
        a.timestamp >= options.dateRange.start && a.timestamp <= options.dateRange.end
      );
    }
    
    // Simple text search (can be enhanced with proper indexing)
    const searchLower = query.toLowerCase();
    const filtered = artifacts.filter(artifact => {
      const searchText = JSON.stringify(artifact.content).toLowerCase();
      return searchText.includes(searchLower);
    });
    
    return filtered.slice(0, options?.limit || 50);
  }
}

// Singleton instance
let artifactManager: ArtifactManager | null = null;

export function getArtifactManager(): ArtifactManager {
  if (!artifactManager) {
    artifactManager = new ArtifactManager();
  }
  return artifactManager;
}

export function setArtifactManager(manager: ArtifactManager): void {
  artifactManager = manager;
}
