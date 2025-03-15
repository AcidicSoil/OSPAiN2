#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const os_1 = __importDefault(require("os"));
/**
 * Setup script for daily architecture mindmap generation
 *
 * This script sets up automated daily generation of architecture mindmaps
 * on different platforms (Windows, macOS, Linux) using the appropriate
 * scheduling mechanism (cron, Task Scheduler, launchd).
 */
async function main() {
    console.log(chalk_1.default.blue('🔄 Daily Architecture Mindmap Setup'));
    console.log(chalk_1.default.gray('This script will set up automated daily generation of architecture mindmaps.'));
    // Get the project root directory
    const projectRoot = path.resolve(process.cwd());
    console.log(chalk_1.default.gray(`Project root: ${projectRoot}`));
    // Ensure the scripts are executable
    try {
        const mindmapScript = path.join(projectRoot, 'scripts', 'generate-mindmap.ts');
        await fs.chmod(mindmapScript, 0o755);
        console.log(chalk_1.default.green('✅ Made generate-mindmap.ts executable'));
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('⚠️ Could not make script executable:'), error);
    }
    // Determine the platform
    const platform = os_1.default.platform();
    console.log(chalk_1.default.gray(`Detected platform: ${platform}`));
    // Ask for preferred time
    const { hour, minute } = await inquirer_1.default.prompt([
        {
            type: 'number',
            name: 'hour',
            message: 'At what hour should the mindmap be generated (0-23)?',
            default: 9,
            validate: (value) => (value >= 0 && value <= 23 ? true : 'Please enter a valid hour (0-23)'),
        },
        {
            type: 'number',
            name: 'minute',
            message: 'At what minute should the mindmap be generated (0-59)?',
            default: 0,
            validate: (value) => value >= 0 && value <= 59 ? true : 'Please enter a valid minute (0-59)',
        },
    ]);
    // Setup based on platform
    try {
        if (platform === 'win32') {
            await setupWindowsScheduledTask(projectRoot, hour, minute);
        }
        else if (platform === 'darwin') {
            await setupMacOSLaunchd(projectRoot, hour, minute);
        }
        else if (platform === 'linux') {
            await setupLinuxCron(projectRoot, hour, minute);
        }
        else {
            console.error(chalk_1.default.red(`❌ Unsupported platform: ${platform}`));
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Setup failed:'), error);
        process.exit(1);
    }
}
/**
 * Set up a scheduled task on Windows
 */
async function setupWindowsScheduledTask(projectRoot, hour, minute) {
    console.log(chalk_1.default.blue('🔄 Setting up Windows Scheduled Task...'));
    // Create a batch script to run the mindmap generator
    const batchScriptPath = path.join(projectRoot, 'scripts', 'run-mindmap-generator.bat');
    const batchScript = `
@echo off
cd /d "${projectRoot}"
echo Running Architecture Mindmap Generator at %DATE% %TIME% >> mindmap-log.txt
call npx ts-node scripts/generate-mindmap.ts >> mindmap-log.txt 2>&1
  `.trim();
    await fs.writeFile(batchScriptPath, batchScript, 'utf-8');
    console.log(chalk_1.default.green('✅ Created batch script for mindmap generation'));
    // Create XML for the scheduled task
    const taskName = 'T2PArchitectureMindmapGenerator';
    const xmlPath = path.join(projectRoot, 'scripts', 'mindmap-task.xml');
    const xml = `
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Generates architecture mindmaps for the T2P project</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2023-01-01T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00</StartBoundary>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>${batchScriptPath}</Command>
      <WorkingDirectory>${projectRoot}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
  `.trim();
    await fs.writeFile(xmlPath, xml, 'utf-8');
    console.log(chalk_1.default.green('✅ Created scheduled task XML configuration'));
    // Create a batch script to register the task
    const registerScriptPath = path.join(projectRoot, 'scripts', 'register-mindmap-task.bat');
    const registerScript = `
@echo off
echo Registering T2P Architecture Mindmap Generator scheduled task...
schtasks /create /tn "${taskName}" /xml "${xmlPath}" /f
if %ERRORLEVEL% EQU 0 (
  echo Task registered successfully.
) else (
  echo Failed to register task. Please run as administrator.
)
pause
  `.trim();
    await fs.writeFile(registerScriptPath, registerScript, 'utf-8');
    console.log(chalk_1.default.green('✅ Created task registration script'));
    console.log(chalk_1.default.yellow('\n⚠️ To complete setup, please run the following script as administrator:'));
    console.log(chalk_1.default.cyan(`${registerScriptPath}`));
    console.log(chalk_1.default.gray('\nThis will register a daily scheduled task to generate architecture mindmaps.'));
}
/**
 * Set up a launchd job on macOS
 */
