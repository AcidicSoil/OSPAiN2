/**
 * Component Absorption System
 * 
 * This module provides tools for absorbing components from external repositories
 * into the OSPAiN2 ecosystem.
 */

// Export the absorption tool components
export * from '../../types/absorption';
export { componentAbsorber } from './componentAbsorber';

// Export the implementation details
import { ComponentEvaluation, ComponentEvaluationStatus } from '../../types/absorption';
import { componentAbsorber } from './componentAbsorber';

/**
 * Start the absorption process for a component
 * This is a convenience function for starting the absorption process
 * 
 * @param componentName Name of the component
 * @param sourceRepo Source repository URL
 * @param targetLocation Target location in the codebase
 * @returns The component absorption record
 */
export function startComponentAbsorption(
  componentName: string,
  sourceRepo: string, 
  targetLocation: string
): ReturnType<typeof componentAbsorber.startAbsorption> {
  // Create a simple evaluation for the component
  const evaluation: ComponentEvaluation = {
    componentId: `${componentName}-${Date.now()}`,
    componentName,
    sourceRepo,
    evaluationDate: new Date(),
    status: ComponentEvaluationStatus.ABSORBED,
  };

  // Start the absorption process
  return componentAbsorber.startAbsorption(evaluation, targetLocation);
}

/**
 * Utility function to absorb a component with logging
 * This is a higher-level function that handles the entire absorption process
 * 
 * @param componentName Name of the component
 * @param sourceRepo Source repository URL
 * @param targetLocation Target location in the codebase
 * @param adaptations List of adaptations to record
 * @returns The completed absorption record
 */
export async function absorbComponent(
  componentName: string,
  sourceRepo: string,
  targetLocation: string,
  adaptations: Array<{
    type: "rename" | "modify" | "dependency" | "interface" | "style" | "other";
    description: string;
    before?: string;
    after?: string;
    reason: string;
  }> = []
): Promise<ReturnType<typeof componentAbsorber.completeAbsorption>> {
  try {
    // Start absorption
    const absorption = startComponentAbsorption(
      componentName,
      sourceRepo,
      targetLocation
    );

    // Log start
    componentAbsorber.logAbsorptionMessage(
      absorption.componentId,
      `Starting absorption of ${componentName} from ${sourceRepo} to ${targetLocation}`
    );

    // Record adaptations
    for (const adaptation of adaptations) {
      componentAbsorber.recordAdaptation(absorption.componentId, adaptation);
    }

    // Log completion
    componentAbsorber.logAbsorptionMessage(
      absorption.componentId,
      `Absorption completed with ${adaptations.length} adaptations`
    );

    // Complete absorption
    return componentAbsorber.completeAbsorption(absorption.componentId, true);
  } catch (error) {
    console.error(`Error absorbing component ${componentName}: ${(error as Error).message}`);
    throw error;
  }
} 