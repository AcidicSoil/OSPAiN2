#!/usr/bin/env node

/**
 * Daily Tasks Generator
 * 
 * This script generates a daily tasks sheet from the template.
 * It includes recurring tasks and can track milestones.
 * 
 * Usage:
 *   node generate-daily-tasks.js [--output /path/to/output.md] [--tasks-file /path/to/tasks.json]
 */

const fs = require('fs');
const path = require('path');

// Default paths
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'daily-tasks-template.md');
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', 'tasks', 'daily');
const DEFAULT_TASKS_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

/**
 * Get command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsedArgs = { 
    output: null,
    tasksFile: DEFAULT_TASKS_FILE
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      parsedArgs.output = args[i + 1];
      i++;
    } else if (args[i] === '--tasks-file' && i + 1 < args.length) {
      parsedArgs.tasksFile = args[i + 1];
      i++;
    }
  }
  
  return parsedArgs;
}

/**
 * Load tasks from the tasks file
 */
function loadTasks(tasksFile) {
  try {
    if (fs.existsSync(tasksFile)) {
      return JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
    } else {
      console.warn(`Tasks file ${tasksFile} not found. Using default tasks.`);
      return {
        recurring: [
          { name: "Review documentation", priority: "Medium", status: "Pending", notes: "" },
          { name: "Update task tracking", priority: "High", status: "Pending", notes: "" },
          { name: "Team check-in", priority: "Medium", status: "Pending", notes: "" },
          { name: "Code review", priority: "High", status: "Pending", notes: "" },
          { name: "System health check", priority: "Medium", status: "Pending", notes: "" }
        ],
        tasks: [
          { name: "Update user documentation", priority: "High", category: "Documentation", time: "2h", status: "Pending", notes: "" },
          { name: "Fix reported bugs", priority: "Medium", category: "Development", time: "3h", status: "Pending", notes: "" },
          { name: "Plan next sprint", priority: "High", category: "Planning", time: "1h", status: "Pending", notes: "" }
        ],
        milestones: [
          { name: "v1.0 Release", progress: 75, target: "2024-06-30", status: "On Track" },
          { name: "Documentation Overhaul", progress: 50, target: "2024-07-15", status: "At Risk" }
        ],
        weeklyGoals: [
          "Complete all priority tasks",
          "Resolve outstanding bugs",
          "Plan for next milestone"
        ],
        blockers: [
          "Waiting for API documentation from third-party vendor",
          "Need approval for new server resources"
        ]
      };
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    process.exit(1);
  }
}

/**
 * Generate the daily tasks file
 */
async function generateDailyTasks() {
  try {
    console.log('Generating daily tasks...');
    
    // Parse command line arguments
    const args = parseArgs();
    
    // Read template
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    
    // Get current date
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    
    // Calculate week start and end
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    // Load tasks
    const tasksData = loadTasks(args.tasksFile);
    
    // Prepare placeholders
    const placeholders = {
      DATE: dateStr,
      WEEK_START: weekStartStr,
      WEEK_END: weekEndStr,
      NOTES: "",
    };
    
    // Add task placeholders
    for (let i = 0; i < 3; i++) {
      if (i < tasksData.tasks.length) {
        placeholders[`TASK_${i+1}`] = tasksData.tasks[i].name;
        placeholders[`PRIORITY_${i+1}`] = tasksData.tasks[i].priority;
        placeholders[`CATEGORY_${i+1}`] = tasksData.tasks[i].category;
        placeholders[`TIME_${i+1}`] = tasksData.tasks[i].time;
      } else {
        placeholders[`TASK_${i+1}`] = "";
        placeholders[`PRIORITY_${i+1}`] = "";
        placeholders[`CATEGORY_${i+1}`] = "";
        placeholders[`TIME_${i+1}`] = "";
      }
    }
    
    // Add milestone placeholders
    for (let i = 0; i < 2; i++) {
      if (i < tasksData.milestones.length) {
        placeholders[`MILESTONE_${i+1}`] = tasksData.milestones[i].name;
        placeholders[`PROGRESS_${i+1}`] = tasksData.milestones[i].progress;
        placeholders[`TARGET_${i+1}`] = tasksData.milestones[i].target;
        placeholders[`STATUS_${i+1}`] = tasksData.milestones[i].status;
      } else {
        placeholders[`MILESTONE_${i+1}`] = "";
        placeholders[`PROGRESS_${i+1}`] = "";
        placeholders[`TARGET_${i+1}`] = "";
        placeholders[`STATUS_${i+1}`] = "";
      }
    }
    
    // Add weekly goals
    for (let i = 0; i < 3; i++) {
      if (i < tasksData.weeklyGoals.length) {
        placeholders[`GOAL_${i+1}`] = tasksData.weeklyGoals[i];
      } else {
        placeholders[`GOAL_${i+1}`] = "";
      }
    }
    
    // Add blockers
    for (let i = 0; i < 2; i++) {
      if (i < tasksData.blockers.length) {
        placeholders[`BLOCKER_${i+1}`] = tasksData.blockers[i];
      } else {
        placeholders[`BLOCKER_${i+1}`] = "";
      }
    }
    
    // Add placeholders for end-of-day summary (will be filled out later)
    for (let i = 0; i < 3; i++) {
      placeholders[`COMPLETED_${i+1}`] = "";
    }
    for (let i = 0; i < 2; i++) {
      placeholders[`HIGHLIGHT_${i+1}`] = "";
    }
    for (let i = 0; i < 3; i++) {
      placeholders[`TOMORROW_${i+1}`] = "";
    }
    
    // Generate tasks by replacing placeholders
    let tasks = template;
    for (const [key, value] of Object.entries(placeholders)) {
      tasks = tasks.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    // Determine output path
    let outputPath;
    if (args.output) {
      outputPath = args.output;
    } else {
      // Create directory if it doesn't exist
      fs.mkdirSync(DEFAULT_OUTPUT_DIR, { recursive: true });
      outputPath = path.join(DEFAULT_OUTPUT_DIR, `${dateStr}-tasks.md`);
    }
    
    // Write tasks to file
    fs.writeFileSync(outputPath, tasks);
    
    console.log(`Daily tasks generated successfully: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating daily tasks:', error);
    process.exit(1);
  }
}

// Run the tasks generator
generateDailyTasks(); 