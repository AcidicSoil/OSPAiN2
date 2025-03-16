#!/usr/bin/env node

/**
 * Text Cleanup Tool
 * 
 * A utility for finding and replacing text patterns in the codebase
 * with context-aware replacements to ensure consistency.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { glob } = require('glob');

// Configuration
const CONFIG = {
  defaultExcludeDirs: ['node_modules', '.git', 'dist', 'build'],
  defaultIncludeFiles: ['*.js', '*.ts', '*.jsx', '*.tsx', '*.md', '*.json', '*.html', '*.css'],
  reportDir: './cleanup-reports',
  maxContextLength: 100
};

// Initialize program
program
  .name('text-cleanup')
  .description('Find and replace text in codebase with context-aware replacements')
  .option('-p, --pattern <pattern>', 'Text pattern to search for (regex supported)')
  .option('-r, --replacement <replacement>', 'Text to replace matches with (can be dynamic)')
  .option('-d, --directory <directory>', 'Root directory to search in', '.')
  .option('-i, --include <glob>', 'Glob pattern for files to include', '**/*.{js,ts,jsx,tsx,md,json,html,css}')
  .option('-e, --exclude <dirs>', 'Directories to exclude', CONFIG.defaultExcludeDirs.join(','))
  .option('-c, --context-lines <number>', 'Number of context lines to analyze', '3')
  .option('--dry-run', 'Show what would be changed without making changes', false)
  .option('--smart', 'Use smart replacement based on context', false)
  .option('--report <file>', 'Output report file', './cleanup-report.md')
  .parse(process.argv);

const options = program.opts();

/**
 * Creates regex for the search pattern
 * @param {string} pattern - Search pattern
 * @returns {RegExp} - Regex pattern
 */
function createSearchRegex(pattern) {
  // Check if pattern is already a regex
  if (pattern.startsWith('/') && (pattern.endsWith('/i') || pattern.endsWith('/g') || pattern.endsWith('/'))) {
    // Extract regex and flags
    const match = pattern.match(/^\/(.*)\/([igm]*)$/);
    if (match) {
      return new RegExp(match[1], match[2] || 'g');
    }
  }
  
  // Create case-insensitive global regex by default
  return new RegExp(pattern, 'ig');
}

/**
 * Finds files matching the include pattern and not in excluded directories
 * @param {string} rootDir - Root directory to search in
 * @param {string} includePattern - Glob pattern for files to include
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {Promise<string[]>} - List of matching file paths
 */
