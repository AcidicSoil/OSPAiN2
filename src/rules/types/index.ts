/**
 * Rule Type Configuration System
 * 
 * Defines the types and interfaces for the rule type configuration system.
 * This system manages how rules are applied in the Sovereign AI ecosystem.
 */

/**
 * Represents the possible types of rule application methods.
 */
export enum RuleType {
  /** Rules that must be manually requested by users */
  MANUAL = 'manual',
  
  /** Rules that can be requested by AI agents */
  AGENT_REQUESTED = 'agent_requested',
  
  /** Rules that are automatically applied */
  AUTO_APPLIED = 'auto_applied',
  
  /** Rules that are applied based on conditions */
  CONDITIONAL = 'conditional'
}

/**
 * Information about a rule file.
 */
export interface RuleFileInfo {
  /** Path to the rule file */
  path: string;
  
  /** The current rule type */
  currentType: RuleType;
  
  /** The suggested rule type based on analysis */
  suggestedType: RuleType;
  
  /** Brief description of the rule's purpose */
  purpose: string;
  
  /** Other rule files this rule depends on */
  dependencies: string[];
  
  /** How this rule is used in the system */
  usagePatterns: UsagePattern[];
}

/**
 * Represents a pattern of how a rule is used.
 */
export interface UsagePattern {
  /** Type of usage */
  type: 'direct' | 'referenced' | 'imported';
  
  /** Where this usage occurs */
  location: string;
  
  /** How frequently this pattern is observed */
  frequency: number;
}

/**
 * Represents a relationship between two rules.
 */
export interface RuleRelationship {
  /** Source rule file path */
  sourceRule: string;
  
  /** Target rule file path */
  targetRule: string;
  
  /** Type of relationship between the rules */
  relationshipType: 'depends-on' | 'extends' | 'complements' | 'conflicts-with';
  
  /** Strength of the relationship (0-1) */
  strength: number;
  
  /** Description of the relationship */
  description?: string;
}

/**
 * Result of validating a rule configuration.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  
  /** Any issues found during validation */
  issues: ValidationIssue[];
  
  /** Suggestions for fixing issues */
  suggestions: string[];
}

/**
 * An issue found during validation.
 */
export interface ValidationIssue {
  /** Severity of the issue */
  severity: 'error' | 'warning' | 'info';
  
  /** Description of the issue */
  message: string;
  
  /** Location where the issue was found */
  location: string;
}

/**
 * Request to update a rule's type.
 */
export interface RuleUpdate {
  /** Path to the rule file */
  path: string;
  
  /** Current rule type */
  currentType: RuleType;
  
  /** New rule type to apply */
  newType: RuleType;
  
  /** Reason for the update */
  reason: string;
}

/**
 * Result of an update operation.
 */
export interface UpdateResult {
  /** Whether the update was successful */
  success: boolean;
  
  /** Updated rule files */
  updatedFiles: string[];
  
  /** Files that failed to update */
  failedFiles: string[];
  
  /** Any issues encountered during update */
  issues: ValidationIssue[];
}

/**
 * Performance metrics for rule processing.
 */
export interface PerformanceMetrics {
  /** Time taken to process rules */
  processingTime: number;
  
  /** Number of rules processed */
  rulesProcessed: number;
  
  /** Memory usage during processing */
  memoryUsage: number;
  
  /** Any performance bottlenecks identified */
  bottlenecks: string[];
} 