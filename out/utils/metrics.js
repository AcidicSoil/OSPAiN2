"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRenderTracking = withRenderTracking;
const react_1 = __importStar(require("react"));
function withRenderTracking(Component, name, collector) {
    const WrappedComponent = (props) => {
        const startTime = performance.now();
        (0, react_1.useEffect)(() => {
            collector.trackRender(name, startTime);
        });
        return react_1.default.createElement(Component, props);
    };
    WrappedComponent.displayName = `WithRenderTracking(${name})`;
    return WrappedComponent;
}
class PerformanceMetricsCollector {
    setupPerformanceObservers() {
        if (typeof window === 'undefined' || !window.PerformanceObserver)
            return;
        try {
            const longTaskObserver = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                    this.trackMetric('longTask', entry.duration);
                });
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
        catch (e) {
            // Long task observer not supported
        }
        if (this.config.interactionDelay) {
            try {
                const fidObserver = new PerformanceObserver(list => {
                    list.getEntries().forEach(entry => {
                        if (entry.name === 'first-input') {
                            const fidEntry = entry;
                            if (fidEntry.processingStart) {
                                this.trackMetric('firstInputDelay', fidEntry.processingStart - entry.startTime);
                            }
                        }
                    });
                });
                fidObserver.observe({ type: 'first-input', buffered: true });
            }
            catch (e) {
                // FID observer not supported
            }
        }
        try {
            const layoutShiftObserver = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                    const lsEntry = entry;
                    if (lsEntry.hadRecentInput === false) {
                        this.trackMetric('cumulativeLayoutShift', lsEntry.value);
                    }
                });
            });
            layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
        }
        catch (e) {
            // Layout shift observer not supported
        }
    }
    trackMetric(name, value) {
        console.log(`Metric: ${name} = ${value}`);
        // Implementation would send to analytics or store locally
    }
    trackRender(componentName, startTime) {
        const renderTime = performance.now() - startTime;
        this.trackMetric(`render_${componentName}`, renderTime);
    }
}
exports.default = PerformanceMetricsCollector;
//# sourceMappingURL=metrics.js.map