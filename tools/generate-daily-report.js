#!/usr/bin/env node

/**
 * Comprehensive Daily Report Generator
 * 
 * This script generates a detailed daily report including:
 * - Documentation progress
 * - Task completion status
 * - System metrics
 * - Project milestones
 * - TODO items
 * 
 * Usage:
 *   node generate-daily-report.js [--output /path/to/output.md] [--template /path/to/template.md]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Default paths
const DEFAULT_TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'daily-report-template.md');
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'daily');
const DEFAULT_TODO_FILE = path.join(__dirname, '..', 'TODO.md');
const DEFAULT_PROJECT_DATA = path.join(__dirname, '..', 'data', 'project.json');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsedArgs = {
    output: null,
    template: DEFAULT_TEMPLATE_PATH,
    notify: false,
    todoFile: DEFAULT_TODO_FILE,
    projectData: DEFAULT_PROJECT_DATA
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      parsedArgs.output = args[i + 1];
      i++;
    } else if (args[i] === '--template' && i + 1 < args.length) {
      parsedArgs.template = args[i + 1];
      i++;
    } else if (args[i] === '--notify') {
      parsedArgs.notify = true;
    } else if (args[i] === '--todo-file' && i + 1 < args.length) {
      parsedArgs.todoFile = args[i + 1];
      i++;
    } else if (args[i] === '--project-data' && i + 1 < args.length) {
      parsedArgs.projectData = args[i + 1];
      i++;
    }
  }
  
  return parsedArgs;
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

/**
 * Get formatted current date with month name
 */
function getFormattedDate() {
  const date = new Date();
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Load project data from JSON file
 */
function loadProjectData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      console.warn(`Project data file ${filePath} not found. Using default values.`);
      return {
        name: 'Ollama Ecosystem',
        version: '1.0.0',
        milestones: [],
        documentation: {
          files: []
        },
        metrics: {
          test_coverage: 85,
          code_quality: 90
        }
      };
    }
  } catch (error) {
    console.error('Error loading project data:', error.message);
    return null;
  }
}

/**
 * Parse TODO file for tasks
 */
function parseTodoFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`TODO file ${filePath} not found. Skipping TODO items.`);
    return { priorityTasks: [], additionalTasks: [], nextSteps: [] };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple parser for TODO file format with emoji status indicators
    const priorityTasks = [];
    const additionalTasks = [];
    const nextSteps = [];
    
    let currentSection = null;
    let currentTask = null;
    
    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('## Priority Tasks')) {
        currentSection = 'priority';
      } else if (trimmedLine.startsWith('## Additional Tasks')) {
        currentSection = 'additional';
      } else if (trimmedLine.startsWith('## Next Steps')) {
        currentSection = 'next';
      } else if (trimmedLine.startsWith('#') || trimmedLine === '') {
        // Skip other headers or empty lines
        return;
      } else if (trimmedLine.startsWith('🔴') || 
                 trimmedLine.startsWith('🟢') || 
                 trimmedLine.startsWith('🟡') || 
                 trimmedLine.startsWith('🔵')) {
        // New task with status emoji
        const status = trimmedLine.substring(0, 2);
        const title = trimmedLine.substring(2).trim();
        
        currentTask = {
          status,
          title,
          details: []
        };
        
        if (currentSection === 'priority') {
          priorityTasks.push(currentTask);
        } else if (currentSection === 'additional') {
          additionalTasks.push(currentTask);
        } else if (currentSection === 'next') {
          nextSteps.push(currentTask);
        }
      } else if (currentTask && !trimmedLine.startsWith('-') && trimmedLine !== '') {
        // Continuation of task title (unusual case)
        currentTask.title += ' ' + trimmedLine;
      } else if (currentTask && trimmedLine.startsWith('-')) {
        // Task detail
        currentTask.details.push(trimmedLine.substring(1).trim());
      }
    });
    
    return { priorityTasks, additionalTasks, nextSteps };
  } catch (error) {
    console.error('Error parsing TODO file:', error.message);
    return { priorityTasks: [], additionalTasks: [], nextSteps: [] };
  }
}

/**
 * Gather documentation metrics
 */
function getDocumentationMetrics() {
  try {
    // Get stats for markdown files
    const findCommand = 'find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/\\.*" | wc -l';
    const countCommand = 'find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/\\.*" -exec wc -l {} \\; | awk \'{sum += $1} END {print sum}\'';
    
    const fileCount = parseInt(execSync(findCommand).toString().trim(), 10) || 0;
    const lineCount = parseInt(execSync(countCommand).toString().trim(), 10) || 0;
    
    // Get documentation files modified in the last 24 hours
    const recentCommand = 'find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/\\.*" -mtime -1 | wc -l';
    const recentCount = parseInt(execSync(recentCommand).toString().trim(), 10) || 0;
    
    return {
      totalFiles: fileCount,
      totalLines: lineCount,
      recentlyModified: recentCount,
      averageLinesPerFile: fileCount > 0 ? Math.round(lineCount / fileCount) : 0
    };
  } catch (error) {
    console.error('Error gathering documentation metrics:', error.message);
    return {
      totalFiles: 0,
      totalLines: 0,
      recentlyModified: 0,
      averageLinesPerFile: 0
    };
  }
}

