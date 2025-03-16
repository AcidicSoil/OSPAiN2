/**
 * Unit tests for text-cleanup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const assert = require('assert');

// Path to the text-cleanup.js script
const scriptPath = path.join(__dirname, '..', 'text-cleanup.js');

// Test directory for temporary files
const testDir = path.join(__dirname, 'tmp');

// Setup function to create test directory
function setup() {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
}

// Cleanup function to remove test directory
function cleanup() {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// Function to create a test file with content
function createTestFile(filename, content) {
  const filePath = path.join(testDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// Function to run text-cleanup.js with options
function runTextCleanup(options) {
  const command = `node ${scriptPath} ${options}`;
  return execSync(command, { encoding: 'utf8' });
}

describe('text-cleanup.js', () => {
  before(setup);
  after(cleanup);
  
  describe('Context Analysis Tests', () => {
    it('should replace "ollama-tag-cli" with "t2p" in code context', () => {
      const testFile = createTestFile('code-context.js', `
        // Import the module
        const ollamaTagCli = require('ollama-tag-cli');
        
        // Use it in a function
        function processTag() {
          return ollamaTagCli.createTag('test');
        }
      `);
      
      runTextCleanup(`-p "ollama-tag-cli" -d "${testDir}" --smart`);
      
      const content = fs.readFileSync(testFile, 'utf8');
      assert(content.includes('const t2p = require(\'t2p\')'));
      assert(content.includes('return t2p.createTag(\'test\')'));
    });
    
    it('should replace "ollama-tag-cli" with "T2P" in documentation context', () => {
      const testFile = createTestFile('doc-context.md', `
        # Ollama Tag CLI Documentation
        
        This guide explains how to use ollama-tag-cli for tagging.
        
        ## Installation
        
        Install ollama-tag-cli using npm:
        
        \`\`\`bash
        npm install ollama-tag-cli
        \`\`\`
      `);
      
      runTextCleanup(`-p "ollama-tag-cli" -d "${testDir}" --smart`);
      
      const content = fs.readFileSync(testFile, 'utf8');
      assert(content.includes('# T2P Documentation'));
      assert(content.includes('This guide explains how to use T2P for tagging.'));
      // CLI commands should still use lowercase
      assert(content.includes('npm install t2p'));
    });
    
    it('should replace "ollama-tag-cli" with "t2p" in shell script context', () => {
      const testFile = createTestFile('script-context.sh', `
        #!/bin/bash
        
        # Run the ollama-tag-cli command
        npx ollama-tag-cli tag add --name "test" --value "example"
      `);
      
      runTextCleanup(`-p "ollama-tag-cli" -d "${testDir}" --smart`);
      
      const content = fs.readFileSync(testFile, 'utf8');
      assert(content.includes('npx t2p tag add --name "test" --value "example"'));
    });
    
    it('should handle package.json context appropriately', () => {
      const testFile = createTestFile('package.json', `
        {
          "name": "test-project",
          "dependencies": {
            "ollama-tag-cli": "^1.0.0"
          },
          "scripts": {
            "tag": "ollama-tag-cli tag list"
          }
        }
      `);
      
      runTextCleanup(`-p "ollama-tag-cli" -d "${testDir}" --smart`);
      
      const content = fs.readFileSync(testFile, 'utf8');
      assert(content.includes('"t2p": "^1.0.0"'));
      assert(content.includes('"tag": "t2p tag list"'));
    });
    
    it('should handle file path context appropriately', () => {
      const testFile = createTestFile('import-context.js', `
        import { TagManager } from 'ollama-tag-cli/dist/managers';
        import { createTag } from 'ollama-tag-cli/dist/utils';
      `);
      
      runTextCleanup(`-p "ollama-tag-cli" -d "${testDir}" --smart`);
      
      const content = fs.readFileSync(testFile, 'utf8');
      assert(content.includes('import { TagManager } from \'t2p/dist/managers\';'));
      assert(content.includes('import { createTag } from \'t2p/dist/utils\';'));
    });
    
    it('should handle capitalization based on context', () => {
      const testFile = createTestFile('capitalization.md', `
        Ollama-tag-cli is a great tool.
        
        At the beginning of a sentence, Ollama-tag-cli should be capitalized.
        
        In code blocks, ollama-tag-cli should be lowercase:
        \`\`\`js
        const cli = require('ollama-tag-cli');
        \`\`\`
        
        In headings, OLLAMA-TAG-CLI should match:
        
        ## OLLAMA-TAG-CLI DOCUMENTATION
      `);
      
      runTextCleanup(`-p "ollama-tag-cli" -r "t2p" -d "${testDir}" --smart`);
      
      const content = fs.readFileSync(testFile, 'utf8');
      assert(content.includes('T2p is a great tool.'));
      assert(content.includes('At the beginning of a sentence, T2p should be capitalized.'));
      assert(content.includes('const cli = require(\'t2p\');'));
      assert(content.includes('## T2P DOCUMENTATION'));
    });
  });
  
  describe('Basic Functionality Tests', () => {
    it('should handle dry run mode without making changes', () => {
      const testFile = createTestFile('dry-run.txt', 'Test ollama-tag-cli replacement');
      const originalContent = fs.readFileSync(testFile, 'utf8');
      
      runTextCleanup(`-p "ollama-tag-cli" -r "t2p" -d "${testDir}" --dry-run`);
      
      const newContent = fs.readFileSync(testFile, 'utf8');
      assert.strictEqual(newContent, originalContent, 'Content should not change in dry run mode');
    });
    
    it('should generate a report file', () => {
      createTestFile('report-test.txt', 'Test ollama-tag-cli replacement for report');
      
      const reportPath = path.join(testDir, 'test-report.md');
      runTextCleanup(`-p "ollama-tag-cli" -r "t2p" -d "${testDir}" --report "${reportPath}"`);
      
      assert(fs.existsSync(reportPath), 'Report file should be created');
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      assert(reportContent.includes('# Text Cleanup Report'));
      assert(reportContent.includes('- **Search Pattern:** `ollama-tag-cli`'));
    });
  });
}); 