/**
 * Kair0s Security Manager
 * 
 * Comprehensive security service including encryption, authentication,
 * input validation, audit logging, and threat detection.
 */

// Browser-compatible crypto utilities
const createHash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const randomBytes = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};


// ============================================================================
// TYPES
// ============================================================================

export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  authentication: {
    sessionTimeout: number;
    maxAttempts: number;
    lockoutDuration: number;
  };
  validation: {
    maxInputLength: number;
    allowedChars: RegExp;
    sanitizeHTML: boolean;
  };
  audit: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
    enableRealTime: boolean;
  };
  threats: {
    enableDetection: boolean;
    suspiciousPatterns: RegExp[];
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
    };
  };
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
  permissions: string[];
  lastActivity: number;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'auth' | 'data' | 'system' | 'security';
  action: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityThreat {
  id: string;
  type: 'injection' | 'xss' | 'csrf' | 'brute_force' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  source: {
    ipAddress?: string;
    userAgent?: string;
    userId?: string;
  };
  details: {
    pattern?: string;
    payload?: string;
    attempts?: number;
    blocked: boolean;
  };
  resolved: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
  risk: 'low' | 'medium' | 'high';
}

// ============================================================================
// SECURITY MANAGER CLASS
// ============================================================================

export class SecurityManager {
  private config: SecurityConfig;
  private sessions: Map<string, UserSession> = new Map();
  private auditLogs: AuditLog[] = [];
  private threats: SecurityThreat[] = [];
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private encryptionKey: Uint8Array;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
        ...config?.encryption
      },
      authentication: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        ...config?.authentication
      },
      validation: {
        maxInputLength: 10000,
        allowedChars: /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=\[\]{}|\\/:;"'<>]$/,
        sanitizeHTML: true,
        ...config?.validation
      },
      audit: {
        logLevel: 'info',
        retentionDays: 90,
        enableRealTime: true,
        ...config?.audit
      },
      threats: {
        enableDetection: true,
        suspiciousPatterns: [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /union\s+select/gi,
          /drop\s+table/gi,
          /insert\s+into/gi,
          /delete\s+from/gi,
          /exec\s*\(/gi,
          /eval\s*\(/gi
        ],
        rateLimiting: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 100,
          ...config?.threats?.rateLimiting
        },
        ...config?.threats
      }
    };

    this.encryptionKey = this.generateEncryptionKey();
    this.initialize();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initialize(): void {
    this.setupAuditLogging();
    this.setupThreatDetection();
    this.setupSessionCleanup();
    this.setupRateLimitCleanup();
    
    this.logAudit('info', 'system', 'security_manager_initialized', {
      config: this.config,
      timestamp: Date.now()
    });
  }

  private setupAuditLogging(): void {
    if (this.config.audit.enableRealTime) {
      setInterval(() => {
        this.processAuditLogs();
      }, 5000); // Process every 5 seconds
    }
  }

  private setupThreatDetection(): void {
    if (this.config.threats.enableDetection) {
      // Monitor for suspicious patterns
      setInterval(() => {
        this.scanForThreats();
      }, 10000); // Scan every 10 seconds
    }
  }

  private setupSessionCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Check every minute
  }

  private setupRateLimitCleanup(): void {
    setInterval(() => {
      this.cleanupRateLimits();
    }, 60000); // Check every minute
  }

  // ============================================================================
  // ENCRYPTION
  // ============================================================================

  public async encrypt(data: string): Promise<{ encrypted: string; iv: string; tag: string }> {
    const iv = randomBytes(this.config.encryption.ivLength);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const key = await crypto.subtle.importKey(
      'raw',
      this.encryptionKey.buffer.slice(this.encryptionKey.byteOffset, this.encryptionKey.byteOffset + this.encryptionKey.byteLength) as ArrayBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer
      },
      key,
      dataBuffer
    );
    
    const encrypted = Array.from(new Uint8Array(encryptedBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return {
      encrypted,
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
      tag: '' // AES-GCM includes the tag in the encrypted data
    };
  }

  public async decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): Promise<string> {
    const iv = new Uint8Array(encryptedData.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const encrypted = new Uint8Array(encryptedData.encrypted.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    
    const key = await crypto.subtle.importKey(
      'raw',
      this.encryptionKey.buffer.slice(this.encryptionKey.byteOffset, this.encryptionKey.byteOffset + this.encryptionKey.byteLength) as ArrayBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  public async hash(data: string, salt?: string): Promise<string> {
    return await createHash(data + (salt || ''));
  }

  public generateSecureToken(length: number = 32): string {
    return Array.from(randomBytes(length))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private generateEncryptionKey(): Uint8Array {
    return randomBytes(this.config.encryption.keyLength);
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  public createSession(userId: string, permissions: string[], ipAddress: string, userAgent: string): UserSession {
    const sessionId = this.generateSecureToken();
    const token = this.generateSecureToken();
    
    const session: UserSession = {
      id: sessionId,
      userId,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.authentication.sessionTimeout,
      ipAddress,
      userAgent,
      permissions,
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, session);
    
    this.logAudit('info', 'auth', 'session_created', {
      userId,
      sessionId,
      ipAddress,
      userAgent
    });

    return session;
  }

  public validateSession(sessionId: string, token: string): UserSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      this.logAudit('warn', 'auth', 'session_not_found', {
        sessionId,
        timestamp: Date.now()
      });
      return null;
    }

    if (session.token !== token) {
      this.logAudit('error', 'auth', 'invalid_token', {
        sessionId,
        userId: session.userId,
        timestamp: Date.now()
      });
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      this.logAudit('warn', 'auth', 'session_expired', {
        sessionId,
        userId: session.userId,
        timestamp: Date.now()
      });
      return null;
    }

    // Update last activity
    session.lastActivity = Date.now();
    this.sessions.set(sessionId, session);
    
    return session;
  }

  public destroySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      this.sessions.delete(sessionId);
      this.logAudit('info', 'auth', 'session_destroyed', {
        sessionId,
        userId: session.userId,
        timestamp: Date.now()
      });
      return true;
    }
    
    return false;
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        expiredSessions.push(sessionId);
      }
    }
    
    expiredSessions.forEach(sessionId => {
      const session = this.sessions.get(sessionId)!;
      this.sessions.delete(sessionId);
      this.logAudit('info', 'auth', 'session_expired_cleanup', {
        sessionId,
        userId: session.userId,
        timestamp: now
      });
    });
  }

  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================

  public validateInput(input: string, context: string = 'general'): ValidationResult {
    const errors: string[] = [];
    let sanitized = input;
    let risk: 'low' | 'medium' | 'high' = 'low';

    // Length validation
    if (input.length > this.config.validation.maxInputLength) {
      errors.push(`Input exceeds maximum length of ${this.config.validation.maxInputLength} characters`);
      risk = 'high';
    }

    // Character validation
    if (!this.config.validation.allowedChars.test(input)) {
      errors.push('Input contains invalid characters');
      risk = 'medium';
    }

    // XSS detection
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b/gi,
      /<object\b/gi,
      /<embed\b/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        errors.push('Potential XSS attack detected');
        risk = 'high';
        break;
      }
    }

    // SQL injection detection
    const sqlPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      /update\s+set/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /--/gi,
      /\/\*/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        errors.push('Potential SQL injection detected');
        risk = 'high';
        break;
      }
    }

    // HTML sanitization
    if (this.config.validation.sanitizeHTML) {
      sanitized = this.sanitizeHTML(input);
    }

    // Log suspicious validation results
    if (risk !== 'low') {
      this.logAudit('warn', 'security', 'input_validation_failed', {
        context,
        inputLength: input.length,
        errors,
        risk,
        timestamp: Date.now()
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: sanitized !== input ? sanitized : undefined,
      risk
    };
  }

  private sanitizeHTML(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, (match) => {
        // Allow only safe HTML tags
        const safeTags = ['p', 'br', 'strong', 'em', 'u', 'span', 'div'];
        const tagName = match.match(/<(\w+)/)?.[1]?.toLowerCase();
        return safeTags.includes(tagName || '') ? match : '';
      });
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  public checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    
    let rateLimitData = this.rateLimitMap.get(identifier);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 0,
        resetTime: now + this.config.threats.rateLimiting.windowMs
      };
      this.rateLimitMap.set(identifier, rateLimitData);
    }

    const allowed = rateLimitData.count < this.config.threats.rateLimiting.maxRequests;
    
    if (allowed) {
      rateLimitData.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.threats.rateLimiting.maxRequests - rateLimitData.count),
      resetTime: rateLimitData.resetTime
    };
  }

  private cleanupRateLimits(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    for (const [identifier, data] of this.rateLimitMap.entries()) {
      if (now > data.resetTime) {
        expired.push(identifier);
      }
    }
    
    expired.forEach(identifier => {
      this.rateLimitMap.delete(identifier);
    });
  }

  // ============================================================================
  // THREAT DETECTION
  // ============================================================================

  public detectThreat(input: string, context: string, source?: { ipAddress?: string; userAgent?: string; userId?: string }): SecurityThreat | null {
    if (!this.config.threats.enableDetection) {
      return null;
    }

    for (const pattern of this.config.threats.suspiciousPatterns) {
      if (pattern.test(input)) {
        const threat: SecurityThreat = {
          id: this.generateSecureToken(),
          type: this.classifyThreatType(pattern),
          severity: this.classifyThreatSeverity(pattern),
          timestamp: Date.now(),
          source: source || {},
          details: {
            pattern: pattern.source,
            payload: input,
            attempts: 1,
            blocked: true
          },
          resolved: false
        };

        this.threats.push(threat);
        
        this.logAudit('error', 'security', 'threat_detected', {
          threatId: threat.id,
          type: threat.type,
          severity: threat.severity,
          context,
          source,
          timestamp: Date.now()
        });

        return threat;
      }
    }

    return null;
  }

  private classifyThreatType(pattern: RegExp): SecurityThreat['type'] {
    const patternStr = pattern.source;
    
    if (patternStr.includes('script')) return 'xss';
    if (patternStr.includes('union') || patternStr.includes('select')) return 'injection';
    if (patternStr.includes('javascript:')) return 'xss';
    if (patternStr.includes('on\\w+')) return 'xss';
    
    return 'suspicious_activity';
  }

  private classifyThreatSeverity(pattern: RegExp): SecurityThreat['severity'] {
    const patternStr = pattern.source;
    
    // High severity patterns
    if (patternStr.includes('script') || patternStr.includes('exec') || patternStr.includes('eval')) {
      return 'critical';
    }
    
    // Medium severity patterns
    if (patternStr.includes('union') || patternStr.includes('drop') || patternStr.includes('insert')) {
      return 'high';
    }
    
    // Low severity patterns
    return 'medium';
  }

  private scanForThreats(): void {
    // This would scan recent activities for threats
    // Implementation depends on what data is available to scan
    this.logAudit('debug', 'security', 'threat_scan_completed', {
      threatsFound: this.threats.filter(t => !t.resolved).length,
      timestamp: Date.now()
    });
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  public logAudit(
    level: AuditLog['level'],
    category: AuditLog['category'],
    action: string,
    details: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    ipAddress?: string
  ): void {
    const log: AuditLog = {
      id: this.generateSecureToken(),
      timestamp: Date.now(),
      level,
      category,
      action,
      userId,
      sessionId,
      ipAddress,
      details,
      severity: this.classifyLogSeverity(level, category)
    };

    this.auditLogs.push(log);
    
    // Log to console in development
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.log(`[AUDIT] ${level.toUpperCase()} ${category}: ${action}`, details);
    }
  }

  private classifyLogSeverity(level: AuditLog['level'], category: AuditLog['category']): AuditLog['severity'] {
    if (level === 'error' || category === 'security') return 'high';
    if (level === 'warn') return 'medium';
    return 'low';
  }

  private processAuditLogs(): void {
    // Process logs for real-time monitoring
    const recentLogs = this.auditLogs.filter(log => 
      Date.now() - log.timestamp < 60000 // Last minute
    );

    const errorCount = recentLogs.filter(log => log.level === 'error').length;
    const securityCount = recentLogs.filter(log => log.category === 'security').length;

    if (errorCount > 10 || securityCount > 5) {
      this.logAudit('error', 'system', 'high_activity_detected', {
        errorCount,
        securityCount,
        timeWindow: '1 minute'
      });
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public getAuditLogs(options?: {
    level?: AuditLog['level'];
    category?: AuditLog['category'];
    userId?: string;
    limit?: number;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (options?.level) {
      logs = logs.filter(log => log.level === options.level);
    }

    if (options?.category) {
      logs = logs.filter(log => log.category === options.category);
    }

    if (options?.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  public getActiveSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }

  public getThreats(options?: {
    type?: SecurityThreat['type'];
    severity?: SecurityThreat['severity'];
    resolved?: boolean;
    limit?: number;
  }): SecurityThreat[] {
    let threats = [...this.threats];

    if (options?.type) {
      threats = threats.filter(threat => threat.type === options.type);
    }

    if (options?.severity) {
      threats = threats.filter(threat => threat.severity === options.severity);
    }

    if (options?.resolved !== undefined) {
      threats = threats.filter(threat => threat.resolved === options.resolved);
    }

    // Sort by timestamp (newest first)
    threats.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (options?.limit) {
      threats = threats.slice(0, options.limit);
    }

    return threats;
  }

  public resolveThreat(threatId: string): boolean {
    const threatIndex = this.threats.findIndex(t => t.id === threatId);
    
    if (threatIndex !== -1) {
      this.threats[threatIndex].resolved = true;
      
      this.logAudit('info', 'security', 'threat_resolved', {
        threatId,
        timestamp: Date.now()
      });
      
      return true;
    }
    
    return false;
  }

  public getSecurityReport(): {
    overview: {
      totalSessions: number;
      activeThreats: number;
      auditLogs: number;
      securityScore: number;
    };
    threats: SecurityThreat[];
    recentLogs: AuditLog[];
  } {
    const activeThreats = this.threats.filter(t => !t.resolved);
    const recentLogs = this.getAuditLogs({ limit: 100 });
    
    // Calculate security score (0-100)
    let securityScore = 100;
    
    // Deduct for active threats
    securityScore -= activeThreats.length * 10;
    
    // Deduct for recent security events
    const recentSecurityEvents = recentLogs.filter(log => 
      log.category === 'security' && log.level === 'error'
    ).length;
    securityScore -= recentSecurityEvents * 5;
    
    securityScore = Math.max(0, securityScore);

    return {
      overview: {
        totalSessions: this.sessions.size,
        activeThreats: activeThreats.length,
        auditLogs: this.auditLogs.length,
        securityScore
      },
      threats: this.getThreats({ limit: 50 }),
      recentLogs
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public cleanup(): void {
    // Clean up old audit logs
    const cutoffTime = Date.now() - (this.config.audit.retentionDays * 24 * 60 * 60 * 1000);
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffTime);
    
    // Clean up resolved threats
    this.threats = this.threats.filter(threat => !threat.resolved || 
      Date.now() - threat.timestamp < 7 * 24 * 60 * 60 * 1000 // Keep resolved for 7 days
    );
    
    this.logAudit('info', 'system', 'security_cleanup_completed', {
      auditLogsRemoved: this.auditLogs.length,
      threatsRemoved: this.threats.length,
      timestamp: Date.now()
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const securityManager = new SecurityManager();

// ============================================================================
// EXPORTS
// ============================================================================

export default SecurityManager;
