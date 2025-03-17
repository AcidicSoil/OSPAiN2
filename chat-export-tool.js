#!/usr/bin/env node
/**
 * Chat Export Tool
 * 
 * A tool for exporting and analyzing chat conversations to help prompt engineers
 * identify patterns and create templates for improving AI interactions.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Configuration
const CONFIG = {
  outputDir: './prompt-engineering/exports',
  templatesDir: './prompt-engineering/templates',
  logDir: './logs/chat',
  sampleDir: './prompt-engineering/samples',
  defaultFormat: 'markdown',
  supportedFormats: ['markdown', 'json', 'csv']
};

/**
 * Creates a sample conversation for testing
 * @returns {Object} Sample conversation
 */
function createSampleConversation() {
  return {
    id: 'sample-conversation',
    timestamp: new Date().toISOString(),
    exchanges: [
      {
        role: 'user',
        content: 'Can you help me implement a new React component?'
      },
      {
        role: 'assistant',
        content: 'I\'ll help you create a React component. What functionality do you need?'
      },
      {
        role: 'user',
        content: 'I need a button component with different variants and sizes.'
      },
      {
        role: 'assistant',
        content: `Here's a basic implementation:

\`\`\`tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick
}) => {
  return (
    <button 
      className={\`btn btn-\${variant} btn-\${size}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
\`\`\``
      }
    ]
  };
}

/**
 * Ensures necessary directories exist and creates sample data if needed
 */
function ensureDirectories() {
  // Create all required directories
  [CONFIG.outputDir, CONFIG.templatesDir, CONFIG.logDir, CONFIG.sampleDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  // Create sample data if no conversations exist
  const sampleFile = path.join(CONFIG.sampleDir, 'sample-conversation.json');
  if (!fs.existsSync(sampleFile)) {
    const sampleData = createSampleConversation();
    fs.writeFileSync(sampleFile, JSON.stringify(sampleData, null, 2));
    console.log(`Created sample conversation: ${sampleFile}`);
  }
}

/**
 * Processes command line arguments
 */
function processArgs() {
  program
    .name('chat-export-tool')
    .description('Export and analyze chat conversations for prompt engineering')
    .option('-s, --source <path>', 'Source directory or file', CONFIG.logDir)
    .option('-d, --destination <path>', 'Destination file (default: auto-generated)')
    .option('-f, --format <format>', 'Export format: markdown, json, or csv', CONFIG.defaultFormat)
    .option('-a, --analyze', 'Perform basic analysis on exports', false)
    .option('--all', 'Export all conversations', false)
    .option('--days <number>', 'Number of days back to export', 7)
    .option('--help, -h', 'Show help message')
    .parse(process.argv);

  return program.opts();
}

/**
 * Finds chat log files based on provided options
 * @param {Object} options - Command line options
 * @returns {Array<string>} - Array of file paths
 */
function findChatLogs(options) {
  let sourcePath = options.source;
  
  // If source directory doesn't exist, try sample directory
  if (!fs.existsSync(sourcePath)) {
    console.log(`Source path ${sourcePath} not found, using sample directory...`);
    sourcePath = CONFIG.sampleDir;
    
    // If sample directory doesn't exist or is empty, create sample data
    if (!fs.existsSync(sourcePath) || fs.readdirSync(sourcePath).length === 0) {
      ensureDirectories();
    }
  }
  
  let files = [];
  
  if (fs.statSync(sourcePath).isDirectory()) {
    const allFiles = fs.readdirSync(sourcePath)
      .filter(file => file.endsWith('.log') || file.endsWith('.json'))
      .map(file => path.join(sourcePath, file));
      
    if (options.all) {
      files = allFiles;
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.days);
      
      files = allFiles.filter(file => {
        const stats = fs.statSync(file);
        return stats.mtime >= cutoffDate;
      });
    }
  } else {
    files = [sourcePath];
  }
  
  return files;
}

/**
 * Parses a conversation file
 * @param {string} filePath - Path to conversation file
 * @returns {Object} - Parsed conversation
 */