function findFiles(rootDir, includePattern, excludeDirs) {
  return new Promise((resolve, reject) => {
    console.log(`Finding files in ${rootDir} matching ${includePattern}`);
    console.log(`Excluding directories: ${excludeDirs.join(', ')}`);
    
    const options = {
      cwd: rootDir,
      ignore: excludeDirs.map(dir => `**/${dir}/**`)
    };
    
    try {
      glob(includePattern, options).then(files => {
        console.log(`Found ${files.length} files matching pattern`);
        resolve(files.map(file => path.join(rootDir, file)));
      }).catch(err => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Gets context around a match
 * @param {string} content - File content
 * @param {number} matchIndex - Index of match
 * @param {number} matchLength - Length of match
 * @param {number} contextLines - Number of context lines
 * @returns {string} - Context text
 */
function getContext(content, matchIndex, matchLength, contextLines) {
  // Find start of context (beginning of line)
  let start = matchIndex;
  while (start > 0 && content[start - 1] !== '\n') {
    start--;
  }
  
  // Go back additional lines for context
  let lineCount = 0;
  let contextStart = start;
  while (contextStart > 0 && lineCount < contextLines) {
    contextStart--;
    if (content[contextStart] === '\n') {
      lineCount++;
    }
    if (contextStart === 0) break;
  }
  if (contextStart > 0) contextStart++; // Skip the newline
  
  // Find end of context (end of line)
  let end = matchIndex + matchLength;
  while (end < content.length && content[end] !== '\n') {
    end++;
  }
  
  // Go forward additional lines for context
  lineCount = 0;
  let contextEnd = end;
  while (contextEnd < content.length && lineCount < contextLines) {
    if (content[contextEnd] === '\n') {
      lineCount++;
    }
    contextEnd++;
    if (contextEnd >= content.length) break;
  }
  
  return content.substring(contextStart, contextEnd);
}

/**
 * Analyzes context to determine appropriate replacement
 * @param {string} match - Matched text
 * @param {string} context - Context around match
 * @returns {string} - Appropriate replacement
 */
function analyzeContext(match, context) {
  const lowerContext = context.toLowerCase();
  const lowerMatch = match.toLowerCase();
  
  // Example context analysis for ollama-tag-cli to t2p
  if (lowerMatch.includes('ollama-tag-cli') || lowerMatch.includes('ollama tag cli')) {
    // Check context for code-related terms indicating camelCase might be appropriate
    if (
      lowerContext.includes('function') || 
      lowerContext.includes('const') || 
      lowerContext.includes('let') || 
      lowerContext.includes('var') || 
      lowerContext.includes('import') || 
      lowerContext.includes('export') ||
      lowerContext.includes('class') ||
      lowerContext.includes('interface') ||
      // New code context patterns
      lowerContext.includes('require(') ||
      lowerContext.includes('module.exports') ||
      lowerContext.includes('return') ||
      lowerContext.includes('await') ||
      lowerContext.includes('async') ||
      lowerContext.includes('extends') ||
      lowerContext.includes('implements') ||
      lowerContext.includes('new') ||
      lowerContext.includes('this.') ||
      lowerContext.includes('=>') ||
      lowerContext.includes('() =>')
    ) {
      return match.replace(/ollama-tag-cli|ollama tag cli/ig, 't2p');
    }
    
    // Check context for documentation or UI related terms
    if (
      lowerContext.includes('# ') || 
      lowerContext.includes('title') || 
      lowerContext.includes('header') || 
      lowerContext.includes('button') ||
      lowerContext.includes('heading') ||
      // New documentation context patterns
      lowerContext.includes('## ') ||
      lowerContext.includes('### ') ||
      lowerContext.includes('documentation') ||
      lowerContext.includes('readme') ||
      lowerContext.includes('guide') ||
      lowerContext.includes('tutorial') ||
      lowerContext.includes('example') ||
      lowerContext.includes('<h1>') ||
      lowerContext.includes('<h2>') ||
      lowerContext.includes('description')
    ) {
      return match.replace(/ollama-tag-cli|ollama tag cli/ig, 'T2P');
    }
    
    // New: Check for command-line/shell script context
    if (
      lowerContext.includes('npm') ||
      lowerContext.includes('yarn') ||
      lowerContext.includes('npx') ||
      lowerContext.includes('./') ||
      lowerContext.includes('command') ||
      lowerContext.includes('run') ||
      lowerContext.includes('script') ||
      lowerContext.includes('bash') ||
      lowerContext.includes('shell') ||
      lowerContext.includes('terminal') ||
      lowerContext.includes('$ ') ||
      lowerContext.includes('```bash') ||
      lowerContext.includes('```shell')
    ) {
      return match.replace(/ollama-tag-cli|ollama tag cli/ig, 't2p');
    }
    
    // New: Check for package/dependency context
    if (
      lowerContext.includes('package.json') ||
      lowerContext.includes('dependencies') ||
      lowerContext.includes('devdependencies') ||
      lowerContext.includes('version') ||
      lowerContext.includes('install') ||
      lowerContext.includes('registry') ||
      lowerContext.includes('@latest') ||
      lowerContext.includes('node_modules')
    ) {
      // Use kebab-case for package names (npm convention)
      return match.replace(/ollama-tag-cli|ollama tag cli/ig, 't2p');
    }
    
    // New: Check for file path context
    if (
      lowerContext.includes('path') ||
      lowerContext.includes('directory') ||
      lowerContext.includes('folder') ||
      lowerContext.includes('file') ||
      lowerContext.includes('/') ||
      lowerContext.includes('\\') ||
      lowerContext.includes('.js') ||
      lowerContext.includes('.ts') ||
      lowerContext.includes('.md') ||
      lowerContext.includes('import') && lowerContext.includes('from')
    ) {
      // Use appropriate format based on subfolder patterns
      if (lowerContext.includes('/dist/') || lowerContext.includes('\\dist\\')) {
        return match.replace(/ollama-tag-cli|ollama tag cli/ig, 't2p');
      }
      return match.replace(/ollama-tag-cli|ollama tag cli/ig, 't2p');
    }
    
    // Default replacement
    return match.replace(/ollama-tag-cli|ollama tag cli/ig, 't2p');
  }
  
  // New pattern: General capitalization patterns
  if (options.smart && options.replacement) {
    // Check if we're in the beginning of a sentence or heading
    if (
      /^\s*[A-Z]/.test(context) ||
      context.includes('. ' + match) ||
      context.includes('? ' + match) ||
      context.includes('! ' + match) ||
      context.includes('\n' + match)
    ) {
      // Capitalize first letter of replacement
      const replacement = options.replacement;
      return match.replace(
        new RegExp(options.pattern, 'i'), 
        replacement.charAt(0).toUpperCase() + replacement.slice(1)
      );
    }
    
    // Check if everything around is uppercase
    if (/[A-Z]{2,}/.test(context) && !/[a-z]/.test(context)) {
      // Make replacement all uppercase
      return match.replace(
        new RegExp(options.pattern, 'i'),
        options.replacement.toUpperCase()
      );
    }
  }
  
  // If no specific rules match, return the provided replacement
  return options.replacement || match;
}

/**
 * Processes a file to find and replace text
 * @param {string} filePath - Path to file
 * @param {RegExp} searchPattern - Regex pattern to search for
 * @param {boolean} isDryRun - Whether to actually make changes
 * @param {boolean} isSmartReplacement - Whether to use smart replacement
 * @param {number} contextLines - Number of context lines to analyze
 * @returns {Object} - Report of changes
 */
async function processFile(filePath, searchPattern, isDryRun, isSmartReplacement, contextLines) {
  const report = {
    file: filePath,
    matches: 0,
    replacements: [],
    newContent: null
  };
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let lastIndex = 0;
    let match;
    
    // Reset regex to start from beginning
    searchPattern.lastIndex = 0;
    
    while ((match = searchPattern.exec(content)) !== null) {
      report.matches++;
      
      const matchText = match[0];
      const matchIndex = match.index;
      
      // Get context around match
      const context = getContext(content, matchIndex, matchText.length, contextLines);
      
      // Determine replacement
      let replacement;
      if (isSmartReplacement) {
        replacement = analyzeContext(matchText, context);
      } else {
        replacement = options.replacement || matchText;
      }
      
      // Skip if no change
      if (replacement === matchText) {
        continue;
      }
      
      report.replacements.push({
        original: matchText,
        replacement,
        context: context
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join(' → ')
          .substring(0, CONFIG.maxContextLength)
      });
      
      // Replace in new content if not dry run
      if (!isDryRun) {
        newContent = newContent.substring(0, matchIndex) + 
                     replacement + 
                     newContent.substring(matchIndex + matchText.length);
        
        // Adjust indices for future matches
        const lengthDiff = replacement.length - matchText.length;
        searchPattern.lastIndex += lengthDiff;
      }
    }
    
    report.newContent = newContent;
    return report;
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return {
      file: filePath,
      error: error.message,
      matches: 0,
      replacements: []
    };
  }
}

/**
 * Generates a markdown report of changes
 * @param {Array} fileReports - Reports for each file
 * @param {Object} options - Command line options
 * @returns {string} - Markdown report
 */
function generateReport(fileReports, options) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  let totalMatches = 0;
  let totalReplacements = 0;
  
  fileReports.forEach(report => {
    totalMatches += report.matches;
    totalReplacements += report.replacements.length;
  });
  
  let markdown = `# Text Cleanup Report\n\n`;
  markdown += `Generated: ${timestamp}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Search Pattern:** \`${options.pattern}\`\n`;
  markdown += `- **Replacement:** ${options.replacement || '(smart replacement)'}\n`;
  markdown += `- **Files Scanned:** ${fileReports.length}\n`;
  markdown += `- **Total Matches:** ${totalMatches}\n`;
  markdown += `- **Total Replacements:** ${totalReplacements}\n`;
  markdown += `- **Mode:** ${options.dryRun ? 'Dry Run' : 'Actual Changes'}\n`;
  markdown += `- **Smart Replacement:** ${options.smart ? 'Yes' : 'No'}\n\n`;
  
  if (totalReplacements > 0) {
    markdown += `## Replacements\n\n`;
    
    fileReports.forEach(report => {
      if (report.replacements.length > 0) {
        markdown += `### ${report.file}\n\n`;
        markdown += `| Original | Replacement | Context |\n`;
        markdown += `|----------|-------------|--------|\n`;
        
        report.replacements.forEach(rep => {
          markdown += `| \`${rep.original.replace(/\|/g, '\\|')}\` | \`${rep.replacement.replace(/\|/g, '\\|')}\` | ${rep.context.replace(/\|/g, '\\|')} |\n`;
        });
        
        markdown += `\n`;
      }
    });
  }
  
  if (options.dryRun) {
    markdown += `\n## Next Steps\n\n`;
    markdown += `This was a dry run. To apply these changes, run the command again without the \`--dry-run\` flag:\n\n`;
    markdown += `\`\`\`bash\n`;
    markdown += `node text-cleanup.js --pattern "${options.pattern}" ${options.replacement ? `--replacement "${options.replacement}" ` : ''}--directory "${options.directory}" ${options.smart ? '--smart' : ''}\n`;
    markdown += `\`\`\`\n`;
  }
  
  return markdown;
}

/**
 * Main function
 */
async function main() {
  try {
    // Validate required options
    if (!options.pattern) {
      console.error('Error: Pattern is required');
      program.help();
      return;
    }
    
    // Smart replacement requires either a default replacement or specific rules
    if (options.smart && !options.replacement) {
      console.log('Smart replacement enabled without default replacement. Will rely on context rules.');
    }
    
    const searchPattern = createSearchRegex(options.pattern);
    const excludeDirs = options.exclude.split(',');
    const contextLines = parseInt(options.contextLines) || 3;
    
    console.log(`Searching for: ${searchPattern}`);
    console.log(`In directory: ${options.directory}`);
    console.log(`Mode: ${options.dryRun ? 'Dry Run' : 'Making Changes'}`);
    console.log(`Smart replacement: ${options.smart ? 'Enabled' : 'Disabled'}`);
    
    // Find files
    const files = await findFiles(options.directory, options.include, excludeDirs);
    console.log(`Found ${files.length} files to process`);
    
    // Process each file
    const fileReports = [];
    let processedCount = 0;
    let matchesFound = false;

    console.log(`Starting to process files...`);

    for (const file of files) {
      processedCount++;
      if (processedCount % 100 === 0 || processedCount === files.length) {
        console.log(`Processed ${processedCount}/${files.length} files...`);
      }
      
      // Check if the file contains the pattern before full processing
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (searchPattern.test(content)) {
          console.log(`Match found in: ${file}`);
          matchesFound = true;
          
          // Reset the pattern for full processing
          searchPattern.lastIndex = 0;
          
          const report = await processFile(
            file, 
            searchPattern, 
            options.dryRun, 
            options.smart,
            contextLines
          );
          
          if (report.matches > 0) {
            fileReports.push(report);
            console.log(`  - Found ${report.matches} matches, ${report.replacements.length} replacements`);
            
            // Write changes to file if not dry run and changes were made
            if (!options.dryRun && report.replacements.length > 0) {
              fs.writeFileSync(file, report.newContent, 'utf8');
            }
          }
        }
      } catch (error) {
        console.error(`Error checking file ${file}: ${error.message}`);
      }
    }
    
    // Generate report
    const reportMarkdown = generateReport(fileReports, options);
    
    // Ensure report directory exists
    const reportDir = path.dirname(options.report);
    if (reportDir !== '.' && !fs.existsSync(reportDir)) {
      try {
        fs.mkdirSync(reportDir, { recursive: true });
        console.log(`Created report directory: ${reportDir}`);
      } catch (error) {
        console.error(`Warning: Could not create report directory ${reportDir}: ${error.message}`);
        console.log(`Will save report to current directory instead.`);
        options.report = path.basename(options.report);
      }
    }
    
    // Write report
    fs.writeFileSync(options.report, reportMarkdown, 'utf8');
    
    console.log(`\nProcessed ${files.length} files`);
    console.log(`Found matches in ${fileReports.length} files`);
    console.log(`Total replacements: ${fileReports.reduce((sum, report) => sum + report.replacements.length, 0)}`);
    console.log(`Report saved to: ${options.report}`);
    
    if (options.dryRun) {
      console.log(`\nThis was a dry run. No changes were made.`);
      console.log(`To apply these changes, run again without the --dry-run flag.`);
    } else {
      console.log(`\nChanges applied successfully.`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 