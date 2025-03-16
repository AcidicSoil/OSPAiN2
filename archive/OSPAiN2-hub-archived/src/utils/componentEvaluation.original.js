"use strict";
/**
 * Component Evaluation Framework
 *
 * This utility provides functionality for evaluating and absorbing components
 * into the OSPAiN2 ecosystem based on predefined metrics and evaluation criteria.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentEvaluationUtils = exports.componentRegistry = exports.ComponentEvaluationStatus = void 0;
exports.calculateComponentScore = calculateComponentScore;
exports.evaluateComponent = evaluateComponent;
exports.useComponentEvaluation = useComponentEvaluation;
const react_1 = require("react");
// Status of component evaluation
var ComponentEvaluationStatus;
(function (ComponentEvaluationStatus) {
    ComponentEvaluationStatus["NOT_STARTED"] = "not_started";
    ComponentEvaluationStatus["IN_PROGRESS"] = "in_progress";
    ComponentEvaluationStatus["COMPLETED"] = "completed";
    ComponentEvaluationStatus["REJECTED"] = "rejected";
    ComponentEvaluationStatus["ABSORBED"] = "absorbed";
})(ComponentEvaluationStatus || (exports.ComponentEvaluationStatus = ComponentEvaluationStatus = {}));
// Evaluation thresholds
const ABSORPTION_THRESHOLD = 0.75; // 75% score required for absorption
const REJECTION_THRESHOLD = 0.4; // Below 40% results in rejection
/**
 * Calculate a weighted score based on component metrics
 * @param metrics Component metrics to evaluate
 * @returns Normalized score between 0 and 1
 */
function calculateComponentScore(metrics) {
    // Define weights for different metric categories
    const weights = {
        // Performance (30%)
        renderTime: 0.1,
        memoryUsage: 0.1,
        bundleSize: 0.1,
        // Quality (25%)
        codeQuality: 0.1,
        accessibility: 0.05,
        testCoverage: 0.1,
        // Integration (20%)
        dependencyCount: 0.05,
        integrationEffort: 0.1,
        compatibilityScore: 0.05,
        // User Experience (15%)
        usabilityScore: 0.1,
        interactivityScore: 0.05,
        // Maintenance (10%)
        documentationQuality: 0.05,
        maintainabilityScore: 0.05,
    };
    // The lower the better for these metrics
    const invertedMetrics = [
        "renderTime",
        "memoryUsage",
        "bundleSize",
        "dependencyCount",
        "integrationEffort",
    ];
    // Calculate weighted score
    let score = 0;
    let totalWeight = 0;
    for (const [key, weight] of Object.entries(weights)) {
        const metricKey = key;
        const metricValue = metrics[metricKey];
        // Normalize metrics to 0-1 scale (assuming metrics are on 0-100 scale)
        let normalizedValue = metricValue / 100;
        // Invert value for metrics where lower is better
        if (invertedMetrics.includes(key)) {
            normalizedValue = 1 - normalizedValue;
        }
        score += normalizedValue * weight;
        totalWeight += weight;
    }
    // Normalize final score to 0-1 scale
    return totalWeight > 0 ? score / totalWeight : 0;
}
/**
 * Evaluate a component and determine if it should be absorbed
 * @param componentId Unique identifier for the component
 * @param metrics Component metrics
 * @param evaluator Name of the evaluator
 * @param comments Evaluation comments
 * @returns Component evaluation result
 */
function evaluateComponent(componentId, componentName, sourceRepo, metrics, evaluator, comments) {
    // Calculate score
    const score = calculateComponentScore(metrics);
    // Determine status based on score
    let status;
    if (score >= ABSORPTION_THRESHOLD) {
        status = ComponentEvaluationStatus.ABSORBED;
    }
    else if (score < REJECTION_THRESHOLD) {
        status = ComponentEvaluationStatus.REJECTED;
    }
    else {
        status = ComponentEvaluationStatus.COMPLETED; // In between - needs manual review
    }
    // Create evaluation result
    const evaluation = {
        componentId,
        componentName,
        sourceRepo,
        metrics,
        status,
        score,
        evaluationDate: new Date(),
        evaluatedBy: evaluator,
        comments,
        absorptionDate: status === ComponentEvaluationStatus.ABSORBED ? new Date() : undefined,
    };
    return evaluation;
}
/**
 * React hook for component evaluation
 * @param componentId Component ID to evaluate
 * @param initialMetrics Initial metrics (optional)
 * @returns Component evaluation state and functions
 */
