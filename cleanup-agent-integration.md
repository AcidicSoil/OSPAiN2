# CleanupAgent Integration with Master Player

This guide explains how to effectively integrate the CleanupAgent with the Master Player command system for optimal codebase management.

## Quick Reference Commands

| Task | Command |
|------|---------|
| Run cleanup agent (dry run) | `node cleanup-agent.js` |
| Run cleanup agent (delete files) | `node cleanup-agent.js --dry-run=false` |
| Run with age threshold | `node cleanup-agent.js --age-threshold=60` |
| Run with custom output | `node cleanup-agent.js --output=specific-report.md` |
| Add findings to todo list | `t2p todo add --priority 3 --horizon H1 --category "Maintenance" --tags "cleanup" --title "Review cleanup candidates" --description "$(cat cleanup-report.md | grep -A 5 '## Cleanup Candidates')"` |

## Integration Workflow

The following workflow demonstrates how to integrate the CleanupAgent with the Master Player system:

### 1. Schedule Regular Cleanup Analysis

Add a recurring cleanup task to your todo list:

```bash
t2p todo add --priority 3 --horizon H1 --category "Maintenance" --tags "cleanup,recurring" --title "Run CleanupAgent analysis" --description "Run the CleanupAgent to identify potential cleanup candidates"
```

### 2. Switch to Maintenance Mode

Before running cleanup operations, switch to maintenance mode:

```bash
m switch maint "Running CleanupAgent for codebase maintenance"
```

### 3. Run Cleanup Analysis

Execute the CleanupAgent:

```bash
node cleanup-agent.js
```

### 4. Process Results

Add cleanup candidates to your todo system:

```bash
# Extract top candidates and add as a todo item
top_candidates=$(cat cleanup-report.md | grep -A 20 '## Cleanup Candidates' | head -10)
t2p todo add --priority 3 --horizon H1 --category "Maintenance" --tags "cleanup" --title "Review cleanup candidates" --description "$top_candidates"
```

### 5. Review and Update Horizon Map

If files are incorrectly categorized, update the horizon map:

```bash
# Open horizon map for editing
edit_file @horizon-map.mdc

# After updating, regenerate the cleanup report
node cleanup-agent.js
```

### 6. Execute Approved Deletions

Once reviewed, run cleanup with deletions enabled:

```bash
# Only do this after careful review
node cleanup-agent.js --dry-run=false
```

### 7. Document Changes

Record the cleanup actions:

```bash
t2p note new "Cleanup Session $(date +%Y-%m-%d)" --category "Maintenance" --tags "cleanup,report" --ai "Summarize the following cleanup report and list actions taken: $(cat cleanup-report.md)"
```

## Integration with Horizon Framework

The CleanupAgent respects the Horizon Framework by:

1. **Preserving H1 Files**: Files classified as Horizon 1 are protected from cleanup recommendations
2. **Tracking H2/H3 Transitions**: Helps identify when files move between horizons
3. **Documenting Technical Debt**: Surfaces potentially obsolete code for review

## Custom Cleanup Commands

### Find Imported But Unused Files

```bash
node -e "
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files
const tsFiles = execSync('find . -name \"*.ts\" -not -path \"*/node_modules/*\"').toString().split('\n').filter(Boolean);

// Track imports and exports
const imports = new Map();
const exports = new Map();

tsFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Find all imports
    const importMatches = content.matchAll(/import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['\"](\.\/[^'\"]+|\.\.\/[^'\"]+)['\"];?/g);
    for (const match of importMatches) {
      const importPath = match[1];
      const resolved = path.resolve(path.dirname(file), importPath);
      if (!imports.has(resolved)) {
        imports.set(resolved, new Set());
      }
      imports.get(resolved).add(file);
    }
    
    // Track if file has exports
    if (/export\s+(default\s+|{|\*|class|function|const|let|var)/g.test(content)) {
      exports.set(file, true);
    }
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
});

// Find files with exports but not imported
console.log('Files with exports but not imported:');
let count = 0;
for (const file of exports.keys()) {
  const normalized = file.replace(/\\/g, '/');
  let isImported = false;
  
  for (const [importPath, importedBy] of imports.entries()) {
    if (importPath === normalized || 
        importPath === normalized.replace(/\.ts$/, '') ||
        importPath === normalized.replace(/\.d\.ts$/, '')) {
      isImported = true;
      break;
    }
  }
  
  if (!isImported) {
    console.log(`- ${file}`);
    count++;
  }
}
console.log(`\\nTotal: ${count} files with exports but not imported`);
"
```

### Update Horizon Classifications

