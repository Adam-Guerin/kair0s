/**
 * Secure storage baseline for artifact persistence.
 *
 * Current state:
 * - Defines the SQLite + encryption-at-rest contract.
 * - Provides an in-memory stub implementation to unblock integration work.
 * - Keeps envelope format stable to avoid future migration churn.
 */

import { SecurityManager } from '../security-manager.js';

export type SecureStorageEntityType = 'session' | 'artifact' | 'kpi';

export interface SecureStorageConfig {
  provider: 'local' | 'sqlite' | 'cloud' | 'hybrid';
  encryption: boolean;
  sqlite?: {
    dbPath: string;
    tablePrefix: string;
    keyAlias: string;
  };
}

export interface StorageEnvelope {
  id: string;
  entityType: SecureStorageEntityType;
  encrypted: boolean;
  payload: string;
  iv?: string;
  tag?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SecureStorageAdapter {
  upsert(id: string, entityType: SecureStorageEntityType, data: unknown): Promise<void>;
  delete(id: string, entityType: SecureStorageEntityType): Promise<void>;
  get(id: string, entityType: SecureStorageEntityType): Promise<unknown | null>;
}

class SqliteSecureStorageStub implements SecureStorageAdapter {
  private readonly securityManager = new SecurityManager();
  private readonly envelopes = new Map<string, StorageEnvelope>();

  constructor(private readonly config: SecureStorageConfig) {}

  async upsert(id: string, entityType: SecureStorageEntityType, data: unknown): Promise<void> {
    const now = Date.now();
    const key = this.getKey(id, entityType);
    const serialized = JSON.stringify(data);

    if (this.config.encryption) {
      const encrypted = await this.securityManager.encrypt(serialized);
      this.envelopes.set(key, {
        id,
        entityType,
        encrypted: true,
        payload: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    this.envelopes.set(key, {
      id,
      entityType,
      encrypted: false,
      payload: serialized,
      createdAt: now,
      updatedAt: now,
    });
  }

  async delete(id: string, entityType: SecureStorageEntityType): Promise<void> {
    this.envelopes.delete(this.getKey(id, entityType));
  }

  async get(id: string, entityType: SecureStorageEntityType): Promise<unknown | null> {
    const envelope = this.envelopes.get(this.getKey(id, entityType));
    if (!envelope) return null;

    if (envelope.encrypted) {
      const decrypted = await this.securityManager.decrypt({
        encrypted: envelope.payload,
        iv: envelope.iv || '',
        tag: envelope.tag || '',
      });
      return JSON.parse(decrypted);
    }

    return JSON.parse(envelope.payload);
  }

  private getKey(id: string, entityType: SecureStorageEntityType): string {
    return `${entityType}:${id}`;
  }
}

export function createSecureStorageAdapter(config: SecureStorageConfig): SecureStorageAdapter {
  // Baseline decision: all providers share the same secure-envelope contract.
  // SQLite physical persistence will replace this stub behind the same adapter.
  return new SqliteSecureStorageStub(config);
}
