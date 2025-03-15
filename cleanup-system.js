#!/usr/bin/env node

/**
 * CleanupSystem - Command interface for the CleanupAgent workflow
 * 
 * This script provides a structured command-line interface to the CleanupAgent
 * with additional utilities for horizon management and reporting.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { program } = require('commander');

// Default configuration
const CONFIG = {
  cleanupAgentPath: './cleanup-agent.js',
  horizonMapPath: '@horizon-map.mdc',
  researchLevelsPath: '.cursor/memory/research-levels-framework.mdc',
  oaclPath: '.cursor/memory/oacl.mdc',
  outputDir: './cleanup-reports',
  t2pCommand: 't2p',
  developmentModesCommand: './development-modes/m'
};

// Ensure required files exist
function checkEnvironment() {
  if (!fs.existsSync(CONFIG.cleanupAgentPath)) {
    console.error(`❌ Error: Cleanup agent not found at ${CONFIG.cleanupAgentPath}`);
    process.exit(1);
  }

  // Create output directory if not exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    try {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${CONFIG.outputDir}`);
    } catch (error) {
      console.warn(`⚠️ Warning: Could not create output directory: ${error.message}`);
    }
  }
  
  // Check for development modes script
  if (!fs.existsSync(CONFIG.developmentModesCommand)) {
    console.warn(`⚠️ Warning: Development modes script not found at ${CONFIG.developmentModesCommand}`);
    console.warn('Mode switching will be skipped.');
  }
  
  // Check for t2p command
  try {
    execSync(`${CONFIG.t2pCommand} --version`, { stdio: 'ignore' });
  } catch (error) {
    console.warn(`⚠️ Warning: t2p command not available. Todo integration will be skipped.`);
  }
}

// Format date for filenames and displays
function formatDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// Run cleanup agent with specified options
async function runCleanupAgent(options) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      CONFIG.outputDir, 
      `cleanup-report-${options.label || formatDate()}.md`
    );
    
    // Build arguments for cleanup agent
    const args = [
      CONFIG.cleanupAgentPath,
      `--dry-run=${options.dryRun !== false}`,
      `--output=${outputPath}`,
      `--age-threshold=${options.ageThreshold || 30}`,
      `--verbose=${options.verbose !== false}`
    ];
    
    console.log(`🚀 Running cleanup agent with arguments:`);
    console.log(`  ${args.join(' ')}`);
    
    // Spawn process to run cleanup agent
    const cleanupProcess = spawn('node', args, {
      stdio: 'inherit'
    });
    
    cleanupProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Cleanup agent completed successfully`);
        console.log(`📝 Report saved to: ${outputPath}`);
        resolve(outputPath);
      } else {
        console.error(`❌ Cleanup agent failed with code ${code}`);
        reject(new Error(`Cleanup agent failed with code ${code}`));
      }
    });
  });
}

// Switch to maintenance mode using the development modes script
async function switchToMaintenanceMode(reason) {
  if (!fs.existsSync(CONFIG.developmentModesCommand)) {
    console.log(`⚠️ Skipping mode switch (development modes script not found)`);
    return false;
  }
  
  try {
    console.log(`🔧 Switching to maintenance mode: "${reason}"`);
    execSync(`${CONFIG.developmentModesCommand} switch maint "${reason}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.warn(`⚠️ Warning: Failed to switch mode: ${error.message}`);
    return false;
  }
}

// Add cleanup task to todo list using t2p
async function addCleanupTodoTask(reportPath, options) {
  if (!fs.existsSync(reportPath)) {
    console.warn(`⚠️ Warning: Report file not found at ${reportPath}`);
    return false;
  }
  
  try {
    // Read the report file
    const report = fs.readFileSync(reportPath, 'utf8');
    
    // Extract candidate section
    const candidateSection = report.match(/## Cleanup Candidates\n\n([\s\S]*?)(?=\n## Next Steps|$)/);
    if (!candidateSection || !candidateSection[1]) {
      console.log(`ℹ️ No cleanup candidates found in the report. Skipping todo task.`);
      return false;
    }
    
    // Extract statistics
    const totalFiles = report.match(/- Total files scanned: (\d+)/)?.[1] || '?';
    const analyzed = report.match(/- Files analyzed: (\d+)/)?.[1] || '?';
    const candidates = report.match(/- Potential cleanup candidates: (\d+)/)?.[1] || '0';
    
    if (candidates === '0') {
      console.log(`ℹ️ No cleanup candidates found. Skipping todo task.`);
      return false;
    }
    
    // Create description with summary and top candidates
    const candidateSummary = candidateSection[1].trim().split('###').slice(1, 4)
      .map(c => `### ${c.trim()}`)
      .join('\n\n');
    
    const description = [
      `Cleanup report summary:`,
      `- Total files scanned: ${totalFiles}`,
      `- Files analyzed: ${analyzed}`,
      `- Potential cleanup candidates: ${candidates}`,
      ``,
      `Top candidates for review:`,
      ``,
      `${candidateSummary}`,
      ``,
      `Full report available at: ${reportPath}`
    ].join('\n');
    
    // Create the t2p command
    const todoTitle = options.todoTitle || `Review cleanup candidates (${formatDate()})`;
    const todoTags = options.todoTags || 'cleanup,maintenance';
    const todoCategory = options.todoCategory || 'Maintenance';
    const todoPriority = options.todoPriority || 3;
    const todoHorizon = options.todoHorizon || 'H1';
    
    // Create a temporary file with the description
    const tempDescPath = path.join(CONFIG.outputDir, 'temp-description.txt');
    fs.writeFileSync(tempDescPath, description);
    
    // Execute the t2p command
    console.log(`📝 Adding cleanup task to todo list`);
    execSync(
      `${CONFIG.t2pCommand} todo add --priority ${todoPriority} --horizon ${todoHorizon} ` +
      `--category "${todoCategory}" --tags "${todoTags}" --title "${todoTitle}" ` +
      `--description-file "${tempDescPath}"`, 
      { stdio: 'inherit' }
    );
    
    // Clean up
    fs.unlinkSync(tempDescPath);
    console.log(`✅ Added todo task: "${todoTitle}"`);
    return true;
    
  } catch (error) {
    console.warn(`⚠️ Warning: Failed to add todo task: ${error.message}`);
    return false;
  }
}

// Update horizon map with files that should be preserved
async function updateHorizonMap(reportPath, options) {
  if (!options.autoUpdateHorizon) {
    console.log(`ℹ️ Skipping horizon map update (auto-update not enabled)`);
    return false;
  }
  
  if (!fs.existsSync(CONFIG.horizonMapPath)) {
    console.warn(`⚠️ Warning: Horizon map not found at ${CONFIG.horizonMapPath}`);
    return false;
  }
  
  if (!fs.existsSync(reportPath)) {
    console.warn(`⚠️ Warning: Report file not found at ${reportPath}`);
    return false;
  }
  
  try {
    // Read the report and horizon map
    const report = fs.readFileSync(reportPath, 'utf8');
    const horizonMap = fs.readFileSync(CONFIG.horizonMapPath, 'utf8');
    
    // Extract candidates and filter for files to preserve
    const candidateSection = report.match(/## Cleanup Candidates\n\n([\s\S]*?)(?=\n## Next Steps|$)/);
    if (!candidateSection || !candidateSection[1]) {
      console.log(`ℹ️ No cleanup candidates found in the report. Skipping horizon update.`);
      return false;
    }
    
    // Extract all candidate file paths
    const candidates = [];
    const candidateRegex = /### (.*?)\n/g;
    let match;
    while ((match = candidateRegex.exec(candidateSection[1])) !== null) {
      candidates.push(match[1].trim());
    }
    
    if (candidates.length === 0) {
      console.log(`ℹ️ No specific file candidates found. Skipping horizon update.`);
      return false;
    }
    
    // Filter for files that should be preserved based on age and criteria
    const filesToPreserve = candidates.filter(filePath => {
      // Only consider existing files that are source code
      if (!fs.existsSync(filePath)) return false;
      const ext = path.extname(filePath).toLowerCase();
      return ['.ts', '.js', '.tsx', '.jsx'].includes(ext);
    });
    
    if (filesToPreserve.length === 0) {
      console.log(`ℹ️ No files need to be preserved in Horizon 1. Skipping horizon update.`);
      return false;
    }
    
    // Find Horizon 1 section in the map
    const h1Section = horizonMap.match(/### Horizon 1 \(Now\)([\s\S]*?)(?=### Horizon 2|$)/);
    if (!h1Section) {
      console.warn(`⚠️ Warning: Could not find Horizon 1 section in horizon map`);
      return false;
    }
    
    // Check which files are not already in Horizon 1
    const h1Content = h1Section[1];
    const filesToAdd = filesToPreserve.filter(file => {
      return !h1Content.includes(`- ${file}`);
    });
    
    if (filesToAdd.length === 0) {
      console.log(`ℹ️ All relevant files are already in Horizon 1. No update needed.`);
      return false;
    }
    
    // Create updated horizon map content
    const updatedH1Section = h1Section[1] + filesToAdd.map(f => `- ${f}\n`).join('');
    const newHorizonMap = horizonMap.replace(h1Section[0], `### Horizon 1 (Now)${updatedH1Section}`);
    
    if (options.dryRun !== false) {
      console.log(`🔍 Horizon map update preview (dry run):`);
      console.log(`The following files would be added to Horizon 1:`);
      filesToAdd.forEach(file => console.log(`- ${file}`));
      return true;
    }
    
    // Write updated horizon map
    fs.writeFileSync(CONFIG.horizonMapPath, newHorizonMap);
    console.log(`✅ Updated horizon map with ${filesToAdd.length} preserved files:`);
    filesToAdd.forEach(file => console.log(`- ${file}`));
    return true;
    
  } catch (error) {
    console.warn(`⚠️ Warning: Failed to update horizon map: ${error.message}`);
    return false;
  }
}

// Run the full cleanup workflow
async function runCleanupWorkflow(options) {
  console.log(`🧹 Starting cleanup workflow`);
  
  // Step 1: Switch to maintenance mode if needed
  if (options.switchMode) {
    const reason = options.modeReason || "Running cleanup workflow";
    await switchToMaintenanceMode(reason);
  }
  
  // Step 2: Run cleanup agent
  let reportPath;
  try {
    reportPath = await runCleanupAgent(options);
  } catch (error) {
    console.error(`❌ Cleanup agent failed: ${error.message}`);
    return false;
  }
  
  // Step 3: Add todo task if needed
  if (options.addTodo) {
    await addCleanupTodoTask(reportPath, options);
  }
  
  // Step 4: Update horizon map if needed
  if (options.updateHorizon) {
    await updateHorizonMap(reportPath, options);
  }
  
  console.log(`✅ Cleanup workflow completed`);
  return true;
}

// Main command line interface
program
  .name('cleanup-system')
  .description('Comprehensive cleanup workflow for the Ollama Ecosystem project')
  .version('1.0.0');

// Analyze command
program
  .command('analyze')
  .description('Run analysis to identify cleanup candidates')
  .option('-d, --dry-run <boolean>', 'Run in dry-run mode (no deletions)', true)
  .option('-a, --age-threshold <days>', 'Minimum age in days to flag files', '30')
  .option('-l, --label <label>', 'Custom label for the report file')
  .option('-v, --verbose <boolean>', 'Enable verbose output', true)
  .option('--add-todo', 'Add cleanup task to todo list', false)
  .option('--todo-title <title>', 'Custom title for todo task')
  .option('--todo-tags <tags>', 'Custom tags for todo task', 'cleanup,maintenance')
  .option('--todo-category <category>', 'Custom category for todo task', 'Maintenance')
  .option('--todo-priority <priority>', 'Custom priority for todo task', '3')
  .option('--todo-horizon <horizon>', 'Custom horizon for todo task', 'H1')
  .option('--switch-mode', 'Switch to maintenance mode before analysis', false)
  .option('--mode-reason <reason>', 'Reason for mode switch', 'Running cleanup analysis')
  .action(async (options) => {
    checkEnvironment();
    await runCleanupWorkflow({
      ...options,
      updateHorizon: false,
      autoUpdateHorizon: false
    });
  });

// Cleanup command
program
  .command('cleanup')
  .description('Execute cleanup with option to delete files')
  .option('-d, --dry-run <boolean>', 'Run in dry-run mode (no deletions)', false)
  .option('-a, --age-threshold <days>', 'Minimum age in days to flag files', '30')
  .option('-l, --label <label>', 'Custom label for the report file')
  .option('-v, --verbose <boolean>', 'Enable verbose output', true)
  .option('--add-todo', 'Add cleanup task to todo list', true)
  .option('--todo-title <title>', 'Custom title for todo task')
  .option('--todo-tags <tags>', 'Custom tags for todo task', 'cleanup,maintenance')
  .option('--todo-category <category>', 'Custom category for todo task', 'Maintenance')
  .option('--todo-priority <priority>', 'Custom priority for todo task', '3')
  .option('--todo-horizon <horizon>', 'Custom horizon for todo task', 'H1')
  .option('--switch-mode', 'Switch to maintenance mode before cleanup', true)
  .option('--mode-reason <reason>', 'Reason for mode switch', 'Running cleanup operation')
  .option('--update-horizon', 'Update horizon map with preserved files', false)
  .option('--auto-update-horizon', 'Automatically update horizon map', false)
  .action(async (options) => {
    checkEnvironment();
    
    // Double-check if user wants to run with actual deletion
    if (options.dryRun === false) {
      console.log(`⚠️ WARNING: You are about to run cleanup with ACTUAL FILE DELETION`);
      console.log(`This operation cannot be undone unless files are in git.`);
      console.log(`Press Ctrl+C to cancel, or wait 5 seconds to proceed...`);
      
      // Wait 5 seconds before proceeding
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    await runCleanupWorkflow(options);
  });

// Horizon command
program
  .command('horizon')
  .description('Manage horizon classifications for cleanup')
  .option('-r, --report <path>', 'Path to cleanup report', '')
  .option('-d, --dry-run <boolean>', 'Run in dry-run mode (no changes)', true)
  .action(async (options) => {
    checkEnvironment();
    
    let reportPath = options.report;
    if (!reportPath || !fs.existsSync(reportPath)) {
      // Find latest report if not specified
      const reports = fs.readdirSync(CONFIG.outputDir)
        .filter(f => f.startsWith('cleanup-report-') && f.endsWith('.md'))
        .map(f => path.join(CONFIG.outputDir, f));
      
      if (reports.length === 0) {
        console.error(`❌ Error: No cleanup reports found in ${CONFIG.outputDir}`);
        process.exit(1);
      }
      
      // Sort by last modified time (newest first)
      reports.sort((a, b) => {
        return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
      });
      
      reportPath = reports[0];
      console.log(`ℹ️ Using latest report: ${reportPath}`);
    }
    
    await updateHorizonMap(reportPath, {
      ...options,
      autoUpdateHorizon: true
    });
  });

// Weekly command
program
  .command('weekly')
  .description('Run weekly cleanup check')
  .option('-d, --dry-run <boolean>', 'Run in dry-run mode (no deletions)', true)
  .option('-a, --age-threshold <days>', 'Minimum age in days to flag files', '30')
  .option('-v, --verbose <boolean>', 'Enable verbose output', true)
  .action(async (options) => {
    checkEnvironment();
    
    const date = formatDate();
    await runCleanupWorkflow({
      ...options,
      label: `weekly-${date}`,
      switchMode: true,
      modeReason: "Weekly cleanup check",
      addTodo: true,
      todoTitle: `Weekly Cleanup Check (${date})`,
      todoTags: "cleanup,weekly,maintenance",
      updateHorizon: false,
      autoUpdateHorizon: false
    });
  });

// Execute the CLI
program.parse(process.argv); 