/**
 * Component Evaluation Framework
 *
 * This utility provides functionality for evaluating and absorbing components
 * into the OSPAiN2 ecosystem based on predefined metrics and evaluation criteria.
 */

import { useState } from "react";

// Define component evaluation metrics
export interface ComponentMetrics {
  // Performance metrics
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;

  // Quality metrics
  codeQuality: number;
  accessibility: number;
  testCoverage: number;

  // Integration metrics
  dependencyCount: number;
  integrationEffort: number;
  compatibilityScore: number;

  // User experience metrics
  usabilityScore: number;
  interactivityScore: number;

  // Maintenance metrics
  documentationQuality: number;
  maintainabilityScore: number;
}

// Status of component evaluation
export enum ComponentEvaluationStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
  ABSORBED = "absorbed",
}

// Component evaluation result
export interface ComponentEvaluation {
  componentId: string;
  componentName: string;
  sourceRepo: string;
  metrics: ComponentMetrics;
  status: ComponentEvaluationStatus;
  score: number;
  evaluationDate: Date;
  evaluatedBy: string;
  comments: string;
  absorptionDate?: Date;
}

// Evaluation thresholds
const ABSORPTION_THRESHOLD = 0.75; // 75% score required for absorption
const REJECTION_THRESHOLD = 0.4; // Below 40% results in rejection

/**
 * Calculate a weighted score based on component metrics
 * @param metrics Component metrics to evaluate
 * @returns Normalized score between 0 and 1
 */
export function calculateComponentScore(metrics: ComponentMetrics): number {
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
    const metricKey = key as keyof ComponentMetrics;
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
export function evaluateComponent(
  componentId: string,
  componentName: string,
  sourceRepo: string,
  metrics: ComponentMetrics,
  evaluator: string,
  comments: string
): ComponentEvaluation {
  // Calculate score
  const score = calculateComponentScore(metrics);

  // Determine status based on score
  let status: ComponentEvaluationStatus;

  if (score >= ABSORPTION_THRESHOLD) {
    status = ComponentEvaluationStatus.ABSORBED;
  } else if (score < REJECTION_THRESHOLD) {
    status = ComponentEvaluationStatus.REJECTED;
  } else {
    status = ComponentEvaluationStatus.COMPLETED; // In between - needs manual review
  }

  // Create evaluation result
  const evaluation: ComponentEvaluation = {
    componentId,
    componentName,
    sourceRepo,
    metrics,
    status,
    score,
    evaluationDate: new Date(),
    evaluatedBy: evaluator,
    comments,
    absorptionDate:
      status === ComponentEvaluationStatus.ABSORBED ? new Date() : undefined,
  };

  return evaluation;
}

/**
 * React hook for component evaluation
 * @param componentId Component ID to evaluate
 * @param initialMetrics Initial metrics (optional)
 * @returns Component evaluation state and functions
 */
export function useComponentEvaluation(
  componentId: string,
  componentName: string,
  sourceRepo: string,
  initialMetrics?: Partial<ComponentMetrics>
) {
  // Initialize metrics with defaults or provided values
  const defaultMetrics: ComponentMetrics = {
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
  const [metrics, setMetrics] = useState<ComponentMetrics>(defaultMetrics);
  const [status, setStatus] = useState<ComponentEvaluationStatus>(
    ComponentEvaluationStatus.NOT_STARTED
  );
  const [evaluation, setEvaluation] = useState<ComponentEvaluation | null>(
    null
  );

  // Update metrics
  const updateMetrics = (newMetrics: Partial<ComponentMetrics>) => {
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
  const completeEvaluation = (evaluator: string, comments: string) => {
    const newEvaluation = evaluateComponent(
      componentId,
      componentName,
      sourceRepo,
      metrics,
      evaluator,
      comments
    );

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
  private static instance: ComponentEvaluationRegistry;
  private evaluations: Map<string, ComponentEvaluation> = new Map();

  private constructor() {}

  public static getInstance(): ComponentEvaluationRegistry {
    if (!ComponentEvaluationRegistry.instance) {
      ComponentEvaluationRegistry.instance = new ComponentEvaluationRegistry();
    }
    return ComponentEvaluationRegistry.instance;
  }

  public registerEvaluation(evaluation: ComponentEvaluation): void {
    this.evaluations.set(evaluation.componentId, evaluation);
  }

  public getEvaluation(componentId: string): ComponentEvaluation | undefined {
    return this.evaluations.get(componentId);
  }

  public getAllEvaluations(): ComponentEvaluation[] {
    return Array.from(this.evaluations.values());
  }

  public getAbsorbedComponents(): ComponentEvaluation[] {
    return this.getAllEvaluations().filter(
      (item) => item.status === ComponentEvaluationStatus.ABSORBED
    );
  }

  public getRejectedComponents(): ComponentEvaluation[] {
    return this.getAllEvaluations().filter(
      (item) => item.status === ComponentEvaluationStatus.REJECTED
    );
  }

  public getPendingReviewComponents(): ComponentEvaluation[] {
    return this.getAllEvaluations().filter(
      (item) => item.status === ComponentEvaluationStatus.COMPLETED
    );
  }

  public getEvaluationSummary(): {
    total: number;
    absorbed: number;
    rejected: number;
    pending: number;
    inProgress: number;
  } {
    const all = this.getAllEvaluations();

    return {
      total: all.length,
      absorbed: all.filter(
        (e) => e.status === ComponentEvaluationStatus.ABSORBED
      ).length,
      rejected: all.filter(
        (e) => e.status === ComponentEvaluationStatus.REJECTED
      ).length,
      pending: all.filter(
        (e) => e.status === ComponentEvaluationStatus.COMPLETED
      ).length,
      inProgress: all.filter(
        (e) => e.status === ComponentEvaluationStatus.IN_PROGRESS
      ).length,
    };
  }
}

export const componentRegistry = ComponentEvaluationRegistry.getInstance();

// Create a named export object
export const ComponentEvaluationUtils = {
  evaluateComponent,
  calculateComponentScore,
  ComponentEvaluationStatus,
};

// Export the named object as default
export default ComponentEvaluationUtils;
