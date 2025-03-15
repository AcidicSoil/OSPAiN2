/**
 * Development Modes Context Provider
 *
 * This script provides context about the current development mode
 * to be appended to chat sessions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mode-specific context information
const modeContext = {
  design: {
    emoji: '🎨',
    focus: 'UI/UX structuring, component architecture, visual design',
    activities: [
      'Creating wireframes and mockups',
      'Defining UI component structures',
      'Establishing visual language consistency',
      'Planning user workflows and interactions'
    ],
    files: ['design/*.sketch', '*.fig', 'ui/*.css', 'ui/components/*.js'],
    tools: ['Figma', 'Sketch', 'Adobe XD', 'CSS Frameworks'],
    metrics: ['Visual consistency', 'Usability scores', 'Accessibility compliance']
  },
  engineering: {
    emoji: '🔧',
    focus: 'Core functionality, business logic, data flow implementation',
    activities: [
      'Implementing core business logic',
      'Building data processing pipelines',
      'Optimizing performance bottlenecks',
      'Structuring code architecture'
    ],
    files: ['src/**/*.ts', 'lib/*.js', 'utils/*.js', 'services/*.ts'],
    tools: ['TypeScript', 'Node.js', 'SQL/NoSQL databases', 'API frameworks'],
    metrics: ['Code coverage', 'Performance benchmarks', 'System uptime']
  },
  testing: {
    emoji: '🧪',
    focus: 'Quality assurance, edge cases, resilience verification',
    activities: [
      'Writing test cases and test plans',
      'Implementing automated tests',
      'Performing integration testing',
      'Validating edge cases and error handling'
    ],
    files: ['tests/**/*', 'cypress/**/*', 'jest.config.js', '*.test.ts'],
    tools: ['Jest', 'Cypress', 'Mocha', 'Testing libraries'],
    metrics: ['Test coverage percentage', 'Defect rate', 'Time to detect']
  },
  deployment: {
    emoji: '📦',
    focus: 'Release readiness, CI/CD, documentation finalization',
    activities: [
      'Preparing deployment artifacts',
      'Setting up CI/CD pipelines',
      'Writing release notes',
      'Creating user documentation'
    ],
    files: ['.github/workflows/*.yml', 'Dockerfile', 'docker-compose.yml', 'deploy/*.sh'],
    tools: ['GitHub Actions', 'Docker', 'Kubernetes', 'Terraform'],
    metrics: ['Deployment success rate', 'Rollback frequency', 'Time to deploy']
  },
  maintenance: {
    emoji: '🔍',
    focus: 'Ongoing health, improvements, community support',
    activities: [
      'Monitoring system performance',
      'Investigating and fixing bugs',
      'Implementing minor enhancements',
      'Supporting users and community'
    ],
    files: ['logs/**/*', 'monitoring/*.js', 'docs/*.md', 'CHANGELOG.md'],
    tools: ['Monitoring tools', 'Log analyzers', 'Bug tracking systems'],
    metrics: ['Response time', 'Resolution time', 'Customer satisfaction']
  }
};

/**
 * Get the current development mode from the mode_switcher
 * @returns {string} The current mode or "none" if no mode is active
 */
function getCurrentMode() {
  try {
    const scriptDir = path.dirname(__filename);
    const currentModeFile = path.join(scriptDir, '.current_mode');

    if (fs.existsSync(currentModeFile)) {
      const mode = fs.readFileSync(currentModeFile, 'utf8').trim();
      return mode === 'No active mode' ? 'none' : mode;
    }

    return 'none';
  } catch (error) {
    console.error('Error getting current mode:', error.message);
    return 'none';
  }
}

/**
 * Get the mode transition history
 * @param {number} limit Maximum number of entries to return
 * @returns {Array} Recent mode transitions
 */
function getModeHistory(limit = 3) {
  try {
    const scriptDir = path.dirname(__filename);
    const historyFile = path.join(scriptDir, '.mode_history');

    if (fs.existsSync(historyFile)) {
      const history = fs
        .readFileSync(historyFile, 'utf8')
        .split('\n')
        .filter(
          (line) => line.startsWith('|') && !line.startsWith('| Date') && !line.startsWith('|---')
        )
        .slice(0, limit);

      return history
        .map((line) => {
          const parts = line.split('|').filter((part) => part.trim());
          if (parts.length >= 4) {
            return {
              date: parts[0].trim(),
              from: parts[1].trim(),
              to: parts[2].trim(),
              reason: parts[3].trim()
            };
          }
          return null;
        })
        .filter((item) => item !== null);
    }

    return [];
  } catch (error) {
    console.error('Error getting mode history:', error.message);
    return [];
  }
}

/**
 * Generate a context summary for the current mode
 * @returns {string} Formatted context information
 */
function generateModeContext() {
  const currentMode = getCurrentMode();

  if (currentMode === 'none') {
    return `⚠️ **No active development mode**\n\nConsider setting a development mode with:\n\`m switch <mode> "reason"\` or \`./mode_switcher.sh switch <mode> "reason"\``;
  }

  const context = modeContext[currentMode];
  if (!context) {
    return `⚠️ **Unknown mode: ${currentMode}**\n\nPlease verify your development mode configuration.`;
  }

  // Get recent mode transitions
  const history = getModeHistory(2);
  const historyText =
    history.length > 0
      ? history
          .map((h) => `- ${h.date}: Changed from ${h.from} to ${h.to} (${h.reason})`)
          .join('\n')
      : 'No recent transitions';

  // Format context information
  return `
## ${context.emoji} Current Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}

**Focus**: ${context.focus}

### Key Activities
${context.activities.map((a) => `- ${a}`).join('\n')}

### Relevant Files
${context.files.map((f) => `- \`${f}\``).join('\n')}

### Suggested Tools
${context.tools.map((t) => `- ${t}`).join('\n')}

### Recent Mode Transitions
${historyText}

---
*Append this context to your prompts for mode-specific assistance*
`;
}

/**
 * Get a short version of the mode context for chat headers
 * @returns {string} Short context string
 */
function getShortModeContext() {
  const currentMode = getCurrentMode();

  if (currentMode === 'none') {
    return `⚠️ No active mode`;
  }

  const context = modeContext[currentMode];
  if (!context) {
    return `⚠️ Unknown mode: ${currentMode}`;
  }

  return `${context.emoji} Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} | Focus: ${context.focus}`;
}

// If run directly, output the context
if (require.main === module) {
  console.log(generateModeContext());
}

module.exports = {
  getCurrentMode,
  generateModeContext,
  getShortModeContext,
  getModeHistory
};
