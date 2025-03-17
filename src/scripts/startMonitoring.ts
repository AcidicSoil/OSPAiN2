import { getMonitoringConfig, validateConfig } from '../config/monitoring';
import { MCPMonitoringService } from '../services/MCPMonitoringService';

async function main() {
  try {
    // Get configuration
    const config = getMonitoringConfig();
    validateConfig(config);

    // Create and start monitoring service
    const monitoringService = new MCPMonitoringService(config);

    // Handle monitoring events
    monitoringService.on('monitoringComplete', (result) => {
      console.log('Monitoring cycle completed:', new Date().toISOString());
      console.log('Results:', result);
    });

    monitoringService.on('error', (error) => {
      console.error('Monitoring error:', error);
    });

    // Start monitoring
    await monitoringService.startMonitoring();
    console.log('Monitoring service started');

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('Shutting down monitoring service...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start monitoring service:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 