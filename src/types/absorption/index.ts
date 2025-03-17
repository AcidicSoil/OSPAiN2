/**
 * Types for the Component Absorption System
 * 
 * These types define the interfaces for the component absorption process
 * that allows integrating external components into the OSPAiN2 ecosystem.
 */

/**
 * Status of the absorption process
 */
export enum AbsorptionStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Interface for component absorption details
 */
export interface ComponentAbsorption {
  componentId: string;
  componentName: string;
  sourceRepo: string;
  targetLocation: string;
  status: AbsorptionStatus;
  startTime: Date;
  completionTime?: Date;
  error?: string;
  absorptionLogs: string[];
  adaptations: ComponentAdaptation[];
}

/**
 * Interface for tracking adaptations made during absorption
 */
export interface ComponentAdaptation {
  type: "rename" | "modify" | "dependency" | "interface" | "style" | "other";
  description: string;
  before?: string;
  after?: string;
  reason: string;
}

/**
 * Standardized testing protocol
 */
export interface TestingProtocol {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedResults: string[];
  automationScript?: string;
}

/**
 * Test step
 */
export interface TestStep {
  id: string;
  description: string;
  action: string;
  expectedOutcome: string;
  automated: boolean;
}

/**
 * Interface for component evaluation status
 */
export enum ComponentEvaluationStatus {
  PENDING = "pending",
  EVALUATING = "evaluating",
  APPROVED = "approved",
  REJECTED = "rejected",
  ABSORBED = "absorbed",
}

/**
 * Interface for component evaluation
 */
export interface ComponentEvaluation {
  componentId: string;
  componentName: string;
  sourceRepo: string;
  evaluatorName?: string;
  evaluationDate?: Date;
  status: ComponentEvaluationStatus;
  notes?: string;
  metrics?: ComponentMetrics;
  score?: number;
}

/**
 * Interface for component metrics used in evaluation
 */
export interface ComponentMetrics {
  // Performance metrics
  renderTime?: number;
  memoryUsage?: number;
  bundleSize?: number;

  // Quality metrics
  codeQuality?: number;
  accessibility?: number;
  testCoverage?: number;

  // Integration metrics
  dependencyCount?: number;
  integrationEffort?: number;
  compatibilityScore?: number;

  // User experience metrics
  usabilityScore?: number;
  interactivityScore?: number;

  // Maintenance metrics
  documentationQuality?: number;
  maintainabilityScore?: number;
} 