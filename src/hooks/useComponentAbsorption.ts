/**
 * React hook for component absorption
 * 
 * This hook provides a convenient interface for using the component absorption system
 * in React components.
 */

import { useCallback, useEffect, useState } from 'react';
import { componentAbsorber } from '../tools/absorption/componentAbsorber';
import {
    AbsorptionStatus,
    ComponentAbsorption,
    ComponentAdaptation,
    ComponentEvaluation,
    TestingProtocol,
} from '../types/absorption';

/**
 * Hook return type
 */
interface UseComponentAbsorptionReturn {
  absorptions: ComponentAbsorption[];
  absorptionsByStatus: Record<AbsorptionStatus, ComponentAbsorption[]>;
  testingProtocols: TestingProtocol[];
  summary: {
    total: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
  startAbsorption: (evaluation: ComponentEvaluation, targetLocation: string) => ComponentAbsorption;
  recordAdaptation: (componentId: string, adaptation: ComponentAdaptation) => void;
  logAbsorptionMessage: (componentId: string, message: string) => void;
  completeAbsorption: (componentId: string, success: boolean, error?: string) => ComponentAbsorption;
  getAbsorption: (componentId: string) => ComponentAbsorption | undefined;
  getTestingProtocol: (protocolId: string) => TestingProtocol | undefined;
  refreshData: () => void;
}

/**
 * Hook for using the component absorption system
 * @returns Methods and data for working with the component absorption system
 */
export function useComponentAbsorption(): UseComponentAbsorptionReturn {
  const [absorptions, setAbsorptions] = useState<ComponentAbsorption[]>([]);
  const [testingProtocols, setTestingProtocols] = useState<TestingProtocol[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
  });

  // Group absorptions by status
  const absorptionsByStatus = {
    [AbsorptionStatus.NOT_STARTED]: absorptions.filter(a => a.status === AbsorptionStatus.NOT_STARTED),
    [AbsorptionStatus.IN_PROGRESS]: absorptions.filter(a => a.status === AbsorptionStatus.IN_PROGRESS),
    [AbsorptionStatus.COMPLETED]: absorptions.filter(a => a.status === AbsorptionStatus.COMPLETED),
    [AbsorptionStatus.FAILED]: absorptions.filter(a => a.status === AbsorptionStatus.FAILED),
  };

  // Refresh data from the absorption system
  const refreshData = useCallback(() => {
    setAbsorptions(componentAbsorber.getAllAbsorptions());
    setTestingProtocols(componentAbsorber.getAllTestingProtocols());
    setSummary(componentAbsorber.getAbsorptionSummary());
  }, []);

  // Start absorption process
  const startAbsorption = useCallback((evaluation: ComponentEvaluation, targetLocation: string) => {
    const result = componentAbsorber.startAbsorption(evaluation, targetLocation);
    refreshData();
    return result;
  }, [refreshData]);

  // Record adaptation
  const recordAdaptation = useCallback((componentId: string, adaptation: ComponentAdaptation) => {
    componentAbsorber.recordAdaptation(componentId, adaptation);
    refreshData();
  }, [refreshData]);

  // Log message
  const logAbsorptionMessage = useCallback((componentId: string, message: string) => {
    componentAbsorber.logAbsorptionMessage(componentId, message);
    refreshData();
  }, [refreshData]);

  // Complete absorption
  const completeAbsorption = useCallback((componentId: string, success: boolean, error?: string) => {
    const result = componentAbsorber.completeAbsorption(componentId, success, error);
    refreshData();
    return result;
  }, [refreshData]);

  // Get absorption
  const getAbsorption = useCallback((componentId: string) => {
    return componentAbsorber.getAbsorption(componentId);
  }, []);

  // Get testing protocol
  const getTestingProtocol = useCallback((protocolId: string) => {
    return componentAbsorber.getTestingProtocol(protocolId);
  }, []);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    absorptions,
    absorptionsByStatus,
    testingProtocols,
    summary,
    startAbsorption,
    recordAdaptation,
    logAbsorptionMessage,
    completeAbsorption,
    getAbsorption,
    getTestingProtocol,
    refreshData,
  };
} 