function parseConversation(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Try parsing as JSON first
    return JSON.parse(content);
  } catch (e) {
    // If not JSON, parse as log format
    return parseLogFormat(content, filePath);
  }
}

/**
 * Parses a log format conversation
 * @param {string} content - Log file content
 * @param {string} filePath - Path to log file
 * @returns {Object} - Parsed conversation
 */
function parseLogFormat(content, filePath) {
  const lines = content.split('\n');
  const conversation = {
    id: path.basename(filePath, path.extname(filePath)),
    timestamp: fs.statSync(filePath).mtime.toISOString(),
    exchanges: []
  };
  
  let currentMessage = null;
  
  for (const line of lines) {
    if (line.startsWith('User: ')) {
      if (currentMessage) {
        conversation.exchanges.push(currentMessage);
      }
      currentMessage = {
        role: 'user',
        content: line.substring('User: '.length)
      };
    } else if (line.startsWith('Assistant: ')) {
      if (currentMessage) {
        conversation.exchanges.push(currentMessage);
      }
      currentMessage = {
        role: 'assistant',
        content: line.substring('Assistant: '.length)
      };
    } else if (currentMessage) {
      currentMessage.content += '\n' + line;
    }
  }
  
  if (currentMessage) {
    conversation.exchanges.push(currentMessage);
  }
  
  return conversation;
}

/**
 * Performs analysis on conversations
 * @param {Array<Object>} conversations - Array of conversation objects
 * @returns {Object} - Analysis results
 */
function analyzeConversations(conversations) {
  // Basic metrics
  const totalConversations = conversations.length;
  const totalExchanges = conversations.reduce((sum, conv) => sum + conv.exchanges.length, 0);
  
  // Intent detection
  const intents = detectIntents(conversations);
  
  // Message patterns
  const patterns = detectPatterns(conversations);
  
  // Generate template suggestions
  const templateSuggestions = generateTemplateSuggestions(intents, patterns);
  
  return {
    metrics: {
      totalConversations,
      totalExchanges,
      avgExchangesPerConversation: totalExchanges / totalConversations
    },
    intents,
    patterns,
    templateSuggestions
  };
}

/**
 * Detects intents from conversations
 * @param {Array<Object>} conversations - Array of conversation objects
 * @returns {Object} - Intent analysis
 */
function detectIntents(conversations) {
  const intentMap = {
    implementation: 0,
    troubleshooting: 0,
    explanation: 0,
    other: 0
  };
  
  // Simple keyword-based intent detection
  conversations.forEach(conv => {
    if (conv.exchanges.length === 0) return;
    
    const firstUserMessage = conv.exchanges.find(m => m.role === 'user')?.content || '';
    
    if (/create|implement|build|develop|make|add feature/i.test(firstUserMessage)) {
      intentMap.implementation++;
    } else if (/error|issue|bug|fix|problem|doesn't work|not working/i.test(firstUserMessage)) {
      intentMap.troubleshooting++;
    } else if (/explain|how does|why does|what is|understand/i.test(firstUserMessage)) {
      intentMap.explanation++;
    } else {
      intentMap.other++;
    }
  });
  
  const total = Object.values(intentMap).reduce((sum, count) => sum + count, 0);
  
  return {
    counts: intentMap,
    distribution: Object.keys(intentMap).reduce((obj, key) => {
      obj[key] = total ? (intentMap[key] / total * 100).toFixed(1) + '%' : '0%';
      return obj;
    }, {})
  };
}

/**
 * Detects patterns in conversations
 * @param {Array<Object>} conversations - Array of conversation objects
 * @returns {Object} - Pattern analysis
 */
