#!/usr/bin/env node

/**
 * CleanupAgent - An agentic workflow for analyzing and cleaning up the codebase
 * 
 * This script implements a recursive analysis system that identifies potentially
 * outdated files in the project. It uses contextual understanding and horizon awareness
 * to make smart decisions about which files should be preserved and which might be
 * candidates for cleanup.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const child_process = require('child_process');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const exec = util.promisify(child_process.exec);

// Configuration options
const CONFIG = {
  // Files to ignore during scanning
  ignorePatterns: [
    'node_modules',
    '.git',
    'dist',
    'out',
    '.bak',
    '*.map',
  ],
  // File extensions to analyze
  analyzeExtensions: [
    '.ts',
    '.js',
    '.tsx',
    '.jsx',
    '.md',
    '.mdc',
    '.json',
    '.sh',
    '.bat',
    '.ps1',
    '.css',
  ],
  // Minimum time (in milliseconds) since last modification to consider a file potentially outdated
  // Default: 30 days
  ageThreshold: 30 * 24 * 60 * 60 * 1000,
  // Whether to actually delete files or just report
  dryRun: true,
  // Whether to load horizon data
  useHorizonData: true,
  // Path to the horizon map
  horizonMapPath: '@horizon-map.mdc',
  // Path to research levels framework
  researchLevelsPath: '.cursor/memory/research-levels-framework.mdc',
  // Path to OACL framework
  oaclPath: '.cursor/memory/oacl.mdc',
  // Output path for cleanup report
  outputPath: 'cleanup-report.md',
  // Whether to verbose logging
  verbose: true,
  // Repository root path
  rootPath: process.cwd(),
};

// Global tracking variables
const stats = {
  totalFiles: 0,
  analyzedFiles: 0,
  potentialCleanupFiles: 0,
  deletedFiles: 0,
  preservedProjects: new Set(),
  horizonOneFiles: new Set(),
  cleanupCandidates: [],
};

// Context collection
const context = {
  horizon: {
    h1: new Set(),
    h2: new Set(),
    h3: new Set(),
  },
  researchLevels: [],
  oacl: {},
  fileMetrics: new Map(), // file path -> metrics
  codebase: {
    activeComponents: new Set(),
    dependencies: new Map(), // file -> [dependencies]
    importedBy: new Map(),   // file -> [importers]
  }
};

/**
 * Main function to run the cleanup agent
 */
async function main() {
  console.log('🤖 Starting Cleanup Agent...');
  console.log(`📂 Analyzing repository: ${CONFIG.rootPath}`);
  
  try {
    // Load contextual data
    await loadContextualData();
    
    // Gather file metrics and analyze codebase
    await analyzeRepository(CONFIG.rootPath);
    
    // Identify potential cleanup candidates
    identifyCleanupCandidates();
    
    // Generate report
    await generateReport();
    
    // Summary
    console.log('\n📊 Cleanup Analysis Summary:');
    console.log(`  Total files scanned: ${stats.totalFiles}`);
    console.log(`  Files analyzed: ${stats.analyzedFiles}`);
    console.log(`  Potential cleanup candidates: ${stats.potentialCleanupFiles}`);
    
    if (!CONFIG.dryRun && stats.deletedFiles > 0) {
      console.log(`  Files deleted: ${stats.deletedFiles}`);
    } else if (CONFIG.dryRun) {
      console.log(`  Dry run enabled - no files deleted`);
    }
    
    console.log(`\n📝 Report generated at: ${CONFIG.outputPath}`);
    
  } catch (error) {
    console.error('❌ Error running cleanup agent:', error);
    process.exit(1);
  }
}

/**
 * Load contextual data from various sources
 */
