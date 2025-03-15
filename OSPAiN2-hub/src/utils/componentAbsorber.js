"use strict";
/**
 * Component Absorption System
 *
 * This utility manages the process of absorbing components from external repositories
 * into the OSPAiN2 ecosystem based on evaluation results from the componentEvaluation system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentAbsorber = exports.AbsorptionStatus = void 0;
const componentEvaluation_1 = require("./componentEvaluation");
// Define the absorption process status
var AbsorptionStatus;
(function (AbsorptionStatus) {
    AbsorptionStatus["NOT_STARTED"] = "not_started";
    AbsorptionStatus["IN_PROGRESS"] = "in_progress";
    AbsorptionStatus["COMPLETED"] = "completed";
    AbsorptionStatus["FAILED"] = "failed";
})(AbsorptionStatus || (exports.AbsorptionStatus = AbsorptionStatus = {}));
/**
 * Component Absorber manages the process of absorbing external components
 * into the OSPAiN2 ecosystem.
 */
class ComponentAbsorber {
    constructor() {
        this.absorptions = new Map();
        this.testingProtocols = new Map();
        // Initialize with standard testing protocols
        this.initializeTestingProtocols();
    }
    static getInstance() {
        if (!ComponentAbsorber.instance) {
            ComponentAbsorber.instance = new ComponentAbsorber();
        }
        return ComponentAbsorber.instance;
    }
    initializeTestingProtocols() {
        // Initialize standard testing protocols
        const renderPerformanceProtocol = {
            id: "test-render-perf",
            name: "Render Performance Protocol",
            description: "Tests the rendering performance of the component under various conditions",
            steps: [
                {
                    id: "step-1",
                    description: "Initialize component with minimal props",
                    action: "Render component with required props only",
                    expectedOutcome: "Component renders without errors",
                    automated: true,
                },
                {
                    id: "step-2",
                    description: "Measure render time",
                    action: "Use React profiler to measure initial and re-render times",
                    expectedOutcome: "Render time below threshold (100ms for initial, 50ms for re-render)",
                    automated: true,
                },
                {
                    id: "step-3",
                    description: "Memory usage assessment",
                    action: "Monitor memory usage during component lifecycle",
                    expectedOutcome: "No memory leaks, stable memory usage pattern",
                    automated: true,
                },
            ],
            expectedResults: [
                "Component renders efficiently (under 100ms initial render)",
                "No significant memory leaks observed",
                "Re-renders are optimized and fast",
            ],
        };
        this.testingProtocols.set(renderPerformanceProtocol.id, renderPerformanceProtocol);
        // Add more protocols as needed...
    }
    /**
     * Start the absorption process for a component
     * @param evaluation Component evaluation result
     * @param targetLocation Where the component should be placed in the codebase
     * @returns The created absorption record
     */
    startAbsorption(evaluation, targetLocation) {
        // Check if component is eligible for absorption
        if (evaluation.status !== componentEvaluation_1.ComponentEvaluationStatus.ABSORBED) {
            throw new Error(`Component ${evaluation.componentName} is not eligible for absorption (status: ${evaluation.status})`);
        }
        // Create absorption record
        const absorption = {
            componentId: evaluation.componentId,
            componentName: evaluation.componentName,
            sourceRepo: evaluation.sourceRepo,
            targetLocation,
            status: AbsorptionStatus.IN_PROGRESS,
            startTime: new Date(),
            absorptionLogs: [
                `Started absorption process at ${new Date().toISOString()}`,
            ],
            adaptations: [],
        };
        // Store in the registry
        this.absorptions.set(evaluation.componentId, absorption);
        return absorption;
    }
    /**
     * Record an adaptation made during the absorption process
     * @param componentId Component ID
     * @param adaptation The adaptation details
     */
    recordAdaptation(componentId, adaptation) {
        const absorption = this.absorptions.get(componentId);
        if (!absorption) {
            throw new Error(`No active absorption process found for component ${componentId}`);
        }
        // Add to adaptations
        absorption.absorptionLogs.push(`[${new Date().toISOString()}] Adaptation: ${adaptation.description}`);
        absorption.adaptations.push(adaptation);
        // Update in registry
        this.absorptions.set(componentId, absorption);
    }
    /**
     * Log a message to the absorption process
     * @param componentId Component ID
     * @param message Log message
     */
    logAbsorptionMessage(componentId, message) {
        const absorption = this.absorptions.get(componentId);
        if (!absorption) {
            throw new Error(`No active absorption process found for component ${componentId}`);
        }
        // Add to logs
        absorption.absorptionLogs.push(`[${new Date().toISOString()}] ${message}`);
        // Update in registry
        this.absorptions.set(componentId, absorption);
    }
    /**
     * Complete the absorption process
     * @param componentId Component ID
     * @param success Whether the process was successful
     * @param error Error message if failed
     */
    completeAbsorption(componentId, success, error) {
        const absorption = this.absorptions.get(componentId);
        if (!absorption) {
            throw new Error(`No active absorption process found for component ${componentId}`);
        }
        // Update status
        absorption.status = success
            ? AbsorptionStatus.COMPLETED
            : AbsorptionStatus.FAILED;
        absorption.completionTime = new Date();
        if (error) {
            absorption.error = error;
            absorption.absorptionLogs.push(`[${new Date().toISOString()}] Error: ${error}`);
        }
        else {
            absorption.absorptionLogs.push(`[${new Date().toISOString()}] Absorption completed successfully`);
        }
        // Update in registry
        this.absorptions.set(componentId, absorption);
        return absorption;
    }
    /**
     * Get a testing protocol by ID
     * @param protocolId Testing protocol ID
     * @returns Testing protocol
     */
    getTestingProtocol(protocolId) {
        return this.testingProtocols.get(protocolId);
    }
    /**
     * Add a new testing protocol
     * @param protocol Testing protocol to add
     */
    addTestingProtocol(protocol) {
        this.testingProtocols.set(protocol.id, protocol);
    }
    /**
     * Get all testing protocols
     * @returns Array of testing protocols
     */
    getAllTestingProtocols() {
        return Array.from(this.testingProtocols.values());
    }
    /**
     * Get absorption by component ID
     * @param componentId Component ID
     * @returns Component absorption details
     */
    getAbsorption(componentId) {
        return this.absorptions.get(componentId);
    }
    /**
     * Get all component absorptions
     * @returns Array of all component absorptions
     */
    getAllAbsorptions() {
        return Array.from(this.absorptions.values());
    }
    /**
     * Get absorptions by status
     * @param status Absorption status
     * @returns Array of component absorptions with the given status
     */
    getAbsorptionsByStatus(status) {
        return this.getAllAbsorptions().filter((a) => a.status === status);
    }
    /**
     * Get absorption summary
     * @returns Summary of absorption status counts
     */
    getAbsorptionSummary() {
        const all = this.getAllAbsorptions();
        return {
            total: all.length,
            inProgress: all.filter((a) => a.status === AbsorptionStatus.IN_PROGRESS)
                .length,
            completed: all.filter((a) => a.status === AbsorptionStatus.COMPLETED)
                .length,
            failed: all.filter((a) => a.status === AbsorptionStatus.FAILED).length,
        };
    }
}
exports.componentAbsorber = ComponentAbsorber.getInstance();
exports.default = {
    componentAbsorber: exports.componentAbsorber,
    AbsorptionStatus,
};
//# sourceMappingURL=componentAbsorber.js.map