function detectPatterns(conversations) {
  const patterns = {
    toolUse: 0,
    clarificationRequests: 0,
    multiStepInstructions: 0,
    codeGeneration: 0,
    fileOperations: 0,
    messageLengths: {
      user: [],
      assistant: []
    }
  };
  
  conversations.forEach(conv => {
    conv.exchanges.forEach(exchange => {
      const content = exchange.content || '';
      
      // Track message lengths
      patterns.messageLengths[exchange.role].push(content.length);
      
      if (exchange.role === 'assistant') {
        // Check for tool use
        if (/run_terminal_cmd|edit_file|read_file|list_dir|grep_search|codebase_search/i.test(content)) {
          patterns.toolUse++;
        }
        
        // Check for code generation
        if (/```\w*\n[\s\S]*?```/i.test(content)) {
          patterns.codeGeneration++;
        }
        
        // Check for file operations
        if (/Creating file|Updating file|Reading file|file has been/i.test(content)) {
          patterns.fileOperations++;
        }
      }
      
      if (exchange.role === 'user') {
        // Check for clarification requests
        if (/\?|explain|clarify|what do you mean|don't understand/i.test(content)) {
          patterns.clarificationRequests++;
        }
        
        // Check for multi-step instructions
        if (/first|second|then|after that|finally|step 1|step 2/i.test(content)) {
          patterns.multiStepInstructions++;
        }
      }
    });
  });
  
  // Calculate average message lengths
  if (patterns.messageLengths.user.length > 0) {
    patterns.avgUserMessageLength = 
      patterns.messageLengths.user.reduce((sum, len) => sum + len, 0) / 
      patterns.messageLengths.user.length;
  }
  
  if (patterns.messageLengths.assistant.length > 0) {
    patterns.avgAssistantMessageLength = 
      patterns.messageLengths.assistant.reduce((sum, len) => sum + len, 0) / 
      patterns.messageLengths.assistant.length;
  }
  
  delete patterns.messageLengths; // Remove raw data
  
  return patterns;
}

/**
 * Generates template suggestions based on analysis
 * @param {Object} intents - Intent analysis
 * @param {Object} patterns - Pattern analysis
 * @returns {Object} - Template suggestions
 */
function generateTemplateSuggestions(intents, patterns) {
  // Generate templates based on most common intents
  const templates = {};
  
  if (intents.counts.implementation > 0) {
    templates.implementation = createImplementationTemplate();
  }
  
  if (intents.counts.troubleshooting > 0) {
    templates.troubleshooting = createTroubleshootingTemplate();
  }
  
  if (intents.counts.explanation > 0) {
    templates.explanation = createExplanationTemplate();
  }
  
  return templates;
}

/**
 * Creates an implementation template
 * @returns {string} - Template content
 */
function createImplementationTemplate() {
  return `# Implementation Template

## Task Description
[Describe what you want to implement in detail]

## Required Features
- Feature 1
- Feature 2

## Technical Requirements
- Language/Framework: [e.g., TypeScript, React]
- Performance requirements: [e.g., must load in under 500ms]
- Compatibility: [e.g., must work in Chrome, Firefox]

## Additional Context
[Any relevant background information or existing code to consider]

## Expected Output
[Describe what the final implementation should include]
`;
}

/**
 * Creates a troubleshooting template
 * @returns {string} - Template content
 */
function createTroubleshootingTemplate() {
  return `# Troubleshooting Template

## Problem Description
[Describe the issue you're experiencing in detail]

## Expected Behavior
[What should happen when everything works correctly]

## Current Behavior
[What's currently happening instead]

## Error Messages
\`\`\`
[Paste any error messages here]
\`\`\`

## Environment
- OS: [e.g., Windows 10, macOS]
- Browser/Runtime: [e.g., Chrome 96, Node.js 16]
- Relevant package versions: [e.g., React 18.2.0]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

## What I've Tried
[Describe any troubleshooting steps you've already taken]
`;
}

/**
 * Creates an explanation template
 * @returns {string} - Template content
 */
function createExplanationTemplate() {
  return `# Explanation Request Template

## Concept
[What concept or process do you want explained?]

## My Current Understanding
[Describe what you already know or understand about this topic]

## Specific Questions
1. [First question]
2. [Second question]
3. [And so on...]

## Preferred Explanation Style
[e.g., Simple overview, Technical deep-dive, ELI5, Code examples, Analogies, etc.]

## Context/Purpose
[Why do you need to understand this? How will you apply this knowledge?]
`;
}