async function loadContextualData() {
  console.log('📚 Loading contextual data...');
  
  // Load horizon data if available
  if (CONFIG.useHorizonData) {
    try {
      if (fs.existsSync(CONFIG.horizonMapPath)) {
        const horizonData = await readFile(CONFIG.horizonMapPath, 'utf8');
        parseHorizonData(horizonData);
        console.log(`  ✅ Loaded horizon data (H1: ${context.horizon.h1.size}, H2: ${context.horizon.h2.size}, H3: ${context.horizon.h3.size} items)`);
      } else {
        console.log('  ❓ Horizon map not found, continuing without it');
      }
    } catch (error) {
      console.log('  ⚠️ Error loading horizon data:', error.message);
    }
  }
  
  // Load OACL data if available
  try {
    if (fs.existsSync(CONFIG.oaclPath)) {
      const oaclData = await readFile(CONFIG.oaclPath, 'utf8');
      parseOACLData(oaclData);
      console.log('  ✅ Loaded OACL data');
    } else {
      console.log('  ❓ OACL file not found, continuing without it');
    }
  } catch (error) {
    console.log('  ⚠️ Error loading OACL data:', error.message);
  }
  
  // Load Research Levels Framework data if available
  try {
    if (fs.existsSync(CONFIG.researchLevelsPath)) {
      const researchData = await readFile(CONFIG.researchLevelsPath, 'utf8');
      parseResearchLevelsData(researchData);
      console.log('  ✅ Loaded Research Levels data');
    } else {
      console.log('  ❓ Research Levels framework not found, continuing without it');
    }
  } catch (error) {
    console.log('  ⚠️ Error loading Research Levels data:', error.message);
  }
  
  // Load package.json for dependencies
  try {
    if (fs.existsSync('package.json')) {
      const packageData = JSON.parse(await readFile('package.json', 'utf8'));
      context.packageData = packageData;
      if (packageData.name) {
        stats.preservedProjects.add(packageData.name);
      }
      
      // Track dependencies as preserved references
      const allDeps = {
        ...(packageData.dependencies || {}),
        ...(packageData.devDependencies || {}),
      };
      
      Object.keys(allDeps).forEach(dep => {
        stats.preservedProjects.add(dep);
      });
      
      console.log(`  ✅ Loaded package.json (${Object.keys(allDeps).length} dependencies)`);
    }
  } catch (error) {
    console.log('  ⚠️ Error loading package.json:', error.message);
  }
}

/**
 * Extract horizon data from the horizon map
 */
