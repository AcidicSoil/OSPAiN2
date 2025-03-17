/**
 * Context Distributor
 * 
 * Advanced system for intelligently distributing context across related files
 * with smooth transitions between related contexts.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RULES_DIR = '.cursor/rules';
const SOURCE_DIRS = ['.cursor/rules', 'src', 'docs', 'tests'];
const OUTPUT_DIR = '.cursor/context-enhanced';
const CONTEXT_GRAPH_FILE = '.cursor/context-graph.json';
const MIN_SIMILARITY_SCORE = 0.15;
const MAX_CONTEXT_REFERENCES = 7;  // Maximum number of context references per file

// Main function
async function main() {
  console.log('Context Distributor System');
  console.log('-------------------------');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Step 1: Scan all source directories for files
  console.log('Scanning source directories...');
  const allFiles = [];
  
  for (const dir of SOURCE_DIRS) {
    if (fs.existsSync(dir)) {
      const files = scanDirectory(dir);
      allFiles.push(...files);
      console.log(`Found ${files.length} files in ${dir}`);
    }
  }

  // Step 2: Extract context from files
  console.log('Extracting context from files...');
  const fileContexts = extractContextFromFiles(allFiles);

  // Step 3: Build context similarity graph
  console.log('Building context similarity graph...');
  const contextGraph = buildContextGraph(fileContexts);

  // Step 4: Distribute context across related files
  console.log('Distributing context...');
  const enhancedFiles = distributeContext(allFiles, fileContexts, contextGraph);

  // Step 5: Write enhanced files to output directory
  console.log('Writing enhanced files...');
  for (const file of enhancedFiles) {
    const outputPath = path.join(OUTPUT_DIR, file.relativePath);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, file.enhancedContent);
  }

  // Step 6: Save context graph for visualization and reference
  fs.writeFileSync(CONTEXT_GRAPH_FILE, JSON.stringify(contextGraph, null, 2));

  console.log('\nProcess completed successfully!');
  console.log(`Enhanced files are available in ${OUTPUT_DIR}`);
  console.log(`Context graph saved to ${CONTEXT_GRAPH_FILE}`);
}

// Scan a directory for all files (recursive)
function scanDirectory(dir, baseDir = '', results = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const relativePath = baseDir ? path.join(baseDir, item) : item;
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and hidden directories
      if (item !== 'node_modules' && !item.startsWith('.')) {
        scanDirectory(itemPath, relativePath, results);
      }
    } else if (stats.isFile()) {
      // Only include certain file types
      const ext = path.extname(item).toLowerCase();
      if (['.md', '.mdc', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json'].includes(ext)) {
        results.push({
          path: itemPath,
          relativePath: relativePath,
          content: fs.readFileSync(itemPath, 'utf8')
        });
      }
    }
  }
  
  return results;
}

// Extract context from each file
function extractContextFromFiles(files) {
  const fileContexts = [];
  
  for (const file of files) {
    const context = {
      path: file.path,
      relativePath: file.relativePath,
      title: extractTitle(file),
      concepts: extractConcepts(file.content),
      keywords: extractKeywords(file.content),
      summary: summarizeContent(file.content),
      type: determineFileType(file.relativePath),
      existingReferences: extractExistingReferences(file.content)
    };
    
    fileContexts.push(context);
  }
  
  return fileContexts;
}

// Extract title from file
function extractTitle(file) {
  // For markdown and MDC files, look for a heading
  if (file.relativePath.endsWith('.md') || file.relativePath.endsWith('.mdc')) {
    const titleMatch = file.content.match(/(?:^|\n)(?:# |## )(.*?)(?:\n|$)/);
    if (titleMatch) {
      return titleMatch[1];
    }
  }
  
  // For JavaScript/TypeScript files, look for class/function names
  if (['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(file.relativePath).toLowerCase())) {
    const classMatch = file.content.match(/class\s+(\w+)/);
    if (classMatch) {
      return classMatch[1];
    }
    
    const functionMatch = file.content.match(/function\s+(\w+)/);
    if (functionMatch) {
      return functionMatch[1];
    }
  }
  
  // Default to filename without extension
  return path.basename(file.relativePath, path.extname(file.relativePath));
}

// Extract core concepts from content
function extractConcepts(content) {
  const text = content.toLowerCase();
  const concepts = [];
  
  // Core domain concepts
  const domainConcepts = [
    'development', 'design', 'engineering', 'testing', 'deployment', 'maintenance',
    'mode', 'framework', 'ecosystem', 'governance', 'sovereignty', 'knowledge',
    'tool', 'call', 'optimization', 'error', 'handler', 'context', 'prompt',
    'search', 'cache', 'workflow', 'horizon', 'documentation', 'implementation',
    'integration', 'distributed', 'computation', 'tagging', 'reference'
  ];
  
  // Check for each concept
  domainConcepts.forEach(concept => {
    // Count occurrences of concept
    const regex = new RegExp(`\\b${concept}\\b`, 'gi');
    const matches = text.match(regex);
    
    if (matches && matches.length > 0) {
      concepts.push({
        name: concept,
        importance: matches.length
      });
    }
  });
  
  // Sort by importance and limit to top 10
  return concepts
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);
}

// Extract keywords from content
function extractKeywords(content) {
  const text = content.toLowerCase();
  const words = text.split(/\W+/);
  const wordCounts = {};
  
  // Count word frequencies
  words.forEach(word => {
    if (word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'will', 'should'].includes(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Convert to array and sort by frequency
  const keywords = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map(entry => entry.word);
  
  return keywords;
}

// Create a brief summary of content
function summarizeContent(content) {
  // Simple summarization - extract first paragraph or description
  let summary = '';
  
  // Try to find frontmatter description
  const descMatch = content.match(/description:\s*["']?(.*?)["']?(\n|$)/);
  if (descMatch) {
    summary = descMatch[1];
  }
  
  // If no description found or too short, use first paragraph
  if (!summary || summary.length < 20) {
    const paragraphs = content.split(/\n\s*\n/);
    
    // Find first non-empty, non-frontmatter, non-code paragraph
    for (const para of paragraphs) {
      if (
        para.trim().length > 0 && 
        !para.includes('---') && 
        !para.startsWith('```') && 
        !para.startsWith('import ') &&
        !para.startsWith('const ') &&
        !para.startsWith('function ')
      ) {
        // Clean up markdown syntax
        summary = para
          .replace(/[#*`_]/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .trim();
        break;
      }
    }
  }
  
  // Limit summary length
  if (summary.length > 200) {
    summary = summary.substring(0, 197) + '...';
  }
  
  return summary;
}

// Determine file type based on extension and content
function determineFileType(relativePath) {
  const ext = path.extname(relativePath).toLowerCase();
  
  // Map extensions to types
  const typeMap = {
    '.md': 'documentation',
    '.mdc': 'rule',
    '.js': 'source',
    '.ts': 'source',
    '.jsx': 'component',
    '.tsx': 'component',
    '.html': 'markup',
    '.css': 'style',
    '.json': 'configuration'
  };
  
  return typeMap[ext] || 'other';
}

// Extract existing '@' references
function extractExistingReferences(content) {
  const references = [];
  const regex = /@(\w+)\(([^)]*)\)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    references.push({
      name: match[1],
      context: match[2]
    });
  }
  
  return references;
}

// Build context similarity graph
function buildContextGraph(fileContexts) {
  const graph = {
    nodes: fileContexts.map(context => ({
      id: context.relativePath,
      title: context.title,
      type: context.type,
      summary: context.summary
    })),
    edges: []
  };
  
  // Calculate similarity between all pairs of files
  for (let i = 0; i < fileContexts.length; i++) {
    const fileA = fileContexts[i];
    
    for (let j = i + 1; j < fileContexts.length; j++) {
      const fileB = fileContexts[j];
      
      // Calculate similarity score
      const similarity = calculateSimilarity(fileA, fileB);
      
      // Only add edge if similarity is above threshold
      if (similarity >= MIN_SIMILARITY_SCORE) {
        graph.edges.push({
          source: fileA.relativePath,
          target: fileB.relativePath,
          similarity: similarity,
          concepts: findSharedConcepts(fileA, fileB)
        });
      }
    }
  }
  
  return graph;
}

// Calculate similarity between two files
function calculateSimilarity(fileA, fileB) {
  let score = 0;
  
  // Concept similarity
  const conceptsA = fileA.concepts.map(c => c.name);
  const conceptsB = fileB.concepts.map(c => c.name);
  const sharedConcepts = conceptsA.filter(c => conceptsB.includes(c));
  
  score += (sharedConcepts.length / Math.max(1, Math.max(conceptsA.length, conceptsB.length))) * 0.5;
  
  // Keyword similarity
  const sharedKeywords = fileA.keywords.filter(k => fileB.keywords.includes(k));
  score += (sharedKeywords.length / Math.max(1, Math.max(fileA.keywords.length, fileB.keywords.length))) * 0.3;
  
  // Type bonus - same type of files are more likely to be related
  if (fileA.type === fileB.type) {
    score += 0.2;
  }
  
  return score;
}

// Find shared concepts between two files
function findSharedConcepts(fileA, fileB) {
  const conceptsA = fileA.concepts.map(c => c.name);
  const conceptsB = fileB.concepts.map(c => c.name);
  
  return conceptsA.filter(c => conceptsB.includes(c));
}

// Distribute context across related files
function distributeContext(files, fileContexts, contextGraph) {
  const enhancedFiles = [];
  
  // Create map of related files for each file
  const relatedFilesMap = new Map();
  
  contextGraph.edges.forEach(edge => {
    // Add target to source's related files
    if (!relatedFilesMap.has(edge.source)) {
      relatedFilesMap.set(edge.source, []);
    }
    relatedFilesMap.get(edge.source).push({
      path: edge.target,
      similarity: edge.similarity,
      concepts: edge.concepts
    });
    
    // Add source to target's related files
    if (!relatedFilesMap.has(edge.target)) {
      relatedFilesMap.set(edge.target, []);
    }
    relatedFilesMap.get(edge.target).push({
      path: edge.source,
      similarity: edge.similarity,
      concepts: edge.concepts
    });
  });
  
  // Process each file
  for (const file of files) {
    const fileContext = fileContexts.find(ctx => ctx.relativePath === file.relativePath);
    const relatedFiles = relatedFilesMap.get(file.relativePath) || [];
    
    // Sort related files by similarity
    relatedFiles.sort((a, b) => b.similarity - a.similarity);
    
    // Limit to MAX_CONTEXT_REFERENCES
    const topRelated = relatedFiles.slice(0, MAX_CONTEXT_REFERENCES);
    
    // Generate context references
    const contextReferences = generateContextReferences(fileContext, topRelated, fileContexts);
    
    // Add context references to file content
    const enhancedContent = addContextReferences(file.content, contextReferences, fileContext.type);
    
    enhancedFiles.push({
      path: file.path,
      relativePath: file.relativePath,
      originalContent: file.content,
      enhancedContent: enhancedContent
    });
  }
  
  return enhancedFiles;
}

// Generate context references for a file
function generateContextReferences(fileContext, relatedFiles, allFileContexts) {
  const references = [];
  
  // Group related files by type
  const typeGroups = {};
  
  for (const related of relatedFiles) {
    const relatedContext = allFileContexts.find(ctx => ctx.relativePath === related.path);
    if (!relatedContext) continue;
    
    if (!typeGroups[relatedContext.type]) {
      typeGroups[relatedContext.type] = [];
    }
    
    typeGroups[relatedContext.type].push({
      path: related.path,
      name: path.basename(related.path, path.extname(related.path)),
      title: relatedContext.title,
      similarity: related.similarity,
      concepts: related.concepts,
      summary: relatedContext.summary
    });
  }
  
  // Generate references for each type group
  for (const [type, files] of Object.entries(typeGroups)) {
    // Sort files within each type group by similarity
    files.sort((a, b) => b.similarity - a.similarity);
    
    // Add group header if there are files
    if (files.length > 0) {
      references.push({
        type: 'header',
        content: `## Related ${type.charAt(0).toUpperCase() + type.slice(1)} Files`
      });
      
      // Add references for each file
      for (const file of files) {
        const contextDescription = generateContextDescription(file, fileContext.type);
        
        references.push({
          type: 'reference',
          name: file.name,
          path: file.path,
          context: contextDescription
        });
      }
    }
  }
  
  return references;
}

// Generate meaningful context description
function generateContextDescription(relatedFile, currentFileType) {
  let description = '';
  
  // Different description formats based on file relationships
  if (currentFileType === 'rule' && relatedFile.concepts.includes('optimization')) {
    description = `Provides optimization strategies related to ${relatedFile.concepts.filter(c => c !== 'optimization').join(', ')}`;
  } else if (currentFileType === 'rule' && relatedFile.concepts.includes('framework')) {
    description = `Establishes framework components for ${relatedFile.concepts.filter(c => c !== 'framework').join(', ')}`;
  } else if (currentFileType === 'documentation' && relatedFile.concepts.includes('tutorial')) {
    description = `Tutorial covering ${relatedFile.concepts.filter(c => c !== 'tutorial').join(', ')}`;
  } else if (currentFileType === 'source' && relatedFile.type === 'source') {
    description = `Related implementation for ${relatedFile.concepts.join(', ')}`;
  } else if (currentFileType === 'source' && relatedFile.type === 'rule') {
    description = `Governance rules for implementing ${relatedFile.concepts.join(', ')}`;
  } else if (currentFileType === 'component' && relatedFile.type === 'component') {
    description = `Compatible component for ${relatedFile.concepts.join(', ')} integration`;
  } else {
    // Default description based on concepts
    description = `Related context for ${relatedFile.concepts.slice(0, 3).join(', ')}`;
  }
  
  // Add summary if meaningful description couldn't be generated
  if (description.length < 20 && relatedFile.summary) {
    description = relatedFile.summary;
  }
  
  return description;
}

// Add context references to file content
function addContextReferences(content, references, fileType) {
  if (references.length === 0) {
    return content;
  }
  
  let contextSection = '<!-- Context Connections -->\n';
  
  // Add each reference to context section
  for (const ref of references) {
    if (ref.type === 'header') {
      contextSection += `\n${ref.content}\n`;
    } else if (ref.type === 'reference') {
      contextSection += `@${ref.name}(${ref.context})\n`;
    }
  }
  
  // Determine where to insert context section
  let enhancedContent = content;
  
  if (fileType === 'rule' || fileType === 'documentation') {
    // For rules and docs, add after frontmatter or at the beginning
    if (enhancedContent.startsWith('---')) {
      const endOfFrontmatter = enhancedContent.indexOf('---', 3);
      if (endOfFrontmatter !== -1) {
        enhancedContent = 
          enhancedContent.substring(0, endOfFrontmatter + 3) + 
          '\n\n' + contextSection + '\n\n' + 
          enhancedContent.substring(endOfFrontmatter + 3).trimStart();
      } else {
        enhancedContent = enhancedContent + '\n\n' + contextSection + '\n';
      }
    } else {
      enhancedContent = contextSection + '\n\n' + enhancedContent;
    }
  } else if (fileType === 'source' || fileType === 'component') {
    // For source files, add after imports or at the beginning
    const lines = enhancedContent.split('\n');
    let lastImportLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^import\s+.*|^const\s+.*require|^from\s+/)) {
        lastImportLine = i;
      }
    }
    
    if (lastImportLine >= 0) {
      lines.splice(lastImportLine + 1, 0, '', '/**', ' * Context Connections', ' * ' + contextSection.replace(/\n/g, '\n * '), ' */');
      enhancedContent = lines.join('\n');
    } else {
      enhancedContent = '/**\n * Context Connections\n * ' + contextSection.replace(/\n/g, '\n * ') + '\n */\n\n' + enhancedContent;
    }
  } else {
    // For other file types, add at the beginning
    enhancedContent = contextSection + '\n\n' + enhancedContent;
  }
  
  return enhancedContent;
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
}); 