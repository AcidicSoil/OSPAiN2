import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MCPMonitoringService } from '../MCPMonitoringService';

describe('MCPMonitoringService', () => {
  let service: MCPMonitoringService;

  beforeEach(() => {
    service = new MCPMonitoringService({
      checkInterval: 1000,
      mpcCheckSchedule: '0 * * * *', // Every hour
      gitCheckSchedule: '0 0 * * *', // Daily
      outputPath: './monitoring-output',
      contextHubPath: './context-hub'
    });
  });

  describe('initialization', () => {
    it('should create a new instance with config', () => {
      expect(service).toBeInstanceOf(MCPMonitoringService);
      expect(service.getLastCheckTime()).toBeInstanceOf(Date);
    });

    it('should have monitoring stats initialized', () => {
      const stats = service.getMonitoringStats();
      expect(stats).toHaveProperty('toolsCount');
      expect(stats).toHaveProperty('changesCount');
      expect(stats).toHaveProperty('lastCheck');
      expect(stats).toHaveProperty('workflowStatus');
    });
  });

  describe('monitoring workflow', () => {
    it('should emit monitoringComplete event after cycle', async () => {
      const monitoringComplete = jest.fn();
      service.on('monitoringComplete', monitoringComplete);

      await service.startMonitoring();
      
      // Wait for one monitoring cycle
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(monitoringComplete).toHaveBeenCalled();
      const [result] = monitoringComplete.mock.calls[0];
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('results');
    });

    it('should emit error event on workflow failure', async () => {
      const errorHandler = jest.fn();
      service.on('error', errorHandler);

      // Force an error by breaking the workflow
      const workflow = (service as any).workflow;
      const mockExecute = jest.fn<() => Promise<Map<string, any>>>();
      mockExecute.mockRejectedValue(new Error('Workflow error'));
      workflow.execute = mockExecute;

      await service.startMonitoring();
      
      // Wait for one monitoring cycle
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(errorHandler).toHaveBeenCalled();
      const error = errorHandler.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Workflow error');
    });
  });

  describe('monitoring results', () => {
    it('should update last check time after monitoring cycle', async () => {
      const initialCheckTime = service.getLastCheckTime().getTime();
      
      await service.startMonitoring();
      
      // Wait for one monitoring cycle
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const newCheckTime = service.getLastCheckTime().getTime();
      expect(newCheckTime).toBeGreaterThan(initialCheckTime);
    });

    it('should update monitoring stats after cycle', async () => {
      const initialStats = service.getMonitoringStats();
      
      await service.startMonitoring();
      
      // Wait for one monitoring cycle
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const newStats = service.getMonitoringStats();
      expect(newStats.lastCheck.getTime()).toBeGreaterThan(initialStats.lastCheck.getTime());
    });
  });
}); 