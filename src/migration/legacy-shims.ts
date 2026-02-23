/**
 * Kair0s Legacy Shims
 * 
 * Internal compatibility layer that redirects legacy imports to new unified components
 * while providing developer warnings. User-facing code sees no legacy references.
 */

import { 
  Button as NewButton,
  Input as NewInput,
  Card as NewCard,
  Modal as NewModal,
  Alert as NewAlert,
  Loading as NewLoading,
} from '../ui/components/index.js';

import { 
  useUnifiedUI as NewUseUnifiedUI,
} from '../ui/hooks/useUnifiedUI.js';

import { 
  logMigrationWarning,
  LegacyCompatibilityShim,
} from './legacy-aliases.js';

// ============================================================================
// LEGACY COMPONENT SHIMS
// ============================================================================

/**
 * Legacy Button shim that warns on usage and redirects to new Button
 * @deprecated Use Button from '../ui/components/Button' instead
 */
export const Button = LegacyCompatibilityShim.createProxy('Button', NewButton);

/**
 * Legacy Input shim that warns on usage and redirects to new Input
 * @deprecated Use Input from '../ui/components/Input' instead
 */
export const Input = LegacyCompatibilityShim.createProxy('Input', NewInput);

/**
 * Legacy Card shim that warns on usage and redirects to new Card
 * @deprecated Use Card from '../ui/components/Card' instead
 */
export const Card = LegacyCompatibilityShim.createProxy('Card', NewCard);

/**
 * Legacy Modal shim that warns on usage and redirects to new Modal
 * @deprecated Use Modal from '../ui/components/Modal' instead
 */
export const Modal = LegacyCompatibilityShim.createProxy('Modal', NewModal);

/**
 * Legacy Alert shim that warns on usage and redirects to new Alert
 * @deprecated Use Alert from '../ui/components/Alert' instead
 */
export const Alert = LegacyCompatibilityShim.createProxy('Alert', NewAlert);

/**
 * Legacy Loading shim that warns on usage and redirects to new Loading
 * @deprecated Use Loading from '../ui/components/Loading' instead
 */
export const Loading = LegacyCompatibilityShim.createProxy('Loading', NewLoading);

// ============================================================================
// LEGACY HOOK SHIMS
// ============================================================================

/**
 * Legacy UI hook shim that warns on usage and redirects to new hook
 * @deprecated Use useUnifiedUI from '../ui/hooks/useUnifiedUI' instead
 */
export const useLegacyUI = LegacyCompatibilityShim.createProxy('useLegacyUI', NewUseUnifiedUI);

// ============================================================================
// LEGACY PATH SHIMS
// ============================================================================

/**
 * Legacy path constants that redirect to new unified paths
 * @deprecated Use Kair0s paths instead
 */
export const LEGACY_PATHS = {
  // API paths
  OPENCLAW_API: '/api/kair0s',
  KAIROS_API: '/api/kair0s',
  PLUELY_API: '/api/kair0s',
  
  // Route paths
  OPENCLAW_ROUTES: '/kair0s',
  KAIROS_ROUTES: '/kair0s',
  PLUELY_ROUTES: '/kair0s',
  
  // Component paths
  OPENCLAW_COMPONENTS: '../ui/components',
  KAIROS_COMPONENTS: '../ui/components',
  PLUELY_COMPONENTS: '../ui/components',
  
  // Hook paths
  OPENCLAW_HOOKS: '../ui/hooks',
  KAIROS_HOOKS: '../ui/hooks',
  PLUELY_HOOKS: '../ui/hooks',
} as const;

// ============================================================================
// LEGACY CONFIG SHIMS
// ============================================================================

/**
 * Legacy config constants that redirect to new unified config
 * @deprecated Use Kair0s config instead
 */
export const LEGACY_CONFIG = {
  OPENCLAW_ENGINE_CONFIG: 'kair0s-engine-config',
  KAIROS_ENGINE_CONFIG: 'kair0s-engine-config',
  PLUELY_ENGINE_CONFIG: 'kair0s-engine-config',
  
  OPENCLAW_ARTIFACTS: 'kair0s-artifacts',
  KAIROS_ARTIFACTS: 'kair0s-artifacts',
  PLUELY_ARTIFACTS: 'kair0s-artifacts',
} as const;

// ============================================================================
// LEGACY EVENT SHIMS
// ============================================================================

/**
 * Legacy event names that redirect to new unified events
 * @deprecated Use Kair0s events instead
 */
export const LEGACY_EVENTS = {
  // Ready events
  OPENCLAW_READY: 'kair0s-ready',
  KAIROS_READY: 'kair0s-ready',
  PLUELY_READY: 'kair0s-ready',
  
  // Error events
  OPENCLAW_ERROR: 'kair0s-error',
  KAIROS_ERROR: 'kair0s-error',
  PLUELY_ERROR: 'kair0s-error',
  
  // Success events
  OPENCLAW_SUCCESS: 'kair0s-success',
  KAIROS_SUCCESS: 'kair0s-success',
  PLUELY_SUCCESS: 'kair0s-success',
  
  // Progress events
  OPENCLAW_PROGRESS: 'kair0s-progress',
  KAIROS_PROGRESS: 'kair0s-progress',
  PLUELY_PROGRESS: 'kair0s-progress',
} as const;

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Get the new component name for a legacy component
 */
