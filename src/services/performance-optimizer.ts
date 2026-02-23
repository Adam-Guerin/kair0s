/**
 * Kair0s Performance Optimizer
 * 
 * Advanced performance optimization service including lazy loading,
 * intelligent caching, bundle optimization, and resource management.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkRequests: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  enabled: boolean;
  placeholder?: string;
}

export interface BundleOptimization {
  codeSplitting: boolean;
  treeShaking: boolean;
  minification: boolean;
  compression: boolean;
  lazyLoading: boolean;
}

export interface ResourceOptimization {
  imageOptimization: boolean;
  fontOptimization: boolean;
  cssOptimization: boolean;
  jsOptimization: boolean;
}

// ============================================================================
// PERFORMANCE OPTIMIZER CLASS
// ============================================================================

export class PerformanceOptimizer {
  private cache: Map<string, CacheEntry> = new Map();
  private metrics: PerformanceMetrics;
  private observers: IntersectionObserver[] = [];
  private lazyElements: Set<HTMLElement> = new Set();
  private performanceEntries: PerformanceEntry[] = [];
  private config: {
    cache: {
      maxSize: number;
      ttl: number;
      cleanupInterval: number;
    };
    lazyLoad: LazyLoadConfig;
    bundle: BundleOptimization;
    resources: ResourceOptimization;
  };

  constructor() {
    this.metrics = {
      bundleSize: 0,
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      networkRequests: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0
    };

    this.config = {
      cache: {
        maxSize: 50 * 1024 * 1024, // 50MB
        ttl: 30 * 60 * 1000, // 30 minutes
        cleanupInterval: 5 * 60 * 1000 // 5 minutes
      },
      lazyLoad: {
        threshold: 0.1,
        rootMargin: '50px',
        enabled: true,
        placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSIjZGRkIj48L3N2Zz4='
      },
      bundle: {
        codeSplitting: true,
        treeShaking: true,
        minification: true,
        compression: true,
        lazyLoading: true
      },
      resources: {
        imageOptimization: true,
        fontOptimization: true,
        cssOptimization: true,
        jsOptimization: true
      }
    };

    this.initialize();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initialize(): void {
    this.setupPerformanceMonitoring();
    this.setupCacheCleanup();
    this.setupLazyLoading();
    this.setupResourceOptimization();
    this.measureInitialPerformance();
  }

  private setupPerformanceMonitoring(): void {
    // Monitor performance entries
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.performanceEntries.push(entry);
          this.processPerformanceEntry(entry);
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'layout-shift'] });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
      }, 5000);
    }

    // Monitor network requests
    this.interceptNetworkRequests();
  }

  private setupCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
      this.optimizeCacheSize();
    }, this.config.cache.cleanupInterval);
  }

  private setupLazyLoading(): void {
    if (!this.config.lazyLoad.enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadLazyElement(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: this.config.lazyLoad.threshold,
        rootMargin: this.config.lazyLoad.rootMargin
      }
    );

    this.observers.push(observer);
  }

  private setupResourceOptimization(): void {
    // Optimize images
    if (this.config.resources.imageOptimization) {
      this.optimizeImages();
    }

    // Optimize fonts
    if (this.config.resources.fontOptimization) {
      this.optimizeFonts();
    }

    // Optimize CSS
    if (this.config.resources.cssOptimization) {
      this.optimizeCSS();
    }

    // Optimize JavaScript
    if (this.config.resources.jsOptimization) {
      this.optimizeJavaScript();
    }
  }

  private measureInitialPerformance(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        this.metrics.firstContentfulPaint = this.getMetricByName('first-contentful-paint')?.startTime || 0;
        this.metrics.largestContentfulPaint = this.getMetricByName('largest-contentful-paint')?.startTime || 0;
      }
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  public setCache<T>(key: string, value: T, ttl?: number): void {
    const size = this.calculateSize(value);
    const expiresAt = Date.now() + (ttl || this.config.cache.ttl);

    // Check if we need to make space
    if (this.getCacheSize() + size > this.config.cache.maxSize) {
      this.evictLeastUsedEntries(size);
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt,
      accessCount: 0,
      lastAccessed: Date.now(),
      size
    };

    this.cache.set(key, entry);
  }

  public getCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  public deleteCache(key: string): boolean {
    return this.cache.delete(key);
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): {
    size: number;
    entries: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const size = entries.reduce((total, entry) => total + entry.size, 0);
    const totalAccesses = entries.reduce((total, entry) => total + entry.accessCount, 0);
    const hitRate = totalAccesses > 0 ? (entries.filter(e => e.accessCount > 0).length / entries.length) * 100 : 0;

    return {
      size,
      entries: entries.length,
      hitRate,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    };
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private optimizeCacheSize(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (LRU)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    let currentSize = this.getCacheSize();
    const targetSize = this.config.cache.maxSize * 0.8; // Keep at 80% capacity
    
    for (const [key, entry] of entries) {
      if (currentSize <= targetSize) break;
      
      this.cache.delete(key);
      currentSize -= entry.size;
    }
  }

  private evictLeastUsedEntries(requiredSize: number): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access frequency and recency
    entries.sort((a, b) => {
      const scoreA = a[1].accessCount / (Date.now() - a[1].lastAccessed);
      const scoreB = b[1].accessCount / (Date.now() - b[1].lastAccessed);
      return scoreA - scoreB;
    });

    let freedSize = 0;
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      freedSize += entry.size;
      if (freedSize >= requiredSize) break;
    }
  }

  private getCacheSize(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
  }

  private calculateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    } else if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    } else {
      return 8; // Primitive types
    }
  }

  // ============================================================================
  // LAZY LOADING
  // ============================================================================

  public observeLazyElement(element: HTMLElement): void {
    if (!this.config.lazyLoad.enabled) return;

    this.lazyElements.add(element);
    
    // Add placeholder if needed
    if (this.config.lazyLoad.placeholder && element.tagName === 'IMG') {
      (element as HTMLImageElement).src = this.config.lazyLoad.placeholder;
    }

    // Start observing
    if (this.observers.length > 0) {
      this.observers[0].observe(element);
    }
  }

  public unobserveLazyElement(element: HTMLElement): void {
    this.lazyElements.delete(element);
    this.observers.forEach(observer => observer.unobserve(element));
  }

  private loadLazyElement(element: HTMLElement): void {
    this.lazyElements.delete(element);

    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      const actualSrc = img.dataset.src;
      if (actualSrc) {
        img.src = actualSrc;
        delete img.dataset.src;
      }
    } else if (element.tagName === 'SCRIPT' || element.tagName === 'LINK') {
      const actualSrc = element.dataset.src || element.dataset.href;
      if (actualSrc) {
        if (element.tagName === 'SCRIPT') {
          (element as HTMLScriptElement).src = actualSrc;
        } else {
          (element as HTMLLinkElement).href = actualSrc;
        }
        delete element.dataset.src;
        delete element.dataset.href;
      }
    }
  }

  // ============================================================================
  // RESOURCE OPTIMIZATION
  // ============================================================================

  private optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.observeLazyElement(img as HTMLElement));
  }

  private optimizeFonts(): void {
    // Preload critical fonts
    const criticalFonts = ['Inter', 'Roboto', 'Open Sans'];
    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `/fonts/${font}-regular.woff2`;
      document.head.appendChild(link);
    });
  }

  private optimizeCSS(): void {
    // Critical CSS inlining
    const criticalCSS = `
      body { margin: 0; font-family: 'Inter', sans-serif; }
      .kair0s-loading { opacity: 0; transition: opacity 0.3s; }
      .kair0s-loaded { opacity: 1; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }

  private optimizeJavaScript(): void {
    // Defer non-critical JavaScript
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      (script as HTMLScriptElement).defer = true;
    });
  }

  // ============================================================================
  // BUNDLE OPTIMIZATION
  // ============================================================================

  public optimizeBundle(): void {
    if (this.config.bundle.codeSplitting) {
      this.enableCodeSplitting();
    }

    if (this.config.bundle.treeShaking) {
      this.enableTreeShaking();
    }

    if (this.config.bundle.compression) {
      this.enableCompression();
    }
  }

  private enableCodeSplitting(): void {
    // Dynamic imports for code splitting
    const loadComponent = async (componentName: string) => {
      try {
        const module = await import(`../components/${componentName}.js`);
        return module.default;
      } catch (error) {
        console.error(`Failed to load component ${componentName}:`, error);
        return null;
      }
    };

    // Make available globally
    (window as any).loadComponent = loadComponent;
  }

  private enableTreeShaking(): void {
    // Mark unused exports for tree shaking
    const unusedExports = ['legacyFunction', 'deprecatedAPI'];
    unusedExports.forEach(exportName => {
      if ((window as any)[exportName]) {
        console.warn(`Unused export detected: ${exportName}`);
      }
    });
  }

  private enableCompression(): void {
    // Enable Brotli compression if available
    if ('CompressionStream' in window) {
      console.log('Brotli compression available');
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.processNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.processResourceEntry(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.processPaintEntry(entry as PerformancePaintTiming);
        break;
      case 'layout-shift':
        this.processLayoutShiftEntry(entry as PerformanceEntry & { value: number });
        break;
    }
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    this.metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
    this.metrics.renderTime = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
  }

  private processResourceEntry(entry: PerformanceResourceTiming): void {
    this.metrics.networkRequests++;
    
    // Track large resources
    if (entry.transferSize > 1024 * 1024) { // > 1MB
      console.warn(`Large resource detected: ${entry.name} (${(entry.transferSize / 1024 / 1024).toFixed(2)}MB)`);
    }
  }

  private processPaintEntry(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-contentful-paint') {
      this.metrics.firstContentfulPaint = entry.startTime;
    } else if (entry.name === 'largest-contentful-paint') {
      this.metrics.largestContentfulPaint = entry.startTime;
    }
  }

  private processLayoutShiftEntry(entry: PerformanceEntry & { value: number; hadRecentInput?: boolean }): void {
    if (!entry.hadRecentInput) {
      this.metrics.cumulativeLayoutShift += entry.value;
    }
  }

  private interceptNetworkRequests(): void {
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    let requestCount = 0;

    // Intercept fetch
    window.fetch = async (...args) => {
      requestCount++;
      const start = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const end = performance.now();
        
        this.logNetworkRequest('fetch', args[0] as string, end - start, response.status);
        return response;
      } catch (error) {
        const end = performance.now();
        this.logNetworkRequest('fetch', args[0] as string, end - start, 0);
        throw error;
      }
    };

    // Intercept XMLHttpRequest
    XMLHttpRequest.prototype.open = function(this: XMLHttpRequest, method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      (this as any)._url = url;
      (this as any)._method = method;
      return originalXHROpen.call(this, method, url, async, username, password);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      const start = performance.now();
      const originalOnReadyStateChange = this.onreadystatechange;
      
      this.onreadystatechange = function() {
        if (this.readyState === 4) {
          const end = performance.now();
          const optimizer = (window as any).performanceOptimizer;
          if (optimizer) {
            optimizer.logNetworkRequest(
              (this as any)._method,
              (this as any)._url,
              end - start,
              this.status
            );
          }
        }
        
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(this, arguments as any);
        }
      };
      
      return originalXHRSend.apply(this, args);
    };

    // Store request count
    (window as any)._networkRequestCount = requestCount;
  }

  private logNetworkRequest(method: string, url: string, duration: number, status: number): void {
    this.metrics.networkRequests++;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request detected: ${method} ${url} (${duration.toFixed(2)}ms)`);
    }

    // Log failed requests
    if (status >= 400) {
      console.error(`Failed request: ${method} ${url} (${status})`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getMetricByName(name: string): PerformanceEntry | undefined {
    return this.performanceEntries.find(entry => entry.name === name);
  }

  public getMetrics(): PerformanceMetrics {
    // Update cache hit rate
    const stats = this.getCacheStats();
    this.metrics.cacheHitRate = stats.hitRate;

    return { ...this.metrics };
  }

  public generatePerformanceReport(): {
    summary: {
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      score: number;
      recommendations: string[];
    };
    details: PerformanceMetrics;
    cache: {
      size: number;
      entries: number;
      hitRate: number;
      oldestEntry: number;
      newestEntry: number;
    };
  } {
    const metrics = this.getMetrics();
    const cacheStats = this.getCacheStats();
    
    // Calculate performance score
    let score = 100;
    const recommendations: string[] = [];

    // Load time scoring (0-30 points)
    if (metrics.loadTime > 3000) {
      score -= 30;
      recommendations.push('Optimize initial load time (currently > 3s)');
    } else if (metrics.loadTime > 1500) {
      score -= 15;
      recommendations.push('Consider optimizing load time (currently > 1.5s)');
    }

    // Memory usage scoring (0-20 points)
    if (metrics.memoryUsage > 100 * 1024 * 1024) { // > 100MB
      score -= 20;
      recommendations.push('High memory usage detected (> 100MB)');
    } else if (metrics.memoryUsage > 50 * 1024 * 1024) { // > 50MB
      score -= 10;
      recommendations.push('Consider memory optimization (> 50MB)');
    }

    // Cache efficiency scoring (0-20 points)
    if (cacheStats.hitRate < 50) {
      score -= 20;
      recommendations.push('Low cache hit rate, review caching strategy');
    } else if (cacheStats.hitRate < 70) {
      score -= 10;
      recommendations.push('Improve cache hit rate');
    }

    // Network requests scoring (0-15 points)
    if (metrics.networkRequests > 100) {
      score -= 15;
      recommendations.push('Too many network requests, consider bundling');
    } else if (metrics.networkRequests > 50) {
      score -= 8;
      recommendations.push('Consider reducing network requests');
    }

    // Core Web Vitals scoring (0-15 points)
    if (metrics.largestContentfulPaint > 4000) {
      score -= 15;
      recommendations.push('Poor LCP, optimize loading performance');
    } else if (metrics.largestContentfulPaint > 2500) {
      score -= 8;
      recommendations.push('LCP needs improvement');
    }

    if (metrics.cumulativeLayoutShift > 0.25) {
      score -= 10;
      recommendations.push('High CLS, improve layout stability');
    } else if (metrics.cumulativeLayoutShift > 0.1) {
      score -= 5;
      recommendations.push('CLS needs improvement');
    }

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      summary: {
        grade,
        score: Math.max(0, score),
        recommendations
      },
      details: metrics,
      cache: cacheStats
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  public destroy(): void {
    // Clear observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Clear cache
    this.cache.clear();

    // Clear lazy elements
    this.lazyElements.clear();

    // Restore original fetch/XHR
    if ((window as any)._originalFetch) {
      window.fetch = (window as any)._originalFetch;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const performanceOptimizer = new PerformanceOptimizer();

// ============================================================================
// EXPORTS
// ============================================================================

export default PerformanceOptimizer;
