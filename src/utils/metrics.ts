import React, { useEffect } from 'react';

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

class PerformanceMetricsCollector {
  private config: any;

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

// Add these interfaces to fix TypeScript errors
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

export default PerformanceMetricsCollector; 