function useComponentEvaluation(componentId, componentName, sourceRepo, initialMetrics) {
    // Initialize metrics with defaults or provided values
    const defaultMetrics = {
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        codeQuality: 0,
        accessibility: 0,
        testCoverage: 0,
        dependencyCount: 0,
        integrationEffort: 0,
        compatibilityScore: 0,
        usabilityScore: 0,
        interactivityScore: 0,
        documentationQuality: 0,
        maintainabilityScore: 0,
        ...initialMetrics,
    };
    // State for metrics and evaluation
    const [metrics, setMetrics] = (0, react_1.useState)(defaultMetrics);
    const [status, setStatus] = (0, react_1.useState)(ComponentEvaluationStatus.NOT_STARTED);
    const [evaluation, setEvaluation] = (0, react_1.useState)(null);
    // Update metrics
    const updateMetrics = (newMetrics) => {
        setMetrics((prevMetrics) => ({
            ...prevMetrics,
            ...newMetrics,
        }));
        // If evaluation in progress, update status
        if (status === ComponentEvaluationStatus.NOT_STARTED) {
            setStatus(ComponentEvaluationStatus.IN_PROGRESS);
        }
    };
    // Complete evaluation
    const completeEvaluation = (evaluator, comments) => {
        const newEvaluation = evaluateComponent(componentId, componentName, sourceRepo, metrics, evaluator, comments);
        setEvaluation(newEvaluation);
        setStatus(newEvaluation.status);
        return newEvaluation;
    };
    return {
        metrics,
        updateMetrics,
        status,
        evaluation,
        completeEvaluation,
    };
}
// Tracking system for component evaluations
class ComponentEvaluationRegistry {
    constructor() {
        this.evaluations = new Map();
    }
    static getInstance() {
        if (!ComponentEvaluationRegistry.instance) {
            ComponentEvaluationRegistry.instance = new ComponentEvaluationRegistry();
        }
        return ComponentEvaluationRegistry.instance;
    }
    registerEvaluation(evaluation) {
        this.evaluations.set(evaluation.componentId, evaluation);
    }
    getEvaluation(componentId) {
        return this.evaluations.get(componentId);
    }
    getAllEvaluations() {
        return Array.from(this.evaluations.values());
    }
    getAbsorbedComponents() {
        return this.getAllEvaluations().filter((item) => item.status === ComponentEvaluationStatus.ABSORBED);
    }
    getRejectedComponents() {
        return this.getAllEvaluations().filter((item) => item.status === ComponentEvaluationStatus.REJECTED);
    }
    getPendingReviewComponents() {
        return this.getAllEvaluations().filter((item) => item.status === ComponentEvaluationStatus.COMPLETED);
    }
    getEvaluationSummary() {
        const all = this.getAllEvaluations();
        return {
            total: all.length,
            absorbed: all.filter((e) => e.status === ComponentEvaluationStatus.ABSORBED).length,
            rejected: all.filter((e) => e.status === ComponentEvaluationStatus.REJECTED).length,
            pending: all.filter((e) => e.status === ComponentEvaluationStatus.COMPLETED).length,
            inProgress: all.filter((e) => e.status === ComponentEvaluationStatus.IN_PROGRESS).length,
        };
    }
}
exports.componentRegistry = ComponentEvaluationRegistry.getInstance();
// Create a named export object
exports.ComponentEvaluationUtils = {
    evaluateComponent,
    calculateComponentScore,
    ComponentEvaluationStatus,
};
// Export the named object as default
exports.default = exports.ComponentEvaluationUtils;
//# sourceMappingURL=componentEvaluation.original.js.map