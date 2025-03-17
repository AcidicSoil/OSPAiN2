/**
 * Component Absorption System
 *
 * This utility manages the process of absorbing components from external repositories
 * into the OSPAiN2 ecosystem based on evaluation results from the component evaluation system.
 */

import {
    AbsorptionStatus,
    ComponentAbsorption,
    ComponentAdaptation,
    ComponentEvaluation,
    ComponentEvaluationStatus,
    TestingProtocol,
} from '../../types/absorption';

/**
 * Component Absorber manages the process of absorbing external components
 * into the OSPAiN2 ecosystem.
 */
class ComponentAbsorber {
  private static instance: ComponentAbsorber;
  private absorptions: Map<string, ComponentAbsorption> = new Map();
  private testingProtocols: Map<string, TestingProtocol> = new Map();

  private constructor() {
    // Initialize with standard testing protocols
    this.initializeTestingProtocols();
  }

  /**
   * Get the singleton instance of the ComponentAbsorber
   * @returns The ComponentAbsorber instance
   */
  public static getInstance(): ComponentAbsorber {
    if (!ComponentAbsorber.instance) {
      ComponentAbsorber.instance = new ComponentAbsorber();
    }
    return ComponentAbsorber.instance;
  }

  /**
   * Initialize standard testing protocols
   */
  private initializeTestingProtocols(): void {
    // Initialize standard testing protocols
    const renderPerformanceProtocol: TestingProtocol = {
      id: "test-render-perf",
      name: "Render Performance Protocol",
      description:
        "Tests the rendering performance of the component under various conditions",
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
          expectedOutcome:
            "Render time below threshold (100ms for initial, 50ms for re-render)",
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

    this.testingProtocols.set(
      renderPerformanceProtocol.id,
      renderPerformanceProtocol
    );

    // Add accessibility testing protocol
    const accessibilityProtocol: TestingProtocol = {
      id: "test-accessibility",
      name: "Accessibility Testing Protocol",
      description: "Tests the component's accessibility compliance",
      steps: [
        {
          id: "a11y-step-1",
          description: "Screen reader compatibility",
          action: "Test with screen readers (NVDA, VoiceOver)",
          expectedOutcome: "All content is properly announced",
          automated: false,
        },
        {
          id: "a11y-step-2",
          description: "Keyboard navigation",
          action: "Test keyboard-only navigation through the component",
          expectedOutcome: "All interactive elements are reachable via keyboard",
          automated: true,
        },
        {
          id: "a11y-step-3",
          description: "Color contrast",
          action: "Test color contrast ratios",
          expectedOutcome: "All text meets WCAG AA contrast requirements",
          automated: true,
        },
      ],
      expectedResults: [
        "Component is fully navigable via keyboard",
        "Component works with screen readers",
        "Visual elements have sufficient contrast",
      ],
    };

    this.testingProtocols.set(accessibilityProtocol.id, accessibilityProtocol);
  }

  /**
   * Start the absorption process for a component
   * @param evaluation Component evaluation result
   * @param targetLocation Where the component should be placed in the codebase
   * @returns The created absorption record
   */
  public startAbsorption(
    evaluation: ComponentEvaluation,
    targetLocation: string
  ): ComponentAbsorption {
    // Check if component is eligible for absorption
    if (evaluation.status !== ComponentEvaluationStatus.ABSORBED) {
      throw new Error(
        `Component ${evaluation.componentName} is not eligible for absorption (status: ${evaluation.status})`
      );
    }

    // Create absorption record
    const absorption: ComponentAbsorption = {
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
  public recordAdaptation(
    componentId: string,
    adaptation: ComponentAdaptation
  ): void {
    const absorption = this.absorptions.get(componentId);

    if (!absorption) {
      throw new Error(
        `No active absorption process found for component ${componentId}`
      );
    }

    // Add to adaptations
    absorption.absorptionLogs.push(
      `[${new Date().toISOString()}] Adaptation: ${adaptation.description}`
    );
    absorption.adaptations.push(adaptation);

    // Update in registry
    this.absorptions.set(componentId, absorption);
  }

  /**
   * Log a message to the absorption process
   * @param componentId Component ID
   * @param message Log message
   */
  public logAbsorptionMessage(componentId: string, message: string): void {
    const absorption = this.absorptions.get(componentId);

    if (!absorption) {
      throw new Error(
        `No active absorption process found for component ${componentId}`
      );
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
  public completeAbsorption(
    componentId: string,
    success: boolean,
    error?: string
  ): ComponentAbsorption {
    const absorption = this.absorptions.get(componentId);

    if (!absorption) {
      throw new Error(
        `No active absorption process found for component ${componentId}`
      );
    }

    // Update status
    absorption.status = success
      ? AbsorptionStatus.COMPLETED
      : AbsorptionStatus.FAILED;
    absorption.completionTime = new Date();

    if (error) {
      absorption.error = error;
      absorption.absorptionLogs.push(
        `[${new Date().toISOString()}] Error: ${error}`
      );
    } else {
      absorption.absorptionLogs.push(
        `[${new Date().toISOString()}] Absorption completed successfully`
      );
    }

    // Update in registry
    this.absorptions.set(componentId, absorption);

    return absorption;
  }

  /**
   * Get testing protocol by ID
   * @param protocolId Protocol ID
   * @returns Testing protocol or undefined if not found
   */
  public getTestingProtocol(protocolId: string): TestingProtocol | undefined {
    return this.testingProtocols.get(protocolId);
  }

  /**
   * Add a new testing protocol
   * @param protocol Testing protocol to add
   */
  public addTestingProtocol(protocol: TestingProtocol): void {
    this.testingProtocols.set(protocol.id, protocol);
  }

  /**
   * Get all testing protocols
   * @returns Array of all testing protocols
   */
  public getAllTestingProtocols(): TestingProtocol[] {
    return Array.from(this.testingProtocols.values());
  }

  /**
   * Get absorption by component ID
   * @param componentId Component ID
   * @returns Component absorption details
   */
  public getAbsorption(componentId: string): ComponentAbsorption | undefined {
    return this.absorptions.get(componentId);
  }

  /**
   * Get all component absorptions
   * @returns Array of all component absorptions
   */
  public getAllAbsorptions(): ComponentAbsorption[] {
    return Array.from(this.absorptions.values());
  }

  /**
   * Get absorptions by status
   * @param status Absorption status
   * @returns Array of component absorptions with the specified status
   */
  public getAbsorptionsByStatus(
    status: AbsorptionStatus
  ): ComponentAbsorption[] {
    return this.getAllAbsorptions().filter((a) => a.status === status);
  }

  /**
   * Get absorption summary
   * @returns Summary of absorption status counts
   */
  public getAbsorptionSummary(): {
    total: number;
    inProgress: number;
    completed: number;
    failed: number;
  } {
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

// Export the singleton instance
export const componentAbsorber = ComponentAbsorber.getInstance(); 