function parseHorizonData(horizonData) {
  // Simple regex-based parsing for horizon data
  const h1Match = horizonData.match(/### Horizon 1 \(Now\)([\s\S]*?)(?=### Horizon 2|$)/);
  const h2Match = horizonData.match(/### Horizon 2 \(Next\)([\s\S]*?)(?=### Horizon 3|$)/);
  const h3Match = horizonData.match(/### Horizon 3 \(Future\)([\s\S]*?)(?=$)/);
  
  if (h1Match) {
    extractItems(h1Match[1], context.horizon.h1);
  }
  
  if (h2Match) {
    extractItems(h2Match[1], context.horizon.h2);
  }
  
  if (h3Match) {
    extractItems(h3Match[1], context.horizon.h3);
  }
}

/**
 * Extract items from text section into a Set
 */
function extractItems(text, set) {
  const itemRegex = /- (.*?)(?=\n- |\n\n|\n###|$)/g;
  let match;
  
  while ((match = itemRegex.exec(text)) !== null) {
    const item = match[1].trim();
    if (item) {
      set.add(item.toLowerCase());
      
      // Also add key words from the item
      const words = item.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          set.add(word);
        }
      });
    }
  }
}

/**
 * Extract OACL data 
 */
function parseOACLData(oaclData) {
  // For now, just storing raw data for reference
  context.oacl.raw = oaclData;
  
  // Extract key components
  const componentMatch = oaclData.match(/### \d+\. ([^\n]+)/g);
  if (componentMatch) {
    context.oacl.components = componentMatch.map(m => 
      m.replace(/^### \d+\. /, '').trim()
    );
  }
}

/**
 * Extract Research Levels Framework data
 */
function parseResearchLevelsData(researchData) {
  // Extract research levels
  const levelMatch = researchData.match(/### \d+\. ([^\n]+) \[Level \d+\]/g);
  if (levelMatch) {
    context.researchLevels = levelMatch.map(m => {
      const component = m.replace(/^### \d+\. /, '').replace(/ \[Level \d+\]$/, '').trim();
      const levelMatch = m.match(/\[Level (\d+)\]/);
      const level = levelMatch ? parseInt(levelMatch[1]) : 0;
      
      return { component, level };
    });
  }
}

/**
 * Recursively analyze the repository
 */
async function analyzeRepository(dirPath, relativePath = '') {
  // Read directory contents
  const items = await readdir(dirPath);
  
  // Process each item
  for (const item of items) {
    // Skip ignored patterns
    if (shouldIgnoreItem(item)) {
      continue;
    }
    
    const fullPath = path.join(dirPath, item);
    const itemRelativePath = relativePath ? path.join(relativePath, item) : item;
    const itemStat = await stat(fullPath);
    
    if (itemStat.isDirectory()) {
      // Recursively process directory
      await analyzeRepository(fullPath, itemRelativePath);
    } else if (itemStat.isFile()) {
      stats.totalFiles++;
      
      // Check if we should analyze this file
      const extension = path.extname(item).toLowerCase();
      
      if (CONFIG.analyzeExtensions.includes(extension)) {
        stats.analyzedFiles++;
        
        // Collect file metrics
        const metrics = {
          path: itemRelativePath,
          fullPath: fullPath,
          lastModified: itemStat.mtime,
          size: itemStat.size,
          extension: extension,
          age: Date.now() - itemStat.mtime.getTime(),
          horizonLevel: getHorizonLevel(itemRelativePath),
          inActiveComponent: false,
          dependencies: [],
          importers: [],
        };
        
        try {
          // For source code files, extract imports and exports
          if (['.ts', '.js', '.tsx', '.jsx'].includes(extension)) {
            const content = await readFile(fullPath, 'utf8');
            metrics.dependencies = extractDependencies(content);
            metrics.hasExports = /export\s+(default\s+|{|\*|class|function|const|let|var)/g.test(content);
            metrics.recentlyModified = await checkGitHistory(fullPath);
            await checkImports(fullPath, itemRelativePath);
          }
        } catch (error) {
          if (CONFIG.verbose) {
            console.log(`  ⚠️ Error analyzing ${itemRelativePath}: ${error.message}`);
          }
        }
        
        // Store metrics
        context.fileMetrics.set(itemRelativePath, metrics);
        
        // If this is a horizon 1 file, mark it
        if (metrics.horizonLevel === 1) {
          stats.horizonOneFiles.add(itemRelativePath);
        }
      }
    }
  }
}

/**
 * Determine if an item should be ignored
 */
function shouldIgnoreItem(item) {
  return CONFIG.ignorePatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(item);
    }
    return item === pattern;
  });
}

/**
 * Get the horizon level for a file
 */
function getHorizonLevel(filePath) {
  const filePathLower = filePath.toLowerCase();
  const fileName = path.basename(filePathLower);
  const fileContent = [];
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
      fileContent.push(content);
    }
  } catch (error) {
    // Ignore errors reading file content
  }
  
  // Check if file is in Horizon 1
  for (const h1Item of context.horizon.h1) {
    if (filePathLower.includes(h1Item) || 
        fileName.includes(h1Item) ||
        fileContent.some(content => content.includes(h1Item))) {
      return 1;
    }
  }
  
  // Check if file is in Horizon 2
  for (const h2Item of context.horizon.h2) {
    if (filePathLower.includes(h2Item) || 
        fileName.includes(h2Item) ||
        fileContent.some(content => content.includes(h2Item))) {
      return 2;
    }
  }
  
  // Check if file is in Horizon 3
  for (const h3Item of context.horizon.h3) {
    if (filePathLower.includes(h3Item) || 
        fileName.includes(h3Item) ||
        fileContent.some(content => content.includes(h3Item))) {
      return 3;
    }
  }
  
  // Default to horizon 0 (not classified)
  return 0;
}

/**
 * Extract dependencies from a source file
 */
function extractDependencies(content) {
  const dependencies = [];
  
  // Match import statements
  const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    dependencies.push(match[1]);
  }
  
  // Match require statements
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  while ((match = requireRegex.exec(content)) !== null) {
    dependencies.push(match[1]);
  }
  
  return dependencies;
}

