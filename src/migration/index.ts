/**
 * Kair0s Migration System
 * 
 * Central migration coordinator that hides legacy complexity from users
 * while providing developer tools for smooth transition.
 */

import { 
  scanForLegacyUsage,
  getMigrationStats,
  logMigrationSummary,
  logSuccessfulMigration,
  logLegacyDetection,
  isDevelopment,
  areMigrationWarningsEnabled,
} from './legacy-aliases.js';
import { 
  INTERNAL_MIGRATION_SHIMS,
  getNewComponentName,
  getNewPath,
  getNewEventName,
  checkLegacyImport,
} from './legacy-shims.js';
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

// ============================================================================
// MIGRATION TYPES
// ============================================================================

export interface MigrationItem {
  type: 'component' | 'path' | 'event' | 'config';
  legacy: string;
  new: string;
  filePath: string;
  lineNumber: number;
  context: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

export interface MigrationPlan {
  items: MigrationItem[];
  totalItems: number;
  estimatedTime: number; // minutes
  priority: 'high' | 'medium' | 'low';
}

export interface MigrationResult {
  plan: MigrationPlan;
  results: {
    completed: MigrationItem[];
    failed: MigrationItem[];
    skipped: MigrationItem[];
  };
  summary: {
    totalItems: number;
    completedItems: number;
    failedItems: number;
    skippedItems: number;
    timeSpent: number;
    timeSaved: number; // minutes saved by using new components
  };
}

// ============================================================================
// MIGRATION SCANNER
// ============================================================================

export class MigrationScanner {
  private scannedFiles: string[] = [];
  private migrationItems: MigrationItem[] = [];

