/**
 * Kair0s Console Utilities
 * 
 * Enhanced console utilities for development warnings and migration feedback.
 */

// ============================================================================
// DEVELOPER WARNING FORMATTING
// ============================================================================

interface ConsoleStyles {
  reset: string;
  bold: string;
  yellow: string;
  red: string;
  blue: string;
  cyan: string;
  magenta: string;
  gray: string;
}

const styles: ConsoleStyles = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

// ============================================================================
// WARNING LEVELS
// ============================================================================

export enum WarningLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  MIGRATION = 'migration',
}

// ============================================================================
// CONSOLE WRAPPERS
// ============================================================================

/**
 * Format console message with timestamp and level
 */
export function formatMessage(level: WarningLevel, message: string): string {
  const timestamp = new Date().toISOString();
  const levelStyles: Record<WarningLevel, ConsoleStyles> = {
    [WarningLevel.INFO]: styles.blue,
    [WarningLevel.WARNING]: styles.yellow,
    [WarningLevel.ERROR]: styles.red,
    [WarningLevel.SUCCESS]: styles.green,
    [WarningLevel.MIGRATION]: styles.magenta,
  };
  
  const style = levelStyles[level] || styles.reset;
  
  return `${styles.gray}[${timestamp}]${styles.reset} ${style}[${level.toUpperCase()}]${styles.reset} ${message}`;
}

/**
 * Log info message
 */
export function logInfo(message: string, ...args: any[]): void {
  console.log(formatMessage(WarningLevel.INFO, message), ...args);
}

/**
 * Log warning message
 */
export function logWarning(message: string, ...args: any[]): void {
  console.warn(formatMessage(WarningLevel.WARNING, message), ...args);
}

/**
 * Log error message
 */
export function logError(message: string, ...args: any[]): void {
  console.error(formatMessage(WarningLevel.ERROR, message), ...args);
}

/**
 * Log success message
 */
export function logSuccess(message: string, ...args: any[]): void {
  console.log(formatMessage(WarningLevel.SUCCESS, message), ...args);
}

/**
 * Log migration message
 */
export function logMigration(message: string, ...args: any[]): void {
  console.warn(formatMessage(WarningLevel.MIGRATION, message), ...args);
}

/**
 * Log migration message with stack trace
 */
export function logMigrationWithTrace(message: string, error?: Error): void {
  console.warn(formatMessage(WarningLevel.MIGRATION, message));
  if (error?.stack) {
    console.warn(`${styles.gray}Stack trace:`, error.stack);
  }
}

// ============================================================================
// SPECIALIZED LOGGING FUNCTIONS
// ============================================================================

/**
 * Log component deprecation warning
 */
export function logComponentDeprecation(legacyName: string, newName: string, context: string): void {
  logMigration(
    `⚠️  COMPONENT DEPRECATION: ${legacyName}\n` +
    `→ Replace with: ${newName}\n` +
    `Context: ${context}\n` +
    `Please update your imports to use the new unified Kair0s components.`
  );
}

/**
 * Log path migration warning
 */
export function logPathMigration(legacyPath: string, newPath: string, context: string): void {
  logMigration(
    `⚠️  PATH MIGRATION: ${legacyPath}\n` +
    `→ Replace with: ${newPath}\n` +
    `Context: ${context}\n` +
    `Please update your routing to use the new unified Kair0s paths.`
  );
}

/**
 * Log event migration warning
 */
export function logEventMigration(legacyEvent: string, newEvent: string, context: string): void {
  logMigration(
    `⚠️  EVENT MIGRATION: ${legacyEvent}\n` +
    `→ Replace with: ${newEvent}\n` +
    `Context: ${context}\n` +
    `Please update your event handling to use the new unified Kair0s events.`
  );
}

/**
 * Log config migration warning
 */
export function logConfigMigration(legacyConfig: string, newConfig: string, context: string): void {
  logMigration(
    `⚠️  CONFIG MIGRATION: ${legacyConfig}\n` +
    `→ Replace with: ${newConfig}\n` +
    `Context: ${context}\n` +
    `Please update your configuration to use the new unified Kair0s config.`
  );
}

/**
 * Log successful migration
 */
export function logSuccessfulMigration(from: string, to: string, context: string): void {
  logSuccess(
    `✅ MIGRATION SUCCESS: ${from} → ${to}\n` +
    `Context: ${context}\n` +
    `Legacy code successfully migrated to unified Kair0s components.`
  );
}

/**
 * Log migration summary
 */
export function logMigrationSummary(results: {
  components: number;
  paths: number;
  events: number;
  configs: number;
  total: number;
}): void {
  const totalMigrated = results.components + results.paths + results.events + results.configs;
  const totalLegacy = results.total;
  
  logInfo(
    `📊 MIGRATION SUMMARY:\n` +
    `Components migrated: ${results.components}/${totalLegacy}\n` +
    `Paths migrated: ${results.paths}/${totalLegacy}\n` +
    `Events migrated: ${results.events}/${totalLegacy}\n` +
    `Configs migrated: ${results.configs}/${totalLegacy}\n` +
    `Total items: ${totalMigrated}/${totalLegacy}\n` +
    `Migration progress: ${Math.round((totalMigrated / totalLegacy) * 100)}%`
  );
}

/**
 * Log legacy usage detection
 */
export function logLegacyDetection(findings: Array<{
  type: string;
  legacy: string;
  line: number;
  suggestion: string;
  }>): void {
  if (findings.length === 0) {
    logSuccess('✅ No legacy usage detected in codebase scan');
    return;
  }
  
  logWarning(
    `⚠️  LEGACY USAGE DETECTED:\n` +
    `Found ${findings.length} legacy references that need migration:\n` +
    findings.map(f => `  ${f.type}: ${f.legacy} (line ${f.line}) - ${f.suggestion}`).join('\n')
  );
}

// ============================================================================
// DEVELOPMENT ENVIRONMENT CHECKS
// ============================================================================

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if migration warnings are enabled
 */
export function areMigrationWarningsEnabled(): boolean {
  return process.env.ENABLE_MIGRATION_WARNINGS !== 'false';
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Log error with context and optional stack trace
 */
export function logErrorWithContext(error: Error, context?: string): void {
  const message = context ? `${context}: ${error.message}` : error.message;
  logError(message);
  
  if (error.stack && isDevelopment()) {
    console.error(`${styles.gray}Stack trace:`, error.stack);
  }
}

/**
 * Log migration error
 */
export function logMigrationError(error: Error, context?: string): void {
  const message = context ? `Migration error in ${context}: ${error.message}` : `Migration error: ${error.message}`;
  logError(message);
  
  if (error.stack && isDevelopment()) {
    console.error(`${styles.gray}Stack trace:`, error.stack);
  }
}
