import path from 'path';

export interface MonitoringConfig {
  checkInterval: number;
  mpcCheckSchedule: string;
  gitCheckSchedule: string;
  outputPath: string;
  contextHubPath: string;
}

const defaultConfig: MonitoringConfig = {
  // Check every 5 minutes
  checkInterval: 5 * 60 * 1000,
  
  // Check MPC tools every hour
  mpcCheckSchedule: '0 * * * *',
  
  // Check Git changes daily at midnight
  gitCheckSchedule: '0 0 * * *',
  
  // Output paths relative to project root
  outputPath: path.join('data', 'monitoring'),
  contextHubPath: path.join('data', 'context-hub')
};

export function getMonitoringConfig(overrides?: Partial<MonitoringConfig>): MonitoringConfig {
  return {
    ...defaultConfig,
    ...overrides
  };
}

export function validateConfig(config: MonitoringConfig): void {
  const requiredFields: Array<keyof MonitoringConfig> = [
    'checkInterval',
    'mpcCheckSchedule',
    'gitCheckSchedule',
    'outputPath',
    'contextHubPath'
  ];

  for (const field of requiredFields) {
    if (config[field] === undefined) {
      throw new Error(`Missing required configuration field: ${field}`);
    }
  }

  if (config.checkInterval < 1000) {
    throw new Error('checkInterval must be at least 1000ms');
  }

  // Validate cron expressions
  const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])) (\*|([0-6]))$/;
  
  if (!cronRegex.test(config.mpcCheckSchedule)) {
    throw new Error('Invalid cron expression for mpcCheckSchedule');
  }

  if (!cronRegex.test(config.gitCheckSchedule)) {
    throw new Error('Invalid cron expression for gitCheckSchedule');
  }
} 