/**
 * Get system metrics
 */
function getSystemMetrics() {
  try {
    const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
    
    // Get disk usage
    let diskUsage = '0%';
    try {
      if (process.platform === 'win32') {
        // Windows
        const diskCommand = 'wmic logicaldisk get freespace,size';
        const diskOutput = execSync(diskCommand).toString().trim();
        // Parse the output (simplified)
        diskUsage = '0%'; // Placeholder - parsing would be more complex
      } else {
        // Linux/macOS
        const diskCommand = "df -h / | awk 'NR==2 {print $5}'";
        diskUsage = execSync(diskCommand).toString().trim();
      }
    } catch (e) {
      console.warn('Could not get disk usage:', e.message);
    }
    
    return {
      cpuUsage: cpuUsage.toFixed(1),
      memoryUsage: memoryUsage.toFixed(1),
      diskUsage,
      uptime: Math.floor(os.uptime() / 3600) // hours
    };
  } catch (error) {
    console.error('Error gathering system metrics:', error.message);
    return {
      cpuUsage: '0.0',
      memoryUsage: '0.0',
      diskUsage: '0%',
      uptime: 0
    };
  }
}

/**
 * Get recently modified files
 */
function getRecentlyModifiedFiles() {
  try {
    // Files modified in the last 24 hours
    const command = 'find . -type f -not -path "*/node_modules/*" -not -path "*/\\.git/*" -not -path "*/\\.*" -mtime -1 | sort';
    const output = execSync(command).toString().trim();
    
    const files = output.split('\n').filter(Boolean).map(file => {
      const stats = fs.statSync(file);
      return {
        path: file.substring(2), // Remove './'
        size: (stats.size / 1024).toFixed(1) + 'KB',
        lines: 0 // We'll calculate this below
      };
    });
    
    // Get line counts for each file
    for (const file of files) {
      try {
        const content = fs.readFileSync('.' + path.sep + file.path, 'utf8');
        file.lines = content.split('\n').length;
      } catch (e) {
        console.warn(`Could not read file ${file.path}:`, e.message);
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error gathering modified files:', error.message);
    return [];
  }
}

/**
 * Get git commit statistics
 */
function getGitStats() {
  try {
    // Check if we're in a git repository
    try {
      execSync('git rev-parse --is-inside-work-tree');
    } catch (e) {
      console.warn('Not in a git repository');
      return {
        commitsToday: 0,
        commitsThisWeek: 0,
        totalCommits: 0,
        contributors: 0
      };
    }
    
    // Get commit counts
    const todayCommand = 'git log --since="1 day ago" --oneline | wc -l';
    const weekCommand = 'git log --since="1 week ago" --oneline | wc -l';
    const totalCommand = 'git rev-list --count HEAD';
    const contributorsCommand = 'git shortlog -s | wc -l';
    
    const commitsToday = parseInt(execSync(todayCommand).toString().trim(), 10) || 0;
    const commitsThisWeek = parseInt(execSync(weekCommand).toString().trim(), 10) || 0;
    const totalCommits = parseInt(execSync(totalCommand).toString().trim(), 10) || 0;
    const contributors = parseInt(execSync(contributorsCommand).toString().trim(), 10) || 0;
    
    return {
      commitsToday,
      commitsThisWeek,
      totalCommits,
      contributors
    };
  } catch (error) {
    console.error('Error gathering git stats:', error.message);
    return {
      commitsToday: 0,
      commitsThisWeek: 0,
      totalCommits: 0,
      contributors: 0
    };
  }
}

/**
 * Create metrics section for the report
 */
function createMetricsSection(docMetrics, sysMetrics, gitStats) {
  return `
## Metrics

### Documentation Metrics
- Total Documentation Files: ${docMetrics.totalFiles}
- Total Documentation Lines: ${docMetrics.totalLines}
- Files Modified (last 24h): ${docMetrics.recentlyModified}
- Average Lines per File: ${docMetrics.averageLinesPerFile}

### System Metrics
- CPU Usage: ${sysMetrics.cpuUsage}%
- Memory Usage: ${sysMetrics.memoryUsage}%
- Disk Usage: ${sysMetrics.diskUsage}
- System Uptime: ${sysMetrics.uptime} hours

### Git Metrics
- Commits Today: ${gitStats.commitsToday}
- Commits This Week: ${gitStats.commitsThisWeek}
- Total Commits: ${gitStats.totalCommits}
- Contributors: ${gitStats.contributors}
`;
}

/**
 * Create documentation progress section
 */
function createDocumentationSection(modifiedFiles) {
  if (modifiedFiles.length === 0) {
    return `
## Documentation Progress

No documentation files modified in the last 24 hours.
`;
  }
  
  const filesTable = modifiedFiles
    .filter(file => file.path.endsWith('.md'))
    .map(file => `${file.path} (${file.size}, ${file.lines} lines)`)
    .join('\n');
  
  const updatedFiles = modifiedFiles
    .filter(file => !file.path.endsWith('.md') && !file.path.includes('node_modules'))
    .map(file => file.path)
    .join('\n');
  
  return `
## Documentation Progress

### New/Modified Documentation Files:
${filesTable || 'None'}

### Other Files Updated:
${updatedFiles || 'None'}
`;
}

/**
 * Create TODO section
 */
function createTodoSection(todoData) {
  const { priorityTasks, additionalTasks, nextSteps } = todoData;
  
  const formatTask = (task) => {
    let output = `${task.status} ${task.title}\n`;
    if (task.details && task.details.length > 0) {
      output += task.details.map(detail => `  - ${detail}`).join('\n');
    }
    return output;
  };
  
  const prioritySection = priorityTasks.length > 0
    ? priorityTasks.map(formatTask).join('\n')
    : 'No priority tasks.';
  
  const additionalSection = additionalTasks.length > 0
    ? additionalTasks.map(formatTask).join('\n')
    : 'No additional tasks.';
  
  const nextStepsSection = nextSteps.length > 0
    ? nextSteps.map(formatTask).join('\n')
    : 'No next steps defined.';
  
  return `
## Todo Items

### Priority Tasks
${prioritySection}

### Additional Tasks
${additionalSection}

### Next Steps
${nextStepsSection}
`;
}

/**
 * Create milestone section
 */
function createMilestoneSection(projectData) {
  if (!projectData || !projectData.milestones || projectData.milestones.length === 0) {
    return `
## Milestones

No milestones defined.
`;
  }
  
  const milestonesTable = projectData.milestones.map(milestone => {
    return `| ${milestone.name} | ${milestone.progress || 0}% | ${milestone.target || 'N/A'} | ${milestone.status || 'Not Started'} |`;
  }).join('\n');
  
  return `
## Milestones

| Milestone | Progress | Target Date | Status |
|-----------|----------|-------------|--------|
${milestonesTable}
`;
}

/**
 * Generate the daily report
 */
async function generateDailyReport() {
  try {
    console.log('Generating daily report...');
    
    // Parse command line arguments
    const args = parseArgs();
    
    // Get current date
    const currentDate = getCurrentDate();
    const formattedDate = getFormattedDate();
    
    // Load project data
    const projectData = loadProjectData(args.projectData);
    
    // Parse TODO file
    const todoData = parseTodoFile(args.todoFile);
    
    // Gather metrics
    const docMetrics = getDocumentationMetrics();
    const sysMetrics = getSystemMetrics();
    const gitStats = getGitStats();
    const modifiedFiles = getRecentlyModifiedFiles();
    
    // Create report sections
    const metricsSection = createMetricsSection(docMetrics, sysMetrics, gitStats);
    const documentationSection = createDocumentationSection(modifiedFiles);
    const todoSection = createTodoSection(todoData);
    const milestoneSection = createMilestoneSection(projectData);
    
    // Combine all sections
    const report = `# Daily Report: ${formattedDate}

## Overview

This is an automatically generated daily report for the ${projectData?.name || 'Project'}.

${metricsSection}
${documentationSection}
${todoSection}
${milestoneSection}

---
*Report generated at: ${new Date().toISOString()}*`;
    
    // Determine output path
    let outputPath;
    if (args.output) {
      outputPath = args.output;
    } else {
      // Create directory if it doesn't exist
      fs.mkdirSync(DEFAULT_OUTPUT_DIR, { recursive: true });
      outputPath = path.join(DEFAULT_OUTPUT_DIR, `report-${currentDate}.md`);
    }
    
    // Write report to file
    fs.writeFileSync(outputPath, report);
    
    console.log(`Daily report generated successfully: ${outputPath}`);
    
    // Send notification if requested
    if (args.notify) {
      sendNotification('Daily Report Generated', `Daily report for ${formattedDate} has been generated.`);
    }
    
    return outputPath;
  } catch (error) {
    console.error('Error generating daily report:', error);
    process.exit(1);
  }
}

/**
 * Send a notification
 */
function sendNotification(title, message) {
  try {
    if (process.platform === 'darwin') {
      // macOS
      const script = `display notification "${message}" with title "${title}"`;
      execSync(`osascript -e '${script}'`);
    } else if (process.platform === 'win32') {
      // Windows
      const powershell = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

        $app = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe'
        $content = @"
        <toast>
            <visual>
                <binding template="ToastText02">
                    <text id="1">${title}</text>
                    <text id="2">${message}</text>
                </binding>
            </visual>
        </toast>
"@

        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($content)
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show($toast)
      `;
      execSync(`powershell -Command "${powershell}"`);
    } else if (process.platform === 'linux') {
      // Linux (requires notify-send)
      execSync(`notify-send "${title}" "${message}"`);
    }
    
    console.log('Notification sent successfully.');
  } catch (error) {
    console.warn('Could not send notification:', error.message);
  }
}

// Run the report generator
generateDailyReport(); 