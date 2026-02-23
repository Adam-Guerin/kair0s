/**
 * Kair0s Real-time Collaboration Service
 * 
 * Advanced real-time collaboration system including presence awareness,
 * live editing, shared cursors, and synchronized state management.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CollaborationSession {
  id: string;
  name: string;
  type: 'document' | 'whiteboard' | 'code' | 'meeting';
  participants: CollaborationParticipant[];
  state: CollaborationState;
  permissions: {
    owner: string;
    editors: string[];
    viewers: string[];
    public: boolean;
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
    locked: boolean;
    lockedBy?: string;
  };
}

export interface CollaborationParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  cursor?: {
    x: number;
    y: number;
    visible: boolean;
  };
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  permissions: 'owner' | 'editor' | 'viewer';
  lastActivity: number;
  color: string;
}

export interface CollaborationState {
  content: string;
  version: number;
  operations: CollaborationOperation[];
  conflicts: CollaborationConflict[];
  locks: CollaborationLock[];
}

export interface CollaborationOperation {
  id: string;
  type: 'insert' | 'delete' | 'replace' | 'format' | 'cursor' | 'selection';
  author: string;
  timestamp: number;
  data: {
    position?: number;
    length?: number;
    content?: string;
    attributes?: Record<string, any>;
    cursor?: { x: number; y: number };
    selection?: { start: number; end: number };
  };
  applied: boolean;
}

export interface CollaborationConflict {
  id: string;
  type: 'concurrent_edit' | 'version_mismatch' | 'permission_denied';
  operations: string[];
  timestamp: number;
  resolved: boolean;
  resolution?: {
    type: 'accept' | 'reject' | 'merge';
    operationId: string;
  };
}

export interface CollaborationLock {
  id: string;
  type: 'section' | 'document' | 'resource';
  target: string;
  owner: string;
  timestamp: number;
  expiresAt: number;
  reason?: string;
}

export interface CollaborationEvent {
  id: string;
  type: 'user_joined' | 'user_left' | 'content_changed' | 'cursor_moved' | 'selection_changed' | 'lock_acquired' | 'lock_released';
  sessionId: string;
  author: string;
  timestamp: number;
  data: any;
}

export interface CollaborationConfig {
  websocket: {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
  conflict: {
    resolutionStrategy: 'last_writer_wins' | 'manual' | 'merge';
    timeout: number;
  };
  presence: {
    heartbeatInterval: number;
    offlineTimeout: number;
  };
  sync: {
    batchSize: number;
    syncInterval: number;
    compressionEnabled: boolean;
  };
}

// ============================================================================
// REAL-TIME COLLABORATION CLASS
// ============================================================================

export class RealtimeCollaboration {
  private config: CollaborationConfig;
  private sessions: Map<string, CollaborationSession> = new Map();
  private currentSession: CollaborationSession | null = null;
  private participant: CollaborationParticipant | null = null;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private heartbeatInterval: number | null = null;
  private syncInterval: number | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private operationQueue: CollaborationOperation[] = [];
  private isConnected = false;

  constructor(config?: Partial<CollaborationConfig>) {
    this.config = {
      websocket: {
        url: 'wss://collab.kair0s.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10
      },
      conflict: {
        resolutionStrategy: 'last_writer_wins',
        timeout: 30000
      },
      presence: {
        heartbeatInterval: 30000,
        offlineTimeout: 60000
      },
      sync: {
        batchSize: 100,
        syncInterval: 5000,
        compressionEnabled: true
      },
      ...config
    };

    this.initialize();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initialize(): void {
    this.setupEventListeners();
    this.connect();
  }

  private setupEventListeners(): void {
    // Window events
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });

    window.addEventListener('online', () => {
      this.connect();
    });

    window.addEventListener('offline', () => {
      this.disconnect();
    });
  }

  // ============================================================================
  // WEBSOCKET CONNECTION
  // ============================================================================

  private connect(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.websocket = new WebSocket(this.config.websocket.url);
      
      this.websocket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.startSync();
        
        this.emit('connection:established', {
          timestamp: Date.now()
        });
      };

      this.websocket.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.stopSync();
        
        this.emit('connection:closed', {
          timestamp: Date.now()
        });
        
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        this.emit('connection:error', { error });
      };

    } catch (error) {
      this.emit('connection:error', { error });
      this.attemptReconnect();
    }
  }

  private disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.isConnected = false;
    this.stopHeartbeat();
    this.stopSync();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.websocket.maxReconnectAttempts) {
      this.emit('connection:failed', {
        attempts: this.reconnectAttempts
      });
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      this.connect();
    }, this.config.websocket.reconnectInterval);
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  public async createSession(options: {
    name: string;
    type: CollaborationSession['type'];
    public?: boolean;
    initialContent?: string;
  }): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: options.name,
      type: options.type,
      participants: [],
      state: {
        content: options.initialContent || '',
        version: 1,
        operations: [],
        conflicts: [],
        locks: []
      },
      permissions: {
        owner: this.participant?.id || '',
        editors: [this.participant?.id || ''],
        viewers: [],
        public: options.public || false
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        locked: false
      }
    };

    this.sessions.set(session.id, session);
    
    if (this.participant) {
      session.participants.push(this.participant);
    }

    this.currentSession = session;
    
    this.emit('session:created', { session });
    
    return session;
  }

  public async joinSession(sessionId: string): Promise<CollaborationSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!this.participant) {
      throw new Error('Participant not initialized');
    }

    // Check permissions
    const hasPermission = this.checkSessionPermissions(session, this.participant);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to join session');
    }

    // Add participant to session
    if (!session.participants.find(p => p.id === this.participant!.id)) {
      session.participants.push(this.participant);
    }

    this.currentSession = session;
    
    // Send join event
    this.sendEvent({
      id: this.generateEventId(),
      type: 'user_joined',
      sessionId: session.id,
      author: this.participant.id,
      timestamp: Date.now(),
      data: {
        participant: this.participant
      }
    });

    this.emit('session:joined', { session });
    
    return session;
  }

  public async leaveSession(sessionId?: string): Promise<void> {
    const session = sessionId ? this.sessions.get(sessionId) : this.currentSession;
    if (!session) {
      return;
    }

    if (!this.participant) {
      return;
    }

    // Remove participant from session
    session.participants = session.participants.filter(p => p.id !== this.participant!.id);
    
    // Send leave event
    this.sendEvent({
      id: this.generateEventId(),
      type: 'user_left',
      sessionId: session.id,
      author: this.participant.id,
      timestamp: Date.now(),
      data: {
        participantId: this.participant!.id
      }
    });

    if (this.currentSession?.id === session.id) {
      this.currentSession = null;
    }

    this.emit('session:left', { session });
  }

  private checkSessionPermissions(session: CollaborationSession, participant: CollaborationParticipant): boolean {
    if (session.permissions.owner === participant.id) {
      return true;
    }
    
    if (session.permissions.editors.includes(participant.id)) {
      return true;
    }
    
    if (session.permissions.viewers.includes(participant.id)) {
      return true;
    }
    
    return session.permissions.public;
  }

  // ============================================================================
  // PARTICIPANT MANAGEMENT
  // ============================================================================

  public setParticipant(participant: Omit<CollaborationParticipant, 'color' | 'lastActivity'>): void {
    this.participant = {
      ...participant,
      color: this.generateParticipantColor(),
      lastActivity: Date.now()
    };
  }

  public updateParticipantStatus(status: CollaborationParticipant['status']): void {
    if (!this.participant) {
      return;
    }

    this.participant.status = status;
    this.participant.lastActivity = Date.now();
    
    this.emit('participant:updated', { participant: this.participant });
  }

  private generateParticipantColor(): string {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // COLLABORATION OPERATIONS
  // ============================================================================

  public async applyOperation(operation: Omit<CollaborationOperation, 'id' | 'author' | 'timestamp' | 'applied'>): Promise<void> {
    if (!this.currentSession || !this.participant) {
      throw new Error('No active session or participant');
    }

    const fullOperation: CollaborationOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: this.participant.id,
      timestamp: Date.now(),
      applied: false
    };

    // Check for conflicts
    const conflicts = this.detectConflicts(fullOperation);
    if (conflicts.length > 0) {
      await this.handleConflicts(conflicts, fullOperation);
      return;
    }

    // Apply operation locally
    this.applyOperationLocally(fullOperation);
    
    // Send operation to other participants
    this.sendOperation(fullOperation);
  }

  private applyOperationLocally(operation: CollaborationOperation): void {
    if (!this.currentSession) {
      return;
    }

    const { state } = this.currentSession;
    
    switch (operation.type) {
      case 'insert':
        if (operation.data.position !== undefined && operation.data.content) {
          state.content = 
            state.content.slice(0, operation.data.position) +
            operation.data.content +
            state.content.slice(operation.data.position);
        }
        break;
        
      case 'delete':
        if (operation.data.position !== undefined && operation.data.length) {
          state.content = 
            state.content.slice(0, operation.data.position) +
            state.content.slice(operation.data.position + operation.data.length);
        }
        break;
        
      case 'replace':
        if (operation.data.position !== undefined && operation.data.length && operation.data.content) {
          state.content = 
            state.content.slice(0, operation.data.position) +
            operation.data.content +
            state.content.slice(operation.data.position + operation.data.length);
        }
        break;
        
      case 'cursor':
        if (operation.data.cursor && this.participant) {
          this.participant.cursor = {
            x: operation.data.cursor.x,
            y: operation.data.cursor.y,
            visible: true
          };
        }
        break;
        
      case 'selection':
        if (operation.data.selection && this.participant) {
          this.participant.selection = {
            start: operation.data.selection.start,
            end: operation.data.selection.end,
            text: '' // Will be populated by the content
          };
        }
        break;
    }

    operation.applied = true;
    state.operations.push(operation);
    state.version++;
    
    this.currentSession.metadata.updatedAt = Date.now();
    this.currentSession.metadata.version = state.version;
    
    this.emit('operation:applied', { operation });
  }

  private detectConflicts(operation: CollaborationOperation): CollaborationConflict[] {
    if (!this.currentSession) {
      return [];
    }

    const conflicts: CollaborationConflict[] = [];
    const { state } = this.currentSession;
    
    // Check for concurrent edits on same position
    const concurrentOps = state.operations.filter(op => 
      !op.applied &&
      op.type === operation.type &&
      Math.abs((op.data.position || 0) - (operation.data.position || 0)) < 10 &&
      Date.now() - op.timestamp < this.config.conflict.timeout
    );

    if (concurrentOps.length > 0) {
      conflicts.push({
        id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'concurrent_edit',
        operations: [operation.id, ...concurrentOps.map(op => op.id)],
        timestamp: Date.now(),
        resolved: false
      });
    }

    return conflicts;
  }

  private async handleConflicts(conflicts: CollaborationConflict[], operation: CollaborationOperation): Promise<void> {
    if (this.config.conflict.resolutionStrategy === 'last_writer_wins') {
      // Apply operation anyway
      this.applyOperationLocally(operation);
      
      // Mark conflicts as resolved
      conflicts.forEach(conflict => {
        conflict.resolved = true;
        conflict.resolution = {
          type: 'accept',
          operationId: operation.id
        };
      });
      
      this.emit('conflict:resolved', { conflicts, strategy: 'last_writer_wins' });
      
    } else if (this.config.conflict.resolutionStrategy === 'manual') {
      // Emit conflict event for manual resolution
      this.emit('conflict:detected', { conflicts, operation });
    }
  }

  // ============================================================================
  // CURSOR AND SELECTION
  // ============================================================================

  public updateCursor(position: { x: number; y: number }): void {
    if (!this.participant) {
      return;
    }

    this.applyOperation({
      type: 'cursor',
      data: { cursor: position }
    });
  }

  public updateSelection(selection: { start: number; end: number; text: string }): void {
    if (!this.participant) {
      return;
    }

    this.applyOperation({
      type: 'selection',
      data: { selection }
    });
  }

  // ============================================================================
  // LOCK MANAGEMENT
  // ============================================================================

  public async acquireLock(type: CollaborationLock['type'], target: string, reason?: string): Promise<CollaborationLock> {
    if (!this.currentSession || !this.participant) {
      throw new Error('No active session or participant');
    }

    const lock: CollaborationLock = {
      id: `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      target,
      owner: this.participant.id,
      timestamp: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
      reason
    };

    this.currentSession.state.locks.push(lock);
    
    this.sendEvent({
      id: this.generateEventId(),
      type: 'lock_acquired',
      sessionId: this.currentSession.id,
      author: this.participant.id,
      timestamp: Date.now(),
      data: {
        lock: lock
      }
    });

    this.emit('lock:acquired', { lock });
    
    return lock;
  }

  public async releaseLock(lockId: string): Promise<void> {
    if (!this.currentSession || !this.participant) {
      return;
    }

    const lockIndex = this.currentSession.state.locks.findIndex(lock => lock.id === lockId);
    if (lockIndex === -1) {
      return;
    }

    const lock = this.currentSession.state.locks[lockIndex];
    
    // Check if user owns the lock
    if (lock.owner !== this.participant.id) {
      throw new Error('Cannot release lock owned by another user');
    }

    this.currentSession.state.locks.splice(lockIndex, 1);
    
    this.sendEvent({
      id: this.generateEventId(),
      type: 'lock_released',
      sessionId: this.currentSession.id,
      author: this.participant.id,
      timestamp: Date.now(),
      data: {
        lockId: lockId
      }
    });

    this.emit('lock:released', { lockId });
  }

  // ============================================================================
  // WEBSOCKET COMMUNICATION
  // ============================================================================

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'operation':
        this.handleRemoteOperation(message.data);
        break;
        
      case 'event':
        this.handleRemoteEvent(message.data);
        break;
        
      case 'sync':
        this.handleSyncMessage(message.data);
        break;
        
      case 'heartbeat':
        this.handleHeartbeat(message.data);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleRemoteOperation(operation: CollaborationOperation): void {
    if (!this.currentSession) {
      return;
    }

    // Don't apply own operations
    if (operation.author === this.participant?.id) {
      return;
    }

    // Apply remote operation
    this.applyOperationLocally(operation);
  }

  private handleRemoteEvent(event: CollaborationEvent): void {
    switch (event.type) {
      case 'user_joined':
        this.handleUserJoined(event);
        break;
        
      case 'user_left':
        this.handleUserLeft(event);
        break;
        
      case 'content_changed':
        this.handleContentChanged(event);
        break;
        
      case 'cursor_moved':
        this.handleCursorMoved(event);
        break;
        
      case 'selection_changed':
        this.handleSelectionChanged(event);
        break;
        
      case 'lock_acquired':
        this.handleLockAcquired(event);
        break;
        
      case 'lock_released':
        this.handleLockReleased(event);
        break;
    }
  }

  private handleUserJoined(event: CollaborationEvent): void {
    if (!this.currentSession) {
      return;
    }

    const participant = event.data.participant as CollaborationParticipant;
    
    // Add participant to session
    if (!this.currentSession.participants.find(p => p.id === participant.id)) {
      this.currentSession.participants.push(participant);
    }
    
    this.emit('user:joined', { participant });
  }

  private handleUserLeft(event: CollaborationEvent): void {
    if (!this.currentSession) {
      return;
    }

    const participantId = event.data.participantId as string;
    
    // Remove participant from session
    this.currentSession.participants = this.currentSession.participants.filter(
      p => p.id !== participantId
    );
    
    this.emit('user:left', { participantId });
  }

  private handleContentChanged(event: CollaborationEvent): void {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.state.content = event.data.content;
    this.currentSession.state.version = event.data.version;
    
    this.emit('content:changed', { content: event.data.content, version: event.data.version });
  }

  private handleCursorMoved(event: CollaborationEvent): void {
    if (!this.currentSession) {
      return;
    }

    const { participantId, cursor } = event.data;
    
    const participant = this.currentSession.participants.find(p => p.id === participantId);
    if (participant) {
      participant.cursor = cursor;
    }
    
    this.emit('cursor:moved', { participantId, cursor });
  }

  private handleSelectionChanged(event: CollaborationEvent): void {
    if (!this.currentSession) {
      return;
    }

    const { participantId, selection } = event.data;
    
    const participant = this.currentSession.participants.find(p => p.id === participantId);
    if (participant) {
      participant.selection = selection;
    }
    
    this.emit('selection:changed', { participantId, selection });
  }

  private handleLockAcquired(event: CollaborationEvent): void {
    if (!this.currentSession) {
      return;
    }

    const lock = event.data.lock as CollaborationLock;
    
    // Add lock to session
    if (!this.currentSession.state.locks.find(l => l.id === lock.id)) {
      this.currentSession.state.locks.push(lock);
    }
    
    this.emit('lock:acquired', { lock });
  }

  private handleLockReleased(event: CollaborationEvent): void {
    if (!this.currentSession) {
      return;
    }

    const lockId = event.data.lockId as string;
    
    // Remove lock from session
    this.currentSession.state.locks = this.currentSession.state.locks.filter(
      l => l.id !== lockId
    );
    
    this.emit('lock:released', { lockId });
  }

  private handleSyncMessage(data: any): void {
    // Handle synchronization messages
    this.emit('sync:received', { data });
  }

  private handleHeartbeat(data: any): void {
    // Handle heartbeat messages
    this.emit('heartbeat:received', { data });
  }

  private sendOperation(operation: CollaborationOperation): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      this.operationQueue.push(operation);
      return;
    }

    this.websocket.send(JSON.stringify({
      type: 'operation',
      data: operation
    }));
  }

  private sendEvent(event: CollaborationEvent): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.websocket.send(JSON.stringify({
      type: 'event',
      data: event
    }));
  }

  // ============================================================================
  // HEARTBEAT AND SYNC
  // ============================================================================

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'heartbeat',
          data: {
            participantId: this.participant?.id,
            timestamp: Date.now()
          }
        }));
      }
    }, this.config.presence.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private startSync(): void {
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.config.sync.syncInterval);
  }

  private stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private performSync(): void {
    if (!this.currentSession) {
      return;
    }

    // Send sync request
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'sync',
        data: {
          sessionId: this.currentSession.id,
          version: this.currentSession.state.version
        }
      }));
    }
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  public getParticipant(): CollaborationParticipant | null {
    return this.participant;
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  public getSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values());
  }

  public async getSessionById(sessionId: string): Promise<CollaborationSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  public async getParticipants(sessionId: string): Promise<CollaborationParticipant[]> {
    const session = this.sessions.get(sessionId);
    return session?.participants || [];
  }

  public async getSessionHistory(sessionId: string, limit?: number): Promise<CollaborationOperation[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    const operations = session.state.operations.slice();
    return limit ? operations.slice(-limit) : operations;
  }

  public async exportSession(sessionId: string): Promise<{
    session: CollaborationSession;
    operations: CollaborationOperation[];
    events: CollaborationEvent[];
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return {
      session,
      operations: session.state.operations,
      events: [] // Would need to track events separately
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public destroy(): void {
    this.disconnect();
    this.sessions.clear();
    this.currentSession = null;
    this.participant = null;
    this.operationQueue = [];
    this.eventListeners.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const realtimeCollaboration = new RealtimeCollaboration();

// ============================================================================
// EXPORTS
// ============================================================================

export default RealtimeCollaboration;
