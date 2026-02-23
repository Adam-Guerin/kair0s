/**
 * Kair0s Legacy Migration Layer
 * 
 * Internal aliases for legacy components with developer warnings.
 * User-facing code uses unified components only.
 */

import { console } from '../utils/console.js';

// ============================================================================
// LEGACY COMPONENT ALIASES
// ============================================================================

/**
 * @deprecated Use Button from '../ui/components/Button' instead
 * @see ../ui/components/Button
 */
export const LegacyButton = 'Button';

/**
 * @deprecated Use Input from '../ui/components/Input' instead
 * @see ../ui/components/Input
 */
export const LegacyInput = 'Input';

/**
 * @deprecated Use Card from '../ui/components/Card' instead
 * @see ../ui/components/Card
 */
export const LegacyCard = 'Card';

/**
 * @deprecated Use Modal from '../ui/components/Modal' instead
 * @see ../ui/components/Modal
 */
export const LegacyModal = 'Modal';

/**
 * @deprecated Use Alert from '../ui/components/Alert' instead
 * @see ../ui/components/Alert
 */
export const LegacyAlert = 'Alert';

/**
 * @deprecated Use Loading from '../ui/components/Loading' instead
 * @see ../ui/components/Loading
 */
export const LegacyLoading = 'Loading';

/**
 * @deprecated useUnifiedUI hook instead
 * @see ../ui/hooks/useUnifiedUI
 */
export const useLegacyUI = 'useUnifiedUI';

// ============================================================================
// LEGACY PATH ALIASES
// ============================================================================

/**
 * @deprecated Use /api/kair0s instead
 * @see ../api/kair0s
 */
export const LEGACY_API_PATHS = {
  OPENCLAW: '/api/kair0s',
  KAIROS: '/api/kair0s',
  PLUELY: '/api/kair0s',
} as const;

/**
 * @deprecated Use /kair0s instead
 * @see ../routes/kair0s
 */
export const LEGACY_ROUTE_PATHS = {
  OPENCLAW: '/kair0s',
  KAIROS: '/kair0s',
  PLUELY: '/kair0s',
} as const;

// ============================================================================
// LEGACY CONFIGURATION ALIASES
// ============================================================================

/**
 * @deprecated Use Kair0sEngineConfig instead
 * @see ../config/engine-config
 */
export const LEGACY_CONFIG_KEYS = {
  OPENCLAW_CONFIG: 'kair0s-engine-config',
  KAIROS_CONFIG: 'kair0s-engine-config',
  PLUELY_CONFIG: 'kair0s-engine-config',
} as const;

/**
 * @deprecated Use Kair0sArtifacts instead
 * @see ../types/business-artifacts
 */
export const LEGACY_STORAGE_KEYS = {
  OPENCLAW_SESSIONS: 'kair0s-sessions',
  KAIROS_SESSIONS: 'kair0s-sessions',
  PLUELY_ARTIFACTS: 'kair0s-artifacts',
} as const;

// ============================================================================
// LEGACY EVENT ALIASES
// ============================================================================

/**
 * @deprecated Use Kair0sEvents instead
 * @see ../events/kair0s
 */
export const LEGACY_EVENT_NAMES = {
  OPENCLAW_READY: 'kair0s-ready',
  KAIROS_READY: 'kair0s-ready',
  PLUELY_READY: 'kair0s-ready',
  OPENCLAW_ERROR: 'kair0s-error',
  KAIROS_ERROR: 'kair0s-error',
  PLUELY_ERROR: 'kair0s-error',
} as const;

// ============================================================================
// MIGRATION WARNINGS SYSTEM
// ============================================================================

interface MigrationWarning {
  legacy: string;
  replacement: string;
  deprecationVersion: string;
  removalVersion: string;
  migrationGuide?: string;
}

