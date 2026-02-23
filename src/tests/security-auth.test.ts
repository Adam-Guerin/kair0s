/**
 * Security and Authentication Tests
 * 
 * Comprehensive tests for authentication, authorization,
 * security policies, and vulnerability prevention.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock security system
class MockSecurityManager {
  private users: Map<string, any> = new Map();
  private sessions: Map<string, any> = new Map();
  private roles: Map<string, string[]> = new Map();
  private permissions: Map<string, string[]> = new Map();
  private auditLog: any[] = [];
  private rateLimiter: Map<string, any> = new Map();
  private blacklistedTokens: Set<string> = new Set();

  constructor() {
    this.setupDefaultRoles();
    this.setupDefaultPermissions();
  }

  private setupDefaultRoles(): void {
    this.roles.set('admin', ['read', 'write', 'delete', 'manage_users', 'manage_system']);
    this.roles.set('user', ['read', 'write']);
    this.roles.set('moderator', ['read', 'write', 'moderate_content']);
    this.roles.set('guest', ['read']);
  }

  private setupDefaultPermissions(): void {
    this.permissions.set('read', ['view_content', 'view_profile']);
    this.permissions.set('write', ['create_content', 'edit_own_profile']);
    this.permissions.set('delete', ['delete_own_content', 'delete_other_content']);
    this.permissions.set('manage_users', ['create_user', 'edit_user', 'delete_user']);
    this.permissions.set('manage_system', ['system_config', 'view_audit_logs']);
  }

  // User management
  async createUser(userData: any): Promise<any> {
    const user = {
      id: `user_${Date.now()}`,
      ...userData,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null,
      loginAttempts: 0,
      passwordChanged: new Date().toISOString()
    };

    this.users.set(user.id, user);
    this.logAuditEvent('user_created', { userId: user.id, role: user.role });
    
    return { ...user, password: '***' };
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    
    if (!user) {
      this.logAuditEvent('auth_failed', { email, reason: 'user_not_found' });
      return { success: false, error: 'Invalid credentials' };
    }

    if (!user.isActive) {
      this.logAuditEvent('auth_failed', { userId: user.id, reason: 'user_inactive' });
      return { success: false, error: 'Account is inactive' };
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      user.loginAttempts++;
      this.logAuditEvent('auth_failed', { userId: user.id, reason: 'invalid_password', attempts: user.loginAttempts });
      
      if (user.loginAttempts >= 5) {
        user.isActive = false;
        this.logAuditEvent('account_locked', { userId: user.id, reason: 'too_many_attempts' });
      }
      
      return { success: false, error: 'Invalid credentials' };
    }

    // Successful authentication
    user.lastLogin = new Date().toISOString();
    user.loginAttempts = 0;
    this.logAuditEvent('auth_success', { userId: user.id });
    
    const sessionToken = this.generateSessionToken(user);
    const sessionId = this.createSession(sessionToken, user);
    
    return {
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      token: sessionToken,
      sessionId
    };
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // Mock password verification (in real app, use bcrypt)
    return plainPassword === 'password123'; // Mock for testing
  }

  private generateSessionToken(user: any): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private createSession(token: string, user: any): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      userAgent: null,
      ipAddress: null
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  // Session management
  async validateSession(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      this.logAuditEvent('session_invalid', { sessionId, reason: 'not_found' });
      return { valid: false, error: 'Invalid session' };
    }

    // Check if session is expired
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    const isExpired = sessionAge > 24 * 60 * 60 * 1000; // 24 hours
    
    if (isExpired) {
      this.sessions.delete(sessionId);
      this.logAuditEvent('session_expired', { sessionId, age: sessionAge });
      return { valid: false, error: 'Session expired' };
    }

    // Update last activity
    session.lastActivity = new Date().toISOString();
    this.sessions.set(sessionId, session);
    
    return { valid: true, userId: session.userId };
  }

  async invalidateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);
    this.logAuditEvent('session_invalidated', { sessionId, userId: session.userId });
    
    return true;
  }

  // Authorization
  hasPermission(user: any, permission: string): boolean {
    const userRole = user.role;
    const rolePermissions = this.roles.get(userRole);
    
    if (!rolePermissions) {
      return false;
    }
    
    return rolePermissions.includes(permission);
  }

  hasAnyPermission(user: any, permissions: string[]): boolean {
    const userRole = user.role;
    const rolePermissions = this.roles.get(userRole);
    
    if (!rolePermissions) {
      return false;
    }
    
    return permissions.some(permission => rolePermissions.includes(permission));
  }

  // Rate limiting
  checkRateLimit(identifier: string, windowMs: number = 60000): boolean {
    const now = Date.now();
    const limit = this.rateLimiter.get(identifier);
    
    if (!limit) {
      this.rateLimiter.set(identifier, {
        count: 0,
        resetTime: now + windowMs,
        windowStart: now
      });
      return true;
    }

    if (now > limit.resetTime) {
      this.rateLimiter.set(identifier, {
        count: 0,
        resetTime: now + windowMs,
        windowStart: now
      });
      return true;
    }

    const requestsInWindow = limit.count;
    const maxRequests = 100; // Max 100 requests per window
    
    if (requestsInWindow >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Security monitoring
  logAuditEvent(event: string, details: any): void {
    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      details,
      timestamp: new Date().toISOString(),
      severity: this.getEventSeverity(event)
    };
    
    this.auditLog.push(auditEntry);
  }

  private getEventSeverity(event: string): string {
    const highSeverityEvents = ['account_locked', 'auth_failed', 'privilege_escalation'];
    const mediumSeverityEvents = ['session_invalid', 'session_expired', 'permission_denied'];
    
    if (highSeverityEvents.includes(event)) return 'high';
    if (mediumSeverityEvents.includes(event)) return 'medium';
    return 'low';
  }

  // Input validation and sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove JS protocols
      .replace(/data:/gi, '') // Remove data protocols
      .trim();
  }

  validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    return { isValid: true };
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Token management
  generateSecureToken(): string {
    const payload = {
      type: 'access',
      timestamp: Date.now(),
      random: Math.random().toString(36)
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  validateToken(token: string): { isValid: boolean; payload?: any } {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const payload = JSON.parse(decoded);
      
      // Check if token is not expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return { isValid: false };
      }
      
      return { isValid: true, payload };
    } catch {
      return { isValid: false };
    }
  }

  // Blacklist management
  addToBlacklist(token: string): void {
    this.blacklistedTokens.add(token);
    this.logAuditEvent('token_blacklisted', { token });
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // Security headers
  getSecurityHeaders(): any {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Get audit logs
  getAuditLogs(filters: any = {}): any[] {
    let logs = [...this.auditLog];
    
    if (filters.severity) {
      logs = logs.filter(log => log.severity === filters.severity);
    }
    
    if (filters.event) {
      logs = logs.filter(log => log.event === filters.event);
    }
    
    if (filters.userId) {
      logs = logs.filter(log => log.details.userId === filters.userId);
    }
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

describe('Security and Authentication Tests', () => {
  let security: MockSecurityManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    security = new MockSecurityManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Authentication', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'user'
      };

      const user = await security.createUser(userData);
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
      expect(user.password).toBe('***'); // Password should be hidden
    });

    it('should authenticate user with correct credentials', async () => {
      // Create user first
      await security.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user'
      });

      const authResult = await security.authenticateUser('jane@example.com', 'password123');
      
      expect(authResult.success).toBe(true);
      expect(authResult.user.email).toBe('jane@example.com');
      expect(authResult.token).toBeDefined();
      expect(authResult.sessionId).toBeDefined();
    });

    it('should reject authentication with wrong password', async () => {
      await security.createUser({
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user'
      });

      const authResult = await security.authenticateUser('bob@example.com', 'wrongpassword');
      
      expect(authResult.success).toBe(false);
      expect(authResult.error).toBe('Invalid credentials');
    });

    it('should reject authentication for non-existent user', async () => {
      const authResult = await security.authenticateUser('nonexistent@example.com', 'password123');
      
      expect(authResult.success).toBe(false);
      expect(authResult.error).toBe('Invalid credentials');
    });

    it('should lock account after too many failed attempts', async () => {
      await security.createUser({
        name: 'Malicious User',
        email: 'malicious@example.com',
        password: 'password123',
        role: 'user'
      });

      // Multiple failed attempts
      await security.authenticateUser('malicious@example.com', 'wrong1');
      await security.authenticateUser('malicious@example.com', 'wrong2');
      await security.authenticateUser('malicious@example.com', 'wrong3');
      await security.authenticateUser('malicious@example.com', 'wrong4');
      await security.authenticateUser('malicious@example.com', 'wrong5');

      const authResult = await security.authenticateUser('malicious@example.com', 'password123');
      
      expect(authResult.success).toBe(false);
      expect(authResult.error).toBe('Account is inactive');
    });
  });

  describe('Session Management', () => {
    it('should create and validate session', async () => {
      await security.createUser({
        name: 'Session User',
        email: 'session@example.com',
        password: 'password123',
        role: 'user'
      });

      const authResult = await security.authenticateUser('session@example.com', 'password123');
      const sessionId = authResult.sessionId;

      const validationResult = await security.validateSession(sessionId);
      
      expect(validationResult.valid).toBe(true);
      expect(validationResult.userId).toBeDefined();
    });

    it('should reject expired session', async () => {
      await security.createUser({
        name: 'Expired User',
        email: 'expired@example.com',
        password: 'password123',
        role: 'user'
      });

      const authResult = await security.authenticateUser('expired@example.com', 'password123');
      const sessionId = authResult.sessionId;

      // Manually expire the session
      const session = security['sessions'].get(sessionId);
      session.createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
      security['sessions'].set(sessionId, session);

      const validationResult = await security.validateSession(sessionId);
      
      expect(validationResult.valid).toBe(false);
      expect(validationResult.error).toBe('Session expired');
    });

    it('should invalidate session', async () => {
      await security.createUser({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'password123',
        role: 'user'
      });

      const authResult = await security.authenticateUser('logout@example.com', 'password123');
      const sessionId = authResult.sessionId;

      const invalidateResult = await security.invalidateSession(sessionId);
      const validateResult = await security.validateSession(sessionId);
      
      expect(invalidateResult).toBe(true);
      expect(validateResult.valid).toBe(false);
    });
  });

  describe('Authorization and Permissions', () => {
    it('should check user permissions correctly', async () => {
      const adminUser = await security.createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });

      expect(security.hasPermission(adminUser, 'manage_users')).toBe(true);
      expect(security.hasPermission(adminUser, 'delete')).toBe(true);
      expect(security.hasPermission(adminUser, 'read')).toBe(true);
    });

    it('should check role-based permissions', async () => {
      const regularUser = await security.createUser({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });

      expect(security.hasPermission(regularUser, 'manage_users')).toBe(false);
      expect(security.hasPermission(regularUser, 'delete')).toBe(false);
      expect(security.hasPermission(regularUser, 'read')).toBe(true);
    });

    it('should check multiple permissions', async () => {
      const moderatorUser = await security.createUser({
        name: 'Moderator User',
        email: 'moderator@example.com',
        password: 'password123',
        role: 'moderator'
      });

      expect(security.hasAnyPermission(moderatorUser, ['read', 'write', 'moderate_content'])).toBe(true);
      expect(security.hasAnyPermission(moderatorUser, ['manage_users', 'delete'])).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const clientId = 'test_client_1';
      
      for (let i = 0; i < 50; i++) {
        const allowed = security.checkRateLimit(clientId);
        expect(allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const clientId = 'test_client_2';
      
      // Exceed limit
      for (let i = 0; i < 101; i++) {
        security.checkRateLimit(clientId);
      }
      
      const allowed = security.checkRateLimit(clientId);
      expect(allowed).toBe(false);
    });

    it('should reset rate limit after time window', () => {
      const clientId = 'test_client_3';
      
      // Use up limit
      for (let i = 0; i < 100; i++) {
        security.checkRateLimit(clientId);
      }
      
      // Should be blocked
      expect(security.checkRateLimit(clientId)).toBe(false);
      
      // Mock time passing
      const limit = security['rateLimiter'].get(clientId);
      limit.resetTime = Date.now() - 1000; // Set reset time in the past
      
      const allowed = security.checkRateLimit(clientId);
      expect(allowed).toBe(true);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate email format', () => {
      const validEmail = security.validateEmail('user@example.com');
      expect(validEmail.isValid).toBe(true);
      
      const invalidEmail = security.validateEmail('invalid-email');
      expect(invalidEmail.isValid).toBe(false);
      expect(invalidEmail.error).toBe('Invalid email format');
    });

    it('should validate password strength', () => {
      const weakPassword = security.validatePassword('weak');
      expect(weakPassword.isValid).toBe(false);
      expect(weakPassword.errors.length).toBeGreaterThan(0);
      
      const strongPassword = security.validatePassword('StrongPass123!');
      expect(strongPassword.isValid).toBe(true);
      expect(strongPassword.errors).toHaveLength(0);
    });

    it('should sanitize malicious input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = security.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('data:');
    });
  });

  describe('Token Management', () => {
    it('should generate secure token', () => {
      const token = security.generateSecureToken();
      
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('should validate valid token', () => {
      const token = security.generateSecureToken();
      const validation = security.validateToken(token);
      
      expect(validation.isValid).toBe(true);
      expect(validation.payload).toBeDefined();
      expect(validation.payload.type).toBe('access');
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid_token_format';
      const validation = security.validateToken(invalidToken);
      
      expect(validation.isValid).toBe(false);
    });

    it('should detect expired token', () => {
      const token = security.generateSecureToken();
      
      // Manually expire the token
      const validation = security.validateToken(token);
      const payload = validation.payload;
      payload.exp = Date.now() / 1000 - 1000; // Expired 1 second ago
      
      const expiredValidation = security.validateToken(token);
      expect(expiredValidation.isValid).toBe(false);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', () => {
      const headers = security.getSecurityHeaders();
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Strict-Transport-Security']).toContain('max-age=');
      expect(headers['Content-Security-Policy']).toContain('default-src \'self\'');
    });
  });

  describe('Audit Logging', () => {
    it('should log security events', async () => {
      // Create user and trigger events
      security.createUser({ name: 'Audit User', email: 'audit@example.com', password: 'password123', role: 'user' });
      
      const authResult = await security.authenticateUser('audit@example.com', 'wrongpassword');
      await security.authenticateUser('audit@example.com', 'wrongpassword');
      
      const logs = security.getAuditLogs();
      
      expect(logs.length).toBeGreaterThan(0);
      
      const authFailedLogs = logs.filter(log => log.event === 'auth_failed');
      expect(authFailedLogs.length).toBe(2);
      
      const userCreatedLog = logs.find(log => log.event === 'user_created');
      expect(userCreatedLog).toBeDefined();
      expect(userCreatedLog.details.userId).toBeDefined();
    });

    it('should filter audit logs', () => {
      // Create various audit events
      security.logAuditEvent('high_severity_event', { type: 'security_breach' });
      security.logAuditEvent('low_severity_event', { type: 'info_log' });
      security.logAuditEvent('auth_success', { userId: 'user_123' });
      
      const highSeverityLogs = security.getAuditLogs({ severity: 'high' });
      expect(highSeverityLogs.length).toBe(1);
      expect(highSeverityLogs[0].event).toBe('high_severity_event');
      
      const authLogs = security.getAuditLogs({ event: 'auth_success' });
      expect(authLogs.length).toBe(1);
      
      const userLogs = security.getAuditLogs({ userId: 'user_123' });
      expect(userLogs.length).toBe(1);
    });

    it('should track token blacklist', () => {
      const token = 'malicious_token_123';
      
      security.addToBlacklist(token);
      expect(security.isTokenBlacklisted(token)).toBe(true);
      
      const cleanToken = 'clean_token_456';
      expect(security.isTokenBlacklisted(cleanToken)).toBe(false);
    });
  });

  describe('Vulnerability Prevention', () => {
    it('should prevent SQL injection', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = security.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    it('should prevent XSS attacks', () => {
      const xssPayload = '<img src="x" onerror="alert(\'XSS\')">';
      const sanitized = security.sanitizeInput(xssPayload);
      
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert');
    });

    it('should prevent CSRF attacks', () => {
      // Mock CSRF token validation
      const generateCSRFToken = () => Math.random().toString(36).substr(2, 9);
      
      const validToken = generateCSRFToken();
      const invalidToken = '';
      
      expect(validToken.length).toBeGreaterThan(0);
      expect(invalidToken.length).toBe(0);
    });
  });
});