export function getNewComponentName(legacyName: string): string {
  const nameMap: Record<string, string> = {
    'Button': 'Button',
    'Input': 'Input',
    'Card': 'Card',
    'Modal': 'Modal',
    'Alert': 'Alert',
    'Loading': 'Loading',
  };
  
  return nameMap[legacyName] || legacyName;
}

/**
 * Get the new path for a legacy path
 */
export function getNewPath(legacyPath: string): string {
  const pathMap: Record<string, string> = {
    '/api/openclaw': '/api/kair0s',
    '/api/kairos': '/api/kair0s',
    '/api/pluely': '/api/kair0s',
    '/openclaw': '/kair0s',
    '/kairos': '/kair0s',
    '/pluely': '/kair0s',
  };
  
  return pathMap[legacyPath] || legacyPath;
}

/**
 * Get the new event name for a legacy event
 */
export function getNewEventName(legacyEvent: string): string {
  const eventMap: Record<string, string> = {
    'openclaw-ready': 'kair0s-ready',
    'kairos-ready': 'kair0s-ready',
    'pluely-ready': 'kair0s-ready',
    'openclaw-error': 'kair0s-error',
    'kairos-error': 'kair0s-error',
    'pluely-error': 'kair0s-error',
    'openclaw-success': 'kair0s-success',
    'kairos-success': 'kair0s-success',
    'pluely-success': 'kair0s-success',
    'openclaw-progress': 'kair0s-progress',
    'kairos-progress': 'kair0s-progress',
    'pluely-progress': 'kair0s-progress',
  };
  
  return eventMap[legacyEvent] || legacyEvent;
}

/**
 * Check if a legacy import is being used and provide migration info
 */
export function checkLegacyImport(importName: string, filePath: string): void {
  if (process.env.NODE_ENV === 'development') {
    const newName = getNewComponentName(importName);
    const migrationInfo = `Replace '${importName}' with '${newName}' in ${filePath}`;
    logMigrationWarning(importName, migrationInfo);
  }
}

// ============================================================================
// AUTOMATIC MIGRATION SCANNER
// ============================================================================

/**
 * Scan codebase for legacy usage patterns
 * This runs in development to help identify migration opportunities
 */
export function scanForLegacyUsage(code: string): Array<{
  type: 'component' | 'path' | 'event' | 'config';
  legacy: string;
  line: number;
  suggestion: string;
}> {
  const findings: Array<{
    type: 'component' | 'path' | 'event' | 'config';
    legacy: string;
    line: number;
    suggestion: string;
  }> = [];
  
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    // Check for legacy component imports
    const componentMatch = line.match(/import\s+(?:\{[^}]*\}?\s+from\s+['"]([^'"]+)['"]/);
    if (componentMatch) {
      const importName = componentMatch[1];
      if (['OpenClaw', 'Kairos', 'Pluely'].includes(importName)) {
        findings.push({
          type: 'component',
          legacy: importName,
          line: index + 1,
          suggestion: `Use ${getNewComponentName(importName)} from '../ui/components'`,
        });
      }
    }
    
    // Check for legacy path usage
    const pathMatch = line.match(/['"]([^'"]+)['"]/);
    if (pathMatch) {
      const path = pathMatch[1];
      if (['/openclaw', '/kairos', '/pluely'].includes(path)) {
        findings.push({
          type: 'path',
          legacy: path,
          line: index + 1,
          suggestion: `Use ${getNewPath(path)} instead`,
        });
      }
    }
    
    // Check for legacy event usage
    const eventMatch = line.match(/['"]([^'"]+)['"]/);
    if (eventMatch) {
      const event = eventMatch[1];
      if (['openclaw', 'kairos', 'pluely'].includes(event)) {
        findings.push({
          type: 'event',
          legacy: event,
          line: index + 1,
          suggestion: `Use ${getNewEventName(event)} instead`,
        });
      }
    }
  });
  
  return findings;
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clear all legacy warnings (for testing)
 */
export function clearLegacyWarnings(): void {
  LegacyCompatibilityShim.clearWarnings();
}

/**
 * Get migration statistics
 */
export function getMigrationStats(): {
  totalWarnings: number;
  warnedComponents: string[];
} {
  return {
    totalWarnings: LegacyCompatibilityShim['warnedComponents'].size,
    warnedComponents: Array.from(LegacyCompatibilityShim['warnedComponents']),
  };
}

// ============================================================================
// EXPORTS FOR INTERNAL USE ONLY
// ============================================================================

/**
 * Internal exports for migration system
 * These should not be used directly by application code
 */
export const INTERNAL_MIGRATION_SHIMS = {
  Button,
  Input,
  Card,
  Modal,
  Alert,
  Loading,
  useLegacyUI,
  LEGACY_PATHS,
  LEGACY_CONFIG,
  LEGACY_EVENTS,
  getNewComponentName,
  getNewPath,
  getNewEventName,
  checkLegacyImport,
  scanForLegacyUsage,
  clearLegacyWarnings,
  getMigrationStats,
};
