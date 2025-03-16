/**
 * Optimization Tracker Utility
 * 
 * Implements the predictive optimization framework to track and report optimization opportunities.
 * This utility works in conjunction with the metrics collection system to provide actionable insights.
 */

import { performanceMetrics, MetricEntry } from './metrics';

interface OptimizationOpportunity {
  id: string;
  type: 'performance' | 'codeQuality' | 'ux' | 'security';
  metric: string;
  value: number;
  threshold: number;
  component?: string;
  timestamp: number;
  description: string;
  suggestedAction: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  detectionMethod: 'threshold' | 'pattern' | 'manual';
}

interface OptimizationTrackerConfig {
  autoTrack?: boolean;
  storageKey?: string;
  maxStoredOpportunities?: number;
  enableNotifications?: boolean;
}

// Pattern detectors for code quality issues
const PATTERN_DETECTORS = {
  componentReuse: (metrics: MetricEntry[]) => {
    // Detect when components are reused in 3+ places
    const componentUsage: Record<string, number> = {};
    
    metrics.forEach(metric => {
      if (metric.component) {
        componentUsage[metric.component] = (componentUsage[metric.component] || 0) + 1;
      }
    });
    
    return Object.entries(componentUsage)
      .filter(([component, count]) => count >= 3)
      .map(([component]) => component);
  },
  
  stateAccess: (metrics: MetricEntry[]) => {
    // Detect when 5+ components access the same state
    const stateAccessPatterns: Record<string, Set<string>> = {};
    
    metrics.forEach(metric => {
      if (metric.name === 'stateAccess' && metric.component && metric.context?.statePath) {
        const statePath = metric.context.statePath;
        if (!stateAccessPatterns[statePath]) {
          stateAccessPatterns[statePath] = new Set();
        }
        stateAccessPatterns[statePath].add(metric.component);
      }
    });
    
    return Object.entries(stateAccessPatterns)
      .filter(([statePath, components]) => components.size >= 5)
      .map(([statePath, components]) => ({
        statePath,
        components: Array.from(components)
      }));
  },
  
  propDrilling: (metrics: MetricEntry[]) => {
    // Detect when props pass through 3+ levels
    const propDrillingInstances: { prop: string, depth: number, components: string[] }[] = [];
    
    // This is simplified; in reality this would need to track component hierarchy
    metrics.forEach(metric => {
      if (metric.name === 'propDrilling' && metric.context?.propName && metric.context?.depth) {
        propDrillingInstances.push({
          prop: metric.context.propName,
          depth: metric.context.depth,
          components: metric.context.componentPath || []
        });
      }
    });
    
    return propDrillingInstances.filter(instance => instance.depth >= 3);
  }
};

class OptimizationTracker {
  private opportunities: OptimizationOpportunity[] = [];
  private config: Required<OptimizationTrackerConfig>;
  private notificationHandlers: ((opportunity: OptimizationOpportunity) => void)[] = [];
  
  constructor(config: OptimizationTrackerConfig = {}) {
    // Default configuration
    this.config = {
      autoTrack: true,
      storageKey: 'ospain-optimization-opportunities',
      maxStoredOpportunities: 100,
      enableNotifications: true,
      ...config
    };
    
    // Load stored opportunities
    this.loadFromStorage();
    
    // Set up auto-tracking if enabled
    if (this.config.autoTrack) {
      this.startAutoTracking();
    }
  }
  
