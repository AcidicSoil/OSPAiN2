/**
 * Rule Tagger Utility
 * 
 * This script scans all rule files and adds '@' tags to reference related rules.
 * It creates connections between rules based on content similarity and relevance.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RULES_DIR = '.cursor/rules';
const OUTPUT_DIR = '.cursor/tagged-rules';
const EXAMPLE_DIR = '.cursor/examples';

// Main function
async function main() {
  console.log('Rule Tagger Utility');
  console.log('-------------------');

  // Create output directories if they don't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(EXAMPLE_DIR)) {
    fs.mkdirSync(EXAMPLE_DIR, { recursive: true });
  }

  // Get all rule files
  const ruleFiles = fs.readdirSync(RULES_DIR)
    .filter(file => file.endsWith('.mdc'))
    .map(file => ({
      name: file,
      path: path.join(RULES_DIR, file),
      content: fs.readFileSync(path.join(RULES_DIR, file), 'utf8')
    }));

  console.log(`Found ${ruleFiles.length} rule files`);

  // Extract rule descriptions for matching
  const ruleDescriptions = ruleFiles.map(rule => {
    const titleMatch = rule.content.match(/(?:^|\n)(?:# |## )(.*?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1] : rule.name.replace('.mdc', '');
    return {
      name: rule.name,
      title: title,
      keywords: extractKeywords(rule.content)
    };
  });

  // Tag rules with references to other rules
  const taggedRules = tagRules(ruleFiles, ruleDescriptions);

  // Write tagged rules to output directory
  for (const rule of taggedRules) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, rule.name),
      rule.taggedContent
    );
    console.log(`Tagged rule: ${rule.name}`);
  }

  // Create example files
  createExampleFiles(taggedRules);

  console.log('\nProcess completed successfully!');
  console.log(`Tagged rules are available in ${OUTPUT_DIR}`);
  console.log(`Example files are available in ${EXAMPLE_DIR}`);
}

// Extract keywords from rule content
function extractKeywords(content) {
  // Simple keyword extraction - in a real implementation, this would be more sophisticated
  const text = content.toLowerCase();
  const keywords = [];

  // Core concepts to track
  const concepts = [
    'governance', 'development', 'mode', 'tool', 'call', 'optimization',
    'context', 'knowledge', 'prompt', 'error', 'handler', 'sovereign',
    'search', 'cache', 'framework', 'workflow', 'horizon', 'documentation',
    'implementation', 'integration', 'ecosystem', 'distributed', 'computation'
  ];

  // Check for each concept
  concepts.forEach(concept => {
    if (text.includes(concept)) {
      keywords.push(concept);
    }
  });

  return keywords;
}

// Tag rules with references to other relevant rules
function tagRules(ruleFiles, ruleDescriptions) {
  const taggedRules = [];

  for (const rule of ruleFiles) {
    const relatedRules = findRelatedRules(rule, ruleFiles, ruleDescriptions);
    const tagSection = createTagSection(relatedRules);
    
    // Add tag section to the beginning of the file, after any YAML frontmatter
    let taggedContent = rule.content;
    
    // Handle files with or without frontmatter
    if (taggedContent.startsWith('---')) {
      const endOfFrontmatter = taggedContent.indexOf('---', 3);
      if (endOfFrontmatter !== -1) {
        taggedContent = 
          taggedContent.substring(0, endOfFrontmatter + 3) + 
          '\n\n' + tagSection + '\n\n' + 
          taggedContent.substring(endOfFrontmatter + 3).trimStart();
      } else {
        taggedContent = taggedContent + '\n\n' + tagSection + '\n';
      }
    } else {
      taggedContent = tagSection + '\n\n' + taggedContent;
    }

    taggedRules.push({
      name: rule.name,
      originalContent: rule.content,
      taggedContent: taggedContent,
      relatedRules: relatedRules
    });
  }

  return taggedRules;
}

// Find rules related to the current rule
function findRelatedRules(currentRule, allRules, ruleDescriptions) {
  const currentRuleKeywords = extractKeywords(currentRule.content);
  const currentRuleDesc = ruleDescriptions.find(r => r.name === currentRule.name);
  
  // Don't include the current rule in related rules
  const otherRules = allRules.filter(r => r.name !== currentRule.name);
  
  // Calculate relevance scores
  const relatedRules = otherRules.map(rule => {
    const ruleDesc = ruleDescriptions.find(r => r.name === rule.name);
    const keywords = ruleDesc ? ruleDesc.keywords : extractKeywords(rule.content);
    
    // Calculate keyword overlap
    const overlap = keywords.filter(k => currentRuleKeywords.includes(k));
    const relevanceScore = overlap.length / Math.max(1, (currentRuleKeywords.length + keywords.length) / 2);
    
    return {
      name: rule.name,
      title: ruleDesc ? ruleDesc.title : rule.name.replace('.mdc', ''),
      relevanceScore: relevanceScore,
      sharedKeywords: overlap
    };
  });
  
  // Sort by relevance and take top 5
  const topRelated = relatedRules
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
    .filter(rule => rule.relevanceScore > 0.1); // Only include somewhat relevant rules
  
  return topRelated;
}

// Create tag section with references to related rules
function createTagSection(relatedRules) {
  if (relatedRules.length === 0) {
    return '<!-- No related rules found -->';
  }
  
  let tagSection = '<!-- Related rules -->\n';
  
  relatedRules.forEach(rule => {
    const ruleName = rule.name.replace('.mdc', '');
    // Format: @ruleName(brief description why it's related)
    tagSection += `@${ruleName}(Related based on ${rule.sharedKeywords.join(', ')})\n`;
  });
  
  return tagSection;
}

// Create example files showing rule usage
function createExampleFiles(taggedRules) {
  // Create a basic example file
  const basicExample = `# Example Rule Usage
  
This file demonstrates how to reference rules using '@' tags.

## Basic References

@tool-call-optimization(Optimizes tool calls to maximize value within limits)
@tool-call-error-handler(Handles errors when approaching the tool call limit)

## Usage in Context

When implementing new features, consider the following rules:

@sovereign-ai-ecosystem-prd(Provides comprehensive framework for development)
@master-todo(Contains current task list and priorities)

## Combined Usage

@knowledge-graph-search-cache(Caches web search results) and @web-search-optimization(Optimizes web search queries) work together to efficiently manage external data.
`;

  fs.writeFileSync(path.join(EXAMPLE_DIR, 'basic-example.md'), basicExample);
  
  // Create an advanced example showing how rules connect
  const advancedExample = `# Advanced Rule Integration Example

This example shows how multiple rules work together in a development workflow.

## Development Mode Workflow

Start by understanding the development modes:
@master-prd(Defines the development mode framework)

Then, for each mode:

### Design Mode
@context-aware-prompt-engine(Enhances prompts with design context)
@tool-call-optimization(Manages tool calls during design phase)

### Engineering Mode
@sovereign_ai_implementation(Provides implementation guidelines)
@tool-call-error-handler(Handles errors during development)

### Testing Mode
@distributed-computation(Optimizes test execution across resources)

### Deployment Mode
@integrated-governance-framework(Ensures proper governance during deployment)

## Knowledge Management
@knowledge-graph-search-cache(Improves knowledge retrieval efficiency)
@devdocs-source(Provides documentation source guidelines)

## Task Management
@master-todo(Tracks all current tasks and priorities)
@laser-focus(Ensures focused implementation of high-priority items)
`;

  fs.writeFileSync(path.join(EXAMPLE_DIR, 'advanced-example.md'), advancedExample);
  
  // Create a template example for users to customize
  const templateExample = `# Rule Reference Template

<!-- Replace with your context description -->

## Core Rules
@master-prd(Core development framework)
@sovereign-ai-ecosystem-prd(Ecosystem architecture)
@master-todo(Task tracking and priorities)

## Current Focus Rules
<!-- Add rules relevant to your current task -->
@________(Description of relevance)
@________(Description of relevance)

## Implementation Rules
<!-- Add rules relevant to implementation concerns -->
@________(Description of relevance)
@________(Description of relevance)
`;

  fs.writeFileSync(path.join(EXAMPLE_DIR, 'template-example.md'), templateExample);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
}); 