```bash
node -e "
const fs = require('fs');

// Read horizon map
const horizonMap = fs.readFileSync('@horizon-map.mdc', 'utf8');

// Read cleanup report
const cleanupReport = fs.readFileSync('cleanup-report.md', 'utf8');

// Extract candidates
const candidateSection = cleanupReport.match(/## Cleanup Candidates\\n\\n([\\s\\S]*?)(?=\\n## Next Steps|$)/);
if (!candidateSection) {
  console.log('No candidates found in report');
  process.exit(0);
}

// Parse candidates
const candidates = candidateSection[1].split('###').slice(1);
const h1Candidates = [];

candidates.forEach(candidate => {
  const match = candidate.match(/([^\\n]+)/);
  if (match && match[1].trim()) {
    const filePath = match[1].trim();
    
    // If this is a valid file that should be H1, add to list
    if (fs.existsSync(filePath)) {
      h1Candidates.push(filePath);
    }
  }
});

// Create the horizon update
if (h1Candidates.length > 0) {
  console.log('# Horizon update for review');
  console.log('\\nThe following files should be added to Horizon 1 if they are still needed:\\n');
  
  h1Candidates.forEach(file => {
    console.log(`- ${file}`);
  });
  
  console.log('\\nRun the following command after manually reviewing:\\n');
  console.log('node -e \"');
  console.log('const fs = require(\\'fs\\');');
  console.log('const horizonMap = fs.readFileSync(\\'@horizon-map.mdc\\', \\'utf8\\');');
  console.log('const h1Section = horizonMap.match(/### Horizon 1 \\\\(Now\\\\)([\\\\s\\\\S]*?)(?=### Horizon 2|$)/);');
  console.log('if (h1Section) {');
  console.log('  let newHorizonMap = horizonMap;');
  console.log('  const filesToAdd = [');
  h1Candidates.forEach(file => {
    console.log(`    '${file}',`);
  });
  console.log('  ];');
  console.log('  const updatedH1Section = h1Section[1] + filesToAdd.map(f => `- ${f}\\\\n`).join(\\'\\');');
  console.log('  newHorizonMap = newHorizonMap.replace(h1Section[0], `### Horizon 1 (Now)${updatedH1Section}`);');
  console.log('  fs.writeFileSync(\\'@horizon-map.mdc\\', newHorizonMap);');
  console.log('  console.log(\\'Horizon map updated!\\');');
  console.log('}');
  console.log('\"');
}
"
```

## Emergency Recovery

If cleanup accidentally removes important files:

```bash
# Check for recent deletions in git
git log --diff-filter=D --summary | grep delete | head -20

# Restore a specific file
git checkout HEAD~1 -- path/to/deleted/file.ts

# Restore all recently deleted files
git log --diff-filter=D --summary | grep delete | awk '{print $4}' | xargs -I{} git checkout HEAD~1 -- {}
```

## Automation Scripts

### Weekly Cleanup Check

Create a script for weekly cleanup analysis:

```bash
cat > weekly-cleanup.sh << 'EOF'
#!/bin/bash

# Record current date
date=$(date +%Y-%m-%d)
echo "🧹 Running weekly cleanup check on $date"

# Switch to maintenance mode
echo "Switching to maintenance mode..."
./development-modes/m switch maint "Weekly cleanup analysis"

# Run cleanup agent
echo "Running CleanupAgent..."
node cleanup-agent.js --output="cleanup-report-$date.md"

# Extract key stats
total_files=$(grep "Total files scanned:" "cleanup-report-$date.md" | cut -d':' -f2 | tr -d ' ')
analyzed=$(grep "Files analyzed:" "cleanup-report-$date.md" | cut -d':' -f2 | tr -d ' ')
candidates=$(grep "Potential cleanup candidates:" "cleanup-report-$date.md" | cut -d':' -f2 | tr -d ' ')

# Add to todo list if there are candidates
if [ "$candidates" -gt 0 ]; then
  description="Weekly cleanup check found $candidates potential files for cleanup. See cleanup-report-$date.md for details."
  t2p todo add --priority 3 --horizon H1 --category "Maintenance" --tags "cleanup,weekly" --title "Review cleanup candidates ($date)" --description "$description"
  echo "✅ Added cleanup task to todo list"
fi

echo "📊 Stats: $total_files total files, $analyzed analyzed, $candidates cleanup candidates"
echo "📝 Report available at: cleanup-report-$date.md"
EOF

chmod +x weekly-cleanup.sh
```

## Conclusion

By integrating the CleanupAgent with the Master Player command system, you maintain a clean, well-organized codebase while respecting the project's horizon classifications. This integration ensures that maintenance tasks are properly tracked, prioritized, and executed as part of your regular workflow. 