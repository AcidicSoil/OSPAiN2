import { describe, expect, it } from '@jest/globals';
import path from 'path';
import { getMonitoringConfig, MonitoringConfig, validateConfig } from '../monitoring';

describe('Monitoring Configuration', () => {
  describe('getMonitoringConfig', () => {
    it('should return default config when no overrides provided', () => {
      const config = getMonitoringConfig();
      expect(config).toEqual({
        checkInterval: 5 * 60 * 1000,
        mpcCheckSchedule: '0 * * * *',
        gitCheckSchedule: '0 0 * * *',
        outputPath: path.join('data', 'monitoring'),
        contextHubPath: path.join('data', 'context-hub')
      });
    });

    it('should merge overrides with default config', () => {
      const overrides = {
        checkInterval: 1000,
        outputPath: 'custom/path'
      };
      const config = getMonitoringConfig(overrides);
      expect(config).toEqual({
        checkInterval: 1000,
        mpcCheckSchedule: '0 * * * *',
        gitCheckSchedule: '0 0 * * *',
        outputPath: 'custom/path',
        contextHubPath: path.join('data', 'context-hub')
      });
    });
  });

  describe('validateConfig', () => {
    it('should not throw for valid config', () => {
      const config: MonitoringConfig = {
        checkInterval: 1000,
        mpcCheckSchedule: '0 * * * *',
        gitCheckSchedule: '0 0 * * *',
        outputPath: 'path/to/output',
        contextHubPath: 'path/to/context'
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const config = {
        checkInterval: 1000,
        mpcCheckSchedule: '0 * * * *'
      } as MonitoringConfig;
      expect(() => validateConfig(config)).toThrow('Missing required configuration field');
    });

    it('should throw for invalid check interval', () => {
      const config: MonitoringConfig = {
        checkInterval: 500,
        mpcCheckSchedule: '0 * * * *',
        gitCheckSchedule: '0 0 * * *',
        outputPath: 'path/to/output',
        contextHubPath: 'path/to/context'
      };
      expect(() => validateConfig(config)).toThrow('checkInterval must be at least 1000ms');
    });

    it('should throw for invalid MPC check schedule', () => {
      const config: MonitoringConfig = {
        checkInterval: 1000,
        mpcCheckSchedule: 'invalid',
        gitCheckSchedule: '0 0 * * *',
        outputPath: 'path/to/output',
        contextHubPath: 'path/to/context'
      };
      expect(() => validateConfig(config)).toThrow('Invalid cron expression for mpcCheckSchedule');
    });

    it('should throw for invalid Git check schedule', () => {
      const config: MonitoringConfig = {
        checkInterval: 1000,
        mpcCheckSchedule: '0 * * * *',
        gitCheckSchedule: 'invalid',
        outputPath: 'path/to/output',
        contextHubPath: 'path/to/context'
      };
      expect(() => validateConfig(config)).toThrow('Invalid cron expression for gitCheckSchedule');
    });
  });
}); 