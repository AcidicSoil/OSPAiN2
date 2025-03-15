/**
 * Performance metrics tracking system for the OSPAiN2-Hub
 * Based on the predictive optimization framework
 */

import React, { useEffect } from 'react';

// Metric threshold types
export interface MetricThresholds {
  earlyWarning: number;
  investigation: number;
  critical: number;
}

// Metrics configuration
export interface MetricsConfig {
  componentRenderTime?: boolean;
  memoryUsage?: boolean;
  interactionDelay?: boolean;
  apiResponseTime?: boolean;
  reduxStateChanges?: boolean;
  codeQuality?: boolean;
  bundleSize?: boolean;
}

// Default thresholds for each metric type
const DEFAULT_THRESHOLDS: Record<string, MetricThresholds> = {
  initialLoadTime: { earlyWarning: 1500, investigation: 2500, critical: 3500 },
  timeToInteractive: { earlyWarning: 2000, investigation: 3000, critical: 4000 },
  firstInputDelay: { earlyWarning: 100, investigation: 200, critical: 300 },
  componentRenderTime: { earlyWarning: 50, investigation: 100, critical: 200 },
  apiResponseTime: { earlyWarning: 300, investigation: 500, critical: 1000 },
  memoryUsage: { earlyWarning: 50, investigation: 100, critical: 200 }, // in MB
  bundleSize: { earlyWarning: 250, investigation: 500, critical: 1000 }, // in KB
};

// Metric data storage
export interface MetricEntry {
  name: string;
  value: number;
  timestamp: number;
  component?: string;
  context?: Record<string, any>;
}

export type MetricCallback = (metric: string, value: number, threshold: number) => void;

export interface MetricsCollector {
  trackRender(componentName: string, startTime: number): void;
  trackMetric(name: string, value: number): void;
}

export function withRenderTracking<P>(
  Component: React.ComponentType<P>, 
  name: string, 
  collector: MetricsCollector
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props: P) => {
    const startTime = performance.now();
    
    useEffect(() => {
      collector.trackRender(name, startTime);
    });
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `WithRenderTracking(${name})`;
  return WrappedComponent;
}

export interface PerformanceMetrics {
  longTask: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

// Custom interfaces for performance entries
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

class PerformanceMetricsCollector implements MetricsCollector {
  private config: { interactionDelay?: boolean } = {};

  constructor(config?: { interactionDelay?: boolean }) {
    this.config = config || {};
    this.setupPerformanceObservers();
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;
    
    try {
      const longTaskObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.trackMetric('longTask', entry.duration);
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task observer not supported
    }
    
    if (this.config.interactionDelay) {
      try {
        const fidObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.name === 'first-input') {
              const fidEntry = entry as PerformanceEventTiming;
              if (fidEntry.processingStart) {
                this.trackMetric('firstInputDelay', fidEntry.processingStart - entry.startTime);
              }
            }
          });
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true } as any);
      } catch (e) {
        // FID observer not supported
      }
    }
    
    try {
      const layoutShiftObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          const lsEntry = entry as LayoutShift;
          if (lsEntry.hadRecentInput === false) {
            this.trackMetric('cumulativeLayoutShift', lsEntry.value);
          }
        });
      });
      
      layoutShiftObserver.observe({ type: 'layout-shift', buffered: true } as any);
    } catch (e) {
      // Layout shift observer not supported
    }
  }

  trackMetric(name: string, value: number): void {
    console.log(`Metric: ${name} = ${value}`);
    // Implementation would send to analytics or store locally
  }

  trackRender(componentName: string, startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.trackMetric(`render_${componentName}`, renderTime);
  }
}

export default PerformanceMetricsCollector;

/**
 * Create a metrics collector instance with the specified configuration
 */
export const createMetricsCollector = (config: MetricsConfig = {}): MetricsCollector => {
  return new PerformanceMetricsCollector(config);
};

// Default instance for app-wide metrics
export const performanceMetrics = createMetricsCollector({
  componentRenderTime: true,
  memoryUsage: true,
  interactionDelay: true,
  apiResponseTime: true,
  reduxStateChanges: true
}); 