/**
 * Check git history for recent modifications
 */
async function checkGitHistory(filePath) {
  try {
    const { stdout } = await exec(`git log -1 --pretty=format:%ct -- "${filePath}"`);
    if (stdout) {
      const lastCommitTime = parseInt(stdout) * 1000; // Convert to milliseconds
      const daysSinceLastCommit = Math.floor((Date.now() - lastCommitTime) / (24 * 60 * 60 * 1000));
      return daysSinceLastCommit < 30; // Consider "recent" if less than 30 days
    }
  } catch (error) {
    // Ignore git errors
  }
  return false;
}

/**
 * Check what files import this file
 */
async function checkImports(filePath, relativePath) {
  // Only for source files
  const extension = path.extname(filePath).toLowerCase();
  if (!['.ts', '.js', '.tsx', '.jsx'].includes(extension)) {
    return;
  }
  
  // Get the module name (without extension)
  const moduleName = relativePath.replace(/\.\w+$/, '');
  
  // Check existing module metrics
  for (const [path, metrics] of context.fileMetrics.entries()) {
    if (metrics.dependencies && metrics.dependencies.length > 0) {
      for (const dep of metrics.dependencies) {
        if (dep === moduleName || dep === `./${moduleName}` || dep === `../${moduleName}`) {
          // This file imports our target file
          if (!context.codebase.importedBy.has(relativePath)) {
            context.codebase.importedBy.set(relativePath, []);
          }
          context.codebase.importedBy.get(relativePath).push(path);
          
          // Also update the metrics
          metrics.importers.push(path);
        }
      }
    }
  }
}

/**
 * Identify potential cleanup candidates
 */
function identifyCleanupCandidates() {
  console.log('\n🔍 Identifying potential cleanup candidates...');
  
  for (const [filePath, metrics] of context.fileMetrics.entries()) {
    let isCandidate = false;
    const reasons = [];
    
    // Check if file is old and not in Horizon 1
    if (metrics.age > CONFIG.ageThreshold && metrics.horizonLevel !== 1) {
      isCandidate = true;
      reasons.push(`File is ${Math.floor(metrics.age / (24 * 60 * 60 * 1000))} days old and not in Horizon 1`);
    }
    
    // Check if no one imports this file
    const importers = context.codebase.importedBy.get(filePath) || [];
    if (metrics.hasExports && importers.length === 0 && ['.ts', '.js', '.tsx', '.jsx'].includes(metrics.extension)) {
      isCandidate = true;
      reasons.push('File exports code but is not imported anywhere');
    }
    
    // For TypeScript/JavaScript, check if file appears to be a duplicate or old version
    if (['.ts', '.js'].includes(metrics.extension)) {
      const altExt = metrics.extension === '.ts' ? '.js' : '.ts';
      const altPath = filePath.replace(/\.\w+$/, altExt);
      
      if (context.fileMetrics.has(altPath)) {
        // Both .ts and .js versions exist
        const altMetrics = context.fileMetrics.get(altPath);
        
        // If the .ts file is newer, the .js file is likely generated
        if (metrics.extension === '.js' && context.fileMetrics.has(filePath.replace(/\.js$/, '.ts'))) {
          isCandidate = true;
          reasons.push('Generated JavaScript file with TypeScript source available');
        }
      }
    }
    
    // Check for test data or build artifacts
    if (filePath.includes('/test_data/') || 
        filePath.includes('/dist/') || 
        filePath.includes('/out/') ||
        (metrics.extension === '.map')) {
      isCandidate = true;
      reasons.push('Test data or build artifact');
    }
    
    if (isCandidate) {
      stats.potentialCleanupFiles++;
      stats.cleanupCandidates.push({
        path: filePath,
        fullPath: metrics.fullPath,
        reasons,
        metrics
      });
    }
  }
  
  // Sort candidates by confidence
  stats.cleanupCandidates.sort((a, b) => b.reasons.length - a.reasons.length);
}

