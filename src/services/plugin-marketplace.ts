/**
 * Kair0s Plugin Marketplace
 * 
 * Comprehensive plugin marketplace system including plugin discovery,
 * installation, management, validation, and community features.
 */

// Simple browser-compatible event emitter
class SimpleEventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'productivity' | 'development' | 'communication' | 'utility' | 'integration' | 'ai' | 'automation';
  tags: string[];
  homepage?: string;
  repository?: string;
  license: string;
  price: {
    type: 'free' | 'paid' | 'freemium' | 'subscription';
    amount?: number;
    currency?: string;
  };
  compatibility: {
    kair0sVersion: string;
    minVersion: string;
    maxVersion?: string;
    dependencies: string[];
  };
  features: PluginFeature[];
  installation: {
    type: 'npm' | 'manual' | 'git' | 'download';
    command?: string;
    script?: string;
    size?: number;
  };
  validation: {
    status: 'pending' | 'validating' | 'approved' | 'rejected';
    score: number;
    issues: string[];
    lastValidated?: number;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
    activeInstalls: number;
    lastUpdated: number;
  };
}

export interface PluginFeature {
  id: string;
  name: string;
  description: string;
  type: 'action' | 'component' | 'service' | 'integration' | 'theme';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface PluginInstallation {
  id: string;
  pluginId: string;
  version: string;
  status: 'downloading' | 'installing' | 'installed' | 'failed' | 'uninstalling' | 'uninstalled';
  progress: number;
  error?: string;
  installedAt?: number;
  updatedAt?: number;
}

export interface MarketplaceConfig {
  registryUrl: string;
  validationRules: {
    maxFileSize: number;
    allowedLicenses: string[];
    requiredFields: string[];
    securityScan: boolean;
    codeReview: boolean;
  };
  features: {
    allowCommunityPlugins: boolean;
    autoUpdate: boolean;
    analytics: boolean;
    reviews: boolean;
    categories: string[];
  };
}

export interface MarketplaceStats {
  totalPlugins: number;
  activePlugins: number;
  totalDownloads: number;
  averageRating: number;
  topCategories: Array<{
    category: string;
    count: number;
    downloads: number;
  }>;
  recentActivity: Array<{
    type: 'install' | 'uninstall' | 'review' | 'update';
    pluginId: string;
    timestamp: number;
  }>;
};

// ============================================================================
// PLUGIN MARKETPLACE CLASS
// ============================================================================

export class PluginMarketplace extends SimpleEventEmitter {
  private plugins: Map<string, Plugin> = new Map();
  private installations: Map<string, PluginInstallation> = new Map();
  private config: MarketplaceConfig;
  private stats: MarketplaceStats;
  private validationQueue: string[] = [];

  constructor(config?: Partial<MarketplaceConfig>) {
    super();
    
    this.config = {
      registryUrl: 'https://registry.kair0s.com',
      validationRules: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedLicenses: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause'],
        requiredFields: ['id', 'name', 'version', 'description', 'author'],
        securityScan: true,
        codeReview: true
      },
      features: {
        allowCommunityPlugins: true,
        autoUpdate: true,
        analytics: true,
        reviews: true,
        categories: ['productivity', 'development', 'communication', 'utility', 'integration', 'ai', 'automation']
      },
      ...config
    };

    this.stats = {
      totalPlugins: 0,
      activePlugins: 0,
      totalDownloads: 0,
      averageRating: 0,
      topCategories: [],
      recentActivity: []
    };

    this.initialize();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initialize(): void {
    this.loadPlugins();
    this.loadInstallations();
    this.calculateStats();
    this.startPeriodicSync();
    
    this.emit('marketplace:initialized', {
      totalPlugins: this.stats.totalPlugins,
      config: this.config
    });
  }

