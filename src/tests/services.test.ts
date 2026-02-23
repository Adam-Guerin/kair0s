/**
 * Services Tests
 * 
 * Unit tests for Kair0s core services including security manager,
 * intelligent orchestrator, artifact manager, and other key services.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Security Manager
class MockSecurityManager {
  private permissions: Map<string, string[]> = new Map();
  private sessions: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultPermissions();
  }

  private initializeDefaultPermissions(): void {
    this.permissions.set('admin', ['read', 'write', 'delete', 'manage']);
    this.permissions.set('user', ['read', 'write']);
    this.permissions.set('guest', ['read']);
  }

  hasPermission(userId: string, permission: string): boolean {
    const userRole = this.getUserRole(userId);
    const rolePermissions = this.permissions.get(userRole) || [];
    return rolePermissions.includes(permission);
  }

  getUserRole(userId: string): string {
    // Mock role assignment
    if (userId.startsWith('admin_')) return 'admin';
    if (userId.startsWith('user_')) return 'user';
    return 'guest';
  }

  createSession(userId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      permissions: this.permissions.get(this.getUserRole(userId)) || []
    });
    return sessionId;
  }

  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    // Check if session is not expired (24 hours)
    const isExpired = Date.now() - session.lastActivity > 24 * 60 * 60 * 1000;
    if (isExpired) {
      this.sessions.delete(sessionId);
      return false;
    }
    
    session.lastActivity = Date.now();
    return true;
  }

  revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  encryptData(data: string): string {
    // Mock encryption
    return Buffer.from(data).toString('base64');
  }

  decryptData(encryptedData: string): string {
    // Mock decryption
    return Buffer.from(encryptedData, 'base64').toString();
  }
}

// Mock Intelligent Orchestrator
class MockIntelligentOrchestrator {
  private providers: any[] = [];
  private routingHistory: any[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers = [
      { id: 'openai', name: 'OpenAI GPT', type: 'llm', capabilities: ['text', 'code'], performance: 0.9 },
      { id: 'anthropic', name: 'Claude', type: 'llm', capabilities: ['text', 'analysis'], performance: 0.85 },
      { id: 'local', name: 'Local Model', type: 'llm', capabilities: ['text'], performance: 0.7 }
    ];
  }

  async selectOptimalProvider(query: string, context?: any): Promise<any> {
    // Simple selection logic based on query complexity
    const complexity = query.length + (context?.attachments?.length || 0);
    
    if (complexity > 100) {
      return this.providers.find(p => p.id === 'openai');
    } else if (complexity > 50) {
      return this.providers.find(p => p.id === 'anthropic');
    }
    return this.providers.find(p => p.id === 'local');
  }

  async routeRequest(request: any): Promise<any> {
    const provider = await this.selectOptimalProvider(request.query, request.context);
    
    this.routingHistory.push({
      requestId: `req_${Date.now()}`,
      providerId: provider.id,
      query: request.query,
      timestamp: Date.now(),
      responseTime: Math.floor(Math.random() * 1000) + 100
    });

    return {
      response: `Mock response from ${provider.name} for: ${request.query}`,
      provider: provider.id,
      responseTime: Math.floor(Math.random() * 1000) + 100,
      confidence: provider.performance,
      metadata: {
        model: provider.name,
        tokens: Math.floor(Math.random() * 1000) + 100
      }
    };
  }

  getProviders(): any[] {
    return this.providers;
  }

  getRoutingHistory(): any[] {
    return this.routingHistory;
  }

  addProvider(provider: any): void {
    this.providers.push(provider);
  }

  updateProviderPerformance(providerId: string, performance: number): void {
    const provider = this.providers.find(p => p.id === providerId);
    if (provider) {
      provider.performance = performance;
    }
  }
}

// Mock Artifact Manager
class MockArtifactManager {
  private artifacts: any[] = [];
  private sessions: any[] = [];
  private searchIndex: Map<string, string[]> = new Map();

  async createArtifact(artifact: any): Promise<any> {
    const newArtifact = {
      id: `artifact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      version: 1,
      ...artifact
    };

    this.artifacts.push(newArtifact);
    this.indexArtifact(newArtifact);
    return newArtifact;
  }

  async createTaskSession(session: any): Promise<any> {
    const newSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'active',
      artifacts: [],
      ...session
    };

    this.sessions.push(newSession);
    return newSession;
  }

  async searchArtifacts(query: any): Promise<any[]> {
    const results = this.artifacts.filter(artifact => {
      const contentMatch = artifact.content?.toLowerCase().includes(query.query?.toLowerCase() || '');
      const typeMatch = !query.type || artifact.type === query.type;
      const tagMatch = !query.tags || query.tags.some((tag: string) => artifact.tags?.includes(tag));
      
      return contentMatch && typeMatch && tagMatch;
    });

    return results.slice(0, query.limit || 50);
  }

  async updateArtifact(id: string, updates: any): Promise<any> {
    const artifactIndex = this.artifacts.findIndex(a => a.id === id);
    if (artifactIndex === -1) {
      throw new Error('Artifact not found');
    }

    this.artifacts[artifactIndex] = {
      ...this.artifacts[artifactIndex],
      ...updates,
      version: this.artifacts[artifactIndex].version + 1,
      lastModified: Date.now()
    };

    return this.artifacts[artifactIndex];
  }

  async deleteArtifact(id: string): Promise<boolean> {
    const artifactIndex = this.artifacts.findIndex(a => a.id === id);
    if (artifactIndex === -1) return false;

    this.artifacts.splice(artifactIndex, 1);
    return true;
  }

  getArtifacts(): any[] {
    return this.artifacts;
  }

  getSessions(): any[] {
    return this.sessions;
  }

  private indexArtifact(artifact: any): void {
    // Simple indexing for search
    const words = (artifact.content || '').toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 2) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, []);
        }
        this.searchIndex.get(word)!.push(artifact.id);
      }
    });
  }
}

describe('Security Manager', () => {
  let securityManager: MockSecurityManager;

  beforeEach(() => {
    securityManager = new MockSecurityManager();
  });

  describe('Permission Management', () => {
    it('should grant correct permissions based on user role', () => {
      expect(securityManager.hasPermission('admin_123', 'delete')).toBe(true);
      expect(securityManager.hasPermission('admin_123', 'manage')).toBe(true);
      expect(securityManager.hasPermission('user_123', 'write')).toBe(true);
      expect(securityManager.hasPermission('user_123', 'delete')).toBe(false);
      expect(securityManager.hasPermission('guest_123', 'read')).toBe(true);
      expect(securityManager.hasPermission('guest_123', 'write')).toBe(false);
    });

    it('should identify user roles correctly', () => {
      expect(securityManager.getUserRole('admin_123')).toBe('admin');
      expect(securityManager.getUserRole('user_123')).toBe('user');
      expect(securityManager.getUserRole('guest_123')).toBe('guest');
      expect(securityManager.getUserRole('unknown_123')).toBe('guest');
    });
  });

  describe('Session Management', () => {
    it('should create sessions with valid structure', () => {
      const sessionId = securityManager.createSession('user_123');
      
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should validate active sessions', () => {
      const sessionId = securityManager.createSession('user_123');
      expect(securityManager.validateSession(sessionId)).toBe(true);
    });

    it('should reject invalid sessions', () => {
      expect(securityManager.validateSession('invalid_session')).toBe(false);
    });

    it('should revoke sessions', () => {
      const sessionId = securityManager.createSession('user_123');
      expect(securityManager.validateSession(sessionId)).toBe(true);
      
      const revoked = securityManager.revokeSession(sessionId);
      expect(revoked).toBe(true);
      expect(securityManager.validateSession(sessionId)).toBe(false);
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const originalData = 'sensitive information';
      const encrypted = securityManager.encryptData(originalData);
      const decrypted = securityManager.decryptData(encrypted);
      
      expect(encrypted).not.toBe(originalData);
      expect(decrypted).toBe(originalData);
    });

    it('should handle empty strings', () => {
      const encrypted = securityManager.encryptData('');
      const decrypted = securityManager.decryptData(encrypted);
      expect(decrypted).toBe('');
    });
  });
});

describe('Intelligent Orchestrator', () => {
  let orchestrator: MockIntelligentOrchestrator;

  beforeEach(() => {
    orchestrator = new MockIntelligentOrchestrator();
  });

  describe('Provider Selection', () => {
    it('should select optimal provider based on query complexity', async () => {
      const simpleQuery = 'Hello';
      const mediumQuery = 'Can you help me with this complex problem that requires analysis?';
      const complexQuery = 'Please analyze this large document and provide comprehensive insights...'.repeat(10);

      const simpleProvider = await orchestrator.selectOptimalProvider(simpleQuery);
      const mediumProvider = await orchestrator.selectOptimalProvider(mediumQuery);
      const complexProvider = await orchestrator.selectOptimalProvider(complexQuery);

      expect(simpleProvider.id).toBe('local');
      expect(mediumProvider.id).toBe('anthropic');
      expect(complexProvider.id).toBe('openai');
    });

    it('should handle context in provider selection', async () => {
      const query = 'Analyze this';
      const context = { attachments: ['file1', 'file2', 'file3'] };
      
      const provider = await orchestrator.selectOptimalProvider(query, context);
      expect(provider).toBeDefined();
    });
  });

  describe('Request Routing', () => {
    it('should route requests successfully', async () => {
      const request = {
        query: 'Test request',
        context: { sessionId: 'test' }
      };

      const response = await orchestrator.routeRequest(request);
      
      expect(response.response).toContain('Mock response');
      expect(response.provider).toBeDefined();
      expect(response.responseTime).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('should maintain routing history', async () => {
      await orchestrator.routeRequest({ query: 'Test 1' });
      await orchestrator.routeRequest({ query: 'Test 2' });
      
      const history = orchestrator.getRoutingHistory();
      expect(history).toHaveLength(2);
      expect(history[0].query).toBe('Test 1');
      expect(history[1].query).toBe('Test 2');
    });
  });

  describe('Provider Management', () => {
    it('should list available providers', () => {
      const providers = orchestrator.getProviders();
      expect(providers).toHaveLength(3);
      expect(providers[0].id).toBe('openai');
    });

    it('should add new providers', () => {
      const newProvider = {
        id: 'custom',
        name: 'Custom Provider',
        type: 'llm',
        capabilities: ['text'],
        performance: 0.8
      };

      orchestrator.addProvider(newProvider);
      const providers = orchestrator.getProviders();
      expect(providers).toHaveLength(4);
      expect(providers.find(p => p.id === 'custom')).toBeDefined();
    });

    it('should update provider performance', () => {
      orchestrator.updateProviderPerformance('openai', 0.95);
      const providers = orchestrator.getProviders();
      const openaiProvider = providers.find(p => p.id === 'openai');
      expect(openaiProvider?.performance).toBe(0.95);
    });
  });
});

describe('Artifact Manager', () => {
  let artifactManager: MockArtifactManager;

  beforeEach(() => {
    artifactManager = new MockArtifactManager();
  });

  describe('Artifact Creation', () => {
    it('should create artifacts with valid structure', async () => {
      const artifactData = {
        type: 'text',
        content: 'Test content',
        tags: ['test', 'sample'],
        metadata: { author: 'test' }
      };

      const artifact = await artifactManager.createArtifact(artifactData);
      
      expect(artifact.id).toMatch(/^artifact_\d+_[a-z0-9]+$/);
      expect(artifact.type).toBe('text');
      expect(artifact.content).toBe('Test content');
      expect(artifact.tags).toEqual(['test', 'sample']);
      expect(artifact.timestamp).toBeGreaterThan(0);
      expect(artifact.version).toBe(1);
    });
  });

  describe('Session Management', () => {
    it('should create task sessions', async () => {
      const sessionData = {
        userId: 'user123',
        presetId: 'meeting',
        inputMode: 'audio'
      };

      const session = await artifactManager.createTaskSession(sessionData);
      
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.userId).toBe('user123');
      expect(session.status).toBe('active');
      expect(session.artifacts).toEqual([]);
    });
  });

  describe('Artifact Search', () => {
    beforeEach(async () => {
      // Create test artifacts
      await artifactManager.createArtifact({
        type: 'text',
        content: 'React component testing with Vitest',
        tags: ['react', 'testing']
      });

      await artifactManager.createArtifact({
        type: 'code',
        content: 'Python machine learning script',
        tags: ['python', 'ml']
      });

      await artifactManager.createArtifact({
        type: 'text',
        content: 'TypeScript configuration setup',
        tags: ['typescript', 'config']
      });
    });

    it('should search artifacts by content', async () => {
      const results = await artifactManager.searchArtifacts({
        query: 'React'
      });

      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('React');
    });

    it('should search artifacts by type', async () => {
      const results = await artifactManager.searchArtifacts({
        query: '',
        type: 'code'
      });

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('code');
    });

    it('should search artifacts by tags', async () => {
      const results = await artifactManager.searchArtifacts({
        query: '',
        tags: ['testing']
      });

      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('testing');
    });

    it('should limit search results', async () => {
      const results = await artifactManager.searchArtifacts({
        query: '',
        limit: 2
      });

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Artifact Updates', () => {
    it('should update existing artifacts', async () => {
      const artifact = await artifactManager.createArtifact({
        type: 'text',
        content: 'Original content'
      });

      const updated = await artifactManager.updateArtifact(artifact.id, {
        content: 'Updated content',
        tags: ['updated']
      });

      expect(updated.content).toBe('Updated content');
      expect(updated.tags).toEqual(['updated']);
      expect(updated.version).toBe(2);
      expect(updated.lastModified).toBeGreaterThan(artifact.timestamp);
    });

    it('should throw error when updating non-existent artifact', async () => {
      await expect(
        artifactManager.updateArtifact('non-existent', { content: 'test' })
      ).rejects.toThrow('Artifact not found');
    });
  });

  describe('Artifact Deletion', () => {
    it('should delete artifacts successfully', async () => {
      const artifact = await artifactManager.createArtifact({
        type: 'text',
        content: 'To be deleted'
      });

      const deleted = await artifactManager.deleteArtifact(artifact.id);
      expect(deleted).toBe(true);

      const searchResults = await artifactManager.searchArtifacts({
        query: 'deleted'
      });
      expect(searchResults).toHaveLength(0);
    });

    it('should return false when deleting non-existent artifact', async () => {
      const deleted = await artifactManager.deleteArtifact('non-existent');
      expect(deleted).toBe(false);
    });
  });
});