const MIGRATION_WARNINGS: MigrationWarning[] = [
  {
    legacy: 'OpenClaw',
    replacement: 'Kair0s',
    deprecationVersion: '1.0.0',
    removalVersion: '2.0.0',
    migrationGuide: 'Replace all OpenClaw references with Kair0s in imports and usage',
  },
  {
    legacy: 'Kairos',
    replacement: 'Kair0s',
    deprecationVersion: '1.0.0',
    removalVersion: '2.0.0',
    migrationGuide: 'Replace all Kairos references with Kair0s in imports and usage',
  },
  {
    legacy: 'Pluely',
    replacement: 'Kair0s',
    deprecationVersion: '1.0.0',
    removalVersion: '2.0.0',
    migrationGuide: 'Replace all Pluely references with Kair0s in imports and usage',
  },
];

// ============================================================================
// DEVELOPER WARNING UTILITIES
// ============================================================================

/**
 * Log migration warning for developers
 */
export function logMigrationWarning(legacyName: string, context: string): void {
  const warning = MIGRATION_WARNINGS.find(w => w.legacy === legacyName);
  
  if (warning) {
    console.warn(
      `⚠️  MIGRATION WARNING: ${legacyName} is deprecated\n` +
      `Replacement: ${warning.replacement}\n` +
      `Deprecated in: v${warning.deprecationVersion}\n` +
      `Removal planned: v${warning.removalVersion}\n` +
      `Migration guide: ${warning.migrationGuide}\n` +
      `Context: ${context}\n` +
      `Please update to use the new Kair0s unified components.`
    );
  }
}

/**
 * Check if a legacy name is being used and warn
 */
export function checkLegacyUsage(legacyName: string, usage: string): void {
  if (process.env.NODE_ENV === 'development') {
    logMigrationWarning(legacyName, usage);
  }
}

/**
 * Get migration info for a legacy component
 */
export function getMigrationInfo(legacyName: string): MigrationWarning | null {
  return MIGRATION_WARNINGS.find(w => w.legacy === legacyName) || null;
}

/**
 * List all legacy components that need migration
 */
export function getAllLegacyComponents(): string[] {
  return MIGRATION_WARNINGS.map(w => w.legacy);
}

/**
 * Check if any legacy code is still being used
 */
export function hasLegacyCode(code: string): boolean {
  const legacyPatterns = [
    /OpenClaw/g,
    /Kairos/g,
    /Pluely/g,
    /openclaw/gi,
    /kairos/gi,
    /pluely/gi,
  ];
  
  return legacyPatterns.some(pattern => pattern.test(code));
}

// ============================================================================
// COMPATIBILITY SHIMS (INTERNAL ONLY)
// ============================================================================

/**
 * Internal compatibility shim for legacy imports
 * These should only be used by the migration layer, not directly by application code
 */
export class LegacyCompatibilityShim {
  private static warnedComponents = new Set<string>();
  
  /**
   * Create a proxy that warns on first usage
   */
  static createProxy<T extends object>(legacyName: string, newComponent: T): T {
    return new Proxy(newComponent, {
      get(target, prop) {
        if (typeof prop === 'string' && !this.warnedComponents.has(legacyName)) {
          logMigrationWarning(legacyName, `Accessing ${String(prop)} on ${legacyName}`);
          this.warnedComponents.add(legacyName);
        }
        return Reflect.get(target, prop);
      },
      apply(target, thisArg, args) {
        if (!this.warnedComponents.has(legacyName)) {
          logMigrationWarning(legacyName, `Instantiating ${legacyName}`);
          this.warnedComponents.add(legacyName);
        }
        return Reflect.apply(target, thisArg, args);
      },
    });
  }
  
  /**
   * Clear warning cache (for testing)
   */
  static clearWarnings(): void {
    this.warnedComponents.clear();
  }
}

// ============================================================================
// EXPORTS FOR INTERNAL MIGRATION
// ============================================================================

/**
 * Internal export for migration utilities
 * These should not be used directly by application code
 */
export const INTERNAL_MIGRATION = {
  logMigrationWarning,
  checkLegacyUsage,
  getMigrationInfo,
  getAllLegacyComponents,
  hasLegacyCode,
  LegacyCompatibilityShim,
  MIGRATION_WARNINGS,
  LEGACY_API_PATHS,
  LEGACY_ROUTE_PATHS,
  LEGACY_CONFIG_KEYS,
  LEGACY_STORAGE_KEYS,
  LEGACY_EVENT_NAMES,
};