async function setupMacOSLaunchd(projectRoot, hour, minute) {
    console.log(chalk_1.default.blue('🔄 Setting up macOS Launch Agent...'));
    // Create a shell script to run the mindmap generator
    const shellScriptPath = path.join(projectRoot, 'scripts', 'run-mindmap-generator.sh');
    const shellScript = `
#!/bin/bash
cd "${projectRoot}"
echo "Running Architecture Mindmap Generator at $(date)" >> mindmap-log.txt
npx ts-node scripts/generate-mindmap.ts >> mindmap-log.txt 2>&1
  `.trim();
    await fs.writeFile(shellScriptPath, shellScript, 'utf-8');
    await fs.chmod(shellScriptPath, 0o755);
    console.log(chalk_1.default.green('✅ Created shell script for mindmap generation'));
    // Create plist for the launch agent
    const plistName = 'com.t2p.architecture-mindmap';
    const homeDir = os_1.default.homedir();
    const launchAgentsDir = path.join(homeDir, 'Library', 'LaunchAgents');
    const plistPath = path.join(launchAgentsDir, `${plistName}.plist`);
    try {
        await fs.mkdir(launchAgentsDir, { recursive: true });
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('LaunchAgents directory already exists or cannot be created:'), error);
    }
    const plist = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${plistName}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${shellScriptPath}</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>${hour}</integer>
    <key>Minute</key>
    <integer>${minute}</integer>
  </dict>
  <key>RunAtLoad</key>
  <false/>
  <key>StandardErrorPath</key>
  <string>${projectRoot}/mindmap-error.log</string>
  <key>StandardOutPath</key>
  <string>${projectRoot}/mindmap-output.log</string>
</dict>
</plist>
  `.trim();
    await fs.writeFile(plistPath, plist, 'utf-8');
    console.log(chalk_1.default.green('✅ Created launch agent plist configuration'));
    // Load the launch agent
    try {
        (0, child_process_1.execSync)(`launchctl load -w ${plistPath}`);
        console.log(chalk_1.default.green('✅ Launch agent loaded successfully'));
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('⚠️ Could not load launch agent:'), error);
        console.log(chalk_1.default.yellow('\n⚠️ To complete setup, please run:'));
        console.log(chalk_1.default.cyan(`launchctl load -w ${plistPath}`));
    }
    console.log(chalk_1.default.green('\n✅ macOS Launch Agent setup complete'));
    console.log(chalk_1.default.gray(`The mindmap generator will run daily at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`));
}
/**
 * Set up a cron job on Linux
 */
async function setupLinuxCron(projectRoot, hour, minute) {
    console.log(chalk_1.default.blue('🔄 Setting up Linux Cron Job...'));
    // Create a shell script to run the mindmap generator
    const shellScriptPath = path.join(projectRoot, 'scripts', 'run-mindmap-generator.sh');
    const shellScript = `
#!/bin/bash
cd "${projectRoot}"
echo "Running Architecture Mindmap Generator at $(date)" >> mindmap-log.txt
npx ts-node scripts/generate-mindmap.ts >> mindmap-log.txt 2>&1
  `.trim();
    await fs.writeFile(shellScriptPath, shellScript, 'utf-8');
    await fs.chmod(shellScriptPath, 0o755);
    console.log(chalk_1.default.green('✅ Created shell script for mindmap generation'));
    // Create a crontab entry
    const cronExpression = `${minute} ${hour} * * * ${shellScriptPath}`;
    const tempCronFile = path.join(projectRoot, 'scripts', 'mindmap-cron.txt');
    // Get existing crontab
    let existingCrontab = '';
    try {
        existingCrontab = (0, child_process_1.execSync)('crontab -l').toString();
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('No existing crontab, creating a new one'));
    }
    // Check if entry already exists
    if (existingCrontab.includes(shellScriptPath)) {
        console.log(chalk_1.default.yellow('⚠️ Cron job already exists, updating it'));
        const lines = existingCrontab.split('\n');
        const newLines = lines.filter((line) => !line.includes(shellScriptPath));
        newLines.push(cronExpression);
        existingCrontab = newLines.join('\n');
    }
    else {
        existingCrontab = `${existingCrontab}\n${cronExpression}\n`;
    }
    await fs.writeFile(tempCronFile, existingCrontab, 'utf-8');
    console.log(chalk_1.default.green('✅ Created temporary crontab file'));
    // Install the new crontab
    try {
        (0, child_process_1.execSync)(`crontab ${tempCronFile}`);
        console.log(chalk_1.default.green('✅ Crontab installed successfully'));
        // Clean up
        await fs.unlink(tempCronFile);
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('⚠️ Could not install crontab:'), error);
        console.log(chalk_1.default.yellow('\n⚠️ To complete setup, please run:'));
        console.log(chalk_1.default.cyan(`crontab ${tempCronFile}`));
        console.log(chalk_1.default.gray('\nThis will install a cron job to generate architecture mindmaps daily.'));
    }
    console.log(chalk_1.default.green('\n✅ Linux Cron Job setup complete'));
    console.log(chalk_1.default.gray(`The mindmap generator will run daily at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`));
}
// Run the main function
main();
//# sourceMappingURL=setup-daily-mindmap.js.map