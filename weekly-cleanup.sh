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