/**
 * Exports conversations based on format
 * @param {Array<Object>} conversations - Array of conversation objects
 * @param {Object} options - Export options
 * @param {Object|null} analysis - Analysis results (if any)
 */
function exportConversations(conversations, options, analysis = null) {
  const format = options.format.toLowerCase();
  
  if (!CONFIG.supportedFormats.includes(format)) {
    console.error(`Unsupported format: ${format}. Supported formats: ${CONFIG.supportedFormats.join(', ')}`);
    process.exit(1);
  }
  
  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/g, '');
  const destination = options.destination || 
    path.join(CONFIG.outputDir, `conversations-export-${timestamp}.${format}`);
  
  let content = '';
  
  switch (format) {
    case 'markdown':
      content = exportToMarkdown(conversations, analysis);
      break;
    case 'json':
      content = exportToJson(conversations, analysis);
      break;
    case 'csv':
      content = exportToCsv(conversations);
      break;
  }
  
  fs.writeFileSync(destination, content);
  console.log(`Exported ${conversations.length} conversations to ${destination}`);
  
  // Export templates if analysis was performed
  if (analysis && analysis.templateSuggestions) {
    exportTemplates(analysis.templateSuggestions);
  }
  
  // Export analysis summary if requested
  if (analysis) {
    exportAnalysisSummary(analysis);
  }
}

/**
 * Exports conversations to markdown format
 * @param {Array<Object>} conversations - Array of conversation objects
 * @param {Object|null} analysis - Analysis results (if any)
 * @returns {string} - Markdown content
 */
function exportToMarkdown(conversations, analysis) {
  let md = '# Exported Conversations\n\n';
  
  if (analysis) {
    md += '## Analysis Summary\n\n';
    md += `Total Conversations: ${analysis.metrics.totalConversations}\n`;
    md += `Total Exchanges: ${analysis.metrics.totalExchanges}\n`;
    md += `Average Exchanges Per Conversation: ${analysis.metrics.avgExchangesPerConversation.toFixed(2)}\n\n`;
    
    md += '### Intent Distribution\n\n';
    for (const [intent, percentage] of Object.entries(analysis.intents.distribution)) {
      md += `- ${intent}: ${percentage}\n`;
    }
    md += '\n';
    
    md += '### Conversation Patterns\n\n';
    for (const [pattern, value] of Object.entries(analysis.patterns)) {
      if (typeof value === 'number') {
        md += `- ${pattern}: ${value}\n`;
      }
    }
    md += '\n';
  }
  
  conversations.forEach((conv, index) => {
    md += `## Conversation ${index + 1}: ${conv.id || 'Unnamed'}\n\n`;
    md += `Timestamp: ${conv.timestamp || 'Unknown'}\n\n`;
    
    conv.exchanges.forEach((exchange, i) => {
      md += `### ${exchange.role.charAt(0).toUpperCase() + exchange.role.slice(1)}\n\n`;
      md += `${exchange.content}\n\n`;
    });
    
    md += '---\n\n';
  });
  
  return md;
}

/**
 * Exports conversations to JSON format
 * @param {Array<Object>} conversations - Array of conversation objects
 * @param {Object|null} analysis - Analysis results (if any)
 * @returns {string} - JSON content
 */