  /**
   * Start automatically tracking optimization opportunities
   */
  startAutoTracking(): void {
    // Register callback for threshold-based opportunities
    performanceMetrics.onThresholdExceeded((metric, value, threshold) => {
      // Generate a unique ID for this opportunity
      const id = `${metric}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      
      const opportunity: OptimizationOpportunity = {
        id,
        type: this.determineOpportunityType(metric),
        metric,
        value,
        threshold,
        timestamp: Date.now(),
        description: this.generateDescription(metric, value, threshold),
        suggestedAction: this.generateSuggestion(metric, value, threshold),
        impact: this.determineImpact(metric, value, threshold),
        effort: this.determineEffort(metric),
        detectionMethod: 'threshold'
      };
      
      this.addOpportunity(opportunity);
    });
    
    // Set up periodic pattern detection
    this.setupPatternDetection();
  }
  
  /**
   * Stop automatic tracking
   */
  stopAutoTracking(): void {
    // The actual implementation would depend on how the tracking is implemented
    // In this case, we'd need to unregister the callback with performanceMetrics
  }
  
  /**
   * Manually add an optimization opportunity
   */
  addOpportunity(opportunity: OptimizationOpportunity): void {
    this.opportunities.push(opportunity);
    
    // Keep the list at the configured maximum size
    if (this.opportunities.length > this.config.maxStoredOpportunities) {
      this.opportunities = this.opportunities.slice(-this.config.maxStoredOpportunities);
    }
    
    // Send notifications if enabled
    if (this.config.enableNotifications) {
      this.notifyOpportunity(opportunity);
    }
    
    // Save to storage
    this.saveToStorage();
  }
  
  /**
   * Register a callback for notifications about new opportunities
   */
  onOpportunityDetected(handler: (opportunity: OptimizationOpportunity) => void): void {
    this.notificationHandlers.push(handler);
  }
  
  /**
   * Get all tracked optimization opportunities
   */
  getOpportunities(): OptimizationOpportunity[] {
    return [...this.opportunities];
  }
  
  /**
   * Get opportunities filtered by criteria
   */
  getFilteredOpportunities(filters: {
    type?: 'performance' | 'codeQuality' | 'ux' | 'security';
    impact?: 'low' | 'medium' | 'high';
    effort?: 'low' | 'medium' | 'high';
    metric?: string;
    component?: string;
    minTimestamp?: number;
    maxTimestamp?: number;
  } = {}): OptimizationOpportunity[] {
    return this.opportunities.filter(opportunity => {
      if (filters.type && opportunity.type !== filters.type) return false;
      if (filters.impact && opportunity.impact !== filters.impact) return false;
      if (filters.effort && opportunity.effort !== filters.effort) return false;
      if (filters.metric && opportunity.metric !== filters.metric) return false;
      if (filters.component && opportunity.component !== filters.component) return false;
      if (filters.minTimestamp && opportunity.timestamp < filters.minTimestamp) return false;
      if (filters.maxTimestamp && opportunity.timestamp > filters.maxTimestamp) return false;
      return true;
    });
  }
  
  /**
   * Clear all tracked opportunities
   */
  clearOpportunities(): void {
    this.opportunities = [];
    this.saveToStorage();
  }
  
  /**
   * Get opportunities ranked by impact-to-effort ratio
   */
  getPrioritizedOpportunities(): OptimizationOpportunity[] {
    return [...this.opportunities].sort((a, b) => {
      const aScore = this.calculatePriorityScore(a);
      const bScore = this.calculatePriorityScore(b);
      return bScore - aScore;
    });
  }
  
  /**
   * Save opportunities to storage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          this.config.storageKey,
          JSON.stringify(this.opportunities)
        );
      } catch (e) {
        console.error('Failed to save optimization opportunities to storage:', e);
      }
    }
  }
  
  /**
   * Load opportunities from storage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(this.config.storageKey);
        if (stored) {
          this.opportunities = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load optimization opportunities from storage:', e);
      }
    }
  }
  
  /**
   * Notify handlers about a new opportunity
   */
  private notifyOpportunity(opportunity: OptimizationOpportunity): void {
    this.notificationHandlers.forEach(handler => {
      try {
        handler(opportunity);
      } catch (e) {
        console.error('Error in optimization opportunity handler:', e);
      }
    });
  }
  
  /**
   * Calculate a priority score based on impact and effort
   */
  private calculatePriorityScore(opportunity: OptimizationOpportunity): number {
    const impactScore = { low: 1, medium: 3, high: 5 }[opportunity.impact];
    const effortScore = { low: 5, medium: 3, high: 1 }[opportunity.effort];
    
    return impactScore * effortScore;
  }
  
  /**
   * Set up periodic pattern detection
   */
  private setupPatternDetection(): void {
    // In a real implementation, this might use a worker or set intervals
    // For simplicity, we'll run pattern detection after a certain amount of metrics are collected
    const metricsThreshold = 100;
    let lastCheckedCount = 0;
    
    // Check periodically
    const checkPatterns = () => {
      const metrics = performanceMetrics.exportData();
      
      if (metrics.length - lastCheckedCount >= metricsThreshold) {
        lastCheckedCount = metrics.length;
        this.detectPatterns(metrics);
      }
      
      // Schedule next check
      setTimeout(checkPatterns, 60000); // Check every minute
    };
    
    // Start checking
    setTimeout(checkPatterns, 60000);
  }
  
  /**
   * Detect patterns in the collected metrics
   */
  private detectPatterns(metrics: MetricEntry[]): void {
    // Detect component reuse patterns
    const reusedComponents = PATTERN_DETECTORS.componentReuse(metrics);
    reusedComponents.forEach(component => {
      this.addOpportunity({
        id: `componentReuse-${component}-${Date.now()}`,
        type: 'codeQuality',
        metric: 'componentReuse',
        value: 3, // Threshold value
        threshold: 3,
        component,
        timestamp: Date.now(),
        description: `Component ${component} is reused in 3+ places, consider optimizing for flexibility`,
        suggestedAction: 'Extract more configurable props or use composition patterns',
        impact: 'medium',
        effort: 'medium',
        detectionMethod: 'pattern'
      });
    });
    
    // Detect state access patterns
    const stateAccessPatterns = PATTERN_DETECTORS.stateAccess(metrics);
    stateAccessPatterns.forEach(({ statePath, components }) => {
      this.addOpportunity({
        id: `stateAccess-${statePath}-${Date.now()}`,
        type: 'codeQuality',
        metric: 'stateAccess',
        value: components.length,
        threshold: 5,
        timestamp: Date.now(),
        description: `State path ${statePath} is accessed by ${components.length} components`,
        suggestedAction: 'Consider refactoring state structure or using context',
        impact: 'high',
        effort: 'high',
        detectionMethod: 'pattern'
      });
    });
    
    // Detect prop drilling patterns
    const propDrillingInstances = PATTERN_DETECTORS.propDrilling(metrics);
    propDrillingInstances.forEach(instance => {
      this.addOpportunity({
        id: `propDrilling-${instance.prop}-${Date.now()}`,
        type: 'codeQuality',
        metric: 'propDrilling',
        value: instance.depth,
        threshold: 3,
        timestamp: Date.now(),
        description: `Prop ${instance.prop} is passed through ${instance.depth} component levels`,
        suggestedAction: 'Use React Context or state management to avoid prop drilling',
        impact: 'medium',
        effort: 'medium',
        detectionMethod: 'pattern'
      });
    });
  }
  
  /**
   * Determine the type of optimization opportunity based on the metric
   */
  private determineOpportunityType(metric: string): 'performance' | 'codeQuality' | 'ux' | 'security' {
    const performanceMetrics = [
      'initialLoadTime', 'timeToInteractive', 'componentRenderTime', 
      'apiResponseTime', 'longTask', 'memoryUsage', 'bundleSize'
    ];
    
    const uxMetrics = [
      'firstInputDelay', 'cumulativeLayoutShift', 'interactionDelay'
    ];
    
    const codeQualityMetrics = [
      'componentDepth', 'propsPerComponent', 'stateUpdatesPerInteraction',
      'duplicateLogic', 'componentLinesOfCode', 'hookDependencies'
    ];
    
    const securityMetrics = [
      'unsanitizedInput', 'insecureStorage', 'xssVulnerability'
    ];
    
    if (performanceMetrics.includes(metric)) return 'performance';
    if (uxMetrics.includes(metric)) return 'ux';
    if (codeQualityMetrics.includes(metric)) return 'codeQuality';
    if (securityMetrics.includes(metric)) return 'security';
    
    // Default to performance if unknown
    return 'performance';
  }
  
  /**
   * Generate a description for the optimization opportunity
   */
  private generateDescription(metric: string, value: number, threshold: number): string {
    const descriptions: Record<string, string> = {
      initialLoadTime: `Initial load time (${value}ms) exceeds the threshold of ${threshold}ms`,
      timeToInteractive: `Time to interactive (${value}ms) exceeds the threshold of ${threshold}ms`,
      componentRenderTime: `Component render time (${value}ms) exceeds the threshold of ${threshold}ms`,
      apiResponseTime: `API response time (${value}ms) exceeds the threshold of ${threshold}ms`,
      firstInputDelay: `First input delay (${value}ms) exceeds the threshold of ${threshold}ms`,
      memoryUsage: `Memory usage (${value}MB) exceeds the threshold of ${threshold}MB`,
      bundleSize: `Bundle size (${value}KB) exceeds the threshold of ${threshold}KB`,
      cumulativeLayoutShift: `Cumulative layout shift (${value}) exceeds the threshold of ${threshold}`
    };
    
    return descriptions[metric] || `${metric} (${value}) exceeds the threshold of ${threshold}`;
  }
  
  /**
   * Generate a suggestion for addressing the optimization opportunity
   */
  private generateSuggestion(metric: string, value: number, threshold: number): string {
    const suggestions: Record<string, string> = {
      initialLoadTime: 'Consider code splitting, bundle optimization, or critical CSS extraction',
      timeToInteractive: 'Reduce JavaScript execution time or defer non-critical JavaScript',
      componentRenderTime: 'Implement React.memo, useCallback, or useMemo to prevent unnecessary renders',
      apiResponseTime: 'Consider caching, optimizing backend queries, or implementing loading states',
      firstInputDelay: 'Reduce main thread blocking JavaScript or optimize event handlers',
      memoryUsage: 'Check for memory leaks, large arrays, or DOM node accumulation',
      bundleSize: 'Implement code splitting, tree shaking, or remove unused dependencies',
      cumulativeLayoutShift: 'Set explicit dimensions for dynamic content or use content placeholders'
    };
    
    return suggestions[metric] || 'Investigate and optimize based on the specific metric';
  }
  
  /**
   * Determine the impact of an optimization opportunity
   */
  private determineImpact(metric: string, value: number, threshold: number): 'low' | 'medium' | 'high' {
    // Calculate how much the value exceeds the threshold
    const exceedRatio = value / threshold;
    
    if (exceedRatio >= 2) {
      return 'high';
    } else if (exceedRatio >= 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Determine the effort required to address the optimization opportunity
   */
  private determineEffort(metric: string): 'low' | 'medium' | 'high' {
    const lowEffortMetrics = [
      'componentRenderTime', 'cumulativeLayoutShift', 'firstInputDelay', 'bundleSize' 
    ];
    
    const mediumEffortMetrics = [
      'initialLoadTime', 'apiResponseTime', 'memoryUsage'
    ];
    
    const highEffortMetrics = [
      'timeToInteractive', 'componentDepth', 'stateUpdatesPerInteraction', 'duplicateLogic'
    ];
    
    if (lowEffortMetrics.includes(metric)) return 'low';
    if (mediumEffortMetrics.includes(metric)) return 'medium';
    if (highEffortMetrics.includes(metric)) return 'high';
    
    // Default to medium if unknown
    return 'medium';
  }
}

// Create a singleton instance
export const optimizationTracker = new OptimizationTracker();

// Export the class for custom instances
export { OptimizationTracker };

// Export types
export type { OptimizationOpportunity }; 