  private loadPlugins(): void {
    // Load from local storage or registry
    const storedPlugins = localStorage.getItem('kair0s_marketplace_plugins');
    if (storedPlugins) {
      try {
        const plugins = JSON.parse(storedPlugins);
        plugins.forEach((plugin: Plugin) => {
          this.plugins.set(plugin.id, plugin);
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to load plugins from storage:', error.message);
        }
      }
    }
  }

  private loadInstallations(): void {
    const storedInstallations = localStorage.getItem('kair0s_marketplace_installations');
    if (storedInstallations) {
      try {
        const installations = JSON.parse(storedInstallations);
        installations.forEach((installation: PluginInstallation) => {
          this.installations.set(installation.id, installation);
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to load installations from storage:', error.message);
        }
      }
    }
  }

  private calculateStats(): void {
    const plugins = Array.from(this.plugins.values());
    
    this.stats.totalPlugins = plugins.length;
    this.stats.activePlugins = plugins.filter(p => 
      this.installations.has(p.id) && 
      this.installations.get(p.id)?.status === 'installed'
    ).length;
    
    this.stats.totalDownloads = plugins.reduce((sum, p) => sum + (p.stats?.downloads || 0), 0);
    this.stats.averageRating = plugins.reduce((sum, p) => sum + (p.stats?.rating || 0), 0) / plugins.length || 0;
    
    // Calculate top categories
    const categoryCount = new Map<string, number>();
    plugins.forEach(plugin => {
      const categories: string[] = ['productivity', 'development', 'communication', 'utility', 'integration', 'ai', 'automation'];
    categories.forEach(cat => {
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      });
    });
    
    this.stats.topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count, downloads: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private startPeriodicSync(): void {
    if (this.config.features.autoUpdate) {
      // Sync with registry every hour
      setInterval(() => {
        this.syncWithRegistry();
      }, 60 * 60 * 1000);
    }
  }

  // ============================================================================
  // PLUGIN DISCOVERY
  // ============================================================================

  public async searchPlugins(query: string, filters?: {
    category?: string;
    priceType?: Plugin['price']['type'];
    tags?: string[];
    author?: string;
    minRating?: number;
  }): Promise<Plugin[]> {
    const plugins = Array.from(this.plugins.values());
    
    return plugins.filter(plugin => {
      // Text search
      const matchesQuery = !query || 
        plugin.name.toLowerCase().includes(query.toLowerCase()) ||
        plugin.description.toLowerCase().includes(query.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      // Category filter
      const matchesCategory = !filters?.category || plugin.category === filters.category;
      
      // Price filter
      const matchesPrice = !filters?.priceType || plugin.price.type === filters.priceType;
      
      // Tags filter
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => plugin.tags.includes(tag));
      
      // Author filter
      const matchesAuthor = !filters?.author || 
        plugin.author.toLowerCase().includes(filters.author.toLowerCase());
      
      // Rating filter
      const matchesRating = !filters?.minRating || 
        (plugin.stats?.rating || 0) >= filters.minRating;
      
      return matchesQuery && matchesCategory && matchesPrice && matchesTags && matchesAuthor && matchesRating;
    });
  }

  public async getPluginById(id: string): Promise<Plugin | null> {
    return this.plugins.get(id) || null;
  }

  public async getPluginsByCategory(category: string): Promise<Plugin[]> {
    const plugins = Array.from(this.plugins.values());
    return plugins.filter(plugin => plugin.category === category);
  }

  public async getFeaturedPlugins(): Promise<Plugin[]> {
    const plugins = Array.from(this.plugins.values());
    return plugins.filter(plugin => 
      plugin.stats?.rating >= 4.5 && 
      plugin.stats?.downloads > 1000
    );
  }

  public async getPopularPlugins(): Promise<Plugin[]> {
    const plugins = Array.from(this.plugins.values());
    return plugins
      .sort((a, b) => (b.stats?.downloads || 0) - (a.stats?.downloads || 0))
      .slice(0, 10);
  }

  // ============================================================================
  // PLUGIN INSTALLATION
  // ============================================================================

  public async installPlugin(pluginId: string, version?: string): Promise<PluginInstallation> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const installationId = `install_${pluginId}_${Date.now()}`;
    const installation: PluginInstallation = {
      id: installationId,
      pluginId,
      version: version || plugin.version,
      status: 'downloading',
      progress: 0,
      installedAt: Date.now()
    };

    this.installations.set(installationId, installation);
    this.saveInstallations();
    
    this.emit('installation:started', installation);

    try {
      // Validate plugin
      const validation = await this.validatePlugin(plugin);
      if (validation.status === 'rejected') {
        throw new Error(`Plugin validation failed: ${validation.issues.join(', ')}`);
      }

      // Download plugin
      installation.status = 'downloading';
      installation.progress = 10;
      this.saveInstallations();
      
      const downloadUrl = this.getDownloadUrl(plugin, version);
      await this.downloadPlugin(downloadUrl, installationId);
      
      // Install plugin
      installation.status = 'installing';
      installation.progress = 50;
      this.saveInstallations();
      
      await this.installPluginFiles(plugin, installationId);
      
      // Complete installation
      installation.status = 'installed';
      installation.progress = 100;
      installation.updatedAt = Date.now();
      
      this.installations.set(installationId, installation);
      this.saveInstallations();
      
      // Update plugin stats
      const updatedPlugin = { ...plugin };
      if (!updatedPlugin.stats) {
        updatedPlugin.stats = {
          downloads: 0,
          rating: 0,
          reviews: 0,
          activeInstalls: 0,
          lastUpdated: Date.now()
        };
      }
      updatedPlugin.stats.downloads = (updatedPlugin.stats.downloads || 0) + 1;
      updatedPlugin.stats.lastUpdated = Date.now();
      this.plugins.set(pluginId, updatedPlugin);
      this.savePlugins();
      this.calculateStats();
      
      this.emit('plugin:installed', { plugin: updatedPlugin, installation });
      
      return installation;
    } catch (error) {
      const failedInstallation: PluginInstallation = {
        ...installation,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.installations.set(installationId, failedInstallation);
      this.saveInstallations();
      
      this.emit('installation:failed', { plugin, installation: failedInstallation, error });
      
      throw error;
    }
  }

  public async uninstallPlugin(pluginId: string): Promise<void> {
    const installation = Array.from(this.installations.values())
      .find(inst => inst.pluginId === pluginId && inst.status === 'installed');
    
    if (!installation) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    try {
      installation.status = 'uninstalling';
      this.saveInstallations();
      this.emit('uninstallation:started', { pluginId, installation });
      
      // Remove plugin files
      await this.removePluginFiles(installation);
      
      // Update installation status
      installation.status = 'uninstalled';
      installation.updatedAt = Date.now();
      this.installations.set(installation.id, installation);
      this.saveInstallations();
      
      this.emit('plugin:uninstalled', { pluginId });
      
      // Remove from installations
      this.installations.delete(installation.id);
      this.saveInstallations();
      
    } catch (error) {
      const failedInstallation: PluginInstallation = {
        ...installation,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.installations.set(installation.id, failedInstallation);
      this.saveInstallations();
      
      this.emit('uninstallation:failed', { pluginId, error });
      
      throw error;
    }
  }

  public async updatePlugin(pluginId: string): Promise<Plugin> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      // Check for updates
      const latestVersion = await this.getLatestVersion(pluginId);
      if (latestVersion && latestVersion !== plugin.version) {
        // Update plugin
        const updatedPlugin = { ...plugin, version: latestVersion };
        this.plugins.set(pluginId, updatedPlugin);
        this.savePlugins();
        
        this.emit('plugin:updated', { plugin: updatedPlugin });
        
        return updatedPlugin;
      }
      
      return plugin;
    } catch (error) {
      this.emit('plugin:update-failed', { pluginId, error });
      throw error;
    }
  }

  // ============================================================================
  // PLUGIN VALIDATION
  // ============================================================================

  public async validatePlugin(plugin: Plugin): Promise<{
    status: Plugin['validation']['status'];
    score: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let score = 100;

    // Required fields validation
    this.config.validationRules.requiredFields.forEach(field => {
      if (!plugin[field as keyof Plugin]) {
        issues.push(`Missing required field: ${field}`);
        score -= 20;
      }
    });

    // License validation
    if (!this.config.validationRules.allowedLicenses.includes(plugin.license)) {
      issues.push(`Invalid license: ${plugin.license}`);
      score -= 30;
    }

    // File size validation
    if (plugin.installation?.size && 
        plugin.installation.size > this.config.validationRules.maxFileSize) {
      issues.push(`Plugin size exceeds limit of ${this.config.validationRules.maxFileSize / 1024 / 1024}MB`);
      score -= 25;
    }

    // Security scan
    if (this.config.validationRules.securityScan) {
      const securityIssues = await this.performSecurityScan(plugin);
      issues.push(...securityIssues);
      score -= securityIssues.length * 10;
    }

    // Code review
    if (this.config.validationRules.codeReview) {
      const codeIssues = await this.performCodeReview(plugin);
      issues.push(...codeIssues);
      score -= codeIssues.length * 15;
    }

    const status = score >= 70 ? 'approved' : score >= 40 ? 'validating' : 'rejected';
    
    const validation: Plugin['validation'] = {
      status: status || 'pending',
      score,
      issues,
      lastValidated: Date.now()
    };

    // Update plugin validation status
    const updatedPlugin = { ...plugin, validation };
    this.plugins.set(plugin.id, updatedPlugin);
    this.savePlugins();
    
    return validation;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getDownloadUrl(plugin: Plugin, version?: string): string {
    if (plugin.installation?.type === 'git') {
      return plugin.repository || '';
    }
    
    if (plugin.installation?.type === 'npm') {
      return `https://registry.npmjs.org/${plugin.name}`;
    }
    
    return plugin.homepage || '';
  }

  private async downloadPlugin(url: string, installationId: string): Promise<void> {
    // Simulate download
    const installation = this.installations.get(installationId)!;
    
    try {
      // In real implementation, this would download the plugin file
      installation.status = 'downloading';
      installation.progress = 30;
      this.saveInstallations();
      
      // Simulate download progress
      for (let progress = 30; progress <= 90; progress += 10) {
        installation.progress = progress;
        this.saveInstallations();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      installation.progress = 90;
      this.saveInstallations();
      
      // Simulate final download
      await new Promise(resolve => setTimeout(resolve, 200));
      
      installation.progress = 100;
      this.saveInstallations();
      
    } catch (error) {
      installation.status = 'failed';
      installation.error = error instanceof Error ? error.message : String(error);
      this.saveInstallations();
      throw error;
    }
  }

  private async installPluginFiles(plugin: Plugin, installationId: string): Promise<void> {
    const installation = this.installations.get(installationId)!;
    
    try {
      installation.status = 'installing';
      installation.progress = 60;
      this.saveInstallations();
      
      // Simulate installation
      for (let progress = 60; progress <= 90; progress += 10) {
        installation.progress = progress;
        this.saveInstallations();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      installation.progress = 90;
      this.saveInstallations();
      
      // Simulate final installation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      installation.progress = 100;
      this.saveInstallations();
      
    } catch (error) {
      installation.status = 'failed';
      installation.error = error instanceof Error ? error.message : String(error);
      this.saveInstallations();
      throw error;
    }
  }

  private async removePluginFiles(installation: PluginInstallation): Promise<void> {
    // Simulate file removal
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async performSecurityScan(plugin: Plugin): Promise<string[]> {
    const issues: string[] = [];
    
    // Check for common security issues
    if (plugin.installation?.script?.includes('eval(')) {
      issues.push('Potentially unsafe code execution detected');
    }
    
    if (plugin.installation?.command?.includes('rm -rf /')) {
      issues.push('Potentially destructive command detected');
    }
    
    if (plugin.repository?.includes('http://') && !plugin.repository?.startsWith('https://')) {
      issues.push('Insecure repository URL detected');
    }
    
    return issues;
  }

  private async performCodeReview(plugin: Plugin): Promise<string[]> {
    const issues: string[] = [];
    
    // Check for common code quality issues
    if (plugin.description.length < 10) {
      issues.push('Description too short');
    }
    
    if (plugin.author.length < 2) {
      issues.push('Author name too short');
    }
    
    // Check for common vulnerabilities
    const vulnerablePatterns = [
      /eval\s*\(/i,
      /document\.write\s*\(/i,
      /innerHTML\s*=/i,
      /outerHTML\s*=/i,
      /Function\s*\(/i
    ];
    
    if (plugin.installation?.script) {
      const script = plugin.installation.script;
      vulnerablePatterns.forEach(pattern => {
        if (pattern.test(script)) {
          issues.push('Potentially vulnerable code pattern detected');
        }
      });
    }
    
    return issues;
  }

  private async getLatestVersion(pluginId: string): Promise<string | null> {
    // In real implementation, this would check the registry for the latest version
    // For now, return null
    return null;
  }

  private async syncWithRegistry(): Promise<void> {
    try {
      // In real implementation, this would sync with the plugin registry
      // For now, just emit an event
      this.emit('registry:synced', {
        timestamp: Date.now()
      });
    } catch (error) {
      this.emit('registry:sync-failed', { error });
    }
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  private savePlugins(): void {
    const plugins = Array.from(this.plugins.values());
    localStorage.setItem('kair0s_marketplace_plugins', JSON.stringify(plugins));
  }

  private saveInstallations(): void {
    const installations = Array.from(this.installations.values());
    localStorage.setItem('kair0s_marketplace_installations', JSON.stringify(installations));
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public getInstallations(): PluginInstallation[] {
    return Array.from(this.installations.values());
  }

  public getStats(): MarketplaceStats {
    return { ...this.stats };
  }

  public getConfig(): MarketplaceConfig {
    return { ...this.config };
  }

  public async refreshPlugins(): Promise<void> {
    await this.syncWithRegistry();
    await this.loadPlugins();
  }

  public async submitPlugin(pluginData: Partial<Plugin>): Promise<Plugin> {
    const plugin: Plugin = {
      id: `plugin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: pluginData.name || 'Untitled Plugin',
      version: pluginData.version || '1.0.0',
      description: pluginData.description || '',
      author: pluginData.author || 'Anonymous',
      category: pluginData.category || 'utility',
      tags: pluginData.tags || [],
      license: pluginData.license || 'MIT',
      price: pluginData.price || { type: 'free' },
      compatibility: {
        kair0sVersion: '1.0.0',
        minVersion: '1.0.0',
        dependencies: [],
        ...pluginData.compatibility
      },
      features: pluginData.features || [],
      installation: {
        type: 'npm',
        command: 'npm install ' + (pluginData.name || ''),
        size: 0
      },
      validation: {
        status: 'pending',
        score: 0,
        issues: [],
        lastValidated: Date.now()
      },
      stats: {
        downloads: 0,
        rating: 0,
        reviews: 0,
        activeInstalls: 0,
        lastUpdated: Date.now()
      }
    };

    // Add to validation queue
    this.validationQueue.push(plugin.id);
    
    // Process validation queue
    while (this.validationQueue.length > 0) {
      const pluginId = this.validationQueue.shift()!;
      const plugin = this.plugins.get(pluginId);
      if (plugin) {
        await this.validatePlugin(plugin);
      }
    }

    this.plugins.set(plugin.id, plugin);
    this.savePlugins();
    
    this.emit('plugin:submitted', { plugin });
    
    return plugin;
  }

  public async getPluginReviews(pluginId: string): Promise<Array<{
      id: string;
      author: string;
      rating: number;
      comment: string;
      timestamp: number;
      helpful: number;
    }>> {
    // In real implementation, this would fetch reviews from the registry
    // For now, return empty array
    return [];
  }

  public async addPluginReview(pluginId: string, review: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    helpful: number;
  }): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // In real implementation, this would submit the review to the registry
    // For now, just emit an event
    this.emit('review:submitted', { pluginId, review });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const pluginMarketplace = new PluginMarketplace();

// ============================================================================
// EXPORTS
// ============================================================================

export default PluginMarketplace;