function exportToJson(conversations, analysis) {
  const data = {
    conversations,
    analysis: analysis || null,
    exportTimestamp: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Exports conversations to CSV format
 * @param {Array<Object>} conversations - Array of conversation objects
 * @returns {string} - CSV content
 */
function exportToCsv(conversations) {
  let csv = 'Conversation ID,Timestamp,Exchange Number,Role,Content\n';
  
  conversations.forEach(conv => {
    const convId = conv.id || 'unknown';
    const timestamp = conv.timestamp || '';
    
    conv.exchanges.forEach((exchange, index) => {
      // Escape content for CSV
      const content = exchange.content
        .replace(/"/g, '""') // Escape quotes
        .replace(/\r?\n/g, ' '); // Replace newlines
      
      csv += `"${convId}","${timestamp}",${index + 1},"${exchange.role}","${content}"\n`;
    });
  });
  
  return csv;
}

/**
 * Exports templates to files
 * @param {Object} templates - Template suggestions
 */
function exportTemplates(templates) {
  for (const [type, content] of Object.entries(templates)) {
    const templatePath = path.join(CONFIG.templatesDir, `${type}-template.md`);
    fs.writeFileSync(templatePath, content);
    console.log(`Template exported to ${templatePath}`);
  }
}

/**
 * Exports analysis summary to file
 * @param {Object} analysis - Analysis results
 */
function exportAnalysisSummary(analysis) {
  const analysisPath = path.join(CONFIG.outputDir, 'analysis.md');
  
  let content = '# Conversation Analysis Summary\n\n';
  
  content += '## Basic Metrics\n\n';
  content += `- Total Conversations: ${analysis.metrics.totalConversations}\n`;
  content += `- Total Exchanges: ${analysis.metrics.totalExchanges}\n`;
  content += `- Average Exchanges Per Conversation: ${analysis.metrics.avgExchangesPerConversation.toFixed(2)}\n\n`;
  
  content += '## Intent Distribution\n\n';
  content += '| Intent | Count | Percentage |\n';
  content += '|--------|-------|------------|\n';
  
  for (const [intent, count] of Object.entries(analysis.intents.counts)) {
    const percentage = analysis.intents.distribution[intent];
    content += `| ${intent} | ${count} | ${percentage} |\n`;
  }
  content += '\n';
  
  content += '## Conversation Patterns\n\n';
  content += '| Pattern | Count |\n';
  content += '|---------|-------|\n';
  
  for (const [pattern, value] of Object.entries(analysis.patterns)) {
    if (typeof value === 'number') {
      content += `| ${pattern} | ${value} |\n`;
    }
  }
  content += '\n';
  
  if (analysis.patterns.avgUserMessageLength) {
    content += `- Average User Message Length: ${analysis.patterns.avgUserMessageLength.toFixed(2)} characters\n`;
  }
  
  if (analysis.patterns.avgAssistantMessageLength) {
    content += `- Average Assistant Message Length: ${analysis.patterns.avgAssistantMessageLength.toFixed(2)} characters\n`;
  }
  
  content += '\n';
  
  content += '## Template Recommendations\n\n';
  
  const templateTypes = Object.keys(analysis.templateSuggestions);
  
  if (templateTypes.length > 0) {
    content += 'Based on the conversation analysis, the following templates have been generated:\n\n';
    templateTypes.forEach(type => {
      content += `- [${type} Template](../templates/${type}-template.md)\n`;
    });
  } else {
    content += 'No templates were generated based on the current analysis.\n';
  }
  
  fs.writeFileSync(analysisPath, content);
  console.log(`Analysis summary exported to ${analysisPath}`);
}

/**
 * Main function
 */
function main() {
  try {
    // Ensure directories exist first
    ensureDirectories();
    
    const options = processArgs();
    
    const files = findChatLogs(options);
    console.log(`Found ${files.length} conversation files`);
    
    if (files.length === 0) {
      console.log('No conversations found. A sample conversation has been created in the samples directory.');
      console.log(`Try running the tool again with: --source "${CONFIG.sampleDir}"`);
      return;
    }
    
    const conversations = files.map(file => parseConversation(file));
    console.log(`Parsed ${conversations.length} conversations with ${
      conversations.reduce((sum, conv) => sum + conv.exchanges.length, 0)
    } total exchanges`);
    
    let analysis = null;
    if (options.analyze) {
      console.log('Analyzing conversations...');
      analysis = analyzeConversations(conversations);
    }
    
    exportConversations(conversations, options, analysis);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTry running with --help for usage information');
    process.exit(1);
  }
}

// Run the script
main(); 