  /**
   * Scan a single file for legacy usage
   */
  async scanFile(filePath: string): Promise<MigrationItem[]> {
    try {
      const response = await fetch(`file://${filePath}`);
      const content = await response.text();
      return scanForLegacyUsage(content);
    } catch (error) {
      console.error(`Failed to scan file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Scan directory for legacy usage
   */
  async scanDirectory(dirPath: string, extensions: string[] = ['.ts', '.tsx', '.js', '.jsx']): Promise<MigrationItem[]> {
    try {
      const response = await fetch(`file://${dirPath}`);
      const files = await response.json();
      
      const allItems: MigrationItem[] = [];
      
      for (const file of files) {
        if (extensions.some(ext => file.name.endsWith(ext))) {
          const items = await this.scanFile(`${dirPath}/${file.name}`);
          allItems.push(...items);
        }
      }
      
      return allItems;
    } catch (error) {
      console.error(`Failed to scan directory ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * Scan entire codebase for legacy usage
   */
  async scanCodebase(rootPath: string): Promise<MigrationPlan> {
    if (isDevelopment()) {
      console.log('🔍 Scanning codebase for legacy usage...');
    }

    const directories = [
      `${rootPath}/src`,
      `${rootPath}/src/components`,
      `${rootPath}/src/hooks`,
      `${rootPath}/src/pages`,
      `${rootPath}/src/services`,
      `${rootPath}/src/utils`,
    ];

    const allItems: MigrationItem[] = [];
    
    for (const dir of directories) {
      const items = await this.scanDirectory(dir);
      allItems.push(...items);
    }

    // Remove duplicates and sort by priority
    const uniqueItems = Array.from(
      new Map(allItems.map(item => [item.legacy, item]).values())
    ).map(([legacy, items]) => ({
      type: items[0].type,
      legacy,
      new: getNewComponentName(legacy) || getNewPath(legacy) || getNewEventName(legacy),
      filePath: items[0].filePath,
      lineNumber: items[0].lineNumber,
      context: items[0].context,
      status: 'pending',
    }));

    // Prioritize migration items
    const prioritizedItems = this.prioritizeItems(uniqueItems);
    
    return {
      items: prioritizedItems,
      totalItems: prioritizedItems.length,
      estimatedTime: this.estimateMigrationTime(prioritizedItems),
      priority: this.calculatePriority(prioritizedItems),
    };
  }

  /**
   * Prioritize migration items based on impact and complexity
   */
  private prioritizeItems(items: MigrationItem[]): MigrationItem[] {
    const priorityOrder = {
      'component': 1,
      'path': 2,
      'event': 3,
      'config': 4,
    };

    return items.sort((a, b) => {
      const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
      if (priorityDiff !== 0) return priorityDiff;
      if (priorityDiff === 0) return 0; // keep original order for same priority
      return -priorityDiff;
    });
  }

  /**
   * Estimate migration time based on item count and complexity
   */
  private estimateMigrationTime(items: MigrationItem[]): number {
    const complexityMultiplier = {
      'component': 2,
      'path': 1,
      'event': 1,
      'config': 3,
    };

    const totalComplexity = items.reduce((sum, item) => 
      sum + (complexMultiplier[item.type] || 1), 0
    );

    // Rough estimate: 5 minutes per complexity unit
    return Math.ceil(totalComplexity / 10);
  }

  /**
   * Calculate overall migration priority
   */
  private calculatePriority(items: MigrationItem[]): 'high' | 'medium' | 'low' {
    const highPriorityItems = items.filter(item => item.type === 'component');
    const mediumPriorityItems = items.filter(item => item.type === 'path' || item.type === 'config');
    
    if (highPriorityItems.length > 0) return 'high';
    if (mediumPriorityItems.length > 3) return 'medium';
    return 'low';
  }
}

// ============================================================================
// MIGRATION EXECUTOR
// ============================================================================

export class MigrationExecutor {
  private currentMigration: MigrationPlan | null = null;
  private results: {
    completed: MigrationItem[];
    failed: MigrationItem[];
    skipped: MigrationItem[];
  };

  /**
   * Execute migration plan
   */
  async executeMigration(plan: MigrationPlan): Promise<MigrationResult> {
    this.currentMigration = plan;
    this.results = { completed: [], failed: [], skipped: [] };

    if (isDevelopment()) {
      console.log(`🚀 Starting migration of ${plan.totalItems} items (estimated ${plan.estimatedTime} minutes)`);
    }

    const startTime = Date.now();

    for (const item of plan.items) {
      try {
        await this.migrateItem(item);
        this.results.completed.push(item);
      } catch (error) {
        this.results.failed.push({
          ...item,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 60000); // Convert to minutes

    const result: MigrationResult = {
      plan,
      results: this.results,
      summary: {
        totalItems: plan.totalItems,
        completedItems: this.results.completed.length,
        failedItems: this.results.failed.length,
        skippedItems: this.results.skipped.length,
        timeSpent,
        timeSaved: plan.estimatedTime - timeSpent, // Rough estimate
      },
    };

    if (isDevelopment()) {
      logMigrationSummary(result.summary);
    }

    this.currentMigration = null;
    return result;
  }

  /**
   * Migrate a single item
   */
  private async migrateItem(item: MigrationItem): Promise<void> {
    const { type, legacy, new: newName, filePath, lineNumber, context } = item;

    switch (type) {
      case 'component':
        await this.migrateComponent(legacy, newName, filePath, lineNumber, context);
        break;
      case 'path':
        await this.migratePath(legacy, newName, filePath, lineNumber, context);
        break;
      case 'event':
        await this.migrateEvent(legacy, newName, filePath, lineNumber, context);
        break;
      case 'config':
        await this.migrateConfig(legacy, newName, filePath, lineNumber, context);
        break;
      default:
        logWarning(`Unknown migration item type: ${type}`);
    }
  }

  /**
   * Migrate component import
   */
  private async migrateComponent(legacyName: string, newName: string, filePath: string, lineNumber: number, context: string): Promise<void> {
    const fileContent = await this.readFile(filePath);
    const updatedContent = this.replaceComponentImport(fileContent, legacyName, newName, lineNumber);
    await this.writeFile(filePath, updatedContent);
    
    logSuccessfulMigration(legacyName, newName, `Component import in ${context}`);
  }

  /**
   * Migrate path usage
   */
  private async migratePath(legacyPath: string, newPath: string, filePath: string, lineNumber: number, context: string): Promise<void> {
    const fileContent = await this.readFile(filePath);
    const updatedContent = this.replacePathUsage(fileContent, legacyPath, newPath, lineNumber);
    await this.writeFile(filePath, updatedContent);
    
    logSuccessfulMigration(legacyPath, newPath, `Path usage in ${context}`);
  }

  /**
   * Migrate event usage
   */
  private async migrateEvent(legacyEvent: string, newEvent: string, filePath: string, lineNumber: number, context: string): Promise<void> {
    const fileContent = await this.readFile(filePath);
    const updatedContent = this.replaceEventUsage(fileContent, legacyEvent, newEvent, lineNumber);
    await this.writeFile(filePath, updatedContent);
    
    logSuccessfulMigration(legacyEvent, newEvent, `Event usage in ${context}`);
  }

  /**
   * Migrate config usage
   */
  private async migrateConfig(legacyConfig: string, newConfig: string, filePath: string, lineNumber: number, context: string): Promise<void> {
    const fileContent = await this.readFile(filePath);
    const updatedContent = this.replaceConfigUsage(fileContent, legacyConfig, newConfig, lineNumber);
    await this.writeFile(filePath, updatedContent);
    
    logSuccessfulMigration(legacyConfig, newConfig, `Config usage in ${context}`);
  }

  /**
   * Replace component import in file content
   */
  private replaceComponentImport(content: string, legacyName: string, newName: string, lineNumber: number): string {
    const importRegex = new RegExp(`import\\s+${legacyName}\\s+from\\s+['"][^']+['"]`, 'g');
    const replacement = `import ${newName} from`;
    
    return content.replace(importRegex, replacement);
  }

  /**
   * Replace path usage in file content
   */
  private replacePathUsage(content: string, legacyPath: string, newPath: string, lineNumber: number): string {
    const pathRegex = new RegExp(legacyPath.replace(/[.*\/]/g, '\\/'), 'g');
    return content.replace(pathRegex, newPath);
  }

  /**
   * Replace event usage in file content
   */
  private replaceEventUsage(content: string, legacyEvent: string, newEvent: string, lineNumber: number): string {
    const eventRegex = new RegExp(legacyEvent.replace(/[.*\/]/g, '\\/'), 'g');
    return content.replace(eventRegex, newEvent);
  }

  /**
   * Replace config usage in file content
   */
  private replaceConfigUsage(content: string, legacyConfig: string, newConfig: string, lineNumber: number): string {
    const configRegex = new RegExp(legacyConfig.replace(/[.*\/]/g, '\\/'), 'g');
    return content.replace(configRegex, newConfig);
  }

  /**
   * Read file content
   */
  private async readFile(filePath: string): Promise<string> {
    const response = await fetch(`file://${filePath}`);
    return await response.text();
  }

  /**
   * Write file content
   */
  private async writeFile(filePath: string, content: string): Promise<void> {
    const response = await fetch(`file://${filePath}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: content,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to write file ${filePath}: ${response.statusText}`);
    }
  }

  /**
   * Get current migration status
   */
  getCurrentMigration(): MigrationPlan | null {
    return this.currentMigration;
  }
}

// ============================================================================
// MIGRATION COORDINATOR
// ============================================================================

export class MigrationCoordinator {
  private scanner: MigrationScanner;
  private executor: MigrationExecutor;

  constructor() {
    this.scanner = new MigrationScanner();
    this.executor = new MigrationExecutor();
  }

  /**
   * Plan and execute migration
   */
  async runMigration(rootPath: string): Promise<MigrationResult> {
    if (isDevelopment()) {
      console.log('🚀 Starting Kair0s migration process...');
    }

    // Scan for legacy usage
    const plan = await this.scanner.scanCodebase(rootPath);
    
    if (plan.items.length === 0) {
      logLegacyDetection([]);
      return {
        plan,
        results: {
          completed: [],
          failed: [],
          skipped: [],
        },
        summary: {
          totalItems: 0,
          completedItems: 0,
          failedItems: 0,
          skippedItems: 0,
          timeSpent: 0,
          timeSaved: 0,
        },
      };
    }

    // Execute migration
    const result = await this.executor.executeMigration(plan);
    
    return result;
  }

  /**
   * Get migration statistics
   */
  getMigrationStats() {
    return getMigrationStats();
  }

  /**
   * Clear migration warnings cache
   */
  clearWarnings(): void {
    INTERNAL_MIGRATION_SHIMS.clearWarnings();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MigrationScanner,
  MigrationExecutor,
  MigrationCoordinator,
  INTERNAL_MIGRATION_SHIMS,
  MigrationItem,
  MigrationPlan,
  MigrationResult,
};
