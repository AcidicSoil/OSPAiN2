#!/usr/bin/env node

/**
 * Context System Runner
 * 
 * Main entry point for running the entire context system pipeline,
 * which distributes context across files, generates transition maps,
 * and creates visualizations.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const OUTPUT_DIR = '.cursor/context-system';
const LOG_FILE = path.join(OUTPUT_DIR, 'run-log.txt');

// Pipeline steps
const PIPELINE_STEPS = [
  {
    name: 'Context Distribution',
    script: 'context-distributor.js',
    description: 'Analyzes files and distributes context across related files'
  },
  {
    name: 'Context Transition Management',
    script: 'context-transition-manager.js',
    description: 'Creates transition maps for smooth navigation between contexts'
  },
  {
    name: 'Context Visualization',
    script: 'context-visualization.js',
    description: 'Generates interactive visualization of context relationships'
  }
];

// Main function
async function main() {
  console.log('Context System Runner');
  console.log('===================');
  console.log('Running the complete context system pipeline\n');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Initialize log file
  const timestamp = new Date().toISOString();
  fs.writeFileSync(LOG_FILE, `Context System Run - ${timestamp}\n\n`);

  // Run each step in the pipeline
  for (let i = 0; i < PIPELINE_STEPS.length; i++) {
    const step = PIPELINE_STEPS[i];
    
    console.log(`Step ${i+1}/${PIPELINE_STEPS.length}: ${step.name}`);
    console.log(`Description: ${step.description}`);
    
    try {
      // Run the script
      await runScript(step.script);
      
      // Log success
      logMessage(`✅ ${step.name} completed successfully`);
      console.log(`✅ Completed successfully\n`);
    } catch (error) {
      // Log error
      logMessage(`❌ ${step.name} failed: ${error.message}`);
      console.error(`❌ Failed: ${error.message}\n`);
      
      // Stop pipeline on failure (optional)
      if (!await promptContinue()) {
        console.log('Pipeline execution stopped');
        logMessage('Pipeline execution stopped by user');
        process.exit(1);
      }
    }
  }

  console.log('Context System Pipeline Complete!');
  console.log(`Results available in ${OUTPUT_DIR} and related directories`);
  logMessage('Pipeline execution completed successfully');
}

// Run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${scriptPath}...`);
    
    // Log the command
    logMessage(`Running: node ${scriptPath}`);
    
    // Spawn process to run the script
    const process = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(new Error(`Failed to start script: ${err.message}`));
    });
  });
}

// Log a message to the log file
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  fs.appendFileSync(LOG_FILE, logEntry);
}

// Prompt user to continue after failure
function promptContinue() {
  return new Promise((resolve) => {
    console.log('Continue with next step? (y/n)');
    
    process.stdin.once('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      resolve(input === 'y' || input === 'yes');
    });
  });
}

// Function to display help information
function showHelp() {
  console.log(`
Context System Runner - Help
===========================

This script runs the entire context system pipeline, which consists of:

1. Context Distribution: Analyzes files and distributes context across related files
2. Context Transition Management: Creates transition maps for smooth navigation
3. Context Visualization: Generates interactive visualization of context relationships

Usage:
  node context-runner.js [options]

Options:
  --help, -h     Show this help message
  --skip=<step>  Skip a specific step (1, 2, or 3)
  --only=<step>  Run only a specific step (1, 2, or 3)

Examples:
  node context-runner.js
  node context-runner.js --skip=3
  node context-runner.js --only=2
  `);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    skip: [],
    only: null,
    help: false
  };
  
  args.forEach(arg => {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--skip=')) {
      const step = parseInt(arg.split('=')[1]);
      if (!isNaN(step) && step >= 1 && step <= PIPELINE_STEPS.length) {
        options.skip.push(step - 1);
      }
    } else if (arg.startsWith('--only=')) {
      const step = parseInt(arg.split('=')[1]);
      if (!isNaN(step) && step >= 1 && step <= PIPELINE_STEPS.length) {
        options.only = step - 1;
      }
    }
  });
  
  return options;
}

// Entry point
const options = parseArgs();

if (options.help) {
  showHelp();
} else {
  // Apply options to pipeline
  let stepsToRun = [...Array(PIPELINE_STEPS.length).keys()];
  
  if (options.only !== null) {
    stepsToRun = [options.only];
  } else if (options.skip.length > 0) {
    stepsToRun = stepsToRun.filter(step => !options.skip.includes(step));
  }
  
  // Adjust pipeline steps
  const filteredPipeline = stepsToRun.map(index => PIPELINE_STEPS[index]);
  PIPELINE_STEPS.length = 0;
  PIPELINE_STEPS.push(...filteredPipeline);
  
  // Run the pipeline
  main().catch(error => {
    console.error('Pipeline failed:', error);
    logMessage(`Pipeline failed: ${error.message}`);
    process.exit(1);
  });
} 