/**
 * Generate a report of cleanup candidates
 */
async function generateReport() {
  console.log('\n📝 Generating cleanup report...');
  
  let report = `# Cleanup Agent Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total files scanned: ${stats.totalFiles}\n`;
  report += `- Files analyzed: ${stats.analyzedFiles}\n`;
  report += `- Potential cleanup candidates: ${stats.potentialCleanupFiles}\n`;
  report += `- Horizon 1 files: ${stats.horizonOneFiles.size}\n\n`;
  
  report += `## Cleanup Candidates\n\n`;
  
  if (stats.cleanupCandidates.length === 0) {
    report += `No cleanup candidates identified.\n\n`;
  } else {
    report += `The following files are potential candidates for cleanup:\n\n`;
    
    for (const candidate of stats.cleanupCandidates) {
      report += `### ${candidate.path}\n\n`;
      report += `Reasons:\n`;
      for (const reason of candidate.reasons) {
        report += `- ${reason}\n`;
      }
      
      report += `\nMetrics:\n`;
      report += `- Last modified: ${candidate.metrics.lastModified}\n`;
      report += `- Size: ${candidate.metrics.size} bytes\n`;
      report += `- Age: ${Math.floor(candidate.metrics.age / (24 * 60 * 60 * 1000))} days\n`;
      report += `- Horizon level: ${candidate.metrics.horizonLevel}\n`;
      
      if (candidate.metrics.recentlyModified) {
        report += `- Recently modified in git: Yes\n`;
      }
      
      if (candidate.metrics.importers && candidate.metrics.importers.length > 0) {
        report += `- Imported by: ${candidate.metrics.importers.length} files\n`;
      } else {
        report += `- Imported by: None\n`;
      }
      
      report += `\n`;
      
      // If not a dry run, we could delete the file
      if (!CONFIG.dryRun) {
        try {
          fs.unlinkSync(candidate.fullPath);
          stats.deletedFiles++;
          report += `**File deleted**\n\n`;
        } catch (error) {
          report += `**Error deleting file: ${error.message}**\n\n`;
        }
      } else {
        report += `**Deletion skipped (dry run)**\n\n`;
      }
      
      report += `---\n\n`;
    }
  }
  
  report += `## Next Steps\n\n`;
  report += `1. Review this report carefully\n`;
  report += `2. Run with \`--dry-run=false\` to actually delete files\n`;
  report += `3. Consider updating the horizon map to properly categorize files\n`;
  
  // Write the report
  await writeFile(CONFIG.outputPath, report);
}

// Parse command line arguments
function parseArgs() {
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    
    if (arg === '--dry-run=false') {
      CONFIG.dryRun = false;
    } else if (arg === '--verbose=false') {
      CONFIG.verbose = false;
    } else if (arg.startsWith('--age-threshold=')) {
      const days = parseInt(arg.split('=')[1]);
      if (!isNaN(days)) {
        CONFIG.ageThreshold = days * 24 * 60 * 60 * 1000;
      }
    } else if (arg.startsWith('--output=')) {
      CONFIG.outputPath = arg.split('=')[1];
    }
  }
}

// Run the script
parseArgs();
main().catch(error => {
  console.error('Error running cleanup agent:', error);
  process.exit(1);
}); 